"""User repository: the only place that queries the users table."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import User


async def get(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await session.get(User, user_id)


async def get_by_email(session: AsyncSession, email: str) -> User | None:
    return await session.scalar(select(User).where(User.email == email))


async def add(session: AsyncSession, user: User) -> User:
    session.add(user)
    await session.commit()
    return user


async def save(session: AsyncSession, user: User) -> User:
    await session.commit()
    await session.refresh(user)
    return user
