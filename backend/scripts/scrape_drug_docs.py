"""
MedEx Drug Information Scraper for MedBangla AI.

Scrapes drug information from MedEx (https://medex.com.bd/generics),
extracting both English (EN) and Bengali (BN) clinical data, dosage,
indications, side effects, therapeutic class, available dosage forms,
and popular Bangladeshi brands.

Saves data in:
  - backend/data/medical_documents/{slug}.md (Unified Bilingual Markdown)
  - backend/data/medical_documents/bilingual/{slug}.md
  - backend/data/medical_documents/en/{slug}.md (English Markdown)
  - backend/data/medical_documents/bn/{slug}.md (Bengali Markdown)
  - backend/data/medical_documents/json/{slug}.json (Structured Data)
"""

import argparse
import json
import logging
import random
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# =========================================================
# Configuration & Paths
# =========================================================

SCRIPT_DIR = Path(__file__).resolve().parent
# Locate backend directory properly whether executed from root or scripts
if SCRIPT_DIR.name == "scripts":
    BACKEND_DIR = SCRIPT_DIR.parent
else:
    BACKEND_DIR = SCRIPT_DIR

DOCS_DIR = BACKEND_DIR / "data" / "medical_documents"
EN_DOCS_DIR = DOCS_DIR / "en"
BN_DOCS_DIR = DOCS_DIR / "bn"
JSON_DOCS_DIR = DOCS_DIR / "json"

for d in [DOCS_DIR, EN_DOCS_DIR, BN_DOCS_DIR, JSON_DOCS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


MEDEX_BASE_URL = "https://medex.com.bd"
MEDEX_GENERICS_INDEX = "https://medex.com.bd/generics"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
    "Referer": "https://medex.com.bd/",
    "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}

# Verified core generics in Bangladesh (Ranked by commercial brand volume & clinical importance from brands.csv)
DEFAULT_GENERICS: List[Dict[str, str]] = [
    # --- Analgesics, Antipyretics & Anti-Inflammatory (NSAIDs) ---
    {"name": "paracetamol", "url": "https://medex.com.bd/generics/860/paracetamol"},
    {"name": "paracetamol_caffeine", "url": "https://medex.com.bd/generics/861/paracetamol-caffeine"},  # Napa Extra, Ace Plus (89 brands)
    {"name": "aceclofenac", "url": "https://medex.com.bd/generics/3/aceclofenac"},
    {"name": "diclofenac_sodium", "url": "https://medex.com.bd/generics/355/diclofenac-sodium"},        # Clofenac, Voltalin (195 brands)
    {"name": "etoricoxib", "url": "https://medex.com.bd/generics/446/etoricoxib"},                       # Torax, Cox-B (104 brands)
    {"name": "naproxen", "url": "https://medex.com.bd/generics/795/naproxen-sodium"},
    {"name": "ketorolac", "url": "https://medex.com.bd/generics/648/ketorolac-tromethamine"},
    {"name": "ibuprofen", "url": "https://medex.com.bd/generics/593/ibuprofen-oral"},
    {"name": "aspirin", "url": "https://medex.com.bd/generics/85/aspirin"},

    # --- Gastrointestinal & Anti-Ulcerants (PPIs, H2 Blockers, Antispasmodics) ---
    {"name": "omeprazole", "url": "https://medex.com.bd/generics/825/omeprazole"},
    {"name": "esomeprazole", "url": "https://medex.com.bd/generics/433/esomeprazole"},
    {"name": "pantoprazole", "url": "https://medex.com.bd/generics/859/pantoprazole-sodium"},
    {"name": "rabeprazole", "url": "https://medex.com.bd/generics/942/rabeprazole-sodium"},
    {"name": "famotidine", "url": "https://medex.com.bd/generics/452/famotidine"},
    {"name": "domperidone", "url": "https://medex.com.bd/generics/380/domperidone-maleate"},
    {"name": "ondansetron", "url": "https://medex.com.bd/generics/827/ondansetron"},
    {"name": "tiemonium", "url": "https://medex.com.bd/generics/1069/tiemonium-methylsulfate"},         # Visceralgine, Algin (82 brands)

    # --- Antibiotics & Antimicrobials (Top Bangladesh Prescription Classes) ---
    {"name": "cephradine", "url": "https://medex.com.bd/generics/232/cephradine"},                      # Cephran, Lebac (#1 in BD: 367 brands)
    {"name": "flucloxacillin", "url": "https://medex.com.bd/generics/473/flucloxacillin-sodium"},        # Fluclox (231 brands)
    {"name": "cefixime", "url": "https://medex.com.bd/generics/217/cefixime-trihydrate"},
    {"name": "cefuroxime", "url": "https://medex.com.bd/generics/226/cefuroxime-axetil"},
    {"name": "ceftriaxone", "url": "https://medex.com.bd/generics/225/ceftriaxone-sodium"},
    {"name": "cefpodoxime", "url": "https://medex.com.bd/generics/220/cefpodoxime-proxetil"},          # Cefodox (132 brands)
    {"name": "ciprofloxacin", "url": "https://medex.com.bd/generics/263/ciprofloxacin"},
    {"name": "azithromycin", "url": "https://medex.com.bd/generics/100/azithromycin-dihydrate"},
    {"name": "amoxicillin", "url": "https://medex.com.bd/generics/69/amoxicillin-trihydrate"},
    {"name": "levofloxacin", "url": "https://medex.com.bd/generics/680/levofloxacin-hemihydrate"},
    {"name": "metronidazole", "url": "https://medex.com.bd/generics/751/metronidazole"},
    {"name": "doxycycline", "url": "https://medex.com.bd/generics/394/doxycycline-hydrochloride"},
    {"name": "fluconazole", "url": "https://medex.com.bd/generics/474/fluconazole"},                    # Flugal, Diflu (150 brands)
    {"name": "nitazoxanide", "url": "https://medex.com.bd/generics/812/nitazoxanide"},                  # Zox, Alin (71 brands)
    {"name": "albendazole", "url": "https://medex.com.bd/generics/16/albendazole"},                     # Almex, Alben (97 brands)

    # --- Cardiovascular & Antihypertensives ---
    {"name": "losartan", "url": "https://medex.com.bd/generics/699/losartan-potassium"},
    {"name": "amlodipine", "url": "https://medex.com.bd/generics/62/amlodipine-besilate"},
    {"name": "telmisartan", "url": "https://medex.com.bd/generics/1038/telmisartan"},
    {"name": "bisoprolol", "url": "https://medex.com.bd/generics/135/bisoprolol-fumarate"},
    {"name": "atenolol", "url": "https://medex.com.bd/generics/88/atenolol"},
    {"name": "atorvastatin", "url": "https://medex.com.bd/generics/92/atorvastatin-calcium"},
    {"name": "rosuvastatin", "url": "https://medex.com.bd/generics/970/rosuvastatin-calcium"},
    {"name": "clopidogrel", "url": "https://medex.com.bd/generics/286/clopidogrel-bisulphate"},

    # --- Antidiabetics ---
    {"name": "metformin", "url": "https://medex.com.bd/generics/734/metformin-hydrochloride"},          # Comet, Daomin (135 brands)
    {"name": "glimepiride", "url": "https://medex.com.bd/generics/524/glimepiride"},
    {"name": "linagliptin", "url": "https://medex.com.bd/generics/687/linagliptin"},
    {"name": "sitagliptin", "url": "https://medex.com.bd/generics/990/sitagliptin"},
    {"name": "empagliflozin", "url": "https://medex.com.bd/generics/1275/empagliflozin"},

    # --- Antihistamines, Respiratory & Cough ---
    {"name": "cetirizine", "url": "https://medex.com.bd/generics/234/cetirizine-hydrochloride"},        # Alatrol (123 brands)
    {"name": "fexofenadine", "url": "https://medex.com.bd/generics/468/fexofenadine-hydrochloride"},    # Fexo (126 brands)
    {"name": "desloratadine", "url": "https://medex.com.bd/generics/329/desloratadine"},
    {"name": "rupatadine", "url": "https://medex.com.bd/generics/972/rupatadine-fumarate"},
    {"name": "montelukast", "url": "https://medex.com.bd/generics/768/montelukast-sodium"},            # Monas, Provair (115 brands)
    {"name": "salbutamol", "url": "https://medex.com.bd/generics/1318/salbutamol"},                     # Ventolin (113 brands)
    {"name": "ambroxol", "url": "https://medex.com.bd/generics/53/ambroxol-hydrochloride"},             # Ambolyt (83 brands)
    {"name": "xylometazoline", "url": "https://medex.com.bd/generics/1139/xylometazoline-hydrochloride"}, # Antazol (Nasal)

    # --- Neurological & Musculoskeletal ---
    {"name": "pregabalin", "url": "https://medex.com.bd/generics/919/pregabalin"},                      # Prelica, Neugaba (97 brands)
    {"name": "baclofen", "url": "https://medex.com.bd/generics/105/baclofen"},                          # Flexil (79 brands)
    {"name": "clonazepam", "url": "https://medex.com.bd/generics/284/clonazepam"},

    # --- Minerals & Essential Supplements ---
    {"name": "calcium_vitamin_d3", "url": "https://medex.com.bd/generics/169/conventional-calcium-vitamin-d3"}, # Calbo-D (100 brands)
    {"name": "zinc_sulfate", "url": "https://medex.com.bd/generics/1144/zinc-sulfate-monohydrate"},              # Babyzinc (114 brands)
    {"name": "vitamin_b_complex_c", "url": "https://medex.com.bd/generics/1366/vitamin-b-complex-vitamin-c"},   # B-50 Forte (154 brands)
    {"name": "vitamin_c", "url": "https://medex.com.bd/generics/1137/vitamin-c-ascorbic-acid"},                  # Cee, C-Vivit
]



# Section mappings between MedEx HTML IDs and readable titles (EN & BN)
SECTION_METADATA: Dict[str, Dict[str, str]] = {
    "indications": {
        "en": "Indications",
        "bn": "নির্দেশনা",
    },
    "mode_of_action": {
        "en": "Pharmacology & Mode of Action",
        "bn": "ফার্মাকোলজি ও কার্যপদ্ধতি",
    },
    "dosage": {
        "en": "Dosage & Administration",
        "bn": "মাত্রা ও সেবনবিধি",
    },
    "administration": {
        "en": "Administration",
        "bn": "প্রয়োগবিধি",
    },
    "interaction": {
        "en": "Drug Interactions",
        "bn": "ঔষধের মিথষ্ক্রিয়া",
    },
    "contraindications": {
        "en": "Contraindications",
        "bn": "প্রতিনির্দেশনা",
    },
    "side_effects": {
        "en": "Side Effects",
        "bn": "পার্শ্ব প্রতিক্রিয়া",
    },
    "pregnancy_cat": {
        "en": "Pregnancy & Lactation",
        "bn": "গর্ভাবস্থায় ও স্তন্যদানকালে",
    },
    "precautions": {
        "en": "Precautions & Warnings",
        "bn": "সতর্কতা ও সাবধানতা",
    },
    "pediatric_uses": {
        "en": "Use in Special Populations",
        "bn": "বিশেষ ক্ষেত্রে ব্যবহার",
    },
    "overdose_effects": {
        "en": "Overdose Effects",
        "bn": "মাত্রাধিক্যতা ও বিষক্রিয়া",
    },
    "drug_classes": {
        "en": "Therapeutic Class",
        "bn": "থেরাপিউটিক ক্লাস",
    },
    "storage_conditions": {
        "en": "Storage Conditions",
        "bn": "সংরক্ষণ ও স্থায়িত্ব",
    },
    "compound_summary": {
        "en": "Chemical Structure",
        "bn": "রাসায়নিক গঠন",
    },
    "commonly_asked_questions": {
        "en": "Frequently Asked Questions",
        "bn": "সাধারণ জিজ্ঞাসা (FAQs)",
    },
}

# =========================================================
# Logging
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("medex_scraper")


# =========================================================
# HTTP Session with Retries
# =========================================================

def create_session() -> requests.Session:
    """Create requests session with robust connection & retry policies."""
    session = requests.Session()
    retry_strategy = Retry(
        total=4,
        connect=3,
        read=3,
        backoff_factor=1.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update(HEADERS)
    return session


SESSION = create_session()


# =========================================================
# Text & HTML Helpers
# =========================================================

def clean_text(text: Optional[str]) -> str:
    """Normalize whitespace and strip text."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def safe_filename(name: str) -> str:
    """Produce safe ASCII filename slug."""
    clean = re.sub(r"[^a-zA-Z0-9_-]+", "_", name.strip().lower())
    clean = clean.strip("_")
    return clean or "drug"


def html_to_markdown(elem: Optional[Tag]) -> str:
    """Convert an HTML container into clean Markdown text."""
    if not elem:
        return ""

    def process_node(node: Any) -> str:
        if isinstance(node, NavigableString):
            return str(node)
        if not isinstance(node, Tag):
            return ""

        tag_name = node.name.lower()

        if tag_name in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            inner = clean_text("".join(process_node(c) for c in node.children))
            return f"\n\n#### {inner}\n\n" if inner else ""

        elif tag_name == "p":
            inner = "".join(process_node(c) for c in node.children).strip()
            return f"\n\n{inner}\n\n" if inner else ""

        elif tag_name in ["strong", "b"]:
            inner = clean_text("".join(process_node(c) for c in node.children))
            return f"**{inner}**" if inner else ""

        elif tag_name in ["em", "i"]:
            inner = clean_text("".join(process_node(c) for c in node.children))
            return f"*{inner}*" if inner else ""

        elif tag_name == "ul":
            items = []
            for li in node.find_all("li", recursive=False):
                li_text = clean_text("".join(process_node(c) for c in li.children))
                if li_text:
                    items.append(f"- {li_text}")
            return "\n" + "\n".join(items) + "\n" if items else ""

        elif tag_name == "ol":
            items = []
            for idx, li in enumerate(node.find_all("li", recursive=False), 1):
                li_text = clean_text("".join(process_node(c) for c in li.children))
                if li_text:
                    items.append(f"{idx}. {li_text}")
            return "\n" + "\n".join(items) + "\n" if items else ""

        elif tag_name == "br":
            return "\n"

        elif tag_name == "table":
            rows = []
            for tr in node.find_all("tr"):
                cells = [
                    clean_text(c.get_text(" ", strip=True))
                    for c in tr.find_all(["td", "th"])
                ]
                if cells:
                    rows.append("| " + " | ".join(cells) + " |")
            if rows:
                col_count = len(rows[0].split("|")) - 2
                sep = "| " + " | ".join(["---"] * max(col_count, 1)) + " |"
                return "\n\n" + rows[0] + "\n" + sep + "\n" + "\n".join(rows[1:]) + "\n\n"
            return ""

        else:
            return "".join(process_node(c) for c in node.children)

    raw_md = "".join(process_node(c) for c in elem.children)
    # Collapse multiple blank lines
    cleaned = re.sub(r"\n{3,}", "\n\n", raw_md)
    return cleaned.strip()


# =========================================================
# Generic URL Resolution & Checking
# =========================================================

def build_language_urls(url: str) -> Tuple[str, str]:
    """
    Given a MedEx generic URL (either EN or BN), return (en_url, bn_url).
    """
    clean_url = url.split("?")[0].rstrip("/")
    if clean_url.endswith("/bn"):
        en_url = clean_url[:-3]
        bn_url = clean_url
    elif clean_url.endswith("/en"):
        en_url = clean_url[:-3]
        bn_url = f"{clean_url[:-3]}/bn"
    else:
        en_url = clean_url
        bn_url = f"{clean_url}/bn"
    return en_url, bn_url


def check_medex_index(
    page: int = 1, alpha: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Check https://medex.com.bd/generics and retrieve list of generics available.
    """
    params = {}
    if alpha:
        params["alpha"] = alpha.lower()
    if page > 1:
        params["page"] = page

    logger.info("Checking MedEx generics index (page=%d, alpha=%s)...", page, alpha)
    try:
        resp = SESSION.get(
            MEDEX_GENERICS_INDEX,
            params=params,
            timeout=(6, 20),
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        generics: List[Dict[str, Any]] = []
        for item in soup.select("a.hoverable-block"):
            href = item.get("href")
            if not href or "/generics/" not in href:
                continue

            full_url = urljoin(MEDEX_BASE_URL, href)
            name_elem = item.select_one(".data-row-top")
            brands_elem = item.select_one(".dcind")

            name = clean_text(name_elem.get_text(strip=True)) if name_elem else ""
            brands_info = clean_text(brands_elem.get_text(strip=True)) if brands_elem else ""

            # Extract numeric id and slug
            match = re.search(r"/generics/(\d+)/([^/?#]+)", full_url)
            generic_id = match.group(1) if match else ""
            slug = match.group(2) if match else safe_filename(name)

            if full_url and name:
                generics.append(
                    {
                        "id": generic_id,
                        "slug": slug,
                        "name": name,
                        "url": full_url,
                        "brands_info": brands_info,
                    }
                )

        logger.info("Retrieved %d generic links from index page %d", len(generics), page)
        return generics

    except Exception as exc:
        logger.error("Failed to check MedEx index: %s", exc)
        return []


# =========================================================
# Page Scraper & Parser
# =========================================================

def is_bot_challenge(soup: BeautifulSoup, html: str) -> bool:
    """Check if page is a bot challenge, captcha, or Cloudflare/firewall check."""
    title_elem = soup.find("title")
    title_text = title_elem.get_text(strip=True).lower() if title_elem else ""
    h1_elem = soup.find("h1")
    h1_text = h1_elem.get_text(strip=True).lower() if h1_elem else ""

    triggers = [
        "security check",
        "just a moment",
        "attention required",
        "cloudflare",
        "robot",
        "captcha",
        "access denied",
        "ddos-guard",
        "ray id",
    ]
    if any(t in title_text for t in triggers) or any(t in h1_text for t in triggers):
        return True

    lower_html = html.lower()
    if "please turn javascript on and reload the page" in lower_html:
        return True
    if "cf-browser-verification" in lower_html or "challenge-platform" in lower_html:
        return True
    return False


def parse_generic_page(html: str) -> Dict[str, Any]:
    """Extract all relevant sections, metadata, dosage forms, and brands."""
    soup = BeautifulSoup(html, "html.parser")

    # Guard 1: Detect bot challenges and firewall block pages
    if is_bot_challenge(soup, html):
        page_title = soup.find("title").get_text(strip=True) if soup.find("title") else "Unknown"
        logger.warning("Detected bot verification or challenge page (title='%s').", page_title)
        return {}

    # Remove irrelevant elements
    for el in soup.find_all(["script", "style", "noscript"]):
        el.decompose()

    # Extract Drug Title
    h1 = soup.find("h1")
    title = clean_text(h1.get_text(strip=True)) if h1 else ""
    if not title or any(k in title.lower() for k in ["security check", "captcha", "error", "access denied"]):
        logger.warning("Invalid or challenge drug title encountered ('%s').", title)
        return {}

    # Extract Sections from .ac-body and their preceding header div
    sections: Dict[str, Dict[str, str]] = {}
    for ac_body in soup.find_all(class_="ac-body"):
        header_div = ac_body.find_previous_sibling()
        if not header_div:
            continue

        sec_id = header_div.get("id", "").strip()
        sec_header = clean_text(header_div.get_text(strip=True))
        content_md = html_to_markdown(ac_body)

        if not content_md:
            continue

        if not sec_id:
            sec_id = safe_filename(sec_header)

        sections[sec_id] = {
            "title": sec_header,
            "content": content_md,
        }

    # Guard 2: A valid monograph must have at least one clinical section
    if not sections:
        logger.warning("No clinical sections extracted for '%s'. Rejecting page data.", title)
        return {}

    # Extract Therapeutic Class if not in sections
    therapeutic_class = ""
    if "drug_classes" in sections:
        therapeutic_class = sections["drug_classes"]["content"]
    else:
        # Check meta tag or related links
        for a in soup.find_all("a", href=True):
            if "/drug-classes/" in a["href"]:
                therapeutic_class = clean_text(a.get_text(strip=True))
                break

    # Extract Available Dosage Forms / Prescribing Information
    dosage_forms: List[str] = []
    for btn in soup.select("a.prsinf-child-btn, a.expand-btn"):
        txt = clean_text(btn.get_text(strip=True))
        if txt and not any(k in txt.lower() for k in ["brand", "view", "monograph"]):
            if txt not in dosage_forms:
                dosage_forms.append(txt)

    # Extract Brands count & Sample popular brands
    brands: List[Dict[str, str]] = []
    brand_count_str = ""

    brand_count_tag = soup.find(string=re.compile(r"\bavailable brands\b", re.IGNORECASE))
    if brand_count_tag:
        brand_count_str = clean_text(str(brand_count_tag))

    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if "/brands/" in href:
            tokens = [clean_text(t) for t in a.stripped_strings if clean_text(t)]
            if len(tokens) >= 3:
                brand_name = tokens[0]
                strength_form = tokens[1]
                company = tokens[2]
                price = " ".join(tokens[3:]) if len(tokens) > 3 else ""
                brands.append(
                    {
                        "name": brand_name,
                        "strength": strength_form,
                        "manufacturer": company,
                        "price": price,
                        "url": urljoin(MEDEX_BASE_URL, href),
                    }
                )

    return {
        "title": title,
        "therapeutic_class": therapeutic_class,
        "dosage_forms": dosage_forms,
        "brand_count": brand_count_str,
        "brands": brands,
        "sections": sections,
    }


def fetch_page_with_retry(
    url: str, max_retries: int = 3, base_delay: float = 3.0
) -> Tuple[Optional[str], Dict[str, Any]]:
    """
    Fetch a page and parse generic details. If a bot challenge or 0 sections
    are returned, waits with exponential backoff and re-initializes session.
    """
    global SESSION
    for attempt in range(1, max_retries + 1):
        try:
            resp = SESSION.get(url, timeout=(8, 25))
            if resp.status_code == 200:
                data = parse_generic_page(resp.text)
                if data and data.get("sections"):
                    return resp.text, data
                logger.warning(
                    "Attempt %d/%d for %s yielded bot challenge or 0 sections. Resetting session & backing off...",
                    attempt,
                    max_retries,
                    url,
                )
            else:
                logger.warning(
                    "Attempt %d/%d for %s returned status %d",
                    attempt,
                    max_retries,
                    url,
                    resp.status_code,
                )
        except Exception as exc:
            logger.warning(
                "Attempt %d/%d error fetching %s: %s",
                attempt,
                max_retries,
                url,
                exc,
            )

        # Clear session to drop any Cloudflare challenge cookies
        SESSION = create_session()

        if attempt < max_retries:
            sleep_time = base_delay * (2 ** (attempt - 1)) + random.uniform(2.0, 4.0)
            logger.info("Pausing %.1fs before retrying %s...", sleep_time, url)
            time.sleep(sleep_time)

    return None, {}



# =========================================================
# Markdown Builders
# =========================================================

def build_monolingual_markdown(
    name: str,
    title: str,
    lang: str,
    url: str,
    therapeutic_class: str,
    dosage_forms: List[str],
    brands: List[Dict[str, str]],
    sections: Dict[str, Dict[str, str]],
) -> str:
    """Build clean Markdown for a single language (EN or BN)."""
    scraped_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    is_bn = (lang == "bn")

    lines: List[str] = []
    if is_bn:
        lines.append(f"# জেনেরিক: {title or name}")
        lines.append("")
        lines.append(f"- মূল নাম: {name}")
        lines.append(f"- থেরাপিউটিক ক্লাস: {therapeutic_class or 'তথ্য পাওয়া যায়নি'}")
        if dosage_forms:
            lines.append(f"- সহজলভ্য ডোজ ফর্ম: {', '.join(dosage_forms)}")
        lines.append(f"- উৎস লিংক: {url}")
        lines.append(f"- সংগৃহীত সময় (UTC): {scraped_at}")
        lines.append("")
        lines.append("> সতর্কতা: এই তথ্য শুধুমাত্র রেফারেন্স ও গবেষণার উদ্দেশ্যে প্রস্তুত করা হয়েছে। চিকিৎসকের পরামর্শ ছাড়া কোনো ঔষধ সেবন করবেন না।")
        lines.append("")
    else:
        lines.append(f"# Generic: {title or name.title()}")
        lines.append("")
        lines.append(f"- Generic Name: {name}")
        lines.append(f"- Therapeutic Class: {therapeutic_class or 'Not Specified'}")
        if dosage_forms:
            lines.append(f"- Available Dosage Forms: {', '.join(dosage_forms)}")
        lines.append(f"- Source URL: {url}")
        lines.append(f"- Retrieved At (UTC): {scraped_at}")
        lines.append("")
        lines.append("> Medical Notice: Reference information extracted from public database. Always verify with qualified medical practitioners before clinical use.")
        lines.append("")

    # Sections
    if sections:
        for sec_id, sec_data in sections.items():
            meta = SECTION_METADATA.get(sec_id)
            sec_heading = (meta[lang] if meta else sec_data["title"])
            lines.append(f"## {sec_heading}")
            lines.append("")
            lines.append(sec_data["content"])
            lines.append("")

    # Sample Brands
    if brands:
        header_text = "বাংলাদেশের শীর্ষ কয়েকটি ব্র্যান্ড" if is_bn else "Sample Available Brands in Bangladesh"
        lines.append(f"## {header_text}")
        lines.append("")
        lines.append("| Brand Name | Strength / Form | Manufacturer | Price |")
        lines.append("| --- | --- | --- | --- |")
        for b in brands[:15]:
            lines.append(f"| {b['name']} | {b['strength']} | {b['manufacturer']} | {b['price']} |")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def build_bilingual_markdown(
    name: str,
    en_data: Dict[str, Any],
    bn_data: Dict[str, Any],
    en_url: str,
    bn_url: str,
) -> str:
    """Build unified bilingual Markdown containing both EN and BN side-by-side."""
    scraped_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    title_en = en_data.get("title") or name.title()
    title_bn = bn_data.get("title") or title_en

    lines = [
        f"# {title_en} / {title_bn}",
        "",
        f"- **Generic Name (EN)**: {title_en}",
        f"- **Generic Name (BN)**: {title_bn}",
        f"- **Therapeutic Class**: {en_data.get('therapeutic_class') or bn_data.get('therapeutic_class') or 'N/A'}",
        f"- **Available Dosage Forms**: {', '.join(en_data.get('dosage_forms', [])) or 'Tablet / Capsule / Syrup'}",
        f"- **Source (English)**: {en_url}",
        f"- **Source (বাংলা)**: {bn_url}",
        f"- **Retrieved At (UTC)**: {scraped_at}",
        "",
        "> **Medical Disclaimer / চিকিৎসীয় সতর্কতা**:",
        "> This document provides clinical reference information in English and Bengali.",
        "> এটি বাংলা এবং ইংরেজি ভাষায় রেফারেন্স তথ্য। চিকিৎসকের পরামর্শ ছাড়া কোনো ঔষধ সেবন করবেন না।",
        "",
        "---",
        "",
    ]

    # Combine all known section IDs in a standard logical order
    all_section_ids: List[str] = list(SECTION_METADATA.keys())
    for sid in list(en_data.get("sections", {}).keys()) + list(bn_data.get("sections", {}).keys()):
        if sid not in all_section_ids:
            all_section_ids.append(sid)

    for sec_id in all_section_ids:
        sec_en = en_data.get("sections", {}).get(sec_id)
        sec_bn = bn_data.get("sections", {}).get(sec_id)

        if not sec_en and not sec_bn:
            continue

        meta = SECTION_METADATA.get(sec_id)
        header_en = meta["en"] if meta else (sec_en["title"] if sec_en else sec_id.replace("_", " ").title())
        header_bn = meta["bn"] if meta else (sec_bn["title"] if sec_bn else header_en)

        lines.append(f"## {header_en} / {header_bn}")
        lines.append("")

        if sec_en and sec_en.get("content"):
            lines.append("### English:")
            lines.append(sec_en["content"])
            lines.append("")

        if sec_bn and sec_bn.get("content"):
            lines.append("### বাংলা (Bengali):")
            lines.append(sec_bn["content"])
            lines.append("")

        lines.append("---")
        lines.append("")

    # Brands Table
    brands = en_data.get("brands") or bn_data.get("brands") or []
    if brands:
        lines.append("## Available Brands in Bangladesh / বাংলাদেশে উপলব্ধ ব্র্যান্ডসমূহ")
        lines.append("")
        lines.append("| Brand Name | Strength / Form | Manufacturer | Unit Price / Pack |")
        lines.append("| --- | --- | --- | --- |")
        for b in brands[:20]:
            lines.append(f"| {b['name']} | {b['strength']} | {b['manufacturer']} | {b['price']} |")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


# =========================================================
# Core Generic Scraper Routine
# =========================================================

def scrape_generic_bilingual(
    name: str,
    target_url: str,
    pause_between_langs: float = 1.5,
    skip_existing: bool = True,
) -> bool:
    """
    Scrape both English and Bengali versions of a generic medicine,
    and save monolingual, bilingual, and JSON documents.
    """
    slug = safe_filename(name)
    json_path = JSON_DOCS_DIR / f"{slug}.json"
    if skip_existing and json_path.exists():
        try:
            cached = json.loads(json_path.read_text(encoding="utf-8"))
            has_sections = bool(cached.get("sections_en") or cached.get("sections_bn"))
            is_corrupt = "security check" in str(cached.get("name_en", "")).lower()
            if has_sections and not is_corrupt:
                logger.info("Skipping '%s' (already exists & verified in %s)", name, json_path.name)
                return True
        except Exception:
            pass

    logger.info("Starting scrape for generic '%s' -> %s", name, target_url)

    en_url, bn_url = build_language_urls(target_url)

    # 1. Fetch English Page (with retry and challenge backoff)
    _, en_data = fetch_page_with_retry(en_url)


    if pause_between_langs > 0:
        time.sleep(pause_between_langs)

    # 2. Fetch Bengali Page (with retry and challenge backoff)
    _, bn_data = fetch_page_with_retry(bn_url)

    en_sections = en_data.get("sections", {}) if en_data else {}
    bn_sections = bn_data.get("sections", {}) if bn_data else {}

    # Strict Validation: Refuse to write empty or corrupted docs
    if not en_sections and not bn_sections:
        logger.error(
            "Failed to extract valid clinical sections for '%s' in both languages (EN: %d sec, BN: %d sec). "
            "Aborting file creation to prevent corrupt documents.",
            name,
            len(en_sections),
            len(bn_sections),
        )
        return False

    slug = safe_filename(name)

    # Filter out potential bot-challenge titles
    def clean_drug_title(raw_title: Optional[str], fallback: str) -> str:
        if not raw_title or any(
            k in raw_title.lower() for k in ["security check", "captcha", "error", "cloudflare"]
        ):
            return fallback
        return raw_title

    title_en = clean_drug_title(en_data.get("title"), name.title())
    title_bn = clean_drug_title(bn_data.get("title"), title_en)

    # 3. Build Markdown outputs
    md_en = build_monolingual_markdown(
        name=name,
        title=title_en,
        lang="en",
        url=en_url,
        therapeutic_class=en_data.get("therapeutic_class", "") if en_data else "",
        dosage_forms=en_data.get("dosage_forms", []) if en_data else [],
        brands=en_data.get("brands", []) if en_data else [],
        sections=en_sections,
    )

    md_bn = build_monolingual_markdown(
        name=name,
        title=title_bn,
        lang="bn",
        url=bn_url,
        therapeutic_class=(bn_data.get("therapeutic_class") if bn_data else "")
        or (en_data.get("therapeutic_class") if en_data else ""),
        dosage_forms=(bn_data.get("dosage_forms") if bn_data else [])
        or (en_data.get("dosage_forms") if en_data else []),
        brands=(bn_data.get("brands") if bn_data else [])
        or (en_data.get("brands") if en_data else []),
        sections=bn_sections,
    )

    md_bilingual = build_bilingual_markdown(
        name=name,
        en_data=en_data or {},
        bn_data=bn_data or {},
        en_url=en_url,
        bn_url=bn_url,
    )

    # 4. Save JSON Structured Data
    brands = (
        (en_data.get("brands") if en_data else [])
        or (bn_data.get("brands") if bn_data else [])
        or []
    )
    json_payload = {
        "slug": slug,
        "name_en": title_en,
        "name_bn": title_bn,
        "therapeutic_class": (
            (en_data.get("therapeutic_class") if en_data else "")
            or (bn_data.get("therapeutic_class") if bn_data else "")
            or ""
        ),
        "dosage_forms": (
            (en_data.get("dosage_forms") if en_data else [])
            or (bn_data.get("dosage_forms") if bn_data else [])
            or []
        ),
        "brand_count": (
            (en_data.get("brand_count") if en_data else "")
            or (bn_data.get("brand_count") if bn_data else "")
            or ""
        ),
        "brands": brands,
        "sections_en": {
            sid: data["content"] for sid, data in en_sections.items()
        },
        "sections_bn": {
            sid: data["content"] for sid, data in bn_sections.items()
        },
        "source_url_en": en_url,
        "source_url_bn": bn_url,
        "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }

    # 5. Write Files (UTF-8 encoding)
    en_file = EN_DOCS_DIR / f"{slug}.md"
    bn_file = BN_DOCS_DIR / f"{slug}.md"
    json_file = JSON_DOCS_DIR / f"{slug}.json"

    en_file.write_text(md_en, encoding="utf-8")
    bn_file.write_text(md_bn, encoding="utf-8")
    json_file.write_text(json.dumps(json_payload, ensure_ascii=False, indent=2), encoding="utf-8")


    logger.info(
        "Successfully saved drug docs for '%s' (EN: %d sec, BN: %d sec, Brands: %d)",
        name,
        len(en_sections),
        len(bn_sections),
        len(brands),
    )
    return True


def fix_corrupted_documents(delay: float = 2.0) -> int:
    """
    Find all documents in JSON_DOCS_DIR that have 'Security Check' as title or 0 sections,
    and re-scrape them properly.
    """
    corrupted: List[Dict[str, str]] = []
    for json_path in sorted(JSON_DOCS_DIR.glob("*.json")):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            is_corrupt = (
                "security check" in str(data.get("name_en", "")).lower()
                or "security check" in str(data.get("name_bn", "")).lower()
                or (len(data.get("sections_en", {})) == 0 and len(data.get("sections_bn", {})) == 0)
            )
            if is_corrupt:
                slug = data.get("slug") or json_path.stem
                url = data.get("source_url_en")
                if not url:
                    match = next((g["url"] for g in DEFAULT_GENERICS if g["name"] == slug), None)
                    url = match
                if url:
                    corrupted.append({"slug": slug, "url": url})
        except Exception as exc:
            logger.warning("Error reading %s: %s", json_path, exc)

    logger.info("Found %d corrupted/empty drug documents to repair.", len(corrupted))
    fixed = 0
    for idx, item in enumerate(corrupted, 1):
        logger.info("[%d/%d] Repairing '%s' (%s)...", idx, len(corrupted), item["slug"], item["url"])
        if scrape_generic_bilingual(name=item["slug"], target_url=item["url"]):
            fixed += 1
            logger.info("Successfully repaired '%s'", item["slug"])
        else:
            logger.error("Failed to repair '%s'", item["slug"])
        time.sleep(delay)

    logger.info("Repair finished: %d/%d documents successfully repaired.", fixed, len(corrupted))
    return fixed


# =========================================================
# Main Execution CLI
# =========================================================

def main() -> None:
    parser = argparse.ArgumentParser(
        description="MedEx Drug Information Scraper for MedBangla AI"
    )
    parser.add_argument(
        "--crawl",
        type=int,
        default=0,
        help="Crawl N generics directly from https://medex.com.bd/generics",
    )
    parser.add_argument(
        "--page",
        type=int,
        default=1,
        help="Starting page number on MedEx generics index (default: 1)",
    )
    parser.add_argument(
        "--alpha",
        type=str,
        default=None,
        help="Filter generics index by letter (e.g. 'a', 'p')",
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="Scrape a single generic URL directly (e.g. https://medex.com.bd/generics/860/paracetamol)",
    )
    parser.add_argument(
        "--check-index",
        action="store_true",
        help="Check and display the first page of https://medex.com.bd/generics without scraping",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=2.5,
        help="Delay in seconds between requests to avoid rate limits (default: 2.5)",
    )
    parser.add_argument(
        "--fix-corrupted",
        action="store_true",
        help="Find and re-scrape any existing drug documents corrupted by bot check or missing sections",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-scraping even if valid document already exists locally",
    )

    args = parser.parse_args()

    # Mode 0: Repair Corrupted
    if args.fix_corrupted:
        fixed_count = fix_corrupted_documents(delay=max(args.delay, 2.0))
        sys.exit(0 if fixed_count > 0 else 1)

    # Mode 1: Check Index
    if args.check_index:
        generics = check_medex_index(page=args.page, alpha=args.alpha)
        print(f"\n--- MedEx Generics Index (Page {args.page}) ---")
        for idx, g in enumerate(generics, 1):
            print(f"{idx}. {g['name']} ({g['brands_info']}) -> {g['url']}")
        return

    # Mode 2: Single URL
    if args.url:
        parsed = urlparse(args.url)
        slug = parsed.path.rstrip("/").split("/")[-1]
        if slug == "bn" or slug == "en":
            slug = parsed.path.rstrip("/").split("/")[-2]
        success = scrape_generic_bilingual(name=slug, target_url=args.url, skip_existing=not args.force)
        sys.exit(0 if success else 1)

    # Mode 3: Dynamic crawl from index
    if args.crawl > 0:
        logger.info("Crawling %d generics from MedEx index...", args.crawl)
        collected_generics: List[Dict[str, Any]] = []
        curr_page = args.page

        while len(collected_generics) < args.crawl:
            items = check_medex_index(page=curr_page, alpha=args.alpha)
            if not items:
                break
            for it in items:
                collected_generics.append(it)
                if len(collected_generics) >= args.crawl:
                    break
            curr_page += 1

        successful = 0
        for item in collected_generics:
            if scrape_generic_bilingual(name=item["slug"], target_url=item["url"], skip_existing=not args.force):
                successful += 1
            time.sleep(args.delay)

        logger.info(
            "Crawl finished: %d/%d successfully processed.",
            successful,
            len(collected_generics),
        )
        return

    # Mode 4: Default verified essential medicines in Bangladesh
    logger.info("Starting scrape for %d default essential drugs...", len(DEFAULT_GENERICS))
    successful = 0
    failed = 0

    for item in DEFAULT_GENERICS:
        slug = safe_filename(item["name"])
        json_path = JSON_DOCS_DIR / f"{slug}.json"
        is_already_done = False
        if not args.force and json_path.exists():
            try:
                cached = json.loads(json_path.read_text(encoding="utf-8"))
                if (cached.get("sections_en") or cached.get("sections_bn")) and "security check" not in str(cached.get("name_en", "")).lower():
                    logger.info("Skipping '%s' (already exists: %s)", item["name"], json_path.name)
                    successful += 1
                    is_already_done = True
            except Exception:
                pass

        if is_already_done:
            continue

        if scrape_generic_bilingual(name=item["name"], target_url=item["url"], skip_existing=not args.force):
            successful += 1
        else:
            failed += 1
        time.sleep(args.delay)

    logger.info(
        "Finished scraping default generics | successful=%d | failed=%d | output_dir=%s",
        successful,
        failed,
        DOCS_DIR,
    )


if __name__ == "__main__":
    main()
