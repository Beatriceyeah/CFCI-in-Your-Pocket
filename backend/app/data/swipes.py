"""Swipe repository: the only place that queries the swipes table."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import Swipe


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
