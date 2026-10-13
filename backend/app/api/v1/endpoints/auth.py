"""
MedBangla AI - Authentication REST Endpoints
============================================
Professional Google OAuth authentication endpoint for real-world production standards.
First-time users are automatically registered and saved in Neon PostgreSQL.
"""

import logging
from typing import Optional, Dict, Any
import requests
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, EmailStr

from app.core.config import settings
from app.core.security import create_access_token, get_current_user, get_current_user_optional
from app.core.rate_limiter import rate_limiter
from app.services.auth_service import verify_google_id_token
from app.services.user_service import upsert_google_user, update_user_profile, get_user_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])


# =============================================================================
# Request / Response Schemas (Pydantic v2)
# =============================================================================

class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google OAuth ID Token from Google Identity Services (GSI)")
    role: Optional[str] = Field("patient", description="User role: 'patient' or 'doctor'")
    bmdc: Optional[str] = Field(None, description="BMDC Registration Number if role is doctor")


class UserProfileResponse(BaseModel):
    id: str
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    email_verified: bool = True
    role: str = "patient"
    bmdc_number: Optional[str] = None
    title: Optional[str] = None
    created_at: Optional[Any] = None
    last_login_at: Optional[Any] = None
    is_active: bool = True


class GoogleAuthResponse(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
    message: str
    user: UserProfileResponse


class UpdateProfileRequest(BaseModel):
    role: Optional[str] = Field(None, description="'patient' or 'doctor'")
    bmdc_number: Optional[str] = None
    title: Optional[str] = None
    name: Optional[str] = None


class AuthConfigResponse(BaseModel):
    google_client_id: str
    auth_provider: str = "google_only"


# =============================================================================
# Endpoints
# =============================================================================

@router.get(
    "/config",
    response_model=AuthConfigResponse,
    summary="Get Google OAuth client configuration for frontend initialization"
)
def get_auth_config():
    """Returns Google Client ID so frontend can mount Google Identity Services seamlessly."""
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID or "",
        "auth_provider": "google_only",
    }


class SetAuthConfigRequest(BaseModel):
    google_client_id: str = Field(..., description="Google OAuth 2.0 Web Client ID")


@router.post(
    "/config",
    response_model=AuthConfigResponse,
    summary="Save and update Google OAuth client ID"
)
def update_auth_config(payload: SetAuthConfigRequest):
    """Saves Google Client ID to backend settings and persists in .env."""
    client_id = payload.google_client_id.strip()
    settings.GOOGLE_CLIENT_ID = client_id
    try:
        env_path = settings.BACKEND_DIR / ".env"
        if env_path.exists():
            import re
            content = env_path.read_text(encoding="utf-8")
            if "GOOGLE_CLIENT_ID=" in content:
                new_content = re.sub(r"GOOGLE_CLIENT_ID=.*", f"GOOGLE_CLIENT_ID={client_id}", content)
            else:
                new_content = content.rstrip() + f"\nGOOGLE_CLIENT_ID={client_id}\n"
            env_path.write_text(new_content, encoding="utf-8")
    except Exception as e:
        logger.warning("Could not write GOOGLE_CLIENT_ID to .env: %s", e)

    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "auth_provider": "google_only",
    }


@router.get(
    "/limits",
    summary="Get user rate limits and daily quota usage",
    description="Returns quota and limit status across all AI features."
)
def get_user_limits(
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    user_id = current_user.get("id") if current_user else None
    limits = rate_limiter.get_user_quota_summary(request, user_id=user_id)
    return {
        "status": "success",
        "limits": limits,
    }


@router.post(
    "/google",
    response_model=GoogleAuthResponse,
    summary="Authenticate with Google OAuth ID Token (Login / Register)",
    description="Validates Google ID token. If the user logs in for the first time, automatically saves them in Neon PostgreSQL. Returns JWT access token."
)
def login_with_google(request: Request, payload: GoogleAuthRequest):
    rate_limiter.check_and_consume("auth_request", request)

    # 1. Verify Google token
    try:
        google_data = verify_google_id_token(payload.credential)
    except ValueError as ve:
        logger.warning("Google authentication verification failed: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(ve),
        )
    except Exception as exc:
        logger.exception("Unexpected error verifying Google token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate with Google.",
        )

    # 2. Upsert user in database (First-time user saved automatically)
    try:
        user_record, is_new_user = upsert_google_user(
            google_data=google_data,
            selected_role=payload.role or "patient",
            bmdc=payload.bmdc
        )
    except Exception as e:
        logger.exception("Database user registration failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record user profile in database.",
        )

    # 3. Generate MedBangla AI JWT Access Token
    token_payload = {
        "sub": user_record["id"],
        "email": user_record["email"],
        "role": user_record["role"],
        "name": user_record["name"],
    }
    jwt_token = create_access_token(data=token_payload)

    welcome_msg = (
        "স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।"
        if is_new_user
        else "পুনরায় স্বাগতম! সফলভাবে লগইন সম্পন্ন হয়েছে।"
    )

    return {
        "status": "success",
        "access_token": jwt_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "message": welcome_msg,
        "user": user_record,
    }


@router.get(
    "/me",
    summary="Get current authenticated user profile",
    description="Requires Bearer token. Returns fresh profile data from database."
)
def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "status": "success",
        "user": current_user,
    }


@router.put(
    "/profile",
    summary="Update current user role, BMDC number or profile title",
    description="Allows updating role (switching to doctor with BMDC verification) or name."
)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    updated = update_user_profile(
        user_id=current_user["id"],
        role=payload.role,
        bmdc=payload.bmdc_number,
        title=payload.title,
        name=payload.name,
    )
    if not updated:
        raise HTTPException(status_code=400, detail="Failed to update profile.")

    return {
        "status": "success",
        "message": "প্রোফাইল সফলভাবে আপডেট করা হয়েছে।",
        "user": updated,
    }


# =============================================================================
# Google OAuth Authorized Redirect Callbacks
# Authorized redirect URI: http://localhost:8000/api/v1/auth/callback/google
# =============================================================================

@router.get(
    "/callback/google",
    summary="Google OAuth Redirect Callback (GET)",
    description="Handles Google OAuth 2.0 authorization code redirect flow, exchanges token, saves user in database, and redirects to frontend."
)
async def google_oauth_callback_get(
    request: Request,
    code: Optional[str] = None,
    error: Optional[str] = None,
    state: Optional[str] = None,
):
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if error:
        logger.warning("Google OAuth callback returned error: %s", error)
        return RedirectResponse(f"{frontend_base}/auth/callback?error={error}")

    if not code:
        return RedirectResponse(f"{frontend_base}/auth/callback?error=no_code_provided")

    try:
        redirect_uri = f"{str(request.base_url).rstrip('/')}/api/v1/auth/callback/google"
        
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        if settings.GOOGLE_CLIENT_SECRET:
            token_data["client_secret"] = settings.GOOGLE_CLIENT_SECRET

        resp = requests.post("https://oauth2.googleapis.com/token", data=token_data, timeout=10)
        token_json = resp.json()

        if resp.status_code != 200 or ("id_token" not in token_json and "access_token" not in token_json):
            err_msg = token_json.get("error_description") or token_json.get("error") or "token_exchange_failed"
            logger.error("Google token exchange error: %s", err_msg)
            return RedirectResponse(f"{frontend_base}/auth/callback?error={err_msg}")

        google_token = token_json.get("id_token") or token_json.get("access_token")
        google_data = verify_google_id_token(google_token)

        # Upsert in database
        role = "doctor" if (state and "role=doctor" in state) else "patient"
        user_record, is_new_user = upsert_google_user(
            google_data=google_data,
            selected_role=role,
        )

        # Create JWT session token
        jwt_token = create_access_token(data={
            "sub": user_record["id"],
            "email": user_record["email"],
            "role": user_record["role"],
            "name": user_record["name"],
        })

        return RedirectResponse(
            f"{frontend_base}/auth/callback?token={jwt_token}&is_new={1 if is_new_user else 0}"
        )
    except Exception as exc:
        logger.exception("Failed to process Google OAuth redirect: %s", exc)
        return RedirectResponse(f"{frontend_base}/auth/callback?error=server_error")


@router.post(
    "/callback/google",
    summary="Google OAuth Redirect Callback (POST)",
    description="Handles Google GSI form_post callback mode."
)
async def google_oauth_callback_post(request: Request):
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    try:
        form = await request.form()
        credential = form.get("credential")
        if not credential:
            return RedirectResponse(f"{frontend_base}/auth/callback?error=missing_credential")

        google_data = verify_google_id_token(str(credential))
        user_record, is_new_user = upsert_google_user(
            google_data=google_data,
            selected_role="patient",
        )

        jwt_token = create_access_token(data={
            "sub": user_record["id"],
            "email": user_record["email"],
            "role": user_record["role"],
            "name": user_record["name"],
        })

        return RedirectResponse(
            f"{frontend_base}/auth/callback?token={jwt_token}&is_new={1 if is_new_user else 0}"
        )
    except Exception as e:
        logger.exception("Error in POST Google callback: %s", e)
        return RedirectResponse(f"{frontend_base}/auth/callback?error=server_error")
