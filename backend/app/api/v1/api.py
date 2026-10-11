"""
MedBangla AI - API Router v1
============================
Consolidates endpoints for Medicines, OCR Vision, Prescriptions, and Safety.
"""

from fastapi import APIRouter
from app.api.v1.endpoints.medicines import router as medicines_router
from app.api.v1.endpoints.ocr import router as ocr_router
from app.api.v1.endpoints.prescriptions import router as prescriptions_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(medicines_router)
api_router.include_router(ocr_router)
api_router.include_router(prescriptions_router)
