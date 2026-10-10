"""
MedBangla AI - Neon PostgreSQL Database Seeder
=================================================
Imports raw Bangladesh medicine CSVs from backend/data/raw/
into Neon PostgreSQL (project: flat-cell-64402236).

Tables created & seeded:
1. companies (companies.csv)
2. generics (generics.csv)
3. brands (brands.csv)

Requires:
- DATABASE_URL environment variable (from Neon dashboard or .env)
- psycopg2-binary
"""

import os
import sys
import csv
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
RAW_DATA_DIR = BACKEND_DIR / "data" / "raw"


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        for env_path in [BACKEND_DIR / ".env", BACKEND_DIR.parent / ".env"]:
            if env_path.exists():
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    if line.startswith("DATABASE_URL="):
                        url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    if not url or "YOUR_PASSWORD" in url:
        logger.error(
            "DATABASE_URL not found or contains placeholder! Please set your valid "
            "Neon connection string in backend/.env or $env:DATABASE_URL."
        )
        sys.exit(1)
    return url


def seed_database():
    import psycopg2
    from psycopg2.extras import execute_batch

    db_url = get_database_url()
    logger.info("Connecting to Neon PostgreSQL...")

    conn = psycopg2.connect(db_url)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # 1. Enable pg_trgm for fast fuzzy matching
        logger.info("Enabling pg_trgm extension...")
        cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
        cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

        # 2. Create Schema
        logger.info("Creating tables...")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            company_id INT PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            company_order INT DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS generics (
            generic_id INT PRIMARY KEY,
            generic_name VARCHAR(255) NOT NULL,
            precaution TEXT,
            indication TEXT,
            contra_indication TEXT,
            dose TEXT,
            side_effect TEXT,
            pregnancy_category_id INT,
            mode_of_action TEXT,
            interaction TEXT
        );

        CREATE TABLE IF NOT EXISTS brands (
            brand_id INT PRIMARY KEY,
            generic_id INT REFERENCES generics(generic_id) ON DELETE SET NULL,
            company_id INT REFERENCES companies(company_id) ON DELETE SET NULL,
            brand_name VARCHAR(255) NOT NULL,
            form VARCHAR(100),
            strength VARCHAR(255),
            price NUMERIC(10, 2),
            packsize VARCHAR(255)
        );

        -- Trigram indexes for sub-millisecond typo-tolerant matching
        CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON brands USING gin (brand_name gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_generics_name_trgm ON generics USING gin (generic_name gin_trgm_ops);
        """)
        conn.commit()

        # 3. Seed Companies (defensive against unquoted commas in company names)
        companies_csv = RAW_DATA_DIR / "companies.csv"
        if companies_csv.exists():
            logger.info("Seeding companies from %s...", companies_csv.name)
            rows = []
            with open(companies_csv, "r", encoding="utf-8-sig") as f:
                for line_idx, line in enumerate(f):
                    line = line.strip()
                    if not line or line_idx == 0:
                        continue
                    parts = line.split(",")
                    if len(parts) >= 2 and parts[0].strip().isdigit():
                        cid = int(parts[0].strip())
                        if parts[-1].strip().isdigit():
                            order = int(parts[-1].strip())
                            name = ",".join(parts[1:-1]).strip()
                        else:
                            order = 0
                            name = ",".join(parts[1:]).strip()
                        rows.append((cid, name, order))

            execute_batch(
                cur,
                """
                INSERT INTO companies (company_id, company_name, company_order)
                VALUES (%s, %s, %s)
                ON CONFLICT (company_id) DO UPDATE 
                SET company_name = EXCLUDED.company_name, company_order = EXCLUDED.company_order;
                """,
                rows,
                page_size=500,
            )
            conn.commit()
            logger.info("Seeded %d companies.", len(rows))

        # 4. Seed Generics
        generics_csv = RAW_DATA_DIR / "generics.csv"
        if generics_csv.exists():
            logger.info("Seeding generics from %s...", generics_csv.name)
            rows = []
            with open(generics_csv, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    try:
                        gid = int(r["generic_id"])
                    except (ValueError, TypeError, KeyError):
                        continue
                    gname = (r.get("generic_name") or "").strip()
                    precaution = r.get("precaution") or None
                    indication = r.get("indication") or None
                    contra = r.get("contra_indication") or None
                    dose = r.get("dose") or None
                    side_effect = r.get("side_effect") or None
                    preg_str = str(r.get("pregnancy_category_id") or "").strip()
                    preg_id = int(preg_str) if preg_str.isdigit() else None
                    moa = r.get("mode_of_action") or None
                    interaction = r.get("interaction") or None
                    rows.append((gid, gname, precaution, indication, contra, dose, side_effect, preg_id, moa, interaction))

            execute_batch(
                cur,
                """
                INSERT INTO generics (generic_id, generic_name, precaution, indication, contra_indication, dose, side_effect, pregnancy_category_id, mode_of_action, interaction)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (generic_id) DO UPDATE 
                SET generic_name = EXCLUDED.generic_name,
                    indication = EXCLUDED.indication,
                    contra_indication = EXCLUDED.contra_indication,
                    side_effect = EXCLUDED.side_effect,
                    interaction = EXCLUDED.interaction;
                """,
                rows,
                page_size=500,
            )
            conn.commit()
            logger.info("Seeded %d generics.", len(rows))

        # Fetch all currently existing generic_id and company_id to enforce foreign key integrity
        cur.execute("SELECT generic_id FROM generics;")
        valid_generic_ids = {row[0] for row in cur.fetchall()}

        cur.execute("SELECT company_id FROM companies;")
        valid_company_ids = {row[0] for row in cur.fetchall()}

        # 5. Seed Brands (with FK validation & defensive price cleaning)
        brands_csv = RAW_DATA_DIR / "brands.csv"
        if brands_csv.exists():
            logger.info("Seeding brands from %s (17,500+ records)...", brands_csv.name)
            rows = []
            orphaned_fk_count = 0
            with open(brands_csv, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    try:
                        bid = int(r["brand_id"])
                    except (ValueError, TypeError, KeyError):
                        continue
                    
                    gid_str = str(r.get("generic_id") or "").strip()
                    gid = int(gid_str) if gid_str.isdigit() else None
                    if gid not in valid_generic_ids:
                        gid = None
                        orphaned_fk_count += 1

                    cid_str = str(r.get("company_id") or "").strip()
                    cid = int(cid_str) if cid_str.isdigit() else None
                    if cid not in valid_company_ids:
                        cid = None

                    bname = (r.get("brand_name") or "").strip()
                    form = r.get("form") or None
                    strength = r.get("strength") or None
                    price_val = None
                    price_raw = str(r.get("price") or "").strip()
                    if price_raw and price_raw.upper() != "NULL":
                        clean_price = price_raw.split("/")[0].strip()
                        try:
                            price_val = float(clean_price)
                        except ValueError:
                            price_val = None
                    packsize = r.get("packsize") if r.get("packsize") != "NULL" else None
                    rows.append((bid, gid, cid, bname, form, strength, price_val, packsize))

            if orphaned_fk_count > 0:
                logger.info(
                    "Note: Handled %d brand records with orphan generic/company IDs by setting FK to NULL.",
                    orphaned_fk_count,
                )

            execute_batch(
                cur,
                """
                INSERT INTO brands (brand_id, generic_id, company_id, brand_name, form, strength, price, packsize)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (brand_id) DO UPDATE 
                SET brand_name = EXCLUDED.brand_name,
                    generic_id = EXCLUDED.generic_id,
                    strength = EXCLUDED.strength,
                    price = EXCLUDED.price;
                """,
                rows,
                page_size=1000,
            )
            conn.commit()
            logger.info("Seeded %d brands.", len(rows))

        logger.info("Neon PostgreSQL successfully seeded with Bangladesh medicine dataset!")

    except Exception as e:
        conn.rollback()
        logger.error("Error seeding database: %s", e)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed_database()
