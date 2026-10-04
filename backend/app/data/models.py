"""SQLAlchemy models. Import every model here so Alembic autogenerate sees it.

Models are added module by module (see AGENTS.md, "Data models").
"""

import uuid
from datetime import datetime

from sqlalchemy import ARRAY, CheckConstraint, DateTime, ForeignKey, String, Text, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.data.db import Base

DIRECTIONS = ("research", "health", "software", "hardware")
AUTH_PROVIDERS = ("duke_netid", "linkedin", "google")
ROLES = ("student", "external")
PRODUCT_STATUSES = ("pending_review", "live", "archived")


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


class User(Base):
    """Created by sign-in (Module 2). Products reference their owner."""

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(_in("auth_provider", AUTH_PROVIDERS), name="ck_users_auth_provider"),
        CheckConstraint(_in("role", ROLES), name="ck_users_role"),
    )
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(320), unique=True)
    auth_provider: Mapped[str] = mapped_column(String(20))
    role: Mapped[str] = mapped_column(String(20))
    interested_directions: Mapped[list[str]] = mapped_column(
        ARRAY(String(20)), default=list, server_default="{}"
    )
    onboarded: Mapped[bool] = mapped_column(default=False, server_default=false())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    """One product per student owner. Only `live` products appear in Browse."""

    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(_in("category", DIRECTIONS), name="ck_products_category"),
        CheckConstraint(_in("status", PRODUCT_STATUSES), name="ck_products_status"),
    )
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    one_liner: Mapped[str] = mapped_column(String(160))
    cover_image_url: Mapped[str] = mapped_column(Text)
    demo_video_url: Mapped[str] = mapped_column(Text)
    brief: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="pending_review", server_default="pending_review")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped[User] = relationship(lazy="raise")


__all__ = ["Base", "Product", "User"]
