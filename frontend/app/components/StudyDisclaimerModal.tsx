"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  GraduationCap,
  ShieldAlert,
  X,
  CheckCircle2,
  PhoneCall,
  Info,
  Stethoscope,
  HeartPulse,
  Database,
  Activity,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const DISCLAIMER_STORAGE_KEY = "medbangla_study_disclaimer_seen_v1";

export const StudyDisclaimerModal: React.FC = () => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Smooth initial show on application load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
    } catch (e) {
      // Ignore sessionStorage errors
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FIXED BOTTOM-RIGHT FLOATING ALERT ICON                                 */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center group">
        {/* Floating Tooltip Pill */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold backdrop-blur-md shadow-lg border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0">
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("শুধুমাত্র শিক্ষামূলক প্রজেক্ট", "Study Purpose Only")}</span>
        </div>

        {/* Pulse Ring + Trigger Button */}
        <div className="relative">
          <span className="animate-ping absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-400 opacity-75"></span>
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Study purpose disclaimer alert"
            title={t("শিক্ষামূলক সতর্কবার্তা দেখুন", "View Study Purpose Disclaimer")}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-white shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white ring-2 ring-amber-400/40"
          >
            <AlertTriangle className="h-6 w-6 text-white drop-shadow-sm" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INFORMATIVE STUDY PURPOSE DISCLAIMER MODAL                              */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          {/* Backdrop Blur */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container: Max height set, flex column layout */}
          <div className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-white border border-amber-200/90 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-slate-900">
            {/* Top Amber Warning Accent Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-teal-600 shrink-0" />

            {/* Fixed Modal Header */}
            <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t("একাডেমিক ও শিক্ষামূলক গবেষণা প্রকল্প", "Academic & Educational Research Project")}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-normal leading-tight">
                  {t(
                    "মেডবাংলা এআই — সতর্কতামূলক বিজ্ঞপ্তি",
                    "MedBangla AI — Important Clinical Notice"
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body with Max Height and Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-slate-700 overscroll-contain">
              {/* Notice Banner */}
              <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-4 flex items-start gap-3 text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <p className="font-bold text-amber-950">
                    {t(
                      "এই সিস্টেমটি শুধুমাত্র একাডেমিক গবেষণা ও কম্পিউটার ভিশন স্টাডির উদ্দেশ্যে তৈরি।",
                      "This system is engineered strictly for academic research and computer vision study."
                    )}
                  </p>
                  <p className="text-amber-800 mt-1">
                    {t(
                      "এটি কোনো পেশাদার চিকিৎসকের বিকল্প নয় এবং বাস্তব রোগী চিকিৎসার জন্য নির্দেশিত নয়।",
                      "It does not substitute professional medical diagnosis or qualified physical physician consultations."
                    )}
                  </p>
                </div>
              </div>

              {/* Informative Guidance Points */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                {/* 1. Real-time Pricing & Market Data Disclaimer (Strongly emphasized) */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 text-rose-950">
                  <Database className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-[13px] leading-relaxed">
                    <span className="font-bold text-rose-900 block mb-0.5">
                      {t(
                        "ওষুধের মূল্য ও মার্কেট ডাটা রিয়েল-টাইমে আপডেট নয় (Price & Data Not Real-Time):",
                        "Medicine Prices & Market Data Not Updated in Real-Time:"
                      )}
                    </span>
                    <span>
                      {t(
                        "প্ল্যাটফর্মটিতে প্রদর্শিত ওষুধের মূল্য (MRP), প্রস্তুতকারক ও প্রাপ্যতা সংক্রান্ত তথ্য একটি নির্দিষ্ট গবেষণামূলক অফলাইন ডাটাসেট থেকে গৃহীত। বাজারদর পরিবর্তনশীল হওয়ায় এখানে প্রদর্শিত দাম কেনাবেচার জন্য প্রযোজ্য নয়। সঠিক খুচরা মূল্য ও স্টকের জন্য রেজিস্টার্ড ফার্মেসি বা ডিজিডিএ (DGDA) নির্দেশিকা দেখুন।",
                        "Displayed medicine prices (MRP), packaging, and availability are static research benchmarks for academic study only. Market rates fluctuate frequently; do NOT rely on displayed prices for retail purchase. Verify current rates with licensed retail pharmacies or DGDA."
                      )}
                    </span>
                  </div>
                </div>

                {/* 2. AI OCR Accuracy & Processing Latency Benchmark */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/90 text-teal-950">
                  <Activity className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-[13px] leading-relaxed">
                    <span className="font-bold text-[#0F766E] block mb-0.5">
                      {t(
                        "এআই প্রসেসিং সময় ও ওসিআর নির্ভুলতা (OCR Accuracy & Latency):",
                        "AI Processing Latency & OCR Accuracy Benchmark:"
                      )}
                    </span>
                    <span>
                      {t(
                        "গবেষণামূলক মডেল ও সার্ভার কাঠামোর কারণে প্রেসক্রিপশন অ্যানালাইসিসে কিছুটা সময় লাগতে পারে। চিকিৎসকদের অস্পষ্ট বা জটিল হস্তাক্ষরে প্রাথমিক ওসিআর নির্ভুলতা সাধারণতঃ ৫০% থেকে ৬০% পর্যন্ত হয়ে থাকে। তবে স্পষ্ট আলো, পরিষ্কার ও টাইপকৃত প্রেসক্রিপশনে ৮০% থেকে ৯০% পর্যন্ত নির্ভুল ডাটা পাওয়া যায়। শতভাগ নিশ্চয়তার জন্য সিস্টেমটিতে ড্রাগ ভেরিফিকেশন ও এডিটিং ট্রের সুবিধা রাখা হয়েছে।",
                        "Because this is an academic research platform, multi-pass AI extraction may require several seconds. For complex handwritten prescriptions, baseline OCR accuracy typically ranges from 50% to 60%, whereas clear or printed prescriptions achieve 80% to 90% accuracy. Always verify and edit detected medicines in the verification tray."
                      )}
                    </span>
                  </div>
                </div>

                {/* 3. Software Safety First: World-Class Rate Limiting & Quotas */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/90 text-indigo-950">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="w-full text-xs sm:text-[13px] leading-relaxed">
                    <span className="font-bold text-indigo-950 block mb-1">
                      {t(
                        "সফটওয়্যার সুরক্ষা ও এআই ইউসেজ লিমিট (Software Safety & AI Quotas):",
                        "Software Safety First & Daily AI Quotas:"
                      )}
                    </span>
                    <p className="text-[11px] sm:text-xs text-indigo-900 mb-2.5">
                      {t(
                        "সিস্টেমের স্থিতিশীলতা ও অপব্যবহার রোধে প্রতিটি ফিচারের জন্য নিরাপদ রেট লিমিট ও দৈনিক ব্যবহারের কোটা সক্রিয় রাখা হয়েছে:",
                        "To ensure system safety, reliability, and prevent abuse, standard rate limits and daily usage quotas are enforced:"
                      )}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("প্রেসক্রিপশন OCR", "Prescription OCR")}</span>
                        <span className="font-bold text-indigo-900">{t("সর্বোচ্চ ২টি / দিন", "Max 2 / day")}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("রোগীর সহায়িকা", "Patient Guide")}</span>
                        <span className="font-bold text-indigo-900">{t("সর্বোচ্চ ৫টি / দিন", "Max 5 / day")}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("এআই চ্যাটবট", "Clinical Chat")}</span>
                        <span className="font-bold text-indigo-900">{t("১৫টি প্রশ্ন / দিন", "15 queries / day")}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("ড্রাগ ইন্টারঅ্যাকশন", "Drug Safety Check")}</span>
                        <span className="font-bold text-indigo-900">{t("৫০ বার / দিন", "50 checks / day")}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("ওষুধ সন্ধান", "Medicine Search")}</span>
                        <span className="font-bold text-indigo-900">{t("১৫০ বার / দিন", "150 / day")}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 flex flex-col">
                        <span className="text-slate-500">{t("রিসোর্স প্রটেকশন", "Burst Protection")}</span>
                        <span className="font-bold text-emerald-700">{t("সক্রিয় (RFC 6585)", "Active (RFC 6585)")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Physician Authority */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <Stethoscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {t("চিকিৎসকের প্রেসক্রিপশন চূড়ান্ত:", "Physician Authority:")}
                    </span>{" "}
                    {t(
                      "যে কোনো ওষুধ গ্রহণ, পরিবর্তন বা বন্ধ করার পূর্বে অবশ্যই একজন বিএমডিসি নিবন্ধিত চিকিৎসকের পরামর্শ নিন।",
                      "Always consult a registered physician before starting, altering, or stopping any medication."
                    )}
                  </div>
                </div>

                {/* 3. Drug Interaction Demonstration */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <HeartPulse className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {t("ড্রাগ সেফটি ট্রায়াজ ডেমো:", "Drug Interaction Triage:")}
                    </span>{" "}
                    {t(
                      "প্ল্যাটফর্মটির ড্রাগ মিথস্ক্রিয়া ফলাফল ও এআই অনুবাদ শুধুমাত্র শিক্ষামূলক প্রদর্শনের জন্য সরবরাহ করা হয়েছে।",
                      "Drug interaction checks and AI explanations are provided strictly as educational algorithmic demonstrations."
                    )}
                  </div>
                </div>

                {/* 4. Emergency Care */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <PhoneCall className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {t("জরুরি চিকিৎসাসেবা (Emergency):", "Emergency Medical Care:")}
                    </span>{" "}
                    {t(
                      "যে কোনো শারীরিক জরুরি মুহূর্তে অবিলম্বে নিকটস্থ হাসপাতালে যান অথবা সরকারি স্বাস্থ্য বাতায়নে (১৬২৬৩) কল করুন।",
                      "In any acute health emergency, visit the nearest hospital or call the national health helpline (16263)."
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed / Sticky Footer Acknowledgment Bar */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 self-start sm:self-center">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {t(
                    "নিচের বাটনে ক্লিক করে প্ল্যাটফর্মটি ব্যবহার করতে পারবেন",
                    "Click below to acknowledge and proceed to platform"
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("আমি বুঝেছি ও সম্মতি জানাচ্ছি", "I Understand & Acknowledge")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
