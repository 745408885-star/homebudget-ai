import asyncio
from collections.abc import Generator
from pathlib import Path
from unittest.mock import Mock

import httpx
import pytest
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.routes import budget as budget_routes
from app.db.session import get_db
from app.main import app
from app.models import (
    BudgetPlanItem,
    BudgetResult,
    BudgetRuleSet,
    CityFactorData,
    UserInput,
)
from app.services.budget_engine import BudgetEngine

pytestmark = pytest.mark.unit

RULES_PATH = Path(__file__).resolve().parents[1] / "data" / "budget_rules.json"
BUDGET_ITEMS = BudgetRuleSet.model_validate_json(
    RULES_PATH.read_text(encoding="utf-8")
).items
CITY_FACTORS = {
    "全国默认": CityFactorData(
        city_name="全国默认",
        labor_factor=1,
        material_factor=1,
        custom_factor=1,
    ),
    "上海": CityFactorData(
        city_name="上海",
        labor_factor=1.2,
        material_factor=1.1,
        custom_factor=1.15,
    ),
    "杭州": CityFactorData(
        city_name="杭州",
        labor_factor=1.12,
        material_factor=1.06,
        custom_factor=1.1,
    ),
}


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


def city_factor(city: str) -> tuple[CityFactorData, bool]:
    factor = CITY_FACTORS.get(city)
    return (factor, False) if factor else (CITY_FACTORS["全国默认"], True)


def make_engine(city: str = "上海") -> BudgetEngine:
    factor, used_default = city_factor(city)
    return BudgetEngine(
        items=BUDGET_ITEMS,
        city_factor=factor,
        used_default_city_factor=used_default,
    )


def plan_item(result: BudgetResult, code: str) -> BudgetPlanItem:
    return next(item for item in result.current_plan.items if item.code == code)


def assert_plan_constraints(result: BudgetResult, total_budget: int) -> None:
    plan = result.current_plan
    assert plan.total_amount == total_budget
    assert len(plan.items) == 27
    assert sum(item.amount for item in plan.items) == total_budget
    for item in plan.items:
        assert item.minimum_budget <= item.amount <= item.maximum_budget


def test_low_budget_small_home() -> None:
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
    result = make_engine(city=user_input.city).calculate(user_input)

    assert result.feasible is False
    assert result.optimization_warnings
    assert any("全国默认" in warning for warning in result.optimization_warnings)
    assert plan_item(result, "decorative_accessories").amount == 1000
    assert plan_item(result, "smart_home_devices").amount == 1000
    assert plan_item(result, "waterproofing").amount > 3000
    assert_plan_constraints(result, user_input.total_budget)


def test_normal_family_returns_single_plan() -> None:
    result = make_engine().calculate(make_input())
    payload = result.model_dump()

    assert result.feasible is True
    assert "ideal_plan" not in payload
    assert "difference_analysis" not in payload
    assert "optimization_warnings" in payload
    assert payload["city_factor"]["city_name"] == "上海"
    assert payload["used_default_city_factor"] is False
    assert_plan_constraints(result, 320000)


def test_high_budget_improvement_home() -> None:
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
    result = make_engine(city=user_input.city).calculate(user_input)

    assert result.feasible is True
    assert_plan_constraints(result, user_input.total_budget)


def test_daily_cooking_changes_kitchen_priority() -> None:
    daily = make_engine().calculate(
        make_input(total_budget=260000, cooking_frequency="daily")
    )
    rarely = make_engine().calculate(
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


def test_high_sleep_demand_changes_sleep_priority() -> None:
    high = make_engine().calculate(make_input(total_budget=260000, sleep_demand="high"))
    low = make_engine().calculate(make_input(total_budget=260000, sleep_demand="low"))

    assert (
        plan_item(high, "mattress").value_score > plan_item(low, "mattress").value_score
    )
    assert plan_item(high, "bed_frame").amount >= plan_item(low, "bed_frame").amount
    assert_plan_constraints(high, 260000)


def test_city_factor_changes_allocation() -> None:
    shanghai = make_engine("上海").calculate(
        make_input(city="上海", total_budget=260000)
    )
    default = make_engine("合肥").calculate(
        make_input(city="合肥", total_budget=260000)
    )

    assert (
        plan_item(shanghai, "masonry_tiling").amount
        >= plan_item(default, "masonry_tiling").amount
    )
    assert any("全国默认" in warning for warning in default.optimization_warnings)


def test_calculate_api_contract_without_database_write(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database_session = Mock(spec=Session)

    def override_db() -> Generator[Session, None, None]:
        yield database_session

    monkeypatch.setattr(
        budget_routes,
        "require_budget_items",
        lambda _db: BUDGET_ITEMS,
    )
    monkeypatch.setattr(
        budget_routes,
        "get_city_factor",
        lambda _db, city: city_factor(city),
    )
    monkeypatch.setattr(
        budget_routes,
        "save_budget_calculation",
        lambda **_kwargs: "unit-test-plan-id",
    )
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
    assert body["plan_id"] == "unit-test-plan-id"
    assert body["current_plan"]["total_amount"] == 320000
    assert len(body["current_plan"]["items"]) == 27
    assert sum(item["amount"] for item in body["current_plan"]["items"]) == 320000
    assert "ideal_plan" not in body
    assert "difference_analysis" not in body
    assert "optimization_warnings" in body
    assert body["city_factor"]["city_name"] == "上海"
    assert body["used_default_city_factor"] is False


def test_calculate_api_hides_internal_database_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database_session = Mock(spec=Session)

    def override_db() -> Generator[Session, None, None]:
        yield database_session

    def fail_to_load_items(_db: Session) -> list[object]:
        raise SQLAlchemyError(
            "postgresql://internal-user:internal-password@private-host/database"
        )

    monkeypatch.setattr(budget_routes, "require_budget_items", fail_to_load_items)
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

    assert response.status_code == 503
    assert response.json() == {"detail": "数据库暂时不可用，请稍后重试。"}
    assert "internal-password" not in response.text
    database_session.rollback.assert_called_once_with()
