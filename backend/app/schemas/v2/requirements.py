from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import CookingFrequency, DemandLevel
from app.schemas.v2.common import BrandPreference, BudgetMode, UsageType
from app.schemas.v2.items import OwnedItem, UserItemPreference
from app.schemas.v2.rooms import Room


class UserInputV2(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city: str = Field(min_length=1)
    area: float = Field(gt=0)
    house_type: str = Field(min_length=1)
    bedroom_count: int = Field(ge=0)
    living_room_count: int = Field(ge=0)
    bathroom_count: int = Field(ge=0)
    kitchen_count: int = Field(ge=0)
    balcony_count: int = Field(ge=0)
    resident_count: int = Field(gt=0)
    adult_count: int = Field(ge=0)
    child_count: int = Field(ge=0)
    elderly_count: int = Field(ge=0)
    expected_years: int = Field(gt=0)
    usage_type: UsageType
    cooking_frequency: CookingFrequency
    sleep_demand: DemandLevel
    storage_demand: DemandLevel
    entertainment_demand: DemandLevel
    smart_home_demand: DemandLevel
    appearance_demand: DemandLevel
    energy_saving_demand: DemandLevel
    durability_demand: DemandLevel
    quietness_demand: DemandLevel
    brand_preference: BrandPreference
    accepts_budget_brands: bool
    owned_items: list[OwnedItem] = Field(default_factory=list)
    item_preferences: list[UserItemPreference] = Field(default_factory=list)
    rooms: list[Room] = Field(default_factory=list)
    total_budget: int = Field(gt=0)
    budget_mode: BudgetMode = BudgetMode.CEILING
    upgrade_item_codes: list[str] = Field(default_factory=list)
    quality_upgrade_modules: list[str] = Field(default_factory=list)
    upgrade_budget_target: int = Field(default=0, ge=0)
    reserve_budget_target: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_household_counts(self) -> "UserInputV2":
        member_total = self.adult_count + self.child_count + self.elderly_count
        if member_total != self.resident_count:
            raise ValueError(
                "adult_count + child_count + elderly_count 必须等于 resident_count"
            )
        preference_codes = [
            preference.item_code for preference in self.item_preferences
        ]
        if len(preference_codes) != len(set(preference_codes)):
            raise ValueError("同一 item_code 只能有一个明确选择")
        if self.budget_mode == BudgetMode.CEILING and (
            self.upgrade_item_codes
            or self.quality_upgrade_modules
            or self.upgrade_budget_target
            or self.reserve_budget_target
        ):
            raise ValueError("ceiling 模式不能预分配升级或备用资金")
        if self.upgrade_budget_target + self.reserve_budget_target > self.total_budget:
            raise ValueError("升级和备用资金目标之和不能超过 total_budget")
        return self
