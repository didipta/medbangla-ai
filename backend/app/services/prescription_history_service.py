"""
MedBangla AI - Prescription History Service (Neon PostgreSQL)
=============================================================
Saves structured clinical prescription data (medicines, dosages, doctor/patient info)
to Neon PostgreSQL database linked to the authenticated user.
Note: Images are NOT stored in the database, preserving privacy, bandwidth, and fast query performance.
"""

import uuid
import json
import logging
from typing import Dict, Any, List, Optional
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
        logger.error("Database connection failed in prescription_history_service: %s", e)
        return None


def ensure_prescription_history_table(conn=None) -> bool:
    """Ensures the prescription_history table and indexes exist in Neon PostgreSQL."""
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    if not conn:
        logger.warning("Database unavailable, cannot ensure prescription_history table.")
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS prescription_history (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                doctor_name VARCHAR(255),
                patient_name VARCHAR(255),
                patient_age VARCHAR(50),
                patient_gender VARCHAR(50),
                prescription_date VARCHAR(50),
                diagnosis TEXT,
                total_medicines INT DEFAULT 0,
                raw_text TEXT,
                clinical_entities JSONB,
                detected_medicines JSONB,
                dosage_instructions JSONB,
                summary JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_prescription_history_user_id ON prescription_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_prescription_history_created_at ON prescription_history(created_at DESC);
            """)
            conn.commit()
            logger.info("prescription_history table and indexes verified in Neon PostgreSQL.")
            return True
    except Exception as e:
        logger.error("Failed to ensure prescription_history table: %s", e)
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        if should_close and conn:
            conn.close()


def save_prescription_history(user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Saves an analyzed prescription record to Neon PostgreSQL linked to the user.
    No image is saved — only structured clinical data.
    """
    conn = get_db_connection()
    if not conn:
        return None

    try:
        ensure_prescription_history_table(conn)

        clinical_entities = data.get("clinical_entities") or {}
        doctor_info = clinical_entities.get("doctor") or {}
        patient_info = clinical_entities.get("patient") or {}

        # Extract doctor details
        doctor_name = (
            doctor_info.get("name")
            or data.get("doctor_name")
            or "চিকিৎসকের নাম অস্পষ্ট / Unspecified Doctor"
        )

        # Extract patient details
        patient_name = (
            patient_info.get("name")
            or data.get("patient_name")
            or "রোগী / Patient"
        )
        patient_age = str(patient_info.get("age") or data.get("patient_age") or "")
        patient_gender = str(patient_info.get("gender") or data.get("patient_gender") or "")
        prescription_date = str(patient_info.get("date") or data.get("prescription_date") or "")
        diagnosis = str(patient_info.get("diagnosis") or patient_info.get("complaints") or data.get("diagnosis") or "")

        # Extract medications & count
        detected_meds = data.get("detected_medicines") or clinical_entities.get("medicines") or []
        total_meds = len(detected_meds)

        dosage_instructions = data.get("dosage_instructions") or []
        summary = data.get("summary") or {}
        raw_text = data.get("raw_text") or ""

        history_id = f"rx_{uuid.uuid4().hex[:16]}"

        with conn.cursor() as cur:
            cur.execute("""
            INSERT INTO prescription_history (
                id, user_id, doctor_name, patient_name, patient_age, patient_gender,
                prescription_date, diagnosis, total_medicines, raw_text,
                clinical_entities, detected_medicines, dosage_instructions, summary,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING id, user_id, doctor_name, patient_name, patient_age, patient_gender,
                      prescription_date, diagnosis, total_medicines, created_at;
            """, (
                history_id,
                user_id,
                doctor_name,
                patient_name,
                patient_age,
                patient_gender,
                prescription_date,
                diagnosis,
                total_meds,
                raw_text,
                json.dumps(clinical_entities, ensure_ascii=False),
                json.dumps(detected_meds, ensure_ascii=False),
                json.dumps(dosage_instructions, ensure_ascii=False),
                json.dumps(summary, ensure_ascii=False),
            ))
            saved_record = cur.fetchone()
            conn.commit()

            logger.info("Saved prescription history %s for user %s (%d medicines).", history_id, user_id, total_meds)
            
            # Format return object
            res = dict(saved_record)
            if res.get("created_at"):
                res["created_at"] = res["created_at"].isoformat()
            return res
    except Exception as e:
        logger.error("Failed to save prescription history: %s", e)
        try:
            conn.rollback()
        except Exception:
            pass
        return None
    finally:
        if conn:
            conn.close()


def get_user_prescription_history(user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves summary list of all prescription history entries for a user."""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        ensure_prescription_history_table(conn)
        with conn.cursor() as cur:
            cur.execute("""
            SELECT id, user_id, doctor_name, patient_name, patient_age, patient_gender,
                   prescription_date, diagnosis, total_medicines, created_at
            FROM prescription_history
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s;
            """, (user_id, limit, offset))
            rows = cur.fetchall()

            history_list = []
            for row in rows:
                item = dict(row)
                if item.get("created_at"):
                    item["created_at"] = item["created_at"].isoformat()
                history_list.append(item)
            return history_list
    except Exception as e:
        logger.error("Failed to retrieve prescription history for user %s: %s", user_id, e)
        return []
    finally:
        if conn:
            conn.close()


def get_prescription_history_item(user_id: str, history_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves complete prescription details (including all medicines, dosages, and text) by ID."""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        ensure_prescription_history_table(conn)
        with conn.cursor() as cur:
            cur.execute("""
            SELECT id, user_id, doctor_name, patient_name, patient_age, patient_gender,
                   prescription_date, diagnosis, total_medicines, raw_text,
                   clinical_entities, detected_medicines, dosage_instructions, summary,
                   created_at
            FROM prescription_history
            WHERE id = %s AND user_id = %s;
            """, (history_id, user_id))
            row = cur.fetchone()
            if not row:
                return None

            item = dict(row)
            if item.get("created_at"):
                item["created_at"] = item["created_at"].isoformat()
            return item
    except Exception as e:
        logger.error("Failed to fetch prescription history item %s: %s", history_id, e)
        return None
    finally:
        if conn:
            conn.close()


def delete_prescription_history_item(user_id: str, history_id: str) -> bool:
    """Deletes a prescription history item belonging to user."""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("""
            DELETE FROM prescription_history
            WHERE id = %s AND user_id = %s;
            """, (history_id, user_id))
            conn.commit()
            return cur.rowcount > 0
    except Exception as e:
        logger.error("Failed to delete prescription history item %s: %s", history_id, e)
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        if conn:
            conn.close()


def update_prescription_history(user_id: str, history_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates an existing prescription record (medicines, dosages, clinical entities)
    under the same history ID without creating a duplicate record.
    """
    conn = get_db_connection()
    if not conn:
        return None

    try:
        ensure_prescription_history_table(conn)
        clinical_entities = data.get("clinical_entities") or {}
        detected_meds = data.get("detected_medicines") or clinical_entities.get("medicines") or []
        total_meds = len(detected_meds)
        dosage_instructions = data.get("dosage_instructions") or []
        summary = data.get("summary") or {}
        raw_text = data.get("raw_text") or ""

        with conn.cursor() as cur:
            cur.execute("""
            UPDATE prescription_history
            SET total_medicines = %s,
                detected_medicines = %s,
                dosage_instructions = %s,
                summary = %s,
                clinical_entities = %s,
                raw_text = COALESCE(NULLIF(%s, ''), raw_text),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
            RETURNING id, user_id, doctor_name, patient_name, patient_age, patient_gender,
                      prescription_date, diagnosis, total_medicines, updated_at;
            """, (
                total_meds,
                json.dumps(detected_meds, ensure_ascii=False),
                json.dumps(dosage_instructions, ensure_ascii=False),
                json.dumps(summary, ensure_ascii=False),
                json.dumps(clinical_entities, ensure_ascii=False),
                raw_text,
                history_id,
                user_id,
            ))
            updated_record = cur.fetchone()
            conn.commit()

            if updated_record:
                res = dict(updated_record)
                if res.get("updated_at"):
                    res["updated_at"] = res["updated_at"].isoformat()
                logger.info("Updated prescription history %s for user %s (%d medicines).", history_id, user_id, total_meds)
                return res
            return None
    except Exception as e:
        logger.error("Failed to update prescription history %s: %s", history_id, e)
        try:
            conn.rollback()
        except Exception:
            pass
        return None
    finally:
        if conn:
            conn.close()


DAILY_PRESCRIPTION_LIMIT = 2


def ensure_prescription_analysis_logs_table(conn=None) -> bool:
    """Ensures prescription_analysis_logs table exists to enforce the daily 2-analysis quota per user."""
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True

    if not conn:
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS prescription_analysis_logs (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_prescription_analysis_logs_user_date 
            ON prescription_analysis_logs(user_id, analyzed_at);
            """)
            conn.commit()
            return True
    except Exception as e:
        logger.error("Failed to ensure prescription_analysis_logs table: %s", e)
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        if should_close and conn:
            conn.close()


def record_prescription_analysis(user_id: str) -> bool:
    """Records an analysis execution for daily quota tracking."""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        ensure_prescription_analysis_logs_table(conn)
        log_id = f"log_{uuid.uuid4().hex[:16]}"
        with conn.cursor() as cur:
            cur.execute("""
            INSERT INTO prescription_analysis_logs (id, user_id, analyzed_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP);
            """, (log_id, user_id))
            conn.commit()
            logger.info("Logged prescription analysis for user %s (log ID: %s)", user_id, log_id)
            return True
    except Exception as e:
        logger.error("Failed to record prescription analysis log: %s", e)
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        if conn:
            conn.close()


def get_daily_analysis_usage(user_id: str) -> Dict[str, Any]:
    """
    Returns today's prescription analysis count and remaining quota for the user.
    Enforces the rule: Every user can analyze maximum 2 prescriptions per day.
    """
    conn = get_db_connection()
    if not conn:
        # Default fallback
        return {
            "daily_limit": DAILY_PRESCRIPTION_LIMIT,
            "used_today": 0,
            "remaining": DAILY_PRESCRIPTION_LIMIT,
            "can_analyze": True,
            "reset_info": "রাত ১২:০০টায় কোটা রিসেট হবে (Resets at midnight)",
        }

    try:
        ensure_prescription_analysis_logs_table(conn)

        with conn.cursor() as cur:
            # Count strictly from dedicated analysis logs table for today (independent of history deletion)
            cur.execute("""
            SELECT COUNT(*) AS count
            FROM prescription_analysis_logs
            WHERE user_id = %s
              AND (analyzed_at AT TIME ZONE 'Asia/Dhaka')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')::date;
            """, (user_id,))
            row_logs = cur.fetchone()
            used_today = int(row_logs["count"]) if row_logs and row_logs["count"] is not None else 0

            remaining = max(0, DAILY_PRESCRIPTION_LIMIT - used_today)
            can_analyze = used_today < DAILY_PRESCRIPTION_LIMIT

            return {
                "daily_limit": DAILY_PRESCRIPTION_LIMIT,
                "used_today": used_today,
                "remaining": remaining,
                "can_analyze": can_analyze,
                "reset_info": "রাত ১২:০০টায় কোটা রিসেট হবে (Resets at midnight)",
            }
    except Exception as e:
        logger.error("Failed to calculate daily analysis usage for user %s: %s", user_id, e)
        return {
            "daily_limit": DAILY_PRESCRIPTION_LIMIT,
            "used_today": 0,
            "remaining": DAILY_PRESCRIPTION_LIMIT,
            "can_analyze": True,
            "reset_info": "রাত ১২:০০টায় কোটা রিসেট হবে (Resets at midnight)",
        }
    finally:
        if conn:
            conn.close()


