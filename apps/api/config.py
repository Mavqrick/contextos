from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    ollama_base_url: str = "http://localhost:11434"

    class Config:
        env_file = ".env"

settings = Settings()