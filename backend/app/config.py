from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str
    openai_api_key: str
    openai_embed_model: str = "text-embedding-3-small"
    redis_url: str = "redis://localhost:6379"
    database_url: str = "sqlite:///./storage/neopulse.db"
    backend_port: int = 8000
    secret_key: str = "neopulse-hackathon-secret-2026"
    docs_folder: str = "./docs"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
