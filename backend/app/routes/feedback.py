import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import CurrentUser
from app.data.db import get_session
from app.schemas.envelope import Envelope, ok
from app.schemas.feedback import FeedbackIn, FeedbackOut
from app.services import feedback as feedback_service

router = APIRouter(tags=["browse"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/products/{product_id}/feedback", response_model=Envelope[FeedbackOut], status_code=201)
async def give_feedback(
    product_id: uuid.UUID, payload: FeedbackIn, user: CurrentUser, session: Session
) -> Envelope[FeedbackOut]:
    feedback = await feedback_service.give(session, user, product_id, payload)
    return ok(FeedbackOut.from_model(feedback))
