from sqlalchemy import inspect, text

from app.db.session import engine


def main() -> None:
    with engine.connect() as connection:
        row = connection.execute(
            text(
                """
                SELECT
                    version(),
                    current_user,
                    current_database(),
                    current_setting('listen_addresses'),
                    current_setting('port')
                """
            )
        ).one()

        print(f"POSTGRES_VERSION={row[0]}")
        print(f"CURRENT_USER={row[1]}")
        print(f"CURRENT_DATABASE={row[2]}")
        print(f"LISTEN_ADDRESSES={row[3]}")
        print(f"PORT={row[4]}")

        table_names = sorted(inspect(connection).get_table_names())
        print(f"TABLES={','.join(table_names)}")

        if "alembic_version" in table_names:
            alembic_version = connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            print(f"ALEMBIC_VERSION={alembic_version}")

        if "budget_items" in table_names:
            budget_item_count = connection.execute(
                text("SELECT count(*) FROM budget_items")
            ).scalar_one()
            print(f"BUDGET_ITEM_COUNT={budget_item_count}")

        if "city_factors" in table_names:
            city_factor_count = connection.execute(
                text("SELECT count(*) FROM city_factors")
            ).scalar_one()
            print(f"CITY_FACTOR_COUNT={city_factor_count}")

        for table_name, output_name in (
            ("users", "USER_COUNT"),
            ("user_requirements", "USER_REQUIREMENT_COUNT"),
            ("budget_plans", "BUDGET_PLAN_COUNT"),
        ):
            if table_name in table_names:
                count = connection.execute(
                    text(f"SELECT count(*) FROM {table_name}")
                ).scalar_one()
                print(f"{output_name}={count}")

        if "budget_plans" in table_names:
            latest_plan = connection.execute(
                text(
                    """
                    SELECT id, total_budget
                    FROM budget_plans
                    ORDER BY created_at DESC
                    LIMIT 1
                    """
                )
            ).one_or_none()
            if latest_plan is not None:
                print(f"LATEST_PLAN_ID={latest_plan[0]}")
                print(f"LATEST_PLAN_TOTAL={latest_plan[1]}")

    engine.dispose()


if __name__ == "__main__":
    main()
