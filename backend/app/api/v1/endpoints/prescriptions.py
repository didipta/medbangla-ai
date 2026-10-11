"""
MedBangla AI - Prescriptions REST Endpoints
===========================================
Fulfills Milestone 2 prescription analysis specification as defined in PROJECT_PLAN.md:
POST /api/v1/prescriptions/analyze
"""

import logging
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Query

from app.api.v1.endpoints.ocr import analyze_prescription, OCRAnalysisResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post(
    "/analyze",
    response_model=OCRAnalysisResponse,
    summary="Upload prescription image, run OCR + medicine matching",
    description="Endpoint defined in PROJECT_PLAN.md Section 6. Ingests prescription image, extracts text bounding boxes, dosages, and matches against verified medicines database."
)
async def analyze_prescription_endpoint(
    file: UploadFile = File(..., description="Prescription image file (JPG, PNG, WEBP)"),
    db_lookup: bool = Query(True, description="Enable automatic database matching"),
    use_vision_fallback: bool = Query(True, description="Enable Vision AI fallback for handwritten doctor scripts"),
):
    return await analyze_prescription(file=file, db_lookup=db_lookup, use_vision_fallback=use_vision_fallback)
