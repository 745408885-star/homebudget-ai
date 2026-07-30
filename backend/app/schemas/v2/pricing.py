from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.v2.common import (
    InstallationType,
    PriceUnit,
    RequiredLevel,
    RoomType,
)


class ProcurementItemRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    code: str
    name: str
    category: str
    subcategory: str
    active: bool
    required_level: RequiredLevel
    installation_type: InstallationType
    room_types: list[RoomType]
    quantity_rule: dict[str, Any]
    minimum_quantity: int = Field(ge=0)
    maximum_quantity: int = Field(ge=0)
    base_min_price: int = Field(ge=0)
    base_recommended_price: int = Field(ge=0)
    base_max_price: int = Field(ge=0)
    price_unit: PriceUnit
    frequency_score: int = Field(ge=1, le=10)
    health_score: int = Field(ge=1, le=10)
    comfort_score: int = Field(ge=1, le=10)
    lifecycle_score: int = Field(ge=1, le=10)
    energy_score: int = Field(ge=1, le=10)
    replacement_difficulty_score: int = Field(ge=1, le=10)
    price_flexibility_score: int = Field(ge=1, le=10)
    optional: bool
    removable: bool
    description: str
    rule_version: str

    @model_validator(mode="after")
    def validate_ranges(self) -> "ProcurementItemRule":
        if self.minimum_quantity > self.maximum_quantity:
            raise ValueError("minimum_quantity 不能大于 maximum_quantity")
        if not (
            self.base_min_price <= self.base_recommended_price <= self.base_max_price
        ):
            raise ValueError("单价必须满足 min <= recommended <= max")
        if (
            self.installation_type == InstallationType.RENOVATION_DEPENDENT
            and self.active
        ):
            raise ValueError("renovation_dependent 项目在 V1 必须 inactive")
        return self


class CityPriceContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city_name: str
    product_factor: float = Field(gt=0)
    delivery_factor: float = Field(gt=0)
    installation_factor: float = Field(gt=0)
    service_factor: float = Field(gt=0)
    source: str
    used_default: bool = False
