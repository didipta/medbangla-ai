# 🩺 MedBangla AI — Capstone Project Proposal (1–2 Pages)
**AI-Powered Bangla Prescription Understanding, Medication Safety & Clinical Decision Support System**

---

| **Project Proposal Metadata** | **Details** |
| :--- | :--- |
| **Project Title** | MedBangla AI (মেডবাংলা এআই) |
| **Track / Course** | AI Engineering Capstone Project |
| **Student / Author** | Didipta Ray & Antigravity Team |
| **Repository** | [https://github.com/didipta/medbangla-ai](https://github.com/didipta/medbangla-ai) |
| **Live Web App** | [https://medbangla.vercel.app](https://medbangla.vercel.app) *(or your deployed Vercel domain)* |
| **Live Backend API** | [https://medbangla-backend.onrender.com/docs](https://medbangla-backend.onrender.com/docs) |
| **Target Sector** | Bangladesh Healthcare, Digital Healthtech & Outpatient Pharmacies |

---

## 1. Problem Statement

In low- and middle-income nations like Bangladesh, clinical workloads in outpatient departments (OPDs) are intense—physicians routinely consult 60 to 100 patients each day. As a result:
1. **Severe Prescription Illegibility:** Over 70% of medical prescriptions are handwritten in hasty, cursive English, while instructions are given verbally or scribbled in Bengali shorthand (*"১+০+১ খাওয়ার পর"*, *"ভরা পেটে"*). Dispensing clerks and patients frequently misread brand names or confusing dosages, leading to adverse medication incidents.
2. **Unchecked Drug-Drug Interactions (DDIs):** Comorbid patients (e.g., suffering from diabetes, heart disease, or kidney conditions) are regularly prescribed multiple medications simultaneously. Without automated electronic cross-checks, dangerous drug pairs (e.g., ACE inhibitors combined with Potassium-sparing diuretics causing lethal hyperkalemia) are dispensed unnoticed.
3. **Language & Health Literacy Divide:** More than 85% of Bangladesh's population cannot read English pharmacological leaflets. Once patients leave the clinic, they forget verbal administration rules, leading to erratic compliance or hazardous overdosing.
4. **Economic Infeasibility of Cloud GPUs:** Commercial GPU cloud rentals ($300–$600/month) are completely unaffordable for rural community clinics and retail pharmacies in Bangladesh.

**Problem Definition:** There is an urgent need for an affordable, bilingual, and accessible AI platform that can transcribe cursive prescriptions from budget smartphone photos, validate them against the Bangladesh Directorate General of Drug Administration (DGDA) database, triage drug interactions in real time, and explain usage safely in native Bengali.

---

## 2. Proposed Solution

**MedBangla AI** is an end-to-end digital health platform engineered to bridge this clinical gap. It provides:
1. **Intelligent Bilingual Prescription Digitization:** Automatically preprocesses images taken with low-end mobile cameras (correcting skew, shadows, and low contrast) and extracts both English brand names and Bengali dosage patterns.
2. **Interactive Human-in-the-Loop Verification:** Provides a visual side-by-side canvas where patients or pharmacists can verify detected medicine candidates against high-confidence predictions before finalization.
3. **Automated Drug-Drug Interaction (DDI) Triage:** Runs an instantaneous $O(n^2)$ pairwise screening against an evidence-based clinical database, tagging combinations as *CONTRAINDICATED*, *MAJOR*, *MODERATE*, or *MINOR*.
4. **Culturally Grounded Bengali Clinical RAG:** A specialized Bengali conversational assistant answering patient questions (e.g., timing, side effects, dietary cautions) strictly grounded in official DGDA clinical monographs, backed by ethical guardrails preventing clinical hallucination.

---

## 3. AI / ML Approach & Methodology

MedBangla AI implements a **Hybrid Asymmetric AI Pipeline** designed to maximize accuracy while minimizing operating costs:

```
[Prescription Photo] ──> [OpenCV Preprocessing (Deskew/CLAHE)]
                                 │
                                 ▼
                     [Bilingual OCR Pipeline]
             ┌───────────────────┴───────────────────┐
             ▼ (Fast CPU Path: >75% Confidence)      ▼ (Cursive Fallback)
   [RapidOCR ONNX Runtime]                 [Cloud Vision AI (Gemini 2.0 Flash)]
             └───────────────────┬───────────────────┘
                                 │
                                 ▼
         [PostgreSQL pg_trgm Trigram Matching (17,589 DGDA Medicines)]
                                 │
                                 ▼
         [Pairwise Clinical Drug-Drug Interaction (DDI) Matrix]
                                 │
                                 ▼
         [Dense Vector Retrieval + Bengali Clinical RAG Assistant]
```

- **Image Preprocessing:** OpenCV bilateral filtering, Contrast-Limited Adaptive Histogram Equalization (CLAHE), and minimum area bounding box deskewing.
- **Hybrid OCR Engine:** Local CPU inference via RapidOCR (ONNX runtime) for sub-second ($<850\text{ms}$) recognition of printed text, coupled with a serverless Multimodal Vision AI fallback (Google Gemini 2.0 Flash / Groq Qwen-27B) for distorted cursive handwriting.
- **Trigram Fuzzy Entity Resolution:** PostgreSQL `pg_trgm` and Levenshtein distance matching against all 17,589 DGDA-registered brands and generic compounds, resolving OCR typos in $<18\text{ms}$.
- **Evidence-Grounded RAG:** Sentence-transformer dense vector embeddings indexed in `pgvector`. LLM responses are strictly bounded to retrieved monograph context, with deterministic safety disclaimers when context is missing.

---

## 4. Technology Stack

| Component | Selected Technologies |
| :--- | :--- |
| **Web Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Mobile Frontend** | Flutter 3.x, Dart, Material Design 3, Camera & Gallery integrations |
| **Backend REST API** | FastAPI, Uvicorn, Python 3.11+, Pydantic v2, AsyncIO |
| **Database & Vector Storage** | PostgreSQL 16 (Neon Serverless), `pgvector`, `pg_trgm`, Alembic |
| **Vision & AI Frameworks** | OpenCV (`opencv-python-headless`), RapidOCR (ONNX), PaddleOCR, Google Gemini Flash API |
| **DevOps & Deployment** | Docker, Docker Compose, GitHub Actions (CI/CD), GHCR, Vercel, Render |

---

## 5. Expected Outcomes & Impact

- **Sub-Second Processing:** Over 80% of prescriptions are transcribed and validated on standard CPU cores in under 1 second.
- **Ultra-Low Cost:** Processing cost reduced to approximately **1.29 BDT ($0.0105 USD)** per prescription, making it sustainable for resource-poor clinics.
- **Patient Safety:** Immediate identification of adverse polypharmacy interactions, saving lives and elevating digital health literacy in Bangladesh.
