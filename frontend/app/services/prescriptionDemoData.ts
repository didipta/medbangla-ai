/**
 * MedBangla AI - Realistic Prescription Demo Dataset & Scan Simulator
 * Extracted from authentic Bangladeshi handwritten doctor prescriptions
 * 1. Prof. Brig. Gen. (Rtd.) Dr. Md. Fazlul Hoque (CMH Dhaka) - Patient: Mahdi Hasan
 * 2. Dr. Md. Sazzad Hossain (Lubana General Hospital) - Patient: Hasnain
 */

import {
  OCRAnalysisResponse,
  InteractionReport,
  PrescriptionExplainResponse,
} from "../types/api";
import { VerifiedMedicineItem } from "../store/slices/prescriptionSlice";

export interface DemoPrescriptionPreset {
  id: string;
  title: string;
  titleBn: string;
  badge: string;
  badgeBn: string;
  doctor: string;
  hospital: string;
  patient: string;
  patientAge: string;
  patientDate: string;
  diagnosis: string;
  diagnosisBn: string;
  imagePath: string;
  ocrResult: OCRAnalysisResponse;
  verifiedMedicines: VerifiedMedicineItem[];
  safetyReport: InteractionReport;
  explanation: PrescriptionExplainResponse;
}

export const DEMO_PRESCRIPTIONS: Record<string, DemoPrescriptionPreset> = {
  "demo-fazlul-hoque": {
    id: "demo-fazlul-hoque",
    title: "Prof. Brig. Gen. Dr. Md. Fazlul Hoque",
    titleBn: "অধ্যাপক ব্রিগেডিয়ার জেনারেল ডা. মো. ফজলুল হক",
    badge: "CKD & Nephrology Care",
    badgeBn: "কিডনি রোগ ও রক্তচাপ ব্যবস্থাপনা",
    doctor: "Prof. Brig. Gen. (Rtd.) Dr. Md. Fazlul Hoque, MBBS, FCPS (Medicine) BD, Dip-Nephrology (China)",
    hospital: "Combined Military Hospital (CMH), Dhaka",
    patient: "Mahdi Hasan",
    patientAge: "29 Yrs",
    patientDate: "16.05.2024",
    diagnosis: "CKD c Nephrotic range proteinuria & Stage 2 Hypertension",
    diagnosisBn: "ক্রনিক কিডনি ডিজিজ (CKD) ও উচ্চ রক্তচাপ",
    imagePath: "/images/demo/prescription_demo_dr_fazlul_hoque.jpg",
    ocrResult: {
      status: "success",
      filename: "prescription_demo_dr_fazlul_hoque.jpg",
      image_metadata: {
        original_width: 864,
        original_height: 1152,
        processed_width: 864,
        processed_height: 1152,
        skew_angle: -0.38,
      },
      summary: {
        total_lines_detected: 18,
        total_text_lines_read: 18,
        total_medicines_matched: 4,
        average_confidence: 91.5,
        requires_verification_count: 0,
      },
      clinical_entities: {
        doctor: {
          name: "অধ্যাপক ব্রিগেডিয়ার জেনারেল (অবঃ) ডা. মো. ফজলুল হক",
          qualification: "MBBS, FCPS (Medicine) BD, Dip-Nephrology (China)",
          designation: "মেডিসিন ও কিডনী রোগ বিশেষজ্ঞ, প্রাক্তন বিভাগীয় প্রধান, মেডিসিন বিভাগ",
          hospital: "সি এম এইচ (CMH), ঢাকা",
          phone: "01713043832",
        },
        patient: {
          name: "Mahdi Hasan",
          age: "29 Yrs",
          date: "16.05.2024",
        },
        vitals: {
          blood_pressure: "160/90",
          pulse: "84 bpm",
          weight: "57 kg",
        },
        clinical_notes: [
          "CKD c Nephrotic range proteinuria",
          "Hypertension Stage 2 (BP 160/90)",
          "Follow up in 2 weeks with lab reports",
        ],
        tests_advised: [
          "S. Urea, S. Creatinine",
          "S. Uric Acid",
          "Urine R/E (Routine & Microscopic Examination)",
          "S. Electrolytes (Na+, K+, Cl-)",
          "30% Diagnostic Discount Endorsed",
        ],
      },
      raw_text:
        "অধ্যাপক ব্রিগেডিয়ার জেনারেল (অবঃ) ডা. মো. ফজলুল হক, সি এম এইচ, ঢাকা। রোগী: Mahdi Hasan, বয়স: 29 Yrs, তারিখ: 16.5.24, ওজন: 57 Kg, পালস: 84, রক্তচাপ: 160/90। নির্ণয়: CKD c Nephrotic range proteinuria। পরীক্ষা: S. Urea, S. Cr, S. Uric Acid, Urine R/E, S. Electrolyte। Rx: (1) Tab Proxen 500mg ১+০+১ (খাবারের পর), (2) Tab Cardizem SR 90mg ১+০+১ (প্রতিদিন), (3) Cap Dicaltrol 0.25mcg ১+০+০ (সকালে), (4) Cap Zif-CI ১+০+০ (প্রতিদিন সকালে)।",
      lines: [
        {
          line_index: 1,
          text: "Prof. Brig. Gen. (Rtd.) Dr. Md. Fazlul Hoque",
          confidence: 0.98,
          bounding_box: { x: 45, y: 35, width: 780, height: 42 },
          polygon: [[45, 35], [825, 35], [825, 77], [45, 77]],
        },
        {
          line_index: 2,
          text: "Name: Mahdi Hasan | Age: 29 Yrs | Date: 16.5.24",
          confidence: 0.95,
          bounding_box: { x: 50, y: 125, width: 750, height: 35 },
          polygon: [[50, 125], [800, 125], [800, 160], [50, 160]],
        },
        {
          line_index: 3,
          text: "57 Kg | P: 84 | BP: 160/90 | CKD c Nephrotic range proteinuria",
          confidence: 0.91,
          bounding_box: { x: 60, y: 180, width: 720, height: 45 },
          polygon: [[60, 180], [780, 180], [780, 225], [60, 225]],
        },
        {
          line_index: 4,
          text: "1. Tab Proxen 500mg — ১ + ০ + ১ (খাবারের পর)",
          confidence: 0.94,
          bounding_box: { x: 320, y: 320, width: 480, height: 45 },
          polygon: [[320, 320], [800, 320], [800, 365], [320, 365]],
        },
        {
          line_index: 5,
          text: "2. Tab Cardizem SR 90 — ১ + ০ + ১ (প্রতিদিন)",
          confidence: 0.92,
          bounding_box: { x: 320, y: 410, width: 480, height: 45 },
          polygon: [[320, 410], [800, 410], [800, 455], [320, 455]],
        },
        {
          line_index: 6,
          text: "3. Cap Dicaltrol 0.25mcg — ১ + ০ + ০ (প্রতিদিন সকালে)",
          confidence: 0.89,
          bounding_box: { x: 320, y: 500, width: 480, height: 45 },
          polygon: [[320, 500], [800, 500], [800, 545], [320, 545]],
        },
        {
          line_index: 7,
          text: "4. Cap Zif-CI — ১ + ০ + ০ (প্রতিদিন সকালে)",
          confidence: 0.88,
          bounding_box: { x: 320, y: 590, width: 480, height: 45 },
          polygon: [[320, 590], [800, 590], [800, 635], [320, 635]],
        },
      ],
      detected_medicines: [
        {
          raw_token: "Tab Proxen 500mg",
          matched_brand: "Proxen 500mg",
          brand_id: 10421,
          generic_name: "Naproxen Sodium",
          strength: "500 mg",
          form: "Tablet",
          dosage: "১ + ০ + ১ (খাবারের পর ভরা পেটে)",
          instruction: "খাবারের পর ভরা পেটে সেব্য, গ্যাস্ট্রিক প্রতিরোধে এন্টাসিড/পিপিআই সহ",
          manufacturer: "Square Pharmaceuticals PLC",
          confidence: 0.94,
          match_score: 94,
          requires_verification: false,
        },
        {
          raw_token: "Tab Cardizem SR 90",
          matched_brand: "Cardizem SR 90mg",
          brand_id: 8432,
          generic_name: "Diltiazem Hydrochloride",
          strength: "90 mg",
          form: "Tablet",
          dosage: "১ + ০ + ১ (প্রতিদিন)",
          instruction: "রক্তচাপ নিয়ন্ত্রণে প্রতিদিন নির্দিষ্ট সময়ে পানি দিয়ে গিলে খাবেন",
          manufacturer: "Sanofi Bangladesh / Beximco",
          confidence: 0.92,
          match_score: 92,
          requires_verification: false,
        },
        {
          raw_token: "Cap Dicaltrol 0.25mcg",
          matched_brand: "Dicaltrol 0.25mcg",
          brand_id: 14210,
          generic_name: "Calcitriol",
          strength: "0.25 mcg",
          form: "Capsule",
          dosage: "১ + ০ + ০ (প্রতিদিন সকালে)",
          instruction: "কিডনিজনিত ক্যালসিয়াম ও ভিটামিন ডি নিয়ন্ত্রণে সকালে সেব্য",
          manufacturer: "Healthcare Pharmaceuticals Ltd.",
          confidence: 0.89,
          match_score: 89,
          requires_verification: false,
        },
        {
          raw_token: "Cap Zif CI",
          matched_brand: "Zif-CI",
          brand_id: 11094,
          generic_name: "Carbonyl Iron + Folic Acid + Zinc",
          strength: "50mg + 0.5mg + 61.8mg",
          form: "Capsule",
          dosage: "১ + ০ + ০ (প্রতিদিন সকালে)",
          instruction: "রক্তাল্পতা নিরাময়ে প্রতিদিন সকালে খাবারের পর ১টি ক্যাপসুল",
          manufacturer: "Square Pharmaceuticals PLC",
          confidence: 0.88,
          match_score: 88,
          requires_verification: false,
        },
      ],
      dosage_instructions: [
        { brand: "Proxen 500mg", schedule: "১ + ০ + ১", timing: "খাবারের পর (ভরা পেটে)" },
        { brand: "Cardizem SR 90mg", schedule: "১ + ০ + ১", timing: "প্রতিদিন নির্দিষ্ট সময়ে" },
        { brand: "Dicaltrol 0.25mcg", schedule: "১ + ০ + ০", timing: "সকালে খাবারের পর" },
        { brand: "Zif-CI", schedule: "১ + ০ + ০", timing: "সকালে খাবারের পর" },
      ],
      execution_time_ms: 1240,
      vision_fallback_applied: false,
      vision_provider: "medbangla-vision-ocr-v2",
      history_id: "demo-rx-fazlul-hoque-01",
    },
    verifiedMedicines: [
      {
        id: "demo-med-1",
        brand: "Proxen 500mg",
        generic: "Naproxen Sodium",
        dosage: "১ + ০ + ১ (খাবারের পর ভরা পেটে)",
        form: "Tablet",
        confidence: 94,
        status: "confirmed",
        included: true,
        notes: "ভরা পেটে সেবন করবেন, গ্যাস্ট্রিক প্রতিরোধক সাথে রাখা বাঞ্ছনীয়।",
      },
      {
        id: "demo-med-2",
        brand: "Cardizem SR 90mg",
        generic: "Diltiazem Hydrochloride",
        dosage: "১ + ০ + ১ (প্রতিদিন)",
        form: "Tablet",
        confidence: 92,
        status: "confirmed",
        included: true,
        notes: "রক্তচাপ নিয়ন্ত্রণে সহায়ক, ডাক্তারের পরামর্শ ব্যতীত ডোজ পরিবর্তন করবেন না।",
      },
      {
        id: "demo-med-3",
        brand: "Dicaltrol 0.25mcg",
        generic: "Calcitriol",
        dosage: "১ + ০ + ০ (প্রতিদিন সকালে)",
        form: "Capsule",
        confidence: 89,
        status: "confirmed",
        included: true,
        notes: "কিডনিজনিত খনিজ ঘাটতি প্রতিরোধে সকালে সেব্য।",
      },
      {
        id: "demo-med-4",
        brand: "Zif-CI",
        generic: "Carbonyl Iron + Folic Acid + Zinc",
        dosage: "১ + ০ + ০ (প্রতিদিন সকালে)",
        form: "Capsule",
        confidence: 88,
        status: "confirmed",
        included: true,
        notes: "রক্তস্বল্পতা নিরাময়ে প্রতিদিন সকালে খাবারের পর ১টি ক্যাপসুল।",
      },
    ],
    safetyReport: {
      status: "success",
      total_medicines_analyzed: 4,
      total_pairs_checked: 6,
      interactions_count: 1,
      overall_safety_status: "MODERATE_WARNING",
      severity_breakdown: {
        CONTRAINDICATED: 0,
        MAJOR: 0,
        MODERATE: 1,
        MINOR: 0,
      },
      interactions: [
        {
          drug_a: "Naproxen Sodium",
          drug_b: "Diltiazem Hydrochloride",
          severity: "MODERATE",
          severity_bn: "মাঝারি ঝুঁকি (সতর্কতা আবশ্যক)",
          effect_en:
            "NSAIDs like Naproxen can diminish the antihypertensive efficacy of Calcium Channel Blockers (Diltiazem) and may exacerbate renal impairment in patients with CKD and proteinuria.",
          effect_bn:
            "নেপ্রোক্সেন (Proxen) ও ডিলটিয়াজেম (Cardizem) একত্রে সেবনে রক্তচাপ নিয়ন্ত্রণকারী প্রভাব কিছুটা কমে যেতে পারে এবং কিডনি রোগীদের ক্ষেত্রে ক্রিয়েটিনিন বৃদ্ধির ঝুঁকি তৈরি হতে পারে।",
          recommendation_bn:
            "কিডনি বিশেষজ্ঞের তত্ত্বাবধানে রক্তচাপ ও সিরাম ক্রিয়েটিনিন নিয়মিত মনিটর করুন। দীর্ঘমেয়াদে নেপ্রোক্সেন সেবন এড়িয়ে চলুন।",
          source: "DGDA Bangladesh & BNF Drug Safety Formulary",
        },
      ],
      is_safe: false,
      execution_time_ms: 180,
    },
    explanation: {
      status: "success",
      bangla_explanation: `### প্রেসক্রিপশন ক্লিনিক্যাল গাইডেন্স (Mahdi Hasan - CMH Dhaka)

১. **রোগীর অবস্থা ও নির্ণয়:**
চিকিৎসক ক্রনিক কিডনি ডিজিজ (CKD) ও নেফ্রোটিক রেঞ্জ প্রোটিনুরিয়া এবং উচ্চ রক্তচাপ (BP 160/90) চিহ্নিত করেছেন। 

২. **ওষুধসমূহের উদ্দেশ্য ও সেবনবিধি:**
- **Proxen 500mg (Naproxen Sodium):** ব্যথা বা প্রদাহ কমাতে দেওয়া হয়েছে। এটি **অবশ্যই ভরা পেটে** খাবেন এবং গ্যাস্ট্রিকের সুরক্ষায় নির্দেশিত অ্যান্টাসিড বা পিপিআই সাথে রাখবেন।
- **Cardizem SR 90mg (Diltiazem):** রক্তচাপ নিয়ন্ত্রণে সাহায্যকারী সাসটেইন্ড রিলিজ ওষুধ। প্রতিদিন নির্দিষ্ট সময়ে পানি দিয়ে গিলে ফেলবেন।
- **Dicaltrol 0.25mcg (Calcitriol):** সক্রিয় ভিটামিন ডি, যা কিডনি রোগীদের ক্যালসিয়ামের ভারসাম্য বজায় রাখতে জরুরি। সকালে সেবন করুন।
- **Zif-CI (Iron, Folic Acid, Zinc):** কিডনিজনিত রক্তস্বল্পতা ও রোগপ্রতিরোধ ক্ষমতা বাড়াতে প্রতিদিন সকালে সেব্য।

৩. **ল্যাব টেস্টের পরামর্শ:**
প্রেসক্রিপশনে নির্দেশিত সিরাম ইউরিয়া, সিরাম ক্রিয়েটিনিন, ইউরিক অ্যাসিড এবং ইউরিন আর/ই পরীক্ষাগুলো দ্রুত সম্পন্ন করে চিকিৎসককে রিপোর্ট প্রদর্শন করুন।`,
      safety_report: {
        status: "success",
        total_medicines_analyzed: 4,
        total_pairs_checked: 6,
        interactions_count: 1,
        overall_safety_status: "MODERATE_WARNING",
        severity_breakdown: {
          CONTRAINDICATED: 0,
          MAJOR: 0,
          MODERATE: 1,
          MINOR: 0,
        },
        interactions: [],
        is_safe: false,
        execution_time_ms: 180,
      },
      medicines_analyzed: ["Proxen 500mg", "Cardizem SR 90mg", "Dicaltrol 0.25mcg", "Zif-CI"],
      retrieved_sources: [
        { generic_name: "Naproxen Sodium", section: "Interactions & Renal Cautions", score: 0.94 },
        { generic_name: "Diltiazem Hydrochloride", section: "Antihypertensive Guidelines", score: 0.91 },
      ],
      llm_metadata: {
        provider: "medbangla-clinical-rag",
        model: "llama-3.3-70b-versatile",
      },
      disclaimer: "এটি একটি কৃত্রিম বুদ্ধিমত্তা চালিত ডেমো বিশ্লেষণ। জরুরি প্রয়োজনে সর্বদা রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।",
      execution_time_ms: 420,
    },
  },

  "demo-sazzad-hossain": {
    id: "demo-sazzad-hossain",
    title: "Dr. Md. Sazzad Hossain",
    titleBn: "ডাঃ মোঃ সাজ্জাদ হোসেন",
    badge: "Pulmonology & Cardiology",
    badgeBn: "বক্ষব্যাধি ও মেডিসিন কেয়ার",
    doctor: "Dr. Md. Sazzad Hossain, MBBS (DMC), FCPS (Medicine), Trained in Cardiology (Reg. No: A-33457)",
    hospital: "Lubana General Hospital, Uttara, Dhaka",
    patient: "Hasnain",
    patientAge: "30 Yrs",
    patientDate: "15 FEB 2020",
    diagnosis: "Severe Cough (8d), Fever (3d), Bronchial Spasm & Wheezing",
    diagnosisBn: "তীব্র কাশি, জ্বর ও ব্রঙ্কিয়াল ইনফেকশন",
    imagePath: "/images/demo/prescription_demo_dr_sazzad_hossain.jpg",
    ocrResult: {
      status: "success",
      filename: "prescription_demo_dr_sazzad_hossain.jpg",
      image_metadata: {
        original_width: 828,
        original_height: 1792,
        processed_width: 828,
        processed_height: 1792,
        skew_angle: -0.15,
      },
      summary: {
        total_lines_detected: 22,
        total_text_lines_read: 22,
        total_medicines_matched: 7,
        average_confidence: 93.0,
        requires_verification_count: 0,
      },
      clinical_entities: {
        doctor: {
          name: "ডাঃ মোঃ সাজ্জাদ হোসেন",
          qualification: "MBBS (DMC), FCPS (Medicine), Trained in Cardiology",
          designation: "মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ, সহযোগী অধ্যাপক, মেডিসিন (রেজি. নং: A-33457)",
          hospital: "লুবানা জেনারেল হাসপাতাল (প্রাঃ) লিঃ, সেক্টর ৪, উত্তরা, ঢাকা",
          phone: "01711-188628, 01977-770775",
        },
        patient: {
          name: "Hasnain",
          age: "30 Yrs",
          date: "15 FEB 2020",
        },
        vitals: {
          blood_pressure: "130/80",
          pulse: "76 bpm",
        },
        clinical_notes: [
          "Chief Complaints: Cough 8 days, Fever 3 days",
          "Chest auscultation: Bronchial wheezing & spasm",
          "Adv: Urgent Hospitalization if breathing difficulty increases (রেড স্ট্যাম্প নির্দেশিকা)",
          "পূর্ণ বিশ্রাম ৭ দিন",
        ],
        tests_advised: [
          "CBC (Complete Blood Count)",
          "SGPT (ALT)",
          "CXR P/A view (Chest X-Ray)",
          "Blood C/S (Culture & Sensitivity)",
          "Urine R/E",
          "পূর্ণ বিশ্রাম ৭ দিন (30% discount)",
        ],
      },
      raw_text:
        "ডাঃ মোঃ সাজ্জাদ হোসেন, এমবিবিএস (ডিএমসি), এফসিপিএস (মেডিসিন)। রোগী: Hasnain, বয়স: 30 Yrs, তারিখ: 15 FEB 2020। C/C: Cough 8 days, Fever 3 days, Pulse: 76, BP: 130/80। পরীক্ষা: CBC, SGPT, CXR P/A view, Blood C/S, Urine R/E। Rx: (1) Tab Montilab 10mg ০+০+১ (রাতে), (2) Tab Deflacort 24mg ১+০+০ (সকালে), (3) Cap Xeldrin 20mg ১+০+১ (খাবারের ২০ মিনিট আগে), (4) Tab Optimox 400mg ০+১+০ (দুপুরে খাবারের পর), (5) Tab Doxiva 200mg ১+০+১ (খাবারের পর), (6) Ticamet (125) HFA Inhaler ২ চাপ দিনে ২ বার, (7) Azmasol HFA Inhaler ২ চাপ প্রয়োজনে। Nebulization with Budicort + Windel Plus। Adv: Urgent Hospitalization if symptoms worsen.",
      lines: [
        {
          line_index: 1,
          text: "DR. MD. SAZZAD HOSSAIN, MBBS (DMC), FCPS (Medicine)",
          confidence: 0.98,
          bounding_box: { x: 40, y: 30, width: 750, height: 40 },
          polygon: [[40, 30], [790, 30], [790, 70], [40, 70]],
        },
        {
          line_index: 2,
          text: "Name: Hasnain | Age: 30 Yrs | Date: 15 FEB 2020",
          confidence: 0.96,
          bounding_box: { x: 45, y: 130, width: 740, height: 35 },
          polygon: [[45, 130], [785, 130], [785, 165], [45, 165]],
        },
        {
          line_index: 3,
          text: "C/C: Cough 8 days, Fever 3 days | Pulse: 76 | BP: 130/80",
          confidence: 0.93,
          bounding_box: { x: 50, y: 190, width: 730, height: 40 },
          polygon: [[50, 190], [780, 190], [780, 230], [50, 230]],
        },
        {
          line_index: 4,
          text: "1. Tab Montilab 10mg — ০ + ০ + ১ (রাতে)",
          confidence: 0.95,
          bounding_box: { x: 340, y: 310, width: 450, height: 45 },
          polygon: [[340, 310], [790, 310], [790, 355], [340, 355]],
        },
        {
          line_index: 5,
          text: "2. Tab Deflacort 24mg — ১ + ০ + ০ (সকালে খাবারের পর)",
          confidence: 0.91,
          bounding_box: { x: 340, y: 380, width: 450, height: 45 },
          polygon: [[340, 380], [790, 380], [790, 425], [340, 425]],
        },
        {
          line_index: 6,
          text: "3. Cap Xeldrin 20mg — ১ + ০ + ১ (খাবারের ২০ মিনিট পূর্বে)",
          confidence: 0.93,
          bounding_box: { x: 340, y: 450, width: 450, height: 45 },
          polygon: [[340, 450], [790, 450], [790, 495], [340, 495]],
        },
        {
          line_index: 7,
          text: "4. Tab Optimox 400mg — ০ + ১ + ০ (দুপুরে খাবারের পর)",
          confidence: 0.92,
          bounding_box: { x: 340, y: 520, width: 450, height: 45 },
          polygon: [[340, 520], [790, 520], [790, 565], [340, 565]],
        },
        {
          line_index: 8,
          text: "5. Tab Doxiva 200mg — ১ + ০ + ১ (খাবারের পর)",
          confidence: 0.90,
          bounding_box: { x: 340, y: 590, width: 450, height: 45 },
          polygon: [[340, 590], [790, 590], [790, 635], [340, 635]],
        },
        {
          line_index: 9,
          text: "6. Ticamet (125) HFA Inhaler — ২ চাপ দিনে ২ বার",
          confidence: 0.94,
          bounding_box: { x: 340, y: 660, width: 450, height: 45 },
          polygon: [[340, 660], [790, 660], [790, 705], [340, 705]],
        },
        {
          line_index: 10,
          text: "7. Azmasol HFA Inhaler — ২ চাপ প্রয়োজনে (শ্বাসকষ্ট হলে)",
          confidence: 0.95,
          bounding_box: { x: 340, y: 730, width: 450, height: 45 },
          polygon: [[340, 730], [790, 730], [790, 775], [340, 775]],
        },
      ],
      detected_medicines: [
        {
          raw_token: "Tab Montilab 10",
          matched_brand: "Montilab 10mg",
          brand_id: 12054,
          generic_name: "Montelukast Sodium",
          strength: "10 mg",
          form: "Tablet",
          dosage: "০ + ০ + ১ (রাতে শোবার পূর্বে)",
          instruction: "অ্যালার্জি ও শ্বাসনালীর টান কমাতে রাতে শোবার আগে ১টি ট্যাবলেট",
          manufacturer: "Radiant Pharmaceuticals Ltd.",
          confidence: 0.95,
          match_score: 95,
          requires_verification: false,
        },
        {
          raw_token: "Tab Deflacort 24mg",
          matched_brand: "Deflacort 24mg",
          brand_id: 15301,
          generic_name: "Deflazacort",
          strength: "24 mg",
          form: "Tablet",
          dosage: "১ + ০ + ০ (সকালে খাবারের পর)",
          instruction: "শ্বাসনালীর তীব্র প্রদাহ কমাতে সকালে খাবারের পর নির্দিষ্ট ডোজে সেব্য",
          manufacturer: "Square Pharmaceuticals PLC",
          confidence: 0.91,
          match_score: 91,
          requires_verification: false,
        },
        {
          raw_token: "Cap Xeldrin 20",
          matched_brand: "Xeldrin 20mg",
          brand_id: 9812,
          generic_name: "Dexlansoprazole",
          strength: "20 mg",
          form: "Capsule",
          dosage: "১ + ০ + ১ (খাবারের ২০ মিনিট পূর্বে)",
          instruction: "গ্যাস্ট্রিক আলসার ও অ্যাসিডিটি প্রতিরোধে খাবারের ২০ মিনিট পূর্বে",
          manufacturer: "Square Pharmaceuticals PLC",
          confidence: 0.93,
          match_score: 93,
          requires_verification: false,
        },
        {
          raw_token: "Tab Optimox 400",
          matched_brand: "Optimox 400mg",
          brand_id: 16402,
          generic_name: "Moxifloxacin",
          strength: "400 mg",
          form: "Tablet",
          dosage: "০ + ১ + ০ (দুপুরে খাবারের পর)",
          instruction: "ব্যাকটেরিয়াল ফুসফুস ইনফেকশন নিরাময়ে দুপুরে খাবারের পর, কোর্স পূর্ণ করুন",
          manufacturer: "Square Pharmaceuticals PLC",
          confidence: 0.92,
          match_score: 92,
          requires_verification: false,
        },
        {
          raw_token: "Tab Doxiva 200",
          matched_brand: "Doxiva 200mg",
          brand_id: 11520,
          generic_name: "Doxofylline",
          strength: "200 mg",
          form: "Tablet",
          dosage: "১ + ০ + ১ (খাবারের পর)",
          instruction: "শ্বাসনালী প্রসারিত করে শ্বাসপ্রশ্বাস সহজ করতে খাবারের পর সেব্য",
          manufacturer: "Incepta Pharmaceuticals Ltd.",
          confidence: 0.90,
          match_score: 90,
          requires_verification: false,
        },
        {
          raw_token: "Ticamet (125) HFA Inhaler",
          matched_brand: "Ticamet 125 Inhaler",
          brand_id: 18210,
          generic_name: "Salmeterol + Fluticasone Propionate",
          strength: "25mcg + 125mcg",
          form: "Inhaler",
          dosage: "২ চাপ করে দিনে ২ বার",
          instruction: "ইনহেলার ব্যবহারের পর মুখের ভেতর পানি দিয়ে ভালো করে কুলকুচি করবেন",
          manufacturer: "Beximco Pharmaceuticals Ltd.",
          confidence: 0.94,
          match_score: 94,
          requires_verification: false,
        },
        {
          raw_token: "Azmasol HFA Inhaler",
          matched_brand: "Azmasol Inhaler",
          brand_id: 18001,
          generic_name: "Salbutamol",
          strength: "100 mcg/puff",
          form: "Inhaler",
          dosage: "২ চাপ প্রয়োজনে (শ্বাসকষ্ট হলে)",
          instruction: "তীব্র শ্বাসকষ্ট বা বুকে চাপ অনুভূত হলে দ্রুত উপশমের জন্য ২ চাপ নিবেন",
          manufacturer: "Beximco Pharmaceuticals Ltd.",
          confidence: 0.95,
          match_score: 95,
          requires_verification: false,
        },
      ],
      dosage_instructions: [
        { brand: "Montilab 10mg", schedule: "০ + ০ + ১", timing: "রাতে শোবার পূর্বে" },
        { brand: "Deflacort 24mg", schedule: "১ + ০ + ০", timing: "সকালে খাবারের পর" },
        { brand: "Xeldrin 20mg", schedule: "১ + ০ + ১", timing: "খাবারের ২০ মিনিট পূর্বে" },
        { brand: "Optimox 400mg", schedule: "০ + ১ + ০", timing: "দুপুরে খাবারের পর" },
        { brand: "Doxiva 200mg", schedule: "১ + ০ + ১", timing: "খাবারের পর" },
        { brand: "Ticamet 125 Inhaler", schedule: "২ চাপ দিনে ২ বার", timing: "ব্যবহারের পর কুলি আবশ্যক" },
        { brand: "Azmasol Inhaler", schedule: "২ চাপ প্রয়োজনে", timing: "জরুরি শ্বাসকষ্টে" },
      ],
      execution_time_ms: 1390,
      vision_fallback_applied: false,
      vision_provider: "medbangla-vision-ocr-v2",
      history_id: "demo-rx-sazzad-hossain-02",
    },
    verifiedMedicines: [
      {
        id: "demo-med-s-1",
        brand: "Montilab 10mg",
        generic: "Montelukast Sodium",
        dosage: "০ + ০ + ১ (রাতে শোবার পূর্বে)",
        form: "Tablet",
        confidence: 95,
        status: "confirmed",
        included: true,
        notes: "রাতে শোবার পূর্বে সেব্য। কাশি ও অ্যালার্জিক টান কমাতে সহায়ক।",
      },
      {
        id: "demo-med-s-2",
        brand: "Deflacort 24mg",
        generic: "Deflazacort",
        dosage: "১ + ০ + ০ (সকালে খাবারের পর)",
        form: "Tablet",
        confidence: 91,
        status: "confirmed",
        included: true,
        notes: "কর্টিকোস্টেরয়েড; প্রদাহ কমাতে সাহায্য করে। চিকিৎসকের নির্দেশিত মেয়াদের বেশি খাবেন না।",
      },
      {
        id: "demo-med-s-3",
        brand: "Xeldrin 20mg",
        generic: "Dexlansoprazole",
        dosage: "১ + ০ + ১ (খাবারের ২০ মিনিট পূর্বে)",
        form: "Capsule",
        confidence: 93,
        status: "confirmed",
        included: true,
        notes: "অ্যাসিড রিফ্লাক্স ও স্টেরয়েডজনিত গ্যাস্ট্রিক প্রতিরোধে খাবারের ২০ মিনিট আগে খাবেন।",
      },
      {
        id: "demo-med-s-4",
        brand: "Optimox 400mg",
        generic: "Moxifloxacin",
        dosage: "০ + ১ + ০ (দুপুরে খাবারের পর)",
        form: "Tablet",
        confidence: 92,
        status: "confirmed",
        included: true,
        notes: "ব্রড স্পেকট্রাম অ্যান্টিবায়োটিক; কোর্স কোনোভাবেই মাঝপথে বন্ধ করবেন না।",
      },
      {
        id: "demo-med-s-5",
        brand: "Doxiva 200mg",
        generic: "Doxofylline",
        dosage: "১ + ০ + ১ (খাবারের পর)",
        form: "Tablet",
        confidence: 90,
        status: "confirmed",
        included: true,
        notes: "ব্রঙ্কোডাইলেটর; শ্বাসনালী পরিষ্কার করে স্বাভাবিক শ্বাসপ্রশ্বাসে সাহায্য করে।",
      },
      {
        id: "demo-med-s-6",
        brand: "Ticamet 125 Inhaler",
        generic: "Salmeterol + Fluticasone Propionate",
        dosage: "২ চাপ দিনে ২ বার",
        form: "Inhaler",
        confidence: 94,
        status: "confirmed",
        included: true,
        notes: "নিয়মিত ব্যবহার্য প্রিভেন্টার ইনহেলার। ইনহেল করার পর অবশ্যই কুলি করবেন।",
      },
      {
        id: "demo-med-s-7",
        brand: "Azmasol Inhaler",
        generic: "Salbutamol",
        dosage: "২ চাপ প্রয়োজনে (শ্বাসকষ্ট হলে)",
        form: "Inhaler",
        confidence: 95,
        status: "confirmed",
        included: true,
        notes: "জরুরি রিলিভার ইনহেলার; শ্বাসকষ্ট তীব্র হলে তাৎক্ষণিক উপশমে ব্যবহার্য।",
      },
    ],
    safetyReport: {
      status: "success",
      total_medicines_analyzed: 7,
      total_pairs_checked: 21,
      interactions_count: 1,
      overall_safety_status: "MODERATE_WARNING",
      severity_breakdown: {
        CONTRAINDICATED: 0,
        MAJOR: 0,
        MODERATE: 1,
        MINOR: 0,
      },
      interactions: [
        {
          drug_a: "Moxifloxacin",
          drug_b: "Doxofylline",
          severity: "MODERATE",
          severity_bn: "মাঝারি ঝুঁকি (মনিটরিং আবশ্যক)",
          effect_en:
            "Fluoroquinolones (Moxifloxacin) in combination with xanthine derivatives (Doxofylline) can potentially increase cardiac stimulation or QT prolongation risk in susceptible patients.",
          effect_bn:
            "মক্সিফ্লক্সাসিন ও ডক্সোফাইলিন একত্রে গ্রহণে হৃদস্পন্দন কিছুটা দ্রুত হতে পারে বা বুক ধড়ফড় করতে পারে। চিকিৎসকের পরামর্শ অনুযায়ী পালস পর্যবেক্ষণ করুন।",
          recommendation_bn:
            "বুক ধড়ফড় বা অতিরিক্ত অস্থিরতা দেখা দিলে চিকিৎসককে জানান। পর্যাপ্ত পানি পান করুন।",
          source: "DGDA Bangladesh Pharmacovigilance & BNF",
        },
      ],
      is_safe: false,
      execution_time_ms: 210,
    },
    explanation: {
      status: "success",
      bangla_explanation: `### প্রেসক্রিপশন ক্লিনিক্যাল গাইডেন্স (Hasnain - লুবানা জেনারেল হাসপাতাল)

১. **রোগীর অবস্থা ও ডায়াগনোসিস:**
রোগীর ৮ দিন ধরে তীব্র কাশি এবং ৩ দিন ধরে জ্বর রয়েছে। চিকিৎসকের বিশেষ সতর্কবার্তা: শ্বাসকষ্ট বৃদ্ধি পেলে "Urgent Hospitalization" (জরুরি হাসপাতালে ভর্তি) নির্দেশিত।

২. **ওষুধসমূহের উদ্দেশ্য ও সেবনপদ্ধতি:**
- **Optimox 400mg (মক্সিফ্লক্সাসিন):** ফুসফুস ও শ্বাসনালীর তীব্র জীবাণু সংক্রমণের জন্য অ্যান্টিবায়োটিক। কোর্সটি চিকিৎসকের নির্দেশ অনুযায়ী পূর্ণ করুন।
- **Ticamet 125 HFA Inhaler:** শ্বাসনালীর প্রদাহ কমানোর নিয়মিত ইনহেলার। **বিশেষ নির্দেশ:** ইনহেলার স্প্রে নেওয়ার পর মুখে ছত্রাক ইনফেকশন এড়াতে অবশ্যই কুসুম গরম পানি দিয়ে ভালোভাবে কুলি বা গার্গল করবেন।
- **Azmasol Inhaler (সালবিউটামল):** জরুরি রিলিভার ইনহেলার। কেবল হঠাৎ শ্বাসকষ্ট বৃদ্ধি পেলে বা বুকে চাপ অনুভূত হলে ২ চাপ নিবেন।
- **Doxiva 200mg (ডক্সোফাইলিন):** ফুসফুসের শ্বাসনালী উন্মুক্ত রাখতে সাহায্য করবে।
- **Deflacort 24mg:** ফুসফুসের তীব্র অ্যালার্জি ও ফোলাভাব উপশমে স্বল্পমেয়াদে সকালে খাবারের পর সেব্য।
- **Xeldrin 20mg:** স্টেরয়েড ও অ্যান্টিবায়োটিকের পার্শ্বপ্রতিক্রিয়া থেকে পাকস্থলী সুরক্ষিত রাখতে খাবারের ২০ মিনিট পূর্বে সেবন করুন।

৩. **জরুরি নির্দেশনা:**
প্রেসক্রিপশনে নির্দেশিত রক্ত ও বুকের এক্স-রে (CXR P/A view) অবিলম্বে করিয়ে নিন। অক্সিজেন বা শ্বাসকষ্টের অবনতি হলে অনতিবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।`,
      safety_report: {
        status: "success",
        total_medicines_analyzed: 7,
        total_pairs_checked: 21,
        interactions_count: 1,
        overall_safety_status: "MODERATE_WARNING",
        severity_breakdown: {
          CONTRAINDICATED: 0,
          MAJOR: 0,
          MODERATE: 1,
          MINOR: 0,
        },
        interactions: [],
        is_safe: false,
        execution_time_ms: 210,
      },
      medicines_analyzed: [
        "Montilab 10mg",
        "Deflacort 24mg",
        "Xeldrin 20mg",
        "Optimox 400mg",
        "Doxiva 200mg",
        "Ticamet 125 Inhaler",
        "Azmasol Inhaler",
      ],
      retrieved_sources: [
        { generic_name: "Moxifloxacin", section: "Respiratory Infection Protocol", score: 0.96 },
        { generic_name: "Salmeterol + Fluticasone", section: "Inhaler Clinical Best Practices", score: 0.94 },
      ],
      llm_metadata: {
        provider: "medbangla-clinical-rag",
        model: "llama-3.3-70b-versatile",
      },
      disclaimer: "এটি একটি কৃত্রিম বুদ্ধিমত্তা চালিত ডেমো বিশ্লেষণ। জরুরি প্রয়োজনে সর্বদা রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।",
      execution_time_ms: 450,
    },
  },
};

export interface ScanSimulationStep {
  step: number;
  totalSteps: number;
  percentage: number;
  titleBn: string;
  titleEn: string;
  detailBn: string;
  detailEn: string;
}

export const SCAN_SIMULATION_STEPS: ScanSimulationStep[] = [
  {
    step: 1,
    totalSteps: 4,
    percentage: 25,
    titleBn: "প্রেসক্রিপশন ডেস্কেউ ও ক্লিন ফিল্টারিং...",
    titleEn: "De-Skewing & Contrast Binarization...",
    detailBn: "কাগজের ভাঁজ, ছায়া দূর করে ক্লিন ওসিআর গ্রিড তৈরি হচ্ছে (-০.৩৮° ডেস্কেউ)",
    detailEn: "Adaptive filter binarizing ink lines, removing shadow & paper folds (-0.38°)",
  },
  {
    step: 2,
    totalSteps: 4,
    percentage: 55,
    titleBn: "ডাক্তারের হাতের লেখা ও প্রেসক্রিপশন হেডার ডিকোড হচ্ছে...",
    titleEn: "Neural Handwriting Decoding & Tokenization...",
    detailBn: "চিকিৎসকের নাম, রোগীর বিবরণ, রক্তচাপ ও হাতের লেখা লাইন-বাই-লাইন শনাক্তকরণ",
    detailEn: "Recognizing handwritten Rx tokens, physician seal, vitals, and laboratory advice",
  },
  {
    step: 3,
    totalSteps: 4,
    percentage: 80,
    titleBn: "ডিজিডিএ ১৭,৫৮৯ অনুমোদিত ওষুধের সাথে ম্যাচিং...",
    titleEn: "DGDA 17,589 Pharmacopeia Entity Linking...",
    detailBn: "জাতীয় ঔষধ প্রশাসন ডাটাবেজ থেকে ব্র্যান্ড, জেনেরিক ও ডোজ শিডিউল সমন্বয়",
    detailEn: "Fuzzy phonetic matching against Bangladesh National Drug Formulary (DGDA)",
  },
  {
    step: 4,
    totalSteps: 4,
    percentage: 100,
    titleBn: "ড্রাগ মিথস্ক্রিয়া ও পেশেন্ট গাইডেন্স প্রস্তুত!",
    titleEn: "Pairwise Safety Verification & Clinical Guidance Ready!",
    detailBn: "সম্ভাব্য ক্ষতিকর ড্রাগ ইন্টারঅ্যাকশন স্ক্রিনিং ও বাংলায় সহজ ক্লিনিক্যাল নির্দেশিকা সমাপ্ত",
    detailEn: "Pairwise cross-toxicity checked; grounded Bengali patient explanation synthesized",
  },
];

/**
 * Simulates high-tech animated scanning pipeline without calling the backend OCR API
 */
export async function simulatePrescriptionScan(
  presetId: "demo-fazlul-hoque" | "demo-sazzad-hossain",
  onStepProgress?: (step: ScanSimulationStep) => void
): Promise<DemoPrescriptionPreset> {
  const preset = DEMO_PRESCRIPTIONS[presetId] || DEMO_PRESCRIPTIONS["demo-fazlul-hoque"];

  // Step 1
  if (onStepProgress) onStepProgress(SCAN_SIMULATION_STEPS[0]);
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Step 2
  if (onStepProgress) onStepProgress(SCAN_SIMULATION_STEPS[1]);
  await new Promise((resolve) => setTimeout(resolve, 750));

  // Step 3
  if (onStepProgress) onStepProgress(SCAN_SIMULATION_STEPS[2]);
  await new Promise((resolve) => setTimeout(resolve, 750));

  // Step 4
  if (onStepProgress) onStepProgress(SCAN_SIMULATION_STEPS[3]);
  await new Promise((resolve) => setTimeout(resolve, 500));

  return preset;
}
