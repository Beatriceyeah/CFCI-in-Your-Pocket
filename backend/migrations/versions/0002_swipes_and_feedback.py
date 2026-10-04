"""Swipes and feedback tables (Module 3: Browse)

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "swipes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Uuid(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "product_id", name="uq_swipes_user_product"),
        sa.CheckConstraint("direction IN ('left', 'right')", name="ck_swipes_direction"),
    )
    op.create_index("ix_swipes_product_id", "swipes", ["product_id"])
    op.create_table(
        "feedback",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Uuid(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("would_use", sa.Boolean(), nullable=False),
        sa.Column("would_invest", sa.Boolean(), nullable=False),
        sa.Column("would_intro", sa.Boolean(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "product_id", name="uq_feedback_user_product"),
    )
    op.create_index("ix_feedback_product_id", "feedback", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_feedback_product_id", table_name="feedback")
    op.drop_table("feedback")
    op.drop_index("ix_swipes_product_id", table_name="swipes")
    op.drop_table("swipes")
