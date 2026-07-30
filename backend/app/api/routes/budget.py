from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import BudgetCategory, BudgetItem, BudgetResult, UserInput
from app.repositories.budget_repository import (
    get_city_factor,
    list_budget_categories,
    list_budget_items,
    save_budget_calculation,
)
from app.services.budget_engine import BudgetConstraintError, BudgetEngine

router = APIRouter(prefix="/api/budget", tags=["budget"])


def require_budget_items(db: Session) -> list[BudgetItem]:
    items = list_budget_items(db)
    if not items:
        raise HTTPException(
            status_code=503,
            detail="预算规则尚未初始化，请先执行数据库种子命令。",
        )
    return items


@router.get("/categories", response_model=list[BudgetCategory])
def get_budget_categories(
    db: Session = Depends(get_db),
) -> list[BudgetCategory]:
    categories = list_budget_categories(db)
    if not categories:
        raise HTTPException(
            status_code=503,
            detail="预算规则尚未初始化，请先执行数据库种子命令。",
        )
    return categories


@router.get("/items", response_model=list[BudgetItem])
def get_budget_items(
    db: Session = Depends(get_db),
) -> list[BudgetItem]:
    return require_budget_items(db)


@router.post("/calculate", response_model=BudgetResult)
def calculate_budget(
    user_input: UserInput,
    db: Session = Depends(get_db),
) -> BudgetResult:
    try:
        items = require_budget_items(db)
        city_factor, used_default = get_city_factor(db, user_input.city)
        result = BudgetEngine(
            items=items,
            city_factor=city_factor,
            used_default_city_factor=used_default,
        ).calculate(user_input)
        plan_id = save_budget_calculation(
            db=db,
            user_input=user_input,
            result=result,
            city_factor_name=city_factor.city_name,
        )
        return result.model_copy(update={"plan_id": plan_id})
    except BudgetConstraintError as error:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(error)) from error
    except RuntimeError as error:
        db.rollback()
        raise HTTPException(status_code=503, detail=str(error)) from error
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="数据库暂时不可用，请稍后重试。",
        ) from error
