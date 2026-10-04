"""Feedback repository: the only place that queries the feedback table."""

import uuid

from sqlalchemy import select
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
