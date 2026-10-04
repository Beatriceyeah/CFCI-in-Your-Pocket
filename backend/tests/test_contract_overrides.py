"""One test per framework default the contract overrides (see AGENTS.md).

Test-only routes are mounted on the app so the overrides are proven before any feature exists.
"""

import pytest
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel, Field

from app.core.errors import ApiError
from app.core.security import CurrentUser, StudentUser
from app.schemas.envelope import Envelope, PaginatedEnvelope, Pagination, ok, paginated
from tests.conftest import assert_error, auth_headers


class Item(BaseModel):
    name: str = Field(min_length=1)


@pytest.fixture
def app(app: FastAPI) -> FastAPI:
    router = APIRouter(prefix="/api/v1/_test")

    @router.post("/items", response_model=Envelope[Item], status_code=201)
    async def create_item(item: Item) -> Envelope[Item]:
        return ok(item)

    @router.get("/items", response_model=PaginatedEnvelope[Item])
    async def list_items(params: Pagination) -> PaginatedEnvelope[Item]:
        items = [Item(name=f"item {i}") for i in range(3)]
        return paginated(items[params.offset : params.offset + params.page_size], params, len(items))

    @router.get("/boom")
    async def boom() -> None:
        raise RuntimeError("secret internal detail")

    @router.get("/conflict")
    async def conflict() -> None:
        raise ApiError("CONFLICT", "Already exists")

    @router.get("/me", response_model=Envelope[str])
    async def me(user: CurrentUser) -> Envelope[str]:
        return ok(user.role)

    @router.get("/students-only", response_model=Envelope[str])
    async def students_only(user: StudentUser) -> Envelope[str]:
        return ok(user.role)

    app.include_router(router)
    return app


# Validation: 422 -> 400 VALIDATION_ERROR
async def test_validation_error_is_400_with_field_details(client):
    response = await client.post("/api/v1/_test/items", json={"name": ""})

    error = assert_error(response, 400, "VALIDATION_ERROR")
    assert "name" in error["details"]["fields"]


async def test_missing_body_is_400_not_422(client):
    response = await client.post("/api/v1/_test/items")

    assert_error(response, 400, "VALIDATION_ERROR")


# HTTPException / routing errors -> envelope
async def test_unknown_path_is_404_envelope(client):
    response = await client.get("/api/v1/does-not-exist")

    assert_error(response, 404, "NOT_FOUND")


async def test_wrong_method_is_405_envelope(client):
    response = await client.delete("/api/v1/health")

    assert_error(response, 405, "METHOD_NOT_ALLOWED")


async def test_api_error_uses_contract_code(client):
    response = await client.get("/api/v1/_test/conflict")

    assert_error(response, 409, "CONFLICT")


# Unhandled exception -> 500 INTERNAL_ERROR without traceback
async def test_unhandled_error_is_500_without_internals(client):
    response = await client.get("/api/v1/_test/boom")

    assert_error(response, 500, "INTERNAL_ERROR")
    assert "secret internal detail" not in response.text
    assert "Traceback" not in response.text


# redirect_slashes=False -> no 307
async def test_trailing_slash_is_not_redirected(client):
    response = await client.get("/api/v1/health/")

    assert_error(response, 404, "NOT_FOUND")


# Envelope + pagination
async def test_success_uses_envelope(client):
    response = await client.post("/api/v1/_test/items", json={"name": "Loom"})

    assert response.status_code == 201
    assert response.json() == {"data": {"name": "Loom"}, "error": None}


async def test_list_returns_meta(client):
    response = await client.get("/api/v1/_test/items", params={"page": 1, "page_size": 2})

    body = response.json()
    assert response.status_code == 200
    assert len(body["data"]) == 2
    assert body["meta"] == {"page": 1, "page_size": 2, "total": 3}
    assert body["error"] is None


async def test_page_past_end_is_empty_not_404(client):
    response = await client.get("/api/v1/_test/items", params={"page": 5})

    assert response.status_code == 200
    assert response.json()["data"] == []


@pytest.mark.parametrize("page_size", [0, 101])
async def test_invalid_page_size_is_400(client, page_size):
    response = await client.get("/api/v1/_test/items", params={"page_size": page_size})

    assert_error(response, 400, "VALIDATION_ERROR")


# Auth: missing/invalid token -> 401, wrong role -> 403
async def test_missing_token_is_401_not_403(client):
    response = await client.get("/api/v1/_test/me")

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_invalid_token_is_401(client):
    response = await client.get("/api/v1/_test/me", headers={"Authorization": "Bearer not-a-jwt"})

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_valid_token_is_accepted(client):
    response = await client.get("/api/v1/_test/me", headers=auth_headers("student"))

    assert response.status_code == 200
    assert response.json()["data"] == "student"


async def test_wrong_role_is_403(client):
    response = await client.get("/api/v1/_test/students-only", headers=auth_headers("external"))

    assert_error(response, 403, "FORBIDDEN")
