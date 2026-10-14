import type { Metadata } from "next";
import { Hind_Siliguri, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { StoreProvider } from "./store/StoreProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { GlobalAuthModal } from "./components/GlobalAuthModal";
import { StudyDisclaimerModal } from "./components/StudyDisclaimerModal";

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

export const metadata: Metadata = {
  title: "MedBangla AI — প্রেসক্রিপশন ও ড্রাগ সেফটি প্ল্যাটফর্ম",
  description:
    "বাংলাদেশের প্রথম ভেরিফاید ক্লিনিক্যাল এআই প্ল্যাটফর্ম — ডিজিটাল প্রেসক্রিপশন ওসিআর, ১৭,৫৮৯ ওষুধের ডাটাবেজ এবং নির্ভরযোগ্য ড্রাগ সেফটি ট্রায়াজ।",
  icons: {
    icon: "/images/medbangla_icon.jpg",
    shortcut: "/images/medbangla_icon.jpg",
    apple: "/images/medbangla_icon.jpg",
  },
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
            </AuthProvider>
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
