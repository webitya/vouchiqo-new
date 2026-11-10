"use client";

import {
  ArrowRight,
  Clock,
  Coins,
  Loader2,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export function RevivalPromo() {
  const [form, setForm] = useState({ code: "", brandName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brandName.trim()) {
      setError("Please enter the Store or Brand Name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim() || undefined,
          brandName: form.brandName.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setForm({ code: "", brandName: "", email: "" });
        toast.success("Revival request submitted successfully! 🎉");
      } else {
        setError(data.message || "Failed to submit revival request.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-10 sm:py-12 px-4 sm:px-8 border-y border-rose-200/60 dark:border-zinc-900 select-none relative overflow-hidden font-sans text-left">
      {/* Decorative Gradient Graphic Orbs & Subtle Pattern */}
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-gradient-to-br from-[#F72853]/15 to-pink-300/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-tl from-[#F72853]/10 to-rose-300/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#F72853_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none z-0" />

      <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form & Callout (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4 text-left font-sans">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#F72853] text-[10px] font-normal tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="text-[10.5px] uppercase font-medium text-[#F72853] tracking-wider flex items-center justify-center md:justify-start gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Offer Revival Engine</span>
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-1.5 font-sans">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-900 tracking-tight leading-tight">
                Got an expired offer? <br />
                <span className="text-[#F72853] font-medium">
                  We&apos;ll help you revive it.
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-xl">
                Submit any expired code or store offer. Our merchant relations
                team negotiates a fresh active equivalent directly with the
                brand — usually within 24 hours.
              </p>
            </div>

            {/* Compact Form Container */}
            <div className="max-w-xl">
              {success ? (
                <div className="bg-white border border-rose-200 rounded-xl p-5 text-center space-y-2.5 shadow-2xs font-sans">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">
                    Revival Request Received!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    We&apos;ve logged your revival request for{" "}
                    <span className="text-[#F72853] font-medium">
                      {form.brandName || "your brand"}
                    </span>
                    . We&apos;ll email you as soon as a fresh code is
                    negotiated.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-xs font-normal text-[#F72853] hover:underline pt-1 cursor-pointer"
                  >
                    Revive another offer →
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-2xs font-sans"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Brand Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Store / Brand Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ajmal Perfumes, Bewakoof, Boat Lifestyle"
                        value={form.brandName}
                        onChange={(e) =>
                          setForm({ ...form, brandName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F72853] font-normal"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        placeholder="For revival alert"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F72853] font-normal"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[11px] text-rose-600 font-normal">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[#F72853] hover:bg-[#df1c44] text-white text-xs font-normal rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Submit For Revival</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Learn More Link */}
            <div>
              <Link
                href="/expired-coupon-revival"
                className="text-xs font-normal text-[#F72853] hover:underline transition-colors inline-flex items-center gap-1 font-sans"
              >
                <span>Learn how Revival Negotiation works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Compact Metric Cards (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full font-sans">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Stat Card 1 */}
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 text-left shadow-2xs hover:border-[#F72853] hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] transition-all duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center mb-2 border border-rose-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F72853]" />
                </div>
                <span className="block text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
                  94%
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">
                  Redeem Success Rate
                </span>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 text-left shadow-2xs hover:border-[#F72853] hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] transition-all duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center mb-2 border border-rose-100">
                  <Clock className="w-3.5 h-3.5 text-[#F72853]" />
                </div>
                <span className="block text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
                  &lt;24h
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">
                  Avg Turnaround
                </span>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 text-left shadow-2xs hover:border-[#F72853] hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] transition-all duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center mb-2 border border-rose-100">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F72853]" />
                </div>
                <span className="block text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
                  8,400+
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">
                  Revived This Week
                </span>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 text-left shadow-2xs hover:border-[#F72853] hover:shadow-[0_6px_16px_rgba(247,40,83,0.12)] transition-all duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center mb-2 border border-rose-100">
                  <Coins className="w-3.5 h-3.5 text-[#F72853]" />
                </div>
                <span className="block text-lg sm:text-xl font-medium text-[#F72853] tracking-tight">
                  ₹17,500
                </span>
                <span className="block text-[9.5px] sm:text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">
                  Avg User Savings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RevivalPromo;
