from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from models import User, get_db

JWT_SECRET_KEY = "change-this-secret-in-prod"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 14

router = APIRouter(tags=["auth"])

# ===== OAuth2（在 routers 层导出，供其他路由复用） =====
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ===== 密码哈希 =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd_context.hash(p)

def verify_password(p: str, h: str) -> bool:
    return pwd_context.verify(p, h)

# ===== JWT =====
def create_token(subject: Union[str, int], expires_delta: timedelta, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    payload = {
        "sub": str(subject),
        "type": token_type,  # access / refresh
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_access_token(subject: Union[str, int]) -> str:
    return create_token(subject, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES), "access")

def create_refresh_token(subject: Union[str, int]) -> str:
    return create_token(subject, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS), "refresh")

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None

# ===== Pydantic 模型 =====
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class UserLogin(BaseModel):
    # 支持用户名或邮箱任意一个字段输入到 username 字段
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    status: int

    class Config:
        from_attributes = True

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60

class RefreshRequest(BaseModel):
    refresh_token: str

# ===== 依赖：当前用户（校验 access token） =====
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")
    user_id = int(payload["sub"])
    user = db.get(User, user_id)
    if not user or user.status != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User disabled or not found")
    return user

# ===== 路由 =====
@router.post("/auth/register", response_model=TokenPair, summary="注册")
def register(data: UserCreate, db: Session = Depends(get_db)):
    existed = db.execute(
        select(User).where(or_(User.username == data.username, User.email == data.email))
    ).scalar_one_or_none()
    if existed:
        if existed.username == data.username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        if existed.email == data.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)

@router.post("/auth/login", response_model=TokenPair, summary="登录（用户名或邮箱）")
def login(data: UserLogin, db: Session = Depends(get_db)):
    q = select(User).where(or_(User.username == data.username, User.email == data.username))
    user = db.execute(q).scalar_one_or_none()
    if not user or user.status != 1 or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)

@router.post("/auth/refresh", response_model=TokenPair, summary="刷新令牌")
def refresh_tokens(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or "sub" not in payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = int(payload["sub"])
    user = db.get(User, user_id)
    if not user or user.status != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User disabled or not found")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)

@router.get("/users/me", response_model=UserOut, summary="当前用户")
def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user