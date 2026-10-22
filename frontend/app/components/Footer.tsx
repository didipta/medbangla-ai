"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PhoneCall, ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [currentYear, setCurrentYear] = React.useState<number>(2026);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Completely omit patient/consumer Footer on all dedicated admin portal routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pt-12 pb-24 sm:pb-16 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Emergency Hotlines Strip */}
        <div className="rounded-xl bg-rose-50/70 border border-rose-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-800">
            <PhoneCall className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                {t("জরুরি চিকিৎসা হটলাইন (বাংলাদেশ):", "Emergency Medical Hotlines (Bangladesh):")}
              </span>
              <span className="text-[11px] text-slate-500">
                {t(
                  "তাৎক্ষণিক স্বাস্থ্য সংকটে সরকারি টেলিমেডিসিন হেল্পলাইনে যোগাযোগ করুন",
                  "Call government telemedicine hotlines for immediate medical emergencies"
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-xs">
            <span className="rounded-lg bg-white px-3 py-1.5 text-slate-800 border border-slate-200 shadow-2xs">
              {t("জরুরি সেবা: ৯৯৯", "Emergency: 999")}
            </span>
            <span className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-white shadow-2xs">
              {t("স্বাস্থ্য বাতায়ন: ১৬২৬৩", "Shastho Batayon: 16263")}
            </span>
            <span className="rounded-lg bg-[#115E59] px-3 py-1.5 text-white shadow-2xs">
              {t("আইইডিসিআর: ১০৬৫৫", "IEDCR: 10655")}
            </span>
          </div>
        </div>

        {/* Links and Wordmark */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-teal-200/80 shadow-2xs bg-white shrink-0">
                <Image
                  src="/images/medbangla_icon.jpg"
                  alt="MedBangla AI Icon"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-extrabold text-base text-slate-900">
                MedBangla <span className="text-[#0F766E]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                "বাংলাদেশের রোগীদের জন্য আধুনিক ও নির্ভরযোগ্য ডিজিটাল প্রেসক্রিপশন ও ড্রাগ সেফটি প্ল্যাটফর্ম।",
                "A modern, verified digital prescription understanding and medication safety platform for Bangladesh."
              )}
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900">{t("পৃষ্ঠাসমূহ", "Navigation")}</div>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <Link href="/" className="hover:text-[#0F766E] transition-colors">
                  {t("হোম পেজ", "Home")}
                </Link>
              </li>
              <li>
                <Link href="/checker" className="hover:text-[#0F766E] transition-colors">
                  {t("প্রেসক্রিপশন চেকার", "Prescription Checker")}
                </Link>
              </li>
              <li>
                <Link href="/medicines" className="hover:text-[#0F766E] transition-colors">
                  {t("ওষুধের তালিকা (১৭,৫৮৯ ব্র্যান্ড)", "Medicines Directory (17,589 Brands)")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#0F766E] transition-colors">
                  {t("নির্দেশিকা ও নিরাপত্তা", "Guidelines & Safety")}
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#0F766E] hover:text-teal-900 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{t("ক্লিনিক্যাল অ্যাডমিন পোর্টাল", "Clinical Admin Portal")}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900">{t("নৈতিকতা ও নির্ভরযোগ্যতা", "Ethics & Reliability")}</div>
            <ul className="space-y-1.5 text-slate-500">
              <li>{t("বিএমডিসি (BMDC) কোড অব এথিক্স", "BMDC Medical Code of Ethics")}</li>
              <li>{t("ডিজিডিএ (DGDA) রেফারেন্স ডাটাবেজ", "DGDA Reference Framework")}</li>
              <li>{t("ব্যবহার নির্দেশিকা (Usage Guidelines)", "Usage Guidelines & Protocols")}</li>
              <li>{t("তথ্য সুরক্ষা (Privacy Policy)", "Data Protection & Privacy Policy")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900">{t("যোগাযোগ ও সহায়তা", "Contact & Support")}</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("সাপোর্ট ও ক্লিনিক্যাল টিম:", "Support & Clinical Team:")} <br />
              <span className="font-mono text-[#0F766E]">support@medbangla.ai</span>
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              {t("সংস্করণ: MedBangla AI v2.0 (FastAPI + Next.js 16)", "Version: MedBangla AI v2.0 (FastAPI + Next.js 16)")}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {currentYear} MedBangla AI. {t("শিক্ষামূলক ও গবেষণা প্রজেক্ট — সর্বস্বত্ব সংরক্ষিত।", "Educational & Research Project — All rights reserved.")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              <span className="font-semibold">
                {t(
                  "ওষুধের মূল্য ও ডাটা রিয়েল-টাইমে আপডেট নয় (স্টাডি ডেমো)",
                  "Prices & data not updated in real-time (Study Demo)"
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>
                {t(
                  "চিকিৎসকের প্রেসক্রিপশন পরিবর্তন বা বন্ধের পূর্বে ডাক্তারের মতামত নিন।",
                  "Always consult your doctor before altering medications."
                )}
              </span>
            </div>
            <Link
              href="/admin/login"
              id="footer-admin-portal-link"
              className="relative z-20 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/90 hover:bg-teal-100 hover:border-teal-300 text-teal-900 px-3 py-1 font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer ml-1 active:scale-95"
              title={t("ক্লিনিক্যাল অ্যাডমিনিস্ট্রেটর লগইন পোর্টাল", "Clinical Administrator Login Portal")}
            >
              <Lock className="w-3 h-3 text-[#0F766E]" />
              <span>{t("অ্যাডমিন পোর্টাল", "Admin Portal")}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
