"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";
import { adminApi, SystemServiceItem } from "../../services/adminApi";

export const SystemHealthTable: React.FC = () => {
  const [services, setServices] = useState<SystemServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cacheReloading, setCacheReloading] = useState<boolean>(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSystemDiagnostics();
      setServices(data.services);
    } catch (err) {
      console.error("Failed to fetch diagnostics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleClearCache = async () => {
    setCacheReloading(true);
    setCacheMessage(null);
    try {
      const res = await adminApi.clearCache();
      setCacheMessage(`সফলভাবে রিফ্রেশ হয়েছে! ${res.indexedChunks} RAG চাঙ্ক এবং ${res.cachedMonographs} টি ড্রাগ মনোগ্রাফ ইন-মেমোরিতে সক্রিয়।`);
      fetchDiagnostics();
    } catch (err) {
      setCacheMessage("ক্লিনিক্যাল ক্যাশ রিলোড ব্যর্থ হয়েছে।");
    } finally {
      setCacheReloading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <Server className="w-5 h-5 text-[#0F766E]" />
            <span>Infrastructure, Database & AI Health Diagnostics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            হোস্ট সার্ভার, ডাটাবেজ কানেকশন পুল, ওসিআর ইঞ্জিন ও এলএলএম প্রোভাইডারদের লাইভ স্ট্যাটাস
          </p>
        </div>

        {/* Action Button: Reload Cache */}
        <button
          onClick={handleClearCache}
          disabled={cacheReloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-teal-700/15 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cacheReloading ? "animate-spin" : ""}`} />
          <span>{cacheReloading ? "রিলোড হচ্ছে..." : "Reload Clinical RAG Index"}</span>
        </button>
      </div>

      {cacheMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{cacheMessage}</span>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-600/30 border-t-[#0F766E] rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-600">ইনফ্রাস্ট্রাকচার টেলিমেট্রি লোড হচ্ছে...</span>
            </div>
          </div>
        ) : (
          services.map((svc) => (
            <div
              key={svc.name}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-200 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{svc.name}</h4>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">{svc.type}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    svc.status.includes("Operational") || svc.status.includes("Healthy") || svc.status.includes("Loaded") || svc.status.includes("Configured")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {svc.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                {svc.latencyMs ? (
                  <>
                    <span>Response Latency:</span>
                    <span className="font-mono font-bold text-[#0F766E]">{svc.latencyMs} ms</span>
                  </>
                ) : svc.indexedChunks ? (
                  <>
                    <span>Indexed Knowledge:</span>
                    <span className="font-mono font-bold text-[#0F766E]">{svc.indexedChunks} chunks</span>
                  </>
                ) : (
                  <>
                    <span>Runtime Engine:</span>
                    <span className="font-mono text-slate-700 font-bold">{svc.runtime || "Ready"}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
