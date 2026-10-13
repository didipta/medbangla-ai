"""
MedBangla AI - Prescription OCR REST Endpoints
==============================================
Production API for prescription image upload, computer vision preprocessing,
neural OCR text extraction, dosage entity detection, and medicine catalogue matching.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Form, Request, Depends
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import get_current_user_optional
from app.core.rate_limiter import rate_limiter
from app.ai.ocr.engine import PrescriptionOCREngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["Vision & OCR"])


# =============================================================================
# Pydantic Response Schemas (Pydantic v2)
# =============================================================================

class BoundingBox(BaseModel):
    x: int = Field(..., description="Top-left X pixel coordinate")
    y: int = Field(..., description="Top-left Y pixel coordinate")
    width: int = Field(..., description="Box width in pixels")
    height: int = Field(..., description="Box height in pixels")


class LineResult(BaseModel):
    line_index: int
    text: str
    confidence: float
    bounding_box: BoundingBox
    polygon: List[List[int]]
    dosage_findings: List[Dict[str, Any]] = []
    matched_medicine: Optional[Dict[str, Any]] = None


class DetectedMedicine(BaseModel):
    raw_token: str
    matched_brand: str
    brand_id: Optional[int] = None
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    form: Optional[str] = None
    manufacturer: Optional[str] = None
    confidence: float
    match_score: float
    requires_verification: bool
    line_index: Optional[int] = None
    bounding_box: Optional[BoundingBox] = None


class DosageInstruction(BaseModel):
    type: str
    value: str
    description: str
    line_index: Optional[int] = None


class OCRSummary(BaseModel):
    total_lines_detected: int
    total_text_lines_read: int
    total_medicines_matched: int
    average_confidence: float
    requires_verification_count: int


class ImageMetadata(BaseModel):
    original_width: int
    original_height: int
    processed_width: int
    processed_height: int
    skew_angle: float


class OCRAnalysisResponse(BaseModel):
    status: str
    filename: str
    image_metadata: ImageMetadata
    summary: OCRSummary
    clinical_entities: Optional[Dict[str, Any]] = None
    raw_text: str
    lines: List[LineResult]
    detected_medicines: List[DetectedMedicine]
    dosage_instructions: List[DosageInstruction]
    vision_fallback_applied: bool = False
    vision_provider: Optional[str] = None
    history_id: Optional[str] = None
    daily_quota: Optional[Dict[str, Any]] = None
    execution_time_ms: float


# =============================================================================
# Endpoints
# =============================================================================

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


@router.post(
    "/analyze",
    response_model=OCRAnalysisResponse,
    summary="Upload prescription image and extract complete OCR & medicine data",
    description="Accepts JPG/PNG prescription image, applies OpenCV preprocessing, text detection, neural CTC recognition, dosage parsing, and database matching."
)
async def analyze_prescription(
    file: UploadFile = File(..., description="Prescription image file (JPG, PNG, WEBP)"),
    db_lookup: bool = Query(True, description="Enable automatic database matching against 17,589 Bangladesh brands"),
    use_vision_fallback: bool = Query(True, description="Enable Vision AI fallback for handwritten doctor scripts"),
    request: Request = None,  # type: ignore
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    # Enforce rate limit if request context is present
    if request:
        user_id = current_user.get("id") if current_user else None
        rate_limiter.check_and_consume("prescription_ocr", request, user_id=user_id, consume=False)

    # 1. Validate file extension
    filename = file.filename or "prescription.jpg"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # 2. Read file bytes and validate size
    try:
        contents = await file.read()
    except Exception as e:
        logger.error("Failed to read uploaded file: %s", e)
        raise HTTPException(status_code=400, detail="Failed to read uploaded file")

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    # 3. Execute OCR Pipeline
    try:
        engine = PrescriptionOCREngine.get_instance()
        result = engine.process_prescription(
            image_bytes=contents,
            verified_brands=None,
            db_lookup=db_lookup,
            use_vision_fallback=use_vision_fallback,
        )
        result["filename"] = filename
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        logger.exception("OCR Pipeline error during prescription analysis")
        raise HTTPException(
            status_code=500, detail=f"OCR processing failed: {str(exc)}"
        )


@router.get("/status", summary="Check OCR Engine & model readiness")
def get_ocr_status():
    """Returns OCR model initialization status, dictionary size, and available capabilities."""
    engine = PrescriptionOCREngine.get_instance()
    return {
        "engine": "MedBangla PrescriptionOCREngine",
        "is_initialized": engine._is_initialized,
        "dictionary_tokens_count": len(engine.character_dict),
        "has_native_predictor": engine.predictor is not None,
        "supported_features": [
            "opencv_dpi_normalization",
            "clahe_contrast_enhancement",
            "adaptive_deskew",
            "text_line_bounding_boxes",
            "polygon_coordinates",
            "dosage_frequency_parsing",
            "bengali_digit_normalization",
            "database_fuzzy_brand_matching",
            "groq_qwen_vision_primary",
            "gemini_vision_fallback"
        ],
        "vision_ai_status": {
            "primary": "groq (qwen/qwen3.8-27b)",
            "fallback": "google-gemini (gemini-3.8-flash)",
            "vision_provider": getattr(settings, "VISION_PROVIDER", "groq"),
            "groq_configured": bool(settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")),
            "gemini_configured": bool(settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")),
        }
    }
