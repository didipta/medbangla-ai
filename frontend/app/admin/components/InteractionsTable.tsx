"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { adminApi, InteractionMatrixItem } from "../../services/adminApi";

export const InteractionsTable: React.FC = () => {
  const [interactions, setInteractions] = useState<InteractionMatrixItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInteractions(severityFilter);
      setInteractions(data.interactions);
    } catch (err) {
      console.error("Failed to load interactions matrix", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, [severityFilter]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>DGDA Clinical Drug-Drug Interaction Safety Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            প্রেসক্রিপশনে একসাথে দেওয়া বিপজ্জনক ওষুধ জুটির ফার্মাকোলজিক্যাল বিশ্লেষণ ও নির্দেশনা
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
          {["all", "severe", "moderate", "minor"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                severityFilter === sev
                  ? sev === "severe"
                    ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-200"
                    : sev === "moderate"
                    ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-200"
                    : "bg-white text-[#0F766E] shadow-sm border border-teal-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Flagged Drug Interactions */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Interacting Drug Pair</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4">Pharmacological Mechanism</th>
              <th className="py-3 px-4">Clinical Action / Guideline</th>
              <th className="py-3 px-4 text-center">Frequency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">ইন্টারেকশন ডাটা লোড হচ্ছে...</span>
                  </div>
                </td>
              </tr>
            ) : interactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                  কোনো ড্রাগ ইন্টারঅ্যাকশন রেকর্ড পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              interactions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Pair Name */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-[#0F766E]">{item.drugA}</span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-rose-600">{item.drugB}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-700 font-semibold border border-slate-200">
                        {item.dgdaWarning}
                      </span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.severity === "Severe"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : item.severity === "Moderate"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {item.severity === "Severe" ? (
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{item.severity}</span>
                    </span>
                  </td>

                  {/* Mechanism */}
                  <td className="py-3.5 px-4 max-w-sm text-slate-600 text-[11px] leading-relaxed font-medium">
                    {item.mechanism}
                  </td>

                  {/* Recommendation */}
                  <td className="py-3.5 px-4 max-w-sm text-teal-900 text-[11px] font-semibold leading-relaxed bg-[#F0FDFA]/80 p-2.5 rounded-lg border border-teal-100">
                    {item.clinicalRecommendation}
                  </td>

                  {/* Frequency */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="font-mono font-bold text-slate-900">{item.detectedCount}</div>
                    <div className="text-[10px] text-slate-400 font-medium">cases flagged</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
