"""SQLAlchemy models. Import every model here so Alembic autogenerate sees it.

Models are added module by module (see AGENTS.md, "Data models").
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    ARRAY,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.data.db import Base

DIRECTIONS = ("research", "health", "software", "hardware")
AUTH_PROVIDERS = ("duke_netid", "linkedin", "google")
ROLES = ("student", "external")
PRODUCT_STATUSES = ("pending_review", "live", "archived")
SWIPE_DIRECTIONS = ("left", "right")


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


class Swipe(Base):
    """A user's latest swipe on a product; a new swipe replaces the old one. Right = interested."""

    __tablename__ = "swipes"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_swipes_user_product"),
        CheckConstraint(_in("direction", SWIPE_DIRECTIONS), name="ck_swipes_direction"),
    )
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    direction: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Feedback(Base):
    """Quick reactions after a right swipe. One per (user, product)."""

    __tablename__ = "feedback"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_feedback_user_product"),)
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    would_use: Mapped[bool]
    would_invest: Mapped[bool]
    would_intro: Mapped[bool]
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


__all__ = ["Base", "Feedback", "Product", "Swipe", "User"]
