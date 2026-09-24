import os
import secrets
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kollab Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Environment: 'development' | 'staging' | 'production'
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./kollab.db"

    # Redis Cache & Rate Limiting Store
    REDIS_URL: str = ""  # e.g. "redis://localhost:6379/0" or "redis://default:secret@redis-cloud.com:6379"

    # JWT Authentication
    SECRET_KEY: str = "kollab-dev-only-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI (Groq)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_TIMEOUT_SECONDS: float = 10.0  # Hard timeout for LLM calls

    # AWS S3 (Resumes & PDF Reports)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "kollab-resumes-bucket"

    # Email
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_USE_TLS: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        """Warn loudly if weak defaults are used outside development."""
        weak_key = "kollab-dev-only-secret-change-in-production"
        if self.ENVIRONMENT != "development" and self.SECRET_KEY == weak_key:
            raise ValueError(
                "SECRET_KEY must be set to a strong random value in non-development environments. "
                "Run: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        if self.ENVIRONMENT == "production" and self.SECRET_KEY == weak_key:
            raise ValueError("Production deployment blocked: SECRET_KEY is using the insecure default.")
        if len(self.SECRET_KEY) < 32:
            logger.warning("SECRET_KEY is shorter than 32 characters — use a stronger key in production.")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
