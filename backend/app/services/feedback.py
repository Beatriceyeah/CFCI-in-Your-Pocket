"""Feedback rules: only after a right swipe, once per user and product."""

import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import AuthUser
from app.data import feedback as feedback_repo
from app.data import swipes as swipe_repo
from app.data.models import Feedback
from app.schemas.feedback import FeedbackIn
from app.services import products as product_service
from app.services import users as user_service

ALREADY_GIVEN = "You already left feedback on this product"


async def give(session: AsyncSession, user: AuthUser, product_id: uuid.UUID, payload: FeedbackIn) -> Feedback:
    await user_service.get_me(session, user)
    await product_service.get_visible(session, user, product_id)

    swipe = await swipe_repo.get(session, user.id, product_id)
    if swipe is None or swipe.direction != "right":
        raise ApiError("CONFLICT", "Swipe right on this product before leaving feedback")
    if await feedback_repo.get(session, user.id, product_id) is not None:
        raise ApiError("CONFLICT", ALREADY_GIVEN)

    feedback = Feedback(user_id=user.id, product_id=product_id, **payload.model_dump())
    try:
        return await feedback_repo.add(session, feedback)
    except IntegrityError as exc:
        # Lost a race with a second submit from the same user.
        await session.rollback()
        raise ApiError("CONFLICT", ALREADY_GIVEN) from exc
