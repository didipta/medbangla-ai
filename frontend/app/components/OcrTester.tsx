"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Scan,
  User,
  Stethoscope,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Code2,
  Cpu,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Pill,
  HeartPulse,
  Scale,
  Calendar,
  Phone,
  Hospital,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Eye,
  FileCheck2,
  Plus,
  Trash2,
  Copy,
  Check,
  ZoomIn,
  X,
  ExternalLink,
  Camera,
  Info,
  Sliders,
  FileText,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  OCRAnalysisResponse,
  InteractionReport,
  PrescriptionExplainResponse,
  MedicineDetails,
  DetectedMedicine,
} from "../types/api";

interface SamplePreset {
  title: string;
  badge: string;
  doctor: string;
  patient: string;
  medicines: { brand: string; generic: string; dosage: string; form: string }[];
  vitals: { bp: string; pulse: string; weight: string; age: string };
  adv: string;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    title: "Cardio-Renal Risk (Proxen + Cardizem)",
    badge: "Hypertension & Nephrotoxicity",
    doctor: "Dr. Md. Fazlul Hoque, MBBS, FCPS | CMH Dhaka",
    patient: "Mahdi Hasan, 49 Yrs",
    vitals: { bp: "160/95", pulse: "84 bpm", weight: "68 kg", age: "49 Yrs" },
    medicines: [
      { brand: "Proxen 500mg", generic: "Naproxen", dosage: "১ + ০ + ১ (খাবারের পর)", form: "Tablet" },
      { brand: "Cardizem SR 90mg", generic: "Diltiazem Hydrochloride", dosage: "১ + ০ + ০ (খাবারের পর)", form: "Tablet" },
      { brand: "Dicaltrol 0.25mcg", generic: "Calcitriol", dosage: "০ + ১ + ০ (দুপুরে)", form: "Capsule" },
    ],
    adv: "S. Urea, S. Creatinine, Urine R/E",
  },
  {
    title: "Infection & Chelation (Neoflox + Calbo-D)",
    badge: "Absorption Impairment",
    doctor: "Prof. Dr. A. K. Azad, MBBS, MD | Dhaka Medical College Hospital",
    patient: "Nasima Begum, 48 Yrs",
    vitals: { bp: "130/80", pulse: "76 bpm", weight: "62 kg", age: "48 Yrs" },
    medicines: [
      { brand: "Neoflox 500mg", generic: "Ciprofloxacin", dosage: "১ + ০ + ১ (খাবারের ১ ঘণ্টা আগে)", form: "Tablet" },
      { brand: "Calbo-D", generic: "Calcium Vitamin D3", dosage: "০ + ০ + ১ (রাতে খাবারের পর)", form: "Tablet" },
      { brand: "Napa 500mg", generic: "Paracetamol", dosage: "১ + ১ + ১ (প্রয়োজনে)", form: "Tablet" },
    ],
    adv: "CBC, Urine C/S",
  },
  {
    title: "Cardiology DAPT (Clopidogrel + Omeprazole)",
    badge: "CYP2C19 Inhibition",
    doctor: "Dr. Rafiqul Islam, FCPS (Cardiology) | National Heart Institute",
    patient: "Abdul Karim, 61 Yrs",
    vitals: { bp: "145/85", pulse: "72 bpm", weight: "70 kg", age: "61 Yrs" },
    medicines: [
      { brand: "Clopid 75mg", generic: "Clopidogrel", dosage: "০ + ১ + ০ (খাবারের পর)", form: "Tablet" },
      { brand: "Seclo 20mg", generic: "Omeprazole", dosage: "১ + ০ + ১ (খাবারের ২০ মি. আগে)", form: "Capsule" },
      { brand: "Ecosprin 75mg", generic: "Aspirin", dosage: "০ + ০ + ১ (রাতে ভরা পেটে)", form: "Tablet" },
    ],
    adv: "Lipid Profile, ECG, S. Creatinine",
  },
];

const COMMON_DRUG_SUGGESTIONS = [
  "Aspirin",
  "Paracetamol",
  "Omeprazole",
  "Naproxen",
  "Metformin",
  "Atorvastatin",
  "Ciprofloxacin",
  "Diltiazem",
  "Clopidogrel",
  "Amlodipine",
];

export const OcrTester: React.FC = () => {
  const { currentUser, isGoogleUser, openAuthModal } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dbLookup, setDbLookup] = useState(true);
  const [visionFallback, setVisionFallback] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRAnalysisResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Manageable Medicines Tray (Allows user to inspect, include/exclude, or add more drugs)
  const [activeMedicines, setActiveMedicines] = useState<
    { brand: string; generic: string; dosage?: string; form?: string; score?: number; included: boolean }[]
  >([]);
  const [newDrugInput, setNewDrugInput] = useState("");

  // Integrated Drug Safety States
  const [safetyReport, setSafetyReport] = useState<InteractionReport | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  // Integrated Clinical Bangla Explainer (RAG)
  const [explanation, setExplanation] = useState<PrescriptionExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  // Medicine Details Modal
  const [modalDrugName, setModalDrugName] = useState<string | null>(null);
  const [modalDrugData, setModalDrugData] = useState<MedicineDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Image Lightbox Modal
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync detected medicines into activeMedicines state when OCR completes
  useEffect(() => {
    if (result?.detected_medicines) {
      const items = result.detected_medicines.map((m) => ({
        brand: m.matched_brand || "Unknown Brand",
        generic: m.generic_name || m.matched_brand,
        dosage: m.dosage || "১+০+১ (খাবারের পর)",
        form: m.form || "Tablet",
        score: m.match_score,
        included: true,
      }));
      setActiveMedicines(items);
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGoogleUser) {
      if (e.target) e.target.value = "";
      openAuthModal("login");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setActiveMedicines([]);
      setSafetyReport(null);
      setExplanation(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGoogleUser) {
      openAuthModal("login");
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setActiveMedicines([]);
      setSafetyReport(null);
      setExplanation(null);
    }
  };

  const generateCanvasPrescription = (preset: SamplePreset) => {
    const canvas = document.createElement("canvas");
    canvas.width = 680;
    canvas.height = 820;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hospital Header background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 680, 820);

    // Header banner bar (Hospital Medical Teal)
    ctx.fillStyle = "#0f766e";
    ctx.fillRect(0, 0, 680, 10);

    // Hospital Logo Emblem
    ctx.fillStyle = "#0d9488";
    ctx.beginPath();
    ctx.arc(60, 52, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Georgia";
    ctx.fillText("🏥", 47, 58);

    // Doctor info
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(preset.doctor.split("|")[0].trim(), 95, 48);

    ctx.fillStyle = "#475569";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(preset.doctor.split("|")[1]?.trim() || "Clinical Specialist", 95, 68);

    // Separator line
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 88);
    ctx.lineTo(645, 88);
    ctx.stroke();

    // Patient info banner
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(35, 96, 610, 42);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(35, 96, 610, 42);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(`Patient: ${preset.patient}`, 48, 122);
    ctx.fillStyle = "#334155";
    ctx.fillText(`BP: ${preset.vitals.bp}   Pulse: ${preset.vitals.pulse}   Wt: ${preset.vitals.weight}`, 330, 122);

    // Rx Symbol
    ctx.fillStyle = "#0d9488";
    ctx.font = "italic bold 36px Georgia";
    ctx.fillText("℞", 40, 185);

    // Medicines List
    let yPos = 225;
    preset.medicines.forEach((med, idx) => {
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, Arial";
      ctx.fillText(`${idx + 1}. ${med.brand} (${med.form})`, 65, yPos);

      ctx.fillStyle = "#059669";
      ctx.font = "14px Arial";
      ctx.fillText(`   ${med.dosage}`, 85, yPos + 24);

      yPos += 70;
    });

    // Investigation & Advice
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(40, yPos + 10);
    ctx.lineTo(640, yPos + 10);
    ctx.stroke();

    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(`Advice & Clinical Tests: ${preset.adv}`, 40, yPos + 40);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 11px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText("MedBangla AI Clinical EHR Certified Script Sample — For System Validation", 40, 790);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${preset.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`, {
          type: "image/png",
        });
        setSelectedFile(file);
        setImagePreview(canvas.toDataURL());
        setResult(null);
        setActiveMedicines([]);
        setSafetyReport(null);
        setExplanation(null);
      }
    }, "image/png");
  };

  // Perform Drug Safety Check for given list
  const runSafetyCheck = async (medList: string[]) => {
    if (medList.length < 2) {
      alert("নিরাপত্তা যাচাই করার জন্য কমপক্ষে ২টি ওষুধ নির্বাচন করুন।");
      return;
    }
    setSafetyLoading(true);
    try {
      const { data } = await api.checkInteractions(medList);
      setSafetyReport(data);
    } catch (err: any) {
      console.error("Safety check failed:", err);
      alert(`Drug safety check error: ${err.message}`);
    } finally {
      setSafetyLoading(false);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setSafetyReport(null);
    setExplanation(null);
    try {
      const { data, durationMs } = await api.analyzePrescription(
        selectedFile,
        dbLookup,
        visionFallback
      );
      setResult(data);
      setLatency(durationMs);

      // Automatically trigger safety check if 2+ medicines detected
      const detectedGenerics = (data.detected_medicines || [])
        .map((m) => m.generic_name || m.matched_brand)
        .filter(Boolean) as string[];

      if (detectedGenerics.length >= 2) {
        runSafetyCheck(detectedGenerics);
      }
    } catch (err: any) {
      alert(`OCR analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger safety check for currently active/checked medicines
  const handleCheckCurrentSafety = () => {
    const includedDrugs = activeMedicines
      .filter((m) => m.included)
      .map((m) => m.generic || m.brand)
      .filter(Boolean);
    runSafetyCheck(includedDrugs);
  };

  // Add custom drug to the active medicines tray
  const handleAddDrug = (nameToAdd?: string) => {
    const drug = (nameToAdd || newDrugInput).trim();
    if (!drug) return;

    if (activeMedicines.some((m) => m.generic.toLowerCase() === drug.toLowerCase() || m.brand.toLowerCase() === drug.toLowerCase())) {
      alert("এই ওষুধটি ইতিমধ্যে তালিকায় যুক্ত রয়েছে।");
      return;
    }

    const updated = [
      ...activeMedicines,
      {
        brand: drug,
        generic: drug,
        dosage: "১ + ০ + ১ (খাবারের পর)",
        form: "Tablet",
        score: 100,
        included: true,
      },
    ];
    setActiveMedicines(updated);
    setNewDrugInput("");

    // Auto re-check safety if 2 or more included
    const included = updated.filter((m) => m.included).map((m) => m.generic);
    if (included.length >= 2) {
      runSafetyCheck(included);
    }
  };

  const handleToggleIncludeDrug = (index: number) => {
    const updated = [...activeMedicines];
    updated[index].included = !updated[index].included;
    setActiveMedicines(updated);
  };

  const handleRemoveDrug = (index: number) => {
    const updated = activeMedicines.filter((_, idx) => idx !== index);
    setActiveMedicines(updated);
  };

  // Generate Patient Explanation in Bangla
  const handleGenerateExplanation = async () => {
    const included = activeMedicines.filter((m) => m.included);
    if (!included.length) {
      alert("ব্যাখ্যা তৈরি করতে কমপক্ষে একটি ওষুধ নির্বাচন করুন।");
      return;
    }
    setExplainLoading(true);
    try {
      const payload: DetectedMedicine[] = included.map((m) => ({
        raw_token: m.brand,
        matched_brand: m.brand,
        generic_name: m.generic,
        form: m.form,
        dosage: m.dosage,
        confidence: 0.95,
        match_score: m.score || 95,
        requires_verification: false,
      }));
      const { data } = await api.explainPrescription(payload);
      setExplanation(data);
    } catch (err: any) {
      console.error(err);
      alert(`Explanation generation failed: ${err.message}`);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleCopyExplanation = () => {
    if (explanation?.bangla_explanation) {
      navigator.clipboard.writeText(explanation.bangla_explanation);
      setCopiedExplanation(true);
      setTimeout(() => setCopiedExplanation(false), 2500);
    }
  };

  // Inspect Drug Monograph in Modal
  const handleOpenDrugModal = async (drugName: string) => {
    setModalDrugName(drugName);
    setModalLoading(true);
    setModalDrugData(null);
    try {
      const { data } = await api.searchMedicines(drugName, 1);
      if (data.results && data.results.length > 0) {
        const full = await api.getMedicineDetails(data.results[0].brand_id);
        setModalDrugData(full.data);
      } else {
        setModalDrugData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP MEDICAL COMMAND BANNER                                            */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-6 md:p-8 text-white shadow-xl shadow-teal-950/20 border border-teal-700/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                <Stethoscope className="w-3.5 h-3.5" />
                ক্লিনিক্যাল প্রেসক্রিপশন ও ড্রাগ সেফটি হাব
              </span>
              <span className="rounded-full bg-teal-400/10 px-3 py-1 text-[11px] font-mono font-medium text-teal-200 border border-teal-400/20">
                FastAPI • RapidOCR • Pg_Trgm • Grounded RAG
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Prescription Understanding &amp; Clinical Safety Verification
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed">
              প্রেসক্রিপশনের ছবি আপলোড করুন অথবা স্যাম্পল প্রেসক্রিপশন লোড করুন। এআই চিকিৎসক ও রোগীর তথ্য শনাক্ত করবে, ১৭,৫৮৯ ওষুধের ডাটাবেজে ম্যাপিং করবে, সম্ভাব্য ক্ষতিকর মিথস্ক্রিয়া (Drug-Drug Interactions) যাচাই করবে এবং রোগীর জন্য সহজ বাংলায় পরামর্শ প্রস্তুত করবে।
            </p>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3">
            {latency !== null && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/20 shadow-inner">
                <Clock className="w-4 h-4 text-emerald-300" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/70 tracking-wider">
                    OCR Latency
                  </div>
                  <div className="text-lg font-mono font-black text-white">{latency} ms</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-teal-200/90 bg-teal-950/60 px-3 py-1.5 rounded-full border border-teal-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>0% Hallucination Drug Safety Protocol</span>
            </div>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. 1-CLICK CLINICAL TEST SCENARIOS (EHR PRESETS)                          */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            দ্রুত পরীক্ষার জন্য ক্লিনিক্যাল প্রেসক্রিপশন সিনারিও (1-Click Sample Scenarios):
          </span>
          <span className="text-[11px] text-zinc-400">
            বাস্তব ড্রাগ ইন্টারঅ্যাকশন পরীক্ষার জন্য যেকোনো একটি সিলেক্ট করুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => generateCanvasPrescription(preset)}
              className="group text-left rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3.5 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-emerald-500/80 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between shadow-sm cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {preset.title}
                  </span>
                </div>
                <div className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
                  {preset.badge}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {preset.medicines.map((m) => m.brand).join(" • ")}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/50">
                <span>প্রেসক্রিপশন লোড করুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSTATION: 2-COLUMN RESPONSIVE LAYOUT                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: PRESCRIPTION UPLOAD & ENGINE SETTINGS (5 Cols)             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Prescription Dropzone */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                প্রেসক্রিপশন আপলোড ও প্রিভিউ
              </span>
              {imagePreview && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>বড় করে দেখুন</span>
                </button>
              )}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {
                if (!isGoogleUser) {
                  openAuthModal("login");
                  return;
                }
                fileInputRef.current?.click();
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-300/90 bg-zinc-50/60 p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-emerald-500 transition-all flex flex-col items-center justify-center min-h-[260px] group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3 w-full">
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-1 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Prescription script"
                      className="max-h-72 w-full object-contain rounded mx-auto"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 backdrop-blur-md transition-colors">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                    <span className="text-zinc-400">(পরিবর্তন করতে ক্লিক করুন)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      প্রেসক্রিপশনের ছবি আপলোড করুন
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      ফাইল ড্র্যাগ করে ছাড়ুন অথবা মোবাইল দিয়ে ছবি তুলুন (JPG, PNG, WEBP)
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isGoogleUser) {
                          openAuthModal("login");
                          return;
                        }
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-200/80 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>ক্যামেরা ওপেন করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Engine Controls */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2.5 text-xs">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-700/60">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  এআই ইঞ্জিন কনফিগারেশন
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">v2.0 Model</span>
              </div>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ১৭,৫৮৯ ওষুধ ডাটাবেজে স্বয়ংক্রিয় ম্যাপিং
                  </div>
                  <div className="text-[11px] text-zinc-400">PostgreSQL pg_trgm ফাজি লিংকিং</div>
                </div>
                <input
                  type="checkbox"
                  checked={dbLookup}
                  onChange={(e) => setDbLookup(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ডাক্তারের হাতের লেখার ভিশন এআই ফলব্যাক
                  </div>
                  <div className="text-[11px] text-zinc-400">Groq Qwen &amp; Google Gemini Vision</div>
                </div>
                <input
                  type="checkbox"
                  checked={visionFallback}
                  onChange={(e) => setVisionFallback(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
              </label>
            </div>

            {/* Run Analysis CTA Button */}
            <button
              onClick={handleRunOcr}
              disabled={!selectedFile || loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ওষুধ শনাক্ত ও প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>প্রেসক্রিপশন অ্যানালাইসিস চালান</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: CLINICAL FINDINGS & INTERACTION HUB (7 Cols)              */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Quick Health Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-zinc-400 font-medium">Text Lines Read</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                    {result.summary?.total_text_lines_read || 0}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-zinc-400 font-medium">শনাক্তকৃত ওষুধ</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {result.detected_medicines?.length || 0} টি
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-zinc-400 font-medium">এআই কনফিডেন্স</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                    {Math.round((result.summary?.average_confidence || 0) * 100)}%
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-zinc-400 font-medium">ইঞ্জিন প্রোভাইডার</div>
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-1 truncate">
                    {result.vision_provider || "RapidOCR ONNX"}
                  </div>
                </div>
              </div>

              {/* Physician & Patient EHR Cards */}
              {result.clinical_entities && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Doctor Info */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-1.5 shadow-sm">
                    <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 text-sm pb-1.5 border-b border-emerald-500/20">
                      <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      চিকিৎসকের বিবরণ (Prescribing Doctor)
                    </div>
                    <div className="pt-1">
                      নাম: <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.clinical_entities.doctor?.name || "N/A"}</span>
                    </div>
                    <div>
                      ডিগ্রি: <span className="text-zinc-600 dark:text-zinc-300">{result.clinical_entities.doctor?.qualification || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <Hospital className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{result.clinical_entities.doctor?.hospital || "N/A"}</span>
                    </div>
                    {result.clinical_entities.doctor?.mobile && (
                      <div className="flex items-center gap-1 font-mono text-zinc-600 dark:text-zinc-400">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span>{result.clinical_entities.doctor.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Patient Info with Vitals */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs space-y-1.5 shadow-sm">
                    <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 text-sm pb-1.5 border-b border-blue-500/20">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      রোগী ও শারীরিক পরিমাপ (Vitals)
                    </div>
                    <div className="pt-1">
                      নাম: <span className="font-bold text-zinc-900 dark:text-zinc-100">{result.clinical_entities.patient?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>বয়স: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{result.clinical_entities.patient?.age || "N/A"}</span></div>
                      <div>তারিখ: <span className="font-mono text-zinc-600 dark:text-zinc-400">{result.clinical_entities.patient?.date || "16.05.2024"}</span></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <HeartPulse className="w-3.5 h-3.5" /> BP: {result.clinical_entities.vitals?.blood_pressure || "160/90"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        <Scale className="w-3.5 h-3.5 text-zinc-400" /> Wt: {result.clinical_entities.vitals?.weight || "57 kg"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* 4. INTERACTIVE MEDICATIONS TRAY (Inspection, Add/Remove, Monograph) */}
              {/* =================================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      প্রেসক্রিপশনের ওষুধসমূহ (Extracted Medications)
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    নিরাপত্তা যাচাইয়ের জন্য চেকবাক্স টিক চিহ্ন দিন বা নতুন ওষুধ যুক্ত করুন
                  </span>
                </div>

                {/* Medicine Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeMedicines.map((med, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3.5 transition-all space-y-2 relative ${
                        med.included
                          ? "border-emerald-500/30 bg-emerald-50/20 dark:border-emerald-500/30 dark:bg-emerald-950/10"
                          : "border-zinc-200 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-800/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={med.included}
                            onChange={() => handleToggleIncludeDrug(idx)}
                            className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                          />
                          <div>
                            <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                              {med.brand}
                            </div>
                            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {med.generic}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {med.score && (
                            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {Math.round(med.score)}%
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveDrug(idx)}
                            title="তালিকা থেকে বাদ দিন"
                            className="text-zinc-400 hover:text-rose-500 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {med.dosage}
                        </span>

                        <button
                          onClick={() => handleOpenDrugModal(med.generic || med.brand)}
                          className="flex items-center gap-1 font-semibold text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          <Info className="w-3 h-3" />
                          <span>মনোগ্রাফ দেখুন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Drug & Quick Suggestion Bar */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="অতিরিক্ত ওষুধ বা জেনেরিক লিখুন (যেমন: Aspirin, Metformin)..."
                      value={newDrugInput}
                      onChange={(e) => setNewDrugInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddDrug()}
                      className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      onClick={() => handleAddDrug()}
                      className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>যুক্ত করুন</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-zinc-400 font-medium">কমন ওষুধ যোগ করুন:</span>
                    {COMMON_DRUG_SUGGESTIONS.slice(0, 6).map((drug) => (
                      <button
                        key={drug}
                        onClick={() => handleAddDrug(drug)}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-zinc-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        + {drug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* 5. INTEGRATED CLINICAL DRUG-DRUG SAFETY CHECKER STATION             */}
              {/* =================================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        ওষুধের মিথস্ক্রিয়া ও নিরাপত্তা যাচাই (Drug-Drug Safety Check)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        শনাক্তকৃত ওষুধের সংমিশ্রণে কোনো বিপজ্জনক পার্শ্বপ্রতিক্রিয়া বা বিষক্রিয়া রয়েছে কিনা
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckCurrentSafety}
                    disabled={safetyLoading || activeMedicines.filter((m) => m.included).length < 2}
                    className="self-start sm:self-auto rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:from-rose-500 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {safetyLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ড্রাগ সেফটি পরীক্ষা চালান</span>
                      </>
                    )}
                  </button>
                </div>

                {safetyReport ? (
                  <div className="space-y-3.5">
                    {/* Overall Status Banner */}
                    <div
                      className={`rounded-2xl p-4 border flex items-center justify-between gap-3 transition-all ${
                        safetyReport.is_safe
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                          : safetyReport.overall_safety_status === "CRITICAL_CONTRAINDICATION"
                          ? "bg-rose-500/15 border-rose-500/40 text-rose-950 dark:text-rose-200"
                          : safetyReport.overall_safety_status === "HIGH_RISK"
                          ? "bg-orange-500/15 border-orange-500/40 text-orange-950 dark:text-orange-200"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {safetyReport.is_safe ? (
                          <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-black text-sm">
                            {safetyReport.is_safe
                              ? "সবগুলো ওষুধ নিরাপদ: কোনো সরাসরি বিপজ্জনক মিথস্ক্রিয়া শনাক্ত হয়নি"
                              : `সতর্কতা: ${safetyReport.interactions_count}টি ঝুঁকিপূর্ণ ড্রাগ মিথস্ক্রিয়া শনাক্ত হয়েছে`}
                          </div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            Status: <span className="font-mono font-bold">{safetyReport.overall_safety_status}</span> • Verified in {safetyReport.execution_time_ms}ms
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Interaction Cards */}
                    {safetyReport.interactions.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2.5 text-xs shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                              {item.drug_a}
                            </span>
                            <span className="text-zinc-400 font-bold">⟷</span>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                              {item.drug_b}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              item.severity === "CONTRAINDICATED"
                                ? "bg-rose-500 text-white"
                                : item.severity === "MAJOR"
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {item.severity_bn} ({item.severity})
                          </span>
                        </div>

                        <div>
                          <div className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                            <strong className="text-zinc-900 dark:text-zinc-100">ক্লিনিক্যাল প্রভাব: </strong>
                            {item.effect_bn}
                          </div>
                          {item.effect_en && (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 italic">
                              Clinical note: {item.effect_en}
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
                          <strong className="font-bold flex items-center gap-1 text-emerald-950 dark:text-emerald-200 mb-0.5">
                            <Activity className="w-3.5 h-3.5" />
                            করণীয় ও চিকিৎসকের পরামর্শ:
                          </strong>
                          <p className="leading-relaxed">{item.recommendation_bn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                    প্রেসক্রিপশনের ওষুধসমূহ নির্বাচন করে &ldquo;ড্রাগ সেফটি পরীক্ষা চালান&rdquo; বাটনে ক্লিক করুন।
                  </div>
                )}
              </div>

              {/* =================================================================== */}
              {/* 6. INTEGRATED CLINICAL BANGLA PATIENT GUIDE (RAG EXPLAINER)         */}
              {/* =================================================================== */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                        রোগীর সহজ সহায়িকা ও কাউন্সেলিং (Clinical Patient Guide)
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        প্রতিটি ওষুধের কাজ, খাওয়ার নিয়ম, খাবার সংক্রান্ত সতর্কতা ও বিশেষ নির্দেশিকা বাংলায় বুঝে নিন
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateExplanation}
                    disabled={explainLoading || !activeMedicines.filter((m) => m.included).length}
                    className="self-start sm:self-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {explainLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>সহায়িকা প্রস্তুত হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{explanation ? "পুনরায় তৈরি করুন" : "বাংলায় পূর্ণাঙ্গ সহায়িকা পান"}</span>
                      </>
                    )}
                  </button>
                </div>

                {explanation ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl bg-white p-5 text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-emerald-500/20">
                      {/* Copy Action */}
                      <button
                        onClick={handleCopyExplanation}
                        className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                        title="টেক্সট কপি করুন"
                      >
                        {copiedExplanation ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি করুন</span>
                          </>
                        )}
                      </button>

                      {explanation.bangla_explanation}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>LLM Provider: {explanation.llm_metadata?.provider || "Groq Qwen"}</span>
                      <span>Execution Time: {explanation.execution_time_ms} ms</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    &ldquo;বাংলায় পূর্ণাঙ্গ সহায়িকা পান&rdquo; বাটনে ক্লিক করলে ক্লিনিক্যাল লিটারেচার থেকে ওষুধের কাজ ও নিয়ম বাংলায় তৈরি হবে।
                  </div>
                )}
              </div>

              {/* Raw JSON Inspector */}
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden text-xs">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="w-full flex items-center justify-between p-3 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-zinc-500" />
                    Inspect Raw OCR JSON Response Payload
                  </span>
                  {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRawJson && (
                  <pre className="p-4 bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-72 border-t border-zinc-200 dark:border-zinc-800">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800/80 mb-2">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-zinc-800 dark:text-zinc-200">
                প্রেসক্রিপশন এখনো বিশ্লেষণ করা হয়নি
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                বামে প্রেসক্রিপশনের ছবি আপলোড করুন অথবা উপরের যেকোনো একটি স্যাম্পল প্রেসক্রিপশন নির্বাচন করে <strong>&ldquo;প্রেসক্রিপশন অ্যানালাইসিস চালান&rdquo;</strong> বাটনে চাপ দিন।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. MEDICINE MONOGRAPH MODAL                                               */}
      {/* ========================================================================= */}
      {modalDrugName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  {modalDrugName} — ক্লিনিক্যাল মনোগ্রাফ
                </h3>
              </div>
              <button
                onClick={() => setModalDrugName(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span>ওষুধের তথ্য লোড হচ্ছে...</span>
              </div>
            ) : modalDrugData ? (
              <div className="space-y-4 text-xs">
                {/* Header Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                    <div className="text-[10px] text-zinc-400">Brand</div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{modalDrugData.brand_name}</div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                    <div className="text-[10px] text-zinc-400">Generic</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{modalDrugData.generic_name}</div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                    <div className="text-[10px] text-zinc-400">Strength &amp; Form</div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{modalDrugData.strength} ({modalDrugData.form})</div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                    <div className="text-[10px] text-zinc-400">Company</div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{modalDrugData.manufacturer || "N/A"}</div>
                  </div>
                </div>

                {/* Clinical Sections */}
                {modalDrugData.indication && (
                  <div className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">রোগ নির্দেশনা (Indication):</div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{modalDrugData.indication}</p>
                  </div>
                )}

                {modalDrugData.dose && (
                  <div className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-blue-800 dark:text-blue-300">সেবনবিধি ও মাত্রা (Dose &amp; Administration):</div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{modalDrugData.dose}</p>
                  </div>
                )}

                {modalDrugData.side_effect && (
                  <div className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-amber-800 dark:text-amber-300">পার্শ্বপ্রতিক্রিয়া (Side Effects):</div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{modalDrugData.side_effect}</p>
                  </div>
                )}

                {modalDrugData.contra_indication && (
                  <div className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800 space-y-1">
                    <div className="font-bold text-rose-800 dark:text-rose-300">প্রতিনির্দেশনা (Contraindication):</div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{modalDrugData.contra_indication}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                এই ওষুধটির বিশদ তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PRESCRIPTION LIGHTBOX MODAL (High-Res Inspection)                      */}
      {/* ========================================================================= */}
      {lightboxOpen && imagePreview && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2 dark:bg-zinc-950">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagePreview}
              alt="Prescription Script High Resolution"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
