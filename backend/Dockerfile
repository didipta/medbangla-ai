# =============================================================================
# MedBangla AI — Production Backend Dockerfile
# Python 3.11 (FastAPI + OpenCV + RapidOCR/ONNX + PostgreSQL)
# =============================================================================

FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install minimal OS dependencies required for OpenCV, RapidOCR (ONNX), and Healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for optimal Docker layer caching
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy backend application source code, data, and scripts
COPY . ./

# Create logs directory and ensure appropriate write permissions
RUN mkdir -p /app/logs && \
    addgroup --system --gid 1000 appgroup && \
    adduser --system --uid 1000 --ingroup appgroup --no-create-home appuser && \
    chown -R appuser:appgroup /app

# Switch to non-privileged user for enhanced container security
USER appuser

# Expose backend port
EXPOSE 8000

# Docker healthcheck against the FastAPI health endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Start Uvicorn ASGI Server (dynamically binds to Render's $PORT or defaults to 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
