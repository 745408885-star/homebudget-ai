from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    BudgetItem as BudgetItemRecord,
)
from app.db.models import (
    BudgetPlan as BudgetPlanRecord,
)
from app.db.models import (
    CityFactor as CityFactorRecord,
)
from app.db.models import (
    User,
    UserRequirement,
)
from app.models import (
    BudgetCategory,
    BudgetItem,
    BudgetResult,
    CityFactorData,
    UserInput,
)


def normalize_city(city: str) -> str:
    return city.strip().lower()


def list_budget_item_records(db: Session) -> list[BudgetItemRecord]:
    return list(
        db.scalars(
            select(BudgetItemRecord)
            .where(BudgetItemRecord.is_active.is_(True))
            .order_by(BudgetItemRecord.sort_order)
        )
    )


def to_budget_item(record: BudgetItemRecord) -> BudgetItem:
    return BudgetItem(
        id=record.id,
        code=record.code,
        name=record.name,
        category=record.category,
        minimum_budget=record.minimum_budget,
        recommended_budget=record.recommended_budget,
        maximum_budget=record.maximum_budget,
        weight=record.weight,
        priority=record.priority,
        description=record.description,
    )


def list_budget_items(db: Session) -> list[BudgetItem]:
    return [to_budget_item(record) for record in list_budget_item_records(db)]


def list_budget_categories(db: Session) -> list[BudgetCategory]:
    categories: dict[str, BudgetCategory] = {}
    for record in list_budget_item_records(db):
        if record.category not in categories:
            categories[record.category] = BudgetCategory(
                id=f"category-{record.category_code}",
                code=record.category_code,
                name=record.category,
                description=record.category_description,
            )
    return list(categories.values())


def get_city_factor(
    db: Session,
    city: str,
) -> tuple[CityFactorData, bool]:
    normalized = normalize_city(city)
    record = db.scalar(
        select(CityFactorRecord).where(
            CityFactorRecord.normalized_city == normalized,
            CityFactorRecord.is_active.is_(True),
        )
    )
    used_default = record is None
    if record is None:
        record = db.scalar(
            select(CityFactorRecord).where(
                CityFactorRecord.normalized_city == "*",
                CityFactorRecord.is_active.is_(True),
            )
        )
    if record is None:
        raise RuntimeError("数据库缺少全国默认城市系数")

    return (
        CityFactorData(
            city_name=record.city_name,
            labor_factor=float(record.labor_factor),
            material_factor=float(record.material_factor),
            custom_factor=float(record.custom_factor),
        ),
        used_default,
    )


def save_budget_calculation(
    db: Session,
    user_input: UserInput,
    result: BudgetResult,
    city_factor_name: str,
) -> str:
    user = User()
    db.add(user)
    db.flush()

    requirement = UserRequirement(
        user_id=user.id,
        area=Decimal(str(user_input.area)),
        city=user_input.city,
        house_type=user_input.house_type,
        total_budget=user_input.total_budget,
        resident_count=user_input.resident_count,
        elderly_children_status=user_input.elderly_children_status.value,
        cooking_frequency=user_input.cooking_frequency.value,
        sleep_demand=user_input.sleep_demand.value,
        storage_demand=user_input.storage_demand.value,
        entertainment_demand=user_input.entertainment_demand.value,
        renovation_goal=user_input.renovation_goal,
        willing_to_reduce=[
            preference.value for preference in user_input.willing_to_reduce
        ],
    )
    db.add(requirement)
    db.flush()

    plan = BudgetPlanRecord(
        user_requirement_id=requirement.id,
        total_budget=user_input.total_budget,
        feasible=result.feasible,
        city_factor_name=city_factor_name,
        plan_data=result.current_plan.model_dump(mode="json"),
        optimization_suggestions=result.optimization_suggestions,
        optimization_warnings=result.optimization_warnings,
    )
    db.add(plan)
    db.commit()
    return plan.id
