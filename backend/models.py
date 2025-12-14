from __future__ import annotations

import hashlib
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    create_engine,
    String,
    DateTime,
    func,
    Text,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.mysql import INTEGER, BIGINT, SMALLINT 
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, relationship


DATABASE_URL = "mysql+mysqldb://Usersadmin:sKLJyDab7Kd46wzF@127.0.0.1:3306/Users?charset=utf8mb4"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- 用户与任务 ----------

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[int] = mapped_column(SMALLINT, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    tasks: Mapped[List["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    user_licenses: Mapped[List["UserLicense"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, default="To Do", index=True)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    user: Mapped["User"] = relationship(back_populates="tasks")

# ---------- 许可（License） ----------

def hash_license_key(raw_key: str) -> str:
    normalized = raw_key.strip().upper()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

class LicenseKey(Base):
    __tablename__ = "license_keys"
    id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    is_multi_use: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feature: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp())

    activations: Mapped[List["UserLicense"]] = relationship(back_populates="license_key", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("key_hash", name="uq_license_keys_key_hash"),
        Index("ix_license_validity", "is_used", "expires_at"),
    )

class UserLicense(Base):
    __tablename__ = "user_licenses"
    id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    license_key_id: Mapped[int] = mapped_column(
        BIGINT,
        ForeignKey("license_keys.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    activated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    feature: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    user: Mapped["User"] = relationship(back_populates="user_licenses")
    license_key: Mapped["LicenseKey"] = relationship(back_populates="activations")

    __table_args__ = (
        UniqueConstraint("user_id", "license_key_id", name="uq_user_license_unique"),
    )

# 建表
def init_db():
    Base.metadata.create_all(bind=engine)