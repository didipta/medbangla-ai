"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Smartphone, Sparkles } from "lucide-react";

interface AndroidExperienceBannerProps {
  onOpenDownloadModal: () => void;
}

export const AndroidExperienceBanner: React.FC<AndroidExperienceBannerProps> = ({
  onOpenDownloadModal,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if user is using an Android device
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);

    if (!isAndroid) return;

    // 2. Check if user dismissed it in the last 24 hours
    const dismissedUntil = localStorage.getItem("medbangla_android_banner_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Small delay to let initial page render smoothly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 24 hours
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("medbangla_android_banner_dismissed_until", expiry.toString());
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Android App Promotion Banner"
      className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-teal-200/90 rounded-2xl shadow-xl p-3.5 animate-slideUp font-bangla text-[#0F172A]"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Icon & Text */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#115E59] text-white flex items-center justify-center shrink-0 shadow-xs relative">
            <Smartphone className="w-5 h-5 text-teal-100" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60">
                অ্যান্ড্রয়েড অ্যাপ
              </span>
              <span className="text-[10px] text-slate-400 font-bold">• ফ্রি APK</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
              অ্যাপে আরও দ্রুত ও ভালো অভিজ্ঞতা পান!
            </h4>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              ক্যামেরা দিয়ে তাৎক্ষণিক প্রেসক্রিপশন স্ক্যান ও ড্রাগ ট্রায়াজ
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenDownloadModal}
            className="px-3 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-black shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ইনস্টল</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
