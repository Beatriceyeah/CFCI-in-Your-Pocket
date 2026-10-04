"""Feedback rules: not on your own product, only after a right swipe, once per user and product."""

import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import AuthUser
from app.data import feedback as feedback_repo
from app.data import swipes as swipe_repo
from app.data.models import Feedback
from app.schemas.feedback import FeedbackComment, FeedbackCounts, FeedbackIn, FeedbackSummaryOut
from app.services import products as product_service
from app.services import users as user_service

ALREADY_GIVEN = "You already left feedback on this product"


async def give(session: AsyncSession, user: AuthUser, product_id: uuid.UUID, payload: FeedbackIn) -> Feedback:
    await user_service.get_me(session, user)
    product = await product_service.get_visible(session, user, product_id)
    if product.owner_id == user.id:
        raise ApiError("FORBIDDEN", "You can't leave feedback on your own product")

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


async def summary(session: AsyncSession, user: AuthUser, product_id: uuid.UUID) -> FeedbackSummaryOut:
    """Feedback received. Anyone signed in can see it on a live product; the owner also sees it
    while the product is pending or archived."""
    await product_service.get_visible(session, user, product_id)

    counts = await feedback_repo.reaction_counts(session, product_id)
    comments = await feedback_repo.list_comments(session, product_id)
    return FeedbackSummaryOut(
        counts=FeedbackCounts(right_swipes=await swipe_repo.count_right(session, product_id), **counts),
        comments=[FeedbackComment(comment=f.comment or "", created_at=f.created_at) for f in comments],
    )
