"""
MedBangla AI - App Control, Maintenance & Update Persistence Service
=====================================================================
Manages application lifecycle controls:
- Emergency/Scheduled Maintenance Mode switch & custom messages
- In-App Update Engine (Flexible & Forced/Mandatory)
- Google Drive APK Link to Direct Download URL conversion
- Dual-tier persistence: Neon PostgreSQL with local JSON caching
"""

import os
import re
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "app_control.json"

DEFAULT_APP_CONTROL: Dict[str, Any] = {
    "is_maintenance_mode": False,
    "maintenance_title": "মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে",
    "maintenance_message": "আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের নিয়মিত উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।",
    "maintenance_eta": "৩০ মিনিট",
    "emergency_contact": "support@medbangla.ai",
    "latest_version": "1.0.0",
    "latest_version_code": 1,
    "min_supported_version": "1.0.0",
    "min_supported_version_code": 1,
    "is_force_update": False,
    "update_title": "মেডবাংলা এআই এর নতুন সংস্করণ উপলব্ধ",
    "update_notes": "• প্রেসক্রিপশন ওসিআর স্ক্যানার অপ্টিমাইজেশন\n• ডিজিডিএ ১৭,৫৮৯+ ঔষধের সর্বশেষ মূল্য ও ডাটাবেজ যুক্ত\n• ড্রাগ-ড্রাগ ইন্টারেকশন ও ড্রাগ অ্যালার্জি সেফটি এলার্ট আপডেট\n• বাগ ফিক্স এবং দ্রুততর পারফরম্যান্স",
    "apk_google_drive_url": "https://drive.google.com/file/d/1DemoGoogleDriveApkFileIdMedBangla2026/view?usp=sharing",
    "apk_direct_download_url": "https://drive.google.com/uc?export=download&id=1DemoGoogleDriveApkFileIdMedBangla2026",
    "apk_file_size": "24.8 MB",
    "updated_at": datetime.now(timezone.utc).isoformat(),
}


def parse_google_drive_link(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Parses any Google Drive share link and converts it to a direct download URL.
    Returns: (file_id, direct_download_url)
    """
    if not url or not isinstance(url, str):
        return None, None

    url = url.strip()

    # Pattern 1: /file/d/{FILE_ID}/
    match = re.search(r"/file/d/([a-zA-Z0-9_-]+)", url)
    if match:
        file_id = match.group(1)
        return file_id, f"https://drive.google.com/uc?export=download&id={file_id}"

    # Pattern 2: id={FILE_ID} in query string
    match = re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    if match:
        file_id = match.group(1)
        return file_id, f"https://drive.google.com/uc?export=download&id={file_id}"

    # Pattern 3: Raw file ID directly entered
    if re.match(r"^[a-zA-Z0-9_-]{20,}$", url):
        return url, f"https://drive.google.com/uc?export=download&id={url}"

    # If it's already a direct download or web URL (e.g. S3, Firebase, GitHub Release, APK host)
    if url.startswith("http://") or url.startswith("https://"):
        return None, url

    return None, None


def get_db_connection():
    """Establishes connection to Neon PostgreSQL."""
    if not settings.DATABASE_URL:
        return None
    try:
        return psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor, connect_timeout=5)
    except Exception as e:
        logger.warning("Neon DB connection unavailable in app_control_service: %s", e)
        return None


def ensure_app_control_table(conn) -> bool:
    """Ensures app_control database table exists with default row."""
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS app_control (
                id VARCHAR(32) PRIMARY KEY DEFAULT 'global',
                is_maintenance_mode BOOLEAN DEFAULT FALSE,
                maintenance_title VARCHAR(255) DEFAULT 'মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে',
                maintenance_message TEXT,
                maintenance_eta VARCHAR(100) DEFAULT '৩০ মিনিট',
                emergency_contact VARCHAR(255) DEFAULT 'support@medbangla.ai',
                latest_version VARCHAR(50) DEFAULT '1.0.0',
                latest_version_code INTEGER DEFAULT 1,
                min_supported_version VARCHAR(50) DEFAULT '1.0.0',
                min_supported_version_code INTEGER DEFAULT 1,
                is_force_update BOOLEAN DEFAULT FALSE,
                update_title VARCHAR(255) DEFAULT 'মেডবাংলা এআই এর নতুন সংস্করণ উপলব্ধ',
                update_notes TEXT,
                apk_google_drive_url TEXT,
                apk_direct_download_url TEXT,
                apk_file_size VARCHAR(50) DEFAULT '24.8 MB',
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Seed default record if not present
            cur.execute("SELECT id FROM app_control WHERE id = 'global' LIMIT 1;")
            if not cur.fetchone():
                cur.execute(
                    """
                    INSERT INTO app_control (
                        id, is_maintenance_mode, maintenance_title, maintenance_message,
                        maintenance_eta, emergency_contact, latest_version, latest_version_code,
                        min_supported_version, min_supported_version_code, is_force_update,
                        update_title, update_notes, apk_google_drive_url, apk_direct_download_url,
                        apk_file_size, updated_at
                    ) VALUES (
                        'global', %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, CURRENT_TIMESTAMP
                    );
                    """,
                    (
                        DEFAULT_APP_CONTROL["is_maintenance_mode"],
                        DEFAULT_APP_CONTROL["maintenance_title"],
                        DEFAULT_APP_CONTROL["maintenance_message"],
                        DEFAULT_APP_CONTROL["maintenance_eta"],
                        DEFAULT_APP_CONTROL["emergency_contact"],
                        DEFAULT_APP_CONTROL["latest_version"],
                        DEFAULT_APP_CONTROL["latest_version_code"],
                        DEFAULT_APP_CONTROL["min_supported_version"],
                        DEFAULT_APP_CONTROL["min_supported_version_code"],
                        DEFAULT_APP_CONTROL["is_force_update"],
                        DEFAULT_APP_CONTROL["update_title"],
                        DEFAULT_APP_CONTROL["update_notes"],
                        DEFAULT_APP_CONTROL["apk_google_drive_url"],
                        DEFAULT_APP_CONTROL["apk_direct_download_url"],
                        DEFAULT_APP_CONTROL["apk_file_size"],
                    )
                )
            conn.commit()
            return True
    except Exception as e:
        logger.error("Failed to ensure app_control table: %s", e)
        conn.rollback()
        return False


def load_cached_config() -> Dict[str, Any]:
    """Loads configuration from local JSON cache if file exists, else defaults."""
    if CACHE_FILE_PATH.exists():
        try:
            data = json.loads(CACHE_FILE_PATH.read_text(encoding="utf-8"))
            return {**DEFAULT_APP_CONTROL, **data}
        except Exception as e:
            logger.warning("Could not read local app_control cache: %s", e)
    return dict(DEFAULT_APP_CONTROL)


def save_cached_config(config: Dict[str, Any]):
    """Saves configuration snapshot to local JSON cache."""
    try:
        CACHE_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        CACHE_FILE_PATH.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        logger.warning("Could not write local app_control cache: %s", e)


def get_app_control() -> Dict[str, Any]:
    """
    Retrieves current App Control & Version configuration.
    Falls back gracefully to local cache if Neon DB is offline.
    """
    conn = get_db_connection()
    if conn:
        try:
            ensure_app_control_table(conn)
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM app_control WHERE id = 'global' LIMIT 1;")
                row = cur.fetchone()
                if row:
                    data = dict(row)
                    if isinstance(data.get("updated_at"), datetime):
                        data["updated_at"] = data["updated_at"].isoformat()
                    # Keep local cache updated
                    save_cached_config(data)
                    return data
        except Exception as e:
            logger.warning("Error querying app_control from DB: %s. Using cache.", e)
        finally:
            try:
                conn.close()
            except Exception:
                pass

    return load_cached_config()


def update_app_control(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates App Control settings in DB and updates local cache.
    Automatically resolves Google Drive links to direct download URLs.
    """
    current = get_app_control()
    updated = {**current}

    # Direct Google Drive URL resolution
    drive_url = payload.get("apk_google_drive_url")
    if drive_url is not None:
        updated["apk_google_drive_url"] = drive_url.strip()
        _, direct_url = parse_google_drive_link(drive_url)
        if direct_url:
            updated["apk_direct_download_url"] = direct_url
        elif payload.get("apk_direct_download_url"):
            updated["apk_direct_download_url"] = payload["apk_direct_download_url"].strip()

    # Update other allowed fields
    field_keys = [
        "is_maintenance_mode",
        "maintenance_title",
        "maintenance_message",
        "maintenance_eta",
        "emergency_contact",
        "latest_version",
        "latest_version_code",
        "min_supported_version",
        "min_supported_version_code",
        "is_force_update",
        "update_title",
        "update_notes",
        "apk_file_size",
    ]

    for key in field_keys:
        if key in payload and payload[key] is not None:
            updated[key] = payload[key]

    updated["updated_at"] = datetime.now(timezone.utc).isoformat()

    conn = get_db_connection()
    if conn:
        try:
            ensure_app_control_table(conn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE app_control SET
                        is_maintenance_mode = %s,
                        maintenance_title = %s,
                        maintenance_message = %s,
                        maintenance_eta = %s,
                        emergency_contact = %s,
                        latest_version = %s,
                        latest_version_code = %s,
                        min_supported_version = %s,
                        min_supported_version_code = %s,
                        is_force_update = %s,
                        update_title = %s,
                        update_notes = %s,
                        apk_google_drive_url = %s,
                        apk_direct_download_url = %s,
                        apk_file_size = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = 'global'
                    RETURNING *;
                    """,
                    (
                        updated["is_maintenance_mode"],
                        updated["maintenance_title"],
                        updated["maintenance_message"],
                        updated["maintenance_eta"],
                        updated["emergency_contact"],
                        updated["latest_version"],
                        int(updated["latest_version_code"]),
                        updated["min_supported_version"],
                        int(updated["min_supported_version_code"]),
                        updated["is_force_update"],
                        updated["update_title"],
                        updated["update_notes"],
                        updated["apk_google_drive_url"],
                        updated["apk_direct_download_url"],
                        updated["apk_file_size"],
                    )
                )
                db_res = cur.fetchone()
                conn.commit()
                if db_res:
                    res_dict = dict(db_res)
                    if isinstance(res_dict.get("updated_at"), datetime):
                        res_dict["updated_at"] = res_dict["updated_at"].isoformat()
                    updated = res_dict
        except Exception as e:
            logger.error("Failed to persist app_control in DB: %s", e)
            conn.rollback()
        finally:
            try:
                conn.close()
            except Exception:
                pass

    # Always persist locally
    save_cached_config(updated)
    return updated


def evaluate_client_status(
    client_version_code: Optional[int] = None,
    client_version: Optional[str] = None,
    platform: str = "android"
) -> Dict[str, Any]:
    """
    Computes real-time status for Flutter app or web client.
    Determines if maintenance is active, or if an update is required / optional.
    """
    config = get_app_control()

    latest_code = int(config.get("latest_version_code", 1))
    min_supported_code = int(config.get("min_supported_version_code", 1))
    is_force_flag = bool(config.get("is_force_update", False))

    update_available = False
    is_force_update = False

    # 1. Compare by version code
    if client_version_code is not None and client_version_code < latest_code:
        update_available = True

    # 2. Compare by version name string (e.g. "1.0.0" vs "1.1.0" or "2.0.0")
    latest_ver_str = str(config.get("latest_version") or "").strip().lstrip("vV")
    if client_version:
        client_clean = str(client_version).strip().lstrip("vV")
        if latest_ver_str and client_clean != latest_ver_str:
            update_available = True

    # 3. Determine if update is mandatory (forced)
    if update_available:
        if is_force_flag:
            is_force_update = True
        elif client_version_code is not None and client_version_code < min_supported_code:
            is_force_update = True

    return {
        "status": "success",
        "maintenance": {
            "is_active": bool(config.get("is_maintenance_mode", False)),
            "title": config.get("maintenance_title"),
            "message": config.get("maintenance_message"),
            "eta": config.get("maintenance_eta"),
            "emergency_contact": config.get("emergency_contact"),
        },
        "update": {
            "update_available": update_available,
            "is_force_update": is_force_update,
            "latest_version": config.get("latest_version"),
            "latest_version_code": latest_code,
            "min_supported_version": config.get("min_supported_version"),
            "min_supported_version_code": min_supported_code,
            "title": config.get("update_title"),
            "notes": config.get("update_notes"),
            "download_url": config.get("apk_direct_download_url") or config.get("apk_google_drive_url"),
            "google_drive_url": config.get("apk_google_drive_url"),
            "file_size": config.get("apk_file_size"),
            "platform": platform,
        },
        "server_time": datetime.now(timezone.utc).isoformat(),
    }
