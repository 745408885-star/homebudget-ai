import pytest

from app.main import app

pytestmark = pytest.mark.unit


def test_openapi_contains_core_routes_and_models() -> None:
    schema = app.openapi()

    assert {
        "/health",
        "/api/budget/categories",
        "/api/budget/items",
        "/api/budget/calculate",
    } <= set(schema["paths"])

    calculate = schema["paths"]["/api/budget/calculate"]["post"]
    request_schema = calculate["requestBody"]["content"]["application/json"]["schema"]
    response_schema = calculate["responses"]["200"]["content"]["application/json"][
        "schema"
    ]
    assert request_schema["$ref"].endswith("/UserInput")
    assert response_schema["$ref"].endswith("/BudgetResult")

    user_input = schema["components"]["schemas"]["UserInput"]
    assert {
        "area",
        "city",
        "house_type",
        "total_budget",
        "resident_count",
        "cooking_frequency",
        "sleep_demand",
        "storage_demand",
        "entertainment_demand",
        "renovation_goal",
    } <= set(user_input["properties"])

    budget_result = schema["components"]["schemas"]["BudgetResult"]
    assert {
        "feasible",
        "current_plan",
        "optimization_suggestions",
        "optimization_warnings",
        "city_factor",
    } <= set(budget_result["properties"])
    assert "ideal_plan" not in budget_result["properties"]
    assert "difference_analysis" not in budget_result["properties"]
