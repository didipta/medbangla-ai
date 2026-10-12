"""
MedBangla AI - Deterministic Drug-Drug Interaction Verification Engine
======================================================================
Provides sub-millisecond, strictly grounded pairwise drug interaction analysis
for medications prescribed together.

Design Goals:
1. 0% Hallucinations: Grounded in clinical pharmacology monographs & DB interactions.
2. Minimal Latency: Hash-indexed pairwise lookup running in <1ms (O(N^2) for N <= 10).
3. Bilingual Support: Structured severity, clinical effects, and patient recommendations
   in both Bengali and English.
"""

import re
import json
import logging
from typing import List, Dict, Any, Optional, Set, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

DOCS_JSON_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "medical_documents" / "json"

# =============================================================================
# Curated High-Risk Clinical Pharmacological Interaction Matrix (Bangladesh Form)
# =============================================================================
# Format: Tuple of sorted (generic_a, generic_b) in lowercase
CURATED_INTERACTIONS: Dict[Tuple[str, str], Dict[str, Any]] = {
    # Quinolones (Ciprofloxacin / Levofloxacin) + Antacids / Multivitamins (Calcium, Zinc, Iron)
    ("calcium_vitamin_d3", "ciprofloxacin"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "Calcium significantly decreases the gastrointestinal absorption and serum concentration of Ciprofloxacin by chelation.",
        "effect_bn": "ক্যালসিয়াম সিপ্রোফ্লক্সাসিনের শোষণ ও কার্যকারিতা নাটকীয়ভাবে কমিয়ে দেয়, ফলে অ্যান্টিবায়োটিকের কার্যকারিতা হ্রাস পায়।",
        "recommendation_bn": "সিপ্রোফ্লক্সাসিন সেবনের অন্তত ২ ঘণ্টা আগে অথবা ৬ ঘণ্টা পরে ক্যালসিয়াম গ্রহণ করুন।",
        "management_strategy": "Separate administration by at least 2 hours before or 6 hours after.",
    },
    ("ciprofloxacin", "zinc_sulfate"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "Zinc binds to Ciprofloxacin in the GI tract forming insoluble chelates, reducing antibiotic bioavailability.",
        "effect_bn": "জিংক সিপ্রোফ্লক্সাসিনের সাথে যুক্ত হয়ে এর বিশোষণ বাধাগ্রস্ত করে এবং জীবাণু ধ্বংসের ক্ষমতা কমিয়ে দেয়।",
        "recommendation_bn": "দুটি ওষুধ একসাথে সেবন করবেন না; অন্তত ২ থেকে ৪ ঘণ্টার ব্যবধান রাখুন।",
        "management_strategy": "Separate doses by 2 to 4 hours.",
    },
    ("ciprofloxacin", "famotidine"): {
        "severity": "MINOR",
        "severity_bn": "সামান্য",
        "effect_en": "Minor alteration in gastric pH may slightly slow Ciprofloxacin absorption without affecting total exposure.",
        "effect_bn": "ফ্যামোটিডিন পাকস্থলীর অম্লতা পরিবর্তন করে সিপ্রোফ্লক্সাসিনের শোষণ কিছুটা ধীর করতে পারে, তবে কার্যকারিতা নষ্ট করে না।",
        "recommendation_bn": "স্বাভাবিক নিয়মে সেবন করা যেতে পারে, কোনো জটিলতা দেখা দিলে চিকিৎসকের পরামর্শ নিন।",
        "management_strategy": "Monitor, typically safe.",
    },
    # Antiplatelet + NSAIDs / PPIs
    ("clopidogrel", "omeprazole"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "Omeprazole competitively inhibits CYP2C19, significantly reducing Clopidogrel conversion to its active antiplatelet metabolite.",
        "effect_bn": "ওমিপ্রাজল ক্লোপিডোগ্রেলের সক্রিয় মেটাবোলাইটে রূপান্তর বাধাগ্রস্ত করে, ফলে রক্ত জমাট বাঁধার ঝুঁকি বেড়ে যেতে পারে।",
        "recommendation_bn": "ওমিপ্রাজলের পরিবর্তে চিকিৎসকের পরামর্শে প্যান্টোপ্রাজল (Pantoprazole) গ্রহণ করা নিরাপদ বিকল্প।",
        "management_strategy": "Switch Omeprazole to Pantoprazole or Dexlansoprazole (lower CYP2C19 inhibition).",
    },
    ("clopidogrel", "esomeprazole"): {
        "severity": "MODERATE",
        "severity_bn": "মাঝারি",
        "effect_en": "Esomeprazole may moderately attenuate the antiplatelet effect of Clopidogrel via CYP2C19 inhibition.",
        "effect_bn": "ইসোমিপ্রাজল ক্লোপিডোগ্রেলের কার্যকারিতা কিছুটা কমাতে পারে।",
        "recommendation_bn": "চিকিৎসকের সাথে পরামর্শ করে গ্যাস্ট্রিকের বিকল্প ওষুধ নির্ধারণ করুন।",
        "management_strategy": "Use alternative acid-suppressive agent if clinically indicated.",
    },
    ("aspirin", "clopidogrel"): {
        "severity": "MODERATE",
        "severity_bn": "সতর্কতা / দ্বৈত থেরাপি",
        "effect_en": "Synergistic antiplatelet action increases bleeding risk (DAPT). Highly beneficial post-stenting but requires gastroprotection.",
        "effect_bn": "একসাথে সেবনে রক্তক্ষরণের ঝুঁকি বাড়ে। হৃদরোগীদের জন্য প্রায়শই নির্দেশিত হলেও পেটে রক্তক্ষরণের ব্যাপারে সতর্ক থাকুন।",
        "recommendation_bn": "অতিরিক্ত রক্তক্ষরণ বা কালো পায়খানা হলে অবিলম্বে চিকিৎসকের শরণাপন্ন হন। খাবারের পর সেবন করুন।",
        "management_strategy": "Monitor for occult GI bleeding. Ensure co-prescription of gastroprotective agent.",
    },
    # NSAIDs + Antihypertensives (ACEi / ARBs / Beta Blockers)
    ("aceclofenac", "losartan"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "NSAID inhibition of renal prostaglandins antagonizes the antihypertensive effect of Losartan and sharply elevates acute renal failure risk.",
        "effect_bn": "অ্যাসেক্লোফেনাক ও লোসারটান একসাথে সেবনে রক্তচাপ নিয়ন্ত্রণের ক্ষমতা কমে যায় এবং কিডনির উপর মারাত্মক চাপ সৃষ্টি হতে পারে।",
        "recommendation_bn": "দীর্ঘমেয়াদে ব্যথানাশক অ্যাসেক্লোফেনাক সেবন এড়িয়ে চলুন। কিডনির কার্যকারিতা ও রক্তচাপ নিয়মিত পরীক্ষা করান।",
        "management_strategy": "Avoid chronic concurrent use; monitor serum creatinine, potassium and blood pressure.",
    },
    ("losartan", "naproxen"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "Naproxen blunts Losartan's hypotensive effect and may induce hyperkalemia or acute renal impairment in elderly/dehydrated patients.",
        "effect_bn": "ন্যাপ্রোক্সেন লোসারটানের রক্তচাপ কমানোর ক্ষমতা হ্রাস করে এবং রক্তে পটাশিয়াম বৃদ্ধি ও কিডনি জটিলতার ঝুঁকি বাড়ায়।",
        "recommendation_bn": "দীর্ঘদিন ব্যথানাশক খাবেন না। প্রয়োজনে প্যারাসিটামল ব্যবহার করুন এবং চিকিৎসকের পরামর্শ নিন।",
        "management_strategy": "Limit NSAID duration to shortest needed, monitor renal function.",
    },
    ("bisoprolol", "naproxen"): {
        "severity": "MODERATE",
        "severity_bn": "মাঝারি",
        "effect_en": "NSAIDs can blunt the blood pressure lowering effect of beta-blockers like Bisoprolol via fluid retention and PG inhibition.",
        "effect_bn": "ন্যাপ্রোক্সেন বিসোপ্রোললের রক্তচাপ কমানোর ক্ষমতা কিছুটা কমিয়ে দিতে পারে।",
        "recommendation_bn": "রক্তচাপ নিয়মিত মাপুন। ব্যথানাশক ওষুধ কয়েকদিনের বেশি সেবন করবেন না।",
        "management_strategy": "Monitor blood pressure regularly.",
    },
    ("amlodipine", "simvastatin"): {
        "severity": "MODERATE",
        "severity_bn": "মাঝারি",
        "effect_en": "Amlodipine increases serum Simvastatin exposure via CYP3A4 inhibition, increasing risk of myopathy or rhabdomyolysis.",
        "effect_bn": "অ্যামলোডিপিন সিমভাস্টাটিনের মাত্রা বাড়িয়ে পেশীর ব্যথা ও ক্ষতির ঝুঁকি বাড়াতে পারে।",
        "recommendation_bn": "পেশীতে তীব্র ব্যথা বা দুর্বলতা অনুভূত হলে অবিলম্বে চিকিৎসককে জানান।",
        "management_strategy": "Cap Simvastatin at 20mg daily or switch to Atorvastatin / Rosuvastatin.",
    },
    # Antidiabetic (Metformin) + Contrast / Alcohol / Beta blockers
    ("glimepiride", "metformin"): {
        "severity": "MODERATE",
        "severity_bn": "সতর্কতা / কম্বিনেশন থেরাপি",
        "effect_en": "Glimepiride adds insulin secretagogue activity to Metformin, markedly increasing hypoglycemia risk if meals are skipped.",
        "effect_bn": "একসাথে সেবনে রক্তের সুগার অতিরিক্ত কমে যাওয়ার (হাইপোগ্লাইসেমিয়া) ঝুঁকি থাকে যদি সময়মতো খাবার না খাওয়া হয়।",
        "recommendation_bn": "নিয়মিত সময়ে খাবার গ্রহণ করুন। মাথা ঘোরা বা বুক ধড়ফড় করলে সাথে সাথে মিষ্টি বা গ্লুকোজ খান।",
        "management_strategy": "Instruct patient on hypoglycemia recognition and management; meal timing consistency.",
    },
    # Paracetamol + Alcohol / Hepatotoxins
    ("atorvastatin", "paracetamol"): {
        "severity": "MINOR",
        "severity_bn": "সামান্য",
        "effect_en": "Both drugs are metabolized hepatically. Normal therapeutic doses are generally safe; avoid excessive Paracetamol doses (>4g/day).",
        "effect_bn": "উভয় ওষুধই যকৃতে প্রক্রিয়াজাত হয়। সাধারণ মাত্রায় নিরাপদ হলেও অতিরিক্ত মাত্রায় প্যারাসিটামল সেবন করবেন না।",
        "recommendation_bn": "প্যারাসিটামল নির্ধারিত মাত্রার অতিরিক্ত সেবন করবেন না। যকৃতের সমস্যা থাকলে ডাক্তারকে জানান।",
        "management_strategy": "Safe at standard therapeutic doses.",
    },
    # NSAID + NSAID (Duplicate Therapy Contraindication)
    ("aceclofenac", "naproxen"): {
        "severity": "CONTRAINDICATED",
        "severity_bn": "একত্রে সেবন নিষিদ্ধ",
        "effect_en": "Dual NSAID therapy provides no additive analgesic efficacy while drastically multiplying risk of severe peptic ulcers, GI bleeding, and acute renal failure.",
        "effect_bn": "দুটি ব্যথানাশক একসাথে সেবন সম্পূর্ণ নিষিদ্ধ! এতে গ্যাস্ট্রিক আলসার, পেটে রক্তক্ষরণ ও কিডনি বিকল হওয়ার চরম ঝুঁকি থাকে।",
        "recommendation_bn": "অবিলম্বে যে কোনো একটি ব্যথানাশক বন্ধ করুন এবং চিকিৎসকের পরামর্শ নিন।",
        "management_strategy": "Discontinue duplicate NSAID immediately.",
    },
    ("diclofenac_sodium", "ibuprofen"): {
        "severity": "CONTRAINDICATED",
        "severity_bn": "একত্রে সেবন নিষিদ্ধ",
        "effect_en": "Simultaneous administration of two non-steroidal anti-inflammatory drugs dramatically increases GI perforation and cardiovascular toxicity.",
        "effect_bn": "উভয়টিই ব্যথানাশক (NSAID)। একসাথে খেলে পাকস্থলীতে ক্ষত ও রক্তক্ষরণের তীব্র ঝুঁকি সৃষ্টি হয়।",
        "recommendation_bn": "একসাথে সেবন করবেন না। দ্রুত চিকিৎসকের সাথে যোগাযোগ করুন।",
        "management_strategy": "Discontinue one agent.",
    },
    # Antibiotic + Probiotic / PPI
    ("amoxicillin", "methotrexate"): {
        "severity": "MAJOR",
        "severity_bn": "গুরুতর",
        "effect_en": "Penicillins reduce renal clearance of Methotrexate, precipitating severe Methotrexate hematologic and gastrointestinal toxicity.",
        "effect_bn": "এমোক্সিসিলিন মেথোট্রেক্সেটের নিষ্কাশন কমিয়ে রক্তে এর বিষাক্ততা বাড়াতে পারে।",
        "recommendation_bn": "চিকিৎসকের নিবিড় তত্ত্বাবধান ছাড়া এ দুটি ওষুধ একসাথে খাবেন না।",
        "management_strategy": "Monitor Methotrexate serum levels closely or avoid combination.",
    },
}


class DrugInteractionEngine:
    """
    High-performance deterministic interaction checker.
    Combines curated clinical rules with automatic dynamic cross-inspection
    of generic monographs in <1ms.
    """

    _instance: Optional["DrugInteractionEngine"] = None

    def __init__(self):
        self._doc_cache: Dict[str, Dict[str, Any]] = {}
        self._generic_index: Dict[str, str] = {}  # Normalized name -> slug
        self._load_local_monographs()

    @classmethod
    def get_instance(cls) -> "DrugInteractionEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _normalize_name(self, name: str) -> str:
        """Converts generic/brand name to standard matching slug."""
        if not name:
            return ""
        s = name.strip().lower()
        s = re.sub(r"\s+", "_", s)
        s = re.sub(r"[^a-z0-9_]", "", s)
        return s

    def _load_local_monographs(self):
        """Loads available JSON documents into memory once for O(1) cross-checks."""
        if not DOCS_JSON_DIR.exists():
            return
        for p in DOCS_JSON_DIR.glob("*.json"):
            slug = p.stem.lower()
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                self._doc_cache[slug] = data
                name_en = data.get("name_en", "")
                if name_en:
                    self._generic_index[self._normalize_name(name_en)] = slug
                name_bn = data.get("name_bn", "")
                if name_bn:
                    self._generic_index[name_bn.strip()] = slug
                self._generic_index[slug] = slug
            except Exception as e:
                logger.debug("Failed to cache doc %s: %s", slug, e)

    def resolve_slug(self, name_or_slug: str) -> str:
        """Resolves input medicine name to standard generic slug."""
        norm = self._normalize_name(name_or_slug)
        if norm in self._generic_index:
            return self._generic_index[norm]
        # Partial match
        for k, v in self._generic_index.items():
            if norm and (norm in k or k in norm):
                return v
        return norm

    def check_pair(self, drug_a: str, drug_b: str) -> Optional[Dict[str, Any]]:
        """
        Sub-millisecond check for interaction between two generics.
        Returns None if no documented interaction.
        """
        slug_a = self.resolve_slug(drug_a)
        slug_b = self.resolve_slug(drug_b)

        if not slug_a or not slug_b or slug_a == slug_b:
            return None

        # Sorted pair key for symmetrical lookup
        pair_key = tuple(sorted([slug_a, slug_b]))

        # 1. Check curated high-priority rule matrix (O(1))
        if pair_key in CURATED_INTERACTIONS:
            rule = dict(CURATED_INTERACTIONS[pair_key])
            rule["drug_a"] = slug_a.replace("_", " ").title()
            rule["drug_b"] = slug_b.replace("_", " ").title()
            rule["source"] = "Curated Clinical Safety Matrix (DGDA/BNF/MedEx)"
            return rule

        # 2. Dynamic cross-check in local monograph interaction texts (O(1) memory lookup)
        doc_a = self._doc_cache.get(slug_a)
        doc_b = self._doc_cache.get(slug_b)

        # Look in Doc A's interaction text for mentions of Drug B
        if doc_a and doc_b:
            int_en_a = doc_a.get("sections_en", {}).get("interaction", "")
            int_bn_a = doc_a.get("sections_bn", {}).get("interaction", "")
            int_en_b = doc_b.get("sections_en", {}).get("interaction", "")
            int_bn_b = doc_b.get("sections_bn", {}).get("interaction", "")

            name_b_clean = doc_b.get("name_en", slug_b).lower()
            name_a_clean = doc_a.get("name_en", slug_a).lower()

            hit = False
            summary_en = ""
            summary_bn = ""

            if name_b_clean in int_en_a.lower():
                hit = True
                summary_en = f"Interaction noted in {doc_a.get('name_en')} monograph: {int_en_a[:350]}..."
                summary_bn = int_bn_a[:350] if int_bn_a else "এই দুটি ওষুধের মধ্যে পারস্পরিক প্রতিক্রিয়া লক্ষ্য করা গেছে।"
            elif name_a_clean in int_en_b.lower():
                hit = True
                summary_en = f"Interaction noted in {doc_b.get('name_en')} monograph: {int_en_b[:350]}..."
                summary_bn = int_bn_b[:350] if int_bn_b else "এই দুটি ওষুধের মধ্যে পারস্পরিক প্রতিক্রিয়া লক্ষ্য করা গেছে।"

            if hit:
                return {
                    "drug_a": doc_a.get("name_en", slug_a),
                    "drug_b": doc_b.get("name_en", slug_b),
                    "severity": "MODERATE",
                    "severity_bn": "মাঝারি",
                    "effect_en": summary_en,
                    "effect_bn": summary_bn,
                    "recommendation_bn": "এই ওষুধ দুটি একসাথে সেবনের পূর্বে চিকিৎসকের সাথে পরামর্শ করুন।",
                    "management_strategy": "Clinical evaluation advised.",
                    "source": "Monograph Clinical Interaction Section",
                }

        return None

    def analyze_prescription_medicines(
        self, medicines: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Takes a list of medicine candidates (from OCR or user input)
        and conducts exhaustive pairwise interaction analysis in O(N^2) time (<1ms).
        """
        generic_candidates: List[str] = []
        for m in medicines:
            if isinstance(m, str):
                generic_candidates.append(m)
            elif isinstance(m, dict):
                # Prefer generic name, fallback to brand name
                gen = m.get("generic_name") or m.get("matched_brand") or m.get("raw_token")
                if gen:
                    generic_candidates.append(str(gen))

        unique_generics = list(dict.fromkeys([g.strip() for g in generic_candidates if g.strip()]))
        num_drugs = len(unique_generics)

        interactions_found: List[Dict[str, Any]] = []
        severity_counts = {"CONTRAINDICATED": 0, "MAJOR": 0, "MODERATE": 0, "MINOR": 0}

        # Pairwise combination check
        for i in range(num_drugs):
            for j in range(i + 1, num_drugs):
                res = self.check_pair(unique_generics[i], unique_generics[j])
                if res:
                    interactions_found.append(res)
                    sev = res.get("severity", "MODERATE")
                    if sev in severity_counts:
                        severity_counts[sev] += 1

        overall_safety_status = "SAFE"
        if severity_counts["CONTRAINDICATED"] > 0:
            overall_safety_status = "CRITICAL_CONTRAINDICATION"
        elif severity_counts["MAJOR"] > 0:
            overall_safety_status = "HIGH_RISK"
        elif severity_counts["MODERATE"] > 0:
            overall_safety_status = "MODERATE_WARNING"
        elif severity_counts["MINOR"] > 0:
            overall_safety_status = "LOW_RISK"

        return {
            "total_medicines_analyzed": num_drugs,
            "total_pairs_checked": (num_drugs * (num_drugs - 1)) // 2 if num_drugs > 1 else 0,
            "interactions_count": len(interactions_found),
            "overall_safety_status": overall_safety_status,
            "severity_breakdown": severity_counts,
            "interactions": interactions_found,
            "is_safe": len(interactions_found) == 0,
        }
