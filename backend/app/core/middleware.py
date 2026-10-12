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
