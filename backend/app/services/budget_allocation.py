from app.services.budget_engine_types import BudgetConstraintError, ScoredItem


def reduce_to_budget(
    scored_items: list[ScoredItem],
    target_budget: int,
) -> None:
    remaining = sum(item.current_amount for item in scored_items) - target_budget
    reduction_order = sorted(
        scored_items,
        key=lambda scored: (
            scored.value_score,
            -scored.item.priority,
            scored.item.code,
        ),
    )
    for scored in reduction_order:
        available = scored.current_amount - scored.item.minimum_budget
        reduction = min(available, remaining)
        scored.current_amount -= reduction
        remaining -= reduction
        if remaining == 0:
            return
    raise BudgetConstraintError("总预算不足以覆盖所有项目最低预算")


def increase_to_budget(
    scored_items: list[ScoredItem],
    target_budget: int,
) -> None:
    remaining = target_budget - sum(item.current_amount for item in scored_items)
    increase_order = sorted(
        scored_items,
        key=lambda scored: (
            -scored.value_score,
            scored.item.priority,
            scored.item.code,
        ),
    )
    for scored in increase_order:
        available = scored.item.maximum_budget - scored.current_amount
        increase = min(available, remaining)
        scored.current_amount += increase
        remaining -= increase
        if remaining == 0:
            return
    raise BudgetConstraintError("总预算超过所有项目最高预算之和")
