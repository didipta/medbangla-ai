"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Server,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Activity,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Users,
  Pill,
  Smartphone,
} from "lucide-react";
import { adminApi, AdminUser } from "../services/adminApi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    const demoMode = adminApi.isDemoMode();
    setIsDemo(demoMode);

    const token = adminApi.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const profile = adminApi.getAdminProfile();
    if (profile) {
      setAdminUser(profile);
      setAuthorized(true);
    } else {
      adminApi
        .getMe()
        .then((res) => {
          setAdminUser(res.admin);
          setAuthorized(true);
        })
        .catch(() => {
          adminApi.removeToken();
          router.push("/admin/login");
        });
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    adminApi.removeToken();
    router.push("/admin/login");
  };

  const handleResetDemoData = () => {
    adminApi.resetDemoData();
    window.location.reload();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  if (!authorized && !isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-[#FAFDFB] flex items-center justify-center font-bangla">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#0F766E]">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const allNavItems = [
    {
      label: "Dashboard & Analytics",
      bengaliLabel: "ওভারভিউ ও অ্যানালিটিক্স",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Prescriptions Audit",
      bengaliLabel: "প্রেসক্রিপশন অডিট লগ",
      href: "/admin/prescriptions",
      icon: FileText,
      active: pathname === "/admin/prescriptions",
    },
    {
      label: "User Accounts",
      bengaliLabel: "ইউজার অ্যাকাউন্ট তালিকা",
      href: "/admin/users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      label: "Medicine Catalog",
      bengaliLabel: "ঔষধ ডিরেক্টরি (CRUD)",
      href: "/admin/medicines",
      icon: Pill,
      active: pathname === "/admin/medicines",
    },
    {
      label: "Drug Safety Matrix",
      bengaliLabel: "ড্রাগ ইন্টারেকশন সেফটি",
      href: "/admin/interactions",
      icon: AlertTriangle,
      active: pathname === "/admin/interactions",
    },
    {
      label: "System Diagnostics",
      bengaliLabel: "ইনফ্রাস্ট্রাকচার ও এআই হেলথ",
      href: "/admin/system",
      icon: Server,
      active: pathname === "/admin/system",
    },
    {
      label: "App & Update Control",
      bengaliLabel: "অ্যাপ কন্ট্রোল ও আপডেট",
      href: "/admin/app-control",
      icon: Smartphone,
      active: pathname === "/admin/app-control",
      realOnly: true, // Visible and operational ONLY in real login
    },
  ];

  // In Demo Mode: App & Update Control is hidden (only available in Real Admin Login)
  const navItems = isDemo ? allNavItems.filter((item) => !item.realOnly) : allNavItems;

  return (
    <div className="min-h-screen w-full bg-[#FAFDFB] text-[#0F172A] flex flex-col font-bangla antialiased selection:bg-[#0F766E] selection:text-white">
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-teal-200/90 shadow-2xs bg-white shrink-0">
              <Image
                src="/images/medbangla_icon.jpg"
                alt="MedBangla Admin"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">MedBangla Admin</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 flex w-full relative">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xs ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Brand Header */}
          <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-teal-200/90 shadow-sm shadow-teal-700/10 shrink-0 bg-white group-hover:scale-105 transition-transform">
                <Image
                  src="/images/medbangla_icon.jpg"
                  alt="MedBangla Admin"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 tracking-tight">MedBangla</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F0FDFA] text-[#0F766E] uppercase tracking-wider border border-teal-200">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block font-medium">Clinical Command Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Platform Status Card */}
          <div className={`mx-4 mt-5 p-3.5 rounded-xl border ${
            isDemo ? "bg-amber-50/70 border-amber-200" : "bg-[#F0FDFA] border-teal-200/80"
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-bold ${isDemo ? "text-amber-900" : "text-[#0F766E]"}`}>
                {isDemo ? "Sandbox Status" : "Engine Status"}
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isDemo 
                  ? "text-amber-800 bg-amber-100/80 border-amber-300"
                  : "text-emerald-800 bg-emerald-50 border-emerald-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDemo ? "bg-amber-600" : "bg-emerald-600"}`} />
                {isDemo ? "Demo Simulated" : "Live Online"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] mt-2 font-medium text-slate-600">
              <div className="flex items-center gap-1">
                <Database className={`w-3.5 h-3.5 ${isDemo ? "text-amber-700" : "text-[#0F766E]"}`} />
                <span>{isDemo ? "Mock DB (Active)" : "Neon PostgreSQL"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className={`w-3.5 h-3.5 ${isDemo ? "text-amber-700" : "text-emerald-700"}`} />
                <span>RapidOCR ONNX</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Clinical Navigation
            </div>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                  item.active
                    ? "bg-[#F0FDFA] text-[#0F766E] font-bold border-l-4 border-[#0F766E] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 ${
                      item.active ? "text-[#0F766E]" : "text-slate-400 group-hover:text-[#0F766E]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    item.active ? "opacity-100 text-[#0F766E]" : "text-slate-400"
                  }`}
                />
              </Link>
            ))}

            <div className="pt-6">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                External
              </div>
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0F766E] hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Public Patient Web</span>
                </div>
                <span className="text-[10px] text-[#0F766E] bg-[#F0FDFA] border border-teal-200 px-2 py-0.5 rounded font-bold">
                  Live
                </span>
              </Link>
            </div>
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs ${
                  isDemo 
                    ? "bg-gradient-to-tr from-amber-600 to-amber-500" 
                    : "bg-gradient-to-tr from-[#0F766E] to-[#14B8A6]"
                }`}>
                  {adminUser?.name?.charAt(0) || (isDemo ? "D" : "A")}
                </div>
                <div className="truncate max-w-[140px]">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {adminUser?.name || (isDemo ? "Dr. Tanvir Ahmed (Demo)" : "Dr. Clinical Admin")}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`block text-[10px] font-semibold truncate ${
                      isDemo ? "text-amber-700" : "text-[#0F766E]"
                    }`}>
                      {adminUser?.email || (isDemo ? "demo@medbangla.ai" : "admin@medbangla.ai")}
                    </span>
                    {isDemo && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-200 text-amber-900">
                        Demo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log Out of Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center border-t border-slate-200/60 pt-2 font-medium">
              {isDemo ? "MedBangla Demo Mode • Simulated Clinical Sandbox" : "MedBangla v2.0 • Clinical Triage Panel"}
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-[#FAFDFB]">
          {/* Top Bar */}
          <header className="h-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Executive Clinical Command</span>
                  {isDemo ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Demo Mode (সিমুলেশন)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                      Verified Root
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isDemo 
                    ? "সিমুলেটেড প্রেসক্রিপশন অডিট, ডিজিডিএ সেফটি ম্যাট্রিক্স ও ডায়াগনস্টিক টেলিমেট্রি" 
                    : "Real-time prescription analysis, DGDA safety matrix & AI infrastructure telemetry"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isDemo && (
                <button
                  onClick={handleResetDemoData}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 transition-all shadow-2xs cursor-pointer"
                  title="Reset simulated data"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Demo Data</span>
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0F766E] ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isDemo ? "Refresh Demo State" : "Refresh Live Telemetry"}</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isDemo 
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isDemo ? "bg-amber-600" : "bg-emerald-600"}`} />
                <span>{isDemo ? "Demo Sandbox Active" : "All AI Models Active"}</span>
              </div>
            </div>
          </header>

          {/* Prominent Demo Mode Alert Banner */}
          {isDemo && (
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-orange-50 border-b border-amber-300 px-4 sm:px-8 py-3.5 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm shadow-amber-500/30">
                  <AlertTriangle className="w-5 h-5 text-amber-50" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight text-amber-950">
                      ⚠️ আপনি বর্তমানে ডেমো মোডে আছেন (Demo Admin Mode Active)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                      Simulated Fake Data
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                    এখানে প্রদর্শিত সকল অ্যানালিটিক্স, প্রেসক্রিপশন রেকর্ড, ইউজার তালিকা ও সার্ভার মেট্রিক সম্পূর্ণ ডেমো ডাটা। আপনার সমস্ত পরীক্ষা-নিরীক্ষা ও অ্যাকশন নিরাপদ।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <button
                  onClick={handleResetDemoData}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer hover:shadow-xs"
                  title="Reset simulated data to default state"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm shadow-amber-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto bg-[#FAFDFB]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
