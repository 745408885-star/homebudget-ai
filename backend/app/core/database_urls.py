from sqlalchemy.engine import URL, make_url

PROTECTED_DATABASE_NAMES = {
    "homebudget_ai",
    "postgres",
    "template0",
    "template1",
}
ALLOWED_TEST_DATABASE_HOSTS = {"127.0.0.1", "localhost", "postgres"}


class UnsafeTestDatabaseError(ValueError):
    """Raised before a test can target a non-test database."""


def parse_database_url(value: str) -> URL:
    try:
        return make_url(value)
    except Exception as error:
        raise UnsafeTestDatabaseError("数据库连接串格式无效。") from error


def require_safe_test_database_url(value: str) -> URL:
    url = parse_database_url(value)
    database_name = (url.database or "").strip().lower()

    if url.get_backend_name() != "postgresql":
        raise UnsafeTestDatabaseError(
            "数据库集成测试只允许使用临时 PostgreSQL 测试数据库。"
        )
    if not database_name:
        raise UnsafeTestDatabaseError("TEST_DATABASE_URL 必须包含数据库名称。")
    if (url.host or "").lower() not in ALLOWED_TEST_DATABASE_HOSTS:
        raise UnsafeTestDatabaseError(
            "数据库集成测试只允许连接本机或 CI 的 PostgreSQL 服务。"
        )
    if database_name in PROTECTED_DATABASE_NAMES or "_test" not in database_name:
        raise UnsafeTestDatabaseError(
            "拒绝运行数据库集成测试：数据库名称必须包含“_test”，"
            "且不能是开发库 homebudget_ai。"
        )
    return url


def redact_database_url(value: str) -> str:
    return parse_database_url(value).render_as_string(hide_password=True)
