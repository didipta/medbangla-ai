"""
MedBangla AI - Conversational RAG & Prescription Explanation Endpoints
=======================================================================
Provides natural Bangla Q&A, comprehensive prescription explanation,
and direct semantic search over clinical monographs.

Endpoints:
- POST /api/v1/chat: Ask medical/prescription questions in Bangla.
- POST /api/v1/prescriptions/explain: Full clinical explanation of a prescription.
- GET  /api/v1/rag/search: Semantic vector + keyword search over clinical chunks.
"""

import time
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from app.ai.rag.engine import MedBanglaRAGEngine
from app.ai.rag.indexer import ClinicalRAGIndexer

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat & Clinical RAG"])


# =============================================================================
# Schemas
# =============================================================================

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question in Bangla or English", example="প্যারাসিটামল খালি পেটে খাওয়া যায়?")
    medicines: Optional[List[str]] = Field(default=[], description="Active medicines list to focus context")
    chat_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")


class SourceReference(BaseModel):
    chunk_id: Optional[str] = None
    generic_name: Optional[str] = None
    section: Optional[str] = None
    score: Optional[float] = None


class LLMMetadata(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None


class ChatResponse(BaseModel):
    status: str
    question: str
    answer_bn: str
    retrieved_sources: List[SourceReference]
    llm_metadata: LLMMetadata
    disclaimer: str
    execution_time_ms: float


class ExplainPrescriptionRequest(BaseModel):
    medicines: List[Dict[str, Any]] = Field(..., description="List of detected or confirmed prescription medicines")
    clinical_notes: Optional[List[str]] = Field(default=None, description="Doctor notes or diagnosis findings")
    patient_info: Optional[Dict[str, Any]] = Field(default=None, description="Patient metadata (age, gender, etc.)")


# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask a question about medicines or prescription in natural Bangla",
    description="Uses hierarchical RAG retrieval and Groq/Gemini to deliver clinically grounded explanations in everyday Bangla.",
)
def chat_with_assistant(payload: ChatRequest = Body(...)):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    engine = MedBanglaRAGEngine.get_instance()
    res = engine.chat_qa(
        question=payload.message.strip(),
        context_medicines=payload.medicines,
        chat_history=payload.chat_history,
    )
    res["status"] = "success"
    return res


@router.post(
    "/prescriptions/explain",
    summary="Generate comprehensive clinical explanation for a prescription",
    description="Analyzes all medicines, checks pairwise interactions, retrieves monograph sections, and provides a structured patient summary in Bangla.",
)
def explain_prescription_endpoint(payload: ExplainPrescriptionRequest = Body(...)):
    if not payload.medicines:
        raise HTTPException(status_code=400, detail="Medicines list cannot be empty")

    engine = MedBanglaRAGEngine.get_instance()
    res = engine.explain_prescription(
        medicines=payload.medicines,
        clinical_notes=payload.clinical_notes,
        patient_info=payload.patient_info,
    )
    return res


@router.get(
    "/rag/search",
    summary="Fast semantic vector search over clinical document chunks",
    description="Sub-millisecond retrieval testing over pre-indexed clinical monographs.",
)
def search_clinical_documents(
    q: str = Query(..., min_length=2, description="Search query in Bangla or English"),
    medicine: Optional[str] = Query(None, description="Filter by generic name/slug"),
    section: Optional[str] = Query(None, description="Filter by section (indications, dosage, side_effects, etc.)"),
    limit: int = Query(5, ge=1, le=20, description="Number of chunks to return"),
):
    start_time = time.time()
    indexer = ClinicalRAGIndexer.get_instance()
    med_filter = [medicine] if medicine else None

    results = indexer.search(
        query=q,
        medicine_filter=med_filter,
        section_filter=section,
        top_k=limit,
    )
    exec_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "query": q,
        "count": len(results),
        "execution_time_ms": exec_ms,
        "results": [
            {
                "chunk_id": r.get("chunk_id"),
                "name_en": r.get("name_en"),
                "name_bn": r.get("name_bn"),
                "section": r.get("section_key"),
                "section_title_bn": r.get("section_title_bn"),
                "score": r.get("retrieval_score"),
                "preview_bn": (r.get("content_bn") or "")[:250],
                "preview_en": (r.get("content_en") or "")[:250],
            }
            for r in results
        ],
    }
