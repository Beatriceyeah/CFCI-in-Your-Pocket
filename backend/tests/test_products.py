"""Tests for Module 1 (Products), written from docs/contract.md.

Do not edit the assertions to fit the code; if the contract changes, change the contract first.
"""

import uuid
from datetime import UTC, datetime

from app.data.models import Product
from tests.conftest import MakeUser, assert_error, auth_headers

VALID_PRODUCT = {
    "name": "Loom",
    "one_liner": "Clinical trial matching in minutes",
    "cover_image_url": "https://example.com/loom.png",
    "demo_video_url": "https://example.com/loom.mp4",
    "brief": "Loom helps research teams find eligible patients faster.",
    "category": "health",
}


async def test_student_creates_product_pending_review(client, make_user: MakeUser):
    student = await make_user("student")

    response = await client.post(
        "/api/v1/products", json=VALID_PRODUCT, headers=auth_headers("student", student.id)
    )

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


async def make_product(db_session, owner_id: uuid.UUID, **overrides) -> Product:
    """Insert a product directly, e.g. to set a status the API doesn't expose yet."""
    fields = {**VALID_PRODUCT, "status": "live", **overrides}
    product = Product(owner_id=owner_id, **fields)
    db_session.add(product)
    await db_session.commit()
    return product


async def test_created_product_has_full_contract_fields(client, make_user: MakeUser):
    student = await make_user("student", name="Team Loom")

    response = await client.post(
        "/api/v1/products", json=VALID_PRODUCT, headers=auth_headers("student", student.id)
    )

    data = response.json()["data"]
    assert set(data) == {
        "id", "name", "one_liner", "cover_image_url", "category",
        "demo_video_url", "brief", "team_name", "status", "created_at", "updated_at",
    }  # fmt: skip
    assert data["team_name"] == "Team Loom"
    assert data["cover_image_url"] == VALID_PRODUCT["cover_image_url"]
    assert data["created_at"].endswith("Z")


async def test_second_product_for_same_student_is_409(client, make_user: MakeUser):
    student = await make_user("student")
    headers = auth_headers("student", student.id)
    await client.post("/api/v1/products", json=VALID_PRODUCT, headers=headers)

    response = await client.post("/api/v1/products", json=VALID_PRODUCT, headers=headers)

    assert_error(response, 409, "CONFLICT")


async def test_create_product_for_unknown_user_is_401(client):
    response = await client.post("/api/v1/products", json=VALID_PRODUCT, headers=auth_headers("student"))

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_create_product_rejects_bad_values(client, make_user: MakeUser):
    student = await make_user("student")
    headers = auth_headers("student", student.id)

    for bad in (
        {"category": "crypto"},
        {"cover_image_url": "not a url"},
        {"name": "   "},
        {"one_liner": "x" * 161},
        {"status": "live"},
    ):
        response = await client.post("/api/v1/products", json={**VALID_PRODUCT, **bad}, headers=headers)
        assert_error(response, 400, "VALIDATION_ERROR")


async def test_list_products_hides_pending_and_archived(client, db_session, make_user: MakeUser):
    live = await make_product(db_session, (await make_user()).id, name="Live one")
    await make_product(db_session, (await make_user()).id, status="pending_review")
    await make_product(db_session, (await make_user()).id, status="archived")

    response = await client.get("/api/v1/products", headers=auth_headers())

    body = response.json()
    assert [card["id"] for card in body["data"]] == [str(live.id)]
    assert body["meta"] == {"page": 1, "page_size": 20, "total": 1}


async def test_list_products_newest_first_and_paginated(client, db_session, make_user: MakeUser):
    # One transaction per test means now() is identical for every insert, so set times explicitly.
    for day, name in enumerate(("First", "Second", "Third"), start=1):
        created = datetime(2026, 10, day, tzinfo=UTC)
        await make_product(db_session, (await make_user()).id, name=name, created_at=created)

    page_1 = (await client.get("/api/v1/products", params={"page_size": 2}, headers=auth_headers())).json()
    page_2 = (
        await client.get("/api/v1/products", params={"page": 2, "page_size": 2}, headers=auth_headers())
    ).json()
    page_9 = (await client.get("/api/v1/products", params={"page": 9}, headers=auth_headers())).json()

    assert [c["name"] for c in page_1["data"]] == ["Third", "Second"]
    assert [c["name"] for c in page_2["data"]] == ["First"]
    assert page_1["meta"]["total"] == 3
    assert page_9["data"] == []


async def test_list_products_filters_by_category(client, db_session, make_user: MakeUser):
    await make_product(db_session, (await make_user()).id, category="health")
    await make_product(db_session, (await make_user()).id, category="software")
    await make_product(db_session, (await make_user()).id, category="hardware")

    response = await client.get(
        "/api/v1/products", params=[("category", "health"), ("category", "software")], headers=auth_headers()
    )

    assert sorted(c["category"] for c in response.json()["data"]) == ["health", "software"]


async def test_list_products_unknown_category_is_400(client):
    response = await client.get("/api/v1/products", params={"category": "crypto"}, headers=auth_headers())

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_list_products_requires_auth(client):
    response = await client.get("/api/v1/products")

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_get_live_product_as_any_user(client, db_session, make_user: MakeUser):
    product = await make_product(db_session, (await make_user(name="Team Loom")).id)

    response = await client.get(f"/api/v1/products/{product.id}", headers=auth_headers("external"))

    assert response.status_code == 200
    assert response.json()["data"]["team_name"] == "Team Loom"


async def test_pending_product_visible_to_owner_only(client, db_session, make_user: MakeUser):
    owner = await make_user()
    product = await make_product(db_session, owner.id, status="pending_review")

    as_owner = await client.get(f"/api/v1/products/{product.id}", headers=auth_headers("student", owner.id))
    as_other = await client.get(f"/api/v1/products/{product.id}", headers=auth_headers("external"))

    assert as_owner.status_code == 200
    assert as_owner.json()["data"]["status"] == "pending_review"
    assert_error(as_other, 404, "NOT_FOUND")


async def test_get_product_with_malformed_id_is_400(client):
    response = await client.get("/api/v1/products/not-a-uuid", headers=auth_headers())

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_owner_updates_product(client, db_session, make_user: MakeUser):
    owner = await make_user()
    product = await make_product(db_session, owner.id)
    before = product.updated_at

    response = await client.patch(
        f"/api/v1/products/{product.id}",
        json={"one_liner": "Now even faster", "category": "software"},
        headers=auth_headers("student", owner.id),
    )

    data = response.json()["data"]
    assert response.status_code == 200
    assert data["one_liner"] == "Now even faster"
    assert data["category"] == "software"
    assert data["name"] == VALID_PRODUCT["name"]
    assert data["status"] == "live"
    assert data["updated_at"] >= before.isoformat().replace("+00:00", "Z")


async def test_update_by_non_owner_is_403(client, db_session, make_user: MakeUser):
    product = await make_product(db_session, (await make_user()).id)
    other = await make_user()

    response = await client.patch(
        f"/api/v1/products/{product.id}", json={"name": "Hijacked"}, headers=auth_headers("student", other.id)
    )

    assert_error(response, 403, "FORBIDDEN")


async def test_update_unknown_product_is_404(client):
    response = await client.patch(
        f"/api/v1/products/{uuid.uuid4()}", json={"name": "Ghost"}, headers=auth_headers("student")
    )

    assert_error(response, 404, "NOT_FOUND")


async def test_update_rejects_null_and_status(client, db_session, make_user: MakeUser):
    owner = await make_user()
    product = await make_product(db_session, owner.id)
    headers = auth_headers("student", owner.id)

    for bad in ({"name": None}, {"status": "live"}, {"category": "crypto"}):
        response = await client.patch(f"/api/v1/products/{product.id}", json=bad, headers=headers)
        assert_error(response, 400, "VALIDATION_ERROR")


async def test_update_requires_auth(client):
    response = await client.patch(f"/api/v1/products/{uuid.uuid4()}", json={"name": "x"})

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_my_product_is_null_before_upload(client, make_user: MakeUser):
    student = await make_user()

    response = await client.get("/api/v1/me/product", headers=auth_headers("student", student.id))

    assert response.status_code == 200
    assert response.json() == {"data": None, "error": None}


async def test_my_product_returns_own_product(client, make_user: MakeUser):
    student = await make_user()
    headers = auth_headers("student", student.id)
    created = (await client.post("/api/v1/products", json=VALID_PRODUCT, headers=headers)).json()["data"]

    response = await client.get("/api/v1/me/product", headers=headers)

    assert response.json()["data"] == created


async def test_my_product_is_students_only(client):
    response = await client.get("/api/v1/me/product", headers=auth_headers("external"))

    assert_error(response, 403, "FORBIDDEN")
