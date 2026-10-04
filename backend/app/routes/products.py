import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import CurrentUser, StudentUser
from app.data.db import get_session
from app.schemas.envelope import Envelope, PaginatedEnvelope, Pagination, ok, paginated
from app.schemas.products import Direction, ProductCardOut, ProductCreate, ProductOut, ProductUpdate
from app.services import products as product_service

router = APIRouter(tags=["products"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/products", response_model=PaginatedEnvelope[ProductCardOut])
async def list_products(
    user: CurrentUser,
    session: Session,
    params: Pagination,
    category: Annotated[list[Direction] | None, Query()] = None,
    exclude_swiped: bool = True,  # in the contract; takes effect once swipes exist (Module 3)
) -> PaginatedEnvelope[ProductCardOut]:
    products, total = await product_service.list_live(session, category, params)
    return paginated([ProductCardOut.from_model(p) for p in products], params, total)


@router.get("/products/{product_id}", response_model=Envelope[ProductOut])
async def get_product(product_id: uuid.UUID, user: CurrentUser, session: Session) -> Envelope[ProductOut]:
    product = await product_service.get_visible(session, user, product_id)
    return ok(ProductOut.from_model(product))


@router.post("/products", response_model=Envelope[ProductOut], status_code=201)
async def create_product(payload: ProductCreate, user: StudentUser, session: Session) -> Envelope[ProductOut]:
    product = await product_service.create(session, user, payload)
    return ok(ProductOut.from_model(product))


@router.patch("/products/{product_id}", response_model=Envelope[ProductOut])
async def update_product(
    product_id: uuid.UUID, payload: ProductUpdate, user: CurrentUser, session: Session
) -> Envelope[ProductOut]:
    product = await product_service.update(session, user, product_id, payload)
    return ok(ProductOut.from_model(product))


@router.get("/me/product", response_model=Envelope[ProductOut | None])
async def get_my_product(user: StudentUser, session: Session) -> Envelope[ProductOut | None]:
    product = await product_service.get_own(session, user)
    return ok(ProductOut.from_model(product) if product else None)
