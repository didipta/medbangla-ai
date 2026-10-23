import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { StoreProvider } from "./store/StoreProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { GlobalAuthModal } from "./components/GlobalAuthModal";
import { StudyDisclaimerModal } from "./components/StudyDisclaimerModal";
import { AndroidAppExperience } from "./components/AndroidAppExperience";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://medbangla.ai"),
  title: {
    default: "MedBangla AI — ডিজিটাল প্রেসক্রিপশন ও ড্রাগ সেফটি প্ল্যাটফর্ম",
    template: "%s | MedBangla AI",
  },
  description:
    "বাংলাদেশের প্রথম ভেরিফাইড ক্লিনিক্যাল এআই প্ল্যাটফর্ম — ডিজিটাল প্রেসক্রিপশন ওসিআর, ১৭,৫৮৯ ওষুধের ডাটাবেজ, ড্রাগ-ড্রাগ ইন্টারেকশন ওয়ার্নিং এবং ডিজিডিএ নির্দেশিকা সহ রিয়েল-টাইম বাংলা এআই অ্যাসিস্ট্যান্ট।",
  applicationName: "MedBangla AI",
  authors: [{ name: "MedBangla AI Clinical & AI Engineering Team", url: "https://medbangla.ai" }],
  generator: "Next.js 16",
  keywords: [
    "MedBangla AI",
    "মেডবাংলা এআই",
    "প্রেসক্রিপশন এআই",
    "Digital Prescription OCR Bangladesh",
    "Bangla Clinical AI",
    "Drug Interactions Bangladesh",
    "DGDA Medicine Database",
    "Medical Assistant Bangla",
    "Medicine Directory BD",
    "Bangla Healthcare AI",
    "Napa",
    "Seclo",
    "BMDC Medical Code of Ethics",
  ],
  creator: "MedBangla AI",
  publisher: "MedBangla AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: "https://medbangla.ai",
    siteName: "MedBangla AI (মেডবাংলা এআই)",
    title: "MedBangla AI — AI-Powered Bangla Prescription & Drug Safety Assistant",
    description:
      "বাংলাদেশের প্রথম ভেরিফاید ক্লিনিক্যাল এআই প্ল্যাটফর্ম — ডিজিটাল প্রেসক্রিপশন ওসিআর, ১৭,৫৮৯ ওষুধের তথ্যভাণ্ডার এবং নির্ভরযোগ্য ড্রাগ ইন্টারেকশন সেফটি ট্রায়াজ।",
    images: [
      {
        url: "/images/og_medbangla_preview.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "MedBangla AI — Intelligent Prescription Understanding & Medication Safety Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedBangla AI — AI-Powered Bangla Prescription & Drug Safety Assistant",
    description:
      "ডিজিটাল প্রেসক্রিপশন স্ক্যানার, ১৭,৫৮৯+ ওষুধের তথ্যভাণ্ডার ও ড্রাগ-ড্রাগ ইন্টারেকশন সেফটি ট্রায়াজ প্ল্যাটফর্ম।",
    site: "@medbangla_ai",
    creator: "@medbangla_ai",
    images: ["/images/og_medbangla_preview.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/medbangla_icon.jpg" },
      { url: "/images/medbangla_icon.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/images/medbangla_icon.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/images/medbangla_icon.jpg",
    apple: [{ url: "/images/medbangla_icon.jpg", sizes: "180x180", type: "image/jpeg" }],
  },
  category: "health",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${inter.variable} ${geistMono.variable} font-bangla h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFDFB] text-slate-900 antialiased selection:bg-[#0F766E] selection:text-white">
        <StoreProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <GlobalAuthModal />
              <StudyDisclaimerModal />
              <AndroidAppExperience />
            </AuthProvider>
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
