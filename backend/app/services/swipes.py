"""Swipe rules: only products the user can see; the latest swipe wins."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import AuthUser
from app.data import swipes as swipe_repo
from app.data.models import Swipe
from app.services import products as product_service
from app.services import users as user_service


async def swipe(session: AsyncSession, user: AuthUser, product_id: uuid.UUID, direction: str) -> Swipe:
    """Right = added to Interested Products. Swiping again replaces the earlier swipe; feedback
    already given stays."""
    await user_service.get_me(session, user)
    await product_service.get_visible(session, user, product_id)
    return await swipe_repo.upsert(session, user.id, product_id, direction)
