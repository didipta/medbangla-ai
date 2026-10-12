"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { api } from "../services/api";
import { InteractionReport } from "../types/api";

const PRESET_SCENARIOS = [
  {
    name: "🔴 Major Chelation Risk",
    desc: "Ciprofloxacin + Calcium D3 + Zinc",
    drugs: ["Ciprofloxacin", "Calcium Vitamin D3", "Zinc Sulfate"],
  },
  {
    name: "⛔ Critical NSAID Duplication",
    desc: "Aceclofenac + Naproxen",
    drugs: ["Aceclofenac", "Naproxen", "Pantoprazole"],
  },
  {
    name: "🟠 CYP2C19 Antiplatelet Risk",
    desc: "Clopidogrel + Omeprazole + Aspirin",
    drugs: ["Clopidogrel", "Omeprazole", "Aspirin"],
  },
  {
    name: "🟢 Safe Multi-Drug Regimen",
    desc: "Paracetamol + Montelukast + Fexofenadine",
    drugs: ["Paracetamol", "Montelukast", "Fexofenadine", "Esomeprazole"],
  },
];

export const InteractionsTester: React.FC = () => {
  const [medicines, setMedicines] = useState<string[]>([
    "Ciprofloxacin",
    "Calcium Vitamin D3",
  ]);
  const [newMed, setNewMed] = useState("");
  const [report, setReport] = useState<InteractionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const handleRunCheck = async (drugs = medicines) => {
    if (drugs.length < 2) return;
    setLoading(true);
    try {
      const { data, durationMs } = await api.checkInteractions(drugs);
      setReport(data);
      setLatency(durationMs);
    } catch (err) {
      console.error(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    if (!newMed.trim()) return;
    const clean = newMed.trim();
    if (!medicines.includes(clean)) {
      const updated = [...medicines, clean];
      setMedicines(updated);
      handleRunCheck(updated);
    }
    setNewMed("");
  };

  const handleRemoveMedicine = (name: string) => {
    const updated = medicines.filter((m) => m !== name);
    setMedicines(updated);
    if (updated.length >= 2) {
      handleRunCheck(updated);
    } else {
      setReport(null);
    }
  };

  const handleApplyPreset = (presetDrugs: string[]) => {
    setMedicines(presetDrugs);
    handleRunCheck(presetDrugs);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-6 text-white shadow-lg shadow-rose-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md">
                POST /api/v1/interactions/check
              </span>
              <span className="text-xs text-white/80">Deterministic O(N²) Pairwise Matrix</span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Clinical Drug-Drug Interaction Safety Engine
            </h2>
            <p className="mt-1 text-sm text-white/90">
              0% Hallucinations: Evaluates co-prescribed medications in &lt;0.1ms with documented pharmacology warnings in Bengali &amp; English.
            </p>
          </div>
          {latency !== null && (
            <div className="flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20">
              <Clock className="w-4 h-4 text-rose-200" />
              <div>
                <div className="text-[10px] uppercase font-bold text-white/70">Response Time</div>
                <div className="text-lg font-mono font-bold">{latency} ms</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick Tests */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> 1-Click Clinical Test Presets:
          </span>
          <span className="text-[11px] text-zinc-400">Click to instantly populate and evaluate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p.drugs)}
              className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 text-left hover:border-rose-500 hover:bg-rose-50/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:border-rose-500/80 dark:hover:bg-rose-950/20 transition-all group"
            >
              <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                {p.name}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Medicine Tags Input */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Medicines to Check Simultaneously:
        </label>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 min-h-12 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
          {medicines.map((m) => (
            <span
              key={m}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
            >
              <span>{m}</span>
              <button
                onClick={() => handleRemoveMedicine(m)}
                className="hover:text-rose-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {/* New tag input */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <input
              type="text"
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMedicine();
                }
              }}
              placeholder="Type drug name and press enter..."
              className="w-full bg-transparent px-2 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
            />
            <button
              onClick={handleAddMedicine}
              className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-500">
            {medicines.length} medicine(s) selected ({((medicines.length * (medicines.length - 1)) / 2) || 0} pairs to verify)
          </span>
          <button
            onClick={() => handleRunCheck()}
            disabled={loading || medicines.length < 2}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? "Checking..." : "Verify All Drug Pairs"}
          </button>
        </div>
      </div>

      {/* Safety Report Output */}
      {report && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div
            className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
              report.is_safe
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                : report.overall_safety_status === "CRITICAL_CONTRAINDICATION"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200"
                : report.overall_safety_status === "HIGH_RISK"
                ? "bg-orange-500/15 border-orange-500/40 text-orange-900 dark:text-orange-200"
                : "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {report.is_safe ? (
                <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-500 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">
                  {report.is_safe
                    ? "নিরাপদ কম্বিনেশন: কোনো সরাসরি ক্ষতিকর মিথস্ক্রিয়া পাওয়া যায়নি"
                    : `সতর্কতা: ${report.interactions_count}টি সম্ভাব্য ক্ষতিকর মিথস্ক্রিয়া শনাক্ত হয়েছে`}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  Overall Status: <span className="font-mono font-bold">{report.overall_safety_status}</span> | Evaluated {report.total_pairs_checked} drug pairs in {report.execution_time_ms}ms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold self-start sm:self-auto">
              <span className="rounded-lg bg-white/70 dark:bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                Major: {report.severity_breakdown.MAJOR}
              </span>
              <span className="rounded-lg bg-white/70 dark:bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                Moderate: {report.severity_breakdown.MODERATE}
              </span>
            </div>
          </div>

          {/* Interactions List */}
          {report.interactions.length > 0 ? (
            <div className="space-y-3">
              {report.interactions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                        {item.drug_a}
                      </span>
                      <span className="text-zinc-400 font-bold">+</span>
                      <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                        {item.drug_b}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        item.severity === "CONTRAINDICATED"
                          ? "bg-rose-500 text-white"
                          : item.severity === "MAJOR"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : item.severity === "MODERATE"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      }`}
                    >
                      {item.severity_bn} ({item.severity})
                    </span>
                  </div>

                  {/* Bengali Clinical Explanation */}
                  <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/50 space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        পারস্পরিক প্রতিক্রিয়া:{" "}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {item.effect_bn}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        পরামর্শ ও করণীয়:{" "}
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                        {item.recommendation_bn}
                      </span>
                    </div>
                  </div>

                  {/* English Clinical Pharmacology & Source */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 pt-1 gap-1">
                    <span className="italic">
                      Pharmacology: {item.effect_en}
                    </span>
                    <span className="font-semibold text-zinc-500 whitespace-nowrap">
                      Source: {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-500 mb-2" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                নির্বাচিত ওষুধসমূহের মধ্যে কোনো নথিভুক্ত ক্ষতিকর প্রতিক্রিয়া নেই।
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                নিরাপদে চিকিৎসকের প্রেসক্রিপশন মোতাবেক সেবন করা যাবে।
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
