"""
MedBangla AI - Database Verification & Search Test
==================================================
Checks Neon PostgreSQL table row counts and tests fuzzy matching on brands like 'Napa'.
"""

import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent

sys.path.insert(0, str(BACKEND_DIR))
from app.core.config import settings

def verify():
    if not settings.DATABASE_URL or "YOUR_PASSWORD" in settings.DATABASE_URL:
        logger.warning(
            "DATABASE_URL not configured yet in backend/.env! Please paste your Neon connection string."
        )
        return

    import psycopg2

    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()

        logger.info("--- Neon PostgreSQL Table Status ---")
        for table in ["companies", "generics", "brands"]:
            try:
                cur.execute(f"SELECT count(*) FROM {table};")
                count = cur.fetchone()[0]
                logger.info("Table '%s': %d records", table, count)
            except Exception as e:
                logger.warning("Table '%s' query failed: %s", table, e)
                conn.rollback()

        # Test Search for 'Napa'
        logger.info("\n--- Test Search: Brand 'Napa' ---")
        cur.execute("""
            SELECT b.brand_name, b.strength, b.form, c.company_name, g.generic_name
            FROM brands b
            LEFT JOIN companies c ON b.company_id = c.company_id
            LEFT JOIN generics g ON b.generic_id = g.generic_id
            WHERE b.brand_name ILIKE %s
            LIMIT 5;
        """, ("Napa%",))
        rows = cur.fetchall()
        for r in rows:
            logger.info("Match -> %s %s (%s) | Mfg: %s | Generic: %s", r[0], r[1] or "", r[2] or "", r[3] or "N/A", r[4] or "N/A")

        cur.close()
        conn.close()

    except Exception as e:
        logger.error("Database connection failed: %s", e)

if __name__ == "__main__":
    verify()
