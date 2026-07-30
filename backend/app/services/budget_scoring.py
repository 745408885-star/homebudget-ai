from app.models import (
    BudgetItem,
    CityFactorData,
    CookingFrequency,
    DemandLevel,
    UserInput,
)
from app.services.budget_engine_rules import (
    CATEGORY_HEALTH,
    CATEGORY_LIFECYCLE,
    ENTERTAINMENT_CODES,
    HEALTH_OVERRIDES,
    KITCHEN_CODES,
    REDUCTION_GROUPS,
    REDUCTION_LABELS,
    SLEEP_CODES,
    STORAGE_CODES,
)
from app.services.budget_engine_types import ScoredItem


def score_item(
    item: BudgetItem,
    user_input: UserInput,
    city_factor: CityFactorData,
) -> ScoredItem:
    preference_score, preference_notes = preference_score_for(item, user_input)
    frequency_score = frequency_score_for(item, user_input)
    health_score = HEALTH_OVERRIDES.get(
        item.code,
        CATEGORY_HEALTH[item.category],
    )
    lifecycle_score = CATEGORY_LIFECYCLE[item.category]
    value_score = round(
        frequency_score * 0.30
        + health_score * 0.30
        + lifecycle_score * 0.25
        + preference_score * 0.15,
        2,
    )

    if item.code == "project_contingency":
        raw_target = max(
            item.recommended_budget,
            round(user_input.total_budget * 0.08),
        )
    else:
        preference_multiplier = 1 + (preference_score - item.weight) * 0.05
        raw_target = round(
            item.recommended_budget
            * environment_multiplier(item, user_input, city_factor)
            * preference_multiplier
        )

    target_amount = max(
        item.minimum_budget,
        min(item.maximum_budget, raw_target),
    )
    return ScoredItem(
        item=item,
        value_score=value_score,
        target_amount=target_amount,
        current_amount=target_amount,
        reason=build_reason(item, preference_notes),
    )


def preference_score_for(
    item: BudgetItem,
    user_input: UserInput,
) -> tuple[float, list[str]]:
    score = float(item.weight)
    notes: list[str] = []

    if item.code in SLEEP_CODES:
        if user_input.sleep_demand == DemandLevel.HIGH:
            score += 2
            notes.append("高睡眠需求")
        elif user_input.sleep_demand == DemandLevel.LOW:
            score -= 1

    if item.code in KITCHEN_CODES:
        if user_input.cooking_frequency == CookingFrequency.DAILY:
            score += 2
            notes.append("每天做饭")
        elif user_input.cooking_frequency == CookingFrequency.OFTEN:
            score += 1
            notes.append("高频做饭")
        elif user_input.cooking_frequency == CookingFrequency.RARELY:
            score -= 1

    if item.code in STORAGE_CODES:
        if user_input.storage_demand == DemandLevel.HIGH:
            score += 2
            notes.append("高收纳需求")
        elif user_input.storage_demand == DemandLevel.LOW:
            score -= 1

    if item.code in ENTERTAINMENT_CODES:
        if user_input.entertainment_demand == DemandLevel.HIGH:
            score += 2
            notes.append("高娱乐需求")
        elif user_input.entertainment_demand == DemandLevel.LOW:
            score -= 1

    if user_input.resident_count >= 4 and item.code in {
        "wardrobes",
        "custom_storage",
        "refrigerator",
        "laundry_appliances",
    }:
        score += 1
        notes.append("多人居住")

    for reduction in user_input.willing_to_reduce:
        if item.code in REDUCTION_GROUPS[reduction]:
            score -= 2
            notes.append(f"愿意降低{REDUCTION_LABELS[reduction]}")

    return max(1, min(10, score)), notes


def frequency_score_for(item: BudgetItem, user_input: UserInput) -> float:
    score = float(item.weight)
    if (
        item.code in KITCHEN_CODES
        and user_input.cooking_frequency == CookingFrequency.DAILY
    ):
        score += 1
    if (
        item.code in ENTERTAINMENT_CODES
        and user_input.entertainment_demand == DemandLevel.HIGH
    ):
        score += 1
    if user_input.resident_count >= 4 and item.code in {
        "sanitary_ware",
        "refrigerator",
        "laundry_appliances",
        "dining_set",
    }:
        score += 1
    return max(1, min(10, score))


def environment_multiplier(
    item: BudgetItem,
    user_input: UserInput,
    city_factor: CityFactorData,
) -> float:
    if item.category in {"基础施工", "水电工程", "厨房卫浴"}:
        area_multiplier = max(
            0.85,
            min(1.30, 0.75 + 0.25 * user_input.area / 100),
        )
        city_multiplier = (
            city_factor.labor_factor * 0.60 + city_factor.material_factor * 0.40
        )
    elif item.category == "全屋定制":
        area_multiplier = max(
            0.90,
            min(1.20, 0.85 + 0.15 * user_input.area / 100),
        )
        city_multiplier = city_factor.custom_factor
    elif item.category in {"家具", "软装"}:
        area_multiplier = max(
            0.90,
            min(1.20, 0.85 + 0.15 * user_input.area / 100),
        )
        city_multiplier = city_factor.material_factor
    elif item.category == "家电":
        area_multiplier = 1.0
        city_multiplier = city_factor.material_factor
    else:
        area_multiplier = 1.0
        city_multiplier = 1.0

    return area_multiplier * city_multiplier


def build_reason(item: BudgetItem, preference_notes: list[str]) -> str:
    if preference_notes:
        return f"{'、'.join(preference_notes)}；结合使用频率、健康影响和使用寿命计算"
    if item.category in {"基础施工", "水电工程"}:
        return "隐蔽或基础工程返工成本高，优先保护施工质量"
    if item.code in {"mattress", "bed_frame"}:
        return "属于高频且健康相关项目，优先保证基本品质"
    if item.code in {
        "decorative_accessories",
        "home_entertainment",
        "smart_home_devices",
    }:
        return "不影响基础居住功能，预算不足时可优先削减"
    return "根据使用频率、健康影响、使用寿命和用户偏好综合计算"
