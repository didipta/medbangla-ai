"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  Database,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      qBn: "প্রেসক্রিপশনে ডাক্তারের অস্পষ্ট হাতের লেখা কি মেডবাংলা এআই সঠিকভাবে পড়তে পারে?",
      qEn: "Can MedBangla AI accurately decode illegible doctor handwriting?",
      aBn: "হ্যাঁ, মেডবাংলা এআই অ্যাডাপ্টিভ কম্পিউটার ভিশন (OpenCV বাইনারাইজেশন, কনট্রাস্ট এনহ্যান্সমেন্ট ও ডেস্কেউ) এবং অপটিক্যাল ক্যারেক্টার রিকগনিশন (RapidOCR) ব্যবহার করে প্রেসক্রিপশনের ইংরেজি ও বাংলা টেক্সট নিখুঁতভাবে উদ্ধার করে। এরপর আমাদের ১৭,৫৮৯ ওষুধের জাতীয় ডাটাবেজে ম্যাচিং করে ওষুধ শনাক্ত করে।",
      aEn: "Yes. MedBangla AI applies computer vision (adaptive binarization, de-skewing, contrast normalization) alongside RapidOCR to extract handwritten and printed tokens, which are verified against 17,589 DGDA-registered medicines.",
    },
    {
      qBn: "ওষুধের ড্রাগ মিথস্ক্রিয়া ও নিরাপত্তার তথ্য কতটা নির্ভরযোগ্য?",
      qEn: "How reliable are the drug interaction and safety checks?",
      aBn: "আমাদের ড্রাগ-ড্রাগ সেফটি ইঞ্জিন সম্পূর্ণ ডিটারমিনিস্টিক এবং ভেরিফাইড ফার্মাকোলজিক্যাল রেফারেন্সের উপর প্রতিষ্ঠিত। এখানে কোনো এলএলএম হ্যালুসিনেশনের সুযোগ নেই। কোনো ওষুধের মাঝে মিথস্ক্রিয়া না পাওয়া গেলেও আমরা রোগীকে সচেতন করি যে এটি চূড়ান্ত নিরাপত্তার ছাড়পত্র নয়—চিকিৎসকের পরামর্শ আবশ্যক।",
      aEn: "Our drug-drug interaction engine is strictly deterministic and grounded in verified pharmacological literature. No LLM hallucination is permitted. Even if no adverse interaction is catalogued, we explicitly remind patients to confirm with their doctor.",
    },
    {
      qBn: "প্রেসক্রিপশন আপলোডের পর কি একই তথ্যের ভিত্তিতে বাংলায় প্রশ্ন করা যায়?",
      qEn: "Can I ask questions in plain Bengali about the scanned prescription?",
      aBn: "অবশ্যই! প্রেসক্রিপশন অ্যানালাইসিস সম্পন্ন হওয়ার পর স্বয়ংক্রিয়ভাবে একটি কনটেক্সচুয়াল চ্যাট উইন্ডো চালু হয়। আপনি সনাক্তকৃত ওষুধের খাওয়ার নিয়ম, সময়সূচি, পার্শ্বপ্রতিক্রিয়া বা সতর্কতা নিয়ে যেকোনো প্রশ্ন সরাসরি বাংলায় করতে পারবেন।",
      aEn: "Absolutely! Once your prescription is processed, an in-page clinical consultation window opens. You can inquire about meal schedules, timings, contraindications, and precautions in natural language.",
    },
    {
      qBn: "আমার আপলোডকৃত প্রেসক্রিপশন ও ব্যক্তিগত তথ্য কি নিরাপদ থাকে?",
      qEn: "Are my uploaded prescriptions and patient vitals secure and private?",
      aBn: "হ্যাঁ, আপনার গোপনীয়তা আমাদের সর্বোচ্চ অগ্রাধিকার। ছবিগুলো প্রসেসিংয়ের পর মেমোরি থেকে স্বয়ংক্রিয়ভাবে মুছে ফেলা হয় এবং কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে শেয়ার বা বিজ্ঞাপনী কাজে ব্যবহার করা হয় না।",
      aEn: "Yes, privacy is our highest priority. All image processing is handled securely in-memory and deleted immediately afterward. No personal health records are shared with third parties or advertisers.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-[#0F766E] border border-teal-200/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("মেডবাংলা এআই ভিশন ও নিরাপত্তা নীতি", "MedBangla AI Mission & Safety Ethics")}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("সম্পর্কে ও চিকিৎসাগত নিরাপত্তা মানদণ্ড", "About & Clinical Safety Standards")}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {t(
            "কীভাবে মেডবাংলা এআই বাংলাদেশের সাধারণ মানুষের জন্য নির্ভরযোগ্য চিকিৎসা তথ্য নিশ্চিত করে এবং হ্যালুসিনেশন প্রতিরোধ করে।",
            "How MedBangla AI ensures verified healthcare information, eliminates AI hallucinations, and adheres to ethical clinical standards."
          )}
        </p>
      </div>

      {/* Mission & BMDC Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 space-y-4 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E] border border-teal-200/60">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t("আমাদের লক্ষ্য ও উদ্দেশ্য", "Our Mission & Purpose")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t(
              "বাংলাদেশে প্রায় ৭০% প্রেসক্রিপশনে অস্পষ্ট হস্তাক্ষর বা চিকিৎসা সংক্রান্ত জটিল পরিভাষার কারণে সাধারণ রোগীরা সঠিক সময়ে সঠিক ওষুধ গ্রহণে বিভ্রান্ত হন। মেডবাংলা এআই-এর লক্ষ্য কৃত্রিম বুদ্ধিমত্তার মাধ্যমে রোগীর ভাষা এবং ডাক্তারের প্রেসক্রিপশনের মধ্যে সেতুবন্ধন তৈরি করা।",
              "In Bangladesh, unclear handwriting and complex pharmacology frequently confuse patients. MedBangla AI bridges the communication gap between physician prescriptions and patient comprehension through deterministic AI."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 space-y-4 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-[#B45309] border border-amber-200/60">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t("বিএমডিসি নৈতিক মান ও সীমাবদ্ধতা", "BMDC Medical Code & Limitations")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t(
              "মেডবাংলা এআই কোনো রেজিস্টার্ড চিকিৎসকের বিকল্প নয়। বাংলাদেশ মেডিকেল অ্যান্ড ডেন্টাল কাউন্সিল (BMDC) কোড অব এথিক্স অনুসারে, এই সিস্টেম কেবল সহায়ক তথ্য প্রদান করে। এটি রোগীর রোগ নির্ণয় করে না বা ডোজ পরিবর্তনের অনুমতি দেয় না।",
              "MedBangla AI is not a replacement for a licensed physician. In accordance with BMDC (Bangladesh Medical and Dental Council) guidelines, this platform is an informational aid and does not diagnose illness or alter prescription regimens."
            )}
          </p>
        </div>
      </div>

      {/* Clinical Safety Protocol Showcase Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="relative group overflow-hidden bg-slate-950 aspect-[21/9] sm:aspect-[26/9]">
          <img
            src="/images/clinical_safety_banner.jpg"
            alt="DGDA Pharmacovigilance & Clinical Safety Architecture"
            className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
            <span className="bg-emerald-500/90 text-slate-950 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BMDC ETHICS & DGDA COMPLIANT</span>
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1">
            <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-widest">
              {t("ক্লিনিক্যাল সেফটি প্রোটোকল", "Clinical Safety Protocol")}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
              {t(
                "জাতীয় ডিজিডিএ ফার্মাকোভিজিল্যান্স ও চিকিৎসাগত মানদণ্ড",
                "National DGDA Pharmacovigilance & Clinical Safety Protocol"
              )}
            </h3>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t(
              "মেডবাংলা এআই প্রতিটি প্রেসক্রিপশনের ড্রাগ মিথস্ক্রিয়া, অ্যালার্জি সতর্কতা ও রেনাল/হেপাটিক ক্লিয়ারেন্স ডিটারমিনিস্টিক টেবিলের মাধ্যমে যাচাই করে। রোগীকে চিকিৎসকের বিকল্প না বানিয়ে বরং চিকিৎসকের নির্দেশনা অনুধাবনে সর্বাধিক সহায়তা প্রদান করাই আমাদের অঙ্গীকার।",
              "MedBangla AI screens drug-drug interactions, hypersensitivity flags, and renal/hepatic clearance markers via deterministic lookups, upholding patient safety without replacing physician authority."
            )}
          </p>
        </div>
      </div>

      {/* RAG & Deterministic Architecture */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900">
          {t("কীভাবে হ্যালুসিনেশন রোধ করা হয়?", "How We Guarantee Zero Hallucinations")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
              <Database className="w-4 h-4" />
              {t("১. ডিজিডিএ ডাটাবেজ", "1. DGDA Registry Verification")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "ওষুধের নাম কেবল তখনই শনাক্ত হিসেবে গণ্য হয় যখন তা ১৭,৫৮৯ অনুমোদিত ব্র্যান্ড রেজিস্ট্রিতে ত্রাইগ্রাম বা ফাজি ম্যাচিংয়ে মিলে যায়।",
                "Medicines are only accepted as recognized when matched with high trigram confidence against the 17,589 DGDA national registry."
              )}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#15803D] flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t("২. ডিটারমিনিস্টিক ড্রাগ সেফটি", "2. Deterministic Safety Engine")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "ড্রাগ-ড্রাগ ইন্টারঅ্যাকশন কখনোই এলএলএম অনুমানে বের করা হয় না; এটি যাচাইকৃত ফার্মাকোলজিক্যাল পেয়ারওয়াইজ টেবিলে সার্চ হয়।",
                "Adverse drug interactions are never generated via LLM guesswork; they query deterministic pairwise tables verified by clinical literature."
              )}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-sm">
              <BookOpen className="w-4 h-4" />
              {t("৩. গ্রাউন্ডেড রিট্রিভাল (RAG)", "3. Grounded Retrieval (RAG)")}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t(
                "রোগীর প্রতিটি প্রশ্নের উত্তর তৈরিতে ৭৩৮টি ক্লিনিক্যাল মনোগ্রাফ চাঙ্ক থেকে প্রাসঙ্গিক প্যারাগ্রাফ রিট্রিভ করে রেফারেন্স যুক্ত করা হয়।",
                "Every patient explanation retrieves and quotes directly from 738 bilingual clinical monograph passages with zero hallucination."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">
          {t("সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)", "Frequently Asked Questions (FAQ)")}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4.5 text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0F766E] flex-shrink-0" />
                  {t(faq.qBn, faq.qEn)}
                </span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {t(faq.aBn, faq.aEn)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
