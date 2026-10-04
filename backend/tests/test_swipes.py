"""Tests for Module 3 (Browse: swipes), written from docs/contract.md."""

import uuid
from datetime import UTC, datetime

import pytest

from app.data.models import Swipe
from tests.conftest import MakeUser, assert_error, auth_headers, make_product


@pytest.fixture
async def viewer(make_user: MakeUser):
    return await make_user("external")


@pytest.fixture
async def product(db_session, make_user: MakeUser):
    return await make_product(db_session, (await make_user("student")).id)


def swipe_url(product_id) -> str:
    return f"/api/v1/products/{product_id}/swipe"


@pytest.mark.parametrize("direction", ["left", "right"])
async def test_swipe_returns_contract_shape(client, viewer, product, direction):
    response = await client.put(
        swipe_url(product.id), json={"direction": direction}, headers=auth_headers("external", viewer.id)
    )

    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    assert set(body["data"]) == {"product_id", "direction", "created_at"}
    assert body["data"]["product_id"] == str(product.id)
    assert body["data"]["direction"] == direction
    assert body["data"]["created_at"].endswith("Z")


async def test_swipe_again_replaces_earlier_swipe(client, viewer, product):
    headers = auth_headers("external", viewer.id)
    await client.put(swipe_url(product.id), json={"direction": "right"}, headers=headers)

    response = await client.put(swipe_url(product.id), json={"direction": "left"}, headers=headers)

    assert response.status_code == 200
    assert response.json()["data"]["direction"] == "left"


async def test_swipe_is_idempotent(client, viewer, product):
    headers = auth_headers("external", viewer.id)

    first = await client.put(swipe_url(product.id), json={"direction": "right"}, headers=headers)
    second = await client.put(swipe_url(product.id), json={"direction": "right"}, headers=headers)

    assert first.status_code == second.status_code == 200
    assert second.json()["data"]["direction"] == "right"


async def test_students_can_swipe_too(client, make_user: MakeUser, product):
    student = await make_user("student")

    response = await client.put(
        swipe_url(product.id), json={"direction": "right"}, headers=auth_headers("student", student.id)
    )

    assert response.status_code == 200


async def test_swipe_invalid_direction_is_400(client, viewer, product):
    headers = auth_headers("external", viewer.id)

    for bad in ({"direction": "up"}, {}, {"direction": "right", "extra": 1}):
        response = await client.put(swipe_url(product.id), json=bad, headers=headers)
        assert_error(response, 400, "VALIDATION_ERROR")


async def test_swipe_unknown_product_is_404(client, viewer):
    response = await client.put(
        swipe_url(uuid.uuid4()), json={"direction": "right"}, headers=auth_headers("external", viewer.id)
    )

    assert_error(response, 404, "NOT_FOUND")


async def test_swipe_on_pending_product_is_404(client, db_session, viewer, make_user: MakeUser):
    pending = await make_product(db_session, (await make_user()).id, status="pending_review")

    response = await client.put(
        swipe_url(pending.id), json={"direction": "right"}, headers=auth_headers("external", viewer.id)
    )

    assert_error(response, 404, "NOT_FOUND")


async def test_swipe_requires_auth(client, product):
    response = await client.put(swipe_url(product.id), json={"direction": "right"})

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_swipe_for_deleted_user_is_401(client, product):
    response = await client.put(swipe_url(product.id), json={"direction": "right"}, headers=auth_headers())

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_gallery_keeps_swiped_products_by_default(client, viewer, product):
    headers = auth_headers("external", viewer.id)
    await client.put(swipe_url(product.id), json={"direction": "left"}, headers=headers)

    response = await client.get("/api/v1/products", headers=headers)

    assert [c["id"] for c in response.json()["data"]] == [str(product.id)]


async def test_gallery_can_hide_swiped_products(client, db_session, viewer, product, make_user: MakeUser):
    unswiped = await make_product(db_session, (await make_user()).id, name="Not swiped yet")
    headers = auth_headers("external", viewer.id)
    await client.put(swipe_url(product.id), json={"direction": "right"}, headers=headers)

    response = await client.get("/api/v1/products", params={"exclude_swiped": "true"}, headers=headers)

    body = response.json()
    assert [c["id"] for c in body["data"]] == [str(unswiped.id)]
    assert body["meta"]["total"] == 1


async def test_hiding_swiped_products_is_per_user(client, viewer, product, make_user: MakeUser):
    other = await make_user("external")
    await client.put(
        swipe_url(product.id), json={"direction": "right"}, headers=auth_headers("external", viewer.id)
    )

    response = await client.get(
        "/api/v1/products", params={"exclude_swiped": "true"}, headers=auth_headers("external", other.id)
    )

    assert [c["id"] for c in response.json()["data"]] == [str(product.id)]


async def test_owner_cannot_swipe_own_product(client, db_session, make_user: MakeUser):
    owner = await make_user("student")
    own = await make_product(db_session, owner.id)

    response = await client.put(
        swipe_url(own.id), json={"direction": "right"}, headers=auth_headers("student", owner.id)
    )

    assert_error(response, 403, "FORBIDDEN")


async def test_owner_cannot_swipe_own_pending_product(client, db_session, make_user: MakeUser):
    owner = await make_user("student")
    own = await make_product(db_session, owner.id, status="pending_review")

    response = await client.put(
        swipe_url(own.id), json={"direction": "right"}, headers=auth_headers("student", owner.id)
    )

    assert_error(response, 403, "FORBIDDEN")


# --- Interested Products (Module 4: My Dashboard) ---


async def add_swipe(db_session, user_id, product_id, direction: str, day: int) -> None:
    """Insert a swipe with an explicit time; one transaction per test means now() never changes."""
    created = datetime(2026, 10, day, tzinfo=UTC)
    db_session.add(Swipe(user_id=user_id, product_id=product_id, direction=direction, created_at=created))
    await db_session.commit()


async def test_interested_products_newest_right_swipe_first(client, db_session, viewer, make_user: MakeUser):
    older = await make_product(db_session, (await make_user()).id, name="Older")
    newer = await make_product(db_session, (await make_user()).id, name="Newer")
    skipped = await make_product(db_session, (await make_user()).id, name="Skipped")
    await add_swipe(db_session, viewer.id, older.id, "right", day=1)
    await add_swipe(db_session, viewer.id, newer.id, "right", day=2)
    await add_swipe(db_session, viewer.id, skipped.id, "left", day=3)

    response = await client.get("/api/v1/me/interested-products", headers=auth_headers("external", viewer.id))

    body = response.json()
    assert response.status_code == 200
    assert [c["name"] for c in body["data"]] == ["Newer", "Older"]
    assert set(body["data"][0]) == {"id", "name", "one_liner", "cover_image_url", "category"}
    assert body["meta"] == {"page": 1, "page_size": 20, "total": 2}


async def test_swiping_left_removes_from_interested(client, viewer, product):
    headers = auth_headers("external", viewer.id)
    await client.put(swipe_url(product.id), json={"direction": "right"}, headers=headers)
    await client.put(swipe_url(product.id), json={"direction": "left"}, headers=headers)

    response = await client.get("/api/v1/me/interested-products", headers=headers)

    assert response.json()["data"] == []


async def test_interested_products_hide_products_no_longer_live(client, db_session, viewer, product):
    await add_swipe(db_session, viewer.id, product.id, "right", day=1)
    product.status = "archived"
    await db_session.commit()

    response = await client.get("/api/v1/me/interested-products", headers=auth_headers("external", viewer.id))

    assert response.json()["meta"]["total"] == 0


async def test_interested_products_are_per_user(client, viewer, product, make_user: MakeUser):
    other = await make_user("external")
    await client.put(
        swipe_url(product.id), json={"direction": "right"}, headers=auth_headers("external", other.id)
    )

    response = await client.get("/api/v1/me/interested-products", headers=auth_headers("external", viewer.id))

    assert response.json()["data"] == []


async def test_interested_products_paginate(client, db_session, viewer, make_user: MakeUser):
    for day in (1, 2, 3):
        p = await make_product(db_session, (await make_user()).id, name=f"Day {day}")
        await add_swipe(db_session, viewer.id, p.id, "right", day=day)

    response = await client.get(
        "/api/v1/me/interested-products",
        params={"page": 2, "page_size": 2},
        headers=auth_headers("external", viewer.id),
    )

    body = response.json()
    assert [c["name"] for c in body["data"]] == ["Day 1"]
    assert body["meta"] == {"page": 2, "page_size": 2, "total": 3}


async def test_interested_products_invalid_page_size_is_400(client, viewer):
    response = await client.get(
        "/api/v1/me/interested-products", params={"page_size": 0}, headers=auth_headers("external", viewer.id)
    )

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_interested_products_requires_auth(client):
    response = await client.get("/api/v1/me/interested-products")

    assert_error(response, 401, "UNAUTHENTICATED")
