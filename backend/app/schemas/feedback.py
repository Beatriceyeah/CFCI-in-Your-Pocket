"""Feedback request/response models. Field names and shapes follow docs/contract.md."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.data.models import Feedback


class FeedbackIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    would_use: bool
    would_invest: bool
    would_intro: bool
    comment: str | None = Field(default=None, max_length=1000)

    @field_validator("comment")
    @classmethod
    def blank_comment_is_none(cls, value: str | None) -> str | None:
        return value or None


class FeedbackOut(BaseModel):
    product_id: uuid.UUID
    would_use: bool
    would_invest: bool
    would_intro: bool
    comment: str | None
    created_at: datetime

    @classmethod
    def from_model(cls, feedback: Feedback) -> "FeedbackOut":
        return cls(
            product_id=feedback.product_id,
            would_use=feedback.would_use,
            would_invest=feedback.would_invest,
            would_intro=feedback.would_intro,
            comment=feedback.comment,
            created_at=feedback.created_at,
        )
