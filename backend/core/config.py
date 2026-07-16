from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise AI Sales Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./reports.db"
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6380/0"
    
    # AI APIs
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    CEREBRAS_API_KEY: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

settings = Settings()
