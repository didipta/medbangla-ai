"""
MedBangla AI - User Management & Neon PostgreSQL Persistence Service
=====================================================================
Manages user profiles, Google authentication identity mapping, and roles.
"""

import uuid
import logging
from typing import Dict, Any, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_db_connection():
    """Returns a connection to Neon PostgreSQL."""
    if not settings.DATABASE_URL:
        return None
    try:
        return psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor, connect_timeout=5)
    except Exception as e:
        logger.error("Database connection failed in user_service: %s", e)
        return None


def ensure_users_table(conn=None) -> bool:
    """Ensures the users table exists in Neon PostgreSQL."""
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    if not conn:
        logger.warning("Database unavailable, cannot ensure users table.")
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                google_id VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                picture TEXT,
                email_verified BOOLEAN DEFAULT TRUE,
                role VARCHAR(50) DEFAULT 'patient',
                bmdc_number VARCHAR(100),
                title VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );

            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            """)
        conn.commit()
        return True
    except Exception as e:
        logger.error("Failed to ensure users table: %s", e)
        conn.rollback()
        return False
    finally:
        if should_close and conn:
            try:
                conn.close()
            except Exception:
                pass


def upsert_google_user(
    google_data: Dict[str, Any],
    selected_role: str = "patient",
    bmdc: Optional[str] = None
) -> Tuple[Dict[str, Any], bool]:
    """
    Saves or updates a Google user in the database.
    If the user logs in for the first time, creates a new record in Neon DB.
    Returns: (user_dict, is_new_user)
    """
    conn = get_db_connection()
    if not conn:
        raise RuntimeError("Database connection unavailable for user registration.")

    ensure_users_table(conn)

    google_id = str(google_data.get("sub", "")).strip()
    email = str(google_data.get("email", "")).strip().lower()
    name = str(google_data.get("name", "")).strip() or email.split("@")[0].title()
    picture = str(google_data.get("picture", "")).strip()
    email_verified = bool(google_data.get("email_verified", True))

    if not google_id or not email:
        raise ValueError("Invalid Google user payload: missing 'sub' or 'email'.")

    try:
        with conn.cursor() as cur:
            # 1. Check if user already exists
            cur.execute(
                "SELECT * FROM users WHERE google_id = %s OR email = %s LIMIT 1;",
                (google_id, email)
            )
            existing_user = cur.fetchone()

            if existing_user:
                # Returning user -> Update last_login_at and avatar
                user_dict = dict(existing_user)
                update_fields = []
                update_params = []

                update_fields.append("last_login_at = CURRENT_TIMESTAMP")
                if picture and picture != user_dict.get("picture"):
                    update_fields.append("picture = %s")
                    update_params.append(picture)
                if google_id != user_dict.get("google_id"):
                    update_fields.append("google_id = %s")
                    update_params.append(google_id)

                update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING *;"
                update_params.append(user_dict["id"])

                cur.execute(update_query, tuple(update_params))
                updated_record = cur.fetchone()
                conn.commit()
                return dict(updated_record or user_dict), False

            else:
                # First time login -> Insert new user into database
                new_id = f"usr_{uuid.uuid4().hex[:12]}"
                role = "doctor" if selected_role == "doctor" else "patient"
                title = "MBBS Doctor" if role == "doctor" else "Patient"

                cur.execute(
                    """
                    INSERT INTO users (
                        id, google_id, email, name, picture, email_verified,
                        role, bmdc_number, title, created_at, last_login_at, is_active
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE
                    )
                    RETURNING *;
                    """,
                    (new_id, google_id, email, name, picture, email_verified, role, bmdc, title)
                )
                new_user = cur.fetchone()
                conn.commit()
                logger.info("New user registered successfully via Google: %s (%s)", email, new_id)
                return dict(new_user), True

    except Exception as e:
        conn.rollback()
        logger.error("Failed to upsert Google user: %s", e)
        raise e
    finally:
        try:
            conn.close()
        except Exception:
            pass


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user by their unique MedBangla user ID."""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s AND is_active = TRUE LIMIT 1;", (user_id,))
            user = cur.fetchone()
            return dict(user) if user else None
    except Exception as e:
        logger.error("Error retrieving user by id %s: %s", user_id, e)
        return None
    finally:
        try:
            conn.close()
        except Exception:
            pass


def update_user_profile(
    user_id: str,
    role: Optional[str] = None,
    bmdc: Optional[str] = None,
    title: Optional[str] = None,
    name: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Updates user profile settings in the database."""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        with conn.cursor() as cur:
            fields = []
            params = []
            if role:
                fields.append("role = %s")
                params.append(role)
            if bmdc is not None:
                fields.append("bmdc_number = %s")
                params.append(bmdc)
            if title is not None:
                fields.append("title = %s")
                params.append(title)
            if name is not None:
                fields.append("name = %s")
                params.append(name)

            if not fields:
                return get_user_by_id(user_id)

            query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s RETURNING *;"
            params.append(user_id)

            cur.execute(query, tuple(params))
            updated = cur.fetchone()
            conn.commit()
            return dict(updated) if updated else None
    except Exception as e:
        conn.rollback()
        logger.error("Error updating user profile: %s", e)
        return None
    finally:
        try:
            conn.close()
        except Exception:
            pass
