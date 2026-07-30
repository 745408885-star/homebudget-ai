"""add Phase 6A V2 procurement planning schema

Revision ID: 20260729_0003
Revises: 20260728_0002
Create Date: 2026-07-29

This executable migration draft is kept outside ``alembic/versions`` so that
``alembic upgrade head`` cannot apply it before the V2 cutover is approved.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260729_0003"
down_revision: str | None = "20260728_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    for column_name in (
        "product_factor",
        "delivery_factor",
        "installation_factor",
        "service_factor",
    ):
        op.add_column(
            "city_factors",
            sa.Column(
                column_name,
                sa.Numeric(precision=6, scale=3),
                server_default=sa.text("1.000"),
                nullable=False,
            ),
        )

    requirement_columns = (
        sa.Column("bedroom_count", sa.Integer(), nullable=True),
        sa.Column("living_room_count", sa.Integer(), nullable=True),
        sa.Column("bathroom_count", sa.Integer(), nullable=True),
        sa.Column("kitchen_count", sa.Integer(), nullable=True),
        sa.Column("balcony_count", sa.Integer(), nullable=True),
        sa.Column("adult_count", sa.Integer(), nullable=True),
        sa.Column("child_count", sa.Integer(), nullable=True),
        sa.Column("elderly_count", sa.Integer(), nullable=True),
        sa.Column("expected_years", sa.Integer(), nullable=True),
        sa.Column("usage_type", sa.String(length=30), nullable=True),
        sa.Column("smart_home_demand", sa.String(length=30), nullable=True),
        sa.Column("appearance_demand", sa.String(length=30), nullable=True),
        sa.Column("energy_saving_demand", sa.String(length=30), nullable=True),
        sa.Column("durability_demand", sa.String(length=30), nullable=True),
        sa.Column("quietness_demand", sa.String(length=30), nullable=True),
        sa.Column("brand_preference", sa.String(length=30), nullable=True),
        sa.Column("accepts_budget_brands", sa.Boolean(), nullable=True),
        sa.Column("budget_mode", sa.String(length=30), nullable=True),
        sa.Column("upgrade_item_codes", sa.JSON(), nullable=True),
        sa.Column("quality_upgrade_modules", sa.JSON(), nullable=True),
        sa.Column("upgrade_budget_target", sa.Integer(), nullable=True),
        sa.Column("reserve_budget_target", sa.Integer(), nullable=True),
    )
    for column in requirement_columns:
        op.add_column("user_requirements", column)

    op.create_table(
        "rule_versions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("engine_version", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("version"),
        sa.CheckConstraint(
            "status IN ('draft', 'active', 'retired')",
            name="ck_rule_versions_status",
        ),
    )

    op.create_table(
        "budget_item_rules",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("rule_version_id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("subcategory", sa.String(length=100), nullable=False),
        sa.Column(
            "active",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column("required_level", sa.String(length=30), nullable=False),
        sa.Column("installation_type", sa.String(length=30), nullable=False),
        sa.Column("room_types", sa.JSON(), nullable=False),
        sa.Column("quantity_rule", sa.JSON(), nullable=False),
        sa.Column("minimum_quantity", sa.Integer(), nullable=False),
        sa.Column("maximum_quantity", sa.Integer(), nullable=False),
        sa.Column("base_min_price", sa.Integer(), nullable=False),
        sa.Column("base_recommended_price", sa.Integer(), nullable=False),
        sa.Column("base_max_price", sa.Integer(), nullable=False),
        sa.Column("price_unit", sa.String(length=30), nullable=False),
        sa.Column("frequency_score", sa.Integer(), nullable=False),
        sa.Column("health_score", sa.Integer(), nullable=False),
        sa.Column("comfort_score", sa.Integer(), nullable=False),
        sa.Column("lifecycle_score", sa.Integer(), nullable=False),
        sa.Column("energy_score", sa.Integer(), nullable=False),
        sa.Column(
            "replacement_difficulty_score",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column("price_flexibility_score", sa.Integer(), nullable=False),
        sa.Column("optional", sa.Boolean(), nullable=False),
        sa.Column("removable", sa.Boolean(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["rule_version_id"], ["rule_versions.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "rule_version_id",
            "code",
            name="uq_budget_item_rules_version_code",
        ),
        sa.CheckConstraint(
            "installation_type != 'renovation_dependent' OR active = false",
            name="ck_v1_renovation_dependent_inactive",
        ),
    )
    op.create_index(
        "ix_budget_item_rules_active",
        "budget_item_rules",
        ["active"],
    )
    op.create_index(
        "ix_budget_item_rules_category",
        "budget_item_rules",
        ["category"],
    )

    op.create_table(
        "rooms",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_requirement_id", sa.String(length=36), nullable=False),
        sa.Column("room_type", sa.String(length=30), nullable=False),
        sa.Column("room_name", sa.String(length=100), nullable=False),
        sa.Column("area", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column(
            "resident_count",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("usage_frequency", sa.String(length=30), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_requirement_id"],
            ["user_requirements.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_rooms_user_requirement_id",
        "rooms",
        ["user_requirement_id"],
    )

    op.create_table(
        "owned_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_requirement_id", sa.String(length=36), nullable=False),
        sa.Column("item_code", sa.String(length=100), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("condition", sa.String(length=30), nullable=False),
        sa.Column("continue_using", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_requirement_id"],
            ["user_requirements.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_requirement_id",
            "item_code",
            name="uq_owned_items_requirement_code",
        ),
    )
    op.create_index(
        "ix_owned_items_user_requirement_id",
        "owned_items",
        ["user_requirement_id"],
    )

    op.create_table(
        "user_item_preferences",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_requirement_id", sa.String(length=36), nullable=False),
        sa.Column("item_code", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_requirement_id"],
            ["user_requirements.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_requirement_id",
            "item_code",
            name="uq_item_preferences_requirement_code",
        ),
        sa.CheckConstraint(
            "status IN ('need', 'owned', 'exclude', 'later', 'optional')",
            name="ck_item_preferences_status",
        ),
    )
    op.create_index(
        "ix_item_preferences_user_requirement_id",
        "user_item_preferences",
        ["user_requirement_id"],
    )

    plan_columns = (
        sa.Column("budget_mode", sa.String(length=30), nullable=True),
        sa.Column("allocated_budget", sa.Integer(), nullable=True),
        sa.Column("unallocated_budget", sa.Integer(), nullable=True),
        sa.Column("upgrade_budget", sa.Integer(), nullable=True),
        sa.Column("reserve_budget", sa.Integer(), nullable=True),
        sa.Column("city_price_context", sa.JSON(), nullable=True),
        sa.Column("rule_version", sa.String(length=100), nullable=True),
        sa.Column("engine_version", sa.String(length=30), nullable=True),
    )
    for column in plan_columns:
        op.add_column("budget_plans", column)

    op.create_table(
        "budget_plan_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("budget_plan_id", sa.String(length=36), nullable=False),
        sa.Column("item_rule_id", sa.String(length=36), nullable=True),
        sa.Column("item_code", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("specification_label", sa.String(length=200), nullable=False),
        sa.Column("current_budget", sa.Integer(), nullable=False),
        sa.Column("recommended_range_min", sa.Integer(), nullable=False),
        sa.Column("recommended_range_max", sa.Integer(), nullable=False),
        sa.Column("value_score", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("flexibility_level", sa.String(length=30), nullable=False),
        sa.Column("room_assignments", sa.JSON(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("warning", sa.Text(), nullable=True),
        sa.Column("installation_note", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["budget_plan_id"], ["budget_plans.id"]),
        sa.ForeignKeyConstraint(["item_rule_id"], ["budget_item_rules.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_budget_plan_items_budget_plan_id",
        "budget_plan_items",
        ["budget_plan_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_budget_plan_items_budget_plan_id",
        table_name="budget_plan_items",
    )
    op.drop_table("budget_plan_items")

    for column_name in (
        "engine_version",
        "rule_version",
        "city_price_context",
        "reserve_budget",
        "upgrade_budget",
        "unallocated_budget",
        "allocated_budget",
        "budget_mode",
    ):
        op.drop_column("budget_plans", column_name)

    op.drop_index(
        "ix_item_preferences_user_requirement_id",
        table_name="user_item_preferences",
    )
    op.drop_table("user_item_preferences")
    op.drop_index(
        "ix_owned_items_user_requirement_id",
        table_name="owned_items",
    )
    op.drop_table("owned_items")
    op.drop_index("ix_rooms_user_requirement_id", table_name="rooms")
    op.drop_table("rooms")
    op.drop_index(
        "ix_budget_item_rules_category",
        table_name="budget_item_rules",
    )
    op.drop_index(
        "ix_budget_item_rules_active",
        table_name="budget_item_rules",
    )
    op.drop_table("budget_item_rules")
    op.drop_table("rule_versions")

    for column_name in (
        "reserve_budget_target",
        "upgrade_budget_target",
        "quality_upgrade_modules",
        "upgrade_item_codes",
        "budget_mode",
        "accepts_budget_brands",
        "brand_preference",
        "quietness_demand",
        "durability_demand",
        "energy_saving_demand",
        "appearance_demand",
        "smart_home_demand",
        "usage_type",
        "expected_years",
        "elderly_count",
        "child_count",
        "adult_count",
        "balcony_count",
        "kitchen_count",
        "bathroom_count",
        "living_room_count",
        "bedroom_count",
    ):
        op.drop_column("user_requirements", column_name)

    for column_name in (
        "service_factor",
        "installation_factor",
        "delivery_factor",
        "product_factor",
    ):
        op.drop_column("city_factors", column_name)
