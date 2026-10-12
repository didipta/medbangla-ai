import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.core.exceptions import register_exception_handlers

# 1. Initialize Centralized Logging System
logger = setup_logging(
    log_level=settings.DEBUG and 10 or 20, # DEBUG if True else INFO
    enable_file_logging=True,
)

# 2. Instantiate FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bangla Prescription Understanding & Medication Safety API",
)

# 3. Add Middleware: Request & Error Logging
app.add_middleware(RequestLoggingMiddleware)

# 4. Add Middleware: CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Register Global Exception & Error Handlers
register_exception_handlers(app)


# =============================================================================
# Root & Health Endpoints
# =============================================================================

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "documentation": "/docs",
    }


@app.get("/api/v1/health")
def health_check():
    from app.ai.rag.indexer import ClinicalRAGIndexer
    from app.ai.rag.interactions import DrugInteractionEngine

    has_db = bool(settings.DATABASE_URL and "YOUR_PASSWORD" not in settings.DATABASE_URL)
    has_groq = bool(settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY"))
    has_gemini = bool(settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))

    indexer = ClinicalRAGIndexer.get_instance()
    interactions = DrugInteractionEngine.get_instance()

    return {
        "status": "healthy",
        "database_configured": has_db,
        "ocr_engine": "RapidOCR ONNX + Vision AI Fallback",
        "rag_indexer": {
            "is_loaded": indexer._is_loaded,
            "total_chunks_indexed": len(indexer.chunks),
            "vector_search_ready": indexer.dense_matrix is not None,
        },
        "interaction_engine": {
            "cached_monographs": len(interactions._doc_cache),
            "status": "operational",
        },
        "llm_providers": {
            "primary": "Groq (qwen/qwen3.8-27b)",
            "groq_configured": has_groq,
            "fallback": "Google Gemini (gemini-3.8-flash)",
            "gemini_configured": has_gemini,
            "offline_deterministic_fallback": True,
        },
        "allowed_origins": settings.cors_origins,
    }


from app.api.v1.api import api_router

# Include v1 REST Router
app.include_router(api_router)
