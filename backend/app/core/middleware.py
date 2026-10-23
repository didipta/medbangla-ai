"""
MedBangla AI - HTTP Request & Error Logging Middleware
======================================================
Captures request correlation IDs (X-Request-ID), measures execution latency,
and logs structured HTTP transactions.
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("medbangla.api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that assigns a unique Request ID to each call,
    measures latency, and logs structured request/response events.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Generate or extract correlation ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        url_path = request.url.path
        query_string = request.url.query

        start_time = time.time()
        logger.info(
            "--> %s %s%s | Client: %s [req_id: %s]",
            method,
            url_path,
            f"?{query_string}" if query_string else "",
            client_ip,
            request_id,
        )

        try:
            response = await call_next(request)
            process_time = round((time.time() - start_time) * 1000, 2)

            # Attach audit headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time-Ms"] = str(process_time)

            log_fn = logger.warning if response.status_code >= 400 else logger.info
            log_fn(
                "<-- %s %s | Status: %d | Time: %.2fms [req_id: %s]",
                method,
                url_path,
                response.status_code,
                process_time,
                request_id,
            )
            return response

        except Exception as exc:
            process_time = round((time.time() - start_time) * 1000, 2)
            logger.exception(
                "<-- ERROR during %s %s after %.2fms: %s [req_id: %s]",
                method,
                url_path,
                process_time,
                str(exc),
                request_id,
            )
            raise exc


class IPRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Enterprise IP Rate Limiting Middleware.
    Enforces proxy-aware IP address rate limiting across all API endpoints.
    Protects the entire system against DDoS, credential brute force, and automated scraping.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # 1. Skip preflight CORS requests immediately
        if request.method == "OPTIONS":
            return await call_next(request)

        # 2. Resolve policy by route
        from app.core.rate_limiter import (
            rate_limiter,
            resolve_ip_policy,
            EnterpriseRateLimiter,
            RateLimitExceededException,
        )
        from fastapi.responses import JSONResponse

        path = request.url.path
        policy_name = resolve_ip_policy(path)

        # 3. Bypass non-API or documentation routes
        if not policy_name:
            return await call_next(request)

        # 4. Extract real client IP (Cloudflare, Reverse Proxy, or direct socket)
        client_ip = EnterpriseRateLimiter.extract_client_ip(request)
        request.state.client_ip = client_ip

        # 5. Check and consume rate limit quota
        try:
            rate_status = rate_limiter.check_and_consume_ip(
                policy_name=policy_name,
                client_ip=client_ip,
                consume=True,
            )
            request.state.ip_rate_status = rate_status
        except RateLimitExceededException as exc:
            logger.warning(
                "IP 429 BLOCKED: %s on %s %s (Policy: %s, Retry-After: %ss)",
                client_ip,
                request.method,
                path,
                policy_name,
                exc.retry_after,
            )
            return JSONResponse(
                status_code=429,
                content=exc.detail,
                headers=exc.headers,
            )

        # 6. Execute downstream endpoint
        response = await call_next(request)

        # 7. Inject audit & RFC rate limit headers
        response.headers["X-Client-IP"] = client_ip
        response.headers["X-RateLimit-Policy"] = policy_name
        response.headers["X-RateLimit-Limit"] = str(rate_status.get("limit", 60))
        response.headers["X-RateLimit-Remaining"] = str(rate_status.get("remaining", 0))

        return response

