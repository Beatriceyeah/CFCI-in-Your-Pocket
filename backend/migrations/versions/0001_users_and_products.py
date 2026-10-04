"""Users and products tables (Module 1: Products)

Revision ID: 0001
Revises:
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("auth_provider", sa.String(20), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column(
            "interested_directions", postgresql.ARRAY(sa.String(20)), nullable=False, server_default="{}"
        ),
        sa.Column("onboarded", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "auth_provider IN ('duke_netid', 'linkedin', 'google')", name="ck_users_auth_provider"
        ),
        sa.CheckConstraint("role IN ('student', 'external')", name="ck_users_role"),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "owner_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("one_liner", sa.String(160), nullable=False),
        sa.Column("cover_image_url", sa.Text(), nullable=False),
        sa.Column("demo_video_url", sa.Text(), nullable=False),
        sa.Column("brief", sa.Text(), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending_review"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "category IN ('research', 'health', 'software', 'hardware')", name="ck_products_category"
        ),
        sa.CheckConstraint("status IN ('pending_review', 'live', 'archived')", name="ck_products_status"),
    )
    op.create_index("ix_products_created_at", "products", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_products_created_at", table_name="products")
    op.drop_table("products")
    op.drop_table("users")
