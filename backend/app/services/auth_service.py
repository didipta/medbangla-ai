"""
MedBangla AI - Google OAuth Verification Service
================================================
Verifies Google OAuth ID tokens according to Google Identity Services (GSI) standards.
"""

import json
import logging
from typing import Dict, Any, Optional
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings

logger = logging.getLogger(__name__)


def verify_google_id_token(credential: str) -> Dict[str, Any]:
    """
    Verifies a Google OAuth ID token (credential).
    Uses google-auth library and official Google public keys.
    Returns decoded token dictionary containing 'sub', 'email', 'name', 'picture'.
    """
    if not credential or not isinstance(credential, str):
        raise ValueError("Missing or invalid Google authentication credential.")

    credential = credential.strip()

    # 1. Primary method: Google OAuth2 official library
    try:
        client_id = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        request = google_requests.Request()
        
        # If client_id is set, validates audience. If not, validates Google signature only.
        idinfo = id_token.verify_oauth2_token(credential, request, audience=client_id)

        # Ensure token is from Google
        if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError(f"Wrong issuer: {idinfo.get('iss')}")

        return {
            "sub": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name") or idinfo["email"].split("@")[0].title(),
            "picture": idinfo.get("picture", ""),
            "email_verified": bool(idinfo.get("email_verified", True)),
        }
    except Exception as e:
        logger.warning("google.oauth2.id_token verification notice: %s. Trying tokeninfo endpoint...", e)

    # 2. Secondary verification: Official Google Tokeninfo Endpoint
    try:
        tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        resp = requests.get(tokeninfo_url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if "sub" in data and "email" in data:
                return {
                    "sub": data["sub"],
                    "email": data["email"],
                    "name": data.get("name") or data["email"].split("@")[0].title(),
                    "picture": data.get("picture", ""),
                    "email_verified": data.get("email_verified") in [True, "true", "True"],
                }
    except Exception as fe:
        logger.warning("Google Tokeninfo endpoint lookup error: %s", fe)

    # 3. Tertiary verification: Google OAuth2 Userinfo Endpoint (if credential is an OAuth access token)
    try:
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        resp = requests.get(userinfo_url, headers={"Authorization": f"Bearer {credential}"}, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if "sub" in data and "email" in data:
                return {
                    "sub": data["sub"],
                    "email": data["email"],
                    "name": data.get("name") or data["email"].split("@")[0].title(),
                    "picture": data.get("picture", ""),
                    "email_verified": data.get("email_verified") in [True, "true", "True"],
                }
    except Exception as ue:
        logger.warning("Google Userinfo endpoint lookup error: %s", ue)

    raise ValueError("Google authentication failed: Real Google token could not be verified by Google servers.")
