"""Budget Engine V2 interface only.

Phase 6A batch 1 defines the dependency boundary and calculation contract.
The allocation implementation will be added only after product review.
"""

from abc import ABC, abstractmethod
from collections.abc import Sequence

from app.models_v2 import (
    BudgetResultV2,
    CityPriceContext,
    ProcurementItemRule,
    UserInputV2,
)


class BudgetEngineV2(ABC):
    engine_version = "2.0-design"

    def __init__(
        self,
        rules: Sequence[ProcurementItemRule],
        city_price_context: CityPriceContext,
    ) -> None:
        self.rules = tuple(rules)
        self.city_price_context = city_price_context

    @abstractmethod
    def calculate(self, user_input: UserInputV2) -> BudgetResultV2:
        """Generate one explainable, budget-conserving procurement plan."""
        raise NotImplementedError
