import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PlayLoc - Gestão e Locação de PlayStation 5"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/playloc_db"
    )
    
    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "playloc-secret-jwt-key-ps5-super-secure-token-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Business Logic
    HOLD_DURATION_MINUTES: int = 15  # RF04: Concurrency hold
    SAFETY_BUFFER_HOURS: int = 24    # RF03: Margin between bookings
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
