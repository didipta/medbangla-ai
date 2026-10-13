"""
MedBangla AI - Standardized Exception & Error Handling
======================================================
Custom domain exceptions and centralized FastAPI handlers providing
structured JSON error bodies and full stack trace logging.
"""

import time
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException

logger = logging.getLogger("medbangla.errors")


# =============================================================================
# Custom Domain Exceptions
# =============================================================================

class MedBanglaException(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class MedicineNotFoundException(MedBanglaException):
    def __init__(self, brand_id_or_name: Any):
        super().__init__(
            message=f"Medicine '{brand_id_or_name}' not found in catalogue",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class OCRProcessingException(MedBanglaException):
    def __init__(self, reason: str):
        super().__init__(
            message=f"OCR analysis failed: {reason}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class ClinicalRAGException(MedBanglaException):
    def __init__(self, reason: str):
        super().__init__(
            message=f"Clinical RAG retrieval failed: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class DatabaseUnavailableException(MedBanglaException):
    def __init__(self, reason: str = "Database connection unavailable"):
        super().__init__(
            message=reason,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


# =============================================================================
# Error Response Helper
# =============================================================================

def create_error_response(
    status_code: int,
    error_type: str,
    message: str,
    request: Request,
    details: Optional[Any] = None,
    headers: Optional[Dict[str, str]] = None,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    payload = {
        "success": False,
        "error": {
            "status_code": status_code,
            "type": error_type,
            "message": message,
            "details": details,
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
    return JSONResponse(status_code=status_code, content=payload, headers=headers)


# =============================================================================
# FastAPI Global Exception Handlers Registration
# =============================================================================

def register_exception_handlers(app: FastAPI):
    """Binds all centralized error handlers to the FastAPI application instance."""

    @app.exception_handler(MedBanglaException)
    async def medbangla_custom_handler(request: Request, exc: MedBanglaException):
        req_id = getattr(request.state, "request_id", "-")
        logger.warning(
            "MedBanglaException [%d] %s: %s [req_id: %s]",
            exc.status_code,
            type(exc).__name__,
            exc.message,
            req_id,
        )
        return create_error_response(
            status_code=exc.status_code,
            error_type=type(exc).__name__,
            message=exc.message,
            request=request,
            details=exc.details,
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        req_id = getattr(request.state, "request_id", "-")
        logger.warning(
            "HTTPException [%d] on %s %s: %s [req_id: %s]",
            exc.status_code,
            request.method,
            request.url.path,
            exc.detail,
            req_id,
        )
        msg = exc.detail if isinstance(exc.detail, str) else (exc.detail.get("message") if isinstance(exc.detail, dict) else str(exc.detail))
        details = exc.detail if isinstance(exc.detail, dict) else None
        return create_error_response(
            status_code=exc.status_code,
            error_type="RateLimitExceeded" if exc.status_code == 429 else "HTTPException",
            message=msg,
            request=request,
            details=details,
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", "-")
        errors = exc.errors()
        logger.warning(
            "Validation error on %s %s: %d invalid fields [req_id: %s]",
            request.method,
            request.url.path,
            len(errors),
            req_id,
        )
        cleaned_errors = []
        for err in errors:
            cleaned_errors.append({
                "field": " -> ".join([str(loc) for loc in err.get("loc", [])]),
                "issue": err.get("msg", "Invalid value"),
                "type": err.get("type", "value_error"),
            })
        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="RequestValidationError",
            message="Request body or query parameter validation failed",
            request=request,
            details=cleaned_errors,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", "-")
        logger.exception(
            "CRITICAL Unhandled 500 error on %s %s: %s [req_id: %s]",
            request.method,
            request.url.path,
            str(exc),
            req_id,
        )
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="InternalServerError",
            message="An unexpected server error occurred. Our engineering team has been notified.",
            request=request,
        )
