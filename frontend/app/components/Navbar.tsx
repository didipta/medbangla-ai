"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, openAuthModal, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F766E] text-white shadow-xs group-hover:bg-[#115E59] transition-colors">
            <span className="font-extrabold text-base tracking-tight">মে</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
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
          <div className="hidden xl:flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs text-slate-600">
            <span className="relative flex h-2 w-2">
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
            <span className="text-[11px] font-medium text-slate-700">
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

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg bg-slate-50 hover:bg-slate-100 p-1.5 pr-2.5 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="h-6 w-6 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-slate-800 hidden sm:inline-block max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-[#0F766E] font-medium mt-0.5">
                      {currentUser.role === "doctor"
                        ? t("ভেরিফাইড চিকিৎসক", "Verified Physician")
                        : t("রোগী অ্যাকাউন্ট", "Patient Account")}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
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
              className="flex items-center gap-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t("লগইন", "Login")}</span>
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
