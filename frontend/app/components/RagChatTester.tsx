"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  ShieldAlert,
  Clock,
  Cpu,
  Search,
  CheckCircle2,
  FileText,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";
import { api } from "../services/api";
import { ChatResponse, PrescriptionExplainResponse } from "../types/api";

const SAMPLE_QUESTIONS = [
  "প্যারাসিটামল কীভাবে কাজ করে ও খাওয়ার নিয়ম কী?",
  "সিপ্রোফ্লক্সাসিন অ্যান্টিবায়োটিক কি দুধের সাথে খাওয়া যাবে?",
  "গ্যাস্ট্রিকের ওষুধ খালি পেটে কেন খেতে হয়?",
  "ব্যথানাশক ওষুধ দীর্ঘদিন খেলে কি কিডনির ক্ষতি হতে পারে?",
  "ক্লোপিডোগ্রেল ও ওমিপ্রাজল একসাথে খেলে কী সমস্যা?",
];

export const RagChatTester: React.FC = () => {
  const [subTab, setSubTab] = useState<"chat" | "explain" | "vector">("chat");

  // Chat State
  const [inputQuery, setInputQuery] = useState("");
  const [activeMeds, setActiveMeds] = useState("Paracetamol, Ciprofloxacin");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; text: string; metadata?: any; sources?: any[] }[]
  >([
    {
      role: "assistant",
      text: "নমস্কার/সালাম! আমি মেডবাংলা এআই ক্লিনিক্যাল অ্যাসিস্ট্যান্ট। আপনার প্রেসক্রিপশন বা যেকোনো ওষুধের ব্যবহার, খাওয়ার নিয়ম ও সতর্কতা সম্পর্কে আমাকে বাংলায় প্রশ্ন করতে পারেন।",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  // Prescription Explainer State
  const [sampleRxMeds, setSampleRxMeds] = useState([
    { matched_brand: "Napa 500mg", generic_name: "Paracetamol", dosage: "১+১+১ (খাবারের পর)" },
    { matched_brand: "Neoflox 500mg", generic_name: "Ciprofloxacin", dosage: "১+০+১ (খাবারের আগে)" },
    { matched_brand: "Calbo-D", generic_name: "Calcium Vitamin D3", dosage: "০+০+১ (রাতে খাবারের পর)" },
  ]);
  const [explainResult, setExplainResult] = useState<PrescriptionExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  // Vector Search Tester State
  const [vectorQuery, setVectorQuery] = useState("fever pain fever treatment");
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [vectorLatency, setVectorLatency] = useState<number | null>(null);
  const [vectorLoading, setVectorLoading] = useState(false);

  const handleSendChat = async (msg = inputQuery) => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setInputQuery("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    const medsList = activeMeds
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const { data, durationMs } = await api.sendChat(userMsg, medsList);
      setLastLatency(durationMs);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer_bn,
          metadata: data.llm_metadata,
          sources: data.retrieved_sources,
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `দুঃখিত, অনুরোধটি সম্পন্ন করতে সমস্যা হয়েছে: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrescriptionExplain = async () => {
    setExplainLoading(true);
    try {
      const { data } = await api.explainPrescription(sampleRxMeds);
      setExplainResult(data);
    } catch (err: any) {
      console.error(err);
      alert(`Explain failed: ${err.message}`);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleSearchVector = async () => {
    if (!vectorQuery.trim()) return;
    setVectorLoading(true);
    try {
      const { data, durationMs } = await api.searchRag(vectorQuery.trim(), 5);
      setVectorResults(data.results || []);
      setVectorLatency(durationMs);
    } catch (err) {
      console.error(err);
      setVectorResults([]);
    } finally {
      setVectorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 p-6 text-white shadow-lg shadow-emerald-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md">
                POST /api/v1/chat &amp; explain
              </span>
              <span className="text-xs text-white/80">Hierarchical Monograph RAG &amp; LLM</span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Clinical RAG Bangla Explanation Engine
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Grounded strictly in 738 indexed clinical monograph sections. Powered by Groq Qwen/Llama with Gemini 3.8 Flash failover.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 backdrop-blur-md border border-white/20 text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setSubTab("chat")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === "chat" ? "bg-white text-zinc-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              Bangla Q&amp;A Chat
            </button>
            <button
              onClick={() => setSubTab("explain")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === "explain" ? "bg-white text-zinc-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              Rx Explainer
            </button>
            <button
              onClick={() => setSubTab("vector")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === "vector" ? "bg-white text-zinc-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              Vector Search Tester
            </button>
          </div>
        </div>
      </div>

      {/* SubTab 1: Bangla Q&A Chat */}
      {subTab === "chat" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          {/* Active Medicines Filter Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-600 dark:text-zinc-300">
                Prescription Context (Filter Generics):
              </span>
              <input
                type="text"
                value={activeMeds}
                onChange={(e) => setActiveMeds(e.target.value)}
                placeholder="Paracetamol, Ciprofloxacin..."
                className="rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
            {lastLatency && (
              <span className="text-zinc-400 font-mono text-[11px]">
                Last Response: {lastLatency}ms
              </span>
            )}
          </div>

          {/* Chat Messages Log */}
          <div className="min-h-[350px] max-h-[480px] overflow-y-auto space-y-4 p-2">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10"
                      : "bg-zinc-100/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-700/60"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Assistant Metadata & Sources */}
                  {msg.role === "assistant" && (msg.metadata || msg.sources) && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {msg.metadata && (
                        <span className="flex items-center gap-1 font-mono">
                          <Cpu className="w-3 h-3 text-cyan-500" />
                          {msg.metadata.provider || "LLM"} ({msg.metadata.model || "default"})
                        </span>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <BookOpen className="w-3 h-3" />
                          {msg.sources.length} Verified Sources Grounded
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-white shadow-sm dark:bg-zinc-200 dark:text-zinc-900">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-zinc-400 animate-pulse pl-1">
                <Bot className="w-4 h-4 text-emerald-500" />
                <span>মেডবাংলা এআই ক্লিনিক্যাল মনোগ্রাফ পর্যালোচনা করছে...</span>
              </div>
            )}
          </div>

          {/* Quick Question Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> নমুনা প্রশ্ন:
            </span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500 transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="ওষুধ সম্পর্কিত যেকোনো প্রশ্ন বাংলায় লিখুন (যেমন: প্যারাসিটামলের সর্বোচ্চ ডোজ কত?)..."
              className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="rounded-xl bg-emerald-600 p-3 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* SubTab 2: Prescription Explainer */}
      {subTab === "explain" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Prescription Medicines Ingestion:
              </h3>
              <p className="text-xs text-zinc-500">
                Tests comprehensive multi-drug RAG synthesis with interaction warnings and dosage explanation in Bangla.
              </p>
            </div>
            <button
              onClick={handleRunPrescriptionExplain}
              disabled={explainLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {explainLoading ? "Generating..." : "Generate Bangla Explanation"}
            </button>
          </div>

          {/* Medicines Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleRxMeds.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/60"
              >
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {m.matched_brand}
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {m.generic_name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                  ডোজ: {m.dosage}
                </div>
              </div>
            ))}
          </div>

          {/* Explanation Output */}
          {explainResult && (
            <div className="mt-4 space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ক্লিনিক্যাল ব্যাখ্যা ও রোগী সহায়িকা (Generated in {explainResult.execution_time_ms}ms)
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Model: {explainResult.llm_metadata?.provider} ({explainResult.llm_metadata?.model})
                </span>
              </div>

              <div className="rounded-xl bg-white p-5 text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-zinc-200/80 dark:border-zinc-800">
                {explainResult.bangla_explanation}
              </div>

              {/* Cited sources */}
              {explainResult.retrieved_sources && explainResult.retrieved_sources.length > 0 && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <span className="font-bold">রেফারেন্সড ক্লিনিক্যাল মনোগ্রাফ সোর্স:</span>
                  <div className="flex flex-wrap gap-2">
                    {explainResult.retrieved_sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700"
                      >
                        {s.generic_name} ({s.section})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Semantic Vector Search Tester */}
      {subTab === "vector" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
              In-Memory Vector Search Tester (GET /api/v1/rag/search)
            </h3>
            <p className="text-xs text-zinc-500">
              Evaluates dense normalized dot-product and BM25 ranking across 738 clinical sections in sub-millisecond latency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={vectorQuery}
              onChange={(e) => setVectorQuery(e.target.value)}
              placeholder="Search concepts, diseases, or symptoms (e.g. fever, headache, gastric ulcer)..."
              className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs sm:text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={handleSearchVector}
              disabled={vectorLoading}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {vectorLoading ? "Searching..." : "Vector Search"}
            </button>
          </div>

          {vectorLatency !== null && (
            <div className="text-xs text-zinc-500">
              Retrieved {vectorResults.length} chunks in <span className="font-mono font-bold text-emerald-600">{vectorLatency}ms</span>
            </div>
          )}

          <div className="space-y-3">
            {vectorResults.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {r.name_en} {r.name_bn && `(${r.name_bn})`} — {r.section_title_bn || r.section}
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Score: {r.score}
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {r.preview_bn || r.preview_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
