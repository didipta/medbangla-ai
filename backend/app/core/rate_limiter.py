"""
MedBangla AI - Enterprise Rate Limiter & AI Feature Quota Guard
==============================================================
Production-grade, thread-safe Sliding Window and Daily Quota Limiter.
Enforces "Software Safety First" principles across all AI pipelines:
1. Prescription OCR Vision
2. Bengali Patient Explainer
3. RAG Contextual Medical Chat
4. Drug Interaction Checker
5. Medicine Catalog Search
6. Authentication & Security Endpoints

RFC 6585 compliant with standard IETF headers:
- Retry-After
- X-RateLimit-Limit
- X-RateLimit-Remaining
- X-RateLimit-Reset
"""

import time
import math
import logging
import threading
from collections import deque
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple, NamedTuple
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("medbangla.ratelimit")

# Dhaka Timezone Offset (UTC+6)
DHAKA_TZ = timezone(timedelta(hours=6))


class RateLimitPolicy(NamedTuple):
    name: str
    daily_limit: int          # Max requests allowed per day
    burst_limit: int          # Max requests allowed in burst window
    burst_window_seconds: int # Length of burst window in seconds
    label_bn: str
    label_en: str


# =============================================================================
# Production AI Feature Quota Policies (World-Class Guidelines)
# =============================================================================
POLICIES: Dict[str, RateLimitPolicy] = {
    "prescription_ocr": RateLimitPolicy(
        name="prescription_ocr",
        daily_limit=2,                 # Max 2 prescription analyses per day
        burst_limit=1,                 # 1 request per 10s window (anti-spam)
        burst_window_seconds=10,
        label_bn="প্রেসক্রিপশন এনালাইসিস",
        label_en="Prescription OCR Analysis",
    ),
    "ai_explain": RateLimitPolicy(
        name="ai_explain",
        daily_limit=5,                 # Max 5 comprehensive patient guides per day
        burst_limit=2,                 # Max 2 per minute
        burst_window_seconds=60,
        label_bn="এআই প্রেসক্রিপশন সহায়িকা",
        label_en="AI Prescription Explainer",
    ),
    "ai_chat": RateLimitPolicy(
        name="ai_chat",
        daily_limit=15,                # Max 15 clinical Q&A turns per day
        burst_limit=5,                 # Max 5 queries per minute
        burst_window_seconds=60,
        label_bn="মেডিকেল এআই প্রশ্নোত্তর",
        label_en="Medical AI Chat",
    ),
    "drug_interactions": RateLimitPolicy(
        name="drug_interactions",
        daily_limit=50,                # Max 50 drug interaction checks per day
        burst_limit=15,                # Max 15 checks per minute
        burst_window_seconds=60,
        label_bn="ড্রাগ মিথস্ক্রিয়া চেকার",
        label_en="Drug Interactions Check",
    ),
    "medicine_search": RateLimitPolicy(
        name="medicine_search",
        daily_limit=150,               # Max 150 searches per day
        burst_limit=30,                # Max 30 queries per minute
        burst_window_seconds=60,
        label_bn="ওষুধ অনুসন্ধান",
        label_en="Medicine Search",
    ),
    "auth_request": RateLimitPolicy(
        name="auth_request",
        daily_limit=50,                # Max 50 auth calls per day
        burst_limit=5,                 # Max 5 auth attempts per minute
        burst_window_seconds=60,
        label_bn="অথেন্টিকেশন যাচাই",
        label_en="Authentication Verification",
    ),
}


class RateLimitExceededException(HTTPException):
    """Custom HTTP 429 Rate Limit Exception with RFC 6585 headers."""

    def __init__(
        self,
        feature: str,
        limit: int,
        remaining: int,
        retry_after: int,
        reset_time_str: str,
        message_bn: str,
        message_en: str,
    ):
        self.feature = feature
        self.limit = limit
        self.remaining = remaining
        self.retry_after = retry_after
        self.reset_time_str = reset_time_str
        self.message_bn = message_bn
        self.message_en = message_en

        detail = {
            "error_code": "RATE_LIMIT_EXCEEDED",
            "feature": feature,
            "message": message_bn,
            "message_en": message_en,
            "limit": limit,
            "remaining": remaining,
            "retry_after_seconds": retry_after,
            "reset_info": reset_time_str,
        }
        headers = {
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(time.time()) + retry_after),
        }
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers=headers,
        )


class EnterpriseRateLimiter:
    """
    Thread-safe, high-concurrency rate limiter & quota manager.
    Supports sliding-window burst protection and persistent daily quotas.
    """

    _instance: Optional["EnterpriseRateLimiter"] = None
    _lock = threading.Lock()

    def __init__(self):
        # Sliding-window burst tracker: key -> deque of timestamps
        self._burst_windows: Dict[str, deque] = {}
        # Daily counters: key -> (date_str, count)
        self._daily_counters: Dict[str, Tuple[str, int]] = {}
        # Last cleanup timestamp
        self._last_cleanup = time.time()
        self._data_lock = threading.Lock()

    @classmethod
    def get_instance(cls) -> "EnterpriseRateLimiter":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @staticmethod
    def get_dhaka_date() -> str:
        """Returns today's date formatted in Bangladesh Time (UTC+6)."""
        return datetime.now(DHAKA_TZ).strftime("%Y-%m-%d")

    @staticmethod
    def get_seconds_until_dhaka_midnight() -> int:
        """Calculates exact seconds remaining until Dhaka midnight."""
        now = datetime.now(DHAKA_TZ)
        tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return max(1, int((tomorrow - now).total_seconds()))

    def _resolve_client_identifier(self, request: Request, user_id: Optional[str] = None) -> str:
        """
        Resolves stable client identity:
        Prioritizes verified JWT user_id > Forwarded IP > Direct client IP.
        """
        if user_id:
            return f"usr:{user_id}"

        # Check request state for user
        req_user = getattr(request.state, "user", None)
        if req_user and isinstance(req_user, dict) and req_user.get("id"):
            return f"usr:{req_user['id']}"

        # Fallback to IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"
        return f"ip:{client_ip}"

    def _cleanup_expired_entries(self):
        """Purges old timestamps and past-day counters to keep memory constant."""
        now = time.time()
        if now - self._last_cleanup < 300:  # Cleanup every 5 minutes
            return

        self._last_cleanup = now
        today = self.get_dhaka_date()

        # Clean burst windows
        keys_to_delete = []
        for key, window in self._burst_windows.items():
            while window and now - window[0] > 120:
                window.popleft()
            if not window:
                keys_to_delete.append(key)
        for k in keys_to_delete:
            self._burst_windows.pop(k, None)

        # Clean old daily counters
        stale_counters = [k for k, (dt_str, _) in self._daily_counters.items() if dt_str != today]
        for k in stale_counters:
            self._daily_counters.pop(k, None)

    def check_and_consume(
        self,
        feature_name: str,
        request: Request,
        user_id: Optional[str] = None,
        consume: bool = True,
    ) -> Dict[str, Any]:
        """
        Evaluates both burst limit and daily quota for a feature.
        If limit is exceeded, raises RateLimitExceededException (HTTP 429).
        If allowed and consume is True, increments usage.
        """
        policy = POLICIES.get(feature_name)
        if not policy:
            return {"allowed": True, "limit": 9999, "remaining": 9999}

        client_id = self._resolve_client_identifier(request, user_id)
        now = time.time()
        today = self.get_dhaka_date()
        burst_key = f"{client_id}:{feature_name}:burst"
        daily_key = f"{client_id}:{feature_name}:daily"

        with self._data_lock:
            self._cleanup_expired_entries()

            # -------------------------------------------------------------
            # 1. Burst Rate Limiting (Short-Term Window)
            # -------------------------------------------------------------
            if burst_key not in self._burst_windows:
                self._burst_windows[burst_key] = deque()

            window = self._burst_windows[burst_key]
            # Evict timestamps older than burst window
            while window and now - window[0] > policy.burst_window_seconds:
                window.popleft()

            if len(window) >= policy.burst_limit:
                oldest = window[0]
                retry_after = max(1, math.ceil(policy.burst_window_seconds - (now - oldest)))
                logger.warning(
                    "Burst rate limit hit on feature '%s' by '%s' (Wait %ds)",
                    feature_name, client_id, retry_after
                )
                raise RateLimitExceededException(
                    feature=feature_name,
                    limit=policy.burst_limit,
                    remaining=0,
                    retry_after=retry_after,
                    reset_time_str=f"{retry_after} সেকেন্ড পর পুনরায় চেষ্টা করুন",
                    message_bn=f"খুব দ্রুত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে {retry_after} সেকেন্ড পর আবার চেষ্টা করুন।",
                    message_en=f"Too many requests too quickly. Please wait {retry_after} seconds before retrying.",
                )

            # -------------------------------------------------------------
            # 2. Daily Quota Limiting (Dhaka Midnight Window)
            # -------------------------------------------------------------
            # Special check for prescription_ocr: rely strictly on dedicated DB logs table if user is authenticated
            if feature_name == "prescription_ocr" and user_id:
                from app.services.prescription_history_service import get_daily_analysis_usage
                usage_info = get_daily_analysis_usage(user_id)
                used_today = usage_info.get("used_today", 0)
                daily_limit = usage_info.get("daily_limit", policy.daily_limit)
                remaining = max(0, daily_limit - used_today)

                if used_today >= daily_limit:
                    seconds_left = self.get_seconds_until_dhaka_midnight()
                    logger.warning(
                        "Daily prescription limit hit for user '%s' (%d/%d used)",
                        user_id, used_today, daily_limit
                    )
                    raise RateLimitExceededException(
                        feature=feature_name,
                        limit=daily_limit,
                        remaining=0,
                        retry_after=seconds_left,
                        reset_time_str="রাত ১২:০০টায় কোটা রিসেট হবে",
                        message_bn=f"আজকের জন্য আপনার {policy.label_bn} কোটা ({daily_limit}/{daily_limit}) শেষ হয়ে গেছে। রাত ১২:০০টার পর পুনরায় চেষ্টা করুন।",
                        message_en=f"Daily limit for {policy.label_en} ({daily_limit}/{daily_limit}) reached for today. Resets at midnight.",
                    )
            else:
                # In-memory daily counter
                cur_date, current_daily_used = self._daily_counters.get(daily_key, (today, 0))
                if cur_date != today:
                    current_daily_used = 0

                if current_daily_used >= policy.daily_limit:
                    seconds_left = self.get_seconds_until_dhaka_midnight()
                    logger.warning(
                        "Daily limit hit on feature '%s' by '%s' (%d/%d used)",
                        feature_name, client_id, current_daily_used, policy.daily_limit
                    )
                    raise RateLimitExceededException(
                        feature=feature_name,
                        limit=policy.daily_limit,
                        remaining=0,
                        retry_after=seconds_left,
                        reset_time_str="রাত ১২:০০টায় কোটা রিসেট হবে",
                        message_bn=f"আজকের জন্য আপনার {policy.label_bn} কোটা ({policy.daily_limit}/{policy.daily_limit}) শেষ হয়েছে। রাত ১২:০০টার পর পুনরায় চেষ্টা করুন।",
                        message_en=f"Daily limit for {policy.label_en} ({policy.daily_limit}/{policy.daily_limit}) reached for today. Resets at midnight.",
                    )

            # -------------------------------------------------------------
            # 3. Consume Quota if Allowed
            # -------------------------------------------------------------
            if consume:
                window.append(now)
                if feature_name != "prescription_ocr" or not user_id:
                    cur_date, current_daily_used = self._daily_counters.get(daily_key, (today, 0))
                    if cur_date != today:
                        current_daily_used = 0
                    self._daily_counters[daily_key] = (today, current_daily_used + 1)
                    daily_used = current_daily_used + 1
                else:
                    daily_used = used_today  # Handled in prescription service upon successful DB write
            else:
                daily_used = current_daily_used if (feature_name != "prescription_ocr" or not user_id) else used_today

            remaining = max(0, policy.daily_limit - daily_used)
            return {
                "allowed": True,
                "limit": policy.daily_limit,
                "used": daily_used,
                "remaining": remaining,
                "feature": feature_name,
            }

    def get_user_quota_summary(self, request: Request, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Returns real-time usage and remaining quotas across all protected AI features."""
        summary = {}
        client_id = self._resolve_client_identifier(request, user_id)
        today = self.get_dhaka_date()

        with self._data_lock:
            for feat_name, policy in POLICIES.items():
                if feat_name == "prescription_ocr" and user_id:
                    from app.services.prescription_history_service import get_daily_analysis_usage
                    usage = get_daily_analysis_usage(user_id)
                    used = usage.get("used_today", 0)
                    rem = max(0, policy.daily_limit - used)
                else:
                    daily_key = f"{client_id}:{feat_name}:daily"
                    cur_date, used_count = self._daily_counters.get(daily_key, (today, 0))
                    used = used_count if cur_date == today else 0
                    rem = max(0, policy.daily_limit - used)

                summary[feat_name] = {
                    "feature": feat_name,
                    "label_bn": policy.label_bn,
                    "label_en": policy.label_en,
                    "daily_limit": policy.daily_limit,
                    "used_today": used,
                    "remaining": rem,
                    "can_use": rem > 0,
                    "reset_info": "রাত ১২:০০টায় কোটা রিসেট হবে (Resets at midnight)",
                }

        return summary


# Global singleton instance
rate_limiter = EnterpriseRateLimiter.get_instance()
