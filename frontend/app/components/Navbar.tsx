"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Stethoscope,
  Database,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { api } from "../services/api";
import { SystemHealth } from "../types/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useAppSelector } from "../store";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Completely omit patient/consumer Navbar on all dedicated admin portal routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const { currentUser, openAuthModal, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { dailyQuota } = useAppSelector((state) => state.prescription);

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      const { data, durationMs } = await api.getHealth();
      setHealth(data);
      setLatency(durationMs);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
      setLatency(null);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show only Home and About & Safety when unauthenticated; show all pages once logged in
  const navLinks = currentUser
    ? [
        { href: "/", label: t("হোম", "Home"), icon: Sparkles },
        { href: "/checker", label: t("প্রেসক্রিপশন চেকার", "Prescription Checker"), icon: Stethoscope },
        { href: "/medicines", label: t("ওষুধের তালিকা", "Medicines"), icon: Database },
        { href: "/about", label: t("নির্দেশিকা ও নিরাপত্তা", "About & Safety"), icon: ShieldCheck },
      ]
    : [
        { href: "/", label: t("হোম", "Home"), icon: Sparkles },
        { href: "/about", label: t("নির্দেশিকা ও নিরাপত্তা", "About & Safety"), icon: ShieldCheck },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-teal-200/90 shadow-2xs group-hover:scale-105 transition-transform bg-white flex-shrink-0">
            <Image
              src="/images/medbangla_icon.jpg"
              alt="MedBangla AI Icon"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900">
                MedBangla <span className="text-[#0F766E]">AI</span>
              </span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0F766E] border border-teal-200/60 hidden sm:inline-block">
                {t("ক্লিনিক্যাল v২.০", "Clinical v2.0")}
              </span>
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-[#0F766E] font-bold shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0F766E]" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Switcher, Live Indicator & User Auth */}
        <div className="flex items-center gap-2.5">
          {/* Live System Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/80 px-3 py-1 text-xs text-slate-600">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? "bg-emerald-400" : "bg-rose-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? "bg-[#15803D]" : "bg-[#B91C1C]"
                }`}
              ></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap tracking-normal leading-none">
              {isOnline ? t("১৭,৫৮৯ ওষুধ লাইভ", "17,589 Medicines Live") : t("কানেক্টিং...", "Connecting...")}
            </span>
          </div>

          {/* Primary Language Switcher: First is Bangla, Second is English */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLang("bn")}
              title="বাংলা ভাষা নির্বাচন করুন"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === "bn"
                  ? "bg-white text-[#0F766E] shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>বাংলা</span>
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              title="Switch to English"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-white text-[#0F766E] shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>EN</span>
            </button>
          </div>

          {/* User Profile or Google Sign In CTA */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                aria-label="User profile menu"
              >
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full object-cover border border-teal-600/30 shadow-xs"
                    onError={(e) => {
                      // Fallback if avatar fails to load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-slate-900 font-bold max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-teal-700 font-medium">
                    {currentUser.role === "doctor" ? t("চিকিৎসক", "Physician") : t("রোগী", "Patient")}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-2 animate-in fade-in duration-100">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 mb-2">
                      {currentUser.picture ? (
                        <img
                          src={currentUser.picture}
                          alt={currentUser.name}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover border border-teal-500/30"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                      <span className="font-semibold text-slate-600">
                        {currentUser.role === "doctor"
                          ? t("ভেরিফাইড চিকিৎসক", "Verified Physician")
                          : t("রোগী অ্যাকাউন্ট", "Patient Account")}
                      </span>
                      {currentUser.bmdc_number && (
                        <span className="font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                          BMDC: {currentUser.bmdc_number}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-500 font-medium">
                        {t("দৈনিক বিশ্লেষণ কোটা:", "Daily Analysis Quota:")}
                      </span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        dailyQuota.remaining > 0
                          ? "bg-teal-50 text-teal-800 border border-teal-200/60"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {dailyQuota.remaining}/{dailyQuota.daily_limit} {t("অবশিষ্ট", "left")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t("লগআউট করুন", "Sign Out")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t("গুগল লগইন", "Sign in with Google")}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? "bg-teal-50 text-[#0F766E] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile User Profile or Google Sign In */}
          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2.5">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-teal-500/40"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-900 text-xs truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-rose-600 bg-rose-50/80 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("লগআউট", "Sign Out")}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t("গুগল দিয়ে লগইন", "Sign in with Google")}</span>
              </button>
            )}
          </div>

          {/* Mobile Language Switcher */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">ভাষা / Language:</span>
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`px-3 py-1 rounded-md text-xs transition-all ${
                  lang === "bn" ? "bg-white text-[#0F766E] font-bold shadow-2xs" : "text-slate-600"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-md text-xs transition-all ${
                  lang === "en" ? "bg-white text-[#0F766E] font-bold shadow-2xs" : "text-slate-600"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
