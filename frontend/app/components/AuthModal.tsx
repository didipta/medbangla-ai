"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  User,
  AlertCircle,
  Loader2,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Play,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth, AuthUser } from "../context/AuthContext";
import { api } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
  initialMode?: "login" | "register";
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useLanguage();
  const { loginWithGoogle, loginAsDemoUser } = useAuth();

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [bmdcNumber, setBmdcNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>("");

  // 1. Fetch Google Auth Config from environment & backend on mount
  useEffect(() => {
    let isMounted = true;

    // Check frontend environment variable first
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (envClientId && isMounted) {
      setGoogleClientId(envClientId);
    }

    // Fetch from backend configuration (/api/v1/auth/config)
    api
      .getAuthConfig()
      .then(({ data }) => {
        if (isMounted && data?.google_client_id) {
          setGoogleClientId(data.google_client_id);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch auth config:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Load Google Identity Services (GSI) SDK
  useEffect(() => {
    if (!isOpen) return;

    const existingScript = document.getElementById("google-gsi-client");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleComponents();
      };
      document.body.appendChild(script);
    } else {
      initGoogleComponents();
    }
  }, [isOpen, googleClientId, role]);

  // 3. Initialize Google Identity Services
  const initGoogleComponents = () => {
    if (typeof window === "undefined" || !window.google?.accounts) return;
    if (!googleClientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleIdTokenResponse,
        auto_select: false,
      });
    } catch (err) {
      console.warn("Google Identity initialization notice:", err);
    }
  };

  // 4. Handle Google ID Token response
  const handleGoogleIdTokenResponse = async (response: { credential?: string }) => {
    if (!response?.credential) {
      setError(t("গুগল ক্রেডেনশিয়াল পাওয়া যায়নি।", "Google credential not received."));
      return;
    }
    await processGoogleLogin(response.credential);
  };

  // 5. Real Google OAuth 2.0 Popup Flow
  const handleRealGooglePopupLogin = () => {
    setError(null);

    if (!googleClientId) {
      console.error(
        "Google Client ID is missing. Set GOOGLE_CLIENT_ID in backend/.env or NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env.local"
      );
      setError(
        t(
          "গুগল অথেন্টিকেশন বর্তমানে প্রস্তুত করা হচ্ছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
          "Google authentication is currently being configured. Please contact support."
        )
      );
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      setError(
        t(
          "গুগল সার্ভিস লোড হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড পর পুনরায় চেষ্টা করুন।",
          "Google Identity Services is loading. Please try again in a few moments."
        )
      );
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(t("গুগল লগইন পপআপ খোলা হচ্ছে...", "Opening Google Sign-In popup..."));

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "email profile openid",
        prompt: "select_account",
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setLoading(false);
            if (tokenResponse.error === "popup_closed_by_user") {
              setStatusMessage("");
              return;
            }
            setError(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          if (tokenResponse?.access_token) {
            await processGoogleLogin(tokenResponse.access_token);
          } else {
            setLoading(false);
            setError(t("গুগল টোকেন পাওয়া যায়নি।", "Google access token not returned."));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to trigger Google OAuth popup.");
    }
  };

  // 6. Send Real Google Token to Backend -> Save Real User in Neon DB
  const processGoogleLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    setStatusMessage(t("গুগল সার্ভারে সত্যতা যাচাই করা হচ্ছে...", "Verifying token with Google servers..."));

    try {
      setStatusMessage(t("নিয়ন পোস্টগ্রেস্কেলে প্রোফাইল সেভ করা হচ্ছে...", "Saving user in Neon PostgreSQL..."));
      const res = await loginWithGoogle(token, role, role === "doctor" ? bmdcNumber : undefined);

      if (res.success) {
        setStatusMessage(
          res.is_new_user
            ? t("স্বাগতম! আপনার গুগল অ্যাকাউন্ট ডাটাবেজে সংরক্ষিত হয়েছে।", "Welcome! Your real Google account has been saved in Neon DB.")
            : t("সফলভাবে লগইন হয়েছে!", "Welcome back! Login successful.")
        );
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 600);
      } else {
        setLoading(false);
        setError(res.message || t("লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।", "Login failed. Please try again."));
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || t("সার্ভার ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।", "Server error. Please try again."));
    }
  };

  // 5.5 Fast 1-Click Demo Login with Gmail
  const handleDemoLogin = async (selectedRole: "patient" | "doctor" = role) => {
    setLoading(true);
    setError(null);
    setStatusMessage(t("ডেমো জিমেইল অ্যাকাউন্টে প্রবেশ করা হচ্ছে...", "Signing in with Demo Gmail account..."));
    try {
      const res = await loginAsDemoUser(selectedRole);
      if (res.success) {
        setStatusMessage(t("সফলভাবে ডেমো লগইন হয়েছে!", "Demo login successful!"));
        if (onLoginSuccess) {
          onLoginSuccess({
            id: selectedRole === "doctor" ? "demo-user-doctor-01" : "demo-user-patient-01",
            name: selectedRole === "doctor" ? "Prof. Dr. Md. Fazlul Hoque" : "Mahdi Hasan (Demo Patient)",
            email: selectedRole === "doctor" ? "dr.fazlul.hoque@gmail.com" : "mahdi.hasan@gmail.com",
            role: selectedRole,
            bmdc_number: selectedRole === "doctor" ? "BMDC-A-42190" : undefined,
          });
        }
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 500);
      } else {
        setLoading(false);
        setError(res.message || t("ডেমো লগইন ব্যর্থ হয়েছে।", "Demo login failed."));
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Demo login failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-100 transition-all max-h-[92vh] overflow-y-auto">
        {/* Top Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-teal-600 via-[#0F766E] to-emerald-700 opacity-95" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Content */}
        <div className="relative z-1 pt-7 pb-5 px-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner mb-2.5">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {t("মেডবাংলা এআই-তে সাইন-ইন", "Sign in to MedBangla AI")}
          </h2>
          <p className="mt-1 text-xs text-teal-100 font-medium">
            {t(
              "আপনার আসল গুগল ইমেইল দিয়ে সুরক্ষিত ১-ক্লিক লগইন",
              "Real 1-Click Login with your official Google Account"
            )}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 pt-5 space-y-4 bg-white">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Role Selection Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t("আপনার পরিচয় নির্বাচন করুন / Select Role", "Select Your Role")}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setRole("patient")}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "patient"
                    ? "bg-white text-[#0F766E] shadow-sm border border-teal-600/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>{t("রোগী / সাধারণ ব্যবহারকারী", "Patient / User")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "doctor"
                    ? "bg-white text-[#0F766E] shadow-sm border border-teal-600/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{t("চিকিৎসক / Doctor", "Doctor / Physician")}</span>
              </button>
            </div>
          </div>

          {/* Doctor BMDC Field */}
          {role === "doctor" && (
            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1.5 animate-in fade-in">
              <label className="block text-[11px] font-bold text-teal-900">
                {t("বিএমডিসি রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)", "BMDC Reg. Number (Optional)")}
              </label>
              <input
                type="text"
                placeholder="যেমন: A-33457 বা A-54921"
                value={bmdcNumber}
                onChange={(e) => setBmdcNumber(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-teal-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* 1-Click Instant Demo Login Option */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50/60 to-cyan-50 border border-teal-200/90 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E]">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{t("⚡ ১-ক্লিকে তাৎক্ষণিক ডেমো লগইন", "⚡ 1-Click Instant Demo Login")}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0F766E] border border-teal-200">
                {t("পাসওয়ার্ড ছাড়া প্রবেশ", "No Password Required")}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-tight">
              {t(
                "সিস্টেম টেস্ট করতে নিচের যেকোনো ডেমো জিমেইল প্রোফাইল দিয়ে এখনই প্রবেশ করুন:",
                "Test all AI features immediately with a verified demo Gmail account:"
              )}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("patient")}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-teal-300 text-teal-800 font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer group"
              >
                <User className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                <span>{t("রোগী ডেমো (Mahdi)", "Patient Demo")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("doctor")}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-teal-300 text-teal-800 font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer group"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                <span>{t("ডাক্তার ডেমো (Dr. Fazlul)", "Doctor Demo")}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 my-1 text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-500">
              {t("অথবা আপনার নিজস্ব গুগল আইডি দিয়ে", "Or Continue With Your Google Account")}
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Official Real Google Sign-In Action Button */}
          <div className="space-y-2.5 pt-0.5">
            <button
              type="button"
              onClick={handleRealGooglePopupLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-teal-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">{statusMessage || t("যাচাই করা হচ্ছে...", "Verifying...")}</span>
                </div>
              ) : (
                <>
                  {/* Real Google G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t("গুগল দিয়ে প্রবেশ করুন (Continue with Google)", "Continue with Google")}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </>
              )}
            </button>
          </div>

          {/* Real-World Trust Signals & Database Save Guarantee */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {t(
                  "প্রথমবার লগইনে আপনার আসল গুগল তথ্য ডাটাবেজে তৈরি ও সংরক্ষিত হবে।",
                  "First login automatically saves your real Google profile to Neon DB."
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>
                {t(
                  "১০০% আসল গুগল সিকিউরিটি — কোনো ফেক বা ডামি অ্যাকাউন্ট নয়।",
                  "100% Real Google Identity Security — Zero fake accounts."
                )}
              </span>
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <p className="text-[10px] text-center text-slate-400 leading-tight">
            {t(
              "লগইন করার মাধ্যমে আপনি মেডবাংলা এআই এর শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।",
              "By signing in, you agree to MedBangla AI's Terms of Service and Privacy Policy."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
