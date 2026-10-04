"""Tests for Module 2 (Auth: mock sign-in), written from docs/contract.md."""

import pytest

from tests.conftest import assert_error


@pytest.mark.parametrize(
    ("provider", "role"), [("duke_netid", "student"), ("linkedin", "external"), ("google", "external")]
)
async def test_demo_login_returns_token_and_user(client, provider, role):
    response = await client.post("/api/v1/auth/demo-login", json={"provider": provider})

    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    data = body["data"]
    assert set(data) == {"access_token", "token_type", "user"}
    assert data["token_type"] == "bearer"
    assert data["user"]["auth_provider"] == provider
    assert data["user"]["role"] == role
    assert data["user"]["onboarded"] is False
    assert data["user"]["interested_directions"] == []


async def test_demo_login_token_works_on_protected_endpoint(client):
    login = (await client.post("/api/v1/auth/demo-login", json={"provider": "google"})).json()["data"]

    response = await client.get("/api/v1/me", headers={"Authorization": f"Bearer {login['access_token']}"})

    assert response.status_code == 200
    assert response.json()["data"]["id"] == login["user"]["id"]


async def test_demo_login_reuses_the_same_demo_user(client):
    first = (await client.post("/api/v1/auth/demo-login", json={"provider": "duke_netid"})).json()
    second = (await client.post("/api/v1/auth/demo-login", json={"provider": "duke_netid"})).json()

    assert first["data"]["user"]["id"] == second["data"]["user"]["id"]


async def test_each_provider_has_its_own_demo_user(client):
    linkedin = (await client.post("/api/v1/auth/demo-login", json={"provider": "linkedin"})).json()
    google = (await client.post("/api/v1/auth/demo-login", json={"provider": "google"})).json()

    assert linkedin["data"]["user"]["id"] != google["data"]["user"]["id"]


async def test_demo_login_unknown_provider_is_400(client):
    response = await client.post("/api/v1/auth/demo-login", json={"provider": "facebook"})

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_demo_login_missing_provider_is_400(client):
    response = await client.post("/api/v1/auth/demo-login", json={})

    assert_error(response, 400, "VALIDATION_ERROR")


async def test_demo_login_is_public(client):
    response = await client.post(
        "/api/v1/auth/demo-login", json={"provider": "google"}, headers={"Authorization": "Bearer junk"}
    )

    assert response.status_code == 200
