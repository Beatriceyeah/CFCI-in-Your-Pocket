"""Product request/response models. Field names and shapes follow docs/contract.md."""

import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.data.models import Product

Direction = Literal["research", "health", "software", "hardware"]
ProductStatus = Literal["pending_review", "live", "archived"]

Name = Annotated[str, Field(min_length=1, max_length=100)]
OneLiner = Annotated[str, Field(min_length=1, max_length=160)]
Brief = Annotated[str, Field(min_length=1, max_length=5000)]


class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: Name
    one_liner: OneLiner
    cover_image_url: HttpUrl
    demo_video_url: HttpUrl
    brief: Brief
    category: Direction


class ProductUpdate(BaseModel):
    """Any subset of the create fields. Omitted fields stay as they are; explicit null is rejected,
    because a None default is not validated but a null sent by the client is."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: Name = None  # type: ignore[assignment]
    one_liner: OneLiner = None  # type: ignore[assignment]
    cover_image_url: HttpUrl = None  # type: ignore[assignment]
    demo_video_url: HttpUrl = None  # type: ignore[assignment]
    brief: Brief = None  # type: ignore[assignment]
    category: Direction = None  # type: ignore[assignment]


class ProductCardOut(BaseModel):
    id: uuid.UUID
    name: str
    one_liner: str
    cover_image_url: str
    category: Direction

    @classmethod
    def from_model(cls, product: Product) -> "ProductCardOut":
        return cls(
            id=product.id,
            name=product.name,
            one_liner=product.one_liner,
            cover_image_url=product.cover_image_url,
            category=product.category,  # type: ignore[arg-type]
        )


class ProductOut(ProductCardOut):
    demo_video_url: str
    brief: str
    team_name: str
    status: ProductStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, product: Product) -> "ProductOut":
        """Requires product.owner to be loaded (the repository does this)."""
        return cls(
            **ProductCardOut.from_model(product).model_dump(),
            demo_video_url=product.demo_video_url,
            brief=product.brief,
            team_name=product.owner.name,
            status=product.status,  # type: ignore[arg-type]
            created_at=product.created_at,
            updated_at=product.updated_at,
        )
