from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.v2.common import (
    BudgetMode,
    FlexibilityLevel,
    ItemSelectionStatus,
    OwnedItemCondition,
)
from app.schemas.v2.pricing import CityPriceContext


class RoomAssignment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    room_id: str | None = None
    room_name: str
    quantity: int = Field(gt=0)


class BudgetResultItemV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str
    name: str
    category: str
    status: ItemSelectionStatus
    quantity: int = Field(ge=0)
    specification_label: str
    current_budget: int = Field(ge=0)
    recommended_range_min: int = Field(ge=0)
    recommended_range_max: int = Field(ge=0)
    value_score: float = Field(ge=0, le=10)
    flexibility_level: FlexibilityLevel
    room_assignments: list[RoomAssignment]
    explanation: str
    warning: str | None = None
    installation_note: str | None = None


class CategorySummaryV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str
    item_count: int = Field(ge=0)
    allocated_budget: int = Field(ge=0)
    percentage: float = Field(ge=0, le=100)


class ExcludedItemV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str
    name: str
    reason: str


class OwnedItemResultV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str
    name: str
    quantity: int = Field(gt=0)
    condition: OwnedItemCondition


class DeferredItemV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str
    name: str
    reason: str


class BudgetResultV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_id: str | None = None
    budget_mode: BudgetMode
    total_budget: int = Field(gt=0)
    allocated_budget: int = Field(ge=0)
    unallocated_budget: int = Field(ge=0)
    upgrade_budget: int = Field(ge=0)
    reserve_budget: int = Field(ge=0)
    category_summaries: list[CategorySummaryV2]
    items: list[BudgetResultItemV2]
    optimization_warnings: list[str] = Field(default_factory=list)
    excluded_items: list[ExcludedItemV2] = Field(default_factory=list)
    owned_items: list[OwnedItemResultV2] = Field(default_factory=list)
    deferred_items: list[DeferredItemV2] = Field(default_factory=list)
    city_price_context: CityPriceContext
    rule_version: str
    engine_version: str

    @model_validator(mode="after")
    def validate_budget_conservation(self) -> "BudgetResultV2":
        accounted_budget = (
            self.allocated_budget
            + self.unallocated_budget
            + self.upgrade_budget
            + self.reserve_budget
        )
        if accounted_budget != self.total_budget:
            raise ValueError("采购、升级、备用和未分配金额之和必须等于 total_budget")
        item_total = sum(item.current_budget for item in self.items)
        if item_total != self.allocated_budget:
            raise ValueError("有效采购项目金额合计必须等于 allocated_budget")
        if self.budget_mode == BudgetMode.CEILING and (
            self.upgrade_budget != 0 or self.reserve_budget != 0
        ):
            raise ValueError("ceiling 模式的 upgrade_budget/reserve_budget 必须为0")
        if (
            self.budget_mode == BudgetMode.FULL_ALLOCATION
            and self.unallocated_budget != 0
        ):
            raise ValueError("full_allocation 模式必须明确分配全部预算")
        return self
