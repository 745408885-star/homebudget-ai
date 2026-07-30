import os
import sys

import psycopg
from psycopg import sql


def main() -> int:
    app_password = os.environ["HOMEBUDGET_APP_DB_PASSWORD"]

    with psycopg.connect(
        host="127.0.0.1",
        port=5432,
        dbname="postgres",
        user="postgres",
        autocommit=True,
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SHOW listen_addresses")
            listen_addresses = cursor.fetchone()[0]
            cursor.execute("SHOW port")
            port = cursor.fetchone()[0]

            if listen_addresses not in {"localhost", "127.0.0.1", "::1"}:
                cursor.execute("ALTER SYSTEM SET listen_addresses = 'localhost'")
                print("LOCAL_ONLY_RESTART_REQUIRED")
                return 75

            cursor.execute(
                "SELECT 1 FROM pg_roles WHERE rolname = %s",
                ("homebudget_app",),
            )
            if cursor.fetchone() is not None:
                raise RuntimeError("Role homebudget_app already exists")

            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                ("homebudget_ai",),
            )
            if cursor.fetchone() is not None:
                raise RuntimeError("Database homebudget_ai already exists")

            cursor.execute(
                sql.SQL("CREATE ROLE {} LOGIN PASSWORD {}").format(
                    sql.Identifier("homebudget_app"),
                    sql.Literal(app_password),
                ),
            )
            cursor.execute(
                sql.SQL("CREATE DATABASE {} OWNER {}").format(
                    sql.Identifier("homebudget_ai"),
                    sql.Identifier("homebudget_app"),
                )
            )

            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            print(f"POSTGRES_VERSION={version}")
            print(f"LISTEN_ADDRESSES={listen_addresses}")
            print(f"PORT={port}")
            print("DATABASE_CREATED=homebudget_ai")
            print("ROLE_CREATED=homebudget_app")
            return 0


if __name__ == "__main__":
    sys.exit(main())
