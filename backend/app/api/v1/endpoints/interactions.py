"""
MedBangla AI - Drug-Drug Interactions REST Endpoints
====================================================
Sub-millisecond pairwise medication safety verification API.
Endpoint: POST /api/v1/interactions/check
"""

import time
import logging
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from app.ai.rag.interactions import DrugInteractionEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interactions", tags=["Safety & Interactions"])


class MedicineItem(BaseModel):
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    brand_id: Optional[int] = None
    raw_token: Optional[str] = None


class InteractionCheckRequest(BaseModel):
    medicines: List[Union[str, MedicineItem]] = Field(
        ...,
        description="List of medicine names (e.g. ['Ciprofloxacin', 'Calcium D3', 'Napa']) or structured medicine objects.",
        examples=[["Ciprofloxacin", "Calcium Vitamin D3", "Paracetamol"]],
    )


class InteractionFinding(BaseModel):
    drug_a: str
    drug_b: str
    severity: str
    severity_bn: str
    effect_en: str
    effect_bn: str
    recommendation_bn: str
    management_strategy: Optional[str] = None
    source: str


class InteractionCheckResponse(BaseModel):
    status: str
    total_medicines_analyzed: int
    total_pairs_checked: int
    interactions_count: int
    overall_safety_status: str
    severity_breakdown: Dict[str, int]
    interactions: List[InteractionFinding]
    is_safe: bool
    execution_time_ms: float


@router.post(
    "/check",
    response_model=InteractionCheckResponse,
    summary="Check pairwise drug-drug interactions",
    description="Takes a list of medicines from a prescription, performs deterministic O(N^2) pairwise pharmacological analysis in <1ms, and returns severity warnings in Bengali and English.",
)
def check_drug_interactions(payload: InteractionCheckRequest = Body(...)):
    start_time = time.time()
    raw_items = payload.medicines

    if len(raw_items) < 2:
        return {
            "status": "success",
            "total_medicines_analyzed": len(raw_items),
            "total_pairs_checked": 0,
            "interactions_count": 0,
            "overall_safety_status": "SAFE",
            "severity_breakdown": {"CONTRAINDICATED": 0, "MAJOR": 0, "MODERATE": 0, "MINOR": 0},
            "interactions": [],
            "is_safe": True,
            "execution_time_ms": round((time.time() - start_time) * 1000, 2),
        }

    # Normalize input
    candidates = []
    for item in raw_items:
        if isinstance(item, str):
            candidates.append({"generic_name": item})
        elif isinstance(item, MedicineItem):
            candidates.append(item.model_dump())
        elif isinstance(item, dict):
            candidates.append(item)

    engine = DrugInteractionEngine.get_instance()
    report = engine.analyze_prescription_medicines(candidates)
    exec_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "status": "success",
        "total_medicines_analyzed": report["total_medicines_analyzed"],
        "total_pairs_checked": report["total_pairs_checked"],
        "interactions_count": report["interactions_count"],
        "overall_safety_status": report["overall_safety_status"],
        "severity_breakdown": report["severity_breakdown"],
        "interactions": report["interactions"],
        "is_safe": report["is_safe"],
        "execution_time_ms": exec_ms,
    }
