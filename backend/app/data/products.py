"""Product repository: the only place that queries the products table."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.data.models import Product


async def get(session: AsyncSession, product_id: uuid.UUID) -> Product | None:
    """Product with its owner loaded (needed for team_name)."""
    query = (
        select(Product)
        .options(joinedload(Product.owner))
        .where(Product.id == product_id)
        .execution_options(populate_existing=True)
    )
    return await session.scalar(query)


async def get_by_owner(session: AsyncSession, owner_id: uuid.UUID) -> Product | None:
    query = (
        select(Product)
        .options(joinedload(Product.owner))
        .where(Product.owner_id == owner_id)
        .execution_options(populate_existing=True)
    )
    return await session.scalar(query)


async def list_live(
    session: AsyncSession, categories: list[str] | None, offset: int, limit: int
) -> tuple[list[Product], int]:
    """Live products, newest first, optionally filtered by category. Returns (page, total)."""
    where = [Product.status == "live"]
    if categories:
        where.append(Product.category.in_(categories))

    total = await session.scalar(select(func.count()).select_from(Product).where(*where))
    page = await session.scalars(
        select(Product)
        .where(*where)
        .order_by(Product.created_at.desc(), Product.id)
        .offset(offset)
        .limit(limit)
    )
    return list(page), total or 0


async def add(session: AsyncSession, product: Product) -> Product:
    session.add(product)
    await session.commit()
    return await _reload(session, product.id)


async def save(session: AsyncSession, product: Product) -> Product:
    await session.commit()
    return await _reload(session, product.id)


async def _reload(session: AsyncSession, product_id: uuid.UUID) -> Product:
    product = await get(session, product_id)
    assert product is not None, "product vanished right after commit"
    return product
