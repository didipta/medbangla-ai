"use client";

import React, { useState, useEffect, useRef } from "react";
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
  PhoneCall,
  Activity,
  CheckCircle2,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { api } from "../services/api";
import { SystemHealth } from "../types/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useAppDispatch, useAppSelector } from "../store";
import { clearUserSessionData } from "../store/slices/prescriptionSlice";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Completely omit patient/consumer Navbar on all dedicated admin portal routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const { currentUser, openAuthModal, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { dailyQuota } = useAppSelector((state) => state.prescription);

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

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
    // Poll system health once every 1 minute (60,000 ms)
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open to prevent awkward background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on tablet/desktop screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click for user dropdown menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="MedBangla AI Home">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl overflow-hidden border border-teal-200/90 shadow-2xs group-hover:scale-105 transition-transform bg-white flex-shrink-0">
              <Image
                src="/images/medbangla_icon.jpg"
                alt="MedBangla AI Icon"
                width={36}
                height={36}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                MedBangla <span className="text-[#0F766E]">AI</span>
              </span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0F766E] border border-teal-200/60 hidden sm:inline-block">
                {t("ক্লিনিক্যাল v২.০", "Clinical v2.0")}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Visible on md and above) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Live System Indicator (Desktop wide only) */}
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

            {/* Language Switcher: Compact & Segmented */}
            <div className="flex items-center rounded-lg sm:rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 text-[11px] sm:text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang("bn")}
                title="বাংলা ভাষা নির্বাচন করুন"
                className={`flex items-center px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg transition-all cursor-pointer ${
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
                className={`flex items-center px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-[#0F766E] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>EN</span>
              </button>
            </div>

            {/* User Profile or Google Sign In */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 p-1 sm:p-1.5 sm:pr-3 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  aria-label="User profile menu"
                  aria-expanded={showUserMenu}
                >
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full object-cover border border-teal-600/30 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-slate-900 font-bold max-w-[100px] truncate leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium">
                      {currentUser.role === "doctor" ? t("চিকিৎসক", "Physician") : t("রোগী", "Patient")}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu (Desktop & Tablet) */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
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
                          {t("দৈনিক কোটা:", "Daily Quota:")}
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
                        dispatch(clearUserSessionData());
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
              <>
                {/* Full Google Sign In Button (Visible on sm and up) */}
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer whitespace-nowrap"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{t("গুগল লগইন", "Sign In")}</span>
                </button>

                {/* Compact Sign-In icon for small mobile (< sm) */}
                <button
                  onClick={() => openAuthModal("login")}
                  className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-300 shadow-2xs hover:bg-slate-50 text-slate-700"
                  title={t("গুগল সাইন-ইন", "Sign in with Google")}
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4 text-[#0F766E]" />
                </button>
              </>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Modern Slide-Down Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <aside
            className="fixed top-16 inset-x-0 bottom-0 z-50 bg-white md:hidden overflow-y-auto flex flex-col justify-between border-t border-slate-200 shadow-2xl animate-in slide-in-from-top-3 duration-200 text-slate-900"
            aria-label="Mobile Navigation"
          >
            <div className="p-4 space-y-4">
              {/* Profile or Google CTA Section */}
              {currentUser ? (
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.picture ? (
                      <img
                        src={currentUser.picture}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-full object-cover border-2 border-teal-500/30 shadow-xs"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden min-w-0">
                      <div className="font-extrabold text-slate-900 text-sm truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                    </div>
                  </div>

                  {/* Quota & Role Pills */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px]">{t("অ্যাকাউন্ট টাইপ", "Account Type")}</span>
                      <span className="font-bold text-teal-800 truncate block">
                        {currentUser.role === "doctor" ? t("ভেরিফাইড চিকিৎসক", "Verified Doctor") : t("রোগী অ্যাকাউন্ট", "Patient")}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px]">{t("দৈনিক ফ্রি কোটা", "Daily Free Quota")}</span>
                      <span className="font-bold text-[#0F766E] block font-mono">
                        {dailyQuota.remaining}/{dailyQuota.daily_limit} {t("বাকি", "left")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      dispatch(clearUserSessionData());
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 bg-rose-50 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer border border-rose-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("লগআউট করুন", "Sign Out")}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-slate-50 rounded-2xl border border-teal-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t("মেডবাংলা এআই অ্যাকাউন্টে স্বাগতম", "Welcome to MedBangla AI")}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(
                      "আপনার প্রেসক্রিপশন নিরাপদে স্ক্যান করতে ও ফ্রি দৈনিক কোটা পেতে গুগল দিয়ে সহজে লগইন করুন।",
                      "Sign in with Google to unlock full prescription OCR scanning and daily verified quota."
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-800 border border-slate-300 shadow-xs cursor-pointer active:scale-98 transition-all"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{t("গুগল দিয়ে সাইন-ইন করুন", "Continue with Google")}</span>
                  </button>
                </div>
              )}

              {/* Navigation Links with Active Highlight & Touch Targets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                  {t("মেনু নেভিগেশন", "Navigation")}
                </div>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-teal-50 text-[#0F766E] border border-teal-200/80 shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? "bg-[#0F766E] text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{link.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-[#0F766E]" : "text-slate-300"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Drawer Footer: Live Status & Hotlines */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* System Live Status */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isOnline ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isOnline ? "bg-[#15803D]" : "bg-[#B91C1C]"
                      }`}
                    ></span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    {isOnline ? t("ডিজিডিএ ডাটাবেজ লাইভ", "DGDA Registry Live") : t("সার্ভার কানেক্টিং...", "Connecting...")}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                  {t("১৭,৫৮৯ ওষুধ", "17,589 Meds")}
                </span>
              </div>

              {/* Emergency Hotline Direct Tap */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <a
                  href="tel:16263"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 text-white font-bold shadow-2xs hover:bg-teal-700 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t("স্বাস্থ্য বাতায়ন: ১৬২৬৩", "Call 16263")}</span>
                </a>
                <a
                  href="tel:999"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 text-white font-bold shadow-2xs hover:bg-rose-700 transition-colors"
                >
                  <span>{t("জরুরি ৯৯৯", "999")}</span>
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
