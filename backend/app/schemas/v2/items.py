from pydantic import BaseModel, ConfigDict, Field

from app.schemas.v2.common import ItemSelectionStatus, OwnedItemCondition


class OwnedItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str = Field(min_length=1)
    quantity: int = Field(ge=1)
    condition: OwnedItemCondition
    continue_using: bool


class UserItemPreference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_code: str = Field(min_length=1)
    status: ItemSelectionStatus
