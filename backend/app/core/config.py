from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'  # This prevents the ValidationError if extra keys exist in .env
    )

    PROJECT_NAME: str = "Startup Swarm AI Orchestrator"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # API Keys
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: Optional[str] = ""
    TAVILY_API_KEY: Optional[str] = ""
    
    # Database (MongoDB via Motor)
    MONGO_URI: str = "mongodb://localhost:27017/startup_swarm"

settings = Settings()
