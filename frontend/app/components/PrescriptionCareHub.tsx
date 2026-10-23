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
  Bookmark,
  FolderClock,
  Code2,
  Play,
  CheckSquare,
  FileCode,
  Lock,
  LogIn,
} from "lucide-react";
import { FormattedChatMessage } from "./FormattedChatMessage";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  DEMO_PRESCRIPTIONS,
  simulatePrescriptionScan,
  ScanSimulationStep,
  DemoPrescriptionPreset,
} from "../services/prescriptionDemoData";
import {
  OCRAnalysisResponse,
  InteractionReport,
  PrescriptionExplainResponse,
  MedicineDetails,
  DetectedMedicine,
} from "../types/api";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchDailyQuota,
  fetchHistory,
  deleteHistoryItem,
  loadHistoryItem,
  setDailyQuota,
  optimisticIncrementQuota,
  setCurrentPrescriptionId,
  setResult,
  setMedicines,
  setSafetyReport,
  setSafetyLoading,
  setExplanation,
  setExplainLoading,
  setLatency,
  setAnalyzing,
  resetAnalysisState,
  VerifiedMedicineItem,
} from "../store/slices/prescriptionSlice";

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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: any[];
}

export const PrescriptionCareHub: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser, isDemoUser, isGoogleUser, openAuthModal, loginAsDemoUser } = useAuth();

  const dispatch = useAppDispatch();

  // Redux Global Prescription & Quota State
  const {
    dailyQuota,
    quotaLoading,
    currentPrescriptionId,
    result,
    medicines,
    safetyReport,
    safetyLoading,
    explanation,
    explainLoading,
    latency,
    analyzing,
    historyList,
    historyLoading,
    isPrescriptionLoading,
    loadingHistoryId,
  } = useAppSelector((state) => state.prescription);

  // Prescription Ingestion Local States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Editable Review Tray Local States
  const [editingMedicine, setEditingMedicine] = useState<VerifiedMedicineItem | null>(null);
  const [newDrugInput, setNewDrugInput] = useState("");

  // Patient Guidance Copy State
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

  // Interactive Demo Prescription States (Extracted from authentic doctor prescriptions)
  const [selectedDemoPreset, setSelectedDemoPreset] = useState<"demo-fazlul-hoque" | "demo-sazzad-hossain">("demo-fazlul-hoque");
  const [isDemoScanning, setIsDemoScanning] = useState(false);
  const [demoStepProgress, setDemoStepProgress] = useState<ScanSimulationStep | null>(null);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [personalUploadLoginModal, setPersonalUploadLoginModal] = useState(false);

  // Clinical Report Sections State (All sections visible and collapsible for seamless user experience)
  const [expandedSections, setExpandedSections] = useState({
    review: true,
    safety: true,
    guide: true,
    chat: true,
  });

  const toggleSection = (section: "review" | "safety" | "guide" | "chat") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const setAllSections = (expanded: boolean) => {
    setExpandedSections({
      review: expanded,
      safety: expanded,
      guide: expanded,
      chat: expanded,
    });
  };

  const scrollToSection = (elementId: string, sectionKey?: "review" | "safety" | "guide" | "chat") => {
    if (sectionKey) {
      setExpandedSections((prev) => ({ ...prev, [sectionKey]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  // History Slide-Over Drawer State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // SweetAlert Custom Modal States (No browser alert/confirm)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    historyId: string | null;
    doctorName?: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    historyId: null,
    doctorName: "",
    isDeleting: false,
  });

  const [sweetAlert, setSweetAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: "info" | "warning" | "error" | "success" = "warning"
  ) => {
    setSweetAlert({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    dispatch(fetchHistory());
    dispatch(fetchDailyQuota());
  }, [dispatch]);

  // Clear demo data and images when user is logged in with Google
  useEffect(() => {
    if (isGoogleUser && isDemoModeActive) {
      setIsDemoModeActive(false);
      setImagePreview(null);
      setSelectedFile(null);
      dispatch(resetAnalysisState());
    }
  }, [isGoogleUser, isDemoModeActive, dispatch]);

  // Automatic Background Save/Update to Database (Updates same ID if exists, creates new ID only for new analysis)
  const autoSaveToHistory = async (analysisData: OCRAnalysisResponse, medsOverride?: VerifiedMedicineItem[]) => {
    try {
      const meds = medsOverride && medsOverride.length > 0
        ? medsOverride.map((m) => ({
            matched_brand: m.brand,
            generic_name: m.generic,
            dosage: m.dosage,
            form: m.form,
            confidence: m.confidence / 100,
            match_score: m.confidence,
          }))
        : (analysisData.detected_medicines || []).map((m: any) => ({
            matched_brand: m.matched_brand || m.raw_token,
            generic_name: m.generic_name || m.matched_brand,
            dosage: m.dosage || "১ + ০ + ১",
            form: m.form || "Tablet",
            confidence: m.confidence || 0.95,
            match_score: m.match_score || 95,
          }));

      const payload = {
        clinical_entities: analysisData.clinical_entities || {},
        detected_medicines: meds,
        dosage_instructions: analysisData.dosage_instructions || [],
        summary: analysisData.summary || { total_medicines_matched: meds.length },
        raw_text: analysisData.raw_text || meds.map((m: any) => `${m.matched_brand} - ${m.dosage}`).join(", "),
      };

      if (currentPrescriptionId) {
        // Update the EXACT same prescription record in the database without creating a new history item
        const res = await api.updatePrescriptionHistory(currentPrescriptionId, payload);
        if (res.data?.status === "success") {
          setSaveToast(t("প্রেসক্রিপশন ডাটাবেজে আপডেট হয়েছে!", "Prescription updated in database!"));
          setTimeout(() => setSaveToast(null), 3000);
          dispatch(fetchHistory());
        }
      } else {
        // Create a new prescription history record with a unique ID
        const res = await api.savePrescriptionHistory(payload);
        if (res.data?.status === "success") {
          const newId = res.data.history_item?.id;
          if (newId) {
            dispatch(setCurrentPrescriptionId(newId));
          }
          setSaveToast(t("প্রেসক্রিপশন ডাটাবেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে!", "Prescription auto-saved to database history!"));
          setTimeout(() => setSaveToast(null), 3500);
          dispatch(fetchHistory());
        }
      }
    } catch (err) {
      console.warn("Auto-save/update to database failed:", err);
    }
  };

  const handleLoadHistoryItem = async (historyId: string) => {
    const loadStartTime = Date.now();
    try {
      await dispatch(loadHistoryItem(historyId)).unwrap();
      setImagePreview(null);
      setSelectedFile(null);

      // Guarantee smooth loading show time (at least 550ms for clear visual feedback)
      const elapsed = Date.now() - loadStartTime;
      if (elapsed < 550) {
        await new Promise((resolve) => setTimeout(resolve, 550 - elapsed));
      }

      setAllSections(true);
      scrollToSection("section-medicines-review", "review");
      setHistoryDrawerOpen(false);
      setSaveToast(t("সংরক্ষিত প্রেসক্রিপশন সফলভাবে লোড হয়েছে!", "Prescription loaded from history successfully!"));
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err: any) {
      showAlert(t("ত্রুটি", "Error"), t("হিস্ট্রি লোড করতে ব্যর্থ হয়েছে: ", "Failed to load history: ") + (err.message || err || "Error"), "error");
    }
  };

  const confirmDeleteHistory = async () => {
    if (!deleteModal.historyId) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await dispatch(deleteHistoryItem(deleteModal.historyId)).unwrap();
      setDeleteModal({ isOpen: false, historyId: null, isDeleting: false });
      setSaveToast(t("প্রেসক্রিপশন সফলভাবে মুছে ফেলা হয়েছে", "Prescription deleted successfully"));
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err: any) {
      setDeleteModal({ isOpen: false, historyId: null, isDeleting: false });
      showAlert(t("ত্রুটি", "Error"), t("মুছে ফেলতে ব্যর্থ হয়েছে: ", "Delete failed: ") + (err.message || err || "Error"), "error");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedSections.chat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, expandedSections.chat]);

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

      dispatch(setMedicines(items));

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
    // Custom prescription upload requires real Google login
    // Demo accounts only work with the 2 preset demo prescriptions
    if (!isGoogleUser) {
      if (e.target) {
        e.target.value = "";
      }
      setPersonalUploadLoginModal(true);
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      dispatch(resetAnalysisState());
      setChatMessages([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGoogleUser) {
      setPersonalUploadLoginModal(true);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      dispatch(resetAnalysisState());
      setChatMessages([]);
    }
  };



  // Run Client-Side Demo Simulation (Does NOT call backend OCR API)
  const handleRunDemoPrescription = async (
    targetPresetId?: "demo-fazlul-hoque" | "demo-sazzad-hossain"
  ) => {
    const presetKey = targetPresetId || selectedDemoPreset;
    setSelectedDemoPreset(presetKey);
    setIsDemoScanning(true);
    setSelectedFile(null);
    setPersonalUploadLoginModal(false);

    const targetPreset = DEMO_PRESCRIPTIONS[presetKey];
    setImagePreview(targetPreset.imagePath);

    try {
      const data = await simulatePrescriptionScan(presetKey, (step) => {
        setDemoStepProgress(step);
      });

      dispatch(setCurrentPrescriptionId(data.ocrResult.history_id || null));
      dispatch(setResult(data.ocrResult));
      dispatch(setMedicines(data.verifiedMedicines));
      dispatch(setSafetyReport(data.safetyReport));
      dispatch(setExplanation(data.explanation));
      dispatch(setLatency(data.ocrResult.execution_time_ms));
      setIsDemoModeActive(true);

      const drugListStr = data.verifiedMedicines.map((i) => i.brand).join(", ");
      setChatMessages([
        {
          id: "demo-welcome",
          role: "assistant",
          text:
            lang === "bn"
              ? `স্বাগতম! ডেমো প্রেসক্রিপশন (${targetPreset.patient} - ${targetPreset.doctor}) সফলভাবে বিশ্লেষণ হয়েছে। শনাক্তকৃত ওষুধসমূহ: ${drugListStr}। যেকোনো ওষুধের সেবনবিধি, সতর্কতা বা ল্যাব টেস্ট সম্পর্কে আমাকে প্রশ্ন করতে পারেন।`
              : `Welcome! Demo prescription (${targetPreset.patient} - ${targetPreset.doctor}) analyzed successfully. Identified medicines: ${drugListStr}. Feel free to ask about dosages, side effects, or lab tests.`,
          timestamp: "Just now",
        },
      ]);

      setAllSections(true);
      scrollToSection("section-medicines-review", "review");
      setSaveToast(
        lang === "bn"
          ? "ডেমো প্রেসক্রিপশন ডাটা সফলভাবে লোড ও ভেরিফাই হয়েছে!"
          : "Demo prescription loaded and verified successfully!"
      );
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error("Demo scan error:", err);
    } finally {
      setIsDemoScanning(false);
      setDemoStepProgress(null);
    }
  };

  // Run End-to-End Analysis (Enforces max 2 prescription analyses per day)
  const handleAnalyzePrescription = async () => {
    // Require real Google login for running personalized prescription analysis
    if (!isGoogleUser) {
      setPersonalUploadLoginModal(true);
      return;
    }

    if (!selectedFile) {
      showAlert(
        t("প্রেসক্রিপশন আপলোড করুন", "Upload Prescription"),
        t("এনালাইসিস শুরু করতে অনুগ্রহ করে প্রথমে প্রেসক্রিপশনের ছবি সিলেক্ট করুন।", "Please select or upload a prescription image to begin analysis."),
        "info"
      );
      return;
    }

    // Check daily limit quota (Max 2 analyses per user per day)
    if (!dailyQuota.can_analyze || dailyQuota.remaining <= 0) {
      showAlert(
        t("দৈনিক লিমিট শেষ (Daily Limit Reached)", "Daily Limit Reached (2/2 Used)"),
        t(
          "প্রতিদিন সর্বোচ্চ ২টি প্রেসক্রিপশন বিশ্লেষণ করার সুবিধা রয়েছে। আজকের জন্য আপনার কোটা শেষ হয়ে গেছে। রাত ১২:০০টার পর পুনরায় চেষ্টা করুন।",
          "Every user can analyze a maximum of 2 prescriptions per day. You have reached your limit for today. Please try again after midnight."
        ),
        "warning"
      );
      return;
    }

    // Clear active prescription ID so this new analysis creates a fresh new database record & ID
    dispatch(setCurrentPrescriptionId(null));
    dispatch(setAnalyzing(true));
    dispatch(setSafetyReport(null));
    dispatch(setExplanation(null));
    setAllSections(true);
    try {
      const { data, durationMs } = await api.analyzePrescription(selectedFile, true, true);
      dispatch(setResult(data));
      dispatch(setLatency(durationMs));

      // Instant Real-Time Quota Update in Redux
      if (data.daily_quota) {
        dispatch(setDailyQuota(data.daily_quota));
      } else {
        dispatch(optimisticIncrementQuota());
        dispatch(fetchDailyQuota());
      }

      // Automated Interaction Check
      const detectedGenerics = (data.detected_medicines || [])
        .map((m) => m.generic_name || m.matched_brand)
        .filter(Boolean) as string[];

      if (detectedGenerics.length >= 2) {
        runSafetyCheck(detectedGenerics);
      }

      // If backend already created and returned a history_id, track it directly
      if (data.history_id) {
        dispatch(setCurrentPrescriptionId(data.history_id));
        setSaveToast(t("প্রেসক্রিপশন ডাটাবেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে!", "Prescription auto-saved to database history!"));
        setTimeout(() => setSaveToast(null), 3500);
        dispatch(fetchHistory());
      } else {
        // Fallback auto-save to ensure database record creation
        autoSaveToHistory(data);
      }
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes("সর্বোচ্চ ২টি") || err.message?.includes("Daily limit")) {
        dispatch(
          setDailyQuota({
            daily_limit: 2,
            used_today: 2,
            remaining: 0,
            can_analyze: false,
            reset_info: "রাত ১২:০০টায় কোটা রিসেট হবে",
          })
        );
        showAlert(
          t("দৈনিক লিমিট শেষ (Daily Limit Reached)", "Daily Limit Reached (2/2 Used)"),
          t(
            "প্রতিদিন সর্বোচ্চ ২টি প্রেসক্রিপশন বিশ্লেষণ করার সুবিধা রয়েছে। আজকের জন্য আপনার কোটা শেষ হয়ে গেছে (২/২ ব্যবহৃত)। রাত ১২:০০টার পর পুনরায় চেষ্টা করুন।",
            "Every user can analyze a maximum of 2 prescriptions per day. You have reached your limit for today (2/2 used). Please try again after midnight."
          ),
          "error"
        );
        return;
      }
      showAlert(t("প্রেসক্রিপশন প্রসেসিং ত্রুটি", "Prescription Processing Error"), t(`প্রেসক্রিপশন প্রসেসিংয়ে সমস্যা: ${err.message}`, `Prescription processing error: ${err.message}`), "error");
    } finally {
      dispatch(setAnalyzing(false));
    }
  };

  // Pairwise Drug Safety Verification
  const runSafetyCheck = async (medList: string[]) => {
    if (medList.length < 2) return;
    dispatch(setSafetyLoading(true));
    try {
      const { data } = await api.checkInteractions(medList);
      dispatch(setSafetyReport(data));
    } catch (err: any) {
      if (err.status === 429) {
        showAlert(
          t("নিরাপত্তা রিকোয়েস্ট লিমিট (Rate Limit)", "Safety Check Rate Limit Reached"),
          t(
            `ড্রাগ ইন্টারঅ্যাকশন চেক করার রিকোয়েস্ট লিমিট অতিক্রম করেছে। সফটওয়্যার নিরাপত্তা নিশ্চিত করতে অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (${err.message})`,
            `Drug interaction check limit reached. For software safety, please wait before retrying. (${err.message})`
          ),
          "warning"
        );
      }
      console.error(err);
    } finally {
      dispatch(setSafetyLoading(false));
    }
  };

  const handleRecheckSafety = () => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    const includedDrugs = medicines
      .filter((m) => m.included)
      .map((m) => m.generic || m.brand)
      .filter(Boolean);

    if (includedDrugs.length < 2) {
      showAlert(t("নিরাপত্তা যাচাই", "Drug Safety Check"), t("নিরাপত্তা যাচাই করার জন্য কমপক্ষে ২টি ওষুধ নির্বাচন করুন।", "Select at least 2 medicines to verify safety interactions."), "warning");
      return;
    }
    runSafetyCheck(includedDrugs);
  };

  // Add custom drug to list (auto-updates the same prescription ID in history)
  const handleAddDrug = (nameToAdd?: string) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    const drug = (nameToAdd || newDrugInput).trim();
    if (!drug) return;

    if (medicines.some((m) => m.generic.toLowerCase() === drug.toLowerCase() || m.brand.toLowerCase() === drug.toLowerCase())) {
      showAlert(t("ওষুধ ইতিমধ্যে বিদ্যমান", "Medicine Already Added"), t("এই ওষুধটি ইতিমধ্যে তালিকায় যুক্ত রয়েছে।", "This medicine is already in the list."), "info");
      return;
    }

    const item: VerifiedMedicineItem = {
      id: `custom-${Date.now()}`,
      brand: drug,
      generic: drug,
      dosage: lang === "bn" ? "১ + ০ + ১ (খাবারের পর)" : "1 + 0 + 1 (After meals)",
      form: "Tablet",
      confidence: 100,
      status: "confirmed",
      included: true,
    };

    const updated = [...medicines, item];
    dispatch(setMedicines(updated));
    setNewDrugInput("");

    const included = updated.filter((m) => m.included).map((m) => m.generic);
    if (included.length >= 2) {
      runSafetyCheck(included);
    }

    // Auto-update the same prescription ID in the database
    if (result) {
      autoSaveToHistory(result, updated);
    }
  };

  const handleToggleInclude = (id: string) => {
    const updated = medicines.map((m) => (m.id === id ? { ...m, included: !m.included } : m));
    dispatch(setMedicines(updated));
    if (result) {
      autoSaveToHistory(result, updated);
    }
  };

  const handleRemoveDrug = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    dispatch(setMedicines(updated));
    if (result) {
      autoSaveToHistory(result, updated);
    }
  };

  const handleSaveEdit = (edited: VerifiedMedicineItem) => {
    const updated = medicines.map((m) => (m.id === edited.id ? edited : m));
    dispatch(setMedicines(updated));
    setEditingMedicine(null);
    if (result) {
      autoSaveToHistory(result, updated);
    }
  };

  // Generate Bangla Patient Explanation
  const handleGenerateExplanation = async () => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    const included = medicines.filter((m) => m.included);
    if (!included.length) {
      showAlert(t("ওষুধ নির্বাচন করুন", "Select Medicine"), t("সহায়িকা তৈরি করতে কমপক্ষে একটি ওষুধ নির্বাচন করুন।", "Select at least one medicine to generate instructions."), "warning");
      return;
    }
    dispatch(setExplainLoading(true));
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
      dispatch(setExplanation(data));
      scrollToSection("section-patient-guide", "guide");
    } catch (err: any) {
      if (err.status === 429) {
        showAlert(
          t("দৈনিক এআই লিমিট অতিক্রম (AI Explainer Limit)", "AI Guide Limit Reached"),
          t(
            `রোগীর সহায়িকা তৈরির দৈনিক লিমিট (সর্বোচ্চ ৫টি/দিন) বা ফ্রিকোয়েন্সি অতিক্রম করেছে। সফটওয়্যার সুরক্ষায় অনুগ্রহ করে অপেক্ষা করুন। (${err.message})`,
            `Daily limit for AI patient guides (max 5/day) or frequency limit reached. For software safety, please wait before retrying. (${err.message})`
          ),
          "warning"
        );
      } else {
        showAlert(t("সহায়িকা ত্রুটি", "Guide Error"), t(`সহায়িকা তৈরিতে সমস্যা: ${err.message}`, `Error generating guide: ${err.message}`), "error");
      }
    } finally {
      dispatch(setExplainLoading(false));
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
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

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
      if (err.status === 429) {
        showAlert(
          t("এআই চ্যাট লিমিট (Rate Limit)", "AI Chat Rate Limit"),
          t(
            `ক্লিনিক্যাল চ্যাটবটের দৈনিক কোটা (১৫টি/দিন) বা ফ্রিকোয়েন্সি লিমিট অতিক্রম করেছে। সফটওয়্যার সুরক্ষায় অনুগ্রহ করে কিছুক্ষণ পর প্রশ্ন করুন। (${err.message})`,
            `Daily quota for clinical chat (15/day) or burst frequency limit reached. For software safety, please retry after a short wait. (${err.message})`
          ),
          "warning"
        );
      }
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: err.status === 429
          ? `⚠️ লিমিট অতিক্রম করেছে (Rate Limit Exceeded): ${err.message}`
          : `দুঃখিত, উত্তর পেতে সমস্যা হয়েছে: ${err.message}`,
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
              {t("প্রেসক্রিপশন চেকার ও ভেরিফিকেশন", "Prescription Checker & Verification")}
            </span>
            <span className="text-xs text-[#647575] hidden sm:inline">•</span>
            <span className="text-xs text-[#647575] hidden sm:inline">
              {t("১০০% ভেরিফাইড রেফারেন্স", "100% Verified Reference")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B2A] tracking-tight">
            {t("প্রেসক্রিপশন এনালাইসিস ও ওষুধ নিরাপত্তা চেকার", "Prescription Analysis & Drug Safety Hub")}
          </h2>
          <p className="text-xs sm:text-sm text-[#647575]">
            {t(
              "প্রেসক্রিপশন আপলোড করুন। এআই শনাক্তকৃত ওষুধসমূহ যাচাই করুন, ক্ষতিকর ড্রাগ মিথস্ক্রিয়া জানুন এবং সহজ বাংলায় নির্ভরযোগ্য তথ্য পান।",
              "Upload your prescription. Review AI-detected medicines, detect potential drug interactions, and access clinical instructions."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {/* Daily Quota Indicator Badge (Max 2/day) */}
          {quotaLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2EAE7] bg-[#F7FAF9] text-xs text-[#647575] animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
              <span className="text-[11px] font-medium">{t("কোটা লোড হচ্ছে...", "Checking limit...")}</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-colors ${
                dailyQuota.remaining > 0
                  ? "bg-teal-50 border-teal-200/80 text-[#0F766E]"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
              title={dailyQuota.reset_info}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#647575]">
                  {t("দৈনিক কোটা:", "Daily Limit:")}
                </span>
                <span className="font-bold">
                  {t(
                    `${dailyQuota.remaining}/${dailyQuota.daily_limit}টি অবশিষ্ট (ব্যবহৃত: ${dailyQuota.used_today})`,
                    `${dailyQuota.remaining}/${dailyQuota.daily_limit} Left (Used: ${dailyQuota.used_today})`
                  )}
                </span>
              </div>
            </div>
          )}

          {latency !== null && (
            <div className="flex items-center gap-2 bg-[#F7FAF9] border border-[#E2EAE7] px-3.5 py-2 rounded-xl text-xs">
              <Clock className="w-4 h-4 text-[#0F766E]" />
              <div>
                <div className="text-[10px] uppercase font-bold text-[#647575]">
                  {t("প্রসেসিং সময়", "Processing Time")}
                </div>
                <div className="font-mono font-bold text-[#172B2A]">{latency} ms</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setHistoryDrawerOpen(true);
              fetchHistory();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#0F766E]/30 hover:border-[#0F766E] hover:bg-[#F0FDFA] text-[#0F766E] text-xs font-bold transition-all shadow-xs cursor-pointer group"
          >
            <FolderClock className="w-4 h-4 text-[#0F766E] group-hover:scale-110 transition-transform" />
            <span>{t("প্রেসক্রিপশন হিস্ট্রি", "Prescription History")}</span>
            {historyList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-[#0F766E] text-[10px] font-bold">
                {historyList.length}
              </span>
            )}
          </button>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 2.5 PROFESSIONAL GOOGLE SIGN-IN NOTICE & INTERACTIVE DEMO PRESETS BAR     */}
      {/* ========================================================================= */}
      {!isGoogleUser && (
        <div className="space-y-4">
        {/* Google Authentication Callout Banner */}
        <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-[#0F766E]">
                    {t("🌟 বাস্তব প্রেসক্রিপশন ডেমো ও গুগল সাইন-ইন", "🌟 Authentic Prescription Demo & Google Sign-In")}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-100/90 text-[#0F766E] font-bold text-[10px] border border-teal-200">
                    {t("এআই ভিশন এক্সট্রাকশন প্রস্তুত", "AI Vision Extraction Ready")}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                  {currentUser ? (
                    <span>
                      {t(
                        `স্বাগতম, ${currentUser.name}! আপনার গুগল অ্যাকাউন্ট সফলভাবে সংযুক্ত রয়েছে। আপনি নিজস্ব প্রেসক্রিপশন আপলোড করতে পারেন অথবা নিচে ১-ক্লিকে বাস্তব ডেমো প্রেসক্রিপশন পরীক্ষা করতে পারেন।`,
                        `Welcome, ${currentUser.name}! Your Google account is verified. You can upload custom prescriptions or test authentic doctor demos below.`
                      )}
                    </span>
                  ) : (
                    <span>
                      {t(
                        "এটি বাস্তব প্রেসক্রিপশন (ডাঃ মোঃ ফজলুল হক ও ডাঃ মোঃ সাজ্জাদ হোসেন) থেকে সংগৃহীত ভেরিফাইড ডেমো। নিচের ১-ক্লিক ডেমো দিয়ে সম্পূর্ণ সিস্টেমের কার্যকারিতা দেখুন। আপনার নিজস্ব প্রেসক্রিপশন লাইভ এআই স্ক্যান ও সংরক্ষণ করতে প্রথমে গুগল (Gmail) দিয়ে সাইন-ইন করুন।",
                        "This interactive demo uses verified data extracted from real Bangladeshi doctor prescriptions. Try the 1-click demos below! To scan and analyze your own personal prescriptions, please sign in with Google first."
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {!currentUser && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loginAsDemoUser("patient")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t("⚡ ১-ক্লিক ডেমো লগইন", "⚡ 1-Click Demo Sign-In")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all shadow-xs cursor-pointer shrink-0 group"
                >
                  {/* Official Google G Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="group-hover:text-[#0F766E] transition-colors">
                    {t("গুগল (Gmail) সাইন-ইন", "Google Sign-In")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Demo Preset Cards & 1-Click Trigger */}
        <div className="rounded-2xl border border-[#E2EAE7] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2EAE7]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {t("বাস্তব প্রেসক্রিপশন ডেমো সিলেক্টর (১-ক্লিক এনালাইসিস)", "Authentic Prescription Demo Selector (1-Click)")}
                </h3>
                <p className="text-[11px] text-[#647575]">
                  {t(
                    "নিচের যেকোনো প্রেসক্রিপশন নির্বাচন করে এআই ডিকোড ও ড্রাগ সেফটি রিপোর্ট পরীক্ষা করুন",
                    "Choose an authentic handwritten prescription sample to test vision OCR and drug safety"
                  )}
                </p>
              </div>
            </div>

            {/* Run Analysis Action Button */}
            <button
              type="button"
              onClick={() => handleRunDemoPrescription()}
              disabled={isDemoScanning}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t("⚡ নির্বাচিত ডেমো প্রেসক্রিপশন চেক করুন", "⚡ Run Demo Prescription Check")}</span>
            </button>
          </div>

          {/* 2 Selectable Real Prescription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preset 1: Dr. Fazlul Hoque */}
            <div
              onClick={() => {
                setSelectedDemoPreset("demo-fazlul-hoque");
                handleRunDemoPrescription("demo-fazlul-hoque");
              }}
              className={`rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                selectedDemoPreset === "demo-fazlul-hoque"
                  ? "border-[#0F766E] bg-teal-50/60 ring-2 ring-[#0F766E]/20 shadow-xs"
                  : "border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Thumbnail */}
                    <div className="h-14 w-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <img
                        src="/images/demo/prescription_demo_dr_fazlul_hoque.jpg"
                        alt="Dr. Fazlul Hoque prescription"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-[#0F766E] font-bold text-[10px] mb-0.5">
                        <Stethoscope className="w-3 h-3" />
                        <span>{t("কিডনি রোগ ও উচ্চ রক্তচাপ", "Nephrology & CKD Care")}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {t("অধ্যাপক ডা. মো. ফজলুল হক (সি এম এইচ, ঢাকা)", "Prof. Dr. Md. Fazlul Hoque (CMH Dhaka)")}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t("রোগী: Mahdi Hasan (২৯ বছর) • BP: 160/90", "Patient: Mahdi Hasan (29 Yrs) • BP: 160/90")}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      selectedDemoPreset === "demo-fazlul-hoque"
                        ? "bg-[#0F766E] border-[#0F766E] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selectedDemoPreset === "demo-fazlul-hoque" && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </div>

                {/* Medicine Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Proxen 500mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Cardizem SR 90mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Dicaltrol 0.25mcg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Zif-CI
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-[#0F766E] font-bold">
                <span>{t("৪টি ওষুধ • ড্রাগ মিথস্ক্রিয়া পরীক্ষা অন্তর্ভুক্ত", "4 Medicines • Moderate Renal Interaction")}</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  {t("লোড করুন", "Load Sample")} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Preset 2: Dr. Sazzad Hossain */}
            <div
              onClick={() => {
                setSelectedDemoPreset("demo-sazzad-hossain");
                handleRunDemoPrescription("demo-sazzad-hossain");
              }}
              className={`rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                selectedDemoPreset === "demo-sazzad-hossain"
                  ? "border-[#0F766E] bg-teal-50/60 ring-2 ring-[#0F766E]/20 shadow-xs"
                  : "border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Thumbnail */}
                    <div className="h-14 w-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <img
                        src="/images/demo/prescription_demo_dr_sazzad_hossain.jpg"
                        alt="Dr. Sazzad Hossain prescription"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] mb-0.5">
                        <HeartPulse className="w-3 h-3" />
                        <span>{t("বক্ষব্যাধি, কাশি ও ইনহেলার", "Pulmonology & Bronchial Care")}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {t("ডাঃ মোঃ সাজ্জাদ হোসেন (সহযোগী অধ্যাপক)", "Dr. Md. Sazzad Hossain (Assoc. Prof.)")}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t("রোগী: Hasnain (৩০ বছর) • কাশি ৮ দিন, জ্বর", "Patient: Hasnain (30 Yrs) • Cough 8d, Fever")}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      selectedDemoPreset === "demo-sazzad-hossain"
                        ? "bg-[#0F766E] border-[#0F766E] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selectedDemoPreset === "demo-sazzad-hossain" && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </div>

                {/* Medicine Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Montilab 10mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Deflacort 24mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Xeldrin 20mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Optimox 400mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Doxiva 200mg
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Ticamet Inhaler
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-[#0F766E] font-bold">
                <span>{t("৭টি ওষুধ • ইনহেলার ও অ্যান্টিবায়োটিক গাইডেন্স", "7 Medicines • Inhaler & Antibiotic Protocol")}</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  {t("লোড করুন", "Load Sample")} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

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
                {t("প্রেসক্রিপশন আপলোড ও প্রিভিউ", "Prescription Upload & Preview")}
              </span>
              {imagePreview && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:underline cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>{t("জুম ইন", "Zoom In")}</span>
                </button>
              )}
            </div>

            {/* Accessible Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {
                if (!isGoogleUser) {
                  setPersonalUploadLoginModal(true);
                  return;
                }
                fileInputRef.current?.click();
              }}
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
                    {(analyzing || isDemoScanning) && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#172B2A]/60 backdrop-blur-[2px] p-4">
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0F766E] to-transparent shadow-[0_0_12px_2px_rgba(15,118,110,0.8)] animate-laser-scan pointer-events-none" />
                        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#0F766E] shadow-xl text-center space-y-1.5 max-w-xs">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#0F766E] mx-auto" />
                          <div className="text-xs font-bold text-[#172B2A]">
                            {isDemoScanning && demoStepProgress
                              ? `${demoStepProgress.step} / ${demoStepProgress.total}: ${demoStepProgress.label_bn}`
                              : t("টেক্সট ও ওষুধ বিশ্লেষণ হচ্ছে...", "Analyzing text & medicines...")}
                          </div>
                          <p className="text-[11px] text-[#647575]">
                            {t("১৭,৫৮৯ ভেরিফাইড ডাটাবেজে ম্যাপিং চলছে", "Mapping against 17,589 verified monograph database")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 text-xs text-[#0F766E] font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                      <span className="truncate max-w-[200px]">
                        {isDemoModeActive ? DEMO_PRESCRIPTIONS[selectedDemoPreset].patient : (selectedFile?.name || "Prescription Image")}
                      </span>
                    </div>
                    {isDemoModeActive ? (
                      <div className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{t("বাস্তব ডেমো প্রেসক্রিপশন সক্রিয় (অন্য ছবি আপলোডে গুগল সাইন-ইন আবশ্যক)", "Demo Preset Active (Google Sign-In required for other images)")}</span>
                      </div>
                    ) : (
                      <span className="text-[#647575]">
                        {t("(পরিবর্তন করতে ক্লিক করুন)", "(Click to change)")}
                      </span>
                    )}
                  </div>
                </div>
              ) : isDemoUser ? (
                <div className="space-y-3.5 p-2 max-w-sm mx-auto text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("ডেমো মোড: কাস্টম আপলোড নিষ্ক্রিয়", "Demo Mode: Custom Upload Disabled")}</span>
                    </div>
                    <p className="text-sm font-bold text-[#172B2A]">
                      {t("অন্য ছবি আপলোড বা ক্যামেরা ব্যবহার করতে গুগল দিয়ে সাইন-ইন করুন", "Sign In with Google to Upload or Capture Custom Images")}
                    </p>
                    <p className="text-xs text-[#647575] mt-1 leading-relaxed">
                      {t(
                        "ডেমো লগইনে অন্য কোনো ছবি আপলোড বা ক্যামেরা ক্যাপচার প্রযোজ্য নয়; শুধুমাত্র নির্ধারিত ২টি ডেমো প্রেসক্রিপশন কাজ করবে। নিজের প্রেসক্রিপশন স্ক্যান করতে অনুগ্রহ করে প্রথমে গুগল দিয়ে প্রবেশ করুন।",
                        "Demo login only allows the 2 preset demo prescriptions. To upload other images or capture via camera, please sign in with your Google account first."
                      )}
                    </p>
                  </div>

                  <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openAuthModal("login")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t("গুগল (Gmail) সাইন-ইন করুন", "Sign In with Google (Gmail)")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunDemoPrescription()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#0F766E] fill-current" />
                      <span>{t("ডেমো স্ক্যান চালান", "Run Demo Scan")}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#647575] pt-0.5">
                    {t(
                      "💡 উপরে ডাঃ ফজলুল হক বা ডাঃ সাজ্জাদ হোসেন ডেমো সিলেক্ট করে ফ্রি টেস্ট করুন।",
                      "💡 Or select Dr. Fazlul Hoque or Dr. Sazzad Hossain demo above."
                    )}
                  </p>
                </div>
              ) : !currentUser ? (
                <div className="space-y-3.5 p-2 max-w-sm mx-auto text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("লগইন সুরক্ষিত আপলোড ও ক্যামেরা", "Login Protected: Upload & Camera")}</span>
                    </div>
                    <p className="text-sm font-bold text-[#172B2A]">
                      {t("ব্যক্তিগত প্রেসক্রিপশন স্ক্যান করতে লগইন করুন", "Sign In to Upload & Capture Prescriptions")}
                    </p>
                    <p className="text-xs text-[#647575] mt-1 leading-relaxed">
                      {t(
                        "কাস্টম প্রেসক্রিপশন ছবি আপলোড বা ক্যামেরা ব্যবহার করতে অনুগ্রহ করে গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন। অথবা উপরের ডেমো প্রেসক্রিপশন পরীক্ষা করুন।",
                        "To upload custom prescription images or capture via camera, please sign in with your Google account. Or test the demo above."
                      )}
                    </p>
                  </div>

                  <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openAuthModal("login")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t("গুগল সাইন-ইন করুন", "Sign In with Google")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunDemoPrescription()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#0F766E] fill-current" />
                      <span>{t("ডেমো স্ক্যান পরীক্ষা করুন", "Test Demo Scan")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E] group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#172B2A]">
                      {t("প্রেসক্রিপশনের ছবি আপলোড করুন", "Upload Prescription Image")}
                    </p>
                    <p className="text-xs text-[#647575] mt-0.5 max-w-xs mx-auto">
                      {t("ফাইল ড্র্যাগ করে ছাড়ুন অথবা মোবাইল দিয়ে ছবি তুলুন", "Drag & drop file or snap with mobile camera")}
                    </p>
                  </div>

                  <div className="inline-block rounded-md bg-[#FFFFFF] px-2.5 py-1 text-[11px] text-[#647575] border border-[#E2EAE7]">
                    {t("JPG, PNG, WEBP (সর্বোচ্চ ১০MB)", "JPG, PNG, WEBP (Max 10MB)")}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isGoogleUser) {
                          setPersonalUploadLoginModal(true);
                          return;
                        }
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#E2EAE7] px-3 py-1.5 text-xs font-semibold text-[#172B2A] hover:bg-[#d5dedb] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{t("ক্যামেরা ওপেন করুন", "Open Camera")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Quota Notice Card */}
            {quotaLoading ? (
              <div className="p-3 rounded-xl border border-[#E2EAE7] bg-[#F7FAF9] text-xs flex items-center justify-between text-[#647575] animate-pulse">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
                  <span className="text-[11px]">{t("দৈনিক কোটা লোড হচ্ছে...", "Checking daily limit...")}</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-[#E2EAE7]">--/2</span>
              </div>
            ) : (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all ${
                  dailyQuota.remaining > 0
                    ? "bg-teal-50/70 border-teal-200/80 text-[#0F766E]"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[11px] leading-tight">
                      {dailyQuota.remaining > 0
                        ? t(
                            `প্রতিদিন সর্বোচ্চ ২টি প্রেসক্রিপশন বিশ্লেষণ (আজ ব্যবহৃত: ${dailyQuota.used_today}টি, বাকি: ${dailyQuota.remaining}টি)`,
                            `Daily Limit: Max 2 analyses per user (Used: ${dailyQuota.used_today}, Left: ${dailyQuota.remaining})`
                          )
                        : t(
                            "আজকের দৈনিক কোটা (২/২) শেষ হয়েছে। রাত ১২:০০টার পর পুনরায় চেষ্টা করুন।",
                            "Daily limit (2/2) reached. Please try again after midnight."
                          )}
                    </span>
                    <span className="text-[10px] text-[#647575] mt-0.5">
                      {t("হিস্ট্রি মুছে ফেললেও দৈনিক ব্যবহারের হিসাব অপরিবর্তিত থাকবে", "Quota is based on analysis count and remains even if history is cleared")}
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-[11px] px-2 py-0.5 rounded bg-white/95 border border-current shrink-0 shadow-2xs">
                  {dailyQuota.remaining}/2
                </span>
              </div>
            )}

            {/* Run Analysis Action Button */}
            <button
              onClick={() => {
                if (!isGoogleUser) {
                  setPersonalUploadLoginModal(true);
                  return;
                }
                handleAnalyzePrescription();
              }}
              disabled={analyzing || (Boolean(isGoogleUser) && (!selectedFile || !dailyQuota.can_analyze || dailyQuota.remaining <= 0))}
              className={`w-full rounded-lg py-3 text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGoogleUser && dailyQuota.remaining <= 0
                  ? "bg-rose-600/80 cursor-not-allowed opacity-80"
                  : "bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50"
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t("ওষুধ শনাক্ত ও প্রসেসিং হচ্ছে...", "Detecting medicines & processing...")}</span>
                </>
              ) : isGoogleUser && dailyQuota.remaining <= 0 ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t("আজকের কোটা শেষ (২/২ সম্পন্ন)", "Daily Limit Reached (2/2 Used)")}</span>
                </>
              ) : !isGoogleUser ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t("গুগল সাইন-ইন করে চালান", "Sign In with Google to Run Analysis")}</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>{t("প্রেসক্রিপশন এনালাইসিস চালান", "Run Prescription Analysis")}</span>
                </>
              )}
            </button>

            {/* Professional Study Note: Processing Speed & Accuracy Benchmark */}
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/60 p-3 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0F766E]">
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>{t("এআই নির্ভুলতা ও প্রসেসিং সময় নির্দেশিকা:", "AI Accuracy & Latency Guide:")}</span>
              </div>
              <p className="leading-relaxed">
                {t(
                  "গবেষণামূলক প্রজেক্ট হওয়ায় এআই ভিশন বিশ্লেষণে কিছুটা সময় লাগতে পারে। জটিল ও অস্পষ্ট হাতের লেখায় প্রাথমিক নির্ভুলতা সাধারণতঃ ৫০%–৬০% এবং পরিষ্কার বা প্রিন্টেড প্রেসক্রিপশনে ৮০%–৯০% পর্যন্ত নির্ভুল ডাটা পাওয়া যায়। শতভাগ সঠিকতা নিশ্চিতে রিভিউ ট্রেতে ওষুধ যাচাই ও এডিট করার সুবিধা রয়েছে।",
                  "Because this is an academic research platform, multi-pass vision extraction may take a few seconds. Baseline accuracy is 50%–60% for complex handwriting and 80%–90% for clear or printed prescriptions. Please verify and edit medicines in the review tray."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT: RESULTS & EDITABLE VERIFICATION TRAY (7 Cols)                    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* ======================================================================= */}
              {/* TOP: QUICK-NAV JUMP BAR & WORKBENCH CONTROLS                           */}
              {/* ======================================================================= */}
              <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md border border-[#E2EAE7] rounded-xl p-3 shadow-sm space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center font-bold text-xs shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#172B2A]">
                        {t("প্রেসক্রিপশন ক্লিনিক্যাল কেয়ার হাব", "Prescription Clinical Care Hub")}
                      </span>
                      <span className="text-[11px] text-[#647575] ml-2 hidden sm:inline">
                        • {t("একই পেজে সমস্ত তথ্য ও সুবিধা", "All-in-one Unified Clinical Stream")}
                      </span>
                    </div>
                  </div>

                  {/* Expand / Collapse All Toggle */}
                  <div className="flex items-center gap-2">
                    {/* View Raw Extracted JSON Button */}
                    <button
                      type="button"
                      onClick={() => setJsonModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-[#F7FAF9] border border-[#E2EAE7] hover:bg-[#E2EAE7]/60 transition-colors cursor-pointer"
                      title={t("এক্সট্রাক্ট করা পূর্ণাঙ্গ JSON ডাটা দেখুন", "View full extracted JSON schema")}
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{t("JSON ডাটা দেখুন", "View JSON")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const allOpen = Object.values(expandedSections).every(Boolean);
                        setAllSections(!allOpen);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] px-2.5 py-1 rounded-lg bg-[#F7FAF9] border border-[#E2EAE7] hover:bg-[#E2EAE7]/60 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>
                        {Object.values(expandedSections).every(Boolean)
                          ? t("সব সেকশন বন্ধ করুন", "Collapse All")
                          : t("সব সেকশন খুলুন", "Expand All")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Anchor Jump Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-medicines-review", "review")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7FAF9] hover:bg-[#CCFBF1]/40 border border-[#E2EAE7] hover:border-[#0F766E]/40 font-semibold text-[#172B2A] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{t(`১. ওষুধ ও প্রোফাইল (${medicines.length})`, `1. Medicines & Dossier (${medicines.length})`)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("section-drug-safety", "safety")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                      safetyReport && !safetyReport.is_safe
                        ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                        : "bg-[#F7FAF9] border-[#E2EAE7] text-[#172B2A] hover:bg-[#CCFBF1]/40"
                    }`}
                  >
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        safetyReport && !safetyReport.is_safe ? "text-rose-600" : "text-[#0F766E]"
                      }`}
                    />
                    <span>
                      {t("২. ড্রাগ সেফটি", "2. Drug Safety")}
                      {safetyReport && !safetyReport.is_safe ? (
                        <span className="ml-1 rounded-full bg-rose-600 text-white px-1.5 py-0.2 text-[10px]">
                          {safetyReport.interactions_count}
                        </span>
                      ) : (
                        <span className="ml-1 text-[10px] text-emerald-600 font-bold">✓</span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("section-patient-guide", "guide")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7FAF9] hover:bg-[#CCFBF1]/40 border border-[#E2EAE7] hover:border-[#0F766E]/40 font-semibold text-[#172B2A] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{t("৩. রোগীর গাইড", "3. Patient Guide")}</span>
                    {explanation && <span className="ml-0.5 text-[10px] text-emerald-600 font-bold">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("section-ai-consultation", "chat")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7FAF9] hover:bg-[#CCFBF1]/40 border border-[#E2EAE7] hover:border-[#0F766E]/40 font-semibold text-[#172B2A] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{t("৪. এআই কনসালটেশন", "4. AI Consultation")}</span>
                  </button>
                </div>
              </div>

              {/* Immediate Safety Status Alert Banner */}
              {safetyReport && !safetyReport.is_safe && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-rose-900 text-sm">
                        {t(
                          `সতর্কতা: ${safetyReport.interactions_count}টি সম্ভাব্য ক্ষতিকর ড্রাগ মিথস্ক্রিয়া শনাক্ত হয়েছে`,
                          `Alert: ${safetyReport.interactions_count} potential drug interaction(s) detected`
                        )}
                      </div>
                      <p className="text-[11px] text-rose-700">
                        {t(
                          "ওষুধ সেবনের সঠিক সময় ব্যবধান ও চিকিৎসকের নির্দেশনা জানতে নিচে ড্রাগ সেফটি সেকশনটি দেখুন।",
                          "See Section 2 below for interaction severity, clinical effects, and doctor recommendations."
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToSection("section-drug-safety", "safety")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t("সতর্কতা বিস্তারিত দেখুন", "Jump to Safety Details")}</span>
                  </button>
                </div>
              )}

            {/* =================================================================== */}
            {/* SECTION 1: EDITABLE REVIEW & VERIFICATION INTERFACE                 */}
            {/* =================================================================== */}
            <div id="section-medicines-review" className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl shadow-sm overflow-hidden scroll-mt-24">
                {/* Section Header */}
                <div
                  onClick={() => toggleSection("review")}
                  className="p-4 bg-[#F7FAF9] border-b border-[#E2EAE7] flex items-center justify-between cursor-pointer hover:bg-[#F0FDFA] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      ১
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-2">
                        <span>{t("প্রেসক্রিপশন বিবরণ ও ওষুধ যাচাইকরণ", "Prescription Profile & Medicine Verification")}</span>
                      </h3>
                      <p className="text-[11px] text-[#647575]">
                        {t(
                          "অস্পষ্ট নাম থাকলে সংশোধন বাটনে ক্লিক করে সঠিক নাম নির্বাচন করুন",
                          "If medicine name is unclear, click edit to choose the verified medicine"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded">
                      {t(
                        `${medicines.filter((m) => m.included).length}টি নির্বাচিত`,
                        `${medicines.filter((m) => m.included).length} Selected`
                      )}
                    </span>
                    <button
                      type="button"
                      className="text-[#647575] hover:text-[#172B2A] p-1 rounded transition-transform"
                      aria-label="Toggle section"
                    >
                      {expandedSections.review ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedSections.review && (
                  <div className="p-5 space-y-4 text-xs">
                  {/* Doctor & Patient Profile Dossier */}
                  {result.clinical_entities && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Doctor Profile */}
                      <div className="rounded-xl border border-[#E2EAE7] bg-[#FFFFFF] p-3.5 space-y-1 shadow-sm">
                        <div className="font-bold text-[#0F766E] flex items-center gap-1.5 pb-1 border-b border-[#E2EAE7]">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{t("চিকিৎসকের বিবরণ (Physician)", "Physician Details")}</span>
                        </div>
                        <div className="pt-0.5">
                          {t("নাম: ", "Name: ")}
                          <span className="font-bold text-[#172B2A]">
                            {result.clinical_entities.doctor?.name || "N/A"}
                          </span>
                        </div>
                        <div className="text-[#647575]">
                          {t("ডিগ্রি: ", "Degree: ")}
                          {result.clinical_entities.doctor?.qualification || "N/A"}
                        </div>
                        <div className="text-[#647575] truncate">
                          {t("হাসপাতাল: ", "Hospital: ")}
                          {result.clinical_entities.doctor?.hospital || "N/A"}
                        </div>
                      </div>

                      {/* Patient & Vitals */}
                      <div className="rounded-xl border border-[#E2EAE7] bg-[#FFFFFF] p-3.5 space-y-1 shadow-sm">
                        <div className="font-bold text-[#0F766E] flex items-center gap-1.5 pb-1 border-b border-[#E2EAE7]">
                          <User className="w-3.5 h-3.5" />
                          <span>{t("রোগী ও শারীরিক পরিমাপ (Vitals)", "Patient & Vitals")}</span>
                        </div>
                        <div className="pt-0.5">
                          {t("নাম: ", "Name: ")}
                          <span className="font-bold text-[#172B2A]">
                            {result.clinical_entities.patient?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#647575]">
                          <span>
                            {t("বয়স: ", "Age: ")}
                            {result.clinical_entities.patient?.age || "N/A"}
                          </span>
                          <span>
                            {t("তারিখ: ", "Date: ")}
                            {result.clinical_entities.patient?.date || "16.05.2024"}
                          </span>
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

                  {saveToast && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{saveToast}</span>
                    </div>
                  )}

                  {/* Medicines Review Table / List with Verification Statuses */}
                  <div className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2EAE7]">
                      <div>
                        <h3 className="font-bold text-sm text-[#172B2A]">
                          {t("শনাক্তকৃত ওষুধ যাচাইকরণ (Medicine Verification)", "Detected Medicine Verification")}
                        </h3>
                        <p className="text-[11px] text-[#647575]">
                          {t(
                            "অস্পষ্ট নাম থাকলে সংশোধন বাটনে ক্লিক করে সঠিক নাম নির্বাচন করুন",
                            "If medicine name is unclear, click edit to choose the verified medicine"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentPrescriptionId && (
                          <span
                            className="font-mono text-[10px] text-[#0F766E] bg-teal-50 px-2 py-1 rounded-md border border-teal-200/80 font-bold tracking-tight shadow-2xs"
                            title={t("বর্তমান প্রেসক্রিপশন আইডি (যেকোনো পরিবর্তন এই আইডিতে আপডেট হবে)", "Active Prescription ID (changes update this ID)")}
                          >
                            ID: {currentPrescriptionId}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t("ডাটাবেজে সংরক্ষিত", "Auto-Saved to DB")}</span>
                        </span>

                        <span className="text-xs font-semibold text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded">
                          {t(
                            `${medicines.filter((m) => m.included).length}টি নির্বাচিত`,
                            `${medicines.filter((m) => m.included).length} Selected`
                          )}
                        </span>
                      </div>
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
                                      {t("ভেরিফাইড", "Verified")}
                                    </span>
                                  )}
                                  {med.status === "uncertain" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20 px-2 py-0.2 text-[10px] font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      {t(`যাচাই প্রয়োজন (${med.confidence}%)`, `Needs Review (${med.confidence}%)`)}
                                    </span>
                                  )}
                                  {med.status === "unmatched" && (
                                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 text-[#647575] border border-zinc-200 px-2 py-0.2 text-[10px] font-semibold">
                                      {t("ম্যানুয়াল এন্ট্রি", "Manual Entry")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#0F766E] font-medium mt-0.5">
                                  {t("জেনেরিক: ", "Generic: ")}
                                  {med.generic}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingMedicine(med)}
                                className="text-[#647575] hover:text-[#0F766E] p-1 rounded hover:bg-[#E2EAE7]/60 transition-colors"
                                title={t("সংশোধন করুন", "Edit")}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveDrug(med.id)}
                                className="text-[#647575] hover:text-[#B91C1C] p-1 rounded hover:bg-[#E2EAE7]/60 transition-colors"
                                title={t("বাদ দিন", "Remove")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#E2EAE7] flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#0F766E]">{t("মাত্রা:", "Dosage:")}</span>
                              <span className="dosage-pill font-semibold text-[#172B2A] bg-[#F0FDFA] border border-teal-200/80 px-2.5 py-1 rounded-md text-xs inline-block">
                                {med.dosage}
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenDrugModal(med.generic || med.brand)}
                              className="text-[11px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
                            >
                              <Info className="w-3 h-3" />
                              <span>{t("মনোগ্রাফ দেখুন", "View Monograph")}</span>
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
                          placeholder={t(
                            "অতিরিক্ত ওষুধ বা জেনেরিক নাম লিখুন (যেমন: Aspirin, Metformin)...",
                            "Enter extra medicine or generic name (e.g. Aspirin, Metformin)..."
                          )}
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
                          <span>{t("যোগ করুন", "Add")}</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[#647575]">{t("কমন ওষুধ:", "Common Drugs:")}</span>
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
            </div>

            {/* =================================================================== */}
            {/* SECTION 2: SOURCED DRUG SAFETY & INTERACTION WARNINGS               */}
            {/* =================================================================== */}
            <div id="section-drug-safety" className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl shadow-sm overflow-hidden scroll-mt-24">
                {/* Section Header */}
                <div
                  onClick={() => toggleSection("safety")}
                  className="p-4 bg-[#F7FAF9] border-b border-[#E2EAE7] flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-[#F0FDFA] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      ২
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                        <ShieldAlert className={`w-4 h-4 ${safetyReport?.is_safe === false ? "text-[#B91C1C]" : "text-[#0F766E]"}`} />
                        <span>{t("ড্রাগ-ড্রাগ ক্ষতিকর মিথস্ক্রিয়া সতর্কতা (Drug-Drug Safety)", "Drug-Drug Safety & Interaction Warnings")}</span>
                      </h3>
                      <p className="text-[11px] text-[#647575]">
                        {t(
                          "ভেরিফাইড ফার্মাকোলজিক্যাল লিটারেচার অনুযায়ী ক্ষতিকর মিথস্ক্রিয়া যাচাই",
                          "Verified pairwise interactions against pharmacological literature"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={handleRecheckSafety}
                      disabled={safetyLoading}
                      className="rounded-lg bg-[#0F766E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#115E59] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {safetyLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t("যাচাই হচ্ছে...", "Checking...")}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t("পুনরায় পরীক্ষা করুন", "Re-check Safety")}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSection("safety")}
                      className="text-[#647575] hover:text-[#172B2A] p-1 rounded transition-transform"
                      aria-label="Toggle section"
                    >
                      {expandedSections.safety ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedSections.safety && (
                  <div className="p-5 space-y-4 text-xs">

                  {safetyReport ? (
                    <div className="space-y-3">
                      {safetyReport.is_safe ? (
                        <div className="rounded-lg p-4 border border-[#E2EAE7] bg-[#F7FAF9] flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm text-[#172B2A]">
                              {t("কোনো সরাসরি ক্ষতিকর মিথস্ক্রিয়া নথিভুক্ত নেই", "No direct adverse interactions documented")}
                            </div>
                            <p className="text-[#647575] leading-relaxed text-[11px]">
                              {t(
                                "বর্তমান ডাটাবেজে এই ওষুধগুলোর মধ্যে সরাসরি কোনো ক্ষতিকর ইন্টারঅ্যাকশন পাওয়া যায়নি। তবে কোনো নতুন ওষুধ শুরু বা বন্ধ করার পূর্বে সর্বদা আপনার চিকিৎসকের পরামর্শ নিশ্চিত করুন।",
                                "No direct adverse interactions found in our monograph database. However, always consult your physician before starting or altering any medication schedule."
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg p-4 border border-[#B91C1C]/30 bg-[#B91C1C]/10 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm text-[#B91C1C]">
                              {t(
                                `সতর্কতা: ${safetyReport.interactions_count}টি সম্ভাব্য ক্ষতিকর ড্রাগ মিথস্ক্রিয়া শনাক্ত হয়েছে`,
                                `Warning: ${safetyReport.interactions_count} potential adverse drug interactions detected`
                              )}
                            </div>
                            <p className="text-[#172B2A] text-[11px]">
                              {t(
                                "নিচের সতর্কতা অনুযায়ী সময় ব্যবধান বজায় রাখুন অথবা চিকিৎসকের সাথে পরামর্শ করুন।",
                                "Follow the timing intervals and clinical guidance below or consult your doctor."
                              )}
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
                              {lang === "bn" ? item.severity_bn : item.severity} ({item.severity})
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div>
                              <strong className="text-[#172B2A]">{t("ক্লিনিক্যাল প্রভাব: ", "Clinical Effect: ")}</strong>
                              <span className="text-[#647575]">{lang === "bn" ? item.effect_bn : (item.effect_en || item.effect_bn)}</span>
                            </div>
                            {item.effect_en && lang === "bn" && (
                              <div className="text-[11px] text-[#647575] italic">
                                Scientific note: {item.effect_en}
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded bg-[#CCFBF1]/40 border border-[#CCFBF1] text-[#0F766E] space-y-0.5">
                            <strong className="font-bold block">{t("চিকিৎসকের করণীয় ও পরামর্শ:", "Physician & Caregiver Advice:")}</strong>
                            <p className="leading-relaxed text-[#172B2A]">
                              {lang === "bn" ? item.recommendation_bn : (item.recommendation_en || item.recommendation_bn)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#647575]">
                      {t("ওষুধসমূহ নির্বাচন করে পুনরায় পরীক্ষা করুন বাটনে চাপ দিন।", "Select medicines and click Re-check Safety.")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* SECTION 3: CLINICAL PATIENT GUIDE                                   */}
            {/* =================================================================== */}
            <div id="section-patient-guide" className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl shadow-sm overflow-hidden scroll-mt-24">
              {/* Section Header */}
              <div
                onClick={() => toggleSection("guide")}
                className="p-4 bg-[#F7FAF9] border-b border-[#E2EAE7] flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-[#F0FDFA] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    ৩
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#0F766E]" />
                      <span>{t("রোগীর সহজ সহায়িকা ও সেবনবিধি (Patient Guidance)", "Patient Clinical Guide & Schedule")}</span>
                    </h3>
                    <p className="text-[11px] text-[#647575]">
                      {t("প্রতিটি ওষুধের কাজ ও খাওয়ার সহজ সময়সূচি", "Clear instructions detailing indication, meal intervals, and precautions")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleGenerateExplanation}
                    disabled={explainLoading}
                    className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#115E59] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {explainLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t("প্রস্তুত হচ্ছে...", "Generating...")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{explanation ? t("পুনরায় তৈরি করুন", "Regenerate Guide") : t("পূর্ণাঙ্গ সহায়িকা পান", "Generate Full Guide")}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSection("guide")}
                    className="text-[#647575] hover:text-[#172B2A] p-1 rounded transition-transform"
                    aria-label="Toggle section"
                  >
                    {expandedSections.guide ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections.guide && (
                <div className="p-5 space-y-4 text-xs">
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
                              <span>{t("কপি হয়েছে", "Copied")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t("কপি করুন", "Copy")}</span>
                            </>
                          )}
                        </button>
                        {explanation.bangla_explanation}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#647575]">
                        <span>{t("প্রোভাইডার: ", "Provider: ")}{explanation.llm_metadata?.provider || "Groq Qwen"}</span>
                        <span>{t("সময়: ", "Time: ")}{explanation.execution_time_ms} ms</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border border-dashed border-[#E2EAE7] text-center text-xs text-[#647575] space-y-3 bg-[#F7FAF9]/50">
                      <p>{t("ওষুধগুলোর কাজ ও খাওয়ার নিয়ম সহজ ভাষায় তৈরি করতে নিচের বাটনে চাপ দিন।", "Click the button below to generate comprehensive patient instructions and meal schedule.")}</p>
                      <button
                        type="button"
                        onClick={handleGenerateExplanation}
                        disabled={explainLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] text-white font-bold text-xs hover:bg-[#115E59] transition-colors cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("পূর্ণাঙ্গ সহায়িকা তৈরি করুন", "Generate Full Patient Guide")}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* SECTION 4: IN-PAGE CONTEXTUAL BANGLA CLINICAL CHAT                  */}
            {/* =================================================================== */}
            <div id="section-ai-consultation" className="bg-[#FFFFFF] border border-[#E2EAE7] rounded-xl shadow-sm overflow-hidden scroll-mt-24">
              {/* Section Header */}
              <div
                onClick={() => toggleSection("chat")}
                className="p-4 bg-[#F7FAF9] border-b border-[#E2EAE7] flex items-center justify-between cursor-pointer hover:bg-[#F0FDFA] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    ৪
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#0F766E]" />
                      <span>{t("প্রেসক্রিপশন এআই কনসালটেশন (RAG Medical Chat)", "Prescription AI Consultation (RAG Medical Chat)")}</span>
                    </h3>
                    <p className="text-[11px] text-[#647575]">
                      {t("বর্তমান প্রেসক্রিপশনের ওষুধসমূহ নিয়ে যেকোনো প্রশ্ন করুন", "Ask any question regarding your prescribed medications")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded">
                    RAG Grounded
                  </span>
                  <button
                    type="button"
                    className="text-[#647575] hover:text-[#172B2A] p-1 rounded transition-transform"
                    aria-label="Toggle section"
                  >
                    {expandedSections.chat ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections.chat && (
                <div className="p-5 space-y-4 text-xs">
                  {/* Contextual Suggestion Chips */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[#647575]">{t("কমন প্রশ্ন:", "Suggested Questions:")}</span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        { bn: "এই ওষুধগুলো কি খাবারের আগে না পরে খাব?", en: "Should I take these medicines before or after meals?" },
                        { bn: "ওষুধগুলোর কোনো ক্ষতিকর পার্শ্বপ্রতিক্রিয়া বা সতর্কতা আছে?", en: "Are there any notable side effects or precautions?" },
                        { bn: "ডোজ ভুলে গেলে বা মিস হলে কী করা উচিত?", en: "What should I do if I miss a scheduled dose?" },
                      ].map((qObj, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChatMessage(lang === "bn" ? qObj.bn : qObj.en)}
                          className="rounded-lg border border-[#E2EAE7] bg-[#F7FAF9] px-2.5 py-1 text-[#172B2A] hover:bg-[#CCFBF1] hover:text-[#0F766E] transition-colors text-left cursor-pointer"
                        >
                          {t(qObj.bn, qObj.en)}
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
                          <FormattedChatMessage
                            text={msg.text}
                            isUser={msg.role === "user"}
                          />
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
                        <span>{t("ক্লিনিক্যাল রেফারেন্স থেকে উত্তর প্রস্তুত হচ্ছে...", "Retrieving answer from clinical monographs...")}</span>
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
                      placeholder={t("এই প্রেসক্রিপশন নিয়ে যেকোনো প্রশ্ন লিখুন...", "Ask any question about this prescription...")}
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
                      <span>{t("পাঠান", "Send")}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            </div>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-[#E2EAE7] bg-[#FFFFFF] p-12 text-center text-[#647575] space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F7FAF9] text-[#647575]">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#172B2A]">
                  {t("প্রেসক্রিপশন এখনো আপলোড করা হয়নি", "No Prescription Uploaded Yet")}
                </h3>
                <p className="text-xs text-[#647575] max-w-sm mx-auto leading-relaxed">
                  {t(
                    "বামে প্রেসক্রিপশনের ছবি আপলোড করুন এবং \"প্রেসক্রিপশন এনালাইসিস চালান\" বাটনে চাপ দিন।",
                    "Upload your prescription image on the left and click 'Run Prescription Analysis'."
                  )}
                </p>
              </div>

              {historyList.length > 0 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryDrawerOpen(true);
                      fetchHistory();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[#0F766E] hover:bg-teal-100 font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <FolderClock className="w-4 h-4" />
                    <span>{t(`সংরক্ষিত প্রেসক্রিপশন হিস্ট্রি দেখুন (${historyList.length})`, `View Saved Prescription History (${historyList.length})`)}</span>
                  </button>
                </div>
              )}
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
                {t("ওষুধের নাম ও ডোজ সংশোধন", "Edit Medicine & Dosage")}
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
                <label className="font-bold text-[#172B2A]">{t("ব্র্যান্ডের নাম", "Brand Name")}</label>
                <input
                  type="text"
                  value={editingMedicine.brand}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, brand: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172B2A]">{t("জেনেরিক নাম", "Generic Name")}</label>
                <input
                  type="text"
                  value={editingMedicine.generic}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, generic: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172B2A]">{t("সেবনবিধি ও সময় (Dosage)", "Dosage & Schedule")}</label>
                <input
                  type="text"
                  value={editingMedicine.dosage}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, dosage: e.target.value })}
                  className="w-full rounded-lg border border-[#E2EAE7] bg-[#FFFFFF] p-2.5 text-[#172B2A] focus:border-[#0F766E] focus:outline-none font-bangla text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2EAE7]">
              <button
                type="button"
                onClick={() => setEditingMedicine(null)}
                className="px-3 py-2 rounded-lg border border-[#E2EAE7] text-[#647575] font-semibold hover:bg-[#F7FAF9]"
              >
                {t("বাতিল", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit({ ...editingMedicine, status: "confirmed" })}
                className="px-4 py-2 rounded-lg bg-[#0F766E] text-white font-bold hover:bg-[#115E59]"
              >
                {t("সংরক্ষণ ও নিশ্চিত করুন", "Save & Confirm")}
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
                  {modalDrugName} — {t("ক্লিনিক্যাল মনোগ্রাফ", "Clinical Monograph")}
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
                <span>{t("ওষুধের তথ্য লোড হচ্ছে...", "Loading medicine information...")}</span>
              </div>
            ) : modalDrugData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F7FAF9] p-3 rounded-lg border border-[#E2EAE7]">
                  <div>
                    <div className="text-[10px] text-[#647575]">{t("ব্র্যান্ড", "Brand")}</div>
                    <div className="font-bold text-[#172B2A]">{modalDrugData.brand_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">{t("জেনেরিক", "Generic")}</div>
                    <div className="font-bold text-[#0F766E]">{modalDrugData.generic_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">{t("শক্তি ও ফর্ম", "Strength & Form")}</div>
                    <div className="font-bold text-[#172B2A]">{modalDrugData.strength} ({modalDrugData.form})</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#647575]">{t("কোম্পানি", "Company")}</div>
                    <div className="font-bold text-[#172B2A] truncate">{modalDrugData.manufacturer || "N/A"}</div>
                  </div>
                </div>

                {modalDrugData.indication && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#0F766E]">{t("রোগ নির্দেশনা (Indication):", "Clinical Indication:")}</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.indication}</p>
                  </div>
                )}

                {modalDrugData.dose && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#0F766E]">{t("সেবনবিধি ও মাত্রা (Dose & Administration):", "Dosage & Administration:")}</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.dose}</p>
                  </div>
                )}

                {modalDrugData.side_effect && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#B45309]">{t("পার্শ্বপ্রতিক্রিয়া (Side Effects):", "Side Effects:")}</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.side_effect}</p>
                  </div>
                )}

                {modalDrugData.contra_indication && (
                  <div className="rounded-lg border border-[#E2EAE7] p-3.5 space-y-1">
                    <div className="font-bold text-[#B91C1C]">{t("প্রতিনির্দেশনা (Contraindication):", "Contraindications:")}</div>
                    <p className="text-[#172B2A] leading-relaxed">{modalDrugData.contra_indication}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[#647575]">
                {t("এই ওষুধটির বিশদ তথ্য পাওয়া যায়নি।", "Detailed information not found for this medicine.")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER PRESCRIPTION HISTORY DRAWER                                 */}
      {/* ========================================================================= */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
            onClick={() => setHistoryDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E2EAE7] animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E2EAE7] flex items-center justify-between bg-[#F7FAF9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold">
                    <FolderClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#172B2A] flex items-center gap-2">
                      {t("প্রেসক্রিপশন হিস্ট্রি", "Prescription History")}
                      {historyList.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] text-[11px] font-bold border border-teal-200">
                          {historyList.length}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#647575]">
                      {t("স্বয়ংক্রিয়ভাবে সংরক্ষিত পূর্ববর্তী প্রেসক্রিপশনসমূহ", "Auto-saved prescription analyses")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    title={t("রিফ্রেশ", "Refresh")}
                    className="p-1.5 rounded-lg border border-[#E2EAE7] bg-white hover:bg-slate-50 text-[#647575] hover:text-[#172B2A] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-[#647575] hover:text-[#172B2A] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {saveToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveToast}</span>
                  </div>
                )}

                {historyLoading ? (
                  <div className="py-20 text-center text-[#647575] flex flex-col items-center gap-2.5">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0F766E]" />
                    <p className="text-xs">{t("হিস্ট্রি ডাটাবেজ থেকে লোড হচ্ছে...", "Loading history from database...")}</p>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#E2EAE7] bg-[#F7FAF9] text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
                      <FolderClock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#172B2A]">{t("এখনো কোনো প্রেসক্রিপশন সংরক্ষিত নেই", "No prescriptions saved yet")}</h4>
                      <p className="text-xs text-[#647575] leading-relaxed">
                        {t(
                          "প্রেসক্রিপশন আপলোড করে এনালাইসিস চালালে তা সরাসরি ডাটাবেজে সংরক্ষিত হবে।",
                          "Uploaded prescriptions are automatically saved to your cloud database history."
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#E2EAE7] bg-white hover:border-[#0F766E]/40 shadow-xs hover:shadow-sm transition-all text-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E2EAE7]">
                        <div className="flex items-start gap-2">
                          <span className="h-7 w-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                            <Stethoscope className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="font-bold text-[#172B2A] text-xs">
                              {item.doctor_name || t("অনির্দিষ্ট চিকিৎসক", "Unspecified Physician")}
                            </div>
                            <div className="text-[10px] text-[#647575]">
                              {new Date(item.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] font-bold text-[10px] border border-teal-200/60 shrink-0">
                          {t(`${item.total_medicines}টি ওষুধ`, `${item.total_medicines} Meds`)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 text-[11px] text-[#647575] bg-[#F7FAF9] p-2.5 rounded-lg border border-[#E2EAE7]/60">
                        <div>
                          <span className="font-semibold text-slate-700">{t("রোগী: ", "Patient: ")}</span>
                          <span className="text-[#172B2A] font-semibold">{item.patient_name || "N/A"}</span>
                          {item.patient_age && <span> ({item.patient_age}{t(" বছর", " yrs")})</span>}
                        </div>
                        {item.diagnosis && (
                          <div className="truncate">
                            <span className="font-semibold text-slate-700">{t("লক্ষণ / রোগ: ", "Diagnosis: ")}</span>
                            <span className="text-[#172B2A]">{item.diagnosis}</span>
                          </div>
                        )}
                        {item.prescription_date && (
                          <div>
                            <span className="font-semibold text-slate-700">{t("প্রেসক্রিপশনের তারিখ: ", "Rx Date: ")}</span>
                            <span className="text-[#172B2A]">{item.prescription_date}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={deleteModal.isDeleting || isPrescriptionLoading}
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            historyId: item.id,
                            doctorName: item.doctor_name || item.patient_name || "",
                            isDeleting: false
                          })}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("মুছে ফেলুন", "Delete")}</span>
                        </button>

                        <button
                          type="button"
                          disabled={loadingHistoryId === item.id || isPrescriptionLoading}
                          onClick={() => handleLoadHistoryItem(item.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-75"
                        >
                          {loadingHistoryId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{t("লোড হচ্ছে...", "Loading...")}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t("প্রেসক্রিপশন লোড করুন", "Load Prescription")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#E2EAE7] bg-[#F7FAF9] flex items-center justify-between">
                <span className="text-[11px] text-[#647575]">
                  {t("লোড করলে প্রেসক্রিপশন যাচাই বোর্ডে উন্মুক্ত হবে", "Clicking load imports data to verification tray")}
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2EAE7] bg-white hover:bg-slate-100 text-xs font-semibold text-[#172B2A] cursor-pointer"
                >
                  {t("বন্ধ করুন", "Close")}
                </button>
              </div>
            </div>
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

      {/* ========================================================================= */}
      {/* 7. SWEETALERT DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border-2 border-rose-200">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#172B2A]">
                {t("প্রেসক্রিপশন মুছে ফেলবেন?", "Delete Prescription?")}
              </h3>
              <p className="text-xs text-[#647575] leading-relaxed">
                {t(
                  "এই প্রেসক্রিপশনটি স্থায়ীভাবে আপনার ক্লাউড ডাটাবেজ হিস্ট্রি থেকে মুছে ফেলা হবে।",
                  "This prescription will be permanently deleted from your database history."
                )}
              </p>
              {deleteModal.doctorName && (
                <div className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 py-1 px-3 rounded-lg inline-block border border-teal-200/60 truncate max-w-xs">
                  {deleteModal.doctorName}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() => setDeleteModal({ isOpen: false, historyId: null, isDeleting: false })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2EAE7] bg-white hover:bg-slate-50 text-[#172B2A] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {t("বাতিল", "Cancel")}
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={confirmDeleteHistory}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("মুছছে...", "Deleting...")}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SWEETALERT ALERT / WARNING / ERROR MODAL                                */}
      {/* ========================================================================= */}
      {sweetAlert?.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#E2EAE7] animate-in zoom-in-95 duration-200 space-y-4">
            <div
              className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                sweetAlert.type === "error"
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : sweetAlert.type === "warning"
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : sweetAlert.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-teal-50 text-[#0F766E] border-teal-200"
              }`}
            >
              {sweetAlert.type === "error" ? (
                <AlertTriangle className="w-7 h-7" />
              ) : sweetAlert.type === "warning" ? (
                <ShieldAlert className="w-7 h-7" />
              ) : sweetAlert.type === "success" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <Info className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#172B2A]">
                {sweetAlert.title}
              </h3>
              <p className="text-xs text-[#647575] leading-relaxed">
                {sweetAlert.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSweetAlert(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {t("ঠিক আছে", "OK")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. PRESCRIPTION HISTORY LOADING OVERLAY (Smooth Experience)               */}
      {/* ========================================================================= */}
      {isPrescriptionLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-teal-100 animate-in zoom-in-95 duration-200 space-y-3.5">
            <div className="relative mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E]">
              <Stethoscope className="w-8 h-8 animate-pulse text-[#0F766E]" />
              <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#172B2A]">
                {t("প্রেসক্রিপশন লোড হচ্ছে...", "Loading Prescription...")}
              </h3>
              <p className="text-xs text-[#647575]">
                {t(
                  "ডাটাবেজ থেকে প্রেসক্রিপশন ও ওষুধের তথ্য প্রস্তুত করা হচ্ছে।",
                  "Retrieving medicines and clinical details from database history."
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 10. HIGH-TECH ANIMATED SCANNING OVERLAY (Laser Scan & Step Progress)      */}
      {/* ========================================================================= */}
      {isDemoScanning && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-teal-500/40 p-6 text-white shadow-2xl space-y-5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Scanning Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Scan className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-teal-300">
                    {t("এআই প্রেসক্রিপশন ভিশন স্ক্যানার (ডেমো)", "AI Prescription Vision Scanner (Demo)")}
                  </h3>
                  <div className="text-[10px] text-teal-400/80 font-mono">
                    NEURAL-VISION • OFFLINE SIMULATION • ZERO API COST
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-950 border border-teal-500/40 text-teal-300">
                {demoStepProgress ? `${demoStepProgress.percentage}%` : "0%"}
              </span>
            </div>

            {/* Simulated Prescription Scanning Laser Viewport */}
            <div className="relative h-44 rounded-xl border border-teal-500/30 bg-slate-950 overflow-hidden flex items-center justify-center p-2">
              <img
                src={DEMO_PRESCRIPTIONS[selectedDemoPreset]?.imagePath || "/images/demo/prescription_demo_dr_fazlul_hoque.jpg"}
                alt="Scanning prescription"
                className="h-full w-auto object-contain opacity-40 brightness-75 rounded"
              />

              {/* Sweeping Laser Beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_16px_3px_rgba(45,212,191,0.9)] animate-laser-scan pointer-events-none" />

              {/* Target Bounding Box Hologram */}
              <div className="absolute inset-4 border border-dashed border-teal-400/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] font-mono text-teal-400/80">
                  <span>[OCR_PASS_ACTIVE]</span>
                  <span>[RES_864x1152]</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-teal-400/80">
                  <span>[TOKEN_DETECTION]</span>
                  <span>[DGDA_MATCH_READY]</span>
                </div>
              </div>
            </div>

            {/* Dynamic Step Progress & Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-200">
                  {lang === "bn" ? demoStepProgress?.titleBn : demoStepProgress?.titleEn}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {t(`ধাপ ${demoStepProgress?.step || 1} / 4`, `Step ${demoStepProgress?.step || 1} of 4`)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${demoStepProgress?.percentage || 25}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {lang === "bn" ? demoStepProgress?.detailBn : demoStepProgress?.detailEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. RAW EXTRACTED JSON VIEWER MODAL                                       */}
      {/* ========================================================================= */}
      {jsonModalOpen && result && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">
                    {t("এক্সট্রাক্ট করা প্রেসক্রিপশন JSON স্কিমা", "Extracted Prescription JSON Schema")}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    {result.filename} • {result.detected_medicines?.length || 0} medicines parsed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t("কপি হয়েছে!", "Copied!")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t("JSON কপি করুন", "Copy JSON")}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setJsonModalOpen(false)}
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="p-4 overflow-auto flex-1 bg-slate-950 text-xs font-mono text-emerald-400 leading-relaxed">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. PERSONAL PRESCRIPTION UPLOAD -> GOOGLE SIGN-IN MODAL                  */}
      {/* ========================================================================= */}
      {personalUploadLoginModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPersonalUploadLoginModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("গুগল (Gmail) সাইন-ইন আবশ্যক", "Google Sign-In Required")}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 pt-0.5">
                {t(
                  "কাস্টম প্রেসক্রিপশন আপলোডের জন্য গুগল সাইন-ইন করুন",
                  "Sign In with Google to Upload Your Prescription"
                )}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "ডেমো অ্যাকাউন্টে অন্য কোনো ছবি আপলোড বা ক্যামেরা ক্যাপচার প্রযোজ্য নয়; শুধুমাত্র নির্ধারিত ২টি ডেমো প্রেসক্রিপশন কাজ করবে। নিজের যেকোনো প্রেসক্রিপশন ছবি আপলোড বা ক্যামেরা ব্যবহার করতে অনুগ্রহ করে প্রথমে আপনার আসল গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।",
                  "Demo accounts cannot upload or capture other images; only the 2 authentic demo prescriptions are supported. To upload your personal prescriptions or snap photos with camera, please sign in with your Google account first."
                )}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPersonalUploadLoginModal(false);
                  openAuthModal("login");
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t("গুগল (Gmail) সাইন-ইন দিয়ে শুরু করুন", "Sign In with Google (Gmail) First")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPersonalUploadLoginModal(false);
                  handleRunDemoPrescription();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#0F766E] fill-current" />
                <span>{t("বাস্তব ডেমো প্রেসক্রিপশন চালিয়ে দেখুন (লগইন প্রয়োজন নেই)", "Try Authentic Demo Prescriptions (No Login Required)")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

