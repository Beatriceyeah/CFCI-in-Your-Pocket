from sqlalchemy import text


async def test_health_returns_envelope(client):
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"status": "ok"}, "error": None}


async def test_health_is_public(client):
    response = await client.get("/api/v1/health")

    assert response.status_code == 200


async def test_test_database_is_reachable(db_session):
    result = await db_session.execute(text("SELECT 1"))

    assert result.scalar_one() == 1
