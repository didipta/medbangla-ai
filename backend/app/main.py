import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.middleware import RequestLoggingMiddleware, IPRateLimitMiddleware
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

# 3. Add Middleware: IP Rate Limiting (inward protection across all APIs)
app.add_middleware(IPRateLimitMiddleware)

# 4. Add Middleware: Request & Error Logging (middle audit layer)
app.add_middleware(RequestLoggingMiddleware)

# 5. Add Middleware: CORS (outermost layer so all responses including 429 have CORS headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
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


@app.get("/health")
@app.get("/api/v1/health")
def health_check(request: Request):
    from app.core.rate_limiter import rate_limiter
    from app.ai.rag.indexer import ClinicalRAGIndexer
    from app.ai.rag.interactions import DrugInteractionEngine

    rate_status = getattr(request.state, "ip_rate_status", None)
    if not rate_status:
        rate_status = rate_limiter.check_and_consume("health_ping", request)

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
        "rate_limit": {
            "client_ip": rate_limiter.extract_client_ip(request),
            "policy": "health_ping",
            "remaining": rate_status.get("remaining", 2000),
            "status": "allowed",
        },
        "allowed_origins": settings.cors_origins,
    }


from app.api.v1.api import api_router

# Include v1 REST Router
app.include_router(api_router)
