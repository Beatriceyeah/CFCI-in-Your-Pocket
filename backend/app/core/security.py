"""JWT issuing and the shared auth dependencies.

Use `current_user` or `require_role(...)` on every protected route. Never use FastAPI's
HTTPBearer: it returns 403 for a missing header, the contract requires 401.
"""

import uuid
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends, Request

from app.core.config import get_settings
from app.core.errors import ApiError

ROLES = ("student", "external")


@dataclass(frozen=True)
class AuthUser:
    id: uuid.UUID
    role: str


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expires_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode(token: str) -> AuthUser:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user = AuthUser(id=uuid.UUID(payload["sub"]), role=payload["role"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise ApiError("UNAUTHENTICATED", "Invalid or expired token") from exc
    if user.role not in ROLES:
        raise ApiError("UNAUTHENTICATED", "Invalid or expired token")
    return user


async def current_user(request: Request) -> AuthUser:
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise ApiError("UNAUTHENTICATED", "Missing bearer token")
    return _decode(token)


CurrentUser = Annotated[AuthUser, Depends(current_user)]


def require_role(*roles: str) -> Callable[..., AuthUser]:
    async def dependency(user: CurrentUser) -> AuthUser:
        if user.role not in roles:
            raise ApiError("FORBIDDEN", "You don't have access to this resource")
        return user

    return dependency


StudentUser = Annotated[AuthUser, Depends(require_role("student"))]
