"""Auth request/response models. Field names and shapes follow docs/contract.md."""

from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.users import AuthProvider, UserOut


class DemoLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: AuthProvider


class AuthSession(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserOut
