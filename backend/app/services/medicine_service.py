"""
MedBangla AI - Medicine Search & Data Service
=============================================
Powers fuzzy search across 17,589 brands and 1,435 generics in Neon PostgreSQL,
with intelligent query normalization, Bangla transliteration mapping, prefix cleaning,
and in-memory CSV resilience fallback.
"""

import json
import logging
import re
import csv
from typing import List, Dict, Any, Optional
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.config import settings

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_JSON_DIR = BACKEND_DIR / "data" / "medical_documents" / "json"
DATA_RAW_DIR = BACKEND_DIR / "data" / "raw"

# In-memory LRU caches for hot lookups (O(1) retrieval)
_SEARCH_CACHE: Dict[str, List[Dict[str, Any]]] = {}
_DETAILS_CACHE: Dict[int, Dict[str, Any]] = {}
MAX_CACHE_ENTRIES = 2000

# In-memory CSV fallback store (loaded on demand if DB connection fails)
_CSV_DATA: Optional[List[Dict[str, Any]]] = None

# Comprehensive Bangla-to-English Medical Transliteration & Common Brand Mapping
BANGLA_MEDICINE_MAP = {
    "নাপা": "Napa",
    "সেকলো": "Seclo",
    "প্যারাসিটামল": "Paracetamol",
    "প্যারাসিটমল": "Paracetamol",
    "অ্যাসিটামিনোফেন": "Acetaminophen",
    "সিপ্রো": "Cipro",
    "সিপ্রোফ্লক্সাসিন": "Ciprofloxacin",
    "সিপ্রোসিন": "Ciprocin",
    "অ্যাজিথ্রোমাইসিন": "Azithromycin",
    "অ্যাজিথ্রাল": "Azithromycin",
    "জিথ্রক্স": "Zithrox",
    "মেটফর্মিন": "Metformin",
    "মেটফরমিন": "Metformin",
    "কম্পিট্যাক্ট": "Comet",
    "মোনাস": "Monas",
    "মন্টেলুকাস্ট": "Montelukast",
    "কার্ডিজেম": "Cardizem",
    "প্রক্সেন": "Proxen",
    "ন্যাপ্রোক্সেন": "Naproxen",
    "লসার্টান": "Losartan",
    "লোসার্টান": "Losartan",
    "এসিক্লোফেনাক": "Aceclofenac",
    "এসিক্লো": "Aceclofenac",
    "ক্যালবো": "Calbo",
    "ক্যালসিয়াম": "Calcium",
    "ক্যালসিয়াম": "Calcium",
    "অ্যামলোডিপিন": "Amlodipine",
    "অ্যাম্লোকার্ড": "Amlocard",
    "অ্যাস্পিরিন": "Aspirin",
    "ইকোস্প্রিন": "Ecosprin",
    "ওমিপ্রাজল": "Omeprazole",
    "প্যান্টোপ্রাজল": "Pantoprazole",
    "প্যান্টনিক্স": "Pantonix",
    "রেনিটিডিন": "Ranitidine",
    "ফেক্সো": "Fexo",
    "ফেক্সোফেনাডিন": "Fexofenadine",
    "ডাইক্লোফেনাক": "Diclofenac",
    "আইবুপ্রোফেন": "Ibuprofen",
    "সিট্রিজিন": "Cetirizine",
    "অ্যালবেনডাজল": "Albendazole",
    "মেট্রোনিডাজল": "Metronidazole",
    "রসুভাস্ট্যাটিন": "Rosuvastatin",
    "রোভা": "Rova",
    "অ্যাটরভাস্ট্যাটিন": "Atorvastatin",
    "অ্যাটিভ": "Atova",
    "ক্লোপিডোগ্রেল": "Clopidogrel",
    "ক্লোপিড": "Clopid",
    "হিস্টাসিন": "Histacin",
}

# Regex to strip common clinical dosage prefixes
PREFIX_REGEX = re.compile(
    r"^(tab\.|tab|tablet|cap\.|cap|capsule|syp\.|syp|syrup|inj\.|inj|injection|susp\.|suspension|drops|drop|gel|ointment|cream)\s+",
    re.IGNORECASE,
)


def normalize_medicine_query(query: str) -> str:
    """
    Cleans raw query strings:
    - Replaces Bangla drug names with validated English counterparts
    - Strips leading clinical form prefixes (Tab., Cap., Syp., etc.)
    - Removes punctuation and trims whitespace
    """
    if not query:
        return ""

    q = query.strip()

    # Check for direct Bangla match or token replacements
    for bn_key, en_val in BANGLA_MEDICINE_MAP.items():
        if bn_key in q:
            q = q.replace(bn_key, en_val)

    # Strip prefixes like "Tab. Proxen" -> "Proxen"
    q = PREFIX_REGEX.sub("", q).strip()

    # Remove trailing dots or commas
    q = re.sub(r"^[.,\s]+|[.,\s]+$", "", q)

    return q


def get_db_connection():
    try:
        return psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor, connect_timeout=5)
    except Exception as e:
        logger.warning("Neon PostgreSQL connection failed or timed out: %s", e)
        return None


def _load_csv_fallback():
    """Loads raw brands & generics from CSV into memory for zero-downtime offline fallback."""
    global _CSV_DATA
    if _CSV_DATA is not None:
        return _CSV_DATA

    items = []
    brands_path = DATA_RAW_DIR / "brands.csv"
    generics_path = DATA_RAW_DIR / "generics.csv"
    companies_path = DATA_RAW_DIR / "companies.csv"

    if not brands_path.exists():
        return []

    # Load companies map
    companies_map = {}
    if companies_path.exists():
        with open(companies_path, mode="r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                companies_map[row.get("company_id", "")] = row.get("company_name", "")

    # Load generics map
    generics_map = {}
    if generics_path.exists():
        with open(generics_path, mode="r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                generics_map[row.get("generic_id", "")] = {
                    "generic_name": row.get("generic_name", ""),
                    "indication": row.get("indication", ""),
                    "dose": row.get("dose", ""),
                    "side_effect": row.get("side_effect", ""),
                    "contra_indication": row.get("contra_indication", ""),
                }

    # Load brands
    with open(brands_path, mode="r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            b_id = int(row.get("brand_id", 0))
            g_id = row.get("generic_id", "")
            c_id = row.get("company_id", "")
            gen_info = generics_map.get(g_id, {})

            items.append({
                "brand_id": b_id,
                "brand_name": row.get("brand_name", ""),
                "strength": row.get("strength", ""),
                "form": row.get("form", ""),
                "price": row.get("price", ""),
                "packsize": row.get("packsize", ""),
                "manufacturer": companies_map.get(c_id, "Pharmaceuticals Ltd."),
                "generic_id": int(g_id) if g_id.isdigit() else 0,
                "generic_name": gen_info.get("generic_name", "General Generic"),
                "indication": gen_info.get("indication", ""),
                "dose": gen_info.get("dose", ""),
                "side_effect": gen_info.get("side_effect", ""),
                "contra_indication": gen_info.get("contra_indication", ""),
            })

    _CSV_DATA = items
    logger.info("Loaded %d brands into CSV in-memory fallback store", len(items))
    return _CSV_DATA


def _search_csv_fallback(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Fast in-memory fuzzy search over CSV data when DB connection is unavailable."""
    dataset = _load_csv_fallback()
    if not dataset:
        return []

    q_lower = query.lower()
    first_word = q_lower.split()[0] if q_lower else ""

    exact_matches = []
    prefix_matches = []
    contains_matches = []

    for item in dataset:
        b_name = item.get("brand_name", "").lower()
        g_name = item.get("generic_name", "").lower()
        full_spec = f"{b_name} {item.get('strength', '').lower()}".strip()

        if b_name == q_lower or full_spec == q_lower:
            exact_matches.append(item)
        elif b_name.startswith(q_lower) or g_name.startswith(q_lower):
            prefix_matches.append(item)
        elif first_word and (b_name.startswith(first_word) or g_name.startswith(first_word)):
            prefix_matches.append(item)
        elif q_lower in b_name or q_lower in g_name:
            contains_matches.append(item)

        if len(exact_matches) + len(prefix_matches) >= limit * 2:
            break

    combined = exact_matches + prefix_matches + contains_matches
    # Deduplicate while preserving order
    seen_ids = set()
    deduped = []
    for c in combined:
        if c["brand_id"] not in seen_ids:
            seen_ids.add(c["brand_id"])
            deduped.append(dict(c))
            if len(deduped) >= limit:
                break

    for d in deduped:
        gname = (d.get("generic_name") or "").lower().replace(" ", "-")
        d["has_bilingual_doc"] = (DOCS_JSON_DIR / f"{gname}.json").exists()
        d["match_score"] = 0.95

    return deduped


def search_medicines(query: str, limit: int = 20, conn: Optional[Any] = None) -> List[Dict[str, Any]]:
    """
    Fuzzy search for medicine brands and generics using PostgreSQL Trigram similarity and ILIKE.
    Includes automated Bangla translation, prefix removal, and seamless fallback.
    """
    if not query:
        return []

    normalized = normalize_medicine_query(query)
    if len(normalized) < 2:
        normalized = query.strip()

    cache_key = f"{normalized.lower()}_{limit}"
    if cache_key in _SEARCH_CACHE:
        return _SEARCH_CACHE[cache_key]

    owns_conn = False
    if conn is None:
        conn = get_db_connection()
        owns_conn = True

    # If DB is not available, gracefully use in-memory CSV fallback
    if conn is None:
        logger.info("Using local CSV fallback for query: '%s'", normalized)
        res = _search_csv_fallback(normalized, limit=limit)
        _SEARCH_CACHE[cache_key] = res
        return res

    try:
        with conn.cursor() as cur:
            clean_q = normalized.strip()
            first_word = clean_q.split()[0] if clean_q else clean_q

            prefix_full = f"{clean_q}%"
            contains_full = f"%{clean_q}%"
            prefix_first = f"{first_word}%"

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
                   OR b.brand_name ILIKE %s
                   OR (b.brand_name || ' ' || COALESCE(b.strength, '')) ILIKE %s
                   OR b.brand_name ILIKE %s
                   OR similarity(b.brand_name, %s) > 0.25
                   OR similarity(b.brand_name, %s) > 0.25
                ORDER BY 
                    CASE 
                        WHEN b.brand_name ILIKE %s THEN 1
                        WHEN b.brand_name ILIKE %s THEN 2
                        WHEN g.generic_name ILIKE %s THEN 3
                        WHEN (b.brand_name || ' ' || COALESCE(b.strength, '')) ILIKE %s THEN 4
                        ELSE 5
                    END,
                    match_score DESC, 
                    b.brand_name ASC
                LIMIT %s;
            """

            cur.execute(
                sql,
                (
                    clean_q,            # similarity against full clean_q
                    prefix_full,        # b.brand_name ILIKE prefix_full
                    prefix_full,        # g.generic_name ILIKE prefix_full
                    contains_full,      # b.brand_name ILIKE contains_full
                    contains_full,      # full_spec ILIKE contains_full
                    prefix_first,       # b.brand_name ILIKE prefix_first
                    clean_q,            # similarity check
                    first_word,         # similarity against first_word
                    prefix_full,        # ORDER CASE 1
                    prefix_first,       # ORDER CASE 2
                    prefix_full,        # ORDER CASE 3
                    contains_full,      # ORDER CASE 4
                    limit,
                ),
            )
            results = cur.fetchall()

            formatted_results = []
            for row in results:
                r_dict = dict(row)
                gname = (r_dict.get("generic_name") or "").lower().replace(" ", "-")
                r_dict["has_bilingual_doc"] = (DOCS_JSON_DIR / f"{gname}.json").exists()
                formatted_results.append(r_dict)

            # If DB returned 0 results for complex token, attempt fallback
            if not formatted_results:
                formatted_results = _search_csv_fallback(normalized, limit=limit)

            if len(_SEARCH_CACHE) > MAX_CACHE_ENTRIES:
                _SEARCH_CACHE.clear()
            _SEARCH_CACHE[cache_key] = formatted_results

            return formatted_results
    except Exception as e:
        logger.error("DB Query error, switching to CSV fallback: %s", e)
        return _search_csv_fallback(normalized, limit=limit)
    finally:
        if owns_conn and conn:
            conn.close()


def get_medicine_details(brand_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve full structured medicine profile including company, generic monograph,
    and deep Bengali clinical sections if available.
    """
    if brand_id in _DETAILS_CACHE:
        return _DETAILS_CACHE[brand_id]

    conn = get_db_connection()
    if conn is None:
        # Check CSV fallback
        dataset = _load_csv_fallback()
        match = next((item for item in dataset if item["brand_id"] == brand_id), None)
        if match:
            return dict(match)
        return None

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
                dataset = _load_csv_fallback()
                match = next((item for item in dataset if item["brand_id"] == brand_id), None)
                return dict(match) if match else None

            data = dict(brand)

            # Check if deep bilingual JSON document exists for this generic
            gname_slug = (data.get("generic_name") or "").lower().replace(" ", "-")
            doc_file = DOCS_JSON_DIR / f"{gname_slug}.json"
            if not doc_file.exists():
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

            if len(_DETAILS_CACHE) > MAX_CACHE_ENTRIES:
                _DETAILS_CACHE.clear()
            _DETAILS_CACHE[brand_id] = data

            return data
    except Exception as e:
        logger.error("DB details error, using CSV: %s", e)
        dataset = _load_csv_fallback()
        match = next((item for item in dataset if item["brand_id"] == brand_id), None)
        return dict(match) if match else None
    finally:
        if conn:
            conn.close()


# -----------------------------------------------------------------------------
# Admin Medicine Catalog CRUD Operations (Direct Neon PostgreSQL)
# -----------------------------------------------------------------------------

def get_admin_medicines(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """Retrieves paginated, searchable list of real medicines from Neon PostgreSQL brands/generics tables."""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                where_clauses = ["1=1"]
                params = []
                if search:
                    s = f"%{search.strip()}%"
                    where_clauses.append("(b.brand_name ILIKE %s OR g.generic_name ILIKE %s OR c.company_name ILIKE %s)")
                    params.extend([s, s, s])

                where_sql = " AND ".join(where_clauses)
                cur.execute(f"""
                    SELECT COUNT(*) as cnt
                    FROM brands b
                    LEFT JOIN generics g ON b.generic_id = g.generic_id
                    LEFT JOIN companies c ON b.company_id = c.company_id
                    WHERE {where_sql}
                """, params)
                cnt_row = cur.fetchone()
                total_count = cnt_row["cnt"] if cnt_row else 0

                offset = (page - 1) * page_size
                cur.execute(f"""
                    SELECT 
                        b.brand_id,
                        b.brand_name,
                        b.strength,
                        b.form,
                        b.price,
                        b.packsize,
                        COALESCE(g.generic_name, 'General Formulation') as generic_name,
                        COALESCE(c.company_name, 'Pharmaceuticals Ltd.') as manufacturer,
                        COALESCE(g.indication, 'Clinical indication') as indication,
                        COALESCE(g.dose, 'As directed by physician') as dose
                    FROM brands b
                    LEFT JOIN generics g ON b.generic_id = g.generic_id
                    LEFT JOIN companies c ON b.company_id = c.company_id
                    WHERE {where_sql}
                    ORDER BY b.brand_name ASC
                    LIMIT %s OFFSET %s;
                """, params + [page_size, offset])
                rows = cur.fetchall() or []

                items = []
                for r in rows:
                    items.append({
                        "brand_id": r["brand_id"],
                        "brand_name": r["brand_name"],
                        "generic_name": r["generic_name"],
                        "strength": r.get("strength") or "Standard",
                        "form": r.get("form") or "Tablet",
                        "manufacturer": r.get("manufacturer") or "Pharmaceuticals Ltd.",
                        "price": str(r.get("price") or "0.00"),
                        "packsize": r.get("packsize") or "10's pack",
                        "indication": r.get("indication") or "General indication",
                        "dose": r.get("dose") or "As directed by physician",
                    })

                return {
                    "items": items,
                    "totalCount": total_count,
                    "page": page,
                    "pageSize": page_size,
                    "totalPages": max(1, (total_count + page_size - 1) // page_size),
                }
        except Exception as e:
            logger.error("DB query failed in get_admin_medicines: %s", e)
        finally:
            conn.close()

    # Fallback only if database is completely offline
    dataset = _load_csv_fallback() or []
    filtered = dataset
    if search:
        s = search.lower().strip()
        filtered = [
            m for m in dataset
            if s in (m.get("brand_name") or "").lower()
            or s in (m.get("generic_name") or "").lower()
            or s in (m.get("manufacturer") or "").lower()
        ]
    total_count = len(filtered)
    start_idx = (page - 1) * page_size
    items = filtered[start_idx : start_idx + page_size]
    return {
        "items": items,
        "totalCount": total_count,
        "page": page,
        "pageSize": page_size,
        "totalPages": max(1, (total_count + page_size - 1) // page_size),
    }


def add_admin_medicine(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new medicine formulation directly to the Neon PostgreSQL database."""
    conn = get_db_connection()
    new_id = 100001
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT COALESCE(MAX(brand_id), 100000) as m FROM brands")
                row = cur.fetchone()
                if row and row["m"]:
                    new_id = int(row["m"]) + 1

                # Find generic_id or link to first available
                generic_name = (payload.get("generic_name") or "General Formulation").strip()
                cur.execute("SELECT generic_id FROM generics WHERE generic_name ILIKE %s LIMIT 1", (f"%{generic_name}%",))
                g_row = cur.fetchone()
                generic_id = g_row["generic_id"] if g_row else 1

                # Find company_id or link to first available
                manufacturer = (payload.get("manufacturer") or "Pharmaceuticals Ltd.").strip()
                cur.execute("SELECT company_id FROM companies WHERE company_name ILIKE %s LIMIT 1", (f"%{manufacturer}%",))
                c_row = cur.fetchone()
                company_id = c_row["company_id"] if c_row else 1

                try:
                    price_val = float(str(payload.get("price") or "0.0").replace("৳", "").strip())
                except Exception:
                    price_val = 0.0

                cur.execute("""
                    INSERT INTO brands (brand_id, brand_name, generic_id, company_id, form, strength, price, packsize)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (brand_id) DO UPDATE 
                    SET brand_name = EXCLUDED.brand_name, strength = EXCLUDED.strength;
                """, (
                    new_id,
                    payload.get("brand_name", "").strip(),
                    generic_id,
                    company_id,
                    payload.get("form", "Tablet").strip(),
                    payload.get("strength", "").strip(),
                    price_val,
                    payload.get("packsize", "10's pack").strip()
                ))
                conn.commit()
                _SEARCH_CACHE.clear()
        except Exception as e:
            logger.error("DB insert failed in add_admin_medicine: %s", e)
            try:
                conn.rollback()
            except Exception:
                pass
        finally:
            conn.close()

    return {
        "brand_id": new_id,
        "brand_name": payload.get("brand_name", "").strip(),
        "generic_name": payload.get("generic_name", "").strip(),
        "strength": payload.get("strength", "").strip(),
        "form": payload.get("form", "Tablet").strip(),
        "manufacturer": payload.get("manufacturer", "Pharmaceuticals Ltd.").strip(),
        "price": str(payload.get("price", "0.00")),
        "packsize": payload.get("packsize", "10's pack"),
        "indication": payload.get("indication", "General indication"),
        "dose": payload.get("dose", "As directed by physician"),
    }


def update_admin_medicine(brand_id: int, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates an existing medicine in Neon PostgreSQL brands table."""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                price_val = None
                if payload.get("price") is not None:
                    try:
                        price_val = float(str(payload.get("price")).replace("৳", "").strip())
                    except Exception:
                        pass

                cur.execute("""
                    UPDATE brands
                    SET brand_name = COALESCE(%s, brand_name),
                        strength = COALESCE(%s, strength),
                        form = COALESCE(%s, form),
                        price = COALESCE(%s, price),
                        packsize = COALESCE(%s, packsize)
                    WHERE brand_id = %s
                    RETURNING brand_id, brand_name, form, strength, price, packsize;
                """, (
                    payload.get("brand_name"),
                    payload.get("strength"),
                    payload.get("form"),
                    price_val,
                    payload.get("packsize"),
                    brand_id
                ))
                conn.commit()
                row = cur.fetchone()
                if row:
                    _DETAILS_CACHE.pop(brand_id, None)
                    _SEARCH_CACHE.clear()
                    return {
                        "brand_id": row["brand_id"],
                        "brand_name": row["brand_name"],
                        "generic_name": payload.get("generic_name") or "Updated Generic",
                        "strength": row.get("strength") or "",
                        "form": row.get("form") or "Tablet",
                        "manufacturer": payload.get("manufacturer") or "Pharmaceuticals Ltd.",
                        "price": str(row.get("price") or "0.00"),
                        "packsize": row.get("packsize") or "10's pack",
                        "indication": payload.get("indication") or "",
                        "dose": payload.get("dose") or "",
                    }
        except Exception as e:
            logger.error("DB update error in update_admin_medicine: %s", e)
        finally:
            conn.close()

    return None


def delete_admin_medicine(brand_id: int) -> bool:
    """Permanently deletes a medicine from the Neon PostgreSQL database."""
    conn = get_db_connection()
    deleted = False
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM brands WHERE brand_id = %s;", (brand_id,))
                conn.commit()
                deleted = cur.rowcount > 0
                _DETAILS_CACHE.pop(brand_id, None)
                _SEARCH_CACHE.clear()
        except Exception as e:
            logger.error("DB delete error in delete_admin_medicine: %s", e)
            try:
                conn.rollback()
            except Exception:
                pass
        finally:
            conn.close()

    return deleted

