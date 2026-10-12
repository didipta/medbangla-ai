"""
MedBangla AI - FastAPI Endpoints Integration Test
=================================================
Validates:
- GET  /api/v1/health
- GET  /api/v1/medicines?q=Napa
- GET  /api/v1/rag/search?q=fever
- POST /api/v1/interactions/check
- POST /api/v1/chat
"""

import sys
import time
import json
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_endpoints():
    print("=== Testing FastAPI Endpoints ===")

    # 1. Health
    t0 = time.time()
    res = client.get("/api/v1/health")
    print(f"1. GET /api/v1/health -> {res.status_code} in {(time.time()-t0)*1000:.2f}ms")
    assert res.status_code == 200
    health_data = res.json()
    print("   Total RAG Chunks Indexed:", health_data.get("rag_indexer", {}).get("total_chunks_indexed"))
    print("   Interaction Engine Status:", health_data.get("interaction_engine", {}).get("status"))

    # 2. Medicines Search (with in-memory cache)
    t0 = time.time()
    res = client.get("/api/v1/medicines?q=Napa&limit=3")
    print(f"2. GET /api/v1/medicines?q=Napa -> {res.status_code} in {(time.time()-t0)*1000:.2f}ms")
    assert res.status_code == 200
    # Second search (cache hit test)
    t0 = time.time()
    res = client.get("/api/v1/medicines?q=Napa&limit=3")
    print(f"   (Cache Hit) GET /api/v1/medicines?q=Napa -> in {(time.time()-t0)*1000:.3f}ms")

    # 3. RAG Semantic Search
    t0 = time.time()
    res = client.get("/api/v1/rag/search?q=fever+pain+headache&limit=2")
    print(f"3. GET /api/v1/rag/search -> {res.status_code} in {(time.time()-t0)*1000:.2f}ms")
    assert res.status_code == 200
    data = res.json()
    print(f"   Found {data['count']} chunks, top chunk: {data['results'][0]['name_en']} ({data['results'][0]['section']})")

    # 4. Drug-Drug Interactions Check
    t0 = time.time()
    res = client.post(
        "/api/v1/interactions/check",
        json={"medicines": ["Ciprofloxacin", "Calcium Vitamin D3"]},
    )
    print(f"4. POST /api/v1/interactions/check -> {res.status_code} in {(time.time()-t0)*1000:.2f}ms")
    assert res.status_code == 200
    int_data = res.json()
    print("   Status:", int_data["overall_safety_status"], "| Warning:", int_data["interactions"][0]["severity_bn"])

    # 5. Bangla Conversational Chat
    t0 = time.time()
    res = client.post(
        "/api/v1/chat",
        json={"message": "প্যারাসিটামল কীভাবে কাজ করে?", "medicines": ["Paracetamol"]},
    )
    print(f"5. POST /api/v1/chat -> {res.status_code} in {(time.time()-t0)*1000:.2f}ms")
    assert res.status_code == 200
    chat_data = res.json()
    print("   Provider:", chat_data["llm_metadata"]["provider"])
    print("   Answer Snippet:", chat_data["answer_bn"][:150], "...")

    print("\nALL FASTAPI INTEGRATION TESTS PASSED!")


if __name__ == "__main__":
    test_endpoints()
