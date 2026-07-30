from app.models import (
    BudgetItem,
    BudgetResult,
    CityFactorData,
    UserInput,
)
from app.services.budget_allocation import (
    increase_to_budget,
    reduce_to_budget,
)
from app.services.budget_engine_types import (
    BudgetConstraintError,
    ScoredItem,
)
from app.services.budget_reporting import (
    build_plan,
    build_suggestions,
    build_warnings,
)
from app.services.budget_scoring import score_item

__all__ = ["BudgetConstraintError", "BudgetEngine", "ScoredItem"]


class BudgetEngine:
    """Orchestrate the stable V1 scoring and allocation workflow."""

    def __init__(
        self,
        items: list[BudgetItem],
        city_factor: CityFactorData,
        used_default_city_factor: bool = False,
    ) -> None:
        if not items:
            raise ValueError("预算项目不能为空")
        self.items = items
        self.city_factor = city_factor
        self.used_default_city_factor = used_default_city_factor

    def calculate(self, user_input: UserInput) -> BudgetResult:
        scored_items = [
            score_item(item, user_input, self.city_factor) for item in self.items
        ]
        target_total = sum(item.target_amount for item in scored_items)
        minimum_total = sum(item.item.minimum_budget for item in scored_items)
        maximum_total = sum(item.item.maximum_budget for item in scored_items)
        self._validate_budget_bounds(
            user_input.total_budget,
            minimum_total,
            maximum_total,
        )

        feasible = user_input.total_budget >= target_total
        self._allocate_total(scored_items, user_input.total_budget, target_total)
        self._validate_conservation(scored_items, user_input.total_budget)

        reductions = [
            (item.item.name, item.target_amount - item.current_amount)
            for item in scored_items
            if item.current_amount < item.target_amount
        ]
        return BudgetResult(
            feasible=feasible,
            city_factor=self.city_factor,
            used_default_city_factor=self.used_default_city_factor,
            current_plan=build_plan(scored_items),
            optimization_suggestions=build_suggestions(
                user_input=user_input,
                feasible=feasible,
                target_total=target_total,
                reductions=reductions,
            ),
            optimization_warnings=build_warnings(
                user_input=user_input,
                feasible=feasible,
                target_total=target_total,
                minimum_total=minimum_total,
                scored_items=scored_items,
                used_default_city_factor=self.used_default_city_factor,
            ),
        )

    @staticmethod
    def _validate_budget_bounds(
        total_budget: int,
        minimum_total: int,
        maximum_total: int,
    ) -> None:
        if total_budget < minimum_total:
            raise BudgetConstraintError(
                f"总预算 {total_budget} 元低于全部项目最低可执行预算 {minimum_total} 元"
            )
        if total_budget > maximum_total:
            raise BudgetConstraintError(
                f"总预算 {total_budget} 元超过当前规则可分配上限 {maximum_total} 元"
            )

    @staticmethod
    def _allocate_total(
        scored_items: list[ScoredItem],
        total_budget: int,
        target_total: int,
    ) -> None:
        if total_budget < target_total:
            reduce_to_budget(scored_items, total_budget)
        elif total_budget > target_total:
            increase_to_budget(scored_items, total_budget)

    @staticmethod
    def _validate_conservation(
        scored_items: list[ScoredItem],
        total_budget: int,
    ) -> None:
        current_total = sum(item.current_amount for item in scored_items)
        if current_total != total_budget:
            raise RuntimeError(f"预算尾差修正失败：{current_total} != {total_budget}")
