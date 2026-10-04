"""Swipe repository: the only place that queries the swipes table."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import Product, Swipe


async def get(session: AsyncSession, user_id: uuid.UUID, product_id: uuid.UUID) -> Swipe | None:
    return await session.scalar(select(Swipe).where(Swipe.user_id == user_id, Swipe.product_id == product_id))


async def upsert(session: AsyncSession, user_id: uuid.UUID, product_id: uuid.UUID, direction: str) -> Swipe:
    """Insert or replace the user's swipe on a product; created_at becomes the time of this swipe."""
    statement = (
        insert(Swipe)
        .values(id=uuid.uuid4(), user_id=user_id, product_id=product_id, direction=direction)
        .on_conflict_do_update(
            constraint="uq_swipes_user_product",
            set_={"direction": direction, "created_at": func.now()},
        )
        .returning(Swipe)
        .execution_options(populate_existing=True)
    )
    swipe = await session.scalar(statement)
    await session.commit()
    assert swipe is not None, "upsert returned no row"
    return swipe


async def list_interested(
    session: AsyncSession, user_id: uuid.UUID, offset: int, limit: int
) -> tuple[list[Product], int]:
    """Live products the user swiped right on, most recent right swipe first. Returns (page, total)."""
    where = [Swipe.user_id == user_id, Swipe.direction == "right", Product.status == "live"]
    joined = select(Product).join(Swipe, Swipe.product_id == Product.id).where(*where)

    total = await session.scalar(select(func.count()).select_from(joined.subquery()))
    page = await session.scalars(
        joined.order_by(Swipe.created_at.desc(), Product.id).offset(offset).limit(limit)
    )
    return list(page), total or 0


async def count_right(session: AsyncSession, product_id: uuid.UUID) -> int:
    total = await session.scalar(
        select(func.count()).where(Swipe.product_id == product_id, Swipe.direction == "right")
    )
    return total or 0
