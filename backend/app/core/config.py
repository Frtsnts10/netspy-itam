from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "NetSpy ITAM"
    DEBUG: bool = True

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    TELEMETRY_API_KEY: str = "change-this-to-a-random-secret"

    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
