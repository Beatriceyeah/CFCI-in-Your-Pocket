"""Shared fixtures: test client, test database session, auth helper.

Tests run against the database in DATABASE_URL, which must be a dedicated test
database (Docker Compose locally, the Postgres service in CI), migrated with
`alembic upgrade head`. Each test runs inside a transaction that is rolled back.
"""

import os
import uuid
from collections.abc import AsyncIterator

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/app_test")
os.environ.setdefault("JWT_SECRET", "test-only-not-a-real-secret")

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.security import create_access_token  # noqa: E402
from app.data.db import get_session  # noqa: E402
from app.main import create_app  # noqa: E402


@pytest.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine(get_settings().database_url)
    async with engine.connect() as connection:
        transaction = await connection.begin()
        session = AsyncSession(bind=connection, join_transaction_mode="create_savepoint")
        try:
            yield session
        finally:
            await session.close()
            await transaction.rollback()
    await engine.dispose()


@pytest.fixture
def app(db_session: AsyncSession) -> FastAPI:
    application = create_app()

    async def _session_override() -> AsyncIterator[AsyncSession]:
        yield db_session

    application.dependency_overrides[get_session] = _session_override
    return application


@pytest.fixture
async def client(app: FastAPI) -> AsyncIterator[AsyncClient]:
    # raise_app_exceptions=False so unhandled errors reach the 500 handler like in production.
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


def auth_headers(role: str = "external", user_id: uuid.UUID | None = None) -> dict[str, str]:
    """Bearer header for a user with the given role."""
    token = create_access_token(user_id or uuid.uuid4(), role)
    return {"Authorization": f"Bearer {token}"}


def assert_error(response, status: int, code: str) -> dict:
    """Assert a response is a contract error and return its error body."""
    assert response.status_code == status, response.text
    body = response.json()
    assert body["data"] is None
    assert body["error"]["code"] == code
    assert isinstance(body["error"]["message"], str)
    assert isinstance(body["error"]["details"], dict)
    return body["error"]
