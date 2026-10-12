"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Scan,
  Maximize2,
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Database,
  Smartphone,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface HeroSlide {
  id: string;
  image: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  tagBn: string;
  tagEn: string;
  statBn: string;
  statEn: string;
  featuresBn: string[];
  featuresEn: string[];
  ctaLink: string;
  ctaTextBn: string;
  ctaTextEn: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "ai-hero",
    image: "/images/prescription_ai_hero.jpg",
    titleBn: "মেডবাংলা এআই প্রেসক্রিপশন ডেকোডার ও স্মার্ট স্বাস্থ্য সহকারী",
    titleEn: "MedBangla AI Prescription Decoder & Clinical Care System",
    subtitleBn:
      "অস্পষ্ট হস্তাক্ষর ডেকোডিং, ১৭,৫৮৯ অনুমোদিত ডিজিডিএ ওষুধের সাথে ভেরিফিকেশন এবং ক্ষতিকর ড্রাগ মিথস্ক্রিয়া প্রতিরোধ।",
    subtitleEn:
      "Decodes complex doctor handwriting, matches against 17,589 DGDA approved medicines, and screens pairwise drug interactions.",
    tagBn: "এআই প্রেসক্রিপশন ইন্টেলিজেন্স",
    tagEn: "AI Prescription Intelligence",
    statBn: "৯৮.৭% ভিশন অ্যাকুরেসি",
    statEn: "98.7% Vision Accuracy",
    featuresBn: [
      "ডাক্তার ও রোগীর তথ্য পৃথকীকরণ",
      "ডিজিডিএ ডাটাবেজে ১০০% গ্রাউন্ডেড",
      "সহজ বাংলায় সেবন সহায়িকা",
    ],
    featuresEn: [
      "Physician & Patient Dossier Parsing",
      "100% DGDA Registry Grounding",
      "Bengali Chronotherapy Schedule",
    ],
    ctaLink: "/checker",
    ctaTextBn: "প্রেসক্রিপশন পরীক্ষা করুন",
    ctaTextEn: "Test Prescription Scan",
  },
  {
    id: "scanner-vision",
    image: "/images/hero_prescription_scanner.jpg",
    titleBn: "নিউরাল ভিশন ও অপটিক্যাল ক্যারেক্টার রিকগনিশন (RapidOCR)",
    titleEn: "Neural Vision & High-Precision RapidOCR Extraction",
    subtitleBn:
      "ছায়া, ভাঁজ ও অস্পষ্ট কালির প্রেসক্রিপশন ইমেজ প্রি-প্রসেস করে লাইভ লেজার ভিশন স্ক্যানিংয়ে ওষুধ চিহ্নিতকরণ।",
    subtitleEn:
      "Preprocesses folds, perspective skews, and faint ink with adaptive contrast normalization for zero-error text extraction.",
    tagBn: "কম্পিউটার ভিশন পাইপলাইন",
    tagEn: "Computer Vision Pipeline",
    statBn: "< ১.২ সেকেন্ড প্রসেসিং",
    statEn: "< 1.2s Processing Time",
    featuresBn: [
      "অ্যাডাপ্টিভ ডেস্কেউ ও কন্ট্রাস্ট বুস্ট",
      "হাতে লেখা ও প্রিন্টেড উভয় সাপোর্ট",
      "এডিটেবল ম্যানুয়াল ভেরিফিকেশন ট্রে",
    ],
    featuresEn: [
      "Adaptive De-skew & Contrast Normalization",
      "Dual Support for Handwriting & Print",
      "Editable Verification Tray Review",
    ],
    ctaLink: "/checker",
    ctaTextBn: "লাইভ স্ক্যানার ডেমো চালান",
    ctaTextEn: "Run Live Scanner Demo",
  },
  {
    id: "informative-showcase",
    image: "/images/hero_informative_showcase.jpg",
    titleBn: "১৭,৫৮৯ অনুমোদিত জাতীয় ওষুধ ডাটাবেজ ও ডিজিডিএ ক্যাটালগ",
    titleEn: "17,589 DGDA National Drug Registry & Pharmacological Catalog",
    subtitleBn:
      "বাণিজ্যিক ব্র্যান্ড, জেনেরিক মলিকিউল, প্রস্তুতকারক ও সরকার নির্ধারিত সর্বোচ্চ খুচরা মূল্য (MRP) যাচাই।",
    subtitleEn:
      "Official DGDA database cross-referencing brand names, active generic molecules, manufacturers, and verified retail prices.",
    tagBn: "জাতীয় ড্রাগ ডিরেক্টরি",
    tagEn: "National Drug Directory",
    statBn: "১৭,৫৮৯+ ব্র্যান্ড ওষুধ",
    statEn: "17,589+ Commercial Brands",
    featuresBn: [
      "১,৪৩৫টি স্বতন্ত্র জেনেরিক মলিকিউল",
      "সমমানের সাশ্রয়ী জেনেরিক বিকল্প",
      "ডুপ্লিকেট ওভারডোজ প্রতিরোধ ব্যবস্থা",
    ],
    featuresEn: [
      "1,435 Unique Active Molecules",
      "Verified Cost-Effective Generic Substitutes",
      "Accidental Duplicate Molecule Safeguard",
    ],
    ctaLink: "/medicines",
    ctaTextBn: "ওষুধের ডাটাবেজ ব্রাউজ করুন",
    ctaTextEn: "Browse Medicine Catalog",
  },
  {
    id: "mobile-mockup",
    image: "/images/hero_mobile_prescription_mockup.jpg",
    titleBn: "স্মার্টফোন ক্যামেরা দিয়ে সরাসরি স্ক্যান ও তাৎক্ষণিক ফলাফল",
    titleEn: "Instant Smartphone Camera Capture & Mobile Patient Hub",
    subtitleBn:
      "যেকোনো স্মার্টফোনে প্রেসক্রিপশনের ছবি তুললেই মুহূর্তের মধ্যে স্ক্রিনে ভেসে উঠবে প্রতিটি ওষুধের বিশদ বিবরণ।",
    subtitleEn:
      "Snap prescription photos directly on your smartphone to view instant digitized medication details with meal intervals.",
    tagBn: "স্মার্টফোন অপটিমাইজড",
    tagEn: "Smartphone Optimized",
    statBn: "১-ক্লিক মোবাইল স্ক্যান",
    statEn: "1-Click Mobile Capture",
    featuresBn: [
      "ক্যামেরা ও গ্যালারি থেকে সরাসরি আপলোড",
      "মোবাইল স্ক্রিনে স্পষ্ট বাংলা রিপোর্ট",
      "হোয়াটসঅ্যাপ ও পরিবারে শেয়ারের সুবিধা",
    ],
    featuresEn: [
      "Direct Mobile Camera & Gallery Intake",
      "Crystal Clear Mobile Guidance UI",
      "Easy Family & Caregiver Sharing",
    ],
    ctaLink: "/checker",
    ctaTextBn: "মোবাইল স্ক্যানার ট্রাই করুন",
    ctaTextEn: "Try Mobile Scanner",
  },
  {
    id: "mobile-presentation",
    image: "/images/hero_mobile_presentation.jpg",
    titleBn: "ডিটারমিনিস্টিক ড্রাগ সেফটি ট্রায়াজ ও বাংলায় রোগীর সহায়িকা",
    titleEn: "Deterministic Drug Safety Triage & Grounded Care Schedules",
    subtitleBn:
      "একাধিক ওষুধের মাঝে ক্ষতিকর মিথস্ক্রিয়া শনাক্তকরণ ও পরিবারের বয়োজ্যেষ্ঠদের জন্য নিরাপদ খাওয়ার সময়সূচি।",
    subtitleEn:
      "Pairwise interaction screening across multiple prescriptions with strict zero-hallucination deterministic safety flags.",
    tagBn: "জিরো-হ্যালুসিনেশন সেফটি",
    tagEn: "Zero-Hallucination Safety",
    statBn: "১০০% ভেরিফাইড ট্রায়াজ",
    statEn: "100% Deterministic Safety",
    featuresBn: [
      "পেয়ারওয়াইজ ড্রাগ-ড্রাগ রেড অ্যালার্ট",
      "খাবারের আগে/পরে খাওয়ার রুটিন",
      "বিএমডিসি ও ক্লিনিক্যাল গাইডলাইন কমপ্লায়েন্ট",
    ],
    featuresEn: [
      "Pairwise Drug-Drug Severe Red Alerts",
      "Before & After Meal Chronotherapy",
      "BMDC Ethics & Clinical Safety Compliant",
    ],
    ctaLink: "/checker",
    ctaTextBn: "ড্রাগ সেফটি রিপোর্ট দেখুন",
    ctaTextEn: "View Safety Report",
  },
];

export const HeroAnimatedSlider: React.FC = () => {
  const { lang, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [laserActive, setLaserActive] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000; // 5 seconds per slide
  const PROGRESS_TICK = 50; // update every 50ms

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % HERO_SLIDES.length);
          return 0;
        }
        return prev + (PROGRESS_TICK / SLIDE_DURATION) * 100;
      });
    }, PROGRESS_TICK);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setProgress(0);
    setCurrentIndex(index);
  };

  const activeSlide = HERO_SLIDES[currentIndex];

  return (
    <div
      className="relative rounded-2xl border border-slate-200 bg-white shadow-none overflow-hidden group transition-all"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Top Header Strip: Slider Title & Live Control Badges */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 font-bold uppercase">
              {lang === "bn" ? activeSlide.tagBn : activeSlide.tagEn}
            </span>
          </div>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-[11px] text-slate-300 font-medium">
            {currentIndex + 1} / {HERO_SLIDES.length}
          </span>
        </div>

        {/* Action Controls: Laser Toggle, Play/Pause, Fullscreen Modal */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setLaserActive(!laserActive)}
            title={laserActive ? "লেজার স্ক্যান বন্ধ করুন" : "লেজার স্ক্যান চালু করুন"}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              laserActive
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            }`}
          >
            <Scan className="w-3 h-3" />
            <span className="hidden sm:inline">
              {laserActive ? t("লেজার চালু", "Laser ON") : t("লেজার বন্ধ", "Laser OFF")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "বিরতি দিন (Pause)" : "চালিয়ে যান (Play)"}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setModalImage(activeSlide.image)}
            title="বড় আকারে দেখুন (Expand Image)"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative bg-slate-950 overflow-hidden aspect-[4/3] sm:aspect-[16/11] min-h-[300px]">
        {/* All Slides Container with Crossfade & Scale Animation */}
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive
                  ? "opacity-100 scale-100 z-10 pointer-events-auto"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={lang === "bn" ? slide.titleBn : slide.titleEn}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            </div>
          );
        })}

        {/* Animated Laser Scanning Line Simulator */}
        {laserActive && (
          <div className="absolute inset-x-0 z-20 pointer-events-none animate-laser-scan h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee,0_0_24px_#06b6d4]">
            <div className="absolute right-3 -top-2.5 px-1.5 py-0.5 rounded bg-cyan-500/80 text-[9px] font-mono font-bold text-slate-950 shadow-sm flex items-center gap-1">
              <Scan className="w-2.5 h-2.5" />
              <span>VISION OCR</span>
            </div>
          </div>
        )}

        {/* Floating Stat Badge in Top Right */}
        <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-700/80 shadow-lg text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lang === "bn" ? activeSlide.statBn : activeSlide.statEn}</span>
        </div>

        {/* Previous and Next Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-105 shadow-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-105 shadow-md"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Overlay Content (Bottom) */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 text-white space-y-2">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
              {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow-sm">
              {lang === "bn" ? activeSlide.subtitleBn : activeSlide.subtitleEn}
            </p>
          </div>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {(lang === "bn" ? activeSlide.featuresBn : activeSlide.featuresEn).map(
              (feat, fIdx) => (
                <span
                  key={fIdx}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/15 backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-slate-200 border border-white/10 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>{feat}</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Slide Progression Timer Bar */}
      <div className="h-1 bg-slate-100 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0F766E] to-teal-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer Navigation Strip: Compact Slide Dots / Pills & Action */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 p-2.5 sm:p-3 flex items-center justify-between gap-2">
        {/* Step Indicator Pills: 1, 2, 3, 4, 5 */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {HERO_SLIDES.map((slide, sIdx) => {
            const isCurrent = sIdx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(sIdx)}
                title={lang === "bn" ? slide.titleBn : slide.titleEn}
                className={`flex items-center justify-center h-7 px-2 sm:px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#0F766E] text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span className="font-mono text-[11px]">{sIdx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <Link
          href={activeSlide.ctaLink}
          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-[#0F766E] text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <span>{lang === "bn" ? activeSlide.ctaTextBn : activeSlide.ctaTextEn}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Fullscreen High-Resolution Image Preview Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm">
                  {lang === "bn" ? activeSlide.titleBn : activeSlide.titleEn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-2">
              <img
                src={modalImage}
                alt="High resolution showcase"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {lang === "bn" ? activeSlide.subtitleBn : activeSlide.subtitleEn}
              </span>
              <Link
                href={activeSlide.ctaLink}
                className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition-all"
              >
                {lang === "bn" ? activeSlide.ctaTextBn : activeSlide.ctaTextEn}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
