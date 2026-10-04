"""Swipe request/response models. Field names and shapes follow docs/contract.md."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.data.models import Swipe

SwipeDirection = Literal["left", "right"]


class SwipeIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    direction: SwipeDirection


class SwipeOut(BaseModel):
    product_id: uuid.UUID
    direction: SwipeDirection
    created_at: datetime

    @classmethod
    def from_model(cls, swipe: Swipe) -> "SwipeOut":
        return cls(
            product_id=swipe.product_id,
            direction=swipe.direction,  # type: ignore[arg-type]
            created_at=swipe.created_at,
        )
