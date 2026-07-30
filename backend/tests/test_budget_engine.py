import asyncio
from collections.abc import Generator

import httpx
import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.models import (
    BudgetItem as BudgetItemRecord,
)
from app.db.models import (
    BudgetPlan as BudgetPlanRecord,
)
from app.db.models import (
    CityFactor as CityFactorRecord,
)
from app.db.models import (
    User,
    UserRequirement,
)
from app.db.seed import seed_database
from app.db.session import get_db
from app.main import app
from app.models import UserInput
from app.repositories.budget_repository import (
    get_city_factor,
    list_budget_items,
)
from app.services.budget_engine import BudgetEngine


@pytest.fixture
def db() -> Generator[Session, None, None]:
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(test_engine)
    TestSession = sessionmaker(
        bind=test_engine,
        autoflush=False,
        expire_on_commit=False,
    )
    with TestSession() as session:
        seed_database(session)
        yield session
    Base.metadata.drop_all(test_engine)
    test_engine.dispose()


def make_input(**overrides: object) -> UserInput:
    data: dict[str, object] = {
        "area": 100,
        "city": "上海",
        "house_type": "三室两厅",
        "total_budget": 320000,
        "resident_count": 3,
        "cooking_frequency": "often",
        "sleep_demand": "medium",
        "storage_demand": "medium",
        "entertainment_demand": "medium",
        "renovation_goal": "实用耐用",
    }
    data.update(overrides)
    return UserInput.model_validate(data)


def make_engine(
    db: Session,
    city: str = "上海",
) -> BudgetEngine:
    city_factor, used_default = get_city_factor(db, city)
    return BudgetEngine(
        items=list_budget_items(db),
        city_factor=city_factor,
        used_default_city_factor=used_default,
    )


def plan_item(result: object, code: str) -> object:
    plan = result.current_plan
    return next(item for item in plan.items if item.code == code)


def assert_plan_constraints(result: object, total_budget: int) -> None:
    plan = result.current_plan
    assert plan.total_amount == total_budget
    assert sum(item.amount for item in plan.items) == total_budget
    for item in plan.items:
        assert item.minimum_budget <= item.amount <= item.maximum_budget


def test_seed_is_idempotent_and_creates_database_rules(db: Session) -> None:
    seed_database(db)

    assert db.scalar(select(func.count()).select_from(BudgetItemRecord)) == 27
    assert db.scalar(select(func.count()).select_from(CityFactorRecord)) == 13
    assert list_budget_items(db)[0].code == "demolition"


def test_low_budget_small_home(db: Session) -> None:
    user_input = make_input(
        area=55,
        city="合肥",
        house_type="两室一厅",
        total_budget=130000,
        resident_count=2,
        cooking_frequency="rarely",
        sleep_demand="low",
        storage_demand="low",
        entertainment_demand="low",
        willing_to_reduce=["aesthetics", "entertainment", "smart_home"],
    )
    result = make_engine(db, city=user_input.city).calculate(user_input)

    assert result.feasible is False
    assert result.optimization_warnings
    assert any("全国默认" in warning for warning in result.optimization_warnings)
    assert plan_item(result, "decorative_accessories").amount == 1000
    assert plan_item(result, "smart_home_devices").amount == 1000
    assert plan_item(result, "waterproofing").amount > 3000
    assert_plan_constraints(result, user_input.total_budget)


def test_normal_family_returns_single_plan(db: Session) -> None:
    result = make_engine(db).calculate(make_input())
    payload = result.model_dump()

    assert result.feasible is True
    assert "ideal_plan" not in payload
    assert "difference_analysis" not in payload
    assert "optimization_warnings" in payload
    assert payload["city_factor"]["city_name"] == "上海"
    assert payload["used_default_city_factor"] is False
    assert_plan_constraints(result, 320000)


def test_high_budget_improvement_home(db: Session) -> None:
    user_input = make_input(
        area=140,
        city="杭州",
        house_type="四室两厅",
        total_budget=500000,
        resident_count=4,
        cooking_frequency="often",
        sleep_demand="high",
        storage_demand="high",
        entertainment_demand="high",
        renovation_goal="改善型品质居住",
    )
    result = make_engine(db, city=user_input.city).calculate(user_input)

    assert result.feasible is True
    assert_plan_constraints(result, user_input.total_budget)


def test_daily_cooking_changes_kitchen_priority(db: Session) -> None:
    daily = make_engine(db).calculate(
        make_input(total_budget=260000, cooking_frequency="daily")
    )
    rarely = make_engine(db).calculate(
        make_input(total_budget=260000, cooking_frequency="rarely")
    )

    assert (
        plan_item(daily, "cooking_appliances").value_score
        > plan_item(rarely, "cooking_appliances").value_score
    )
    assert (
        plan_item(daily, "kitchen_cabinets").amount
        >= plan_item(rarely, "kitchen_cabinets").amount
    )
    assert_plan_constraints(daily, 260000)


def test_high_sleep_demand_changes_sleep_priority(db: Session) -> None:
    high = make_engine(db).calculate(
        make_input(total_budget=260000, sleep_demand="high")
    )
    low = make_engine(db).calculate(make_input(total_budget=260000, sleep_demand="low"))

    assert (
        plan_item(high, "mattress").value_score > plan_item(low, "mattress").value_score
    )
    assert plan_item(high, "bed_frame").amount >= plan_item(low, "bed_frame").amount
    assert_plan_constraints(high, 260000)


def test_city_factor_changes_allocation(db: Session) -> None:
    shanghai = make_engine(db, "上海").calculate(
        make_input(city="上海", total_budget=260000)
    )
    default = make_engine(db, "合肥").calculate(
        make_input(city="合肥", total_budget=260000)
    )

    assert (
        plan_item(shanghai, "masonry_tiling").amount
        >= plan_item(default, "masonry_tiling").amount
    )
    assert any("全国默认" in warning for warning in default.optimization_warnings)


def test_calculate_api_reads_and_persists_database(db: Session) -> None:
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
                json=make_input(total_budget=320000).model_dump(mode="json"),
            )

    try:
        response = asyncio.run(send_request())
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["plan_id"]
    assert body["current_plan"]["total_amount"] == 320000
    assert "ideal_plan" not in body
    assert "optimization_warnings" in body
    assert body["city_factor"]["city_name"] == "上海"
    assert body["used_default_city_factor"] is False
    assert db.scalar(select(func.count()).select_from(User)) == 1
    assert db.scalar(select(func.count()).select_from(UserRequirement)) == 1
    assert db.scalar(select(func.count()).select_from(BudgetPlanRecord)) == 1
