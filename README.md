# 🩺 MedBangla AI (মেডবাংলা এআই)
### AI-Powered Bilingual Prescription Digitization, Medication Safety Triage & Clinical Decision Support

[![CI Pipeline](https://github.com/didipta/medbangla-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/didipta/medbangla-ai/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/didipta/medbangla-ai/actions/workflows/cd.yml/badge.svg)](https://github.com/didipta/medbangla-ai/actions/workflows/cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-brightgreen.svg)](https://www.python.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B.svg)](https://flutter.dev/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL_16-00E599.svg)](https://neon.tech/)
[![Developed by Studio Peppers](https://img.shields.io/badge/Developed%20By-Studio%20Peppers-FF4B4B.svg)](https://github.com/didipta/medbangla-ai)
[![Project Purpose](https://img.shields.io/badge/Purpose-Study%20%26%20Research%20Capstone-blueviolet.svg)](https://github.com/didipta/medbangla-ai)
[![Full-Stack AI Capstone](https://img.shields.io/badge/Domain-AI%20%7C%20Python%20%7C%20Next.js%20%7C%20Flutter-orange.svg)](https://github.com/didipta/medbangla-ai)

> **MedBangla AI** is an advanced, end-to-end medical AI research and study capstone project conceived, architected, and built from scratch by **Studio Peppers (Didipta)**. It serves as a comprehensive demonstration of practical mastery across **Applied Artificial Intelligence (Computer Vision, ONNX & Clinical RAG)**, **Python Backend Architecture (FastAPI & PostgreSQL)**, **Next.js 16 Web Engineering**, and **Flutter Cross-Platform Mobile Development**. Engineered specifically for Bangladesh's clinical landscape, the platform provides a complete clinical safety net: **hybrid CPU-first bilingual OCR (RapidOCR + Gemini Flash)**, **fuzzy entity matching across 17,589+ DGDA-approved medicines**, **instant pairwise Drug-Drug Interaction (DDI) safety checks**, and a **Bengali Clinical RAG assistant** with strict medical guardrails.

---

## 🌐 Official Deployments & Quick Access Links

| Platform / Service | Live URL / Download Link | Description & Access Notes |
| :--- | :--- | :--- |
| 🎥 **Product Demo & Video Walkthrough** | **[Watch Demo Video (Google Drive)](https://drive.google.com/file/d/1PxjW_kfoqDayLrT40KsaAx7vCWg__ObY/view?usp=sharing)** | Complete end-to-end video demonstration showcasing prescription OCR, interactive verification, drug safety triage, and mobile app usage. |
| 💻 **Patient Web Application** | **[medbangla-ai-liart.vercel.app](https://medbangla-ai-liart.vercel.app/)** | Public patient portal: Interactive prescription upload, side-by-side verification canvas, interaction checker, and Bengali AI consultation. |
| 🛡️ **Clinical Admin Command Portal** | **[medbangla-ai-liart.vercel.app/admin](https://medbangla-ai-liart.vercel.app/admin)** | Clinical dashboard: KPI telemetry, prescription audits, user accounts, medicine catalog CRUD, interaction matrix, and live app control. |
| ⚡ **Production Backend REST API** | **[medbangla-ai.onrender.com](https://medbangla-ai.onrender.com/)** | High-performance FastAPI ASGI server deployed on Render with PostgreSQL connection pooling and CPU-optimized ONNX runtime. |
| 📑 **Interactive Swagger API Docs** | **[medbangla-ai.onrender.com/docs](https://medbangla-ai.onrender.com/docs)** | Interactive OpenAPI Swagger UI for executing and testing all endpoints with JWT Bearer authentication. |
| 📖 **ReDoc API Documentation** | **[medbangla-ai.onrender.com/redoc](https://medbangla-ai.onrender.com/redoc)** | Clean, hierarchical OpenAPI specifications and request/response schema explorer. |
| 📱 **Android Mobile App (APK)** | **[Download APK (Google Drive)](https://drive.google.com/file/d/1psf4w3CSwTM8RRKBZ-gXISFbU9MF3vfi/view?usp=drive_link)** | Production Android package (`.apk` v1.0.0, ~24.8 MB) featuring hardware camera scanner, offline DGDA catalog, and live maintenance hooks. |

### 🔑 Administrator Portal Access & Security Model

The Admin Portal implements a dual-tier security architecture:
- **1-Click Instant Demo Access (Public Sandbox):**  
  Public visitors, evaluators, and reviewers can access the complete administrative cockpit instantly on `/admin/login` using the **"⚡ এক ক্লিকে ডেমো অ্যাডমিন লগইন (1-Click Demo Login)"** button without needing credentials. It populates realistic simulated clinical audit records, KPI analytics, and infrastructure graphs.
- **Production Administrative Access (Restricted):**  
  Sensitive operational features — including live emergency mobile maintenance mode switching, force-update version requirements, and production Google Drive APK distribution — are **strictly restricted** to the verified project administrator. Production credentials are confidential and withheld from public repositories.

---

## 📑 Official Project Reports & Technical Documentation

For in-depth academic review, technical architecture, and implementation details, refer to the official capstone documents in this repository:

| Document | File Link | Focus & Coverage |
| :--- | :--- | :--- |
| 📑 **Capstone Final Report** | **[CAPSTONE_FINAL_REPORT.md](CAPSTONE_FINAL_REPORT.md)** | Academic 5-page capstone report: Problem formulation, clinical background, AI model performance evaluation, and safety guardrails. |
| 📄 **Infrastructure Report (English PDF)** | **[MedBangla_AI_Infrastructure_Report_EN.pdf](MedBangla_AI_Infrastructure_Report_EN.pdf)** | Publication-ready formal PDF report: Detailed system architecture, server sizing, RapidOCR ONNX latency benchmarks, and bilingual OCR pipeline ([বাংলা সংস্করণ PDF](MedBangla_AI_Infrastructure_Report_BN.pdf)). |
| 📘 **Infrastructure & GPU Audit** | **[SYSTEM_ARCHITECTURE_REPORT.md](MEDBANGLA_AI_SYSTEM_ARCHITECTURE_AND_INFRASTRUCTURE_REPORT.md)** | Detailed server sizing, RapidOCR ONNX inference latency benchmarks, cloud cost analysis, and bilingual processing architecture. |

---

## 🎓 Academic, Research & Study Purpose: Technical Mastery Matrix

> **Core Research Objective:**  
> This project was developed as a rigorous, self-directed **academic study and engineering capstone** to master and showcase the complete lifecycle of mission-critical healthcare AI software. It synthesizes theoretical knowledge and practical production engineering across four foundational pillars:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       STUDY & TECHNICAL KNOWLEDGE ARCHITECTURE                                                │
├────────────────────────────────┬────────────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│  🧠 Applied AI & Vision        │  🐍 Python Backend Systems     │  ⚛️ Next.js 16 Web Apps       │  📱 Flutter Mobile Apps      │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┼──────────────────────────────┤
│ • Hybrid CPU RapidOCR (ONNX)   │ • FastAPI Asynchronous Engine  │ • App Router & RSC Streaming  │ • Dart & Material Design 3   │
│ • Multimodal Gemini Fallback   │ • Pydantic v2 Schema Contracts │ • Side-by-Side Canvas Review  │ • Native Camera Acceleration │
│ • pgvector Semantic RAG        │ • Neon PostgreSQL Poolers      │ • Real-time Admin Telemetry   │ • Offline SQLite DGDA Sync   │
│ • Trigram Fuzzy Matching       │ • JWT Bearer Auth & Security   │ • Tailwind CSS & Lucide Icons │ • Dynamic App Maintenance    │
│ • Medical Guardrails           │ • Dual-Tier DB/Cache Sync      │ • Zero-Layout-Shift UX        │ • Google Drive In-App Update │
└────────────────────────────────┴────────────────────────────────┴───────────────────────────────┴──────────────────────────────┘
```

### 1. 🧠 Artificial Intelligence & Computer Vision Knowledge
- **Hybrid OCR Strategy:** Implemented a CPU-first edge-ready OCR runtime with RapidOCR (ONNX) achieving sub-second latency (250–850ms) for high-frequency printed text, coupled with an automated confidence triage layer that seamlessly routes cursive handwriting to Google Gemini 2.0/3.0 Flash.
- **Bilingual Bengali Clinical RAG:** Developed a Retrieval-Augmented Generation pipeline using `pgvector` semantic embeddings over DGDA drug monographs, with strict medical guardrails preventing clinical hallucination.
- **Fuzzy Entity Resolution:** Leveraged PostgreSQL trigram indexing (`pg_trgm`) and custom regular expressions to parse idiosyncratic Bengali dosage formats (`১+০+১`, `খাওয়ার আগে`) in $<18\text{ms}$.

### 2. 🐍 Python & Backend Systems Engineering Knowledge
- **Asynchronous ASGI Architecture:** Built with FastAPI and Python 3.11+, providing non-blocking concurrent request handling, structured dependency injection, and automatic OpenAPI schema generation.
- **Resilient Multi-Tier Persistence:** Engineered relational database schemas on Neon PostgreSQL with connection pooling, combined with local caching and offline fallback mechanisms for high-availability clinical triage.
- **Security & RBAC:** Authored custom JWT Bearer authorization layers, differentiating regular patient/doctor access from high-privilege Clinical Admin sessions.

### 3. ⚛️ Next.js 16 & Modern Web Engineering Knowledge
- **Next.js 16 App Router & Turbopack:** Designed with React Server Components (RSC) and client-side hydration for near-instant first contentful paint (FCP).
- **Interactive Verification Canvas:** Constructed a custom human-in-the-loop review interface featuring side-by-side image-to-text crop visualization, confidence badges, and live candidate editing.
- **Enterprise Clinical Cockpit:** Implemented real-time KPI charting, prescription audit history, and exclusive real-admin app lifecycle controls.

### 4. 📱 Flutter & Cross-Platform Mobile Engineering Knowledge
- **Production Flutter 3.x Architecture:** Engineered a modular, clean-architecture mobile client supporting both Android and iOS with shared business logic.
- **Hardware Integration & Camera Pipeline:** Integrated hardware-accelerated camera framing, aspect ratio cropping, image compression, and direct upload pipelines.
- **Dynamic Remote App Lifecycle:** Built a remote maintenance interceptor that reacts in real-time to administrative switches, coupled with an in-app update dialog directly fetching Google Drive APK releases.

---

## 🚨 The Healthcare Problem in Bangladesh

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│  70%+ Illegible Prescriptions        │     │  Polypharmacy & Drug Interactions    │     │  Language & Comprehension Barrier    │
│  Handwritten cursive leads to        │ ──> │  Patients taking 5-10 concurrent     │ ──> │  Pharmacology inserts are in English │
│  dispensing the wrong drug/strength  │     │  medications face fatal drug pairs   │     │  85%+ cannot decipher chamber advice │
└──────────────────────────────────────┘     └──────────────────────────────────────┘     └──────────────────────────────────────┘
```

1. **Illegible Doctor Handwriting:** Over 70% of outpatient prescriptions in Bangladesh are handwritten in cursive. Pharmacists and patients frequently misread brand names, causing dispensing errors and adverse drug events.
2. **Unscreened Polypharmacy:** Elderly and chronic-disease patients routinely take multiple prescription drugs simultaneously. Without automated screening, severe contraindicated combinations (e.g., Ciprofloxacin + Antacids, ACE Inhibitors + Potassium-sparing diuretics) go undetected.
3. **Language & Monograph Gap:** All official DGDA pharmacology monographs and package inserts are written in English. Over 85% of citizens cannot decipher pharmacological instructions and forget verbal chamber advice.

---

## 🖥️ Web Application Pages & Modules List (`frontend/app/`)

The MedBangla AI web application is built on **Next.js 16 (App Router)** with **TypeScript**, **Tailwind CSS**, and **Lucide Icons**:

| Route Path | Page Title / Module | Key Features & Functionality |
| :--- | :--- | :--- |
| **`/`** | **Home & Live Prescription Digitizer** | Interactive prescription image upload (drag-and-drop / file picker), OpenCV image preprocessing preview, side-by-side crop verification canvas, dosage frequency extraction (`১+০+১`), and candidate brand matching. |
| **`/checker`** | **Drug-Drug Interaction Checker** | Multi-drug safety triage engine. Users can add multiple brands or generics to evaluate pairwise pharmacological safety, risk severity (Contraindicated, Major, Moderate, Minor), clinical mechanism, and DGDA citations. |
| **`/medicines`** | **DGDA National Medicine Catalog** | Live searchable directory of 17,589+ DGDA-registered medicines. Filter by brand name, generic monograph, strength, dosage form (Tablet, Syrup, Injection), manufacturer, and government-regulated maximum retail price (MRP). |
| **`/about`** | **Clinical Mission & Architecture** | Comprehensive overview of the project's background, clinical safety protocols, hybrid OCR methodology, optical validation architecture, and research team. |
| **`/admin/login`** | **Admin Authentication Gateway** | Dual-tier access portal: 1-Click Instant Demo Login for evaluators and secure credential authentication (`admin@medbangla.ai`) with JWT session management. |
| **`/admin`** | **Clinical Intelligence Dashboard** | Real-time administrative cockpit: Total prescriptions scanned, overall OCR accuracy rate (94.2%), critical interaction alerts, latency breakdown, timeline volume charts, and severity distribution. |
| **`/admin/prescriptions`** | **Prescription Audit Ledger** | Detailed audit logs of all digitized prescriptions, patient identifiers, prescribing doctor metadata, OCR confidence scores, detected drug lists, and risk classifications. |
| **`/admin/users`** | **User Accounts & Doctor Registry** | Directory of registered healthcare professionals and patients. Displays BMDC registration numbers, account verification statuses, prescription counts, and session activity. |
| **`/admin/medicines`** | **Medicine Catalog CRUD Console** | Administrative management of the national medicine directory. Allows authorized staff to insert new pharmaceutical monographs, modify strengths/prices, and archive obsolete entries. |
| **`/admin/interactions`** | **Drug Safety Matrix Editor** | Dynamic matrix for managing drug-drug interactions. Clinical directors can add, update, or adjust severity levels, clinical mechanisms, and cautionary Bengali recommendations. |
| **`/admin/system`** | **Infrastructure & Telemetry Center** | Hardware and infrastructure telemetry: Live status of Neon Serverless PostgreSQL, RapidOCR ONNX runtime, vector indexing cache, AI API latencies, and cache purge triggers. |
| **`/admin/app-control`** | **App & Update Control Center** *(Real Admin Only)* | **Exclusive to Real Login:** Master switch for live emergency mobile maintenance mode, maintenance title/ETA messages, force-update minimum version requirements, Google Drive APK link resolver, and direct download distribution. |

---

## 📱 Flutter Mobile Application Screens List (`flutter_app/lib/`)

The MedBangla AI mobile app is engineered in **Flutter 3.x** for Android and iOS, optimized for low-end hardware in rural clinical environments:

| Screen File | Screen Name | Description & Capabilities |
| :--- | :--- | :--- |
| **`home_screen.dart`** | **Mobile Command Dashboard** | Home screen featuring quick-action tiles (*Scan Prescription*, *Check Interactions*, *Search Catalog*), national emergency hotline buttons (`999`, `16263`, `333`), and daily clinical safety tips. |
| **`scanner_screen.dart`** | **Camera & Gallery Scanner** | Hardware-accelerated camera view with real-time framing guide, flash toggle, gallery image selector, aspect ratio cropping, and asynchronous upload to the RapidOCR backend. |
| **`medicines_screen.dart`** | **Offline/Online Drug Directory** | Fast, indexed search across 17,589+ DGDA medicines with fuzzy spelling tolerance, pricing, dosage forms, manufacturer details, and indications in Bengali. |
| **`interaction_screen.dart`** | **Safety & Interaction Triage** | Multi-medicine selection drawer with instant pairwise screening. Displays color-coded risk alerts (Red = Contraindicated, Orange = Major, Yellow = Moderate) with BNF clinical evidence. |
| **`chat_screen.dart`** | **Bengali Clinical RAG Assistant** | Conversational chat interface with markdown formatting, voice input readiness, contextual question chips, and strictly grounded drug advice (food timings, dosage safety, side effects). |
| **`profile_screen.dart`** | **Patient Profile & Scan History** | Displays saved prescriptions, recent interaction checks, offline storage management, language toggles (Bengali/English), and support documentation. |
| **`main_navigation_screen.dart`** | **Navigation Shell** | Persistent bottom navigation bar with smooth transitions between Home, Medicines, Scanner, Interactions, and AI Assistant. |
| **`maintenance_screen.dart`** | **Emergency Maintenance Interceptor** | Full-screen barrier displayed automatically when Admin activates Maintenance Mode. Displays custom Bengali message, estimated resolution ETA, and emergency hotlines. |
| **`app_update_dialog.dart`** | **In-App Update Engine** | Checks backend version on startup. Shows flexible or mandatory/forced update modal with changelog notes and direct APK download from Google Drive. |

---

## 🔌 Complete REST API Endpoints Reference

All endpoints are hosted at `https://medbangla-ai.onrender.com/` under the `/api/v1` namespace. Interactive documentation is accessible at [`/docs`](https://medbangla-ai.onrender.com/docs).

### 1. Prescription OCR & Image Intelligence (`/api/v1/ocr`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/ocr/scan-prescription` | None | Upload prescription image (`multipart/form-data`). Performs OpenCV preprocessing, RapidOCR extraction with Gemini Vision fallback, dosage regex parsing, and trigram brand matching. |
| `GET` | `/api/v1/ocr/status` | None | Checks OCR engine health, RapidOCR ONNX model initialization, and GPU/CPU inference readiness. |

### 2. Drug-Drug Interaction Matrix (`/api/v1/interactions`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/interactions/check-interactions` | None | Accepts a list of medicine names or brand IDs. Computes all $O(n^2)$ pairwise combinations and returns categorized risk severities, clinical mechanisms, and Bengali advice. |

### 3. National Medicine Catalog (`/api/v1/medicines`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/medicines` | None | Search DGDA medicines by brand name, generic name, manufacturer, or dosage form with pagination. |
| `GET` | `/api/v1/medicines/{brand_id}` | None | Retrieve complete monograph details for a specific medicine (strength, packsize, price, indications). |

### 4. Bengali Clinical RAG Chatbot (`/api/v1/chat`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/chat/ask` | None | Asks a clinical question regarding prescribed medicines. Employs semantic vector retrieval over DGDA monographs and returns grounded Bengali advice. |
| `POST` | `/api/v1/chat/conversation` | Bearer | Multi-turn clinical conversational session with persistent context for authenticated patients or clinicians. |
| `GET` | `/api/v1/chat/history/{conv_id}` | Bearer | Retrieves historical Q&A exchanges for a given clinical conversation thread. |

### 5. Prescription Lifecycle Management (`/api/v1/prescriptions`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/prescriptions` | Bearer | Lists verified prescriptions associated with the authenticated user. |
| `POST` | `/api/v1/prescriptions` | Bearer | Saves a digitized prescription record with extracted medicines and doctor metadata. |
| `GET` | `/api/v1/prescriptions/{id}` | Bearer | Fetches detailed digitized prescription record by ID. |
| `PUT` | `/api/v1/prescriptions/{id}` | Bearer | Updates or corrects medicine names, dosages, or notes on an existing prescription. |
| `DELETE` | `/api/v1/prescriptions/{id}` | Bearer | Soft-deletes a prescription record from the patient's personal history. |

### 6. System Telemetry & Mobile App Control (`/api/v1/system`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/system/app-control` | None | Polled by Flutter mobile apps on launch. Returns maintenance mode state, custom messages, latest version code, force-update requirement, and direct APK download link. |
| `GET` | `/api/v1/system/download-apk` | None | Automatically redirects download managers and mobile browsers directly to the active Google Drive APK download link. |

### 7. User Authentication & Profile (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | None | Authenticates user credentials (email & password) and issues an access JWT. |
| `POST` | `/api/v1/auth/register` | None | Registers a new patient or doctor account with BMDC registration number. |
| `GET` | `/api/v1/auth/me` | Bearer | Returns the profile of the currently authenticated user. |
| `PUT` | `/api/v1/auth/me` | Bearer | Updates user profile details, BMDC credentials, or contact information. |

### 8. Administrator Command Portal (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/admin/login` | None | Authenticates clinical administrator (`admin@medbangla.ai` or instant demo) and issues high-privilege Admin JWT. |
| `GET` | `/api/v1/admin/me` | Admin | Validates active administrator session and returns profile information. |
| `GET` | `/api/v1/admin/stats` | Admin | Returns clinical KPI summary, scan volume time series, severity breakdown, and AI engine latencies. |
| `GET` | `/api/v1/admin/prescriptions` | Admin | Paginated audit log of all system prescriptions with OCR confidence and risk flags. |
| `DELETE` | `/api/v1/admin/prescriptions/{id}` | Admin | Soft-deletes or archives an erroneous prescription audit record. |
| `GET` | `/api/v1/admin/users` | Admin | Paginated list of registered users with BMDC registration verification status. |
| `GET` | `/api/v1/admin/medicines` | Admin | Administrative search and catalog list of DGDA medicines. |
| `POST` | `/api/v1/admin/medicines` | Admin | Inserts a new brand or generic monograph into the national catalog. |
| `PUT` | `/api/v1/admin/medicines/{id}` | Admin | Updates an existing medicine's strength, formulation, pricing, or manufacturer. |
| `DELETE` | `/api/v1/admin/medicines/{id}` | Admin | Removes or deprecates an unlisted drug from active clinical search. |
| `GET` | `/api/v1/admin/interactions` | Admin | Lists all interaction rules in the clinical matrix. |
| `POST` | `/api/v1/admin/interactions` | Admin | Adds a new drug interaction pair with severity level and Bengali clinical advice. |
| `PUT` | `/api/v1/admin/interactions/{id}` | Admin | Updates interaction severity, pharmacological mechanism, or citations. |
| `DELETE` | `/api/v1/admin/interactions/{id}` | Admin | Removes an interaction rule from the clinical safety matrix. |
| `GET` | `/api/v1/admin/system/diagnostics` | Admin | Infrastructure telemetry: Database connectivity, memory usage, RapidOCR status, and chunk indices. |
| `POST` | `/api/v1/admin/system/cache/clear` | Admin | Purges in-memory vector cache and reloads DGDA trigram indexes. |
| `GET` | `/api/v1/admin/app-control` | **Real Admin** | **Real Login Only:** Retrieves live mobile app control settings, maintenance state, and APK URLs. |
| `PUT` | `/api/v1/admin/app-control` | **Real Admin** | **Real Login Only:** Publishes new mobile maintenance status, force-update versions, and updates APK links. |
| `POST` | `/api/v1/admin/app-control/test-drive-link` | **Real Admin** | **Real Login Only:** Validates a Google Drive share URL and converts it into a direct download URL. |

---

## 🧠 AI/ML Architecture & Pipeline Flow

```
                                ┌────────────────────────────────────────┐
                                │       Prescription Image Upload        │
                                └──────────────────┬─────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────────┐
                                │   Stage 1: OpenCV Image Preprocessing  │
                                │   - Bilateral Denoising                │
                                │   - CLAHE Adaptive Contrast            │
                                │   - Deskew & Perspective Normalization │
                                └──────────────────┬─────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────────┐
                                │   Stage 2: Hybrid Bilingual OCR Hub    │
                                │   - RapidOCR (ONNX CPU Runtime)        │
                                │   - Confidence Evaluation (< 75%)      │
                                │   - Multimodal Fallback (Gemini Flash) │
                                └──────────────────┬─────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────────┐
                                │   Stage 3: Normalization & Fuzzy Match │
                                │   - Regex Dosage Extractor (1+0+1)     │
                                │   - PostgreSQL pg_trgm Trigram Search  │
                                │   - 17,589 DGDA Brand & Generic Catalog│
                                └──────────────────┬─────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────────┐
                                │   Stage 4: Pairwise Interaction Engine │
                                │   - Severity Triage (CONTRAINDICATED)  │
                                │   - Evidence-Grounded Pharmacovigilance│
                                └──────────────────┬─────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────────┐
                                │   Stage 5: Bengali Clinical RAG Engine │
                                │   - Dense Semantic Retrieval (pgvector)│
                                │   - Grounded LLM Context Synthesis     │
                                │   - Strict Hallucination Guardrails    │
                                └────────────────────────────────────────┘
```

1. **CPU-First Hybrid Vision Pipeline:** RapidOCR runs on standard CPU with sub-second latency (250–850ms). When handwritten cursive confidence drops below 75%, crops are routed to Gemini Flash multimodal vision, keeping inference costs under **1.29 BDT ($0.0105 USD)** per prescription.
2. **Entity Extraction & Trigram Similarity:** Regex parses Bengali dosage frequencies (`১+০+১`, `খাওয়ার আগে`). Postgres `pg_trgm` calculates trigram similarity against 17,589 DGDA monographs in $<18\text{ms}$.
3. **Evidence-Grounded DDI Matrix:** Evaluates all $O(n^2)$ pairs against BNF and DGDA safety matrices, categorizing risk into Contraindicated, Major, Moderate, and Minor.
4. **Bengali Clinical RAG & Guardrails:** DGDA monographs indexed in `pgvector`. LLM outputs are strictly bounded by retrieved context to prevent hallucinated medical diagnoses.

---

## 💻 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Web Frontend** | Next.js 16 (App Router), TypeScript, Vanilla CSS / Tailwind CSS, Lucide React |
| **Mobile Frontend** | Flutter 3.x, Dart, Material Design 3, Camera & Gallery integrations, Provider |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python 3.11+, AsyncIO |
| **Database & Search** | PostgreSQL 16 (Neon Serverless), `pgvector`, `pg_trgm`, Psycopg2 |
| **Computer Vision / OCR** | OpenCV (`opencv-python-headless`), RapidOCR (ONNX CPU Runtime), PaddleOCR |
| **AI / LLM Providers** | Google Gemini 2.0/3.0 Flash, Groq Qwen-27B, SentenceTransformers |
| **DevOps & Hosting** | Vercel (Web), Render (FastAPI ASGI), Google Drive (APK Distribution), Docker |

---

## 🛠️ Local Installation & Development Setup

### Option 1: Quickstart with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/didipta/medbangla-ai.git
cd medbangla-ai

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch all services
docker compose up --build -d
```

- **Web Frontend:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint:** [http://localhost:8000/api/v1/system/app-control](http://localhost:8000/api/v1/system/app-control)

---

### Option 2: Manual Local Setup

#### 1. Backend Service (FastAPI + Python 3.11)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Web Frontend (Next.js 16)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 3. Mobile Application (Flutter 3.x)
```bash
cd flutter_app

# Fetch dependencies
flutter pub get

# Run on connected Android device or emulator
flutter run
```

---

## 🔒 Ethical Guardrails & Clinical Disclaimer

> **IMPORTANT CLINICAL NOTICE:**  
> **MedBangla AI is strictly an informational and verification assistant.**  
> It is **not** a licensed medical doctor and does **not** provide clinical diagnoses, alter prescribed drug dosages, or recommend self-medication. Patients must always consult a registered healthcare practitioner or pharmacist before initiating or modifying any medication regimen.

---

## 👨‍💻 Project Authorship & Ownership

> **MedBangla AI** is an original proprietary medical technology initiative proudly conceived, designed, and engineered by **Studio Peppers (Didipta)**.
> 
> It was developed as a comprehensive **academic study and portfolio capstone** to integrate and demonstrate advanced capabilities in **Applied AI & Computer Vision**, **Python Backend Architecture**, **Next.js 16 Web Engineering**, and **Flutter Cross-Platform Mobile Development**.
> 
> - **Lead Engineering Studio:** **Studio Peppers**
> - **Project Creator & Lead Architect:** **Didipta** ([GitHub Profile](https://github.com/didipta))
> - **Official Repository:** [github.com/didipta/medbangla-ai](https://github.com/didipta/medbangla-ai)
> - **Inquiries & Technical Collaboration:** [contact@studiopeppers.com](mailto:contact@studiopeppers.com) / [support@medbangla.ai](mailto:support@medbangla.ai)

---

## 📜 License & Acknowledgments

This project is open-source under the [MIT License](LICENSE).  
- Designed and developed by **Studio Peppers**.  
- Pharmacological data provided by the **Directorate General of Drug Administration (DGDA), Bangladesh**.  
- Drug interaction taxonomy adapted from international clinical reference standards (BNF, Stockley's).  
- Developed by the **Studio Peppers Clinical & Engineering Team**.
