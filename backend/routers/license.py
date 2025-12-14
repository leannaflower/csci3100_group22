from datetime import datetime, timezone
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import get_db, User, LicenseKey, UserLicense, hash_license_key
from routers.auth import get_current_user  

router = APIRouter(prefix="/license", tags=["license"])

LICENSE_KEY_REGEX = re.compile(r"^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$")

class LicenseStatus(BaseModel):
    licensed: bool
    expires_at: Optional[datetime] = None
    feature: Optional[str] = None

class ActivateByKey(BaseModel):
    key: str

def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _find_license_by_raw_key(db: Session, raw_key: str) -> Optional[LicenseKey]:
    key_norm = raw_key.strip().upper()
    if not LICENSE_KEY_REGEX.match(key_norm):
        return None
    kh = hash_license_key(key_norm)
    stmt = select(LicenseKey).where(LicenseKey.key_hash == kh)
    return db.execute(stmt).scalar_one_or_none()

def _user_already_licensed(db: Session, user_id: int) -> Optional[UserLicense]:
    stmt = (
        select(UserLicense)
        .join(LicenseKey, LicenseKey.id == UserLicense.license_key_id)
        .where(UserLicense.user_id == user_id)
        .order_by(UserLicense.activated_at.desc())
    )
    return db.execute(stmt).scalars().first()

@router.get("/status", response_model=LicenseStatus, summary="查询当前用户许可状态")
def license_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ul = _user_already_licensed(db, current_user.id)
    if not ul:
        return LicenseStatus(licensed=False)

    lk = ul.license_key
    if lk.expires_at and lk.expires_at.replace(tzinfo=timezone.utc) < _now_utc():
        return LicenseStatus(licensed=False)

    return LicenseStatus(
        licensed=True,
        expires_at=lk.expires_at,
        feature=lk.feature,
    )

@router.post("/activate", response_model=LicenseStatus, summary="使用密钥激活")
def activate_license(
    payload: ActivateByKey,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key_input = payload.key.strip().upper()
    if not LICENSE_KEY_REGEX.match(key_input):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid key format")

    ul = _user_already_licensed(db, current_user.id)
    if ul:
        lk = ul.license_key
        if not lk.expires_at or lk.expires_at.replace(tzinfo=timezone.utc) >= _now_utc():
            return LicenseStatus(licensed=True, expires_at=lk.expires_at, feature=lk.feature)

    lk = _find_license_by_raw_key(db, key_input)
    if not lk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License key not found")

    if lk.expires_at and lk.expires_at.replace(tzinfo=timezone.utc) < _now_utc():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License key expired")

    if not lk.is_multi_use and lk.is_used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License key already used")

    # 单次密钥：标记已使用
    if not lk.is_multi_use and not lk.is_used:
        lk.is_used = True

    ul_new = UserLicense(user_id=current_user.id, license_key_id=lk.id, feature=lk.feature)
    db.add(ul_new)
    db.commit()
    db.refresh(ul_new)
    db.refresh(lk)

    return LicenseStatus(licensed=True, expires_at=lk.expires_at, feature=lk.feature)

@router.post("/activate-file", response_model=LicenseStatus, summary="通过文件激活")
async def activate_license_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_bytes = await file.read()
    text = content_bytes.decode("utf-8", errors="ignore").strip().upper()
    # 正则表达式从文件内容中提取密钥
    match = re.search(LICENSE_KEY_REGEX, text)
    if not match:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License file invalid")
    key_input = match.group(0)
    payload = ActivateByKey(key=key_input)
    return activate_license(payload, current_user=current_user, db=db)