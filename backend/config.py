from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings(BaseSettings):
    model_config = {"extra": "ignore"}  # Ignore extra fields from .env
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/waza_db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "waza_jwt_secret_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # AI
    EMERGENT_LLM_KEY: str = os.getenv("EMERGENT_LLM_KEY", "")
    
    # WhatsApp
    WHATSAPP_APP_SECRET: str = os.getenv("WHATSAPP_APP_SECRET", "")
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
    
    # Payment Providers
    CINETPAY_API_KEY: str = os.getenv("CINETPAY_API_KEY", "")
    CINETPAY_SITE_ID: str = os.getenv("CINETPAY_SITE_ID", "")
    STRIPE_API_KEY: str = os.getenv("STRIPE_API_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

settings = Settings()

# Plan Limits - defined outside the Settings class
PLAN_LIMITS = {
    "free": {"messages": 100, "agents": 1, "workspaces": 1, "price_fcfa": 0},
    "starter": {"messages": 1500, "agents": 1, "workspaces": 1, "price_fcfa": 19900},
    "pro": {"messages": 8000, "agents": 5, "workspaces": 3, "price_fcfa": 49900},
    "business": {"messages": -1, "agents": -1, "workspaces": -1, "price_fcfa": 99000}  # -1 = unlimited
}
