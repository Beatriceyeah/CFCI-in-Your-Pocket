"""User repository: the only place that queries the users table."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import User


async def get(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await session.get(User, user_id)
