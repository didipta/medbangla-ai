"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldAlert, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { currentUser, isLoading, openAuthModal, loginAsDemoUser } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F766E]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-600 animate-pulse">
          {t("নিরাপদ সেশন যাচাই করা হচ্ছে...", "Verifying secure session...")}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0F766E] shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t("লগইন আবশ্যক", "Authentication Required")}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t("এই পেজটি সুরক্ষিত ও সংরক্ষিত", "Protected Clinical Route")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {t(
                "প্রেসক্রিপশন এনালাইসিস সেন্টার ও ড্রাগ কেয়ার হাব ব্যবহারের জন্য লগইন করা আবশ্যক। ডেমো পরীক্ষা করতে ১-ক্লিকে ডেমো লগইন করুন অথবা ব্যক্তিগত প্রেসক্রিপশন আপলোড করতে গুগল দিয়ে প্রবেশ করুন।",
                "Sign-in is required to access Prescription Checker and Drug Care Hub. Sign in with 1-click Demo to explore verified presets, or sign in with Google to upload personal prescriptions."
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* 1-Click Demo Login Button */}
            <button
              type="button"
              onClick={() => loginAsDemoUser("patient")}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{t("⚡ ১-ক্লিক ডেমো লগইন (Demo Sign-In)", "⚡ 1-Click Instant Demo Sign-In")}</span>
            </button>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="w-full inline-flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border-2 border-slate-300 hover:border-slate-400 transition-all shadow-xs cursor-pointer group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="group-hover:text-[#0F766E] transition-colors">
                {t("গুগল (Gmail) সাইন-ইন দিয়ে প্রবেশ", "Sign in with Google Account")}
              </span>
            </button>

            {/* Back to Home Link */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("হোম পেজে ফিরে যান", "Back to Home Page")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
