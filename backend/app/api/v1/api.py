"""
MedBangla AI - API Router v1
============================
Consolidates endpoints for Medicines, OCR Vision, Prescriptions,
Drug Interactions Safety, and Conversational Bangla RAG.
"""

from fastapi import APIRouter
from app.api.v1.endpoints.medicines import router as medicines_router
from app.api.v1.endpoints.ocr import router as ocr_router
from app.api.v1.endpoints.prescriptions import router as prescriptions_router
from app.api.v1.endpoints.interactions import router as interactions_router
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.admin import router as admin_router

api_router = APIRouter(prefix="/api/v1")

# Public Authentication router (login, config, callbacks)
api_router.include_router(auth_router)

# Dedicated Clinical Administrator Portal router (handles its own admin security)
api_router.include_router(admin_router)

# Functional Clinical & Medication APIs (each endpoint applies its own fine-grained auth & rate limiting)
api_router.include_router(medicines_router)
api_router.include_router(ocr_router)
api_router.include_router(prescriptions_router)
api_router.include_router(interactions_router)
api_router.include_router(chat_router)
