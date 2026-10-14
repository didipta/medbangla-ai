"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("দয়া করে ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন (Please provide both email and password).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminApi.login(email.trim(), password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials or unauthorized login.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFDFB] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Highlights matching MedBangla user theme */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-50/70 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] p-0.5 shadow-xl shadow-teal-700/15 mb-4">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#0F766E]" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-bold tracking-wide uppercase mb-2">
            <Activity className="w-3.5 h-3.5" />
            Clinical Command Center
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MedBangla <span className="text-[#0F766E]">Admin Portal</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            শুধুমাত্র অনুমোদিত ক্লিনিক্যাল অ্যাডমিনদের জন্য সুরক্ষিত লগইন
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">অ্যাডমিন সেশন ভেরিফাইড! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medbangla.ai"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Admin Master Password
                </label>
                <span className="text-[11px] text-[#0F766E] font-bold">Single Authority</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#0F766E] hover:bg-[#115E59] active:bg-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/50 shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>ক্লিনিক্যাল ড্যাশবোর্ডে প্রবেশ করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link back to patient site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-[#0F766E] font-medium transition-colors inline-flex items-center gap-1"
          >
            ← MedBangla AI সাধারণ প্ল্যাটফর্মে ফিরে যান (Back to Patient Site)
          </Link>
        </div>
      </div>
    </div>
  );
}
