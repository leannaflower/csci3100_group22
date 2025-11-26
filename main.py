# main.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Union

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import User, get_db

# 基础配置（可改为环境变量）
JWT_SECRET_KEY = "change-this-secret-in-prod"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

app = FastAPI(title="Simple Login API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    #p_truncated = p[:72]  # 截断到72字节
    #return pwd_context.hash(p_truncated)
    return pwd_context.hash(p)

def verify_password(p: str, h: str) -> bool:
    #p_truncated = p[:72]  # 与加密逻辑保持一致
    #return pwd_context.verify(p_truncated, h)
    return pwd_context.verify(p, h)

# JWT
def create_access_token(subject: Union[str, int], expires_minutes: Optional[int] = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Pydantic 模型
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=128)

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    status: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 依赖：当前用户
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = int(payload["sub"])
    user = db.get(User, user_id)
    if not user or user.status != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User disabled or not found")
    return user

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/register", response_model=Token, summary="注册")
def register(data: UserCreate, db: Session = Depends(get_db)):
    existed = db.execute(select(User).where(User.username == data.username)).scalar_one_or_none()
    if existed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    user = User(username=data.username, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return Token(access_token=token)

@app.post("/auth/login", response_model=Token, summary="登录")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == data.username)).scalar_one_or_none()
    if not user or user.status != 1 or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.id)
    return Token(access_token=token)

@app.get("/users/me", response_model=UserOut, summary="当前用户")
def me(current_user: User = Depends(get_current_user)):
    return current_user