import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import CurrentUser
from app.data.db import get_session
from app.schemas.envelope import Envelope, ok
from app.schemas.swipes import SwipeIn, SwipeOut
from app.services import swipes as swipe_service

router = APIRouter(tags=["browse"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.put("/products/{product_id}/swipe", response_model=Envelope[SwipeOut])
async def swipe_product(
    product_id: uuid.UUID, payload: SwipeIn, user: CurrentUser, session: Session
) -> Envelope[SwipeOut]:
    swipe = await swipe_service.swipe(session, user, product_id, payload.direction)
    return ok(SwipeOut.from_model(swipe))
