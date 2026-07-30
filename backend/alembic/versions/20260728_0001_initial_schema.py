"""create initial PostgreSQL schema

Revision ID: 20260728_0001
Revises:
Create Date: 2026-07-28
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260728_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "budget_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("category_code", sa.String(length=100), nullable=False),
        sa.Column("category_description", sa.Text(), nullable=False),
        sa.Column("minimum_budget", sa.Integer(), nullable=False),
        sa.Column("recommended_budget", sa.Integer(), nullable=False),
        sa.Column("maximum_budget", sa.Integer(), nullable=False),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(
        "ix_budget_items_category",
        "budget_items",
        ["category"],
    )
    op.create_index(
        "ix_budget_items_code",
        "budget_items",
        ["code"],
    )
    op.create_index(
        "ix_budget_items_sort_order",
        "budget_items",
        ["sort_order"],
    )

    op.create_table(
        "city_factors",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("city_name", sa.String(length=100), nullable=False),
        sa.Column("normalized_city", sa.String(length=100), nullable=False),
        sa.Column(
            "labor_factor",
            sa.Numeric(precision=6, scale=3),
            nullable=False,
        ),
        sa.Column(
            "material_factor",
            sa.Numeric(precision=6, scale=3),
            nullable=False,
        ),
        sa.Column(
            "custom_factor",
            sa.Numeric(precision=6, scale=3),
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("normalized_city"),
    )
    op.create_index(
        "ix_city_factors_normalized_city",
        "city_factors",
        ["normalized_city"],
    )

    op.create_table(
        "user_requirements",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("area", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("house_type", sa.String(length=100), nullable=False),
        sa.Column("total_budget", sa.Integer(), nullable=False),
        sa.Column("resident_count", sa.Integer(), nullable=False),
        sa.Column(
            "elderly_children_status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "cooking_frequency",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column("sleep_demand", sa.String(length=30), nullable=False),
        sa.Column("storage_demand", sa.String(length=30), nullable=False),
        sa.Column(
            "entertainment_demand",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column("renovation_goal", sa.Text(), nullable=False),
        sa.Column("willing_to_reduce", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_user_requirements_user_id",
        "user_requirements",
        ["user_id"],
    )

    op.create_table(
        "budget_plans",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column(
            "user_requirement_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column("total_budget", sa.Integer(), nullable=False),
        sa.Column("feasible", sa.Boolean(), nullable=False),
        sa.Column("city_factor_name", sa.String(length=100), nullable=False),
        sa.Column("plan_data", sa.JSON(), nullable=False),
        sa.Column("optimization_suggestions", sa.JSON(), nullable=False),
        sa.Column("optimization_warnings", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_requirement_id"],
            ["user_requirements.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_requirement_id"),
    )
    op.create_index(
        "ix_budget_plans_user_requirement_id",
        "budget_plans",
        ["user_requirement_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_budget_plans_user_requirement_id",
        table_name="budget_plans",
    )
    op.drop_table("budget_plans")
    op.drop_index(
        "ix_user_requirements_user_id",
        table_name="user_requirements",
    )
    op.drop_table("user_requirements")
    op.drop_index(
        "ix_city_factors_normalized_city",
        table_name="city_factors",
    )
    op.drop_table("city_factors")
    op.drop_index(
        "ix_budget_items_sort_order",
        table_name="budget_items",
    )
    op.drop_index("ix_budget_items_code", table_name="budget_items")
    op.drop_index("ix_budget_items_category", table_name="budget_items")
    op.drop_table("budget_items")
    op.drop_table("users")
