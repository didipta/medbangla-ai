"""
MedBangla AI - Prescriptions REST Endpoints
===========================================
Milestone 2 Prescription Analysis & Neon PostgreSQL Clinical History:
- POST /api/v1/prescriptions/analyze (OCR + RAG matching + auto-history save)
- GET /api/v1/prescriptions/history (List all past prescriptions for authenticated user)
- POST /api/v1/prescriptions/history (Save customized/analyzed prescription)
- GET /api/v1/prescriptions/history/{history_id} (Full prescription details)
- DELETE /api/v1/prescriptions/history/{history_id} (Delete prescription record)
Note: Images are NEVER saved to the database, ensuring zero bloat and high performance.
"""

import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends, Request, status
from pydantic import BaseModel

from app.api.v1.endpoints.ocr import analyze_prescription, OCRAnalysisResponse
from app.core.security import get_current_user, get_current_user_optional
from app.core.rate_limiter import rate_limiter
from app.services.prescription_history_service import (
    save_prescription_history,
    update_prescription_history,
    get_user_prescription_history,
    get_prescription_history_item,
    delete_prescription_history_item,
    get_daily_analysis_usage,
    record_prescription_analysis,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


class SaveHistoryRequest(BaseModel):
    data: Dict[str, Any]


@router.get(
    "/daily-quota",
    summary="Get daily prescription analysis quota for current user",
    description="Returns daily limit (2 per day), used count, and remaining quota."
)
def get_prescription_quota_endpoint(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    quota = get_daily_analysis_usage(user_id=current_user["id"])
    return {
        "status": "success",
        "data": quota,
    }


@router.get(
    "/usage-limits",
    summary="Get enterprise AI rate limits and daily quotas for current user",
    description="Returns quota status across all AI pipelines: OCR, Explainer, Medical Chat, Drug Safety, and Search."
)
def get_all_usage_limits_endpoint(
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    user_id = current_user.get("id") if current_user else None
    limits = rate_limiter.get_user_quota_summary(request, user_id=user_id)
    return {
        "status": "success",
        "limits": limits,
    }


@router.post(
    "/analyze",
    response_model=OCRAnalysisResponse,
    summary="Upload prescription image, run OCR + medicine matching and save history",
    description="Ingests prescription image, extracts text, dosages, matches against verified medicines database, and saves clinical history to database."
)
async def analyze_prescription_endpoint(
    request: Request,
    file: UploadFile = File(..., description="Prescription image file (JPG, PNG, WEBP)"),
    db_lookup: bool = Query(True, description="Enable automatic database matching"),
    use_vision_fallback: bool = Query(True, description="Enable Vision AI fallback for handwritten doctor scripts"),
    auto_save: bool = Query(True, description="Automatically save structured data to prescription history in database"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    # Enforce Software Safety First: Burst Protection + Daily Quota Guard
    if current_user and current_user.get("id"):
        rate_limiter.check_and_consume("prescription_ocr", request, user_id=current_user["id"])

    analysis_result = await analyze_prescription(file=file, db_lookup=db_lookup, use_vision_fallback=use_vision_fallback)

    # Record analysis execution in logs to increment count & reduce remaining quota
    if current_user and current_user.get("id"):
        record_prescription_analysis(user_id=current_user["id"])
        analysis_result.daily_quota = get_daily_analysis_usage(user_id=current_user["id"])

    # Automatically save structured data to Neon database if requested
    if auto_save and current_user and current_user.get("id"):
        try:
            result_dict = analysis_result.model_dump()
            saved_record = save_prescription_history(user_id=current_user["id"], data=result_dict)
            if saved_record and "id" in saved_record:
                analysis_result.history_id = saved_record["id"]
        except Exception as e:
            logger.warning("Could not auto-save prescription history for user %s: %s", current_user.get("id"), e)

    return analysis_result


@router.get(
    "/history",
    summary="Get prescription history for the current user",
    description="Returns summary list of all past prescriptions saved in Neon PostgreSQL."
)
def get_prescription_history_list(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    history = get_user_prescription_history(user_id=current_user["id"], limit=limit, offset=offset)
    return {
        "status": "success",
        "total_count": len(history),
        "history": history,
    }


@router.post(
    "/history",
    summary="Explicitly save prescription data to history",
    description="Saves structured clinical prescription data without image binary to database."
)
def create_prescription_history_record(
    payload: SaveHistoryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    saved = save_prescription_history(user_id=current_user["id"], data=payload.data)
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save prescription history to database."
        )
    return {
        "status": "success",
        "message": "প্রেসক্রিপশন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।",
        "history_item": saved,
    }


@router.get(
    "/history/{history_id}",
    summary="Get full prescription details from history",
    description="Retrieves complete medications, dosages, clinical entities, and text of a saved prescription."
)
def get_prescription_history_detail(
    history_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    item = get_prescription_history_item(user_id=current_user["id"], history_id=history_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription history entry not found."
        )
    return {
        "status": "success",
        "data": item,
    }


@router.put(
    "/history/{history_id}",
    summary="Update an existing prescription history entry",
    description="Updates medicines, dosages, and summary of a saved prescription under the same ID without duplicating."
)
def update_prescription_history_item(
    history_id: str,
    payload: SaveHistoryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    updated = update_prescription_history(
        user_id=current_user["id"],
        history_id=history_id,
        data=payload.data
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription history record not found or could not be updated."
        )
    return {
        "status": "success",
        "message": "প্রেসক্রিপশন সফলভাবে আপডেট করা হয়েছে।",
        "history_item": updated,
    }


@router.delete(
    "/history/{history_id}",
    summary="Delete a prescription history record",
    description="Removes a prescription history entry from database."
)
def remove_prescription_history_item(
    history_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    deleted = delete_prescription_history_item(user_id=current_user["id"], history_id=history_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or could not be deleted."
        )
    return {
        "status": "success",
        "message": "প্রেসক্রিপশন হিস্ট্রি থেকে মুছে ফেলা হয়েছে।",
    }
