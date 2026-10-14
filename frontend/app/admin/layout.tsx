"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

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

  const navItems = [
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
  ];

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
            <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] border border-teal-200 flex items-center justify-center text-[#0F766E]">
              <ShieldCheck className="w-4 h-4" />
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] p-0.5 shadow-sm shadow-teal-700/10">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#0F766E] group-hover:scale-110 transition-transform" />
                </div>
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
          <div className="mx-4 mt-5 p-3.5 rounded-xl bg-[#F0FDFA] border border-teal-200/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#0F766E] font-bold">Engine Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Online
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#0F766E]/90 mt-2 font-medium">
              <div className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Neon PostgreSQL</span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {adminUser?.name?.charAt(0) || "A"}
                </div>
                <div className="truncate max-w-[140px]">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {adminUser?.name || "Dr. Clinical Admin"}
                  </span>
                  <span className="block text-[10px] text-[#0F766E] font-semibold truncate">
                    {adminUser?.email || "admin@medbangla.ai"}
                  </span>
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
              MedBangla v2.0 • Clinical Triage Panel
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                    Verified Root
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time prescription analysis, DGDA safety matrix & AI infrastructure telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0F766E] ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh Live Telemetry</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>All AI Models Active</span>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto bg-[#FAFDFB]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
