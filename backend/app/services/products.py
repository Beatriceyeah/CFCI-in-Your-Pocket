"""Product business rules: who can see, create and edit a product."""

import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import AuthUser
from app.data import products as product_repo
from app.data import users as user_repo
from app.data.models import Product
from app.schemas.envelope import PageParams
from app.schemas.products import ProductCreate, ProductUpdate

URL_FIELDS = ("cover_image_url", "demo_video_url")


async def list_live(
    session: AsyncSession, categories: list[str] | None, params: PageParams
) -> tuple[list[Product], int]:
    return await product_repo.list_live(session, categories, params.offset, params.page_size)


async def get_visible(session: AsyncSession, user: AuthUser, product_id: uuid.UUID) -> Product:
    """Live products are visible to everyone; others only to their owner."""
    product = await product_repo.get(session, product_id)
    if product is None or (product.status != "live" and product.owner_id != user.id):
        raise ApiError("NOT_FOUND", "Product not found")
    return product


async def create(session: AsyncSession, user: AuthUser, payload: ProductCreate) -> Product:
    if await user_repo.get(session, user.id) is None:
        raise ApiError("UNAUTHENTICATED", "Signed-in user no longer exists")
    if await product_repo.get_by_owner(session, user.id) is not None:
        raise ApiError("CONFLICT", "You already have a product; edit it from My Dashboard")

    product = Product(owner_id=user.id, **_column_values(payload.model_dump()))
    try:
        return await product_repo.add(session, product)
    except IntegrityError as exc:
        # Lost a race with a second create from the same student.
        await session.rollback()
        raise ApiError("CONFLICT", "You already have a product; edit it from My Dashboard") from exc


async def update(
    session: AsyncSession, user: AuthUser, product_id: uuid.UUID, payload: ProductUpdate
) -> Product:
    product = await product_repo.get(session, product_id)
    if product is None:
        raise ApiError("NOT_FOUND", "Product not found")
    if product.owner_id != user.id:
        raise ApiError("FORBIDDEN", "Only the product's owner can edit it")

    for field, value in _column_values(payload.model_dump(exclude_unset=True)).items():
        setattr(product, field, value)
    return await product_repo.save(session, product)


async def get_own(session: AsyncSession, user: AuthUser) -> Product | None:
    return await product_repo.get_by_owner(session, user.id)


def _column_values(fields: dict) -> dict:
    """Pydantic URL objects → plain strings for the database."""
    return {key: str(value) if key in URL_FIELDS else value for key, value in fields.items()}
