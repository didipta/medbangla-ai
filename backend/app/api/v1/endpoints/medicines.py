"""
MedBangla AI - Medicines REST Endpoints
=======================================
Search across 17,589 Bangladesh brands and retrieve structured details.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, Request, Depends
from app.services.medicine_service import search_medicines, get_medicine_details
from app.core.exceptions import MedicineNotFoundException
from app.core.security import get_current_user_optional
from app.core.rate_limiter import rate_limiter

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.get("", summary="Search medicines by brand or generic name")
def search(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query, e.g. 'Napa', 'Paracetamol', 'Seclo'"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    user_id = current_user.get("id") if current_user else None
    rate_limiter.check_and_consume("medicine_search", request, user_id=user_id)

    results = search_medicines(query=q, limit=limit)
    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


@router.get("/{brand_id}", summary="Get detailed medicine information")
def get_details(brand_id: int):
    medicine = get_medicine_details(brand_id=brand_id)
    if not medicine:
        raise MedicineNotFoundException(brand_id)
    return medicine
