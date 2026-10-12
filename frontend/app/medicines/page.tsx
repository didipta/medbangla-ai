"use client";

import React, { Suspense } from "react";
import { MedicinesTester } from "../components/MedicinesTester";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Database,
  Lock,
  LogIn,
  Sparkles,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Pill,
  Info,
} from "lucide-react";

export default function MedicinesPage() {
  const { currentUser, openAuthModal, login } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {currentUser ? (
        /* Authenticated View: Full Interactive DGDA Medicines Catalogue */
        <Suspense
          fallback={
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin w-7 h-7 border-2 border-[#0F766E] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">
                {t("ওষুধের তথ্য ডিরেক্টরি লোড হচ্ছে...", "Loading medicine catalogue...")}
              </p>
            </div>
          }
        >
          <MedicinesTester />
        </Suspense>
      ) : (
        /* Unauthenticated View: Informative Access Gateway */
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200/60">
              <Database className="w-3.5 h-3.5" />
              <span>{t("জাতীয় ওষুধ ডিরেক্টরি", "National Medicine Directory")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("১৭,৫৮৯ ওষুধের তথ্য ও ক্লিনিক্যাল মনোগ্রাফ", "17,589 Medicine Catalog & Clinical Monographs")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {t(
                "ডিজিডিএ অনুমোদিত ওষুধের বাণিজ্যিক ব্র্যান্ড, জেনেরিক উপাদান, ইন্ডিকেশন, সেবনবিধি, সতর্কতা এবং ক্ষতিকর মিথস্ক্রিয়ার তথ্য অনুসন্ধান করুন।",
                "Instant search across DGDA-approved commercial brands, generics, indications, dosage administration, and clinical side effects."
              )}
            </p>
          </div>

          {/* Gateway Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-[#0F766E] border border-teal-200/60">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-[#0F766E]" />
                {t(
                  "লগইন ছাড়া কেবল হোম ও সম্পর্কে পেজ দৃশ্যমান — সম্পূর্ণ ডিরেক্টরির জন্য প্রবেশ আবশ্যক",
                  "Browsing mode: Sign in to unlock full medicine directory and monographs"
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t("ওষুধের সম্পূর্ণ ডাটাবেজ অ্যাক্সেস করুন", "Access Full National Medicine Database")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(
                  "১৭,৫৮৯টি অনুমোদিত ওষুধের দাম, প্যাক সাইজ, প্রস্তুতকারক প্রতিষ্ঠান এবং গভীর দ্বৈতভাষী ক্লিনিক্যাল মনোগ্রাফ অনুসন্ধান করতে আপনার অ্যাকাউন্টে প্রবেশ করুন অথবা ১-ক্লিক গেস্ট ডেমো ব্যবহার করুন।",
                  "Sign in or use our 1-click instant guest demo to access pricing, pack sizes, manufacturers, and clinical monographs across 17,589 approved brands."
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal("login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] px-7 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("লগইন / রেজিস্টার করুন", "Sign In / Register")}</span>
              </button>

              <button
                onClick={() => {
                  login({
                    id: "guest-demo",
                    name: "মাহাদী হাসান (গেস্ট)",
                    email: "guest.mahdi@medbangla.ai",
                    role: "patient",
                    title: "রোগী ডেমো সেশন",
                  });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 px-6 py-3.5 text-xs font-bold text-slate-800 border border-slate-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <span>{t("১-ক্লিক ডেমো লগইন (গেস্ট অ্যাক্সেস)", "1-Click Demo Login (Guest Access)")}</span>
              </button>
            </div>
          </div>

          {/* Educational Information Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-xs">
            <h3 className="font-extrabold text-lg text-slate-900">
              {t("জাতীয় ওষুধ ডিরেক্টরিতে যা যা রয়েছে:", "What's Included in the National Medicine Directory:")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
                  <Pill className="w-4 h-4" />
                  {t("১৭,৫৮৯ অনুমোদিত ব্র্যান্ড", "17,589 Approved Brands")}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t(
                    "বাংলাদেশের ডিজিডিএ কর্তৃক অনুমোদিত সকল আধুনিক বাণিজ্যিক ওষুধ, শক্তি ও ফর্মের নির্ভরযোগ্য তালিকা।",
                    "Complete DGDA catalogue of approved commercial brand names, forms, and strength formulations."
                  )}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
                  <BookOpen className="w-4 h-4" />
                  {t("দ্বৈতভাষী ক্লিনিক্যাল মনোগ্রাফ", "Bilingual Clinical Monographs")}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t(
                    "প্রতিটি জেনেরিক উপাদানের রোগ নির্দেশনা, সেবনবিধি, সতর্কতা এবং ক্ষতিকর পার্শ্বপ্রতিক্রিয়া বাংলায়।",
                    "Detailed clinical indications, dosages, contraindications, and warnings presented in both Bangla and English."
                  )}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  {t("প্রাইসিং ও প্রস্তুতকারক তথ্য", "Pricing & Manufacturers")}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t(
                    "অনুমোদিত সর্বোচ্চ খুচরা মূল্য (MRP), প্যাক সাইজ এবং ফার্মাসিউটিক্যাল কোম্পানির তথ্য।",
                    "Official maximum retail price (MRP), unit pack sizes, and registered pharmaceutical manufacturer info."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card with DGDA Catalog Image */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <img
                  src="/images/hero_informative_showcase.jpg"
                  alt="DGDA Medicine Catalog Showcase"
                  className="w-full h-auto object-cover rounded-xl"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#0F766E] flex items-center gap-1 shadow-xs">
                  <Database className="w-3.5 h-3.5" />
                  <span>DGDA 17,589 Brands</span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("জাতীয় ডিজিটাল ডাটাবেজ", "National Digital Formulary")}</span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {t("১৭,৫৮৯ অনুমোদিত বাণিজ্যিক ব্র্যান্ড ও ১,৪৩৫ জেনেরিক", "17,589 Commercial Brands & 1,435 Generic Molecules")}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(
                    "স্কয়ার, বেক্সিমকো, ইনসেপ্টা, রেনেটা সহ বাংলাদেশের সকল শীর্ষস্থানীয় ফার্মাসিউটিক্যাল কোম্পানির ওষুধের অফিশিয়াল ডোজ, সেবনবিধি, ইন্ডিকেশন ও সরকারি এমআরপি রেট সমন্বিত ডাটাবেজ।",
                    "Official registry covering Bangladesh's pharmaceutical manufacturers including Square, Beximco, Incepta, and Renata with exact DGDA strengths and indications."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
