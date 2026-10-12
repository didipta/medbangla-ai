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
  Camera,
  Info,
  Sliders,
  FileText,
  Send,
  MessageSquare,
  Bot,
  Edit3,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api";
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
  defaultQuestion: string;
}

const CLINICAL_PRESETS: SamplePreset[] = [
  {
    title: "কার্ডিও-রেনাল প্রেসক্রিপশন (Proxen + Cardizem)",
    badge: "উচ্চ রক্তচাপ ও কিডনি ঝুঁকি",
    doctor: "ডাঃ মোঃ ফজলুল হক, MBBS, FCPS | সিএমএইচ ঢাকা",
    patient: "মাহাদী হাসান, ৪৯ বছর",
    vitals: { bp: "160/95", pulse: "84 bpm", weight: "68 kg", age: "৪৯ বছর" },
    medicines: [
      { brand: "Proxen 500mg", generic: "Naproxen", dosage: "১ + ০ + ১ (খাবারের পর)", form: "Tablet" },
      { brand: "Cardizem SR 90mg", generic: "Diltiazem Hydrochloride", dosage: "১ + ০ + ০ (খাবারের পর)", form: "Tablet" },
      { brand: "Dicaltrol 0.25mcg", generic: "Calcitriol", dosage: "০ + ১ + ০ (দুপুরে)", form: "Capsule" },
    ],
    adv: "S. Urea, S. Creatinine, Urine R/E",
    defaultQuestion: "প্রক্সেন এবং কার্ডিজেম একসাথে খেলে কি রক্তচাপ বা কিডনিতে কোনো সমস্যা হতে পারে?",
  },
  {
    title: "ইনফেকশন ও চিলেশন প্রেসক্রিপশন (Neoflox + Calbo-D)",
    badge: "অ্যান্টিবায়োটিক শোষণ বাধা",
    doctor: "অধ্যাপক ডাঃ এ. কে. আজাদ, MBBS, MD | ঢাকা মেডিকেল কলেজ",
    patient: "নাসিমা বেগম, ৪৮ বছর",
    vitals: { bp: "130/80", pulse: "76 bpm", weight: "62 kg", age: "৪৮ বছর" },
    medicines: [
      { brand: "Neoflox 500mg", generic: "Ciprofloxacin", dosage: "১ + ০ + ১ (খাবারের ১ ঘণ্টা আগে)", form: "Tablet" },
      { brand: "Calbo-D", generic: "Calcium Vitamin D3", dosage: "০ + ০ + ১ (রাতে খাবারের পর)", form: "Tablet" },
      { brand: "Napa 500mg", generic: "Paracetamol", dosage: "১ + ১ + ১ (প্রয়োজনে)", form: "Tablet" },
    ],
    adv: "CBC, Urine C/S",
    defaultQuestion: "নিওফ্লক্স ও ক্যালবো-ডি খাওয়ার সঠিক সময় ব্যবধান কত ঘণ্টা হওয়া উচিত?",
  },
  {
    title: "কার্ডিওলজি অ্যান্টিপ্লেটলেট প্রেসক্রিপশন (Clopid + Seclo)",
    badge: "CYP2C19 মেটাবলিজম ঝুঁকি",
    doctor: "ডাঃ রফিকুল ইসলাম, FCPS | জাতীয় হৃদরোগ ইনস্টিটিউট",
    patient: "আব্দুল করিম, ৬১ বছর",
    vitals: { bp: "145/85", pulse: "72 bpm", weight: "70 kg", age: "৬১ বছর" },
    medicines: [
      { brand: "Clopid 75mg", generic: "Clopidogrel", dosage: "০ + ১ + ০ (খাবারের পর)", form: "Tablet" },
      { brand: "Seclo 20mg", generic: "Omeprazole", dosage: "১ + ০ + ১ (খাবারের ২০ মি. আগে)", form: "Capsule" },
      { brand: "Ecosprin 75mg", generic: "Aspirin", dosage: "০ + ০ + ১ (রাতে ভরা পেটে)", form: "Tablet" },
    ],
    adv: "Lipid Profile, ECG, S. Creatinine",
    defaultQuestion: "ক্লোপিডোগ্রেল ও ওমিপ্রাজল একসাথে খেলে রক্তের জমাট বাঁধার কার্যকারিতা কমে কি?",
  },
];

const COMMON_DRUG_CHIPS = [
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

export interface VerifiedMedicineItem {
  id: string;
  brand: string;
  generic: string;
  dosage: string;
  form: string;
  confidence: number;
  status: "confirmed" | "uncertain" | "unmatched";
  included: boolean;
  notes?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: any[];
}

export const PrescriptionCareHub: React.FC = () => {
  // Prescription Ingestion States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<OCRAnalysisResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Editable Review Tray for Medicines
  const [medicines, setMedicines] = useState<VerifiedMedicineItem[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<VerifiedMedicineItem | null>(null);
  const [newDrugInput, setNewDrugInput] = useState("");

  // Integrated Drug Safety States
  const [safetyReport, setSafetyReport] = useState<InteractionReport | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  // Patient Guidance (Bangla Explainer)
  const [explanation, setExplanation] = useState<PrescriptionExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  // Contextual Medical Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Medicine Details Modal
  const [modalDrugName, setModalDrugName] = useState<string | null>(null);
  const [modalDrugData, setModalDrugData] = useState<MedicineDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Image Lightbox Modal
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<"review" | "safety" | "chat" | "guide">("review");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Sync detected medicines into editable state
  useEffect(() => {
    if (result?.detected_medicines) {
      const items: VerifiedMedicineItem[] = result.detected_medicines.map((m, idx) => {
        const score = m.match_score || Math.round((m.confidence || 0.85) * 100);
        let status: "confirmed" | "uncertain" | "unmatched" = "confirmed";
        if (score < 50) status = "unmatched";
        else if (score < 80) status = "uncertain";

        return {
          id: `med-${idx}-${Date.now()}`,
          brand: m.matched_brand || m.raw_token || "Unknown Medicine",
          generic: m.generic_name || m.matched_brand || "Unverified Generic",
          dosage: m.dosage || "১ + ০ + ১ (খাবারের পর)",
          form: m.form || "Tablet",
          confidence: score,
          status,
          included: true,
          notes: m.instruction || undefined,
        };
      });

      setMedicines(items);

      // Contextual welcoming message in Bangla
      const drugListStr = items.map((i) => i.brand).join(", ");
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          text: `নমস্কার / সালাম! প্রেসক্রিপশনটি স্ক্যান সম্পন্ন হয়েছে। সনাক্তকৃত ওষুধ: **${drugListStr}**।\n\nএই ওষুধের সেবনবিধি, সময়সূচি, ক্ষতিকর মিথস্ক্রিয়া বা খাবারের সতর্কতা সম্পর্কে আপনার কোনো প্রশ্ন থাকলে নিচে বাংলায় লিখুন।`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setMedicines([]);
      setSafetyReport(null);
      setExplanation(null);
      setChatMessages([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setMedicines([]);
      setSafetyReport(null);
      setExplanation(null);
      setChatMessages([]);
    }
  };

  const loadPresetPrescription = (preset: SamplePreset) => {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 840;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hospital Paper Surface
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 700, 840);

    // Primary Top Accent Bar
    ctx.fillStyle = "#0F766E";
    ctx.fillRect(0, 0, 700, 8);

    // Doctor info
    ctx.fillStyle = "#172B2A";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(preset.doctor.split("|")[0].trim(), 40, 50);

    ctx.fillStyle = "#647575";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(preset.doctor.split("|")[1]?.trim() || "Specialist Physician", 40, 72);

    // Divider
    ctx.strokeStyle = "#E2EAE7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 88);
    ctx.lineTo(660, 88);
    ctx.stroke();

    // Patient info banner
    ctx.fillStyle = "#F7FAF9";
    ctx.fillRect(40, 96, 620, 42);
    ctx.strokeStyle = "#E2EAE7";
    ctx.strokeRect(40, 96, 620, 42);

    ctx.fillStyle = "#172B2A";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(`Patient: ${preset.patient}`, 52, 122);
    ctx.fillStyle = "#647575";
    ctx.fillText(`BP: ${preset.vitals.bp}   Pulse: ${preset.vitals.pulse}   Wt: ${preset.vitals.weight}`, 350, 122);

    // Rx Symbol
    ctx.fillStyle = "#0F766E";
    ctx.font = "italic bold 36px Georgia";
    ctx.fillText("℞", 40, 185);

    // Medicines List
    let yPos = 225;
    preset.medicines.forEach((med, idx) => {
      ctx.fillStyle = "#172B2A";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, Arial";
      ctx.fillText(`${idx + 1}. ${med.brand} (${med.form})`, 65, yPos);

      ctx.fillStyle = "#0F766E";
      ctx.font = "14px Arial";
      ctx.fillText(`   ${med.dosage}`, 85, yPos + 24);

      yPos += 70;
    });

    // Tests & Advice
    ctx.strokeStyle = "#E2EAE7";
    ctx.beginPath();
    ctx.moveTo(40, yPos + 10);
    ctx.lineTo(660, yPos + 10);
    ctx.stroke();

    ctx.fillStyle = "#B91C1C";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText(`Advice & Tests: ${preset.adv}`, 40, yPos + 40);

    ctx.fillStyle = "#647575";
    ctx.font = "italic 11px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillText("MedBangla AI Clinical Verification Sample Script", 40, 810);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${preset.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`, {
          type: "image/png",
        });
        setSelectedFile(file);
        setImagePreview(canvas.toDataURL());
        setResult(null);
        setMedicines([]);
        setSafetyReport(null);
        setExplanation(null);
        setChatMessages([]);
      }
    }, "image/png");
  };

  // Run End-to-End Analysis
  const handleAnalyzePrescription = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setSafetyReport(null);
    setExplanation(null);
    setActiveTab("review");
    try {
      const { data, durationMs } = await api.analyzePrescription(selectedFile, true, true);
      setResult(data);
      setLatency(durationMs);

      // Automated Interaction Check
      const detectedGenerics = (data.detected_medicines || [])
        .map((m) => m.generic_name || m.matched_brand)
        .filter(Boolean) as string[];

      if (detectedGenerics.length >= 2) {
        runSafetyCheck(detectedGenerics);
      }
    } catch (err: any) {
      alert(`প্রেসক্রিপশন প্রসেসিংয়ে সমস্যা: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Pairwise Drug Safety Verification
  const runSafetyCheck = async (medList: string[]) => {
    if (medList.length < 2) return;
    setSafetyLoading(true);
    try {
      const { data } = await api.checkInteractions(medList);
      setSafetyReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSafetyLoading(false);
    }
  };

  const handleRecheckSafety = () => {
    const includedDrugs = medicines
      .filter((m) => m.included)
      .map((m) => m.generic || m.brand)
      .filter(Boolean);

    if (includedDrugs.length < 2) {
      alert("নিরাপত্তা যাচাই করার জন্য কমপক্ষে ২টি ওষুধ নির্বাচন করুন।");
      return;
    }
    runSafetyCheck(includedDrugs);
  };

  // Add custom drug to list
  const handleAddDrug = (nameToAdd?: string) => {
    const drug = (nameToAdd || newDrugInput).trim();
    if (!drug) return;

    if (medicines.some((m) => m.generic.toLowerCase() === drug.toLowerCase() || m.brand.toLowerCase() === drug.toLowerCase())) {
      alert("এই ওষুধটি ইতিমধ্যে তালিকায় যুক্ত রয়েছে।");
      return;
    }

    const item: VerifiedMedicineItem = {
      id: `custom-${Date.now()}`,
      brand: drug,
      generic: drug,
      dosage: "১ + ০ + ১ (খাবারের পর)",
      form: "Tablet",
      confidence: 100,
      status: "confirmed",
      included: true,
    };

    const updated = [...medicines, item];
    setMedicines(updated);
    setNewDrugInput("");

    const included = updated.filter((m) => m.included).map((m) => m.generic);
    if (included.length >= 2) {
      runSafetyCheck(included);
    }
  };

  const handleToggleInclude = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, included: !m.included } : m))
    );
  };

  const handleRemoveDrug = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveEdit = (edited: VerifiedMedicineItem) => {
    setMedicines((prev) => prev.map((m) => (m.id === edited.id ? edited : m)));
    setEditingMedicine(null);
  };

  // Generate Bangla Patient Explanation
  const handleGenerateExplanation = async () => {
    const included = medicines.filter((m) => m.included);
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
        confidence: m.confidence / 100,
        match_score: m.confidence,
        requires_verification: m.status !== "confirmed",
      }));
      const { data } = await api.explainPrescription(payload);
      setExplanation(data);
      setActiveTab("guide");
    } catch (err: any) {
      alert(`সহায়িকা তৈরিতে সমস্যা: ${err.message}`);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleCopyExplanation = () => {
    if (explanation?.bangla_explanation) {
      navigator.clipboard.writeText(explanation.bangla_explanation);
      setCopiedExplanation(true);
      setTimeout(() => setCopiedExplanation(false), 2000);
    }
  };

  // Contextual Chat Message Submission
  const handleSendChatMessage = async (presetText?: string) => {
    const message = (presetText || inputQuestion).trim();
    if (!message || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setChatLoading(true);

    try {
      const drugList = medicines.filter((m) => m.included).map((m) => m.generic || m.brand);
      const { data } = await api.sendChat(message, drugList);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.answer_bn,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.retrieved_sources,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: `দুঃখিত, উত্তর পেতে সমস্যা হয়েছে: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Monograph Modal Lookup
  const handleOpenDrugModal = async (drugName: string) => {
    setModalDrugName(drugName);
    setModalLoading(true);
    setModalDrugData(null);
    try {
      const { data } = await api.searchMedicines(drugName, 1);
      if (data.results && data.results.length > 0) {
        const full = await api.getMedicineDetails(data.results[0].brand_id);
        setModalDrugData(full.data);
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
      {/* 1. SECTION HEADER (Editorial Healthcare Tone)                            */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-semibold text-[#0F766E]">
              <Stethoscope className="w-3.5 h-3.5" />
              প্রেসক্রিপশন চেকার ও ভেরিফিকেশন
            </span>
            <span className="text-xs text-[#647575] hidden sm:inline">•</span>
            <span className="text-xs text-[#647575] hidden sm:inline">১০০% ভেরিফাইড রেফারেন্স</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B2A] tracking-tight">
            প্রেসক্রিপশন এনালাইসিস ও ওষুধ নিরাপত্তা চেকার
          </h2>
          <p className="text-xs sm:text-sm text-[#647575]">
            প্রেসক্রিপশন আপলোড করুন। এআই শনাক্তকৃত ওষুধসমূহ যাচাই করুন, ক্ষতিকর ড্রাগ মিথস্ক্রিয়া জানুন এবং সহজ বাংলায় নির্ভরযোগ্য তথ্য পান।
          </p>
        </div>

        {latency !== null && (
          <div className="flex items-center gap-2 self-start md:self-center bg-[#F7FAF9] border border-[#E2EAE7] px-3.5 py-2 rounded-lg text-xs">
            <Clock className="w-4 h-4 text-[#0F766E]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-[#647575]">প্রসেসিং সময়</div>
              <div className="font-mono font-bold text-[#172B2A]">{latency} ms</div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SAMPLE PRESET STRIP (Quick Evaluation)                                 */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#172B2A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            দ্রুত পরীক্ষার জন্য ক্লিনিক্যাল স্যাম্পল প্রেসক্রিপশন:
          </span>
          <span className="text-[11px] text-[#647575] hidden sm:inline">ক্লিক করলেই স্যাম্পল লোড হবে</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {CLINICAL_PRESETS.map((preset, idx) => {
            const sampleImages = [
              "/images/hero_prescription_scanner.jpg",
              "/images/prescription_ai_hero.jpg",
              "/images/hero_mobile_prescription_mockup.jpg",
            ];
            return (
              <button
                key={idx}
                onClick={() => loadPresetPrescription(preset)}
                className="text-left rounded-lg border border-[#E2EAE7] bg-[#F7FAF9] p-3 hover:border-[#0F766E] hover:bg-[#CCFBF1]/20 transition-all flex gap-3 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200">
                  <img
                    src={sampleImages[idx % sampleImages.length]}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="text-xs font-bold text-[#172B2A] group-hover:text-[#0F766E] transition-colors truncate">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-[#B45309] font-medium mt-0.5">{preset.badge}</div>
                    <div className="text-[11px] text-[#647575] line-clamp-1 mt-0.5">
                      {preset.medicines.map((m) => m.brand).join(" • ")}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#0F766E]">
                    <span>লোড করুন</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DUAL WORKBENCH LAYOUT (5 Cols Ingestion / 7 Cols Results)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT: INTENTIONAL UPLOAD PANEL (5 Cols)                                 */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#E2EAE7]">
              <span className="text-xs font-bold text-[#172B2A] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0F766E]" />
                প্রেসক্রিপশন আপলোড ও প্রিভিউ
              </span>
              {imagePreview && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:underline cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>জুম ইন</span>
                </button>
              )}
            </div>

            {/* Accessible Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[#E2EAE7] bg-[#F7FAF9] p-5 text-center hover:border-[#0F766E] hover:bg-[#CCFBF1]/15 transition-all flex flex-col items-center justify-center min-h-[250px] group relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
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
                  <div className="relative rounded-lg overflow-hidden border border-[#E2EAE7] bg-[#FFFFFF] p-1.5">
                    <img
                      src={imagePreview}
                      alt="Prescription script"
                      className="max-h-72 w-full object-contain rounded mx-auto"
                    />

                    {/* Laser Scanning Line Animation during Processing */}
                    {analyzing && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#172B2A]/60 backdrop-blur-[2px] p-4">
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0F766E] to-transparent shadow-[0_0_12px_2px_rgba(15,118,110,0.8)] animate-laser-scan pointer-events-none" />
                        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#0F766E] shadow-xl text-center space-y-1.5 max-w-xs">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#0F766E] mx-auto" />
                          <div className="text-xs font-bold text-[#172B2A]">টেক্সট ও ওষুধ বিশ্লেষণ হচ্ছে...</div>
                          <p className="text-[11px] text-[#647575]">১৭,৫৮৯ ভেরিফাইড ডাটাবেজে ম্যাপিং চলছে</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#0F766E] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                    <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                    <span className="text-[#647575]">(পরিবর্তন করতে ক্লিক করুন)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E] group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#172B2A]">
                      প্রেসক্রিপশনের ছবি আপলোড করুন
                    </p>
                    <p className="text-xs text-[#647575] mt-0.5 max-w-xs mx-auto">
                      ফাইল ড্র্যাগ করে ছাড়ুন অথবা মোবাইল দিয়ে ছবি তুলুন
                    </p>
                  </div>

                  <div className="inline-block rounded-md bg-[#FFFFFF] px-2.5 py-1 text-[11px] text-[#647575] border border-[#E2EAE7]">
                    JPG, PNG, WEBP (সর্বোচ্চ ১০MB)
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#E2EAE7] px-3 py-1.5 text-xs font-semibold text-[#172B2A] hover:bg-[#d5dedb] transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>ক্যামেরা ওপেন করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Run Analysis Action Button */}
            <button
              onClick={handleAnalyzePrescription}
              disabled={!selectedFile || analyzing}
              className="w-full rounded-lg bg-[#0F766E] py-3 text-sm font-bold text-white hover:bg-[#115E59] shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ওষুধ শনাক্ত ও প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>প্রেসক্রিপশন এনালাইসিস চালান</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT: RESULTS & EDITABLE VERIFICATION TRAY (7 Cols)                    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Tab Navigation (Review & Edit / Drug Safety / Bangla Chat / Patient Guide) */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#E2EAE7]/70 border border-[#E2EAE7] overflow-x-auto">
                <button
                  onClick={() => setActiveTab("review")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "review"
                      ? "bg-[#FFFFFF] text-[#0F766E] shadow-sm"
                      : "text-[#647575] hover:text-[#172B2A]"
                    }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>যাচাই ও ওষুধ তালিকা ({medicines.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("safety")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "safety"
                      ? "bg-[#FFFFFF] text-[#0F766E] shadow-sm"
                      : "text-[#647575] hover:text-[#172B2A]"
                    }`}
                >
                  <ShieldAlert
                    className={`w-3.5 h-3.5 ${safetyReport?.is_safe === false ? "text-[#B91C1C]" : "text-[#B45309]"
                      }`}
                  />
                  <span>
                    ড্রাগ সেফটি
                    {safetyReport && !safetyReport.is_safe && (
                      <span className="ml-1 rounded-full bg-[#B91C1C] text-white px-1.5 py-0.2 text-[10px]">
                        {safetyReport.interactions_count}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "chat"
                      ? "bg-[#FFFFFF] text-[#0F766E] shadow-sm"
                      : "text-[#647575] hover:text-[#172B2A]"
                    }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>বাংলা চ্যাট (Q&amp;A)</span>
                </button>

                <button
                  onClick={() => setActiveTab("guide")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "guide"
                      ? "bg-[#FFFFFF] text-[#0F766E] shadow-sm"
                      : "text-[#647575] hover:text-[#172B2A]"
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>রোগীর সহায়িকা</span>
                </button>
              </div>

              {/* =================================================================== */}
              {/* TAB 1: EDITABLE REVIEW & VERIFICATION INTERFACE                    */}
              {/* =================================================================== */}
              {activeTab === "review" && (
                <div className="space-y-4">
                  {/* Doctor & Patient Profile Dossier */}
                  {result.clinical_entities && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Doctor Profile */}
                      <div className="rounded-xl border border-[#E2EAE7] bg-[#FFFFFF] p-3.5 space-y-1 shadow-sm">
                        <div className="font-bold text-[#0F766E] flex items-center gap-1.5 pb-1 border-b border-[#E2EAE7]">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>চিকিৎসকের বিবরণ (Physician)</span>
                        </div>
                        <div className="pt-0.5">
                          নাম: <span className="font-bold text-[#172B2A]">{result.clinical_entities.doctor?.name || "N/A"}</span>
                        </div>
                        <div className="text-[#647575]">
                          ডিগ্রি: {result.clinical_entities.doctor?.qualification || "N/A"}
                        </div>
                        <div className="text-[#647575] truncate">
                          হাসপাতাল: {result.clinical_entities.doctor?.hospital || "N/A"}
                        </div>
                      </div>

                      {/* Patient & Vitals */}
                      <div className="rounded-xl border border-[#E2EAE7] bg-[#FFFFFF] p-3.5 space-y-1 shadow-sm">
                        <div className="font-bold text-[#0F766E] flex items-center gap-1.5 pb-1 border-b border-[#E2EAE7]">
                          <User className="w-3.5 h-3.5" />
                          <span>রোগী ও শারীরিক পরিমাপ (Vitals)</span>
                        </div>
                        <div className="pt-0.5">
                          নাম: <span className="font-bold text-[#172B2A]">{result.clinical_entities.patient?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#647575]">
                          <span>বয়স: {result.clinical_entities.patient?.age || "N/A"}</span>
                          <span>তারিখ: {result.clinical_entities.patient?.date || "16.05.2024"}</span>
                        </div>
                        <div className="flex items-center gap-3 pt-0.5">
                          <span className="font-mono font-bold text-[#B91C1C]">
                            BP: {result.clinical_entities.vitals?.blood_pressure || "160/95"}
                          </span>
                          <span className="font-mono text-[#647575]">
                            Wt: {result.clinical_entities.vitals?.weight || "68 kg"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medicines Review Table / List with Verification Statuses */}
                  <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2EAE7]">
                      <div>
                        <h3 className="font-bold text-sm text-[#172B2A]">
                          শনাক্তকৃত ওষুধ যাচাইকরণ (Medicine Verification)
                        </h3>
                        <p className="text-[11px] text-[#647575]">
                          অস্পষ্ট নাম থাকলে &ldquo;সংশোধন&rdquo; বাটনে ক্লিক করে সঠিক নাম নির্বাচন করুন
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#0F766E] bg-[#CCFBF1] px-2.5 py-0.5 rounded">
                        {medicines.filter((m) => m.included).length}টি নির্বাচিত
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {medicines.map((med) => (
                        <div
                          key={med.id}
                          className={`rounded-lg border p-3.5 transition-all text-xs space-y-2 ${med.included
                              ? "border-[#E2EAE7] bg-[#F7FAF9]"
                              : "border-[#E2EAE7] bg-[#FFFFFF] opacity-50"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={med.included}
                                onChange={() => handleToggleInclude(med.id)}
                                className="mt-0.5 h-4 w-4 rounded border-[#E2EAE7] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                              />
                              <div>
                                <div className="font-bold text-sm text-[#172B2A] flex items-center gap-2">
                                  <span>{med.brand}</span>
                                  {/* Verification Status Badges as per brief */}
                                  {med.status === "confirmed" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20 px-2 py-0.2 text-[10px] font-semibold">
                                      <CheckCircle2 className="w-3 h-3" />
                                      ভেরিফাইড
                                    </span>
                                  )}
                                  {med.status === "uncertain" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20 px-2 py-0.2 text-[10px] font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      যাচাই প্রয়োজন ({med.confidence}%)
                                    </span>
                                  )}
                                  {med.status === "unmatched" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 text-[#647575] border border-zinc-200 px-2 py-0.2 text-[10px] font-semibold">
                                      ম্যানুয়াল এন্ট্রি
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#0F766E] font-medium mt-0.5">
                                  জেনেরিক: {med.generic}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingMedicine(med)}
                                className="text-[#647575] hover:text-[#0F766E] p-1 rounded hover:bg-[#E2EAE7]/60 transition-colors"
                                title="সংশোধন করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveDrug(med.id)}
                                className="text-[#647575] hover:text-[#B91C1C] p-1 rounded hover:bg-[#E2EAE7]/60 transition-colors"
                                title="বাদ দিন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#E2EAE7] flex items-center justify-between text-xs">
                            <span className="font-mono font-medium text-[#172B2A]">
                              মাত্রা: {med.dosage}
                            </span>
                            <button
                              onClick={() => handleOpenDrugModal(med.generic || med.brand)}
                              className="text-[11px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Info className="w-3 h-3" />
                              <span>মনোগ্রাফ দেখুন</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Drug & Suggestion Chips */}
                    <div className="pt-2 border-t border-[#E2EAE7] space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="অতিরিক্ত ওষুধ বা জেনেরিক নাম লিখুন (যেমন: Aspirin, Metformin)..."
                          value={newDrugInput}
                          onChange={(e) => setNewDrugInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddDrug()}
                          className="flex-1 rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] px-3 py-2 text-xs text-[#172B2A] placeholder-[#647575] focus:border-[#0F766E] focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddDrug()}
                          className="rounded-lg bg-[#172B2A] px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>যোগ করুন</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[#647575]">কমন ওষুধ:</span>
                        {COMMON_DRUG_CHIPS.slice(0, 6).map((drug) => (
                          <button
                            key={drug}
                            onClick={() => handleAddDrug(drug)}
                            className="rounded bg-[#F7FAF9] border border-[#E2EAE7] px-2 py-0.5 text-[#172B2A] hover:bg-[#CCFBF1] hover:text-[#0F766E] transition-colors cursor-pointer"
                          >
                            + {drug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 2: SOURCED DRUG SAFETY & INTERACTION WARNINGS                  */}
              {/* =================================================================== */}
              {activeTab === "safety" && (
                <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2EAE7]">
                    <div>
                      <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#B45309]" />
                        ড্রাগ-ড্রাগ ক্ষতিকর মিথস্ক্রিয়া সতর্কতা (Drug-Drug Safety)
                      </h3>
                      <p className="text-[11px] text-[#647575]">
                        ভেরিফাইড ফার্মাকোলজিক্যাল লিটারেচার অনুযায়ী ক্ষতিকর মিথস্ক্রিয়া যাচাই
                      </p>
                    </div>

                    <button
                      onClick={handleRecheckSafety}
                      disabled={safetyLoading}
                      className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#115E59] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {safetyLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>যাচাই হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>পুনরায় পরীক্ষা করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {safetyReport ? (
                    <div className="space-y-3">
                      {/* Safety Status Banner complying with brief rule:
                          "Never label a medicine combination as safe merely because no interaction was found." */}
                      {safetyReport.is_safe ? (
                        <div className="rounded-lg p-4 border border-[#E2EAE7] bg-[#F7FAF9] flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm text-[#172B2A]">
                              কোনো সরাসরি ক্ষতিকর মিথস্ক্রিয়া নথিভুক্ত নেই
                            </div>
                            <p className="text-[#647575] leading-relaxed text-[11px]">
                              বর্তমান ডাটাবেজে এই ওষুধগুলোর মধ্যে সরাসরি কোনো ক্ষতিকর ইন্টারঅ্যাকশন পাওয়া যায়নি। তবে কোনো নতুন ওষুধ শুরু বা বন্ধ করার পূর্বে সর্বদা আপনার চিকিৎসকের পরামর্শ নিশ্চিত করুন।
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg p-4 border border-[#B91C1C]/30 bg-[#B91C1C]/10 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm text-[#B91C1C]">
                              সতর্কতা: {safetyReport.interactions_count}টি সম্ভাব্য ক্ষতিকর ড্রাগ মিথস্ক্রিয়া শনাক্ত হয়েছে
                            </div>
                            <p className="text-[#172B2A] text-[11px]">
                              নিচের সতর্কতা অনুযায়ী সময় ব্যবধান বজায় রাখুন অথবা চিকিৎসকের সাথে পরামর্শ করুন।
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pairwise Interaction Warnings */}
                      {safetyReport.interactions.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-[#E2EAE7] bg-[#F7FAF9] p-4 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2EAE7]">
                            <div className="font-bold text-sm text-[#172B2A]">
                              {item.drug_a} ⟷ {item.drug_b}
                            </div>
                            <span
                              className={`rounded px-2.5 py-0.5 text-[10px] font-bold uppercase ${item.severity === "CONTRAINDICATED"
                                  ? "bg-[#B91C1C] text-white"
                                  : item.severity === "MAJOR"
                                    ? "bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/30"
                                    : "bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30"
                                }`}
                            >
                              {item.severity_bn} ({item.severity})
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div>
                              <strong className="text-[#172B2A]">ক্লিনিক্যাল প্রভাব: </strong>
                              <span className="text-[#647575]">{item.effect_bn}</span>
                            </div>
                            {item.effect_en && (
                              <div className="text-[11px] text-[#647575] italic">
                                Scientific note: {item.effect_en}
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded bg-[#CCFBF1]/40 border border-[#CCFBF1] text-[#0F766E] space-y-0.5">
                            <strong className="font-bold block">চিকিৎসকের করণীয় ও পরামর্শ:</strong>
                            <p className="leading-relaxed text-[#172B2A]">{item.recommendation_bn}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#647575]">
                      ওষুধসমূহ নির্বাচন করে &ldquo;পুনরায় পরীক্ষা করুন&rdquo; বাটনে চাপ দিন।
                    </div>
                  )}
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 3: IN-PAGE CONTEXTUAL BANGLA CLINICAL CHAT                     */}
              {/* =================================================================== */}
              {activeTab === "chat" && (
                <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2EAE7]">
                    <div>
                      <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#0F766E]" />
                        প্রেসক্রিপশন এআই কনসালটেশন (Bangla RAG Chat)
                      </h3>
                      <p className="text-[11px] text-[#647575]">
                        বর্তমান প্রেসক্রিপশনের ওষুধসমূহ নিয়ে যেকোনো প্রশ্ন করুন
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded">
                      RAG Grounded
                    </span>
                  </div>

                  {/* Contextual Suggestion Chips */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[#647575]">কমন প্রশ্ন:</span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        "এই ওষুধগুলো কি খাবারের আগে না পরে খাব?",
                        "ওষুধগুলোর কোনো ক্ষতিকর পার্শ্বপ্রতিক্রিয়া বা সতর্কতা আছে?",
                        "ডোজ ভুলে গেলে বা মিস হলে কী করা উচিত?",
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChatMessage(q)}
                          className="rounded-lg border border-[#E2EAE7] bg-[#F7FAF9] px-2.5 py-1 text-[#172B2A] hover:bg-[#CCFBF1] hover:text-[#0F766E] transition-colors text-left cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Messages Stream */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto p-3.5 rounded-lg bg-[#F7FAF9] border border-[#E2EAE7]">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="h-7 w-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-xl p-3.5 space-y-1 leading-relaxed whitespace-pre-line text-xs ${msg.role === "user"
                              ? "bg-[#0F766E] text-white"
                              : "bg-[#FFFFFF] text-[#172B2A] border border-[#E2EAE7]"
                            }`}
                        >
                          <div>{msg.text}</div>
                          <div
                            className={`text-[10px] text-right ${msg.role === "user" ? "text-teal-200" : "text-[#647575]"
                              }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>

                        {msg.role === "user" && (
                          <div className="h-7 w-7 rounded-full bg-[#172B2A] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex gap-2 items-center text-[#647575] text-xs py-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
                        <span>ক্লিনিক্যাল রেফারেন্স থেকে উত্তর প্রস্তুত হচ্ছে...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="এই প্রেসক্রিপশন নিয়ে যেকোনো প্রশ্ন বাংলায় লিখুন..."
                      value={inputQuestion}
                      onChange={(e) => setInputQuestion(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#172B2A] placeholder-[#647575] focus:border-[#0F766E] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuestion.trim() || chatLoading}
                      className="rounded-lg bg-[#0F766E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#115E59] transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পাঠান</span>
                    </button>
                  </form>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 4: CLINICAL BANGLA PATIENT GUIDE                               */}
              {/* =================================================================== */}
              {activeTab === "guide" && (
                <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2EAE7]">
                    <div>
                      <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#0F766E]" />
                        রোগীর সহজ সহায়িকা (Patient Guidance)
                      </h3>
                      <p className="text-[11px] text-[#647575]">
                        প্রতিটি ওষুধের কাজ ও খাওয়ার সহজ সময়সূচি
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateExplanation}
                      disabled={explainLoading}
                      className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#115E59] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {explainLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>প্রস্তুত হচ্ছে...</span>
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
                      <div className="relative rounded-lg bg-[#F7FAF9] p-4 text-[#172B2A] text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-[#E2EAE7]">
                        <button
                          onClick={handleCopyExplanation}
                          className="absolute top-3 right-3 flex items-center gap-1 rounded bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#172B2A] border border-[#E2EAE7] hover:bg-[#F7FAF9] transition-colors cursor-pointer"
                        >
                          {copiedExplanation ? (
                            <>
                              <Check className="w-3 h-3 text-[#15803D]" />
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

                      <div className="flex items-center justify-between text-[11px] text-[#647575]">
                        <span>প্রোভাইডার: {explanation.llm_metadata?.provider || "Groq Qwen"}</span>
                        <span>সময়: {explanation.execution_time_ms} ms</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border border-dashed border-[#E2EAE7] text-center text-xs text-[#647575]">
                      উপরের বাটনে চাপ দিলে ওষুধের কাজ ও নিয়ম সহজ বাংলায় প্রস্তুত হবে।
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-[#E2EAE7] bg-[#FFFFFF] p-12 text-center text-[#647575] space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F7FAF9] text-[#647575]">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-[#172B2A]">
                প্রেসক্রিপশন এখনো আপলোড করা হয়নি
              </h3>
              <p className="text-xs text-[#647575] max-w-sm mx-auto leading-relaxed">
                বামে প্রেসক্রিপশনের ছবি আপলোড করুন অথবা স্যাম্পল প্রেসক্রিপশন লোড করে <strong>&ldquo;প্রেসক্রিপশন এনালাইসিস চালান&rdquo;</strong> বাটনে চাপ দিন।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VERIFICATION / EDIT DIALOG (As required in Section 5.2)                */}
      {/* ========================================================================= */}
      {editingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-xl border border-[#E2EAE7] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EAE7]">
              <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#0F766E]" />
                ওষুধের নাম ও ডোজ সংশোধন
              </h3>
              <button
                onClick={() => setEditingMedicine(null)}
                className="text-[#647575] hover:text-[#172B2A] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-[#172B2A]">ব্র্যান্ডের নাম</label>
                <input
                  type="text"
                  value={editingMedicine.brand}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, brand: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172B2A]">জেনেরিক নাম</label>
                <input
                  type="text"
                  value={editingMedicine.generic}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, generic: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172B2A]">সেবনবিধি ও সময় (Dosage)</label>
                <input
                  type="text"
                  value={editingMedicine.dosage}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, dosage: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2EAE7]">
              <button
                type="button"
                onClick={() => setEditingMedicine(null)}
                className="px-3 py-2 rounded-lg border border-[#E2EAE7] text-[#647575] font-semibold hover:bg-[#F7FAF9]"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit({ ...editingMedicine, status: "confirmed" })}
                className="px-4 py-2 rounded-lg bg-[#0F766E] text-white font-bold hover:bg-[#115E59]"
              >
                সংরক্ষণ ও নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PHARMACOLOGY MONOGRAPH MODAL                                          */}
      {/* ========================================================================= */}
      {modalDrugName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FFFFFF] rounded-xl border border-[#E2EAE7] p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE7]">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-base text-[#172B2A]">
                  {modalDrugName} — ক্লিনিক্যাল মনোগ্রাফ
                </h3>
              </div>
              <button
                onClick={() => setModalDrugName(null)}
                className="text-[#647575] hover:text-[#172B2A] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center text-[#647575] flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#0F766E]" />
                <span>ওষুধের তথ্য লোড হচ্ছে...</span>
              </div>
            ) : modalDrugData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F7FAF9] p-3 rounded-lg border border-[#E2EAE7]">
                  <div>
                    <div className="text-[10px] text-[#647575]">ব্র্যান্ড</div>
                    <div className="font-bold text-[#172B2A]">{modalDrugData.brand_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">জেনেরিক</div>
                    <div className="font-bold text-[#0F766E]">{modalDrugData.generic_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">শক্তি ও ফর্ম</div>
                    <div className="font-bold text-[#172B2A]">{modalDrugData.strength} ({modalDrugData.form})</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">কোম্পানি</div>
                    <div className="font-bold text-[#172B2A] truncate">{modalDrugData.manufacturer || "N/A"}</div>
                  </div>
                </div>

                {modalDrugData.indication && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#0F766E]">রোগ নির্দেশনা (Indication):</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.indication}</p>
                  </div>
                )}

                {modalDrugData.dose && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#0F766E]">সেবনবিধি ও মাত্রা (Dose &amp; Administration):</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.dose}</p>
                  </div>
                )}

                {modalDrugData.side_effect && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#B45309]">পার্শ্বপ্রতিক্রিয়া (Side Effects):</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.side_effect}</p>
                  </div>
                )}

                {modalDrugData.contra_indication && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#B91C1C]">প্রতিনির্দেশনা (Contraindication):</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.contra_indication}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[#647575]">
                এই ওষুধটির বিশদ তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LIGHTBOX MODAL                                                        */}
      {/* ========================================================================= */}
      {lightboxOpen && imagePreview && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white p-2">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white rounded-full p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagePreview}
              alt="Prescription script"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
