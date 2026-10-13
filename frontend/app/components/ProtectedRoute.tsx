"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading, openAuthModal } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      // Automatically prompt Google login modal
      openAuthModal("login");
      // Redirect to landing page to protect route
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, isLoading, openAuthModal, router, pathname]);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t("লগইন আবশ্যক", "Authentication Required")}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("এই পেজটি সুরক্ষিত", "Protected Clinical Route")}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              {t(
                "এই পেজটি এবং এর ক্লিনিক্যাল ফিচারগুলো ব্যবহার করতে গুগল অ্যাকাউন্ট দিয়ে লগইন করা আবশ্যক।",
                "You must sign in with your Google account to access this page and clinical features."
              )}
            </p>
          </div>

          <button
            onClick={() => openAuthModal("login")}
            className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{t("গুগল দিয়ে লগইন করুন", "Sign in with Google")}</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
