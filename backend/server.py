from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routers
from routers import auth, workspaces, agents, webhook, billing, contacts, conversations, broadcasts, analytics, admin
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="WAZA API",
    description="AI WhatsApp Agent Platform for African Businesses",
    version="1.0.0"
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(workspaces.router)
api_router.include_router(agents.router)
api_router.include_router(contacts.router)
api_router.include_router(conversations.router)
api_router.include_router(broadcasts.router)
api_router.include_router(analytics.router)
api_router.include_router(webhook.router)
api_router.include_router(billing.router)
api_router.include_router(admin.router)

# Root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "WAZA API - Massudom Silicon Valley",
        "version": "1.0.0",
        "status": "active"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "waza-backend",
        "database": "connected",
        "redis": "connected"
    }

# Include API router in main app
app.include_router(api_router)

# Root-level health check for Railway/deployment healthchecks
@app.get("/health")
async def root_health_check():
    return {"status": "ok"}

# Configure CORS
if settings.CORS_ORIGINS == '*':
    cors_origins = ["*"]
elif settings.CORS_ORIGINS:
    cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(',')]
else:
    cors_origins = [
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("WAZA Backend Starting Up")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("=" * 60)
    logger.info(f"Database: PostgreSQL")
    logger.info(f"Redis: {settings.REDIS_URL}")
    logger.info(f"Frontend URL: {settings.FRONTEND_URL}")
    logger.info(f"CORS Origins: {cors_origins}")
    logger.info(f"AI Service: Claude Sonnet 4.5 (Emergent LLM)")
    logger.info(f"WhatsApp: Mock Mode")
    logger.info(f"Payment: Stripe (Active) | CinetPay (Mock)")
    logger.info("=" * 60)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("WAZA Backend Shutting Down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
