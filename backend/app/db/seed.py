from decimal import Decimal
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import BudgetItem, CityFactor
from app.db.session import SessionLocal
from app.models import BudgetRuleSet

DEFAULT_RULES_FILE = Path(__file__).resolve().parents[2] / "data" / "budget_rules.json"

CITY_FACTORS = [
    ("全国默认", "*", "1.000", "1.000", "1.000"),
    ("北京", "北京", "1.180", "1.080", "1.120"),
    ("上海", "上海", "1.200", "1.100", "1.150"),
    ("广州", "广州", "1.120", "1.060", "1.080"),
    ("深圳", "深圳", "1.200", "1.100", "1.150"),
    ("杭州", "杭州", "1.120", "1.060", "1.100"),
    ("南京", "南京", "1.080", "1.040", "1.060"),
    ("苏州", "苏州", "1.100", "1.050", "1.080"),
    ("成都", "成都", "1.050", "1.020", "1.030"),
    ("武汉", "武汉", "1.040", "1.020", "1.020"),
    ("重庆", "重庆", "1.050", "1.030", "1.030"),
    ("天津", "天津", "1.060", "1.030", "1.040"),
    ("宁波", "宁波", "1.080", "1.040", "1.060"),
]


def seed_database(
    db: Session,
    rules_file: Path = DEFAULT_RULES_FILE,
) -> tuple[int, int]:
    rules = BudgetRuleSet.model_validate_json(rules_file.read_text(encoding="utf-8"))
    categories = {category.name: category for category in rules.categories}

    for index, item in enumerate(rules.items, start=1):
        item_record = db.scalar(select(BudgetItem).where(BudgetItem.code == item.code))
        category = categories[item.category]
        values = {
            "id": item.id,
            "code": item.code,
            "name": item.name,
            "category": item.category,
            "category_code": category.code,
            "category_description": category.description,
            "minimum_budget": item.minimum_budget,
            "recommended_budget": item.recommended_budget,
            "maximum_budget": item.maximum_budget,
            "weight": item.weight,
            "priority": item.priority,
            "description": item.description,
            "sort_order": index,
            "is_active": True,
        }
        if item_record is None:
            db.add(BudgetItem(**values))
        else:
            for key, value in values.items():
                if key != "id":
                    setattr(item_record, key, value)

    for city_name, normalized, labor, material, custom in CITY_FACTORS:
        city_record = db.scalar(
            select(CityFactor).where(CityFactor.normalized_city == normalized)
        )
        values = {
            "city_name": city_name,
            "normalized_city": normalized,
            "labor_factor": Decimal(labor),
            "material_factor": Decimal(material),
            "custom_factor": Decimal(custom),
            "is_active": True,
        }
        if city_record is None:
            db.add(CityFactor(**values))
        else:
            for key, value in values.items():
                setattr(city_record, key, value)

    db.commit()
    return len(rules.items), len(CITY_FACTORS)


def main() -> None:
    with SessionLocal() as db:
        item_count, city_count = seed_database(db)
    print(f"Seed complete: {item_count} budget items, {city_count} city factors")


if __name__ == "__main__":
    main()
