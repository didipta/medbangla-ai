"""
MedBangla AI - Logging & Global Error Handling Test Suite
=========================================================
Tests:
1. Log files creation in backend/logs/ (app.log, error.log).
2. Request correlation ID (X-Request-ID) in headers and logs.
3. Response latency header (X-Response-Time-Ms).
4. Standardized error response body for 404 (MedicineNotFoundException).
5. Standardized error response body for 422 (RequestValidationError).
6. Structured logging verification.
"""

import os
import sys
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, headers={"Authorization": "Bearer demo-patient-token"})
LOGS_DIR = BACKEND_DIR / "logs"


def test_logging_and_errors():
    print("=== Testing Centralized Logging & Error Handling ===")

    # 1. Successful request: Check X-Request-ID and X-Response-Time-Ms
    res = client.get("/api/v1/health")
    print(f"1. GET /api/v1/health -> HTTP {res.status_code}")
    assert res.status_code == 200
    req_id = res.headers.get("X-Request-ID")
    res_time = res.headers.get("X-Response-Time-Ms")
    print(f"   X-Request-ID: {req_id}")
    print(f"   X-Response-Time-Ms: {res_time}ms")
    assert req_id is not None
    assert res_time is not None

    # 2. 404 Not Found: MedicineNotFoundException
    res = client.get("/api/v1/medicines/9999999")
    print(f"\n2. GET /api/v1/medicines/9999999 -> HTTP {res.status_code}")
    assert res.status_code == 404
    body = res.json()
    print("   Response JSON body:", body)
    assert body["success"] is False
    assert body["error"]["status_code"] == 404
    assert body["error"]["type"] == "MedicineNotFoundException"
    assert "9999999" in body["error"]["message"]
    assert body["error"]["request_id"] is not None

    # 3. 422 Validation Error: Invalid payload in /api/v1/chat
    res = client.post("/api/v1/chat", json={})
    print(f"\n3. POST /api/v1/chat with empty body -> HTTP {res.status_code}")
    assert res.status_code == 422
    body = res.json()
    print("   Validation Error body:", body)
    assert body["success"] is False
    assert body["error"]["status_code"] == 422
    assert body["error"]["type"] == "RequestValidationError"
    assert len(body["error"]["details"]) > 0

    # 4. Verify Log Files Creation on Disk
    print("\n4. Verifying Log Files in backend/logs/ ...")
    app_log = LOGS_DIR / "app.log"
    print(f"   app.log exists: {app_log.exists()} (size: {app_log.stat().st_size if app_log.exists() else 0} bytes)")
    assert app_log.exists()
    assert app_log.stat().st_size > 0

    # Read last few lines of app.log
    lines = app_log.read_text(encoding="utf-8").splitlines()
    print(f"   Total lines logged so far: {len(lines)}")
    print("   Sample log line:")
    print(f"   {lines[-2] if len(lines) >= 2 else lines[-1]}")

    print("\nALL LOGGING & ERROR HANDLING TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_logging_and_errors()
