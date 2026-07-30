"""seed budget rules and city factors

Revision ID: 20260728_0002
Revises: 20260728_0001
Create Date: 2026-07-28
"""

import json
from collections.abc import Sequence
from decimal import Decimal
from pathlib import Path

from alembic import op
import sqlalchemy as sa


revision: str = "20260728_0002"
down_revision: str | None = "20260728_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

RULES_FILE = (
    Path(__file__).resolve().parents[2] / "data" / "budget_rules.json"
)

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


def upgrade() -> None:
    rules = json.loads(RULES_FILE.read_text(encoding="utf-8"))
    categories = {
        category["name"]: category for category in rules["categories"]
    }

    budget_items = sa.table(
        "budget_items",
        sa.column("id", sa.String),
        sa.column("code", sa.String),
        sa.column("name", sa.String),
        sa.column("category", sa.String),
        sa.column("category_code", sa.String),
        sa.column("category_description", sa.Text),
        sa.column("minimum_budget", sa.Integer),
        sa.column("recommended_budget", sa.Integer),
        sa.column("maximum_budget", sa.Integer),
        sa.column("weight", sa.Integer),
        sa.column("priority", sa.Integer),
        sa.column("description", sa.Text),
        sa.column("sort_order", sa.Integer),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        budget_items,
        [
            {
                **item,
                "category_code": categories[item["category"]]["code"],
                "category_description": categories[item["category"]][
                    "description"
                ],
                "sort_order": index,
                "is_active": True,
            }
            for index, item in enumerate(rules["items"], start=1)
        ],
    )

    city_factors = sa.table(
        "city_factors",
        sa.column("city_name", sa.String),
        sa.column("normalized_city", sa.String),
        sa.column("labor_factor", sa.Numeric),
        sa.column("material_factor", sa.Numeric),
        sa.column("custom_factor", sa.Numeric),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        city_factors,
        [
            {
                "city_name": city_name,
                "normalized_city": normalized,
                "labor_factor": Decimal(labor),
                "material_factor": Decimal(material),
                "custom_factor": Decimal(custom),
                "is_active": True,
            }
            for city_name, normalized, labor, material, custom in CITY_FACTORS
        ],
    )


def downgrade() -> None:
    connection = op.get_bind()
    rules = json.loads(RULES_FILE.read_text(encoding="utf-8"))

    budget_items = sa.table(
        "budget_items",
        sa.column("code", sa.String),
    )
    connection.execute(
        sa.delete(budget_items).where(
            budget_items.c.code.in_(
                [item["code"] for item in rules["items"]]
            )
        )
    )

    city_factors = sa.table(
        "city_factors",
        sa.column("normalized_city", sa.String),
    )
    connection.execute(
        sa.delete(city_factors).where(
            city_factors.c.normalized_city.in_(
                [item[1] for item in CITY_FACTORS]
            )
        )
    )
