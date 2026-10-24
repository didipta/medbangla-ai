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

import { ProtectedRoute } from "../components/ProtectedRoute";

export default function MedicinesPage() {
  const { currentUser, openAuthModal, loginAsDemoUser } = useAuth();
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-slate-50 px-7 py-3.5 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t("গুগল দিয়ে প্রবেশ করুন (Google Sign In)", "Sign in with Google")}</span>
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
    </ProtectedRoute>
  );
}
