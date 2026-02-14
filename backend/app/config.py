from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    redis_url: str = "redis://redis:6379/0"
    gemini_model: str = "gemini-2.5-flash-preview-05-20"
    rate_limit_per_minute: int = 60
    context_cache_ttl: int = 300

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
