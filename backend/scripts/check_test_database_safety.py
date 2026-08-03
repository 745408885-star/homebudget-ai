import os

from app.core.database_urls import (
    UnsafeTestDatabaseError,
    require_safe_test_database_url,
)

UNSAFE_URLS = (
    "postgresql+psycopg://user:password@127.0.0.1:5432/homebudget_ai",
    "postgresql+psycopg://user:password@127.0.0.1:5432/homebudget_dev",
    "postgresql+psycopg://user:password@127.0.0.1:5432/postgres",
    "sqlite+pysqlite:///:memory:",
)


def main() -> None:
    for value in UNSAFE_URLS:
        try:
            require_safe_test_database_url(value)
        except UnsafeTestDatabaseError:
            continue
        raise RuntimeError(f"测试数据库安全保护未拒绝危险连接：{value}")

    configured_url = os.getenv("TEST_DATABASE_URL", "").strip()
    if configured_url:
        safe_url = require_safe_test_database_url(configured_url)
        print(f"TEST_DATABASE_SAFETY=PASS database={safe_url.database}")
    else:
        print("TEST_DATABASE_SAFETY=PASS TEST_DATABASE_URL未设置，集成测试将跳过")


if __name__ == "__main__":
    main()
