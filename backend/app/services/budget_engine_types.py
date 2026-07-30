from dataclasses import dataclass

from app.models import BudgetItem


class BudgetConstraintError(ValueError):
    """Raised when a total budget is outside the configured rule bounds."""


@dataclass
class ScoredItem:
    item: BudgetItem
    value_score: float
    target_amount: int
    current_amount: int
    reason: str
