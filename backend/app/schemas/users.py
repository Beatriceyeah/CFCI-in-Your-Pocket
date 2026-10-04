"""User request/response models. Field names and shapes follow docs/contract.md."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.data.models import User
from app.schemas.products import Direction

AuthProvider = Literal["duke_netid", "linkedin", "google"]
Role = Literal["student", "external"]


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    auth_provider: AuthProvider
    role: Role
    interested_directions: list[Direction]
    onboarded: bool
    created_at: datetime

    @classmethod
    def from_model(cls, user: User) -> "UserOut":
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            auth_provider=user.auth_provider,  # type: ignore[arg-type]
            role=user.role,  # type: ignore[arg-type]
            interested_directions=user.interested_directions,  # type: ignore[arg-type]
            onboarded=user.onboarded,
            created_at=user.created_at,
        )


class MeUpdate(BaseModel):
    """Both fields optional. Omitted fields stay as they are; explicit null is rejected,
    because a None default is not validated but a null sent by the client is."""

    model_config = ConfigDict(extra="forbid")

    interested_directions: list[Direction] = Field(default=None, max_length=4)  # type: ignore[assignment]
    onboarded: bool = None  # type: ignore[assignment]
