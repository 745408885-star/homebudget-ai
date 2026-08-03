import pytest

from app.core.config import ConfigurationError, build_settings

pytestmark = pytest.mark.unit


def test_database_url_is_required() -> None:
    with pytest.raises(ConfigurationError, match="DATABASE_URL"):
        build_settings({})


def test_database_url_format_is_validated() -> None:
    with pytest.raises(ConfigurationError, match="格式无效"):
        build_settings({"DATABASE_URL": "not a database url"})


def test_development_defaults_to_local_cors_only() -> None:
    settings = build_settings(
        {
            "DATABASE_URL": "postgresql+psycopg://user:password@localhost/app",
            "APP_ENV": "development",
        }
    )

    assert settings.cors_allowed_origins == (
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    )


@pytest.mark.parametrize("origins", ["", "*"])
def test_production_requires_explicit_non_wildcard_cors(origins: str) -> None:
    with pytest.raises(ConfigurationError, match="CORS_ALLOWED_ORIGINS"):
        build_settings(
            {
                "DATABASE_URL": "postgresql+psycopg://user:password@localhost/app",
                "APP_ENV": "production",
                "CORS_ALLOWED_ORIGINS": origins,
            }
        )
