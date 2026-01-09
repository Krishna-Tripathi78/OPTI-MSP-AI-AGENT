from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database: str = "optimsp"
    
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_MODEL: str = "gpt-4"
    
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    connectwise_api_key: str = "demo-key"
    connectwise_client_id: str = "demo-client"
    microsoft365_token: str = "demo-token"
    azure_token: str = "demo-token"
    autotask_integration_code: str = "demo-code"
    autotask_username: str = "demo-user"
    autotask_secret: str = "demo-secret"
    kaseya_server_url: str = "https://demo.kaseya.com"
    kaseya_token: str = "demo-token"
    slack_bot_token: str = "demo-token"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
