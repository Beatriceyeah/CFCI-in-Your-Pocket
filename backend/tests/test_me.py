"""Tests for Module 2 (Me: profile and onboarding), written from docs/contract.md."""

from tests.conftest import MakeUser, assert_error, auth_headers

USER_FIELDS = {
    "id", "name", "email", "auth_provider", "role", "interested_directions", "onboarded", "created_at",
}  # fmt: skip


async def test_get_me_returns_contract_user(client, make_user: MakeUser):
    user = await make_user("external", name="Grace Investor")

    response = await client.get("/api/v1/me", headers=auth_headers("external", user.id))

    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data) == USER_FIELDS
    assert data["name"] == "Grace Investor"
    assert data["role"] == "external"
    assert data["created_at"].endswith("Z")


async def test_get_me_requires_auth(client):
    response = await client.get("/api/v1/me")

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_get_me_for_deleted_user_is_401(client):
    response = await client.get("/api/v1/me", headers=auth_headers("external"))

    assert_error(response, 401, "UNAUTHENTICATED")


async def test_choose_directions_and_finish_onboarding(client, make_user: MakeUser):
    user = await make_user("external")

    response = await client.patch(
        "/api/v1/me",
        json={"interested_directions": ["software", "health"], "onboarded": True},
        headers=auth_headers("external", user.id),
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["interested_directions"] == ["software", "health"]
    assert data["onboarded"] is True


async def test_skip_onboarding_keeps_directions(client, make_user: MakeUser):
    user = await make_user("external")
    headers = auth_headers("external", user.id)
    await client.patch("/api/v1/me", json={"interested_directions": ["research"]}, headers=headers)

    response = await client.patch("/api/v1/me", json={"onboarded": True}, headers=headers)

    data = response.json()["data"]
    assert data["onboarded"] is True
    assert data["interested_directions"] == ["research"]


async def test_update_persists(client, make_user: MakeUser):
    user = await make_user("student")
    headers = auth_headers("student", user.id)
    await client.patch("/api/v1/me", json={"onboarded": True}, headers=headers)

    response = await client.get("/api/v1/me", headers=headers)

    assert response.json()["data"]["onboarded"] is True


async def test_duplicate_directions_are_collapsed(client, make_user: MakeUser):
    user = await make_user("external")

    response = await client.patch(
        "/api/v1/me",
        json={"interested_directions": ["health", "health", "software"]},
        headers=auth_headers("external", user.id),
    )

    assert response.json()["data"]["interested_directions"] == ["health", "software"]


async def test_clear_directions(client, make_user: MakeUser):
    user = await make_user("external")
    headers = auth_headers("external", user.id)
    await client.patch("/api/v1/me", json={"interested_directions": ["health"]}, headers=headers)

    response = await client.patch("/api/v1/me", json={"interested_directions": []}, headers=headers)

    assert response.json()["data"]["interested_directions"] == []


async def test_update_me_rejects_bad_values(client, make_user: MakeUser):
    user = await make_user("external")
    headers = auth_headers("external", user.id)

    for bad in (
        {"interested_directions": ["crypto"]},
        {"interested_directions": None},
        {"onboarded": None},
        {"onboarded": "maybe"},
        {"role": "student"},
        {"name": "New name"},
    ):
        response = await client.patch("/api/v1/me", json=bad, headers=headers)
        assert_error(response, 400, "VALIDATION_ERROR")


async def test_update_me_requires_auth(client):
    response = await client.patch("/api/v1/me", json={"onboarded": True})

    assert_error(response, 401, "UNAUTHENTICATED")
