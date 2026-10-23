"""
MedBangla AI - Public System & App Lifecycle Endpoints
======================================================
Serves public endpoints for Flutter Mobile App & Web Frontend:
- App Version Verification & Update Engine (Flexible & Forced)
- System Maintenance Health Check
- Direct APK Download Redirector
"""

import logging
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from fastapi.responses import RedirectResponse

from app.services.app_control_service import (
    evaluate_client_status,
    get_app_control,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/system", tags=["System & App Lifecycle"])


@router.get(
    "/app-control",
    summary="Check App Version, Update Availability & Maintenance Mode",
    description="Called by mobile app on startup. Compares client version against latest published version in database and checks if maintenance mode is active."
)
def get_client_app_control(
    version_code: Optional[int] = Query(None, description="Current installed app version code (e.g. 1)"),
    version: Optional[str] = Query(None, description="Current installed app version name (e.g. '1.0.0')"),
    platform: Optional[str] = Query("android", description="Target platform ('android', 'ios', 'web')"),
):
    try:
        return evaluate_client_status(
            client_version_code=version_code,
            client_version=version,
            platform=platform,
        )
    except Exception as e:
        logger.error("Error evaluating app control status: %s", e)
        # Resilient fallback so client app doesn't crash if an error occurs
        return {
            "status": "success",
            "maintenance": {"is_active": False},
            "update": {"update_available": False, "is_force_update": False},
        }


@router.get(
    "/download-apk",
    summary="Direct APK Download Link Redirector",
    description="Redirects user browser or download manager directly to the active APK on Google Drive or CDN."
)
def download_latest_apk():
    config = get_app_control()
    target_url = config.get("apk_direct_download_url") or config.get("apk_google_drive_url")

    if not target_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No APK download link currently configured in system settings.",
        )

    return RedirectResponse(url=target_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
