from app.models import BudgetPlan, BudgetPlanItem, UserInput
from app.services.budget_engine_rules import REDUCTION_LABELS
from app.services.budget_engine_types import ScoredItem


def build_plan(scored_items: list[ScoredItem]) -> BudgetPlan:
    total_amount = sum(item.current_amount for item in scored_items)
    items = [
        BudgetPlanItem(
            id=scored.item.id,
            code=scored.item.code,
            name=scored.item.name,
            category=scored.item.category,
            amount=scored.current_amount,
            percentage=round(
                scored.current_amount / total_amount * 100,
                2,
            ),
            minimum_budget=scored.item.minimum_budget,
            recommended_budget=scored.item.recommended_budget,
            maximum_budget=scored.item.maximum_budget,
            value_score=scored.value_score,
            reason=scored.reason,
        )
        for scored in scored_items
    ]
    return BudgetPlan(total_amount=total_amount, items=items)


def build_suggestions(
    user_input: UserInput,
    feasible: bool,
    target_total: int,
    reductions: list[tuple[str, int]],
) -> list[str]:
    suggestions: list[str] = []
    if feasible:
        extra = user_input.total_budget - target_total
        if extra:
            suggestions.append(
                f"预算覆盖规则建议目标，多出的 {extra} 元已优先加强高价值项目。"
            )
        else:
            suggestions.append("当前预算与规则建议目标一致。")
    else:
        shortfall = target_total - user_input.total_budget
        suggestions.append(
            f"当前预算比规则建议目标少 {shortfall} 元，已按价值分从低到高优化。"
        )
        reduced = sorted(
            reductions,
            key=lambda item: item[1],
            reverse=True,
        )[:3]
        if reduced:
            suggestions.append(
                "主要优化项目："
                + "、".join(f"{name}减少{amount}元" for name, amount in reduced)
                + "。"
            )

    if user_input.willing_to_reduce:
        labels = [REDUCTION_LABELS[item] for item in user_input.willing_to_reduce]
        suggestions.append(f"已按你的选择优先降低：{'、'.join(labels)}。")
    return suggestions


def build_warnings(
    user_input: UserInput,
    feasible: bool,
    target_total: int,
    minimum_total: int,
    scored_items: list[ScoredItem],
    used_default_city_factor: bool,
) -> list[str]:
    warnings: list[str] = []
    if used_default_city_factor:
        warnings.append(
            f"暂未配置“{user_input.city}”城市系数，本次使用全国默认价格系数。"
        )
    if not feasible:
        warnings.append(
            f"预算低于规则建议目标 {target_total} 元，部分低价值项目已压缩。"
        )

    minimum_items = [
        item.item.name
        for item in scored_items
        if item.current_amount == item.item.minimum_budget
        and item.target_amount > item.current_amount
    ]
    if minimum_items:
        visible = "、".join(minimum_items[:5])
        suffix = "等项目" if len(minimum_items) > 5 else ""
        warnings.append(f"{visible}{suffix}已达到最低预算，不建议继续削减。")

    if user_input.total_budget <= round(minimum_total * 1.10):
        warnings.append("当前总预算接近绝对最低可执行值，现场增项风险较高。")
    return warnings
