"""Swipe rules: only products the user can see and doesn't own; the latest swipe wins."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import AuthUser
from app.data import swipes as swipe_repo
from app.data.models import Swipe
from app.services import products as product_service
from app.services import users as user_service


async def swipe(session: AsyncSession, user: AuthUser, product_id: uuid.UUID, direction: str) -> Swipe:
    """Right = added to Interested Products. Swiping again replaces the earlier swipe; feedback
    already given stays."""
    await user_service.get_me(session, user)
    product = await product_service.get_visible(session, user, product_id)
    if product.owner_id == user.id:
        raise ApiError("FORBIDDEN", "You can't swipe on your own product")
    return await swipe_repo.upsert(session, user.id, product_id, direction)
