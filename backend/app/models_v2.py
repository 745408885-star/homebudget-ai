"""Compatibility imports for the Phase 6A V2 contracts.

New code should import from :mod:`app.schemas.v2`. Existing imports remain
supported so the refactor does not change the V2 design contract.
"""

from app.schemas.v2 import (
    BrandPreference,
    BudgetMode,
    BudgetResultItemV2,
    BudgetResultV2,
    CategorySummaryV2,
    CityPriceContext,
    DeferredItemV2,
    ExcludedItemV2,
    FlexibilityLevel,
    InstallationType,
    ItemSelectionStatus,
    OwnedItem,
    OwnedItemCondition,
    OwnedItemResultV2,
    PriceUnit,
    ProcurementItemRule,
    RequiredLevel,
    Room,
    RoomAssignment,
    RoomType,
    UsageType,
    UserInputV2,
    UserItemPreference,
)

__all__ = [
    "BrandPreference",
    "BudgetMode",
    "BudgetResultItemV2",
    "BudgetResultV2",
    "CategorySummaryV2",
    "CityPriceContext",
    "DeferredItemV2",
    "ExcludedItemV2",
    "FlexibilityLevel",
    "InstallationType",
    "ItemSelectionStatus",
    "OwnedItem",
    "OwnedItemCondition",
    "OwnedItemResultV2",
    "PriceUnit",
    "ProcurementItemRule",
    "RequiredLevel",
    "Room",
    "RoomAssignment",
    "RoomType",
    "UsageType",
    "UserInputV2",
    "UserItemPreference",
]
