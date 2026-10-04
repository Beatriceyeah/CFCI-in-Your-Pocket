"""Tests for Module 3 (Browse: swipes), written from docs/contract.md."""

import uuid

import pytest

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
