# 🩺 MedBangla AI (মেডবাংলা এআই)

[![CI Pipeline](https://github.com/didipta/medbangla-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/didipta/medbangla-ai/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/didipta/medbangla-ai/actions/workflows/cd.yml/badge.svg)](https://github.com/didipta/medbangla-ai/actions/workflows/cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-brightgreen.svg)](https://www.python.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)

**AI-Powered Bangla Prescription Understanding & Medication Safety Assistant**  
Empowering patients and clinicians with intelligent prescription OCR, drug-drug interaction alerts grounded in Bangladesh DGDA clinical monographs, and accessible explanations in plain Bengali.

---

## 🌟 Key Features

- 📸 **Bilingual Prescription OCR**: High-speed OCR with RapidOCR (ONNX), PaddleOCR, and multimodal Vision AI fallback for handwritten prescriptions.
- 💊 **17,500+ BD Medicine Database**: Comprehensive index of Bangladesh brand names, generics, strengths, forms, and manufacturers.
- ⚠️ **Evidence-Based Drug Interaction Engine**: Detects dangerous drug combinations and contraindications with instant safety triage.
- 🇧🇩 **Clinical RAG Assistant**: Plain Bengali patient explanations grounded strictly in verified DGDA medical monographs.
- 🔐 **Secure Clinical Portal**: Role-based authentication (Patients, Doctors with BMDC verification, and Admins).

---

## 🚀 Quick Start with Docker

```bash
# 1. Clone repository
git clone https://github.com/didipta/medbangla-ai.git
cd medbangla-ai

# 2. Configure environment
cp .env.example .env

# 3. Start containers
docker compose up --build -d
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🔄 CI/CD Automation (GitHub Actions)

This repository includes enterprise-grade CI/CD pipelines:
- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Python 3.11 testing & linting with Pytest (FastAPI endpoints, error handling, logging).
  - Frontend TypeScript verification and Next.js 16 standalone production build.
  - Docker Compose configuration and container image build tests.
- **Continuous Deployment (`.github/workflows/cd.yml`)**:
  - Automated publishing of container images to **GitHub Container Registry (GHCR)**:
    - `ghcr.io/didipta/medbangla-ai/backend:latest`
    - `ghcr.io/didipta/medbangla-ai/frontend:latest`
  - Automated webhooks for PaaS (Render, Railway, Coolify) and SSH zero-downtime deployment to remote VPS servers.

📖 For complete pipeline documentation, secrets setup, and deployment options, see **[CI_CD_GUIDE.md](CI_CD_GUIDE.md)**.
