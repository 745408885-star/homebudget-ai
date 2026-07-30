from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BudgetCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    code: str
    name: str
    description: str


class BudgetItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    code: str
    name: str
    category: str
    minimum_budget: int = Field(ge=0, description="最低预算，单位：元")
    recommended_budget: int = Field(ge=0, description="建议预算，单位：元")
    maximum_budget: int = Field(ge=0, description="最高预算，单位：元")
    weight: int = Field(ge=1, le=10, description="分配权重，1-10")
    priority: int = Field(ge=1, le=5, description="优先级，1 为最高")
    description: str

    @model_validator(mode="after")
    def validate_budget_range(self) -> "BudgetItem":
        if not (self.minimum_budget <= self.recommended_budget <= self.maximum_budget):
            raise ValueError(
                "预算必须满足 minimum_budget <= recommended_budget <= maximum_budget"
            )
        return self


class ElderlyChildrenStatus(StrEnum):
    NONE = "none"
    ELDERLY = "elderly"
    CHILDREN = "children"
    BOTH = "both"


class CookingFrequency(StrEnum):
    RARELY = "rarely"
    SOMETIMES = "sometimes"
    OFTEN = "often"
    DAILY = "daily"


class DemandLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReductionPreference(StrEnum):
    AESTHETICS = "aesthetics"
    ENTERTAINMENT = "entertainment"
    STORAGE = "storage"
    COMFORT = "comfort"
    SMART_HOME = "smart_home"


class UserInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    area: float = Field(gt=0, description="房屋建筑面积，单位：平方米")
    city: str = Field(min_length=1, description="房屋所在城市")
    house_type: str = Field(min_length=1, description="户型，例如三室两厅")
    total_budget: int = Field(gt=0, description="装修总预算，单位：元")
    resident_count: int = Field(gt=0, description="常住人数")
    elderly_children_status: ElderlyChildrenStatus = ElderlyChildrenStatus.NONE
    cooking_frequency: CookingFrequency
    sleep_demand: DemandLevel
    storage_demand: DemandLevel
    entertainment_demand: DemandLevel
    renovation_goal: str = Field(min_length=1, description="本次装修的主要目标")
    willing_to_reduce: list[ReductionPreference] = Field(
        default_factory=list,
        description="用户明确愿意降低的需求维度",
    )


# 保留上一阶段的名称，避免后续调用方立即失效。
UserBudgetInput = UserInput


class BudgetPlanItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    code: str
    name: str
    category: str
    amount: int
    percentage: float
    minimum_budget: int
    recommended_budget: int
    maximum_budget: int
    value_score: float
    reason: str


class BudgetPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_amount: int
    items: list[BudgetPlanItem]


class CityFactorData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city_name: str
    labor_factor: float = Field(gt=0)
    material_factor: float = Field(gt=0)
    custom_factor: float = Field(gt=0)


class BudgetResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_id: str | None = None
    feasible: bool
    city_factor: CityFactorData
    used_default_city_factor: bool
    current_plan: BudgetPlan
    optimization_suggestions: list[str]
    optimization_warnings: list[str]


class BudgetRuleSet(BaseModel):
    model_config = ConfigDict(extra="forbid")

    categories: list[BudgetCategory]
    items: list[BudgetItem]

    @model_validator(mode="after")
    def validate_rule_set(self) -> "BudgetRuleSet":
        category_names = {category.name for category in self.categories}
        category_ids = [category.id for category in self.categories]
        category_codes = [category.code for category in self.categories]
        item_ids = [item.id for item in self.items]
        item_codes = [item.code for item in self.items]

        if len(category_ids) != len(set(category_ids)):
            raise ValueError("预算分类 id 不能重复")
        if len(category_codes) != len(set(category_codes)):
            raise ValueError("预算分类 code 不能重复")
        if len(item_ids) != len(set(item_ids)):
            raise ValueError("预算项目 id 不能重复")
        if len(item_codes) != len(set(item_codes)):
            raise ValueError("预算项目 code 不能重复")

        unknown_categories = {
            item.category for item in self.items if item.category not in category_names
        }
        if unknown_categories:
            raise ValueError(
                f"预算项目引用了不存在的分类：{sorted(unknown_categories)}"
            )

        return self
