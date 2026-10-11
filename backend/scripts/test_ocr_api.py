"""
MedBangla AI - Prescription OCR API Integration Test
====================================================
Tests OCR status, image upload endpoint, bounding box extraction,
and response structure using FastAPI TestClient.
"""

import sys
from pathlib import Path

# Add backend directory to path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import io
import cv2
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_synthetic_prescription_image() -> bytes:
    """Generates a synthetic prescription document image with lines and dosage."""
    img = np.full((500, 700, 3), 255, dtype=np.uint8)

    # Header
    cv2.putText(img, "Prescription / Rx", (50, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (20, 20, 20), 2)
    cv2.line(img, (50, 80), (650, 80), (100, 100, 100), 2)

    # Medicine Lines
    cv2.putText(img, "Tab. Napa 500mg", (50, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "1 + 0 + 1 (after meal)", (80, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (30, 30, 30), 2)

    cv2.putText(img, "Cap. Seclo 20mg", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "1 + 0 + 0 (before meal)", (80, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (30, 30, 30), 2)

    cv2.putText(img, "Syp. Tofen 100ml", (50, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "1 tsp daily", (80, 400), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (30, 30, 30), 2)

    _, buffer = cv2.imencode(".png", img)
    return buffer.tobytes()


def run_tests():
    print("==================================================")
    print("  Testing MedBangla AI Prescription OCR API")
    print("==================================================")

    # 1. Test Status Endpoint
    print("\n[1] Testing GET /api/v1/ocr/status...")
    status_resp = client.get("/api/v1/ocr/status")
    print("Status code:", status_resp.status_code)
    assert status_resp.status_code == 200, f"Status failed: {status_resp.text}"
    status_data = status_resp.json()
    print("Status data:", status_data)
    assert status_data["engine"] == "MedBangla PrescriptionOCREngine"
    assert status_data["dictionary_tokens_count"] > 0

    # 2. Test Image Upload to /api/v1/ocr/analyze
    print("\n[2] Testing POST /api/v1/ocr/analyze...")
    img_bytes = create_synthetic_prescription_image()
    files = {"file": ("rx_sample.png", io.BytesIO(img_bytes), "image/png")}

    analyze_resp = client.post("/api/v1/ocr/analyze?db_lookup=true", files=files)
    print("Status code:", analyze_resp.status_code)
    assert analyze_resp.status_code == 200, f"Analyze failed: {analyze_resp.text}"
    data = analyze_resp.json()

    print("\n--- OCR Analysis Result ---")
    print("Filename:", data.get("filename"))
    print("Execution time:", data.get("execution_time_ms"), "ms")
    print("Summary:", data.get("summary"))
    print("Lines detected:", len(data.get("lines", [])))
    print("Dosage instructions found:", len(data.get("dosage_instructions", [])))
    for d in data.get("dosage_instructions", []):
        print(f"  - [{d.get('type')}] {d.get('value')} ({d.get('description')})")

    # Assert required fields exist
    assert "image_metadata" in data
    assert "lines" in data
    assert len(data["lines"]) > 0
    first_line = data["lines"][0]
    assert "bounding_box" in first_line
    assert "polygon" in first_line
    assert "x" in first_line["bounding_box"]
    assert "y" in first_line["bounding_box"]

    # 3. Test POST /api/v1/prescriptions/analyze (PROJECT_PLAN.md specification)
    print("\n[3] Testing POST /api/v1/prescriptions/analyze...")
    files2 = {"file": ("rx_sample2.png", io.BytesIO(img_bytes), "image/png")}
    rx_resp = client.post("/api/v1/prescriptions/analyze?db_lookup=true", files=files2)
    print("Status code:", rx_resp.status_code)
    assert rx_resp.status_code == 200, f"Prescriptions endpoint failed: {rx_resp.text}"
    rx_data = rx_resp.json()
    assert rx_data["status"] == "success"
    assert len(rx_data["lines"]) > 0

    print("\n==================================================")
    print("  ALL OCR INTEGRATION TESTS PASSED SUCCESSFULLY!  ")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
