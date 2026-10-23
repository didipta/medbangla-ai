"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  QrCode,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface AppControlResponse {
  update?: {
    latest_version?: string;
    file_size?: string;
    download_url?: string;
    notes?: string;
  };
}

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [appInfo, setAppInfo] = useState<{
    version: string;
    fileSize: string;
    downloadUrl: string;
    notes: string;
  }>({
    version: "1.0.0",
    fileSize: "24.8 MB",
    downloadUrl: "",
    notes:
      "• বাংলা প্রেসক্রিপশন হ্যান্ডরাইটিং ওসিআর স্ক্যানার\n• ১৭,৫৮৯+ ডিজিডিএ অনুমোদিত ঔষধের ডাটাবেজ\n• রিয়েল-টাইম ড্রাগ-ড্রাগ ইন্টারেকশন ওয়ার্নিং",
  });
  const [activeTab, setActiveTab] = useState<"download" | "guide">("download");
  const [isAndroidDevice, setIsAndroidDevice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      setIsAndroidDevice(/Android/i.test(ua));

      // Fetch dynamic version & download URL from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${apiUrl}/api/v1/system/app-control?platform=android`)
        .then((res) => res.json())
        .then((data: AppControlResponse) => {
          if (data?.update) {
            setAppInfo({
              version: data.update.latest_version || "1.0.0",
              fileSize: data.update.file_size || "24.8 MB",
              downloadUrl:
                data.update.download_url ||
                `${apiUrl}/api/v1/system/download-apk`,
              notes: data.update.notes || appInfo.notes,
            });
          }
        })
        .catch(() => {
          // Fallback to direct redirector
          setAppInfo((prev) => ({
            ...prev,
            downloadUrl: `${apiUrl}/api/v1/system/download-apk`,
          }));
        });
    }
  }, []);

  if (!isOpen) return null;

  const downloadTargetUrl =
    appInfo.downloadUrl ||
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/system/download-apk`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    typeof window !== "undefined"
      ? `${window.location.origin}/api/v1/system/download-apk`
      : downloadTargetUrl
  )}&bgcolor=FFFFFF&color=0F766E&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-bangla">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/medbangla_icon.jpg"
                alt="MedBangla AI"
                width={40}
                height={40}
                className="object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-100 border border-teal-300/30">
                  অফিসিয়াল অ্যান্ড্রয়েড এপিকে
                </span>
                <span className="text-xs font-mono font-bold text-teal-200">
                  v{appInfo.version}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                মেডবাংলা এআই অ্যাপ ডাউনলোড
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("download")}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "download"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>ডাউনলোড ও তথ্য</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "guide"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>ইনস্টলেশন গাইড (৩টি ধাপ)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "download" ? (
            <>
              {/* Feature Highlights Card */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0F766E]" />
                    কেন অ্যান্ড্রয়েড অ্যাপ ব্যবহার করবেন?
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-200/60 px-2 py-0.5 rounded-md">
                    সাইজ: {appInfo.fileSize}
                  </span>
                </div>
                <p className="text-xs text-teal-900/90 leading-relaxed font-medium">
                  মোবাইল ফোনের হাই-রেজ্যুলেশন ক্যামেরা দিয়ে যেকোনো ডাক্তারের বাংলা প্রেসক্রিপশন সরাসরি স্ক্যান করুন এবং সেকেন্ডের মধ্যে ড্রাগ ইন্টারেকশন ও সেফটি অ্যালার্ট জানুন।
                </p>
              </div>

              {/* Main 1-Click Download Button */}
              <div className="space-y-2">
                <a
                  href={downloadTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm sm:text-base font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                >
                  <Download className="w-5 h-5 text-teal-200 animate-bounce" />
                  <span>সরাসরি APK ডাউনলোড করুন ({appInfo.fileSize})</span>
                </a>
                <p className="text-[11px] text-center text-slate-400 font-medium">
                  গুগল ড্রাইভ হাই-স্পিড সিকিউর ডাউনলোড • অ্যান্ড্রয়েড ৮.০ বা তদূর্ধ্ব
                </p>
              </div>

              {/* Verification & Trust Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">১০০% নিরাপদ</span>
                    <span className="text-[10px] text-slate-500">ভাইরাস ও ম্যালওয়্যার মুক্ত</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0F766E] shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">ডিজিডিএ ডাটাবেজ</span>
                    <span className="text-[10px] text-slate-500">১৭,৫৮৯+ ঔষধের তথ্য</span>
                  </div>
                </div>
              </div>

              {/* Non-Android / Desktop Users: Scan QR Code */}
              {!isAndroidDevice && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border border-teal-200 bg-white p-1.5 shrink-0 shadow-2xs">
                    <img
                      src={qrCodeUrl}
                      alt="Scan to download APK"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4 h-4 text-[#0F766E]" />
                      মোবাইলে স্ক্যান করে ডাউনলোড করুন
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      আপনার অ্যান্ড্রয়েড ফোনের ক্যামেরা দিয়ে এই কিউআর (QR) কোডটি স্ক্যান করলে সরাসরি ফোনে APK ডাউনলোড শুরু হবে।
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Installation 3-Step Guide */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  প্লে-স্টোরের বাইরের অফিসিয়াল APK হওয়ায় অ্যান্ড্রয়েড প্রথমবার ইনস্টলেশনের অনুমতি চাইতে পারে। এটি সম্পূর্ণ নিরাপদ।
                </span>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-xs font-black">
                    ১
                  </span>
                  <span>ধাপ ১: APK ফাইলটি ডাউনলোড করুন</span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed font-medium">
                  ডাউনলোড বাটনে চাপ দিয়ে <code className="text-teal-800 bg-teal-50 px-1 py-0.5 rounded font-mono">app-release.apk</code> ফাইলটি আপনার ফোনে সেভ হতে দিন। ব্রাউজারে &quot;File might be harmful&quot; আসলে <strong>&quot;Download anyway&quot;</strong> সিলেক্ট করুন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-xs font-black">
                    ২
                  </span>
                  <span>ধাপ ২: Unknown Sources / অনুমতি অন করুন</span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed font-medium">
                  ডাউনলোড শেষে ফাইলে ক্লিক করুন। সেটিংস ওপেন হলে <strong>&quot;Allow from this source&quot;</strong> বা <strong>&quot;Install unknown apps&quot;</strong> অপশনটি চালু করে দিন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-xs font-black">
                    ৩
                  </span>
                  <span>ধাপ ৩: ইনস্টল ও ব্যবহার শুরু করুন</span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed font-medium">
                  এবার <strong>&quot;Install&quot;</strong> বাটনে ট্যাপ করুন। কয়েক সেকেন্ডের মধ্যে ইনস্টল সম্পন্ন হবে। অ্যাপ ওপেন করে আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={downloadTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>এখনই ডাউনলোড শুরু করুন</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Ribbon */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>মেডবাংলা এআই ক্লিনিক্যাল টিম ভেরিফাইড</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
