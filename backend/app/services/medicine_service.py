"""
MedBangla AI - Medicine Search & Data Service
=============================================
Powers fuzzy search across 17,589 brands and 1,435 generics in Neon PostgreSQL,
and harmonizes with deep bilingual clinical documents.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.config import settings

logger = logging.getLogger(__name__)

DOCS_JSON_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "medical_documents" / "json"


def get_db_connection():
    return psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor)


def search_medicines(query: str, limit: int = 20, conn: Optional[Any] = None) -> List[Dict[str, Any]]:
    """
    Fuzzy search for medicine brands and generics using PostgreSQL Trigram similarity and ILIKE.
    Supports connection reuse for batch OCR matching.
    """
    if not query or len(query.strip()) < 2:
        return []

    clean_query = query.strip()
    owns_conn = False
    if conn is None:
        conn = get_db_connection()
        owns_conn = True

    try:
        with conn.cursor() as cur:
            # Matches against brand_name with trigram priority, plus generic_name fallback
            sql = """
                SELECT 
                    b.brand_id,
                    b.brand_name,
                    b.strength,
                    b.form,
                    b.price,
                    b.packsize,
                    c.company_name AS manufacturer,
                    g.generic_id,
                    g.generic_name,
                    similarity(b.brand_name, %s) AS match_score
                FROM brands b
                LEFT JOIN companies c ON b.company_id = c.company_id
                LEFT JOIN generics g ON b.generic_id = g.generic_id
                WHERE b.brand_name ILIKE %s 
                   OR g.generic_name ILIKE %s
                   OR similarity(b.brand_name, %s) > 0.3
                ORDER BY match_score DESC, b.brand_name ASC
                LIMIT %s;
            """
            like_pattern = f"{clean_query}%"
            cur.execute(sql, (clean_query, like_pattern, like_pattern, clean_query, limit))
            results = cur.fetchall()

            # Attach flag if deep bilingual document exists
            for row in results:
                gname = (row.get("generic_name") or "").lower().replace(" ", "-")
                row["has_bilingual_doc"] = (DOCS_JSON_DIR / f"{gname}.json").exists()

            return list(results)
    finally:
        if owns_conn and conn:
            conn.close()


def get_medicine_details(brand_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve full structured medicine profile including company, generic monograph,
    and deep Bengali clinical sections if available.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    b.brand_id,
                    b.brand_name,
                    b.strength,
                    b.form,
                    b.price,
                    b.packsize,
                    c.company_name AS manufacturer,
                    g.generic_id,
                    g.generic_name,
                    g.indication,
                    g.contra_indication,
                    g.dose,
                    g.side_effect,
                    g.precaution,
                    g.mode_of_action,
                    g.interaction
                FROM brands b
                LEFT JOIN companies c ON b.company_id = c.company_id
                LEFT JOIN generics g ON b.generic_id = g.generic_id
                WHERE b.brand_id = %s;
            """
            cur.execute(sql, (brand_id,))
            brand = cur.fetchone()
            if not brand:
                return None

            data = dict(brand)

            # Check if deep bilingual JSON document exists for this generic
            gname_slug = (data.get("generic_name") or "").lower().replace(" ", "-")
            doc_file = DOCS_JSON_DIR / f"{gname_slug}.json"
            if not doc_file.exists():
                # Try simple match (e.g. 'paracetamol' from 'Paracetamol')
                doc_file = DOCS_JSON_DIR / f"{(data.get('generic_name') or '').lower().split()[0]}.json"

            if doc_file.exists():
                try:
                    doc_data = json.loads(doc_file.read_text(encoding="utf-8"))
                    data["bilingual_profile"] = {
                        "name_bn": doc_data.get("name_bn"),
                        "therapeutic_class": doc_data.get("therapeutic_class"),
                        "sections_bn": doc_data.get("sections_bn", {}),
                        "sections_en": doc_data.get("sections_en", {}),
                    }
                except Exception as e:
                    logger.warning("Error reading deep doc %s: %s", doc_file, e)
                    data["bilingual_profile"] = None
            else:
                data["bilingual_profile"] = None

            return data
    finally:
        conn.close()
