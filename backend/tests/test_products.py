"""Tests for Module 1 (Products), written from docs/contract.md.

Do not edit the assertions to fit the code; if the contract changes, change the contract first.
"""

import uuid

from tests.conftest import assert_error, auth_headers

VALID_PRODUCT = {
    "name": "Loom",
    "one_liner": "Clinical trial matching in minutes",
    "cover_image_url": "https://example.com/loom.png",
    "demo_video_url": "https://example.com/loom.mp4",
    "brief": "Loom helps research teams find eligible patients faster.",
    "category": "health",
}


async def test_student_creates_product_pending_review(client):
    response = await client.post("/api/v1/products", json=VALID_PRODUCT, headers=auth_headers("student"))

    assert response.status_code == 201
    body = response.json()
    assert body["error"] is None
    assert body["data"]["status"] == "pending_review"
    assert body["data"]["name"] == "Loom"
    uuid.UUID(body["data"]["id"])


async def test_create_product_missing_field_is_400(client):
    payload = {k: v for k, v in VALID_PRODUCT.items() if k != "name"}

    response = await client.post("/api/v1/products", json=payload, headers=auth_headers("student"))

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_create_product_requires_auth(client):
    response = await client.post("/api/v1/products", json=VALID_PRODUCT)

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_external_user_cannot_create_product(client):
    response = await client.post("/api/v1/products", json=VALID_PRODUCT, headers=auth_headers("external"))

    assert_error(response, 403, "FORBIDDEN")


async def test_get_unknown_product_is_404(client):
    response = await client.get(f"/api/v1/products/{uuid.uuid4()}", headers=auth_headers())

    assert_error(response, 404, "NOT_FOUND")


async def test_list_products_returns_live_only_with_meta(client):
    response = await client.get("/api/v1/products", headers=auth_headers())

    body = response.json()
    assert response.status_code == 200
    assert set(body["meta"]) == {"page", "page_size", "total"}
    card_fields = {"id", "name", "one_liner", "cover_image_url", "category"}
    assert all(set(card) == card_fields for card in body["data"])


async def test_list_products_invalid_page_size_is_400(client):
    response = await client.get("/api/v1/products", params={"page_size": 500}, headers=auth_headers())

    assert_error(response, 400, "VALIDATION_ERROR")
