"""
MedBangla AI - API Router v1
"""

from fastapi import APIRouter
from app.api.v1.endpoints.medicines import router as medicines_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(medicines_router)
