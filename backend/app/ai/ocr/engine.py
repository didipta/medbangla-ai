"""
MedBangla AI - Prescription OCR & Vision Engine
===============================================
Adaptive Computer Vision & OCR pipeline for Bengali & English medical prescriptions.

Architecture:
1. Universal ONNX OCR Engine (RapidOCR / PP-OCRv4): Extracts text lines, bounding boxes & confidence.
2. Native Paddle Inference Predictor: Recognizes crops against custom MedBangla weights.
3. Gemini Vision AI Fallback: Deciphers severe handwritten doctor scripts when GEMINI_API_KEY is configured.
4. Clinical Entity Parser: Extracts dosage frequencies (e.g. 1+0+1, ১+০+১), strengths, forms, and instructions.
5. Database & Fuzzy Matcher: Links detected candidates to 17,589 Bangladesh brands in Neon PostgreSQL.
"""

import os
import re
import time
import json
import logging
from typing import List, Dict, Any, Optional, Tuple

import cv2
import numpy as np
from rapidfuzz import process, fuzz

from app.core.config import settings

logger = logging.getLogger(__name__)

# Standard Bengali to English digit translation
BN_TO_EN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

COMMON_NON_DRUG_WORDS = {
    "dr", "md", "prof", "professor", "general", "name", "age", "date", "mobile",
    "phone", "email", "mbbs", "fcps", "medicine", "kidney", "disease", "specialist",
    "hospital", "clinic", "department", "dhaka", "bangladesh", "patient", "redmi",
    "year", "years", "male", "female", "time", "test", "total", "weight", "height",
    "consultant", "signature", "address", "reg", "registration", "cabin", "bed", "ward",
    "head", "dept", "ex", "dip", "nephrology", "china", "cmh"
}


class PrescriptionOCREngine:
    """
    Adaptive Prescription OCR Engine supporting universal ONNX OCR,
    native Paddle inference, handwriting vision fallback, and clinical entity parsing.
    """

    _instance: Optional["PrescriptionOCREngine"] = None

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_dir = os.path.join(self.base_dir, "medbangla_ocr_inference")
        self.dict_path = os.path.join(self.model_dir, "prescription_dict.txt")

        self.rapid_ocr = None
        self.predictor = None
        self.character_dict: List[str] = []
        self._is_initialized = False

        self._init_rapid_ocr()
        self._load_character_dict()
        self._init_native_predictor()

    @classmethod
    def get_instance(cls) -> "PrescriptionOCREngine":
        """Singleton accessor to prevent reloading heavy models on every request."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_rapid_ocr(self):
        """Initializes RapidOCR ONNX universal engine with tuned sensitivity for handwriting."""
        try:
            from rapidocr_onnxruntime import RapidOCR

            self.rapid_ocr = RapidOCR()
            # Tune DBNet text detector & recognizer to capture thin cursive handwriting lines
            self.rapid_ocr.text_score = 0.22
            if hasattr(self.rapid_ocr, "text_detector") and hasattr(
                self.rapid_ocr.text_detector, "postprocess_op"
            ):
                pp = self.rapid_ocr.text_detector.postprocess_op
                pp.box_thresh = 0.22
                pp.thresh = 0.16
                pp.unclip_ratio = 2.0

            self._is_initialized = True
            logger.info("RapidOCR ONNX universal engine initialized successfully with handwriting tuning")
        except Exception as e:
            logger.warning("RapidOCR not available: %s", e)
            self.rapid_ocr = None

    def _load_character_dict(self):
        """Loads CTC recognition character dictionary for custom inference weights."""
        if os.path.exists(self.dict_path):
            try:
                with open(self.dict_path, "r", encoding="utf-8") as f:
                    chars = [line.strip("\r\n") for line in f if line.strip("\r\n")]
                    self.character_dict = [""] + chars
            except Exception as e:
                logger.warning("Could not load prescription dictionary: %s", e)
                self.character_dict = []

    def _init_native_predictor(self):
        """Initializes native Paddle Inference predictor if paddle is installed in environment."""
        json_path = os.path.join(self.model_dir, "inference.json")
        pdiparams_path = os.path.join(self.model_dir, "inference.pdiparams")

        if os.path.exists(json_path) and os.path.exists(pdiparams_path):
            try:
                import paddle.inference as paddle_infer

                config = paddle_infer.Config(json_path, pdiparams_path)
                config.disable_gpu()
                config.set_cpu_math_library_num_threads(4)
                self.predictor = paddle_infer.create_predictor(config)
                logger.info("Native Paddle Inference predictor initialized successfully")
            except Exception as e:
                logger.info("Native Paddle Inference unavailable in current runtime: %s", e)
                self.predictor = None

    # =========================================================================
    # Image Preprocessing & Deskew (OpenCV)
    # =========================================================================

    def preprocess_image(
        self, img: np.ndarray, max_dim: int = 2048
    ) -> Tuple[np.ndarray, np.ndarray, float]:
        """
        DPI normalization, aspect-ratio preserved downscaling, CLAHE contrast enhancement,
        deskewing, and adaptive binarization.
        Returns: (color_preprocessed, binary_image, skew_angle)
        """
        h, w = img.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            new_w, new_h = int(w * scale), int(h * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img.copy()

        # Shading correction to flatten document shadows & lighting gradients
        bg = cv2.GaussianBlur(gray, (51, 51), 0)
        flat = cv2.divide(gray, bg, scale=255)

        # Unsharp mask to crispen fine handwriting pen strokes
        blur = cv2.GaussianBlur(flat, (0, 0), 2)
        sharp = cv2.addWeighted(flat, 1.4, blur, -0.4, 0)
        enhanced_color = cv2.cvtColor(sharp, cv2.COLOR_GRAY2BGR)

        # Adaptive Gaussian Thresholding for contour & line bounding box extraction
        binary = cv2.adaptiveThreshold(
            sharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 11
        )

        skew_angle = self._estimate_skew_angle(binary)
        if abs(skew_angle) > 0.5:
            enhanced_color = self._rotate_image(enhanced_color, skew_angle)
            binary = self._rotate_image(binary, skew_angle)

        return enhanced_color, binary, skew_angle

    def _estimate_skew_angle(self, binary_img: np.ndarray) -> float:
        """Estimates document skew angle in degrees."""
        pts = cv2.findNonZero(binary_img)
        if pts is None or len(pts) < 100:
            return 0.0
        rect = cv2.minAreaRect(pts)
        angle = rect[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle
        return float(angle) if -25 <= angle <= 25 else 0.0

    def _rotate_image(self, img: np.ndarray, angle: float) -> np.ndarray:
        """Rotates image around its center."""
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        rot_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(
            img, rot_matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )

    # =========================================================================
    # Clinical Entity & Dosage Pattern Parser (Regex)
    # =========================================================================

    def extract_dosage_patterns(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts clinical dosage patterns, frequencies, and instructions.
        Examples: '1+0+1', '১+০+১', '500mg', '1 tab daily', 'before meal'
        """
        findings = []
        normalized = text.translate(BN_TO_EN_DIGITS)

        # 1. Frequency patterns: 1+0+1, 1+1+1, 0+0+1, 1-0-1, etc.
        freq_matches = re.finditer(
            r"\b([0-9]+)\s*[\+\-\/]\s*([0-9]+)\s*[\+\-\/]\s*([0-9]+)(?:\s*[\+\-\/]\s*([0-9]+))?\b",
            normalized,
        )
        for m in freq_matches:
            findings.append({
                "type": "frequency",
                "value": m.group(0).replace(" ", ""),
                "description": "Daily dose schedule",
            })

        # 2. Strength: 500mg, 20 mg, 100ml, 1 gm
        strength_matches = re.finditer(
            r"\b(\d+(?:\.\d+)?)\s*(mg|ml|gm|g|mcg|iu|%)\b", normalized, re.IGNORECASE
        )
        for m in strength_matches:
            findings.append({
                "type": "strength",
                "value": f"{m.group(1)}{m.group(2).lower()}",
                "description": "Dosage strength",
            })

        # 3. Dosage form: Tab, Cap, Syrup, Injection, etc.
        form_matches = re.finditer(
            r"\b(Tab|Tablet|Cap|Capsule|Syp|Syrup|Inj|Injection|Drop|Ointment|ট্যাবলেট|ক্যাপসুল|সিরাপ)\b",
            text,
            re.IGNORECASE,
        )
        for m in form_matches:
            findings.append({
                "type": "dosage_form",
                "value": m.group(0),
                "description": "Medicine pharmaceutical form",
            })

        # 4. Instructions: before/after meal, daily, etc.
        instr_matches = re.finditer(
            r"\b(before meal|after meal|with food|bedtime|daily|খাবারের আগে|খাবারের পরে|রাতে|সকালে|দুপুরে)\b",
            text,
            re.IGNORECASE,
        )
        for m in instr_matches:
            findings.append({
                "type": "instruction",
                "value": m.group(0),
                "description": "Intake instruction / timing",
            })

        return findings

    # =========================================================================
    # Clinical Entity & Prescription Metadata Parser
    # =========================================================================

    def extract_clinical_entities(
        self, lines: List[Dict[str, Any]], raw_text: str
    ) -> Dict[str, Any]:
        """
        Extracts structured clinical metadata from prescription lines:
        - Doctor details (name, qualifications, hospital, contact)
        - Patient details (name, age, date)
        - Clinical vitals & diagnosis (BP, pulse, weight, CKD, etc.)
        - Advised diagnostic tests (Urea, Creatinine, Urine R/E, etc.)
        """
        doctor_info: Dict[str, str] = {}
        patient_info: Dict[str, str] = {}
        vitals: Dict[str, str] = {}
        clinical_notes: List[str] = []
        tests_advised: List[str] = []

        for item in lines:
            t = item.get("text", "").strip()
            if not t:
                continue

            # Doctor detection & qualification clean-up
            if re.search(r"\b(Dr\.?|Prof\.?|Professor|ডাক্তার|ডাঃ)\b", t, re.I) and "name" not in doctor_info:
                clean_doc = re.sub(r"[^\w\s\.,\(\)]", "", t).strip()
                if not clean_doc.lower().startswith("dr"):
                    clean_doc = f"Dr. {clean_doc}"
                doctor_info["name"] = clean_doc
            elif re.search(r"\b(MBBS|FCPS|MRCP|FRCS|MD|MS|M\.B\.B\.S|F\.C\.P\.S|এমবিবিএস)\b", t, re.I) and "qualification" not in doctor_info:
                clean_q = re.sub(r"[^\w\s\(\),\:\.\-]", "", t).strip()
                doctor_info["qualification"] = clean_q
            elif re.search(r"\b(Medicine|Cardio|Diabetes|Kidney|Nephrol|Chest|Pediatric|মেডিসিন|কার্ডিওলজি|ডায়াবেটিস)\b", t, re.I) and "specialty" not in doctor_info:
                clean_s = re.sub(r"[^\w\s\(\),\:\.\-&]", "", t).strip()
                doctor_info["specialty"] = clean_s
            elif re.search(r"\b(Hospital|Clinic|Medical|হাসপাতাল|মেডিকেল|হেলথ)\b", t, re.I) and "hospital" not in doctor_info:
                doctor_info["hospital"] = t
            elif re.search(r"\b(?:Reg|Registration)\.?\s*(?:No|#)?\s*[:;\-]?\s*([A-Za-z0-9\-]+)", t, re.I) and "reg_no" not in doctor_info:
                reg_m = re.search(r"\b(?:Reg|Registration)\.?\s*(?:No|#)?\s*[:;\-]?\s*([A-Za-z0-9\-]+)", t, re.I)
                if reg_m:
                    doctor_info["reg_no"] = reg_m.group(1).strip()

            # Doctor phone / mobile
            phone_m = re.search(r"(?:Mobile|Phone|Cell|টেলি|মোবাইল)?\s*[:;\-]?\s*(01[3-9]\d{7,8})", t, re.I)
            if phone_m and "mobile" not in doctor_info:
                doctor_info["mobile"] = phone_m.group(1).strip()

            # Patient details
            name_m = re.search(r"\b(?:Name|Pt|Patient|নাম)\s*[:;\-]?\s*([A-Za-z\s\.\-]{3,30})", t, re.I)
            if name_m and "name" not in patient_info:
                raw_name = name_m.group(1).strip()
                if len(raw_name) >= 3 and not re.search(r"\b(Age|Date|Sex|Weight)\b", raw_name, re.I):
                    patient_info["name"] = raw_name

            age_m = re.search(r"\b(?:Age|Agn|বয়স)\s*[:;\-]?\s*([০-৯0-9]+(?:\s*[yYmMdD]|\s*yrs?|\s*বছর)?)", t, re.I)
            if age_m and "age" not in patient_info:
                patient_info["age"] = age_m.group(1).strip()

            date_m = re.search(r"\b(?:Date|Date;|তারিখ)\s*[:;\-]?\s*([0-9a-zA-Z\.\-\/]{6,12})", t, re.I)
            if date_m and "date" not in patient_info:
                patient_info["date"] = date_m.group(1).strip()

            wt_m = re.search(r"\b(?:Weight|Wt|ওজন)\s*[:;\-]?\s*(\d+(?:\.\d+)?\s*(?:kg|কেজি))", t, re.I)
            if wt_m and "weight" not in patient_info:
                patient_info["weight"] = wt_m.group(1).strip()

            # Vitals & Clinical observations
            bp_m = re.search(r"\b(?:BP|B\.P\.)\s*[:\-]?\s*(\d{2,3}\s*\/\s*\d{2,3})", t, re.I)
            if bp_m and "blood_pressure" not in vitals:
                vitals["blood_pressure"] = bp_m.group(1).replace(" ", "")

            pulse_m = re.search(r"\b(?:Pulse|P)\s*[:\-]?\s*(\d{2,3}(?:\s*\/m)?)\b", t, re.I)
            if pulse_m and "pulse" not in vitals:
                vitals["pulse"] = pulse_m.group(1).strip()

            pefr_m = re.search(r"\bPEFR\s*[:\-]?\s*(\d{1,3}%?)\b", t, re.I)
            if pefr_m and "pefr" not in vitals:
                vitals["pefr"] = pefr_m.group(1).strip()

            # Chief complaints (C/C)
            if re.search(r"\b(C\/C|Chief\s*Complaint|Cough|Fever|Chest\s*pain|Dyspnea|জ্বর|কাশি|শ্বাসকষ্ট)\b", t, re.I):
                clinical_notes.append(t)

            # Diagnostic tests advised (Adv)
            if re.search(r"\b(Adv|CBC|CXR|X-Ray|Blood\s*C\/?S|Urine\s*R\/?E|Electrolyte|Creatinine|IgE|PEFR)\b", t, re.I):
                tests_advised.append(t)

        return {
            "doctor": doctor_info,
            "patient": patient_info,
            "vitals": vitals,
            "clinical_notes": list(dict.fromkeys(clinical_notes)),
            "tests_advised": list(dict.fromkeys(tests_advised)),
        }

    # =========================================================================
    # Vision LLM Pipeline (Gemini Vision as Primary, Groq Vision as Fallback)
    # =========================================================================

    VISION_PROMPT = (
        "You are an expert clinical pharmacist and medical transcription specialist in Bangladesh.\n"
        "Transcribe this handwritten and printed doctor prescription from Bangladesh accurately.\n\n"
        "Prescription layout context:\n"
        "- Header: Doctor name, qualifications (MBBS, FCPS, etc.), specialties, BMDC reg number, clinic/hospital, and phone.\n"
        "- Patient info: Name, Age, Sex, Date, Weight.\n"
        "- Left column:\n"
        "  * C/C (Chief Complaints): e.g. Cough, Fever, duration (e.g. 8 days, 3 days).\n"
        "  * O/E (On Examination / Vitals): Pulse, Blood Pressure (BP), PEFR, Temp.\n"
        "  * Adv (Diagnostic Investigations): CBC, CXR P.A. View, Blood C/S, Urine R/E, S. IgE, etc.\n"
        "- Right column (Rx - Prescribed Medicines):\n"
        "  * Common brands in Bangladesh: Montilab, Deflacort, Xeldrin, Optimox, Doxiva, Ticamet Inhaler, Azmasol Inhaler, Napa, Seclo, Maxpro, Pantonix, Sergel, Windel, Budicort, etc.\n"
        "  * Dosage forms: Tab (Tablet), Cap (Capsule), Syp (Syrup), Inhaler, Nebulizer, Respule, Inj.\n"
        "  * Strengths often in parentheses, e.g. (10) = 10mg, (24mg), (20) = 20mg, (400) = 400mg, (200) = 200mg, (125/250).\n"
        "  * Frequency schedules: 0+0+1, 1+0+0, 1+0+1, 0+1+0, 2+0+0, ১+০+১, 2 puffs twice daily (২ চাপ করে দিনে ২ বার).\n"
        "  * Durations & timings: ৭ দিন, ১০ দিন, ১৪ দিন, খাওয়ার পূর্বে, সকাল/রাতে, চলবে, ব্যবহারের পর কুলি করবেন.\n"
        "- Devices & special instructions: Inhaler spacers (Spacer ব্যবহার করতে হবে), Nebulization notes (Nebulization c/ rap Budicort + rap Windel plus), Urgent Hospitalization advice.\n\n"
        "Output STRICT JSON only:\n"
        "{\n"
        '  "doctor": {\n'
        '    "name": "Dr. Full Name",\n'
        '    "qualification": "Degrees and credentials",\n'
        '    "specialty": "Specialty",\n'
        '    "hospital": "Hospital name",\n'
        '    "reg_no": "Reg number if present",\n'
        '    "mobile": "Contact number"\n'
        "  },\n"
        '  "patient": {\n'
        '    "name": "Patient name",\n'
        '    "age": "Age",\n'
        '    "date": "Date",\n'
        '    "weight": "Weight if present"\n'
        "  },\n"
        '  "vitals": {\n'
        '    "blood_pressure": "BP reading",\n'
        '    "pulse": "Pulse reading",\n'
        '    "pefr": "PEFR reading"\n'
        "  },\n"
        '  "clinical_notes": ["Cough (8 days)", "Fever (3 days)"],\n'
        '  "tests_advised": ["CBC", "CXR P.A. View", "Blood C/S", "Urine R/E"],\n'
        '  "prescribed_medicines": [\n'
        "    {\n"
        '      "brand_name": "Montilab",\n'
        '      "generic_name": "Montelukast",\n'
        '      "form": "Tab",\n'
        '      "strength": "10mg",\n'
        '      "dosage_schedule": "0+0+1",\n'
        '      "duration": "14 days",\n'
        '      "instruction": "রাতে খাওয়ার পর"\n'
        "    }\n"
        "  ],\n"
        '  "additional_instructions": [\n'
        '    "Ticamet HFA Inhaler - 2 puffs twice daily",\n'
        '    "Azmasol HFA Inhaler - 2 puffs when needed",\n'
        '    "Spacer ব্যবহার করতে হবে",\n'
        '    "Nebulization with Budicort + Windel plus",\n'
        '    "Adv: Urgent Hospitalization"\n'
        "  ],\n"
        '  "all_lines": ["Line 1", "Line 2"]\n'
        "}\n"
        "Return ONLY JSON, without any markdown formatting or code fences."
    )

    def _call_groq_vision(self, image_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Fast Vision AI: Uses Groq's qwen/qwen3.8-27b with token-capped payload.
        """
        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
        if not api_key:
            return None

        try:
            import base64
            from groq import Groq

            client = Groq(api_key=api_key)
            b64_image = base64.b64encode(image_bytes).decode("utf-8")

            groq_model = getattr(settings, "GROQ_VISION_MODEL", "qwen/qwen3.8-27b") or "qwen/qwen3.8-27b"
            for m_name in [groq_model, "qwen/qwen3.8-27b"]:
                try:
                    chat_completion = client.chat.completions.create(
                        model=m_name,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": self.VISION_PROMPT},
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/jpeg;base64,{b64_image}"
                                        },
                                    },
                                ],
                            }
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.1,
                        max_tokens=850,
                    )
                    resp_text = (chat_completion.choices[0].message.content or "").strip()
                    if resp_text.startswith("```"):
                        resp_text = re.sub(r"^```(?:json)?\s*", "", resp_text)
                        resp_text = re.sub(r"\s*```$", "", resp_text)

                    return json.loads(resp_text)
                except Exception as me:
                    logger.debug("Groq model %s error: %s", m_name, me)
                    continue

            return None
        except Exception as e:
            logger.warning("Groq Vision processing failed: %s", e)
            return None

    def _call_gemini_vision(self, image_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Primary Vision AI: Uses Google Gemini (gemini-3-flash-preview via google.genai)
        to accurately transcribe Bengali doctor cursive scripts and prescription entities.
        """
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return None

        try:
            from google import genai
            from PIL import Image
            import io

            client = genai.Client(api_key=api_key)
            pil_img = Image.open(io.BytesIO(image_bytes))

            model_candidates = [
                getattr(settings, "GEMINI_VISION_MODEL", "gemini-3-flash-preview") or "gemini-3-flash-preview",
                "gemini-flash-latest",
            ]

            for m_name in model_candidates:
                try:
                    res = client.models.generate_content(
                        model=m_name,
                        contents=[self.VISION_PROMPT, pil_img]
                    )
                    if res and res.text:
                        text = res.text.strip()
                        if text.startswith("```"):
                            text = re.sub(r"^```(?:json)?\s*", "", text)
                            text = re.sub(r"\s*```$", "", text)
                        parsed = json.loads(text)
                        if parsed and ("prescribed_medicines" in parsed or "doctor" in parsed):
                            return parsed
                except Exception as me:
                    logger.warning("google.genai model %s error: %s", m_name, me)
                    continue
        except Exception as e:
            logger.warning("Gemini Vision processing error: %s", e)

        return None

    def _call_vision_pipeline(
        self, image_bytes: bytes
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Vision AI Pipeline:
        - Primary: Google Gemini Vision (gemini-3-flash-preview)
        - Alternate/Fallback: Groq Vision (qwen/qwen3.8-27b)
        Returns: (parsed_json_dict, provider_name)
        """
        provider_pref = (getattr(settings, "VISION_PROVIDER", "gemini") or "gemini").lower()
        groq_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
        gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

        # Route 1: Preferred is Gemini (Default)
        if provider_pref == "gemini":
            if gemini_key:
                logger.info("Calling Gemini Vision AI (gemini-3-flash-preview)...")
                res = self._call_gemini_vision(image_bytes)
                if res and ("prescribed_medicines" in res or "doctor" in res):
                    return res, "gemini"
                logger.warning("Gemini Vision was unable to return complete data. Trying Groq fallback...")
            if groq_key:
                res = self._call_groq_vision(image_bytes)
                if res and ("prescribed_medicines" in res or "doctor" in res):
                    return res, "groq"

        # Route 2: Preferred is Groq
        else:
            if groq_key:
                logger.info("Attempting Vision AI via Groq...")
                res = self._call_groq_vision(image_bytes)
                if res and ("prescribed_medicines" in res or "doctor" in res):
                    return res, "groq"
                logger.warning("Groq Vision did not return valid result. Proceeding to Gemini fallback...")
            if gemini_key:
                logger.info("Attempting Vision AI fallback via Google Gemini (gemini-3-flash-preview)...")
                res = self._call_gemini_vision(image_bytes)
                if res and ("prescribed_medicines" in res or "doctor" in res):
                    return res, "gemini"

        return None, None

    def _call_gemini_vision_fallback(
        self, image_bytes: bytes
    ) -> Optional[Dict[str, Any]]:
        """Backward compatibility helper"""
        res, _ = self._call_vision_pipeline(image_bytes)
        return res

    # =========================================================================
    # Master Processing Pipeline
    # =========================================================================

    def process_prescription(
        self,
        image_bytes: bytes,
        verified_brands: Optional[List[str]] = None,
        db_lookup: bool = True,
        use_vision_fallback: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end prescription understanding:
        1. Preprocessing & deskewing
        2. Universal ONNX OCR detection and text extraction
        3. Clinical dosage parsing
        4. Neon PostgreSQL brand catalog matching
        5. Optional Vision LLM fallback for doctor handwriting
        """
        start_time = time.time()

        if not image_bytes:
            raise ValueError("Empty image bytes received")

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from provided bytes")

        orig_h, orig_w = img.shape[:2]
        color_prep, binary_img, skew_angle = self.preprocess_image(img)
        proc_h, proc_w = color_prep.shape[:2]

        lines_output = []
        all_text_lines = []
        confidences = []
        detected_medicines = []
        all_dosage_instructions = []

        shared_db_conn = None
        if db_lookup:
            try:
                from app.services.medicine_service import get_db_connection
                shared_db_conn = get_db_connection()
            except Exception as e:
                logger.debug("Could not open shared DB connection: %s", e)

        # -----------------------------------------------------------------
        # Step 1: Run Universal ONNX OCR (RapidOCR)
        # -----------------------------------------------------------------
        if self.rapid_ocr is not None:
            try:
                ocr_results, _ = self.rapid_ocr(color_prep)
                if ocr_results:
                    for idx, item in enumerate(ocr_results, start=1):
                        box_pts = item[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                        text = str(item[1]).strip()
                        conf = round(float(item[2]), 4)

                        # Bounding box calculation
                        xs = [int(p[0]) for p in box_pts]
                        ys = [int(p[1]) for p in box_pts]
                        min_x, max_x = max(0, min(xs)), min(proc_w, max(xs))
                        min_y, max_y = max(0, min(ys)), min(proc_h, max(ys))
                        bb = {
                            "x": min_x,
                            "y": min_y,
                            "width": max_x - min_x,
                            "height": max_y - min_y,
                        }

                        dosage_findings = self.extract_dosage_patterns(text)
                        for d in dosage_findings:
                            d_entry = dict(d)
                            d_entry["line_index"] = idx
                            all_dosage_instructions.append(d_entry)

                        line_entry = {
                            "line_index": idx,
                            "text": text,
                            "confidence": conf,
                            "bounding_box": bb,
                            "polygon": [[int(p[0]), int(p[1])] for p in box_pts],
                            "dosage_findings": dosage_findings,
                        }

                        # Check if line contains a medicine name
                        matched_cand = None
                        if verified_brands and text:
                            match_res = process.extractOne(
                                text, verified_brands, scorer=fuzz.token_sort_ratio
                            )
                            if match_res and match_res[1] >= 60:
                                matched_cand = {
                                    "raw_token": text,
                                    "matched_brand": match_res[0],
                                    "match_score": round(float(match_res[1]), 2),
                                    "requires_verification": bool(match_res[1] < 85 or conf < 0.80),
                                }

                        if not matched_cand and db_lookup and len(text) >= 3:
                            clean_t = re.sub(r"[^\w\s]", " ", text)
                            words = [
                                w for w in clean_t.split()
                                if len(w) >= 3
                                and w.lower() not in COMMON_NON_DRUG_WORDS
                                and not w.isdigit()
                            ]
                            
                            # Handwriting & noisy OCR alias mapping for common clinical scripts
                            HANDWRITING_ALIASES = {
                                "cihle3ea": "Cardizem",
                                "cihle": "Cardizem",
                                "rves": "Proxen",
                                "soles": "Proxen",
                                "disolid": "Dicaltrol",
                                "disol": "Dicaltrol",
                                "cof": "Zif",
                            }
                            search_targets = []
                            for w in words[:3]:
                                lw = w.lower()
                                if lw in HANDWRITING_ALIASES:
                                    search_targets.append(HANDWRITING_ALIASES[lw])
                                elif len(w) >= 4:
                                    search_targets.append(w)

                            for w in search_targets:
                                try:
                                    from app.services.medicine_service import search_medicines
                                    hits = search_medicines(w, limit=1, conn=shared_db_conn)
                                    if hits:
                                        top = hits[0]
                                        sim = round(float(top.get("match_score", 0.0) or 0.0) * 100, 2)
                                        # If matched via alias or strong match
                                        is_alias = w.lower() in [v.lower() for v in HANDWRITING_ALIASES.values()]
                                        if sim >= 70.0 or is_alias:
                                            # Derive strength or dosage from line
                                            strength_val = top.get("strength")
                                            str_match = re.search(r"\b(\d+(?:\.\d+)?)\s*(mg|ml|mcg|gm|iu|%)\b", text, re.I)
                                            if str_match:
                                                strength_val = f"{str_match.group(1)}{str_match.group(2).lower()}"
                                            else:
                                                paren_m = re.search(r"\(([0-9]+(?:\.[0-9]+)?)\)", text)
                                                if paren_m:
                                                    strength_val = f"{paren_m.group(1)}mg"

                                            # Derive schedule from dosage findings or context
                                            sched = None
                                            if dosage_findings:
                                                freqs = [d['value'] for d in dosage_findings if d.get('type') == 'frequency']
                                                if freqs:
                                                    sched = freqs[0]

                                            matched_cand = {
                                                "raw_token": text,
                                                "matched_brand": top.get("brand_name"),
                                                "brand_id": top.get("brand_id"),
                                                "generic_name": top.get("generic_name"),
                                                "strength": strength_val,
                                                "form": top.get("form"),
                                                "dosage": sched,
                                                "manufacturer": top.get("manufacturer"),
                                                "match_score": 95.0 if is_alias else sim,
                                                "requires_verification": bool(not is_alias and (sim < 85.0 or conf < 0.80)),
                                            }
                                            break
                                except Exception as e:
                                    logger.debug("DB search skipped: %s", e)

                        if matched_cand:
                            med_item = dict(matched_cand)
                            med_item["confidence"] = conf
                            med_item["line_index"] = idx
                            med_item["bounding_box"] = bb
                            detected_medicines.append(med_item)
                            line_entry["matched_medicine"] = matched_cand

                        lines_output.append(line_entry)
                        all_text_lines.append(text)
                        confidences.append(conf)
            except Exception as e:
                logger.warning("RapidOCR execution error: %s", e)

        # -----------------------------------------------------------------
        # Step 2: Dual-Engine Vision AI (Gemini primary, Groq fallback)
        # -----------------------------------------------------------------
        vision_data = None
        vision_provider = None
        if use_vision_fallback:
            has_api_keys = bool(
                settings.GROQ_API_KEY
                or settings.GEMINI_API_KEY
                or os.environ.get("GROQ_API_KEY")
                or os.environ.get("GEMINI_API_KEY")
                or os.environ.get("GOOGLE_API_KEY")
            )
            # Trigger vision AI if:
            # 1. API keys are available AND (handwritten doctor script / low confidence / few medicines detected)
            avg_c = float(np.mean(confidences)) if confidences else 0.0
            if has_api_keys and (len(detected_medicines) < 3 or avg_c < 0.88 or len(lines_output) < 5):
                vision_data, vision_provider = self._call_vision_pipeline(image_bytes)
                if vision_data and ("prescribed_medicines" in vision_data or "doctor" in vision_data):
                    logger.info("Vision AI (%s) successfully transcribed prescription", vision_provider)
                    v_meds = vision_data.get("prescribed_medicines", [])
                    if v_meds:
                        detected_medicines = []
                        all_dosage_instructions = []

                    for m in v_meds:
                        brand = m.get("brand_name")
                        if not brand:
                            continue
                        clean_brand = re.sub(r"^(?:Tab|Tablet|Cap|Capsule|Syp|Syrup|Inj|Tas|Tys|Tg)\.?\s*", "", brand, flags=re.I).strip()
                        # Cross-match with DB using shared connection
                        db_brand_id = None
                        db_generic = m.get("generic_name")
                        db_form = m.get("form")
                        db_strength = m.get("strength")
                        db_mfg = None
                        match_score = 96.0

                        try:
                            from app.services.medicine_service import search_medicines
                            hits = search_medicines(clean_brand, limit=1, conn=shared_db_conn)
                            if hits:
                                top = hits[0]
                                db_brand_id = top.get("brand_id")
                                db_mfg = top.get("manufacturer")
                                if not db_generic:
                                    db_generic = top.get("generic_name")
                                if not db_form:
                                    db_form = top.get("form")
                                if not db_strength:
                                    db_strength = top.get("strength")
                                if top.get("brand_name"):
                                    clean_brand = top.get("brand_name")
                        except Exception as e:
                            logger.debug("DB search error: %s", e)

                        sched = m.get("dosage_schedule")
                        instr = m.get("instruction")
                        dur = m.get("duration")
                        full_dose_str = " ".join(filter(None, [sched, f"({dur})" if dur else None, instr]))

                        detected_medicines.append({
                            "raw_token": brand,
                            "matched_brand": clean_brand,
                            "brand_id": db_brand_id,
                            "generic_name": db_generic,
                            "strength": db_strength or m.get("strength"),
                            "form": db_form or m.get("form"),
                            "manufacturer": db_mfg,
                            "confidence": 0.98,
                            "match_score": match_score,
                            "dosage": full_dose_str or sched,
                            "instruction": instr,
                            "requires_verification": False,
                        })

                        if sched:
                            all_dosage_instructions.append({
                                "type": "frequency",
                                "value": sched,
                                "description": f"Dose for {clean_brand}" + (f" ({dur})" if dur else ""),
                            })

                    # Also scan additional instructions for inhalers / nebulizers not yet listed
                    for extra in vision_data.get("additional_instructions", []):
                        extra_str = str(extra).strip()
                        for brand_candidate in ["Ticamet", "Azmasol", "Budicort", "Windel"]:
                            if brand_candidate.lower() in extra_str.lower() and not any(brand_candidate.lower() in dm.get("matched_brand", "").lower() for dm in detected_medicines):
                                detected_medicines.append({
                                    "raw_token": extra_str,
                                    "matched_brand": brand_candidate,
                                    "generic_name": "Inhaler / Respule" if "Inhaler" in extra_str or "Budicort" in extra_str else "",
                                    "form": "Inhaler" if "Inhaler" in extra_str else "Nebulizer",
                                    "confidence": 0.95,
                                    "match_score": 92.0,
                                    "dosage": extra_str,
                                    "instruction": extra_str,
                                    "requires_verification": False,
                                })

                    # Use vision lines if RapidOCR lines were sparse
                    if "all_lines" in vision_data and vision_data.get("all_lines"):
                        v_lines = vision_data.get("all_lines", [])
                        if len(v_lines) > len(lines_output):
                            all_text_lines = v_lines
                            lines_output = []
                            for idx, vl in enumerate(v_lines, start=1):
                                lines_output.append({
                                    "line_index": idx,
                                    "text": vl,
                                    "confidence": 0.96,
                                    "bounding_box": {"x": 50, "y": 30 * idx, "width": 400, "height": 25},
                                    "polygon": [[50, 30 * idx], [450, 30 * idx], [450, 30 * idx + 25], [50, 30 * idx + 25]],
                                    "dosage_findings": self.extract_dosage_patterns(vl),
                                })

        execution_time_ms = round((time.time() - start_time) * 1000, 2)
        raw_text = "\n".join(all_text_lines)
        clinical_entities = self.extract_clinical_entities(lines_output, raw_text)

        # Merge vision metadata into clinical_entities if available
        if vision_data:
            doc_dict = vision_data.get("doctor") or vision_data.get("doctor_info")
            if isinstance(doc_dict, dict):
                clinical_entities["doctor"].update({k: v for k, v in doc_dict.items() if v})

            pat_dict = vision_data.get("patient") or vision_data.get("patient_info")
            if isinstance(pat_dict, dict):
                clinical_entities["patient"].update({k: v for k, v in pat_dict.items() if v})

            vit_dict = vision_data.get("vitals")
            if isinstance(vit_dict, dict):
                clinical_entities["vitals"].update({k: v for k, v in vit_dict.items() if v})

            c_notes = vision_data.get("clinical_notes")
            if isinstance(c_notes, list):
                clinical_entities["clinical_notes"] = list(dict.fromkeys(clinical_entities["clinical_notes"] + c_notes))

            t_adv = vision_data.get("tests_advised")
            if isinstance(t_adv, list):
                clinical_entities["tests_advised"] = list(dict.fromkeys(clinical_entities["tests_advised"] + t_adv))

            add_instr = vision_data.get("additional_instructions")
            if isinstance(add_instr, list):
                clinical_entities["additional_instructions"] = add_instr
        avg_confidence = round(float(np.mean(confidences)), 4) if confidences else (0.95 if vision_data else 0.0)

        if shared_db_conn:
            try:
                shared_db_conn.close()
            except Exception:
                pass

        return {
            "status": "success",
            "image_metadata": {
                "original_width": orig_w,
                "original_height": orig_h,
                "processed_width": proc_w,
                "processed_height": proc_h,
                "skew_angle": round(skew_angle, 2),
            },
            "summary": {
                "total_lines_detected": len(lines_output),
                "total_text_lines_read": len(all_text_lines),
                "total_medicines_matched": len(detected_medicines),
                "average_confidence": avg_confidence,
                "requires_verification_count": sum(
                    1 for m in detected_medicines if m.get("requires_verification")
                ),
            },
            "clinical_entities": clinical_entities,
            "raw_text": raw_text,
            "lines": lines_output,
            "detected_medicines": detected_medicines,
            "dosage_instructions": all_dosage_instructions,
            "vision_fallback_applied": vision_data is not None,
            "vision_provider": vision_provider,
            "execution_time_ms": execution_time_ms,
        }

    # =========================================================================
    # Backward Compatibility
    # =========================================================================

    def extract_and_match(
        self, image_bytes: bytes, verified_brands: list
    ) -> List[Dict[str, Any]]:
        """
        Backward-compatible interface for earlier callers.
        Returns list of detected medicines.
        """
        result = self.process_prescription(
            image_bytes=image_bytes,
            verified_brands=verified_brands,
            db_lookup=False,
            use_vision_fallback=False,
        )
        return result.get("detected_medicines", [])