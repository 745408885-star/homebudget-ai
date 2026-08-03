import asyncio
import os
from collections.abc import Generator, Iterator

import httpx
import pytest
from sqlalchemy import Engine, create_engine, func, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import BudgetItem, BudgetPlan, CityFactor, User, UserRequirement
from app.db.seed import seed_database
from app.db.session import get_db
from app.main import app

pytestmark = pytest.mark.integration
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "").strip()


@pytest.fixture(scope="module")
def integration_engine() -> Iterator[Engine]:
    if not TEST_DATABASE_URL:
        pytest.skip("TEST_DATABASE_URL 未设置")

    test_engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    Base.metadata.create_all(test_engine)
    try:
        yield test_engine
    finally:
        Base.metadata.drop_all(test_engine)
        test_engine.dispose()


@pytest.fixture
def db(integration_engine: Engine) -> Iterator[Session]:
    with integration_engine.connect() as connection:
        transaction = connection.begin()
        with Session(
            bind=connection,
            autoflush=False,
            expire_on_commit=False,
            join_transaction_mode="create_savepoint",
        ) as session:
            yield session
        transaction.rollback()


def test_seed_is_idempotent_and_creates_reference_data(db: Session) -> None:
    seed_database(db)
    seed_database(db)

    assert db.scalar(select(func.count()).select_from(BudgetItem)) == 27
    assert db.scalar(select(func.count()).select_from(CityFactor)) == 13


def test_calculate_api_persists_only_inside_rolled_back_transaction(
    db: Session,
) -> None:
    seed_database(db)

    def override_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_db

    async def send_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            return await client.post(
                "/api/budget/calculate",
                json={
                    "city": "杭州",
                    "area": 100,
                    "house_type": "三室两厅",
                    "total_budget": 280000,
                    "resident_count": 3,
                    "cooking_frequency": "daily",
                    "sleep_demand": "high",
                    "storage_demand": "medium",
                    "entertainment_demand": "low",
                    "renovation_goal": "实用耐用",
                },
            )

    try:
        response = asyncio.run(send_request())
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert db.scalar(select(func.count()).select_from(User)) == 1
    assert db.scalar(select(func.count()).select_from(UserRequirement)) == 1
    assert db.scalar(select(func.count()).select_from(BudgetPlan)) == 1
