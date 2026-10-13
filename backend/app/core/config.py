"""
MedBangla AI - Core Application Settings
========================================
Loads configuration from backend/.env using Pydantic Settings.
"""

from typing import List
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "MedBangla AI API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Neon PostgreSQL
    DATABASE_URL: str = ""

    # AI / Vision Models
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    VISION_PROVIDER: str = "gemini"  # "gemini" (primary: gemini-3-flash-preview) | "groq" (fast alternate: qwen/qwen3.8-27b)
    GEMINI_VISION_MODEL: str = "gemini-3-flash-preview"
    GROQ_VISION_MODEL: str = "qwen/qwen3.8-27b"

    # Security
    SECRET_KEY: str = "medbangla_dev_secret_key_change_in_production_9988776655"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
