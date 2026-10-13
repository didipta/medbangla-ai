"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "../../services/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("গুগল অ্যাকাউন্ট যাচাই করা হচ্ছে...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Check if backend sent an error
        const error = searchParams.get("error");
        if (error) {
          setStatus("error");
          setMessage(`লগইন ব্যর্থ হয়েছে: ${error}`);
          return;
        }

        // 2. Check if backend redirected with pre-issued JWT token
        const token = searchParams.get("token");
        const isNew = searchParams.get("is_new");

        if (token) {
          localStorage.setItem("medbangla_token", token);
          setStatus("success");
          setMessage(
            isNew === "1"
              ? "স্বাগতম! আপনার গুগল অ্যাকাউন্ট সফলভাবে ডাটাবেজে তৈরি ও সংরক্ষিত হয়েছে।"
              : "সফলভাবে লগইন হয়েছে! হোমপেজে নিয়ে যাওয়া হচ্ছে..."
          );

          // Fetch fresh user profile and save to localStorage
          try {
            const { data } = await api.getCurrentUser();
            if (data?.user) {
              localStorage.setItem("medbangla_user", JSON.stringify(data.user));
            }
          } catch (e) {
            console.warn("Could not fetch user profile:", e);
          }

          setTimeout(() => {
            router.push("/");
          }, 1000);
          return;
        }

        // 3. Check for Google OAuth hash fragments (access_token) or credential
        let accessToken: string | null = null;
        let idToken: string | null = searchParams.get("credential");

        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get("access_token");
          if (!idToken) {
            idToken = hashParams.get("id_token");
          }
        }

        const authCredential = idToken || accessToken;

        if (authCredential) {
          setMessage("ডাটাবেজে প্রোফাইল সংরক্ষণ করা হচ্ছে...");
          const { data } = await api.loginWithGoogle(authCredential);

          if (data?.access_token && data?.user) {
            localStorage.setItem("medbangla_token", data.access_token);
            localStorage.setItem("medbangla_user", JSON.stringify(data.user));

            setStatus("success");
            setMessage("স্বাগতম! সফলভাবে লগইন সম্পন্ন হয়েছে।");

            setTimeout(() => {
              router.push("/");
            }, 800);
            return;
          }
        }

        // 4. If nothing received
        setStatus("error");
        setMessage("কোনো বৈধ গুগল টোকেন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।");
      } catch (err: any) {
        console.error("Callback authentication error:", err);
        setStatus("error");
        setMessage(err.message || "গুগল অথেন্টিকেশন ব্যর্থ হয়েছে।");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F766E]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8 animate-in zoom-in-75 duration-200" />
            </div>
          )}

          {status === "error" && (
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-8 h-8 animate-in zoom-in-75 duration-200" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">
            {status === "loading" && "গুগল সাইন-ইন প্রক্রিয়া চলছে"}
            {status === "success" && "লগইন সফল হয়েছে!"}
            {status === "error" && "লগইন ব্যর্থ হয়েছে"}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {status === "error" && (
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
