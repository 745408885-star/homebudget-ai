import pytest

from app.core.database_urls import (
    UnsafeTestDatabaseError,
    redact_database_url,
    require_safe_test_database_url,
)

pytestmark = pytest.mark.unit


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql+psycopg://user:password@127.0.0.1:5432/homebudget_ai",
        "postgresql+psycopg://user:password@127.0.0.1:5432/homebudget_dev",
        "postgresql+psycopg://user:password@127.0.0.1:5432/postgres",
        "postgresql+psycopg://user:password@db.example.com:5432/homebudget_ci_test",
        "sqlite+pysqlite:///:memory:",
    ],
)
def test_unsafe_test_database_url_is_rejected(database_url: str) -> None:
    with pytest.raises(UnsafeTestDatabaseError):
        require_safe_test_database_url(database_url)


def test_named_postgresql_test_database_is_allowed() -> None:
    result = require_safe_test_database_url(
        "postgresql+psycopg://user:password@127.0.0.1:5432/homebudget_ci_test"
    )

    assert result.database == "homebudget_ci_test"


def test_database_url_redaction_hides_password() -> None:
    result = redact_database_url(
        "postgresql+psycopg://user:super-secret@127.0.0.1:5432/homebudget_ci_test"
    )

    assert "super-secret" not in result
    assert "***" in result
