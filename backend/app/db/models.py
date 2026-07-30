from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def new_uuid() -> str:
    return str(uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=new_uuid,
    )
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    requirements: Mapped[list["UserRequirement"]] = relationship(back_populates="user")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(100), index=True)
    category_code: Mapped[str] = mapped_column(String(100))
    category_description: Mapped[str] = mapped_column(Text)
    minimum_budget: Mapped[int] = mapped_column(Integer)
    recommended_budget: Mapped[int] = mapped_column(Integer)
    maximum_budget: Mapped[int] = mapped_column(Integer)
    weight: Mapped[int] = mapped_column(Integer)
    priority: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, index=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )


class CityFactor(Base):
    __tablename__ = "city_factors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city_name: Mapped[str] = mapped_column(String(100))
    normalized_city: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )
    labor_factor: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        default=Decimal("1.000"),
    )
    material_factor: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        default=Decimal("1.000"),
    )
    custom_factor: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        default=Decimal("1.000"),
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )


class UserRequirement(Base):
    __tablename__ = "user_requirements"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=new_uuid,
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        index=True,
        nullable=False,
    )
    area: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    city: Mapped[str] = mapped_column(String(100))
    house_type: Mapped[str] = mapped_column(String(100))
    total_budget: Mapped[int] = mapped_column(Integer)
    resident_count: Mapped[int] = mapped_column(Integer)
    elderly_children_status: Mapped[str] = mapped_column(String(30))
    cooking_frequency: Mapped[str] = mapped_column(String(30))
    sleep_demand: Mapped[str] = mapped_column(String(30))
    storage_demand: Mapped[str] = mapped_column(String(30))
    entertainment_demand: Mapped[str] = mapped_column(String(30))
    renovation_goal: Mapped[str] = mapped_column(Text)
    willing_to_reduce: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="requirements")
    budget_plan: Mapped["BudgetPlan | None"] = relationship(
        back_populates="requirement",
        uselist=False,
    )


class BudgetPlan(Base):
    __tablename__ = "budget_plans"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=new_uuid,
    )
    user_requirement_id: Mapped[str] = mapped_column(
        ForeignKey("user_requirements.id"),
        unique=True,
        index=True,
        nullable=False,
    )
    total_budget: Mapped[int] = mapped_column(Integer)
    feasible: Mapped[bool] = mapped_column(Boolean)
    city_factor_name: Mapped[str] = mapped_column(String(100))
    plan_data: Mapped[dict[str, Any]] = mapped_column(JSON)
    optimization_suggestions: Mapped[list[str]] = mapped_column(JSON)
    optimization_warnings: Mapped[list[str]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    requirement: Mapped[UserRequirement] = relationship(back_populates="budget_plan")
