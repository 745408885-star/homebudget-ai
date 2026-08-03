import os

import pytest

from app.core.database_urls import (
    UnsafeTestDatabaseError,
    require_safe_test_database_url,
)

SAFE_PYTEST_DATABASE_URL = (
    "postgresql+psycopg://pytest_guard:pytest_guard@127.0.0.1:1/"
    "homebudget_pytest_guard_test?connect_timeout=1"
)

# This is set before application modules are imported. Unit tests therefore
# cannot accidentally use the developer's DATABASE_URL loaded from .env.
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = SAFE_PYTEST_DATABASE_URL
os.environ["CORS_ALLOWED_ORIGINS"] = ""

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "").strip()
if TEST_DATABASE_URL:
    try:
        require_safe_test_database_url(TEST_DATABASE_URL)
    except UnsafeTestDatabaseError as error:
        raise pytest.UsageError(str(error)) from error


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    skip_integration = pytest.mark.skip(
        reason=(
            "未设置 TEST_DATABASE_URL；数据库集成测试已安全跳过，单元测试继续运行。"
        )
    )
    for item in items:
        if "integration" in item.keywords:
            if not TEST_DATABASE_URL:
                item.add_marker(skip_integration)
        elif "unit" not in item.keywords:
            item.add_marker(pytest.mark.unit)
