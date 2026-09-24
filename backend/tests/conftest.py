import pytest
import asyncio
from starlette.testclient import TestClient
from main import app
from database import AsyncSessionLocal
from utils.seed import seed_database

@pytest.fixture(scope="module")
def client():
    # Seed test database for automated test suite
    async def _seed():
        async with AsyncSessionLocal() as session:
            await seed_database(session)
    asyncio.run(_seed())

    with TestClient(app) as c:
        yield c
