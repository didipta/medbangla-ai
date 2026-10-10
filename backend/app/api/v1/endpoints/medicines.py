"""
MedBangla AI - Medicines REST Endpoints
=======================================
Search across 17,589 Bangladesh brands and retrieve structured details.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.medicine_service import search_medicines, get_medicine_details

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.get("", summary="Search medicines by brand or generic name")
def search(
    q: str = Query(..., min_length=2, description="Search query, e.g. 'Napa', 'Paracetamol', 'Seclo'"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
):
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
        raise HTTPException(status_code=404, detail=f"Medicine with ID {brand_id} not found")
    return medicine
