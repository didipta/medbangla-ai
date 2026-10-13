"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Pill,
  Building2,
  BookOpen,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "../services/api";
import { MedicineSearchResult, MedicineDetails } from "../types/api";
import { useLanguage } from "../context/LanguageContext";

const POPULAR_QUERIES = [
  "Napa",
  "Seclo",
  "Aceclofenac",
  "Ciprofloxacin",
  "Azithromycin",
  "Cardizem",
  "Proxen",
  "Losartan",
  "Metformin",
  "Monas",
];

// Helper to sanitize clinical search terms
const cleanSearchTerm = (term: string): string => {
  if (!term) return "";
  return term
    .replace(/^(tab\.|tab|cap\.|cap|syp\.|syp|tablet|capsule|syrup|inj\.|inj)\s+/i, "")
    .trim();
};

export const MedicinesTester: React.FC = () => {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  // Read initial query from URL search param if provided (e.g. from Hero section)
  const initialUrlQ = cleanSearchTerm(searchParams?.get("q") || "");

  const [query, setQuery] = useState<string>(initialUrlQ || "Napa");
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [details, setDetails] = useState<MedicineDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<"bn" | "en">(lang);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync modal language with global language
  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  // Core Search Execution: Clean, intentional, and stable
  const executeSearch = async (termToSearch: string) => {
    const term = cleanSearchTerm(termToSearch);
    if (!term || term.length < 2) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, durationMs } = await api.searchMedicines(term, 20);
      setResults(data.results || []);
      setLatency(durationMs);
    } catch (err) {
      console.error("Medicine search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Run initial search once on mount or when URL param genuinely changes from external navigation
  useEffect(() => {
    const qFromUrl = cleanSearchTerm(searchParams?.get("q") || "");
    if (qFromUrl) {
      setQuery(qFromUrl);
      executeSearch(qFromUrl);
    } else {
      executeSearch("Napa");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Form Submit: Only fires when user intentionally submits (clicks Search button or presses Enter)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query.trim());
    }
  };

  // 1-Click Popular Tag Click: Sets query and searches immediately
  const handlePillClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  // Clear query button
  const handleClearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Open Full Clinical Monograph
  const handleSelectMedicine = async (brandId: number) => {
    setSelectedBrandId(brandId);
    setDetailsLoading(true);
    try {
      const { data } = await api.getMedicineDetails(brandId);
      setDetails(data);
    } catch (err) {
      console.error("Error loading medicine profile:", err);
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#0F766E] border border-teal-200/60">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t("ডিজিডিএ অনুমোদিত জাতীয় ওষুধ ডিরেক্টরি", "DGDA National Medicine Catalogue")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("ওষুধের বিস্তারিত তথ্য ও ক্লিনিক্যাল মনোগ্রাফ", "Medicine Information & Clinical Monographs")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t(
                "১৭,৫৮৯টি অনুমোদিত ওষুধের ব্র্যান্ড, জেনেরিক উপাদান, প্রস্তুতকারক প্রতিষ্ঠান, সেবনবিধি, সতর্কতা এবং ক্ষতিকর মিথস্ক্রিয়ার তথ্য অনুসন্ধান করুন।",
                "Instant fuzzy search across 17,589 commercial brands and generic monographs with indication, dosage, and side effects."
              )}
            </p>
          </div>

          {latency !== null && (
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
              <Clock className="w-4 h-4 text-[#0F766E]" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  {t("অনুসন্ধান সময়", "Response Time")}
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">{latency} ms</div>
              </div>
            </div>
          )}
        </div>

        {/* Stable, Rock-Solid Search Bar */}
        <div className="pt-2">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            {/* Input Left Icon: Switches to subtle spinner when loading, with NO layout shift */}
            <div className="absolute left-4 flex items-center pointer-events-none">
              {loading ? (
                <RefreshCw className="w-5 h-5 text-[#0F766E] animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "ওষুধের নাম বা জেনেরিক লিখুন (যেমন: Napa, Paracetamol, Seclo, Ciprofloxacin, Metformin)...",
                "Search by brand or generic name (e.g. Napa, Paracetamol, Seclo, Ciprofloxacin)..."
              )}
              className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-32 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 focus:outline-none transition-all shadow-xs"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClearQuery}
                className="absolute right-24 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title={t("মুছে ফেলুন", "Clear")}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Predictable, Rock-Solid Search Button with Fixed Width and Steady Text */}
            <button
              type="submit"
              className="absolute right-2 min-w-[88px] h-9 rounded-lg bg-[#0F766E] hover:bg-[#115E59] active:bg-[#0c5c56] px-4 text-xs font-bold text-white transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 select-none"
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t("অনুসন্ধান", "Search")}</span>
            </button>
          </form>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" /> {t("উদাহরণ:", "Quick Samples:")}
            </span>
            {POPULAR_QUERIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handlePillClick(item)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  query.toLowerCase() === item.toLowerCase()
                    ? "border-[#0F766E] bg-teal-50 text-[#0F766E] font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#0F766E] hover:bg-teal-50/50 hover:text-[#0F766E]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Academic Study Notice regarding non-real-time prices and market data */}
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
            <span className="font-bold shrink-0">⚠️ {t("স্টাডি ডেমো সতর্কতা:", "Study Demo Notice:")}</span>
            <span>
              {t(
                "এই ডিরেক্টরিটি শুধুমাত্র শিক্ষামূলক ও এআই মডেলিং গবেষণার জন্য। ওষুধের মূল্য (Price), ব্র্যান্ডের প্রাপ্যতা বা মার্কেট ডাটা রিয়েল-টাইমে আপডেট নয়। বর্তমান দামের জন্য স্থানীয় ফার্মেসিতে যাচাই করুন।",
                "This catalogue is strictly for educational AI modeling research. Medicine prices, market availability, and brand data are not updated in real-time. Verify current rates with local pharmacies."
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Results Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            {t(
              `ফলাফল পাওয়া গেছে: ${results.length} টি`,
              `Results Found: ${results.length}`
            )}
            {query ? ` ("${query}")` : ""}
          </span>
          <span>{t("পূর্ণাঙ্গ মনোগ্রাফ দেখতে কার্ডে ক্লিক করুন", "Click any card for full clinical monograph")}</span>
        </div>

        {/* Empty State with Immediate Recovery Suggestions */}
        {results.length === 0 && !loading && hasSearched && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-3">
            <Pill className="mx-auto w-10 h-10 text-slate-300 mb-1" />
            <p className="font-bold text-base text-slate-800">
              {t(`“${query}” নামে কোনো ওষুধ পাওয়া যায়নি`, `No medicines found matching "${query}"`)}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {t(
                "সঠিক বানান যাচাই করুন অথবা বিকল্প জেনেরিক নাম লিখে চেষ্টা করুন। নিচে থেকে জনপ্রিয় ওষুধ নির্বাচন করতে পারেন:",
                "Check spelling or try a generic name like Paracetamol or Ciprofloxacin. You can also pick from common drugs below:"
              )}
            </p>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {["Napa", "Seclo", "Ciprofloxacin", "Metformin", "Paracetamol", "Azithromycin"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePillClick(item)}
                  className="rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200 px-3 py-1.5 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((med) => (
            <div
              key={med.brand_id}
              onClick={() => handleSelectMedicine(med.brand_id)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-[#0F766E] hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0F766E] transition-colors">
                      {med.brand_name}
                    </h3>
                    <p className="text-xs font-semibold text-[#0F766E] mt-0.5">
                      {med.generic_name}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                    {med.form}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {t("শক্তি (Strength)", "Strength")}
                    </span>
                    <span className="font-bold text-slate-800">{med.strength || "N/A"}</span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {t("মূল্য (Pack/Price)", "Price")}
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {med.price ? `৳ ${med.price}` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{med.manufacturer || "General Pharma Ltd."}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {med.has_bilingual_doc ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("দ্বৈতভাষী মনোগ্রাফ", "Bilingual Monograph")}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">DGDA Approved</span>
                )}

                <div className="flex items-center gap-1 text-xs font-bold text-[#0F766E] group-hover:translate-x-0.5 transition-transform">
                  <span>{t("বিস্তারিত", "Details")}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Monograph Modal */}
      {selectedBrandId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200">
                    {details?.form || "Medicine"}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{details?.manufacturer}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {details?.brand_name || "ওষুধের বিবরণ"}
                </h2>
                <p className="text-sm font-bold text-[#0F766E]">
                  {details?.generic_name} ({details?.strength})
                </p>
              </div>

              <button
                onClick={() => setSelectedBrandId(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {detailsLoading ? (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0F766E] mx-auto" />
                  <p className="font-semibold text-xs">{t("তথ্য লোড হচ্ছে...", "Loading details...")}</p>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  {/* Language Tab Switcher inside Modal if Deep Monograph Available */}
                  {details.bilingual_profile && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">
                        {t("মনোগ্রাফ ভাষা:", "Monograph Language:")}
                      </span>
                      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                        <button
                          onClick={() => setActiveLang("bn")}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            activeLang === "bn"
                              ? "bg-white text-[#0F766E] shadow-2xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          বাংলা
                        </button>
                        <button
                          onClick={() => setActiveLang("en")}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            activeLang === "en"
                              ? "bg-white text-[#0F766E] shadow-2xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pricing and Details strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {t("প্যাক সাইজ", "Pack Size")}
                      </span>
                      <span className="font-bold text-slate-800">{details.packsize || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {t("খুচরা মূল্য", "MRP Price")}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {details.price ? `৳ ${details.price}` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {t("অনুমোদন", "Approval")}
                      </span>
                      <span className="font-bold text-[#15803D]">DGDA Valid</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {t("রেফারেন্স", "Source")}
                      </span>
                      <span className="font-bold text-[#0F766E]">National DB</span>
                    </div>
                  </div>

                  {/* Deep Monograph Sections */}
                  {details.bilingual_profile && activeLang === "bn" && details.bilingual_profile.sections_bn ? (
                    <div className="space-y-4">
                      {Object.entries(details.bilingual_profile.sections_bn).map(([key, val]) => (
                        <div key={key} className="rounded-xl border border-slate-200 p-4 space-y-1.5">
                          <h4 className="font-bold text-slate-900 text-sm text-[#0F766E]">
                            {key.replace(/_/g, " ")}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  ) : details.bilingual_profile && activeLang === "en" && details.bilingual_profile.sections_en ? (
                    <div className="space-y-4">
                      {Object.entries(details.bilingual_profile.sections_en).map(([key, val]) => (
                        <div key={key} className="rounded-xl border border-slate-200 p-4 space-y-1.5">
                          <h4 className="font-bold text-slate-900 text-sm text-[#0F766E]">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {details.indication && (
                        <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs text-[#0F766E]">
                            {t("রোগ নির্দেশনা (Indication):", "Indication:")}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{details.indication}</p>
                        </div>
                      )}

                      {details.dose && (
                        <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs text-[#0F766E]">
                            {t("সেবনবিধি ও মাত্রা (Dose & Administration):", "Dose & Administration:")}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{details.dose}</p>
                        </div>
                      )}

                      {details.side_effect && (
                        <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs text-amber-700">
                            {t("পার্শ্বপ্রতিক্রিয়া (Side Effects):", "Side Effects:")}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{details.side_effect}</p>
                        </div>
                      )}

                      {details.contra_indication && (
                        <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs text-rose-700">
                            {t("প্রতিনির্দেশনা (Contraindications):", "Contraindications:")}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-xs">{details.contra_indication}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  {t("ওষুধটির বিস্তারিত তথ্য পাওয়া যায়নি।", "Detailed information not available.")}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedBrandId(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {t("বন্ধ করুন", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
