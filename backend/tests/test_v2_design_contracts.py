import json
from pathlib import Path
from typing import Any

import pytest
from pydantic import ValidationError

from app.domain.procurement_rules import load_procurement_rule_draft
from app.models_v2 import (
    BudgetMode,
    BudgetResultV2,
    ProcurementItemRule,
    UserInputV2,
)

BACKEND_ROOT = Path(__file__).resolve().parents[1]
RULES_PATH = BACKEND_ROOT / "data" / "procurement_rules_v1.draft.json"
SCENARIOS_PATH = Path(__file__).parent / "fixtures" / "v2_scenarios.json"

FORBIDDEN_HARD_FINISH_CODES = {
    "demolition",
    "masonry_tiling",
    "wall_ceiling_finish",
    "plumbing_electrical_rebuild",
    "waterproofing",
    "kitchen_cabinets",
    "sanitary_ware",
    "wardrobes",
    "custom_storage",
    "project_contingency",
}


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def contract_result_item(current_budget: int) -> dict[str, Any]:
    return {
        "item_code": "contract_item",
        "name": "契约测试项目",
        "category": "测试",
        "status": "need",
        "quantity": 1,
        "specification_label": "测试规格",
        "current_budget": current_budget,
        "recommended_range_min": current_budget,
        "recommended_range_max": current_budget,
        "value_score": 5,
        "flexibility_level": "medium",
        "room_assignments": [],
        "explanation": "仅用于验证预算恒等式",
    }


def test_v2_rule_draft_has_complete_active_procurement_scope() -> None:
    payload = load_procurement_rule_draft()
    rules = [ProcurementItemRule.model_validate(item) for item in payload["items"]]

    assert payload["status"] == "draft"
    assert (
        payload["legacy_catalog_policy"]["copy_all_existing_rules_as_inactive"] is True
    )
    assert set(payload["legacy_catalog_policy"]["hard_finish_codes"]) >= (
        FORBIDDEN_HARD_FINISH_CODES
    )
    assert len(rules) == 37
    assert len({rule.id for rule in rules}) == len(rules)
    assert len({rule.code for rule in rules}) == len(rules)
    assert {rule.category for rule in rules} == {
        "家具",
        "家电",
        "软装及入住",
        "智能设备",
    }
    assert not ({rule.code for rule in rules} & FORBIDDEN_HARD_FINISH_CODES)
    assert all(rule.active for rule in rules)
    assert all(rule.installation_type.value != "renovation_dependent" for rule in rules)


def test_modular_rule_files_preserve_reviewed_aggregate_exactly() -> None:
    assert load_procurement_rule_draft() == load_json(RULES_PATH)


def test_v2_scenarios_are_valid_and_reviewable() -> None:
    payload = load_json(SCENARIOS_PATH)
    scenarios = payload["scenarios"]

    assert len(scenarios) == 10
    assert len({scenario["id"] for scenario in scenarios}) == 10
    assert payload["detail_table_columns"] == [
        "item_code",
        "name",
        "status",
        "quantity",
        "specification_label",
        "recommended_range_min",
        "recommended_range_max",
        "current_budget",
        "room_assignments",
        "explanation",
    ]

    for scenario in scenarios:
        UserInputV2.model_validate(scenario["input"])
        assert scenario["expected"]["budget_conservation"] is True
        assert scenario["expected"]["emit_detail_table"] is True


def test_required_zero_budget_scenarios_are_explicit() -> None:
    scenarios = {
        scenario["id"]: scenario for scenario in load_json(SCENARIOS_PATH)["scenarios"]
    }

    assert (
        "television"
        in scenarios["S06_NO_TELEVISION"]["expected"]["excluded_zero_budget"]
    )
    assert (
        "washing_machine"
        in scenarios["S07_OWNS_WASHING_MACHINE"]["expected"]["owned_zero_budget"]
    )
    assert "dryer" in scenarios["S08_DRYER_LATER"]["expected"]["deferred_zero_budget"]
    assert scenarios["S10_STRICT_BUDGET_CONSERVATION"]["expected"] == {
        "budget_mode": "ceiling",
        "allocated_budget_lte_total": True,
        "budget_equation": (
            "allocated_budget + upgrade_budget + reserve_budget "
            "+ unallocated_budget = total_budget"
        ),
        "budget_conservation": True,
        "emit_detail_table": True,
    }


def test_budget_mode_c_contract_defaults_to_ceiling() -> None:
    scenario_input = load_json(SCENARIOS_PATH)["scenarios"][0]["input"]
    user_input = UserInputV2.model_validate(scenario_input)

    assert user_input.budget_mode is BudgetMode.CEILING
    assert user_input.upgrade_budget_target == 0
    assert user_input.reserve_budget_target == 0


def test_ceiling_rejects_upgrade_or_reserve_preallocation() -> None:
    scenario_input = {
        **load_json(SCENARIOS_PATH)["scenarios"][0]["input"],
        "reserve_budget_target": 10000,
    }

    with pytest.raises(ValidationError, match="ceiling 模式"):
        UserInputV2.model_validate(scenario_input)


def test_full_allocation_accepts_explicit_targets_within_total() -> None:
    scenario_input = {
        **load_json(SCENARIOS_PATH)["scenarios"][0]["input"],
        "budget_mode": "full_allocation",
        "upgrade_item_codes": ["mattress"],
        "upgrade_budget_target": 12000,
        "reserve_budget_target": 8000,
    }

    user_input = UserInputV2.model_validate(scenario_input)

    assert user_input.budget_mode is BudgetMode.FULL_ALLOCATION
    assert user_input.upgrade_budget_target == 12000
    assert user_input.reserve_budget_target == 8000


def test_ceiling_result_preserves_unallocated_budget() -> None:
    result = BudgetResultV2.model_validate(
        {
            "budget_mode": "ceiling",
            "total_budget": 200000,
            "allocated_budget": 176000,
            "unallocated_budget": 24000,
            "upgrade_budget": 0,
            "reserve_budget": 0,
            "category_summaries": [],
            "items": [contract_result_item(176000)],
            "optimization_warnings": [],
            "city_price_context": {
                "city_name": "杭州",
                "product_factor": 1,
                "delivery_factor": 1,
                "installation_factor": 1,
                "service_factor": 1,
                "source": "contract_test",
            },
            "rule_version": "draft",
            "engine_version": "2.0-design",
        }
    )

    assert result.allocated_budget < result.total_budget
    assert result.unallocated_budget == 24000


def test_full_allocation_result_rejects_unassigned_remainder() -> None:
    with pytest.raises(ValidationError, match="full_allocation"):
        BudgetResultV2.model_validate(
            {
                "budget_mode": "full_allocation",
                "total_budget": 200000,
                "allocated_budget": 176000,
                "unallocated_budget": 24000,
                "upgrade_budget": 0,
                "reserve_budget": 0,
                "category_summaries": [],
                "items": [contract_result_item(176000)],
                "optimization_warnings": [],
                "city_price_context": {
                    "city_name": "杭州",
                    "product_factor": 1,
                    "delivery_factor": 1,
                    "installation_factor": 1,
                    "service_factor": 1,
                    "source": "contract_test",
                },
                "rule_version": "draft",
                "engine_version": "2.0-design",
            }
        )
