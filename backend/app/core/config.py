from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./grocery_lists.db"
    openai_api_key: Optional[str] = None
    environment: str = "development"
    debug: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()