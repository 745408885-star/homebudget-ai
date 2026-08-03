from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine


def main() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1")).scalar_one()
    except SQLAlchemyError:
        print("DATABASE_CONNECTION=FAIL 请检查 PostgreSQL 服务和 DATABASE_URL 配置。")
        raise SystemExit(1) from None
    finally:
        engine.dispose()
    print("DATABASE_CONNECTION=PASS")


if __name__ == "__main__":
    main()
