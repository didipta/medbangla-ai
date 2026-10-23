"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Radio,
  Download,
  Info,
  HelpCircle,
} from "lucide-react";
import { adminApi, AppControlData } from "../../services/adminApi";

export default function AppControlPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingLink, setTestingLink] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isDemo, setIsDemo] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<AppControlData>({
    is_maintenance_mode: false,
    maintenance_title: "মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে",
    maintenance_message:
      "আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের নিয়মিত উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।",
    maintenance_eta: "৩০ মিনিট",
    emergency_contact: "support@medbangla.ai",
    latest_version: "1.0.0",
    latest_version_code: 1,
    min_supported_version: "1.0.0",
    min_supported_version_code: 1,
    is_force_update: false,
    update_title: "মেডবাংলা এআই এর নতুন সংস্করণ উপলব্ধ",
    update_notes:
      "• প্রেসক্রিপশন ওসিআর স্ক্যানার অপ্টিমাইজেশন\n• ডিজিডিএ ১৭,৫৮৯+ ঔষধের সর্বশেষ মূল্য ও ডাটাবেজ যুক্ত\n• ড্রাগ-ড্রাগ ইন্টারেকশন ও ড্রাগ অ্যালার্জি সেফটি এলার্ট আপডেট\n• বাগ ফিক্স এবং দ্রুততর পারফরম্যান্স",
    apk_google_drive_url: "",
    apk_direct_download_url: "",
    apk_file_size: "24.8 MB",
  });

  // Mobile Simulator View Tab: "maintenance" | "force_update" | "flexible_update"
  const [simulatorTab, setSimulatorTab] = useState<
    "maintenance" | "force_update" | "flexible_update"
  >("maintenance");

  useEffect(() => {
    setIsDemo(adminApi.isDemoMode());
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAppControl();
      setFormData(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load app control settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await adminApi.updateAppControl(formData);
      setFormData(updated);
      showToast("অ্যাপ কন্ট্রোল ও আপডেট সেটিংস সফলভাবে প্রকাশ করা হয়েছে!", "success");
    } catch (err: any) {
      showToast(err.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestDriveLink = async () => {
    if (!formData.apk_google_drive_url) {
      showToast("অনুগ্রহ করে একটি গুগল ড্রাইভ লিংক দিন", "error");
      return;
    }

    try {
      setTestingLink(true);
      const res = await adminApi.testDriveLink(formData.apk_google_drive_url);
      setFormData((prev) => ({
        ...prev,
        apk_direct_download_url: res.direct_download_url,
      }));
      showToast(
        res.is_google_drive
          ? `গুগল ড্রাইভ ফাইল আইডি (${res.file_id}) শনাক্ত ও ডিরেক্ট লিংক তৈরি হয়েছে!`
          : "ডিরেক্ট ডাউনলোড লিংক তৈরি সম্পন্ন হয়েছে!",
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "গুগল ড্রাইভ লিংক পরীক্ষা ব্যর্থ হয়েছে", "error");
    } finally {
      setTestingLink(false);
    }
  };

  const handleCopyDirectUrl = () => {
    if (!formData.apk_direct_download_url) return;
    navigator.clipboard.writeText(formData.apk_direct_download_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("ডিরেক্ট ডাউনলোড লিংক ক্লিপবোর্ডে কপি করা হয়েছে!", "success");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-bangla">
        <div className="w-9 h-9 border-3 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Loading App Lifecycle Controls...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn font-bangla text-[#0F172A] pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-bold transition-all animate-slideIn ${
            toastType === "success"
              ? "bg-[#F0FDFA] text-[#0F766E] border-teal-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-[#0F766E] transition-colors">
              Admin Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0F766E]">App & Update Control</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-[#0F766E]" />
            <span>অ্যাপ কন্ট্রোল, আপডেট ও মেইনটেন্যান্স সেন্টার</span>
            {isDemo ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                Demo Sandbox
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                Live Cloud Sync
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            মোবাইল অ্যাপের লাইভ মেইনটেন্যান্স সুইচ, গুগল ড্রাইভ এপিকে রিলিজ এবং ফোর্স আপডেট পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>রিফ্রেশ</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-black transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সেটিংস প্রকাশ করুন"}</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner if Maintenance Mode Active */}
      {formData.is_maintenance_mode && (
        <div className="bg-rose-50 border-2 border-rose-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-rose-900 flex items-center gap-2">
                <span>সিস্টেম রক্ষণাবেক্ষণ মোড সক্রিয় রয়েছে (MAINTENANCE MODE ON)</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-950">
                  LIVE BLOCKED
                </span>
              </h3>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                সকল সাধারণ ব্যবহারকারী ও ডাক্তারের অ্যাপে অ্যাক্সেস সাময়িকভাবে বন্ধ আছে। মেইনটেন্যান্স সম্পন্ন হলে নিচে সুইচটি বন্ধ করুন।
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, is_maintenance_mode: false }))
            }
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer shrink-0 transition-all"
          >
            এখনই মেইনটেন্যান্স বন্ধ করুন
          </button>
        </div>
      )}

      {/* Main Grid: Form Inputs (Left) & Smartphone Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Master Maintenance Switch */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    formData.is_maintenance_mode
                      ? "bg-rose-100 text-rose-700"
                      : "bg-[#F0FDFA] text-[#0F766E]"
                  }`}
                >
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    মেইনটেন্যান্স মোড কন্ট্রোল (Maintenance Mode)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    জরুরি সার্ভার আপগ্রেড বা ডাটাবেজ মেইনটেন্যান্সের সময় অন করুন
                  </p>
                </div>
              </div>

              {/* Master Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_maintenance_mode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_maintenance_mode: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মেইনটেন্যান্স হেডলাইন (Title)
                </label>
                <input
                  type="text"
                  value={formData.maintenance_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maintenance_title: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  placeholder="যেমন: মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>সম্ভাব্য সময়কাল (Estimated ETA)</span>
                  <span className="text-[10px] text-slate-400">সময় উল্লেখ করুন</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.maintenance_eta}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maintenance_eta: e.target.value,
                      }))
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="যেমন: ৩০-৪৫ মিনিট"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মেইনটেন্যান্স বার্তা (ব্যবহারকারীদের প্রদর্শিত নোটিশ)
                </label>
                <textarea
                  rows={3}
                  value={formData.maintenance_message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maintenance_message: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  placeholder="ব্যবহারকারীদের জন্য সহায়ক বার্তা লিখুন..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  জরুরি যোগাযোগ ইমেইল / সাপোর্ট
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergency_contact: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  placeholder="support@medbangla.ai"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Google Drive APK & In-App Update Engine */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    গুগল ড্রাইভ APK ও নতুন সংস্করণ রিলিজ
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    গুগল ড্রাইভ শেয়ারিং লিংক থেকে সরাসরি হাই-স্পিড ডিরেক্ট ডাউনলোড তৈরি করুন
                  </p>
                </div>
              </div>
            </div>

            {/* Google Drive Link Input & Converter Button */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                <span>১. গুগল ড্রাইভ APK শেয়ারিং লিংক (Google Drive Share Link)</span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-2 py-0.5 rounded-md">
                  Auto-Direct Download Converter
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={formData.apk_google_drive_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      apk_google_drive_url: e.target.value,
                    }))
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono"
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                />
                <button
                  type="button"
                  onClick={handleTestDriveLink}
                  disabled={testingLink || !formData.apk_google_drive_url}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-black cursor-pointer disabled:opacity-50 shrink-0 transition-all shadow-2xs"
                >
                  {testingLink ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                  )}
                  <span>{testingLink ? "যাচাই হচ্ছে..." : "কনভার্ট ও টেস্ট লিংক"}</span>
                </button>
              </div>

              {/* Direct Download Link Display */}
              {formData.apk_direct_download_url && (
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5 text-teal-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      কনভার্টকৃত ডিরেক্ট ডাউনলোড লিংক:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyDirectUrl}
                        className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0D655E] cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copied ? "কপি হয়েছে!" : "কপি করুন"}</span>
                      </button>
                      <a
                        href={formData.apk_direct_download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>পরীক্ষা করুন</span>
                      </a>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-teal-50/60 border border-teal-200/80 text-[11px] font-mono text-teal-900 truncate select-all">
                    {formData.apk_direct_download_url}
                  </div>
                </div>
              )}
            </div>

            {/* Version Numbers & Force Update Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  লেটেস্ট সংস্করণ নাম (Version)
                </label>
                <input
                  type="text"
                  value={formData.latest_version}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latest_version: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  placeholder="1.1.0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  লেটেস্ট সংস্করণ কোড (Code)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.latest_version_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latest_version_code: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  APK ফাইল সাইজ
                </label>
                <input
                  type="text"
                  value={formData.apk_file_size}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      apk_file_size: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  placeholder="24.8 MB"
                />
              </div>
            </div>

            {/* Minimum Supported Version & Force Update Card */}
            <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950">
                      বাধ্যতামূলক আপডেট (Force Update Mode)
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      অন থাকলে ব্যবহারকারীদের অবশ্যই অ্যাপ আপডেট করতে হবে, অন্যথায় অ্যাপ ব্লক থাকবে
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_force_update}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_force_update: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    সর্বনিম্ন গ্রহণযোগ্য সংস্করণ কোড (Min Supported Code)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_supported_version_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        min_supported_version_code: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-slate-800"
                    placeholder="1"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    এই কোডের নিচের যেকোনো সংস্করণ ইনস্টল করা থাকলে বাধ্যতামূলক আপডেট হবে।
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    আপডেট ডায়ালগ শিরোনাম (Update Title)
                  </label>
                  <input
                    type="text"
                    value={formData.update_title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        update_title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-slate-800"
                    placeholder="মেডবাংলা এআই এর নতুন সংস্করণ উপলব্ধ"
                  />
                </div>
              </div>
            </div>

            {/* Release Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>নতুন ফিচারের তালিকা / রিলিজ নোটস (What's New in Bangla)</span>
                <span className="text-[10px] text-slate-400">প্রতি লাইনে বুলেট পয়েন্ট ব্যবহার করুন</span>
              </label>
              <textarea
                rows={4}
                value={formData.update_notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    update_notes: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0F766E] font-sans"
                placeholder="• নতুন ফিচারের বিবরণ লিখুন..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Smartphone Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-sm font-black text-slate-900">
                  স্মার্টফোন প্রিভিউ সিমুলেটর (Client Mockup)
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Live Preview
              </span>
            </div>

            {/* Simulator View Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSimulatorTab("maintenance")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  simulatorTab === "maintenance"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                মেইনটেন্যান্স
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab("force_update")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  simulatorTab === "force_update"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ফোর্স আপডেট
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab("flexible_update")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  simulatorTab === "flexible_update"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ফ্লেক্সিবল আপডেট
              </button>
            </div>

            {/* Realistic Phone Frame */}
            <div className="relative mx-auto w-full max-w-[320px] rounded-[38px] border-[8px] border-slate-900 bg-slate-950 p-2.5 shadow-2xl overflow-hidden aspect-[9/18]">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Phone Screen Area */}
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-white flex flex-col justify-between pt-7 pb-4 px-4 text-slate-800">
                {/* 1. Maintenance Screen Mockup */}
                {simulatorTab === "maintenance" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-3 animate-fadeIn">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200/90 text-[#0F766E] flex items-center justify-center shadow-xs">
                      <ShieldAlert className="w-7 h-7 text-[#0F766E]" />
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 mb-1">
                        সার্ভার উন্নয়ন কাজ চলছে
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {formData.maintenance_title || "সিস্টেম রক্ষণাবেক্ষণ চলছে"}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium px-1">
                      {formData.maintenance_message}
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-[#0F766E]" />
                      <span>সম্ভাব্য সময়: {formData.maintenance_eta}</span>
                    </div>

                    <div className="w-full pt-3 space-y-2">
                      <button className="w-full py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-black shadow-xs">
                        পুনরায় চেষ্টা করুন (Retry)
                      </button>
                      <p className="text-[9px] text-slate-400">
                        জরুরি সহায়তা: {formData.emergency_contact}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Force Update Modal Mockup */}
                {simulatorTab === "force_update" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-2 space-y-3 animate-fadeIn">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
                      <Download className="w-7 h-7 text-amber-600" />
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-1">
                        বাধ্যতামূলক আপডেট v{formData.latest_version}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {formData.update_title || "নতুন সংস্করণ উপলব্ধ"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        সাইজ: {formData.apk_file_size} • সংস্করণ কোড: {formData.latest_version_code}
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-left max-h-[110px] overflow-y-auto">
                      <span className="text-[10px] font-black text-slate-700 block mb-1">
                        নতুন কী যুক্ত হয়েছে:
                      </span>
                      <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed">
                        {formData.update_notes}
                      </p>
                    </div>

                    <div className="w-full pt-2">
                      <button className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>এখনই আপডেট করুন (Update Now)</span>
                      </button>
                      <p className="text-[9px] text-rose-500 font-bold mt-1.5">
                        * অ্যাপ ব্যবহার চালিয়ে যেতে আপডেট করা বাধ্যতামূলক
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Flexible Update Dialog Mockup */}
                {simulatorTab === "flexible_update" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-2 space-y-3 animate-fadeIn">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-teal-200 text-[#0F766E] flex items-center justify-center shadow-xs">
                      <Sparkles className="w-7 h-7 text-[#0F766E]" />
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 mb-1">
                        ঐচ্ছিক আপডেট v{formData.latest_version}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {formData.update_title || "নতুন সংস্করণ উপলব্ধ"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        সাইজ: {formData.apk_file_size}
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-left max-h-[110px] overflow-y-auto">
                      <span className="text-[10px] font-black text-slate-700 block mb-1">
                        রিলিজ নোটস:
                      </span>
                      <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed">
                        {formData.update_notes}
                      </p>
                    </div>

                    <div className="w-full pt-2 grid grid-cols-2 gap-2">
                      <button className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                        পরে করুন
                      </button>
                      <button className="w-full py-2 rounded-xl bg-[#0F766E] text-white text-xs font-black shadow-xs flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>আপডেট</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Phone Bottom Home Indicator */}
                <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
