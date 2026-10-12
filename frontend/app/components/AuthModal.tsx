"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
  FileCheck2,
  KeyRound,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
  title?: string;
  bmdc?: string;
  avatar?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "login",
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register" | "otp">(initialMode);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bmdcNumber, setBmdcNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  // Handle Quick 1-Click Demo Logins
  const handleDemoLogin = (demoRole: "doctor" | "patient") => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const user: AuthUser =
        demoRole === "doctor"
          ? {
              id: "doc-101",
              name: "ডাঃ মোঃ ফজলুল হক",
              email: "dr.fazlul@medbangla.ai",
              role: "doctor",
              title: "MBBS, FCPS (Medicine) | সিএমএইচ ঢাকা",
              bmdc: "A-54921",
            }
          : {
              id: "pat-202",
              name: "মাহাদী হাসান",
              email: "mahdi.hasan@medbangla.ai",
              role: "patient",
              title: "রোগী (৪৯ বছর)",
            };

      localStorage.setItem("medbangla_user", JSON.stringify(user));
      setLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 500);
  };

  // Handle Standard Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login" && (!email || !password)) {
      setError(t("অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।", "Please provide both email and password."));
      return;
    }

    if (mode === "register" && (!name || !email || !password)) {
      setError(t("অনুগ্রহ করে আপনার নাম, ইমেইল ও পাসওয়ার্ড প্রদান করুন।", "Please enter your name, email, and password."));
      return;
    }

    if (mode === "otp" && !phone) {
      setError(t("অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন।", "Please enter a valid phone number."));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user: AuthUser = {
        id: `user-${Date.now()}`,
        name: name || (email.split("@")[0].replace(".", " ").toUpperCase()),
        email: email || `${phone}@phone.medbangla.ai`,
        role: role,
        title: role === "doctor" ? t("মেডিকেল প্রফেশনাল", "Medical Professional") : t("রেজিস্টার্ড রোগী", "Registered Patient"),
        bmdc: role === "doctor" ? bmdcNumber || "A-98765" : undefined,
      };

      localStorage.setItem("medbangla_user", JSON.stringify(user));
      setLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Security Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-[#0F766E] border border-teal-200/60 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("নিরাপদ ক্লিনিক্যাল লগইন পোর্টাল", "Secure Clinical Portal")}</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("মেডবাংলা এআই এ স্বাগতম", "Welcome to MedBangla AI")}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t(
              "প্রেসক্রিপশন ওসিয়ার, ড্রাগ সেফটি রিপোর্ট ও এআই চ্যাট কনসালটেশন শুরু করতে আপনার অ্যাকাউন্টে প্রবেশ করুন",
              "Sign in to unlock prescription OCR analysis, drug interaction reports, and grounded clinical chat."
            )}
          </p>
        </div>

        {/* 1-Click Instant Demo Access Strip */}
        <div className="rounded-xl bg-teal-50/60 p-3.5 border border-teal-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-[#0F766E]">
              <Sparkles className="w-3.5 h-3.5" />
              {t("দ্রুত পরীক্ষার জন্য ১-ক্লিক ডেমো লগইন:", "Quick 1-Click Evaluation Login:")}
            </span>
            <span className="text-[10px] text-teal-700 font-normal">{t("পাসওয়ার্ড ছাড়া", "Password-free")}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("patient")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-teal-300/70 text-xs font-bold text-slate-800 hover:border-[#0F766E] hover:bg-teal-50/50 transition-all shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{t("রোগী ডেমো (মাহাদী)", "Patient Demo (Mahadi)")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("doctor")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-teal-300/70 text-xs font-bold text-slate-800 hover:border-[#0F766E] hover:bg-teal-50/50 transition-all shadow-2xs cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{t("চিকিৎসক ডেমো (ডাঃ ফজলুল)", "Doctor Demo (Dr. Fazlul)")}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#0F766E] shadow-2xs font-extrabold"
                : "hover:text-slate-900"
            }`}
          >
            {t("ইমেইল লগইন", "Email Login")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white text-[#0F766E] shadow-2xs font-extrabold"
                : "hover:text-slate-900"
            }`}
          >
            {t("নতুন সাইন আপ", "Register")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("otp");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "otp"
                ? "bg-white text-[#0F766E] shadow-2xs font-extrabold"
                : "hover:text-slate-900"
            }`}
          >
            {t("মোবাইল ওটিপি", "Mobile OTP")}
          </button>
        </div>

        {/* Role Selector (Patient vs Doctor) */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t("ব্যবহারকারীর ভূমিকা নির্বাচন করুন:", "Select Account Role:")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === "patient"
                    ? "bg-teal-50 border-[#0F766E] text-[#0F766E]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t("রোগী / সাধারণ গ্রাহক", "Patient / General")}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === "doctor"
                    ? "bg-teal-50 border-[#0F766E] text-[#0F766E]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t("রেজিস্টার্ড চিকিৎসক", "Licensed Doctor")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === "register" && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t("আপনার পুরো নাম:", "Full Name:")}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "doctor" ? t("ডাঃ রফিকুল ইসলাম", "Dr. Rafiqul Islam") : t("মাহাদী হাসান", "Mahadi Hasan")}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-[#0F766E] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === "register" && role === "doctor" && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t("বিএমডিসি রেজিস্ট্রেশন নম্বর (BMDC ID):", "BMDC Registration Number:")}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={bmdcNumber}
                  onChange={(e) => setBmdcNumber(e.target.value)}
                  placeholder="A-54921"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:border-[#0F766E] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode !== "otp" ? (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("ইমেইল অ্যাড্রেস:", "Email Address:")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-[#0F766E] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("পাসওয়ার্ড:", "Password:")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:border-[#0F766E] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t("মোবাইল নম্বর (বাংলাদেশ):", "Mobile Number (Bangladesh):")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:border-[#0F766E] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] py-3 text-xs font-extrabold text-white transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t("প্রসেস করা হচ্ছে...", "Processing...")}</span>
              </>
            ) : mode === "login" ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{t("লগইন করুন", "Sign In")}</span>
              </>
            ) : mode === "register" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("অ্যাকাউন্ট তৈরি করুন", "Create Account")}</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>{t("ওটিপি কোড পাঠান", "Send OTP Code")}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
