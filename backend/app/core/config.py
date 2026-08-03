import os
from collections.abc import Mapping
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Literal, cast

from dotenv import load_dotenv
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError

PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env", override=False)

AppEnvironment = Literal["development", "test", "production"]
DEFAULT_DEVELOPMENT_ORIGINS = (
    "http://127.0.0.1:5173",
    "http://localhost:5173",
)


class ConfigurationError(RuntimeError):
    """Raised when required runtime configuration is missing or unsafe."""


@dataclass(frozen=True)
class Settings:
    database_url: str
    app_environment: AppEnvironment
    cors_allowed_origins: tuple[str, ...]


def build_settings(environ: Mapping[str, str]) -> Settings:
    database_url = environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise ConfigurationError(
            "缺少必填环境变量 DATABASE_URL。请从项目根目录的 .env.example "
            "创建本地 .env，并填写数据库连接信息。"
        )
    try:
        make_url(database_url)
    except ArgumentError as error:
        raise ConfigurationError("DATABASE_URL 格式无效。") from error

    environment_value = environ.get("APP_ENV", "development").strip().lower()
    if environment_value not in {"development", "test", "production"}:
        raise ConfigurationError("APP_ENV 只允许 development、test 或 production。")
    app_environment = cast(AppEnvironment, environment_value)

    raw_origins = environ.get("CORS_ALLOWED_ORIGINS", "")
    cors_allowed_origins = tuple(
        origin.strip() for origin in raw_origins.split(",") if origin.strip()
    )
    if not cors_allowed_origins and app_environment == "development":
        cors_allowed_origins = DEFAULT_DEVELOPMENT_ORIGINS
    if app_environment == "production" and (
        not cors_allowed_origins or "*" in cors_allowed_origins
    ):
        raise ConfigurationError(
            "生产环境必须通过 CORS_ALLOWED_ORIGINS 明确配置允许的来源，"
            "且不能使用通配符“*”。"
        )

    return Settings(
        database_url=database_url,
        app_environment=app_environment,
        cors_allowed_origins=cors_allowed_origins,
    )


@lru_cache
def get_settings() -> Settings:
    return build_settings(os.environ)
