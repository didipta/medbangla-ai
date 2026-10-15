"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronRight } from "lucide-react";
import { InteractionsTable } from "../components/InteractionsTable";
import { adminApi } from "../../services/adminApi";

export default function AdminInteractionsPage() {
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
            <span className="text-[#0F766E]">Drug Safety Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>DGDA Drug-Drug Interaction Safety Matrix</span>
            {isDemo ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                Demo Clinical Guardrails
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Clinical Guardrails
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            ঝুঁকিপূর্ণ ড্রাগ-টু-ড্রাগ ইন্টারঅ্যাকশন পেয়ার, সাইড-ইফেক্ট সতর্কবার্তা ও ক্লিনিক্যাল রেকমেন্ডেশন
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

      {/* Main Interactions Table */}
      <InteractionsTable />
    </div>
  );
}
