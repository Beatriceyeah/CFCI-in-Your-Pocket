"""Feedback repository: the only place that queries the feedback table."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import Feedback


async def get(session: AsyncSession, user_id: uuid.UUID, product_id: uuid.UUID) -> Feedback | None:
    return await session.scalar(
        select(Feedback).where(Feedback.user_id == user_id, Feedback.product_id == product_id)
    )


async def add(session: AsyncSession, feedback: Feedback) -> Feedback:
    session.add(feedback)
    await session.commit()
    return feedback


async def reaction_counts(session: AsyncSession, product_id: uuid.UUID) -> dict[str, int]:
    """How many people ticked each reaction on a product."""
    row = (
        await session.execute(
            select(
                func.count().filter(Feedback.would_use),
                func.count().filter(Feedback.would_invest),
                func.count().filter(Feedback.would_intro),
            ).where(Feedback.product_id == product_id)
        )
    ).one()
    return {"would_use": row[0], "would_invest": row[1], "would_intro": row[2]}


async def list_comments(session: AsyncSession, product_id: uuid.UUID) -> list[Feedback]:
    """Feedback with a comment, newest first."""
    result = await session.scalars(
        select(Feedback)
        .where(Feedback.product_id == product_id, Feedback.comment.is_not(None))
        .order_by(Feedback.created_at.desc(), Feedback.id)
    )
    return list(result)
