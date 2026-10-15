"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Pill, ChevronRight } from "lucide-react";
import { MedicinesManagementTable } from "../components/MedicinesManagementTable";
import { adminApi } from "../../services/adminApi";

export default function AdminMedicinesPage() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(adminApi.isDemoMode());
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn font-bangla text-[#0F172A]">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-[#0F766E] transition-colors">
              Admin Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0F766E]">Medicine Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-[#0F766E]" />
            <span>Medicine Catalog Management (CRUD)</span>
            {isDemo ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                Demo Simulated Catalog
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0FDFA] text-[#0F766E] border border-teal-200">
                17,589+ Formulations
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            ডিজিডিএ নিবন্ধিত ঔষধের ডাটাবেজ ব্রাউজ করুন, নতুন ফর্মুলেশন যোগ করুন, এডিট বা ডিলিট করুন
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Medicines Table */}
      <MedicinesManagementTable />
    </div>
  );
}
