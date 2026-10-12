"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Scan,
  Database,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Activity,
  HeartPulse,
  Stethoscope,
  Pill,
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
  User,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Layers,
  PhoneCall,
  AlertCircle,
  HelpCircle,
  Award,
  Eye,
  FileCheck2,
  Lock,
  Info,
  Users,
  GraduationCap,
  DollarSign,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  MessageSquare,
  Bot,
  Send,
  ZoomIn,
  Edit3,
  Plus,
} from "lucide-react";
import { useLanguage } from "./context/LanguageContext";
import { HeroAnimatedSlider } from "./components/HeroAnimatedSlider";

// Sample verified medications for the 4-tab interactive workstation (Fake/Clean clinical data)
const SAMPLE_WORKSTATION_MEDS = [
  {
    id: "med-1",
    name: "Proxen 500mg",
    generic: "Naproxen",
    dosageBn: "১ + ০ + ১ (খাবারের পর)",
    dosageEn: "1 + 0 + 1 (After meals)",
    timingBn: "সকালে ও রাতে ভরা পেটে পানির সাথে",
    timingEn: "Morning & Night after meals with water",
    indicationBn: "ব্যথানাশক ও প্রদাহ বিরোধী (NSAID)",
    indicationEn: "Anti-inflammatory Analgesic (NSAID)",
    sideEffectsBn: "পেটে অস্বস্তি, বমি ভাব, এসিডিটি",
    sideEffectsEn: "Gastric upset, nausea, acidity",
    precautionBn: "খালি পেটে খাবেন না। গ্যাস্ট্রিক সুরক্ষায় ওমিপ্রাজল সাথে রাখুন।",
    precautionEn: "Do not take on empty stomach. Pair with PPI.",
    verified: true,
  },
  {
    id: "med-2",
    name: "Cardizem SR 90mg",
    generic: "Diltiazem Hydrochloride",
    dosageBn: "১ + ০ + ০ (সকালে)",
    dosageEn: "1 + 0 + 0 (Morning)",
    timingBn: "সকালে নাস্তার পর নিয়মিত একই সময়ে",
    timingEn: "Morning after breakfast consistently",
    indicationBn: "ক্যালসিয়াম চ্যানেল ব্লকার, রক্তচাপ ও হৃদস্পন্দন নিয়ন্ত্রণ",
    indicationEn: "Calcium channel blocker, antihypertensive",
    sideEffectsBn: "মাথা ঘোরা, গোড়ালি ফোলা ভাব",
    sideEffectsEn: "Dizziness, peripheral ankle swelling",
    precautionBn: "রক্তচাপ ও পালস নিয়মিত মাপুন। হঠাৎ বন্ধ করবেন না।",
    precautionEn: "Monitor blood pressure and pulse regularly.",
    verified: true,
  },
  {
    id: "med-3",
    name: "Dicaltrol 0.25mcg",
    generic: "Calcitriol",
    dosageBn: "০ + ১ + ০ (দুপুরে)",
    dosageEn: "0 + 1 + 0 (Noon)",
    timingBn: "দুপুরে খাবারের সাথে",
    timingEn: "Noon with lunch",
    indicationBn: "ভিটামিন ডি৩ এনালগ, হাড় ও ক্যালসিয়াম ভারসাম্য",
    indicationEn: "Active Vitamin D3 analog, bone health",
    sideEffectsBn: "অতিরিক্ত তৃষ্ণা বা মুখে শুষ্কতা",
    sideEffectsEn: "Dry mouth or excess thirst if overdosed",
    precautionBn: "পর্যাপ্ত পানি পান করুন। নিয়মিত ক্যালসিয়াম মাত্রা যাচাই করুন।",
    precautionEn: "Stay well hydrated. Monitor serum calcium.",
    verified: true,
  },
  {
    id: "med-4",
    name: "Zif CI",
    generic: "Carbonyl Iron + Folic Acid + Zinc",
    dosageBn: "০ + ০ + ১ (রাতে)",
    dosageEn: "0 + 0 + 1 (Night)",
    timingBn: "রাতে খাবারের পর পর্যাপ্ত পানিসহ",
    timingEn: "Night after dinner with plenty of water",
    indicationBn: "রক্তস্বল্পতা ও জিংক ঘাটতি পূরণ",
    indicationEn: "Iron deficiency anemia & zinc replenishment",
    sideEffectsBn: "পায়খানার রঙ কালচে হতে পারে (স্বাভাবিক)",
    sideEffectsEn: "Darkening of stools (clinically benign)",
    precautionBn: "দুধ বা চা-কফির সাথে খাবেন না, শোষণ কমে যায়।",
    precautionEn: "Avoid taking with milk, tea, or coffee.",
    verified: true,
  },
];

// Interactive chat presets
const SAMPLE_CHAT_PRESETS = [
  {
    id: "q-timing",
    qBn: "এই ওষুধগুলো কি খাবারের আগে না পরে খাব?",
    qEn: "Should I take these medicines before or after food?",
    aBn: "১. প্রোক্সেন (Proxen 500mg): অবশ্যই খাবারের পর ভরা পেটে সেব্য।\n২. কার্ডিজেম এসআর (Cardizem SR 90mg): সকালে নাস্তার পর সেব্য।\n৩. ডিকালট্রোল (Dicaltrol): দুপুরে খাবারের পর সেব্য।\n৪. জিফ সিআই (Zif CI): রাতে খাবারের পর পানির সাথে সেব্য। কোনো অবস্থাতেই ব্যথানাশক প্রোক্সেন খালি পেটে খাবেন না।",
    aEn: "1. Proxen 500mg: Must be taken after meals on a full stomach.\n2. Cardizem SR 90mg: Take after breakfast in the morning.\n3. Dicaltrol: Take with lunch at noon.\n4. Zif CI: Take after dinner with water at night. Never take painkiller Proxen on an empty stomach.",
  },
  {
    id: "q-effects",
    qBn: "ওষুধগুলোর কোনো ক্ষতিকর পার্শ্বপ্রতিক্রিয়া বা সতর্কতা আছে?",
    qEn: "Are there any side effects or key precautions?",
    aBn: "ক্লিনিক্যাল তথ্য অনুযায়ী:\n• প্রোক্সেন (Naproxen): পাকস্থলীতে মৃদু অস্বস্তি বা এসিডিটি হতে পারে। প্রয়োজনে সাথে ওমিপ্রাজল (Seclo) সেবন করুন।\n• কার্ডিজেম (Diltiazem): মাথা ঘোরার অনুভূতি হলে দ্রুত বসে পড়ুন এবং রক্তচাপ নিয়মিত মাপুন।\n• জিফ সিআই (Iron): পায়খানার রঙ কিছুটা কালচে হতে পারে যা সম্পূর্ণ স্বাভাবিক।",
    aEn: "Based on clinical monographs:\n• Proxen (Naproxen): May cause mild gastric discomfort. Pair with omeprazole if prone to acidity.\n• Cardizem (Diltiazem): If dizziness occurs, sit down and monitor BP.\n• Zif CI (Iron): Stool discoloration may occur, which is normal.",
  },
  {
    id: "q-missed",
    qBn: "ডোজ ভুলে গেলে বা মিস হলে কী করা উচিত?",
    qEn: "What should I do if I miss a scheduled dose?",
    aBn: "মনে পড়ার সাথে সাথেই মিসড ডোজটি গ্রহণ করুন। তবে যদি আপনার পরবর্তী নির্ধারিত ডোজের সময় কাছাকাছি হয়ে যায়, তবে মিসড ডোজটি বাদ দিন এবং স্বাভাবিক সময়ে পরবর্তী ডোজ গ্রহণ করুন। কোনো অবস্থাতেই একসাথে ডাবল ডোজ গ্রহণ করবেন না।",
    aEn: "Take the missed dose as soon as you remember. However, if it is close to your next scheduled dose, skip it and continue on schedule. Never take a double dose to make up for a missed pill.",
  },
];

const POPULAR_SEARCH_PILLS = [
  "Napa",
  "Seclo",
  "Aceclofenac",
  "Ciprofloxacin",
  "Metformin",
  "Monas",
  "Cardizem",
  "Proxen",
];

const HERO_CATEGORIES = [
  { nameBn: "পেইনকিলার ও জ্বর", nameEn: "Pain & Fever", query: "Napa" },
  { nameBn: "গ্যাস্ট্রিক ও এসিডিটি", nameEn: "Gastric & Acidity", query: "Seclo" },
  { nameBn: "অ্যান্টিবায়োটিক", nameEn: "Antibiotics", query: "Ciprofloxacin" },
  { nameBn: "উচ্চ রক্তচাপ", nameEn: "Blood Pressure", query: "Cardizem" },
  { nameBn: "ডায়াবেটিস", nameEn: "Diabetes", query: "Metformin" },
];

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  // Core 4-Tab Interactive Workstation State
  const [activeWorkstationTab, setActiveWorkstationTab] = useState<"verify" | "safety" | "chat" | "guide">("verify");
  const [selectedChatPresetId, setSelectedChatPresetId] = useState<string>("q-effects");
  const [chatCustomInput, setChatCustomInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([
    {
      sender: "bot",
      text: "নমস্কার / সালাম! প্রেসক্রিপশনটি স্ক্যান সম্পন্ন হয়েছে। সনাক্তকৃত ৪টি ওষুধ: **Proxen, Cardizem SR, Dicaltrol, Zif CI**। এই ওষুধগুলোর সেবনবিধি, সময়সূচি, ক্ষতিকর মিথস্ক্রিয়া বা খাবারের সতর্কতা সম্পর্কে যেকোনো প্রশ্ন নিচে বাংলায় লিখুন।",
      time: "12:41 AM",
    },
    {
      sender: "user",
      text: "ওষুধগুলোর কোনো ক্ষতিকর পার্শ্বপ্রতিক্রিয়া বা সতর্কতা আছে?",
      time: "12:42 AM",
    },
    {
      sender: "bot",
      text: "আপনার প্রশ্নের উত্তরে, ক্লিনিক্যাল তথ্যের ভিত্তিতে **ন্যাপ্রোক্সেন (Naproxen)**-এর সম্ভাব্য পার্শ্বপ্রতিক্রিয়া ও সতর্কতাগুলো নিচে সহজ বাংলায় তুলে ধরা হলো:\n• খালি পেটে সেবন নিষেধ (গ্যাস্ট্রিক আলসার ঝুঁকি)।\n• দীর্ঘমেয়াদী ব্যবহারে কিডনি ও রক্তচাপ নিয়মিত মনিটর করুন।\n• ডিলটিয়াজেমের সাথে ব্যবহারে রক্তচাপের তারতম্য লক্ষ্য রাখুন।",
      time: "12:42 AM",
    },
  ]);

  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(false);
  const [copiedGuidance, setCopiedGuidance] = useState<boolean>(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  // Navigate to /medicines with query
  const executeMedicineSearch = (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) {
      router.push("/medicines");
      return;
    }
    router.push(`/medicines?q=${encodeURIComponent(trimmed)}`);
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeMedicineSearch(heroSearchQuery);
  };

  // Trigger laser scan simulation
  const handleTriggerLaserScan = () => {
    setIsLaserScanning(true);
    setTimeout(() => {
      setIsLaserScanning(false);
    }, 1300);
  };

  // Handle clicking a chat question pill
  const handleSelectChatQuestion = (presetId: string) => {
    setSelectedChatPresetId(presetId);
    const preset = SAMPLE_CHAT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const userText = lang === "bn" ? preset.qBn : preset.qEn;
    const botText = lang === "bn" ? preset.aBn : preset.aEn;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: "Just now" },
      { sender: "bot", text: botText, time: "Just now" },
    ]);
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatCustomInput.trim()) return;

    const input = chatCustomInput.trim();
    setChatCustomInput("");

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: input, time: "Just now" },
      {
        sender: "bot",
        text:
          lang === "bn"
            ? `প্রদত্ত ক্লিনিক্যাল মনোগ্রাফ অনুযায়ী: "${input}" বিষয়ে আপনার ডাক্তারের পরামর্শ অনুযায়ী ওষুধ চালিয়ে যান। কোনো অস্বাভাবিক উপসর্গ দেখা দিলে তাৎক্ষণিক চিকিৎসকের সাথে যোগাযোগ করুন।`
            : `According to DGDA monographs regarding "${input}", always adhere to your prescribing doctor's clinical instructions and seek advice if symptoms change.`,
        time: "Just now",
      },
    ]);
  };

  const handleCopyGuidanceText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGuidance(true);
    setTimeout(() => setCopiedGuidance(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* ========================================================================= */}
      {/* 1. DISTINCTIVE EDITORIAL HERO SECTION WITH 4-TAB LIVE CLINICAL WORKSTATION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#FFFFFF] py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
            {/* Left Column: 55% Width with Comprehensive Information */}
            <div className="w-full lg:w-[55%] space-y-6">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-[#0F766E] border border-teal-200/70">
                <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>
                  {t(
                    "বাংলাদেশের প্রথম ভেরিফাইড ক্লিনিক্যাল এআই প্ল্যাটফর্ম",
                    "Bangladesh's First Verified Clinical AI Platform"
                  )}
                </span>
              </div>

              {/* Editorial H1 Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[44px] font-black tracking-tight text-slate-900 leading-[1.15]">
                {t("ডাক্তারের প্রেসক্রিপশন বুঝুন,", "Understand Your Prescription,")} <br />
                <span className="text-[#0F766E]">
                  {t(
                    "ওষুধের সঠিক তথ্য জানুন সহজ বাংলায়",
                    "Access Medicine Safety & Guidance Easily"
                  )}
                </span>
              </h1>

              {/* Lead Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                {t(
                  "প্রেসক্রিপশনের ছবি আপলোড করলেই এআই অস্পষ্ট হাতের লেখা পড়ে, ১৭,৫৮৯ অনুমোদিত ওষুধের জাতীয় ডিজিডিএ ডাটাবেজে যাচাই করে, ক্ষতিকর ড্রাগ মিথস্ক্রিয়া পরীক্ষা করে এবং সহজ বাংলায় চ্যাট ও রোগীর সহায়িকা প্রদান করে।",
                  "Upload any prescription photo to decode handwriting with neural vision, verify against 17,589 DGDA-approved medicines, screen drug interactions, and access grounded Bengali AI consultation."
                )}
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/checker"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer group"
                >
                  <Scan className="w-4 h-4" />
                  <span>{t("প্রেসক্রিপশন পরীক্ষা করুন", "Check Your Prescription")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/medicines"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 border border-slate-200/90 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#0F766E]" />
                  <span>{t("১৭,৫৮৯ ওষুধের ডিরেক্টরি", "17,589 Medicine Catalog")}</span>
                </Link>
              </div>

              {/* Interactive Search Box to /medicines */}
              <div className="pt-2 space-y-3 max-w-xl">
                <form onSubmit={handleHeroSearchSubmit} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder={t(
                      "ওষুধের নাম লিখে খুঁজুন (যেমন: Napa, Seclo, Cipro, Metformin)...",
                      "Search any medicine by name (e.g. Napa, Seclo, Cipro, Metformin)..."
                    )}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 focus:outline-none transition-all shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>{t("খুঁজুন", "Search")}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </form>

                {/* Popular Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#0F766E]" />
                    {t("কমন সার্চ:", "Popular:")}
                  </span>
                  {POPULAR_SEARCH_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => executeMedicineSearch(pill)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-[#0F766E] hover:border-teal-200 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Quick Disease Categories */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">
                    {t("ক্যাটাগরি:", "Categories:")}
                  </span>
                  {HERO_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => executeMedicineSearch(cat.query)}
                      className="text-[11px] text-slate-600 hover:text-[#0F766E] underline decoration-slate-300 hover:decoration-[#0F766E] transition-colors cursor-pointer mr-2"
                    >
                      {lang === "bn" ? cat.nameBn : cat.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-slate-200/80 text-left">
                <div className="min-w-0">
                  <div className="text-sm sm:text-[15px] font-extrabold text-[#0F766E] font-mono whitespace-nowrap">
                    ১৭,৫৮৯+
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                    {t("ডিজিডিএ ওষুধ তালিকা", "DGDA Catalogue")}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-[15px] font-extrabold text-[#0F766E] font-mono whitespace-nowrap">
                    ৯৮.৭%
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                    {t("ওসিআর অ্যাকুরেসি", "OCR Accuracy")}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-[15px] font-extrabold text-[#0F766E] font-mono whitespace-nowrap">
                    &lt; ০.১ ms
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                    {t("ডিটারমিনিস্টিক সেফটি", "Deterministic Safety")}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-[15px] font-extrabold text-[#15803D] font-mono whitespace-nowrap">
                    ১০০% ভেরিফাইড
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                    {t("জিরো হ্যালুসিনেশন", "Zero Hallucination")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 45% Width with Dedicated Animated Image Slider */}
            <div className="w-full lg:w-[45%]">
              <HeroAnimatedSlider />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1B. LIVE CLINICAL WORKSTATION SIMULATOR (৪-ট্যাব ইন্টারঅ্যাক্টিভ ডেমো)   */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              {t("ইন্টারেক্টিভ এআই প্রেসক্রিপশন সিমুলেটর", "Live Clinical Simulation")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("লাইভ ক্লিনিক্যাল ওয়ার্কস্টেশন ও প্রেসক্রিপশন ট্রায়াজ", "Live Clinical Workstation & Prescription Triage")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "কাগজের প্রেসক্রিপশন থেকে ওষুধের নাম উদ্ধার, ড্রাগ মিথস্ক্রিয়া সতর্কতা ও বাংলায় চ্যাট কনসালটেশনের লাইভ ৪-ট্যাব ডেমো",
                "Explore real-time handwriting recognition, pairwise drug interaction screening, and Bengali AI consultation below"
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
            {/* 4 Core Navigation Tabs matching the project engine */}
            <div className="bg-slate-50/90 border-b border-slate-200 p-2 flex flex-wrap sm:flex-nowrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveWorkstationTab("verify")}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeWorkstationTab === "verify"
                        ? "bg-white text-[#0F766E] shadow-xs border border-teal-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span className="truncate">{t("যাচাই ও ওষুধ তালিকা (4)", "Verification (4)")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkstationTab("safety")}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeWorkstationTab === "safety"
                        ? "bg-white text-[#0F766E] shadow-xs border border-teal-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="truncate">{t("ড্রাগ সেফটি", "Drug Safety")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkstationTab("chat")}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeWorkstationTab === "chat"
                        ? "bg-white text-[#0F766E] shadow-xs border border-teal-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span className="truncate">{t("বাংলা চ্যাট (Q&A)", "Bangla Chat")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkstationTab("guide")}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeWorkstationTab === "guide"
                        ? "bg-white text-[#0F766E] shadow-xs border border-teal-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{t("রোগীর সহায়িকা", "Patient Guide")}</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Bar: Prescription Preview & Scan Laser Simulator */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 flex-shrink-0">
                        <img
                          src="/images/hero_prescription_scanner.jpg"
                          alt="Prescription slip"
                          className="w-full h-full object-cover"
                        />
                        {isLaserScanning && (
                          <div className="absolute inset-0 bg-teal-400/30 animate-pulse flex items-center justify-center">
                            <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_cyan]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                          <span>prescription_slip_102.jpg</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t("স্ক্যান সম্পন্ন • ৪টি ওষুধ ভেরিফাইড", "Decoded • 4 Medicines Grounded")}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerLaserScan}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>{t("প্রেসক্রিপশন এনালাইসিস চালান", "Run Prescription Analysis")}</span>
                    </button>
                  </div>

                  {/* ================================================================= */}
                  {/* TAB 1: MEDICINE VERIFICATION (যাচাই ও ওষুধ তালিকা)               */}
                  {/* ================================================================= */}
                  {activeWorkstationTab === "verify" && (
                    <div className="space-y-3.5 text-xs">
                      {/* Physician & Patient Dossier Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-[#0F766E]">
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{t("চিকিৎসকের বিবরণ (Physician)", "Physician Dossier")}</span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-medium">
                            ডাঃ মোঃ ফজলুল হক | MBBS, FCPS
                          </div>
                          <div className="text-[10px] text-slate-500">সিএমএইচ, ঢাকা | BMDC Reg: 28491</div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-[#0F766E]">
                            <User className="w-3.5 h-3.5" />
                            <span>{t("রোগী ও শারীরিক পরিমাপ (Vitals)", "Patient & Vitals")}</span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-medium">
                            মাহাদী হাসান, ২৯ বছর
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            BP: 160/90 mmHg | Wt: 57 kg
                          </div>
                        </div>
                      </div>

                      {/* Verified Drug List (4 Items) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
                          <span>{t("সনাক্তকৃত ওষুধ যাচাইকরণ (৪টি নির্বাচিত)", "Decoded Medications (4 Verified)")}</span>
                          <span className="text-[#0F766E] font-mono">DGDA Approved</span>
                        </div>

                        {SAMPLE_WORKSTATION_MEDS.map((med, mIdx) => (
                          <div
                            key={med.id}
                            className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-[#0F766E] transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </span>
                                <span className="font-bold text-slate-900 text-xs">{med.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#15803D] border border-emerald-200">
                                  {t("ভেরিফাইড", "Verified")}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {t("জেনেরিক:", "Generic:")}{" "}
                                <span className="text-slate-800 font-medium">{med.generic}</span>
                              </div>
                              <div className="text-[11px] text-[#0F766E] font-semibold">
                                {t("মাত্রা:", "Dosage:")} {lang === "bn" ? med.dosageBn : med.dosageEn}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => executeMedicineSearch(med.generic || med.name.split(" ")[0])}
                              className="text-[10px] font-bold text-[#0F766E] hover:underline self-start sm:self-center cursor-pointer"
                            >
                              {t("মনোগ্রাফ দেখুন", "View Monograph")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* TAB 2: DRUG SAFETY TRIAGE (ড্রাগ সেফটি)                           */}
                  {/* ================================================================= */}
                  {activeWorkstationTab === "safety" && (
                    <div className="space-y-4 text-xs">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                            <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                            <span>{t("ড্রাগ-ড্রাগ ক্ষতিকর মিথস্ক্রিয়া সতর্কতা (Drug-Drug Safety)", "Drug-Drug Interaction Safety Triage")}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                            SAFE
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {t("কোনো সরাসরি ক্ষতিকর মিথস্ক্রিয়া নথিভুক্ত নেই", "No Direct Adverse Interactions Found")}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {t(
                              "বাংলাদেশ ডিজিডিএ ও ব্রিটিশ ন্যাশনাল ফর্মুলারি (BNF) অনুযায়ী এই প্রেসক্রিপশনের ওষুধগুলোর মধ্যে ক্ষতিকর কোনো কনট্রা-ইন্ডিকেশন পাওয়া যায়নি। তবে ব্যথানাশক Proxen সেবনের সময় নিয়মিত রক্তচাপ ও কিডনি রেনাল ফাংশন পর্যবেক্ষণ করুন।",
                              "No severe pharmacodynamic or pharmacokinetic contraindications detected among the 4 verified medications according to DGDA and BNF monographs."
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Pairwise Matrix Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                            Naproxen + Diltiazem
                          </span>
                          <p className="text-slate-500 text-[10px]">
                            {t("রক্তচাপ নিয়মিত মনিটরিং করার পরামর্শ।", "Routine blood pressure monitoring advised.")}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                            Calcitriol + Carbonyl Iron
                          </span>
                          <p className="text-slate-500 text-[10px]">
                            {t("উভয় ওষুধের শোষণ স্বাভাবিক রাখতে সময়ে ব্যবধান রাখুন।", "Separate administration times for optimal absorption.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* TAB 3: BANGLA RAG CHAT (বাংলা চ্যাট Q&A)                           */}
                  {/* ================================================================= */}
                  {activeWorkstationTab === "chat" && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#0F766E]" />
                          <span className="font-bold text-slate-900 text-xs">
                            {t("প্রেসক্রিপশন এআই কনসালটেশন (Bangla RAG Chat)", "Bangla Prescription AI Consultation")}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          RAG Grounded
                        </span>
                      </div>

                      {/* Common Question Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {t("কমন প্রশ্ন নির্বাচন করুন:", "Suggested Questions:")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {SAMPLE_CHAT_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectChatQuestion(preset.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                                selectedChatPresetId === preset.id
                                  ? "bg-teal-50 text-[#0F766E] border-teal-300"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {lang === "bn" ? preset.qBn : preset.qEn}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conversational Chat Thread */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5 max-h-[220px] overflow-y-auto">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {msg.sender === "bot" && (
                              <div className="h-6 w-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                                🤖
                              </div>
                            )}
                            <div
                              className={`rounded-2xl p-2.5 text-[11px] max-w-[85%] leading-relaxed ${
                                msg.sender === "user"
                                  ? "bg-[#0F766E] text-white rounded-tr-xs"
                                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs"
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.text}</p>
                              <span
                                className={`block text-[9px] mt-1 ${
                                  msg.sender === "user" ? "text-teal-200 text-right" : "text-slate-400"
                                }`}
                              >
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input Box */}
                      <form onSubmit={handleSendCustomChat} className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={chatCustomInput}
                          onChange={(e) => setChatCustomInput(e.target.value)}
                          placeholder={t(
                            "এই প্রেসক্রিপশন নিয়ে যেকোনো প্রশ্ন বাংলায় লিখুন...",
                            "Ask any question about these medicines in Bangla..."
                          )}
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F766E] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t("পাঠান", "Send")}</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* TAB 4: PATIENT GUIDANCE (রোগীর সহায়িকা)                           */}
                  {/* ================================================================= */}
                  {activeWorkstationTab === "guide" && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#0F766E]" />
                          <span className="font-bold text-slate-900 text-xs">
                            {t("রোগীর সহজ সহায়িকা (Patient Guidance)", "Patient Medication Guidance Sheet")}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyGuidanceText(
                              SAMPLE_WORKSTATION_MEDS.map((m) => `${m.name}: ${m.timingBn} - ${m.precautionBn}`).join("\n\n")
                            )
                          }
                          className="flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                        >
                          {copiedGuidance ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#15803D]" />
                              <span>{t("কপি হয়েছে", "Copied")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{t("কপি করুন", "Copy Report")}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {SAMPLE_WORKSTATION_MEDS.map((med, idx) => (
                          <div
                            key={med.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {idx + 1}. {med.name} ({med.generic})
                              </span>
                              <span className="text-[10px] font-mono text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {lang === "bn" ? med.dosageBn : med.dosageEn}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 space-y-1">
                              <div>
                                <span className="font-bold text-slate-700">{t("কাজের ধরন:", "Indication:")}</span>{" "}
                                {lang === "bn" ? med.indicationBn : med.indicationEn}
                              </div>
                              <div>
                                <span className="font-bold text-[#0F766E]">{t("খাওয়ার নিয়ম:", "How to take:")}</span>{" "}
                                {lang === "bn" ? med.timingBn : med.timingEn}
                              </div>
                              <div>
                                <span className="font-bold text-amber-800">{t("সতর্কতা:", "Precaution:")}</span>{" "}
                                {lang === "bn" ? med.precautionBn : med.precautionEn}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action inside Workstation Box */}
                  <div className="pt-1">
                    <Link
                      href="/checker"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>{t("আপনার নিজের প্রেসক্রিপশন দিয়ে টেস্ট করুন", "Test With Your Own Prescription")}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* ========================================================================= */}
      {/* 2. THE 4 CORE PILLARS OF MEDBANGLA AI (মূল ৪টি ফিচার ও ব্যবহার নির্দেশিকা) */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              {t("ক্লিনিক্যাল আর্কিটেকচার ও ব্যবহার প্রণালী", "The 4 Core Pillars of MedBangla AI")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t(
                "মেডবাংলা এআই-এর মূল ৪টি বৈশিষ্ট্য ও বাস্তব ব্যবহার নির্দেশিকা",
                "How MedBangla AI Protects Patients Across 4 Stages"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "ছবি আপলোড থেকে শুরু করে এআই পরামর্শ পর্যন্ত প্রতিটি ধাপ ব্যবহারকারীদের জন্য প্রাতিষ্ঠানিক ও নির্ভরযোগ্য",
                "From raw paper intake to grounded clinical AI consultation in 4 transparent stages"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
            {/* FEATURE 1: MEDICINE VERIFICATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-xs hover:border-[#0F766E] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src="/images/feature_rx_verification.jpg"
                    alt="Prescription Verification Tray"
                    className="w-full h-auto object-cover rounded-xl hover:scale-[1.01] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-200 text-[11px] font-bold text-[#0F766E] flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>{t("ধাপ ১: যাচাই ও ওষুধ তালিকা", "Pillar 1: Verification Tray")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalImage("/images/feature_rx_verification.jpg")}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-1.5 rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
                    title="বড় আকারে দেখুন"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t("১. প্রেসক্রিপশন ভিশন ও ওষুধ যাচাইকরণ", "1. Prescription Vision & Medication Verification")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {t(
                      "কাগজের প্রেসক্রিপশন থেকে চিকিৎসকের নাম, ডিগ্রি, হাসপাতালের ঠিকানা, রোগীর বয়স ও ভাইটালস আলাদা করে তালিকাভুক্ত করা হয়। এরপর প্রতিটি ওষুধের ব্র্যান্ড নাম, জেনেরিক উপাদান ও মাত্রা (যেমন ১+০+১) এডিটেবল টেবিলে প্রদর্শন করা হয়। রোগী প্রয়োজনে নিজের হাতে কোনো ওষুধ সংশোধন বা নতুন ওষুধ যোগ করতে পারেন।",
                      "Extracts doctor qualifications, patient vitals, and handwritten medications into an editable verification tray. Users can adjust dosages or manually add medicines before safety screening."
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#0F766E] font-bold">
                  {t("১৭,৫৮৯ অনুমোদিত ড্রাগ লিঙ্কড", "17,589 Catalog Matched")}
                </span>
                <Link
                  href="/checker"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline"
                >
                  <span>{t("যাচাইকরণ পরীক্ষা করুন", "Try Verification")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FEATURE 2: DRUG SAFETY TRIAGE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-xs hover:border-[#0F766E] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src="/images/feature_drug_safety.jpg"
                    alt="Drug-Drug Safety Interaction Matrix"
                    className="w-full h-auto object-cover rounded-xl hover:scale-[1.01] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-200 text-[11px] font-bold text-amber-700 flex items-center gap-1.5 shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t("ধাপ ২: ড্রাগ সেফটি ট্রায়াজ", "Pillar 2: Interaction Triage")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalImage("/images/feature_drug_safety.jpg")}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-1.5 rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
                    title="বড় আকারে দেখুন"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t("২. ড্রাগ-ড্রাগ ক্ষতিকর মিথস্ক্রিয়া সতর্কতা", "2. Deterministic Drug-Drug Interaction Safety")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {t(
                      "রোগী যখন ভিন্ন চিকিৎসকের কাছ থেকে একাধিক ওষুধ খান, তখন বিপজ্জনক ড্রাগ মিথস্ক্রিয়া ঘটে (যেমন ব্যথানাশক Naproxen এর সাথে রক্তচাপের Diltiazem)। মেডবাংলা এআই পেয়ারওয়াইজ ডিটারমিনিস্টিক ম্যাট্রিক্সে ক্ষতিকর সংমিশ্রণ যাচাই করে সবুজ, হলুদ বা লাল রঙের স্পষ্ট ক্লিনিক্যাল সতর্কতা দেয়।",
                      "Screens pairwise combinations between all verified medicines against DGDA and BNF pharmacodynamics, flagging severe and moderate interaction risks without generative hallucination."
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#15803D] font-bold">
                  {t("জিরো-হ্যালোসিনেশন পলিসি", "Zero-Hallucination Policy")}
                </span>
                <Link
                  href="/checker"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline"
                >
                  <span>{t("সেফটি চেক চালান", "Run Safety Check")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FEATURE 3: BANGLA RAG CHAT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-xs hover:border-[#0F766E] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src="/images/feature_bangla_rag_chat.jpg"
                    alt="Bangla RAG Medical Consultation Chat"
                    className="w-full h-auto object-cover rounded-xl hover:scale-[1.01] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-200 text-[11px] font-bold text-[#0F766E] flex items-center gap-1.5 shadow-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t("ধাপ ৩: বাংলা এআই চ্যাট", "Pillar 3: Bangla RAG Chat")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalImage("/images/feature_bangla_rag_chat.jpg")}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-1.5 rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
                    title="বড় আকারে দেখুন"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t("৩. প্রেসক্রিপশন এআই কনসালটেশন - বাংলা চ্যাট", "3. Grounded Bangla Medical AI Consultation")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {t(
                      "ওষুধগুলো নিয়ে রোগীর যেকোনো প্রশ্ন—খাবারের আগে না পরে খাব? কোনো পার্শ্বপ্রতিক্রিয়া আছে কি? ডোজ ভুলে গেলে করণীয় কী?—সহজ বাংলায় জিজ্ঞাসা করা যায়। আরএজি (RAG) আর্কিটেকচারের কারণে এআই মনগড়া উত্তর না দিয়ে সরাসরি চিকিৎসাগত ভেরিফাইড ডাটা থেকে প্রাঞ্জল উত্তর প্রদান করে।",
                      "Allows patients and families to ask questions in colloquial Bengali regarding meal timings, side effects, or missed doses, answered reliably using RAG grounding over medical monographs."
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-teal-700 font-bold">
                  {t("RAG Grounded Intelligence", "RAG Grounded Intelligence")}
                </span>
                <Link
                  href="/checker"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline"
                >
                  <span>{t("চ্যাট কনসালটেশন দেখুন", "Explore Chat")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FEATURE 4: PATIENT GUIDANCE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-xs hover:border-[#0F766E] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src="/images/feature_patient_guidance.jpg"
                    alt="Patient Medication Guidance Report"
                    className="w-full h-auto object-cover rounded-xl hover:scale-[1.01] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-200 text-[11px] font-bold text-blue-700 flex items-center gap-1.5 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t("ধাপ ৪: রোগীর সহজ সহায়িকা", "Pillar 4: Patient Guidance")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalImage("/images/feature_patient_guidance.jpg")}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-1.5 rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
                    title="বড় আকারে দেখুন"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t("৪. রোগীর সহজ সহায়িকা ও সেবনবিধি", "4. Patient Guidance & Chronotherapy Schedules")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {t(
                      "প্রেসক্রিপশনের প্রতিটি ওষুধের কাজ কী, কীভাবে সেবন করতে হবে (সকালে/দুপুরে/রাতে), সম্ভাব্য পার্শ্বপ্রতিক্রিয়া এবং গুরুত্বপূর্ণ সতর্কতা পয়েন্ট আকারে প্রাঞ্জল বাংলায় তৈরি হয়। পরিবারের কেয়ারগিভাররা ১-ক্লিকে এই রিপোর্ট কপি বা প্রিন্ট করে ফ্রিজে বা ওষুধের বাক্সে রাখতে পারেন।",
                      "Generates clear Bengali point-by-point instructions detailing indication, meal intervals, potential side effects, and precautions—formatted for easy copying or printing for family caregivers."
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-700 font-bold">
                  {t("১-ক্লিক কপি ও প্রিন্ট সুবিধা", "1-Click Copy & Print")}
                </span>
                <Link
                  href="/checker"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline"
                >
                  <span>{t("সহায়িকা তৈরি করুন", "Generate Guidance")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2B. CLINICAL SAFETY PROTOCOL & PHARMACOVIGILANCE SHOWCASE                */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Top Informative Banner with Public Image */}
          <div className="relative group overflow-hidden bg-slate-950 aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9]">
            <img
              src="/images/clinical_safety_banner.jpg"
              alt="Clinical Safety Protocol & Pharmacovigilance Monitoring"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
              <span className="bg-emerald-500/90 text-slate-950 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DGDA & BMDC COMPLIANT</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalImage("/images/clinical_safety_banner.jpg")}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-2 rounded-xl border border-white/20 transition-all cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
              title="বড় আকারে ব্যানার দেখুন"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t("বড় আকারে দেখুন", "Expand Banner")}</span>
            </button>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1">
              <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-widest">
                {t("ক্লিনিক্যাল সেফটি ফ্রেমওয়ার্ক", "Clinical Safety Framework")}
              </span>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                {t(
                  "জাতীয় ডিজিডিএ ফার্মাকোভিজিল্যান্স ও ক্লিনিক্যাল সেফটি প্রোটোকল",
                  "National DGDA Pharmacovigilance & Clinical Safety Architecture"
                )}
              </h3>
            </div>
          </div>

          {/* Deep Clinical Pillars Breakdown */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="max-w-3xl space-y-2">
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {t(
                  "হ্যালুসিনেশনহীন ডিটারমিনিস্টিক ড্রাগ সেফটি ট্রায়াজ",
                  "Deterministic Zero-Hallucination Drug Safety Guarantee"
                )}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(
                  "মেডবাংলা এআই-এর ড্রাগ ইন্টারঅ্যাকশন ইঞ্জিন কোনো জেনারেটিভ অনুমান ব্যবহার করে না। বাংলাদেশ ডিজিডিএ (DGDA) ও ব্রিটিশ ন্যাশনাল ফর্মুলারি (BNF) ভিত্তিক ডিটারমিনিস্টিক ম্যাট্রিক্সে প্রেসক্রিপশনের ওষুধগুলো পেয়ারওয়াইজ ক্রস-চেক করা হয়।",
                  "MedBangla AI uses strictly deterministic pairwise matrix lookups grounded in official DGDA registries and British National Formulary monographs—eliminating dangerous LLM guesswork."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>{t("পেয়ারওয়াইজ রেড অ্যালার্ট", "Pairwise Red Alerts")}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    "একাধিক প্রেসক্রিপশনের ওষুধ একসাথে সেবনে প্রাণঘাতী মিথস্ক্রিয়া তাৎক্ষণিক ফ্ল্যাগ করা হয়।",
                    "Flags severe drug combinations that induce cardiac arrhythmia, hemorrhage, or toxicity."
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>{t("রেনাল ও হেপাটিক নজরদারি", "Renal & Hepatic Guard")}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    "কিডনি বা লিভারের দীর্ঘমেয়াদী জটিলতায় আক্রান্ত রোগীদের ওষুধের ক্লিয়ারেন্স ঝুঁকি সতর্কবার্তা।",
                    "Highlights medicines requiring GFR dosage adjustment to prevent renal accumulation."
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{t("গর্ভাবস্থা ঝুঁকি শ্রেণি (FDA)", "FDA Pregnancy Categories")}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    "গর্ভবতী মা ও নবজাতক শিশুর জন্য FDA Category A, B, C, D, X শ্রেণিবিভাগ অনুযায়ী সতর্কতা।",
                    "Displays verified teratogenic categories to protect expecting mothers and nursing infants."
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="font-bold text-[#15803D] flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>{t("খাবার ও সময়ের ক্রোনোথেরাপি", "Meal & Timing Schedules")}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    "খাবারের আগে নাকি পরে, দুধ/অ্যাসিড জাতীয় খাবারের সাথে ব্যবধান কত ঘণ্টা—সহজ বাংলায় নির্দেশনা।",
                    "Grounded guidance on meal intervals, water intake, and chronotherapy timings."
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>{t("বিএমডিসি কোড অব এথিক্স অনুসারে কোনো রোগ নির্ণয়কারী চিকিৎসকের বিকল্প নয়", "Informational aid strictly adhering to BMDC Code of Medical Ethics")}</span>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
              >
                <span>{t("নিরাপত্তা মানদণ্ড বিস্তারিত জানুন", "Read Clinical Ethics & Safety Guidelines")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2C. SMARTPHONE PRESCRIPTION SCANNING & PHOTOGRAPHY GUIDE                  */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Guide Showcase Image */}
            <div className="lg:col-span-6 relative group overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-900">
              <img
                src="/images/rx_mobile_scanner_guide.jpg"
                alt="Smartphone Prescription Scanner & Photography Accuracy Guide"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-200/80 shadow-md text-xs font-bold text-[#0F766E] flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{t("মোবাইল স্ক্যানার ভিশন", "Mobile Scanner Vision")}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalImage("/images/rx_mobile_scanner_guide.jpg")}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-2 rounded-xl border border-white/20 transition-all cursor-pointer shadow-md"
                title="বড় আকারে দেখুন"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Guide Instructions */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#0F766E] border border-teal-200/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("নির্ভুল ওসিআর স্ক্যান নির্দেশিকা", "High-Precision Mobile Photography Guide")}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {t(
                  "স্মার্টফোনে প্রেসক্রিপশন ছবি তোলার ৪টি সহজ নিয়ম",
                  "4 Simple Rules to Snap Crisp Prescriptions on Smartphone"
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(
                  "ডাক্তারের হাতের লেখা যতই অস্পষ্ট হোক, সঠিক নিয়মে ছবি তুললে আমাদের অ্যাডাপ্টিভ নিউরাল ভিশন ইঞ্জিন ৯৮.৭% নির্ভুলতায় ওষুধ ও ডোজ শনাক্ত করতে পারে।",
                  "Regardless of messy doctor handwriting, following these 4 photography tips enables our adaptive computer vision engine to achieve 98.7% accurate recognition."
                )}
              </p>

              <div className="space-y-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ১
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t("সমতল পৃষ্ঠে ও পর্যাপ্ত আলোতে রাখুন", "Flat Surface & Uniform Natural Lighting")}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {t(
                        "প্রেসক্রিপশনটি টেবিলের উপর সমতল রাখুন। ক্যামেরার ফ্ল্যাশের অতিরিক্ত আলো বা হাতের কালো ছায়া যাতে কাগজের ওপর না পড়ে।",
                        "Place prescription flat on a desk. Avoid harsh flash glare or casting phone shadows over doctor's handwriting."
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ২
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t("প্রেসক্রিপশনের চারটি কোণাই ফ্রেমে রাখুন", "Capture All 4 Corners in Frame")}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {t(
                        "মোবাইলটি কাগজের সমান্তরালে ধরুন। প্রেসক্রিপশনের কোনো প্রান্ত বা ওষুধের নাম যেন ফ্রেমের বাইরে কেটে না যায়।",
                        "Hold your phone parallel to the paper so borders align with camera grid without cropping crucial Rx lines."
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ৩
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t("ডাক্তারের হেডার ও ওষুধের লাইনে ফোকাস রাখুন", "Ensure Sharp Focus on Rx Medicines")}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {t(
                        "ছবি তোলার আগে স্ক্রিনে স্পর্শ করে ওষুধের লেখার ওপর ফোকাস নিশ্চিত করুন যাতে কোনো অস্পষ্ট ব্লার না থাকে।",
                        "Tap the phone screen on the handwriting area to lock autofocus and maximize character edge sharpness."
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[#15803D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ৪
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t("১-ক্লিকে আপলোড ও স্বয়ংক্রিয় এআই ডেকোডিং", "1-Click Upload & Instant Neural Vision")}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {t(
                        "ছবি আপলোড করলেই মুহূর্তের মধ্যে এডিটেবল টেবিলে ওষুধ, মাত্রা ও ক্ষতিকর ড্রাগ মিথস্ক্রিয়া রিপোর্ট প্রদর্শিত হবে।",
                        "Upload to extract doctor credentials, patient vitals, medicines, and deterministic safety checks in seconds."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/checker"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] px-6 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Scan className="w-4 h-4" />
                  <span>{t("এখনই প্রেসক্রিপশন স্ক্যান করুন", "Start Prescription Scan Now")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/medicines"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{t("ওষুধের ডাটাবেজ দেখুন", "Search DGDA Catalog")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHO IS MEDBANGLA AI FOR? (কাদের জন্য এই প্ল্যাটফর্ম?)                  */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              {t("প্ল্যাটফর্ম পরিচিতি ও ব্যবহারকারী", "Who MedBangla AI Empowers")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("সবার স্বাস্থ্য সুরক্ষায় নির্ভরযোগ্য ডিজিটাল সহকারী", "Reliable Healthcare Support for Every Bangladeshi")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "রোগী, পরিবার, ফার্মাসিস্ট থেকে শুরু করে চিকিৎসক পর্যন্ত সকলের জন্য সময়োপযোগী ক্লিনিক্যাল সুবিধা",
                "Built to assist patients, caregivers, pharmacists, and medical professionals across Bangladesh"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* User Type 1: General Patients & Families */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3.5 shadow-xs hover:border-[#0F766E] transition-all">
              <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E] border border-teal-200/60">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {t("সাধারণ রোগী ও পরিবার", "Patients & Families")}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t(
                  "ডাক্তারের হাতের অস্পষ্ট লেখা বুঝে নেওয়া, ওষুধের সঠিক মাত্রা জানা এবং খাবার আগে নাকি পরে সেব্য তা সহজ বাংলায় পাওয়ার নিশ্চয়তা।",
                  "Understand doctor's handwriting, verify exact dosage, and access clear Bengali meal timing schedules."
                )}
              </p>
              <div className="pt-1 text-[11px] font-bold text-[#0F766E] flex items-center gap-1">
                <span>{t("সহজ সেবন নির্দেশিকা", "Clear Patient Guidance")}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* User Type 2: Chronic & Elderly Care */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3.5 shadow-xs hover:border-[#0F766E] transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200/60">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {t("দীর্ঘমেয়াদী রোগী ও বয়োজ্যেষ্ঠ", "Chronic Illness & Elderly")}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t(
                  "ডায়াবেটিস, প্রেশার বা হৃদরোগে যখন একাধিক ওষুধ একসাথে খেতে হয়, তখন বিপজ্জনক ড্রাগ মিথস্ক্রিয়া শনাক্ত করে রোগীর জীবন রক্ষা।",
                  "Protect seniors on multiple medications for hypertension or diabetes against toxic drug-drug interactions."
                )}
              </p>
              <div className="pt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span>{t("ড্রাগ মিথস্ক্রিয়া অ্যালার্ট", "Interaction Triage")}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* User Type 3: Pharmacists & Dispensers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3.5 shadow-xs hover:border-[#0F766E] transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-200/60">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {t("ফার্মাসিস্ট ও ডিসপেনসার", "Pharmacists & Dispensers")}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t(
                  "ফার্মেসিতে ভুল ওষুধ বিতরণের ঝুঁকি শূন্যে নামানো, সঠিক ব্র্যান্ড ও সমমানের সাশ্রয়ী জেনেরিক বিকল্প দ্রুত খুঁজে বের করা।",
                  "Eliminate pharmacy dispensing misinterpretation errors and rapidly lookup verified equivalent generic alternatives."
                )}
              </p>
              <div className="pt-1 text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <span>{t("১৭,৫৮৯ ব্র্যান্ড ডাটাবেজ", "17,589 Brand Catalog")}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* User Type 4: Medical Students & Researchers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3.5 shadow-xs hover:border-[#0F766E] transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200/60">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {t("মেডিকেল শিক্ষার্থী ও গবেষক", "Students & Researchers")}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t(
                  "জাতীয় ডিজিডিএ ফর্মুলারি এবং আন্তর্জাতিক ক্লিনিক্যাল মনোগ্রাফভিত্তিক নির্ভরযোগ্য বৈজ্ঞানিক ড্রাগ মেকানিজম রেফারেন্স।",
                  "Access authentic DGDA monographs, pharmacology mechanisms, and verified clinical indications without AI hallucinations."
                )}
              </p>
              <div className="pt-1 text-[11px] font-bold text-purple-700 flex items-center gap-1">
                <span>{t("প্রমাণভিত্তিক মনোগ্রাফ", "Evidence Monographs")}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. GENERIC MEDICINE TRANSPARENCY & SAVINGS                                */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#15803D] border border-emerald-200/60">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t("চিকিৎসা খরচ সাশ্রয় ও স্বচ্ছতা", "Cost Transparency & Generic Savings")}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {t(
                  "একই উপাদানের সাশ্রয়ী জেনেরিক ওষুধ খুঁজে ৫০-৭০% খরচ কমান",
                  "Save 50-70% on Healthcare With Verified Generic Alternatives"
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(
                  "অনেক সময় একটি নামী ব্র্যান্ডের ওষুধ বাজারে পাওয়া যায় না অথবা তার দাম সাধারণ পরিবারের জন্য অনেক বেশি হয়। মেডবাংলা এআই বাংলাদেশের ড্রাগ অ্যাডমিনিস্ট্রেশন (DGDA) তালিকা অনুযায়ী একই জেনেরিক উপাদানের অনুমোদিত সাশ্রয়ী বিকল্প ওষুধ প্রদর্শন করে।",
                  "Often, prescribed brand medicines are expensive or out of stock at retail pharmacies. MedBangla AI indexes approved commercial equivalents sharing identical generic molecules and strengths at verified DGDA prices."
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-[#0F766E]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>{t("সরকারি এমআরপি দাম", "Official DGDA MRP")}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t("প্রতিটি ট্যাবলেটের সর্বোচ্চ খুচরা মূল্য জেনে অতিরিক্ত মূল্য প্রদান রোধ করুন।", "Check verified maximum retail prices to avoid overpaying.")}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-[#0F766E]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>{t("ডুপ্লিকেট ওভারডোজ প্রতিরোধ", "Prevent Overdosing")}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t("ভিন্ন ব্র্যান্ড নামে একই ওষুধ দুবার খেয়ে বিষক্রিয়া থেকে রোগীকে রক্ষা করা।", "Prevent accidentally taking two different brands of identical molecules.")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/medicines"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>{t("১৭,৫৮৯ ওষুধের ডাটাবেজ ব্রাউজ করুন", "Browse 17,589 Medicine Catalog")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-6 relative group overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-50 order-1 lg:order-2">
              <img
                src="/images/generic_medicine_safety.jpg"
                alt="Pharmacist Glass Tablet with Generic Price Comparison & Interaction Chart"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalImage("/images/generic_medicine_safety.jpg")}
                  className="bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-1.5 rounded-xl border border-white/20 transition-all cursor-pointer shadow-md"
                  title="বড় আকারে দেখুন"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-200/80 shadow-md text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>DGDA Price Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PATIENT SAFETY RULES: DO'S AND DON'TS WITH MEDICINES                  */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              {t("রোগীর নিরাপত্তা নির্দেশিকা", "Patient Safety Protocol")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("ওষুধ সেবনের ৫টি জরুরি নিয়ম ও সতর্কতা", "Essential Rules & Precautions for Safe Medication")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "ওষুধের পার্শ্বপ্রতিক্রিয়া ও ক্ষতিকর মিথস্ক্রিয়া থেকে পরিবারকে সুরক্ষিত রাখার নির্দেশিকা",
                "Clinical best practices to protect your family from adverse drug events"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* DO's */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>{t("যা অবশ্যই পালন করবেন (What To Do)", "Safe Practices (What To Do)")}</span>
              </div>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ১
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "চিকিৎসকের পরামর্শ ছাড়া অ্যান্টিবায়োটিকের নির্ধারিত কোর্স মাঝপথে কখনো বন্ধ করবেন না।",
                      "Always complete the full prescribed antibiotic course, even if symptoms subside early."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ২
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "নতুন কোনো ডাক্তার দেখাতে গেলে পূর্বের সকল প্রেসক্রিপশন ও নিয়মিত খাওয়ার ওষুধের তালিকা সাথে রাখুন।",
                      "Bring all ongoing medications and prior prescriptions when visiting a new physician."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ৩
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "অ্যান্টিবায়োটিক (যেমন Ciprofloxacin) ও ক্যালসিয়াম বা দুধ জাতীয় খাবারের মাঝে অন্তত ২-৪ ঘণ্টার বিরতি রাখুন।",
                      "Maintain at least a 2 to 4-hour gap between antibiotics and calcium/dairy supplements."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ৪
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "ওষুধ কেনার সময় প্যাকেটের গায়ে এক্সপায়ার ডেট ও ডিজিডিএ রেজিস্ট্রেশন নম্বর অবশ্যই যাচাই করুন।",
                      "Always inspect the expiry date and official DGDA manufacturing registration on blister packs."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* DON'Ts */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>{t("যা কখনো করবেন না (What NOT To Do)", "Harmful Habits (What NOT To Do)")}</span>
              </div>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ১
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "ফার্মেসি থেকে চিকিৎসকের পরামর্শ ছাড়া নিজে নিজে কোনো ঘুমের ওষুধ, ব্যথানাশক বা স্টেরয়েড কিনবেন না।",
                      "Never self-medicate with sedatives, chronic NSAID painkillers, or steroids without a doctor's Rx."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ২
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "পুরনো প্রেসক্রিপশনের ওষুধ লক্ষণ এক মনে করে পরিবারের অন্য কাউকে সেবন করতে দেবেন না।",
                      "Do not share previously prescribed medications with family members experiencing similar symptoms."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ৩
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "খালি পেটে ব্যথানাশক ওষুধ (যেমন Naproxen, Diclofenac) খাবেন না, এতে পাকস্থলীতে আলসার হতে পারে।",
                      "Never take NSAID painkillers on an empty stomach to prevent acute gastric ulceration."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ৪
                  </span>
                  <p className="leading-relaxed">
                    {t(
                      "ডোজ ভুলে গেলে পরবর্তী সময়ে একসাথে ডাবল ডোজ গ্রহণ করবেন না, এতে মারাত্মক ওভারডোজ হতে পারে।",
                      "Never take a double dose to make up for a missed tablet to avoid accidental toxic overdose."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)                            */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              {t("সচরাচর জিজ্ঞাসা", "FAQ")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("সচরাচর জিজ্ঞাসিত প্রশ্নমালা", "Frequently Asked Questions")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "মেডবাংলা এআই ব্যবহারের নিয়ম ও নিরাপত্তা সম্পর্কে জানুন",
                "Common questions regarding platform usage, safety, and clinical validity"
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                qBn: "মেডবাংলা এআই কি কোনো ডাক্তারের বিকল্প?",
                qEn: "Is MedBangla AI a substitute for a doctor?",
                aBn: "না। মেডবাংলা এআই একটি শিক্ষামূলক ও তথ্যসহায়ক প্ল্যাটফর্ম। এটি প্রেসক্রিপশন বুঝতে ও ওষুধের মিথস্ক্রিয়া জানতে সাহায্য করে, কিন্তু কোনো অবস্থাতেই চিকিৎসকের পরামর্শ ছাড়া নিজে নিজে ওষুধ পরিবর্তন বা বন্ধ করা উচিত নয়।",
                aEn: "No. MedBangla AI is an educational healthcare platform to assist in understanding prescriptions. Never start, modify, or discontinue medications without consulting your licensed physician.",
              },
              {
                qBn: "এটি কি সব ধরণের প্রেসক্রিপশন ও হাতের লেখা পড়তে পারে?",
                qEn: "Can it read any handwriting and prescription type?",
                aBn: "হ্যাঁ, মুদ্রিত এবং ডাক্তারদের হাতের লেখা উভয় ধরণের প্রেসক্রিপশন পড়া সম্ভব। যদি কোনো অস্পষ্ট লেখার কনফিডেন্স কম থাকে, সিস্টেম রোগীকে সতর্ক করে এবং এডিটেবল টেবিলে নিজে সঠিক নাম লিখে নেওয়ার সুযোগ দেয়।",
                aEn: "Yes, it supports both printed slips and handwritten prescriptions. If handwriting is ambiguous, the system flags it and lets users manually confirm before running safety checks.",
              },
              {
                qBn: "ওষুধগুলোর তথ্য ও দাম কতটা নির্ভরযোগ্য?",
                qEn: "How accurate is the medicine pricing and monograph data?",
                aBn: "আমাদের ডাটাবেজে রয়েছে বাংলাদেশ ডিজিডিএ (DGDA) অনুমোদিত ১৭,৫৮৯টি বাণিজ্যিক ব্র্যান্ড ও ১,৪৩৫টি জেনেরিক উপাদানের অনুমোদিত তথ্য। দাম ও প্রস্তুতকারকের বিবরণ প্রতিনিয়ত হালনাগাদ করা হয়।",
                aEn: "Our catalog includes official data across 17,589 commercial brands and 1,435 generics approved by Bangladesh DGDA, updated regularly with official pricing and pack specifications.",
              },
              {
                qBn: "আমার প্রেসক্রিপশনের ছবি কি নিরাপদে সংরক্ষিত থাকবে?",
                qEn: "Is my uploaded prescription kept private and secure?",
                aBn: "অবশ্যই। রোগীর ব্যক্তিগত তথ্য ও ছবি ২৫৬-বিট এনক্রিপশনের মাধ্যমে সংরক্ষিত হয় এবং কোনো তৃতীয় পক্ষের কাছে স্থানান্তর বা বিক্রি করা হয় না।",
                aEn: "Absolutely. Prescription uploads are processed through 256-bit encryption and are never sold or shared with unapproved third parties.",
              },
              {
                qBn: "লগইন না করে কি আমি এই ওয়েবসাইট ব্যবহার করতে পারব?",
                qEn: "Can I explore the website without logging in?",
                aBn: "হ্যাঁ! আপনি হোমপেজ ও এবাউট পেজের সকল তথ্য ও গাইডলাইন বিনামূল্যে পড়তে পারবেন। প্রেসক্রিপশন স্ক্যানার বা ওষুধ ক্যাটালগে প্রবেশ করতে ১-ক্লিকে গেস্ট হিসেবে বা ইমেইল দিয়ে ফ্রি লগইন করা যায়।",
                aEn: "Yes! You can explore the homepage and About/Safety resources freely. To access the live Prescription Checker and Medicine Database, you can log in with 1-click guest access or email.",
              },
              {
                qBn: "ওষুধের পার্শ্বপ্রতিক্রিয়া দেখা দিলে তাৎক্ষণিক কী করব?",
                qEn: "What should I do if I experience an adverse drug reaction?",
                aBn: "তাত্ক্ষণিক ওষুধ সেবন স্থগিত রাখুন এবং সরকারি স্বাস্থ্য বাতায়ন ১৬২৬৩ নম্বরে অথবা নিকটস্থ সরকারি বা বেসরকারি হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।",
                aEn: "Stop taking the suspected medicine immediately and call the National Healthline 16263 or visit your nearest hospital emergency department.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{lang === "bn" ? faq.qBn : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      openFaqIndex === idx ? "rotate-180 text-[#0F766E]" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {lang === "bn" ? faq.aBn : faq.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EMERGENCY HOTLINES STRIP                                               */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center flex-shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {t("জরুরি স্বাস্থ্যসেবা ও সরকারি হেল্পলাইন", "24/7 National Emergency & Healthlines")}
                </h3>
                <p className="text-xs text-slate-600">
                  {t("যেকোনো জরুরি চিকিৎসা সহায়তা ও ওষুধের বিষক্রিয়ায় সরাসরি কল করুন", "Direct access to verified national emergency healthcare centers")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:16263"
                className="rounded-xl bg-white border border-teal-200 px-3.5 py-1.5 text-xs hover:border-[#0F766E] transition-colors"
              >
                <span className="text-[10px] text-slate-400 block font-medium">স্বাস্থ্য বাতায়ন</span>
                <span className="font-bold text-[#0F766E] font-mono text-sm">১৬২৬৩</span>
              </a>
              <a
                href="tel:999"
                className="rounded-xl bg-white border border-teal-200 px-3.5 py-1.5 text-xs hover:border-[#0F766E] transition-colors"
              >
                <span className="text-[10px] text-slate-400 block font-medium">জাতীয় জরুরি সেবা</span>
                <span className="font-bold text-slate-900 font-mono text-sm">৯৯৯</span>
              </a>
              <a
                href="tel:10655"
                className="rounded-xl bg-white border border-teal-200 px-3.5 py-1.5 text-xs hover:border-[#0F766E] transition-colors"
              >
                <span className="text-[10px] text-slate-400 block font-medium">আইইডিসিআর</span>
                <span className="font-bold text-slate-900 font-mono text-sm">১০৬৫৫</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. READY TO START CALL TO ACTION                                          */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-[#0F766E] p-8 sm:p-12 text-center text-white space-y-5 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t("আপনার প্রেসক্রিপশন বুঝতে প্রস্তুত?", "Ready to Verify Your Prescription?")}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              {t(
                "নিরাপদ ও নির্ভরযোগ্য স্বাস্থ্য তথ্যের সাথে সুস্থ থাকুন। এখনই ছবি আপলোড করুন অথবা ওষুধের তথ্য অনুসন্ধান করুন।",
                "Ensure medication safety for you and your family with verified clinical AI guidance."
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/checker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-8 py-3.5 text-xs font-bold text-[#0F766E] shadow-sm transition-all cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>{t("প্রেসক্রিপশন পরীক্ষা করুন", "Start Prescription Check")}</span>
            </Link>

            <Link
              href="/medicines"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-7 py-3.5 text-xs font-bold text-white border border-teal-600 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{t("ওষুধের ডাটাবেজ খুঁজুন", "Browse 17,589 Medicines")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. UNOBTRUSIVE MEDICAL DISCLAIMER                                         */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 flex items-start gap-4 text-xs text-slate-600 shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-[#0F766E] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-sm">
              {t("চিকিৎসাগত সতর্কবার্তা ও আইনি দায়িত্বমুক্তি:", "Clinical Disclaimer & Terms:")}
            </span>
            <p className="leading-relaxed">
              {t(
                "মেডবাংলা এআই একটি শিক্ষামূলক ও সহায়ক স্বাস্থ্য তথ্য প্ল্যাটফর্ম। এটি কোনো রোগ নির্ণয়কারী বা প্রেসক্রাইবিং টুল নয়। প্রেসক্রিপশনের কোনো ওষুধ শুরু, পরিবর্তন বা বন্ধ করার পূর্বে অবশ্যই আপনার রেজিস্টার্ড চিকিৎসকের সাথে কথা বলুন।",
                "MedBangla AI is an educational healthcare informational platform and does not substitute for professional medical judgment. Always consult a licensed healthcare professional before starting or changing medications."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* High-Resolution Public Image Preview Modal */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm">
                  {t("মেডবাংলা এআই ক্লিনিক্যাল ইমেজ প্রিভিউ", "MedBangla AI Clinical Image Preview")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-2">
              <img
                src={activeModalImage}
                alt="High resolution showcase"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="font-mono text-[11px]">{activeModalImage.replace("/images/", "")}</span>
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition-all cursor-pointer"
              >
                {t("বন্ধ করুন", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
