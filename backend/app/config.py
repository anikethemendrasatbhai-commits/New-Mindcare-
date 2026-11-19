"""Application settings, loaded from environment variables (and a local .env in development).

No secrets have in-code defaults: SECRET_KEY and DATABASE_URL must be supplied.
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: Literal["development", "test", "production"] = "development"
    database_url: str
    secret_key: str = Field(min_length=32)

    # CORS / cookies. Comma-separated list of allowed frontend origins.
    frontend_origins: str = "http://localhost:5173"
    frontend_base_url: str = "http://localhost:5173"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_domain: str | None = None

    # Sessions and tokens
    session_hours: int = 12
    remember_me_days: int = 30
    reset_token_minutes: int = 30

    # Account protection
    max_failed_logins: int = 5
    lockout_minutes: int = 15

    # Rate limiting (in-memory; use a shared store such as Redis if scaled to >1 instance)
    rate_limit_enabled: bool = True
    rate_limit_login_per_minute: int = 10
    rate_limit_register_per_hour: int = 10
    rate_limit_forgot_per_hour: int = 5

    # Email (if smtp_host is empty, messages are written to the server log in development)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    email_from: str = "MindCare Assess <no-reply@localhost>"

    # Version of the privacy notice / consent text users agree to
    policy_version: str = "2026-11-v1"
    minimum_age: int = 18

    @property
    def origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.frontend_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def _production_guards(self) -> "Settings":
        if self.env == "production":
            if not self.cookie_secure:
                raise ValueError("COOKIE_SECURE must be true in production")
            if self.cookie_samesite == "none" and not self.cookie_secure:
                raise ValueError("SameSite=None requires Secure cookies")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
