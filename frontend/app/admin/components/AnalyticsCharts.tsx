"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";
import { TimelineDataPoint, TopMedicine, SeverityItem, AIEngineItem } from "../../services/adminApi";

interface AnalyticsChartsProps {
  timeline: TimelineDataPoint[];
  topMedicines: TopMedicine[];
  severityBreakdown: SeverityItem[];
  aiEngines: AIEngineItem[];
  rangeDays: number;
  onRangeChange: (days: number) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  timeline,
  topMedicines,
  severityBreakdown,
  aiEngines,
  rangeDays,
  onRangeChange,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimelineDataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chart dimensions & scaling
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 25;

  const maxScans = Math.max(...timeline.map((d) => d.scans), 10);
  const minScans = 0;

  const points = timeline.map((d, index) => {
    const x = paddingX + (index / (timeline.length - 1)) * (width - paddingX * 2);
    const yScans = height - paddingY - ((d.scans - minScans) / (maxScans - minScans)) * (height - paddingY * 2);
    const yFlagged = height - paddingY - ((d.flagged - minScans) / (maxScans - minScans)) * (height - paddingY * 2);
    return { x, yScans, yFlagged, d };
  });

  const createSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const scansSpline = createSplinePath(points.map((p) => ({ x: p.x, y: p.yScans })));
  const flaggedSpline = createSplinePath(points.map((p) => ({ x: p.x, y: p.yFlagged })));

  const areaPath = points.length
    ? `${scansSpline} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* Upper Grid: Prescription Flow Area Chart + Severity Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Interactive Area / Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                  Prescription Processing & Safety Triage Volume
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                দৈনিক প্রেসক্রিপশন স্ক্যান এবং শনাক্তকৃত ড্রাগ অ্যালার্টের গতিবিধি
              </p>
            </div>

            {/* Time Window Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
              {[
                { label: "7 Days", value: 7 },
                { label: "14 Days", value: 14 },
                { label: "30 Days", value: 30 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onRangeChange(opt.value)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    rangeDays === opt.value
                      ? "bg-white text-[#0F766E] shadow-xs border border-teal-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Area/Line Chart */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] my-2 select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scansGradientUserPanel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F766E" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines matching user panel slate */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (height - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Area Under Curve */}
              {areaPath && <path d={areaPath} fill="url(#scansGradientUserPanel)" />}

              {/* Total Scans Line */}
              {scansSpline && (
                <path
                  d={scansSpline}
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Flagged Alerts Line */}
              {flaggedSpline && (
                <path
                  d={flaggedSpline}
                  fill="none"
                  stroke="#B91C1C"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
              )}

              {/* Data Point Markers */}
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g key={i}>
                    {/* Invisible Hitbox */}
                    <rect
                      x={pt.x - 14}
                      y={0}
                      width={28}
                      height={height}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => {
                        setHoveredIndex(i);
                        setHoveredPoint(pt.d);
                      }}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        setHoveredPoint(null);
                      }}
                    />

                    {/* Active vertical hover indicator line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={height - paddingY}
                        stroke="#0F766E"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Point on Total Scans */}
                    <circle
                      cx={pt.x}
                      cy={pt.yScans}
                      r={isHovered ? 6 : 3.5}
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all shadow-xs"
                    />

                    {/* Point on Flagged */}
                    <circle
                      cx={pt.x}
                      cy={pt.yFlagged}
                      r={isHovered ? 4.5 : 2.5}
                      fill="#FFFFFF"
                      stroke="#B91C1C"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip in Pure User Panel Format (White Surface + Deep Teal) */}
            {hoveredPoint && hoveredIndex !== null && (
              <div
                className="absolute z-30 pointer-events-none bg-white border border-slate-200/90 text-slate-900 rounded-xl p-3 shadow-lg text-xs -translate-x-1/2 -top-16 transition-all"
                style={{
                  left: `${((points[hoveredIndex]?.x || 0) / width) * 100}%`,
                }}
              >
                <div className="font-bold mb-1.5 flex items-center justify-between gap-3 border-b border-slate-100 pb-1">
                  <span className="text-slate-900">{hoveredPoint.fullDate}</span>
                  <span className="text-[10px] text-[#0F766E] bg-[#F0FDFA] border border-teal-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    OCR: {hoveredPoint.ocrAccuracy}%
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                      Total Scanned:
                    </span>
                    <span className="font-extrabold text-[#0F766E]">{hoveredPoint.scans}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                      Flagged Alerts:
                    </span>
                    <span className="font-extrabold text-rose-700">{hoveredPoint.flagged}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Safe Prescriptions:
                    </span>
                    <span className="font-extrabold text-emerald-700">{hoveredPoint.safe}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1.5 rounded-full bg-[#0F766E]" />
                <span className="text-slate-800 font-bold">Total Prescriptions Scanned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1.5 rounded-full bg-[#B91C1C]" />
                <span className="text-slate-800 font-bold">Flagged Drug Interactions</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Hover along graph points for daily diagnostic metrics
            </span>
          </div>
        </div>

        {/* 2. Drug Safety Risk Severity Distribution Donut (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                Clinical Safety Severity
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              রোগীর ড্রাগ ইন্টারঅ্যাকশন ঝুঁকির শতকরা বিভাজন
            </p>

            {/* Visual Donut representation matching user panel colors */}
            <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
              <div
                className="w-full h-full rounded-full transition-transform hover:scale-105 duration-300 shadow-xs"
                style={{
                  background: `conic-gradient(
                    #0F766E 0% 74%,
                    #0284C7 74% 86%,
                    #D97706 86% 96%,
                    #B91C1C 96% 100%
                  )`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-white border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">88.2%</span>
                <span className="text-[10px] text-[#0F766E] font-bold uppercase tracking-wider">
                  Safe & Clear
                </span>
              </div>
            </div>
          </div>

          {/* Severity Legend Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            {severityBreakdown.map((item) => {
              const itemColor =
                item.name.includes("Safe")
                  ? "#0F766E"
                  : item.name.includes("Minor")
                  ? "#0284C7"
                  : item.name.includes("Moderate")
                  ? "#D97706"
                  : "#B91C1C";
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: itemColor }}
                    />
                    <span className="text-slate-700 font-semibold truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{item.count} rx</span>
                    <span className="font-bold text-slate-900">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Grid: Top Prescribed Medicines in BD + AI Infrastructure Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Top Prescribed Generics in Bangladesh (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                  Top Prescribed Medications in Bangladesh (DGDA Catalog)
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                দেশের চিকিৎসকদের প্রেসক্রিপশনে সর্বাধিক পাওয়া ওষুধের হার ও ক্যাটাগরি
              </p>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-[#F0FDFA] text-[11px] font-bold text-[#0F766E] border border-teal-200">
              17,589 DGDA Indexed
            </span>
          </div>

          {/* List of Progress Bars */}
          <div className="space-y-3.5">
            {topMedicines.map((med, index) => (
              <div key={med.generic} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                      {med.generic}
                    </span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      ({med.brandExample})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.riskLevel === "Severe"
                          ? "bg-rose-50 text-rose-800 border border-rose-200/80"
                          : med.riskLevel === "Moderate"
                          ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                      }`}
                    >
                      {med.riskLevel} Risk
                    </span>
                    <span className="font-mono font-bold text-[#0F766E] text-xs">
                      {med.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] transition-all duration-500"
                    style={{ width: `${med.percentage * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AI Engine Routing & Accuracy Benchmarks (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                AI Vision & OCR Engine Routing
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 font-medium">
              হাতে লেখা প্রেসক্রিপশন এক্সট্রাকশনে ব্যবহৃত এআই মডেলসমূহ
            </p>

            <div className="space-y-4">
              {aiEngines.map((item) => (
                <div
                  key={item.engine}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-teal-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-900">{item.engine}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Traffic Share:</span>
                    <span className="font-mono font-bold text-[#0F766E]">{item.usagePct}%</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-[#0F766E]"
                      style={{ width: `${item.usagePct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Avg Latency:</span>
                    <span className="font-mono text-slate-900 font-bold">{item.avgLatencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-[#F0FDFA] border border-teal-200 text-xs text-[#0F766E] font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F766E] flex-shrink-0" />
            <span>Dual Fallback Active: Local ONNX + Gemini 3.8 Flash + Groq Vision</span>
          </div>
        </div>
      </div>
    </div>
  );
};
