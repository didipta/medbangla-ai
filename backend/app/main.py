import sys
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bangla Prescription Understanding & Medication Safety API",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "online",
    }


@app.get("/api/v1/health")
def health_check():
    has_db_configured = bool(settings.DATABASE_URL and "YOUR_PASSWORD" not in settings.DATABASE_URL)
    return {
        "status": "healthy",
        "database_configured": has_db_configured,
        "allowed_origins": settings.cors_origins,
    }


from app.api.v1.api import api_router

# Include v1 REST Router
app.include_router(api_router)


