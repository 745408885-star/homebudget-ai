from enum import StrEnum


class UsageType(StrEnum):
    SELF_USE = "self_use"
    RENTAL = "rental"
    TEMPORARY = "temporary"


class BudgetMode(StrEnum):
    CEILING = "ceiling"
    FULL_ALLOCATION = "full_allocation"


class BrandPreference(StrEnum):
    NO_PREFERENCE = "no_preference"
    VALUE = "value"
    BALANCED = "balanced"
    PREMIUM = "premium"


class OwnedItemCondition(StrEnum):
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    REPLACE_SOON = "replace_soon"


class ItemSelectionStatus(StrEnum):
    NEED = "need"
    OWNED = "owned"
    EXCLUDE = "exclude"
    LATER = "later"
    OPTIONAL = "optional"
    SYSTEM_RECOMMEND = "system_recommend"


class RoomType(StrEnum):
    LIVING_ROOM = "living_room"
    MASTER_BEDROOM = "master_bedroom"
    BEDROOM = "bedroom"
    CHILD_ROOM = "child_room"
    STUDY = "study"
    DINING_ROOM = "dining_room"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    BALCONY = "balcony"
    ENTRANCE = "entrance"
    OTHER = "other"


class RequiredLevel(StrEnum):
    ESSENTIAL = "essential"
    RECOMMENDED = "recommended"
    OPTIONAL = "optional"


class InstallationType(StrEnum):
    NONE = "none"
    SIMPLE = "simple"
    PROFESSIONAL = "professional"
    RENOVATION_DEPENDENT = "renovation_dependent"


class PriceUnit(StrEnum):
    ITEM = "item"
    SET = "set"
    ROOM = "room"
    METER = "meter"
    PACKAGE = "package"


class FlexibilityLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
