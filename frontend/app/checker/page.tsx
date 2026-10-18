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
  const { currentUser, openAuthModal, loginAsDemoUser } = useAuth();
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
      {/* Guest Mode Alert Notice if unauthenticated */}
      {!currentUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-amber-50/70 border border-teal-200/90 text-xs shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>{t("🌟 বাস্তব প্রেসক্রিপশন ডেমো ও গুগল সাইন-ইন নির্দেশিকা", "🌟 Authentic Prescription Demo & Google Sign-In Guide")}</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {t(
                  "নিচে প্রস্তুতকৃত বাস্তব প্রেসক্রিপশন (ডাঃ মোঃ ফজলুল হক ও ডাঃ মোঃ সাজ্জাদ হোসেন) ডেমো দিয়ে বিনামূল্যে সম্পূর্ণ এআই ফিচার পরীক্ষা করুন। আপনার নিজস্ব প্রেসক্রিপশন আপলোড করে লাইভ স্ক্যান করতে প্রথমে গুগল দিয়ে সাইন-ইন করুন।",
                  "Test full AI features freely with the verified doctor presets below. To upload and scan your own personal prescriptions, please sign in with your Google account."
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
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
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all shadow-xs cursor-pointer shrink-0 group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="group-hover:text-[#0F766E] transition-colors">{t("গুগল দিয়ে প্রবেশ করুন", "Sign in with Google")}</span>
            </button>
          </div>
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
