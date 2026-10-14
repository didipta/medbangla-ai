"use client";

import React from "react";
import { PrescriptionCareHub } from "../components/PrescriptionCareHub";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Stethoscope,
  Lock,
  LogIn,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Scan,
  CheckCircle2,
  MessageSquare,
  Info,
} from "lucide-react";

import { ProtectedRoute } from "../components/ProtectedRoute";

export default function CheckerPage() {
  const { currentUser, openAuthModal } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200/60">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>{t("প্রেসক্রিপশন এনালাইসিস সেন্টার", "Prescription Analysis Center")}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("প্রেসক্রিপশন চেকার ও ডিজিটাল ড্রাগ হাব", "Prescription Checker & Drug Care Hub")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {t(
            "প্রেসক্রিপশন আপলোড করে অস্পষ্ট লেখা রিভিউ করুন, ভেরিফিকেশন স্ট্যাটাস যাচাই করুন এবং ওষুধসমূহের ড্রাগ সেফটি রিপোর্ট ও বাংলায় নির্দেশনা দেখুন।",
            "Upload your prescription to decode unclear text, review verified medicine matches, check pairwise drug safety, and access clinical instructions."
          )}
        </p>
      </div>

      {/* Guest Mode Alert Notice if unauthenticated */}
      {!currentUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950">
                {t("গেস্ট মোড সক্রিয় — এনালাইসিস চালাতে গুগল দিয়ে প্রবেশ করুন", "Guest Mode Active — Sign In to Run Full AI Analysis")}
              </div>
              <div className="text-[11px] text-amber-800">
                {t(
                  "নিরাপদ ডাটাবেজ সংরক্ষণ ও এআই বিশ্লেষণের জন্য গুগল অ্যাকাউন্ট দিয়ে লগইন আবশ্যক। নিচের বাটনে চাপ দিয়ে এখনি সাইন-ইন করুন।",
                  "Prescription vision OCR and drug safety history require a Google account login. Sign in now or click any analysis button."
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t("গুগল দিয়ে প্রবেশ করুন", "Sign in with Google")}</span>
          </button>
        </div>
      ) : (
        /* Authenticated Session Banner */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {t(`স্বাগতম, ${currentUser.name}!`, `Welcome, ${currentUser.name}!`)}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser.role === "doctor"
                  ? t(`চিকিৎসক সেশন সক্রিয় (BMDC: ${currentUser.bmdc || "ভেরিফাইড"})`, `Active Doctor Session (BMDC: ${currentUser.bmdc || "Verified"})`)
                  : t("রোগী ও পরিবার কেয়ার সেশন সক্রিয়", "Patient & Family Care Session Active")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            <span>256-bit HIPAA Encrypted</span>
          </div>
        </div>
      )}

      {/* Main Prescription Care Hub: any analysis action triggers login modal if unauthenticated */}
      <PrescriptionCareHub />

      {/* Educational Information Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-xs">
        <h3 className="font-extrabold text-lg text-slate-900">
          {t("প্রেসক্রিপশন চেকার যেভাবে আপনার সুরক্ষা নিশ্চিত করে:", "How Prescription Checker Protects Your Health:")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
              <Scan className="w-4 h-4" />
              {t("অ্যাডাপ্টিভ ডেস্কেউ ও ক্লিন", "Adaptive De-Skew & Clean")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "প্রেসক্রিপশনের ভাঁজ বা ছায়াযুক্ত ছবি থেকে লেখা উদ্ধার করে ক্লিন বাইনারি ভার্সন তৈরি করে যাতে হাতের লেখা নির্ভুলভাবে পড়া যায়।",
                "Removes folds and shadows from raw prescription captures, binarizing and enhancing text for accurate handwriting OCR."
              )}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t("এডিটেবল ম্যানুয়াল ভেরিফিকেশন", "Editable Manual Review")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "এআই কোনো অস্পষ্ট ওষুধে নিশ্চিত হতে না পারলে রোগীকে সরাসরি এডিট করার সুযোগ দেয়, যাতে কোনো ভুল ওষুধ প্রসেস না হয়।",
                "If handwriting is ambiguous, the system allows line-by-line user corrections before running safety verification."
              )}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
              <MessageSquare className="w-4 h-4" />
              {t("একই পেজে বাংলা চ্যাট", "In-Context AI Consultation")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "প্রেসক্রিপশন বিশ্লেষণের পর একই পেজে স্বয়ংক্রিয় এআই ডাক্তার অ্যাসিস্ট্যান্টের সাথে বাংলায় প্রশ্নোত্তর করা যায়।",
                "Directly consult the in-page clinical AI assistant about dosage timing, meals, precautions, and side effects."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Scanner Photographic Guide Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
            <img
              src="/images/rx_mobile_scanner_guide.jpg"
              alt="Prescription Mobile Scanner Guide"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#0F766E] flex items-center gap-1 shadow-xs">
              <Scan className="w-3.5 h-3.5" />
              <span>{t("স্ক্যানার গাইড", "Scanner Guide")}</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("ছবি তোলার সঠিক নিয়ম", "Best Practices for 99% Accuracy")}</span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {t("প্রেসক্রিপশনের ছবি তোলার ৪টি গুরুত্বপূর্ণ টিপস", "4 Tips Before Uploading Your Prescription")}
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-[#0F766E] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">১</span>
                <span>{t("পর্যাপ্ত আলোতে সমতল জায়গায় রেখে ছবি তুলুন (ছায়া মুক্ত রাখুন)।", "Keep flat under bright even light without casting phone shadows.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-[#0F766E] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">২</span>
                <span>{t("প্রেসক্রিপশনের চারটি কোণাই যাতে ক্যামেরার স্ক্রিনে পুরোপুরি দৃশ্যমান থাকে।", "Ensure all four paper corners are within the camera viewfinder.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-[#0F766E] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">৩</span>
                <span>{t("ডাক্তারের নাম ও ওষুধের লাইনের ওপর স্ক্রিনে ট্যাপ করে ফোকাস লক করুন।", "Tap screen over doctor's handwriting to guarantee sharp focus.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-[#0F766E] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">৪</span>
                <span>{t("আপলোডের পর এডিটেবল টেবিলে ওষুধ স্বয়ংক্রিয়ভাবে প্রদর্শন হবে।", "Review extracted lines in editable table before running safety triage.")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
