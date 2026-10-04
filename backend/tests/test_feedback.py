"""Tests for Module 3 (Browse: feedback), written from docs/contract.md."""

import uuid

import pytest

from tests.conftest import MakeUser, assert_error, auth_headers, make_product

REACTIONS = {"would_use": True, "would_invest": False, "would_intro": True, "comment": "Love the demo"}


@pytest.fixture
async def viewer(make_user: MakeUser):
    return await make_user("external")


@pytest.fixture
async def product(db_session, make_user: MakeUser):
    return await make_product(db_session, (await make_user("student")).id)


@pytest.fixture
def headers(viewer):
    return auth_headers("external", viewer.id)


async def swipe(client, product_id, direction: str, headers) -> None:
    response = await client.put(
        f"/api/v1/products/{product_id}/swipe", json={"direction": direction}, headers=headers
    )
    assert response.status_code == 200


def feedback_url(product_id) -> str:
    return f"/api/v1/products/{product_id}/feedback"


async def test_feedback_after_right_swipe(client, product, headers):
    await swipe(client, product.id, "right", headers)

    response = await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["error"] is None
    assert set(body["data"]) == {
        "product_id", "would_use", "would_invest", "would_intro", "comment", "created_at",
    }  # fmt: skip
    assert body["data"]["product_id"] == str(product.id)
    assert body["data"]["would_use"] is True
    assert body["data"]["would_invest"] is False
    assert body["data"]["comment"] == "Love the demo"


async def test_comment_is_optional(client, product, headers):
    await swipe(client, product.id, "right", headers)
    reactions = {k: v for k, v in REACTIONS.items() if k != "comment"}

    response = await client.post(feedback_url(product.id), json=reactions, headers=headers)

    assert response.status_code == 201
    assert response.json()["data"]["comment"] is None


async def test_blank_comment_is_stored_as_null(client, product, headers):
    await swipe(client, product.id, "right", headers)

    response = await client.post(
        feedback_url(product.id), json={**REACTIONS, "comment": "   "}, headers=headers
    )

    assert response.json()["data"]["comment"] is None


async def test_feedback_without_swipe_is_409(client, product, headers):
    response = await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    assert_error(response, 409, "CONFLICT")


async def test_feedback_after_left_swipe_is_409(client, product, headers):
    await swipe(client, product.id, "left", headers)

    response = await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    assert_error(response, 409, "CONFLICT")


async def test_second_feedback_is_409(client, product, headers):
    await swipe(client, product.id, "right", headers)
    await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    response = await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    assert_error(response, 409, "CONFLICT")


async def test_feedback_stays_after_swiping_left_later(client, product, headers):
    await swipe(client, product.id, "right", headers)
    await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)
    await swipe(client, product.id, "left", headers)
    await swipe(client, product.id, "right", headers)

    response = await client.post(feedback_url(product.id), json=REACTIONS, headers=headers)

    assert_error(response, 409, "CONFLICT")


async def test_feedback_rejects_bad_values(client, product, headers):
    await swipe(client, product.id, "right", headers)

    for bad in (
        {k: v for k, v in REACTIONS.items() if k != "would_use"},
        {**REACTIONS, "would_invest": "maybe"},
        {**REACTIONS, "comment": "x" * 1001},
        {**REACTIONS, "rating": 5},
    ):
        response = await client.post(feedback_url(product.id), json=bad, headers=headers)
        assert_error(response, 400, "VALIDATION_ERROR")


async def test_feedback_unknown_product_is_404(client, headers):
    response = await client.post(feedback_url(uuid.uuid4()), json=REACTIONS, headers=headers)

    assert_error(response, 404, "NOT_FOUND")


async def test_feedback_requires_auth(client, product):
    response = await client.post(feedback_url(product.id), json=REACTIONS)

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_owner_cannot_give_feedback_on_own_product(client, db_session, make_user: MakeUser):
    owner = await make_user("student")
    own = await make_product(db_session, owner.id)

    response = await client.post(
        feedback_url(own.id), json=REACTIONS, headers=auth_headers("student", owner.id)
    )

    assert_error(response, 403, "FORBIDDEN")


# --- Feedback received (Module 4: My Dashboard) ---


def summary_url(product_id) -> str:
    return f"/api/v1/products/{product_id}/feedback"


async def test_owner_sees_feedback_summary(client, db_session, make_user: MakeUser):
    owner = await make_user("student")
    own = await make_product(db_session, owner.id)
    viewers = [await make_user("external") for _ in range(3)]
    reactions = [
        {"would_use": True, "would_invest": True, "would_intro": False, "comment": "Would pay for this"},
        {"would_use": True, "would_invest": False, "would_intro": True},
        {"would_use": False, "would_invest": False, "would_intro": False, "comment": "Not for me"},
    ]
    for viewer, reaction in zip(viewers, reactions, strict=True):
        headers = auth_headers("external", viewer.id)
        await swipe(client, own.id, "right", headers)
        await client.post(feedback_url(own.id), json=reaction, headers=headers)
    lurker = await make_user("external")
    await swipe(client, own.id, "right", auth_headers("external", lurker.id))
    await swipe(client, own.id, "left", auth_headers("external", (await make_user("external")).id))

    response = await client.get(summary_url(own.id), headers=auth_headers("student", owner.id))

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["counts"] == {"right_swipes": 4, "would_use": 2, "would_invest": 1, "would_intro": 1}
    assert sorted(c["comment"] for c in data["comments"]) == ["Not for me", "Would pay for this"]
    assert all(set(c) == {"comment", "created_at"} for c in data["comments"])


async def test_feedback_summary_empty(client, db_session, make_user: MakeUser):
    owner = await make_user("student")
    own = await make_product(db_session, owner.id, status="pending_review")

    response = await client.get(summary_url(own.id), headers=auth_headers("student", owner.id))

    assert response.json() == {
        "data": {
            "counts": {"right_swipes": 0, "would_use": 0, "would_invest": 0, "would_intro": 0},
            "comments": [],
        },
        "error": None,
    }


async def test_feedback_summary_visible_to_other_viewers(client, product, headers, make_user: MakeUser):
    commenter = await make_user("external")
    commenter_headers = auth_headers("external", commenter.id)
    await swipe(client, product.id, "right", commenter_headers)
    await client.post(feedback_url(product.id), json=REACTIONS, headers=commenter_headers)

    response = await client.get(summary_url(product.id), headers=headers)

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["counts"]["right_swipes"] == 1
    assert [c["comment"] for c in data["comments"]] == ["Love the demo"]


async def test_feedback_summary_of_pending_product_is_owner_only(
    client, db_session, headers, make_user: MakeUser
):
    pending = await make_product(db_session, (await make_user("student")).id, status="pending_review")

    response = await client.get(summary_url(pending.id), headers=headers)

    assert_error(response, 404, "NOT_FOUND")


async def test_feedback_summary_unknown_product_is_404(client, headers):
    response = await client.get(summary_url(uuid.uuid4()), headers=headers)

    assert_error(response, 404, "NOT_FOUND")


async def test_feedback_summary_requires_auth(client, product):
    response = await client.get(summary_url(product.id))

    assert_error(response, 401, "UNAUTHENTICATED")
