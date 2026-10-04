import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import CurrentUser
from app.data.db import get_session
from app.schemas.envelope import Envelope, PaginatedEnvelope, Pagination, ok, paginated
from app.schemas.products import ProductCardOut
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


@router.get("/me/interested-products", response_model=PaginatedEnvelope[ProductCardOut])
async def list_interested_products(
    user: CurrentUser, session: Session, params: Pagination
) -> PaginatedEnvelope[ProductCardOut]:
    products, total = await swipe_service.list_interested(session, user, params)
    return paginated([ProductCardOut.from_model(p) for p in products], params, total)
