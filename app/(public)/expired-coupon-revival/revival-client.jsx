"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  Loader2,
  Phone,
  RotateCcw,
  Send,
  Star,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { apiFetch } from "@/lib/fetcher";

const SOURCE_PLATFORMS = [
  "Vouchiqo",
  "Instagram",
  "WhatsApp Forward",
  "Google Search",
  "Another Coupon Website",
  "Physical Store or Flyer",
  "Friend or Family",
  "Other",
];

const DISCOUNT_TYPES = [
  { value: "percentage", label: "% Off" },
  { value: "fixed", label: "Flat ₹ Off" },
  { value: "bogo", label: "BOGO (Buy One Get One)" },
  { value: "freebie", label: "Free Gift with Purchase" },
  { value: "other", label: "Other" },
];

const STEPS = [
  { id: 1, label: "Merchant", icon: Building2 },
  { id: 2, label: "Offer", icon: Tag },
  { id: 3, label: "Contact", icon: Phone },
  { id: 4, label: "Confirm", icon: CheckSquare },
];

const INITIAL_FORM = {
  brandName: "",
  merchantWebsite: "",
  merchantCity: "Ranchi",
  whereDidYouFindThisOffer: "Google Search",
  code: "",
  discountType: "percentage",
  discountValue: "",
  description: "",
  whenSeen: new Date().toISOString().split("T")[0],
  whatBuying: "",
  email: "",
  mobileNumber: "",
  consent: false,
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

const labelCls =
  "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

export default function ExpiredCouponRevival() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalRequests: 5240,
    thisMonthRequests: 142,
  });

  const [successStories, setSuccessStories] = useState([
    {
      user: "Anish S., Ranchi",
      brand: "Marbella Tiles & Sanitary",
      offer: "Saved ₹5,400 on home flooring",
      date: "2 days ago",
      text: "Vouchiqo helped reactivate the flat ₹5,000 discount. Marbella approved it immediately after receiving the request batch.",
    },
    {
      user: "Sarah J., Delhi",
      brand: "Starbucks Coffee",
      offer: "Revived Buy 1 Get 1 Espresso",
      date: "5 days ago",
      text: "Requested the BOGO revival. Within 48 hours, Vouchiqo updated the code and I redeemed it in-store.",
    },
    {
      user: "Rohan D., Bangalore",
      brand: "Notion Premium",
      offer: "Recovered $100 SaaS Credits",
      date: "1 week ago",
      text: "Our team credits coupon had expired. Vouchiqo contacted Notion's partnership team and they re-enabled it for our domain!",
    },
  ]);

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const json = await apiFetch("/api/admin/settings?public=true");
      return json.data?.settings || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (publicSettings) {
      if (publicSettings.revival_stats) setStats(publicSettings.revival_stats);
      if (publicSettings.social_proof?.length > 0) setSuccessStories(publicSettings.social_proof);
    }
  }, [publicSettings]);

  const nextStep = () => {
    if (step === 1) {
      if (!form.brandName || !form.merchantCity) {
        setError("Please enter a Brand Name and City.");
        return;
      }
    } else if (step === 2) {
      if (!form.discountType || !form.description) {
        setError("Please provide offer details (Type & Description).");
        return;
      }
    } else if (step === 3) {
      if (!form.email || !form.mobileNumber) {
        setError("Email and WhatsApp number are required.");
        return;
      }
      if (!/^\d{10}$/.test(form.mobileNumber)) {
        setError("Please enter a valid 10-digit Indian WhatsApp number.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) {
      setError("You must check the consent checkbox to proceed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountValue: form.discountValue ? Number(form.discountValue) : null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setStats((prev) => ({
          ...prev,
          totalRequests: (prev.totalRequests || 0) + 1,
          thisMonthRequests: (prev.thisMonthRequests || 0) + 1,
        }));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit revival request.");
      }
    } catch (_) {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const f = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <Navbar />

      {/* ── Compact Hero Bar ── */}
      <section className="w-full bg-white border-b border-gray-100">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
              Expired Offer?{" "}
              <span className="text-blue-600">We'll Revive It.</span>
            </h1>
            <p className="text-[13px] text-gray-500 font-normal mt-1">
              Submit the expired code — Vouchiqo contacts the merchant on your behalf, free, within 48 hours.
            </p>
          </div>
          {/* Stats inline */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <span className="block text-xl font-bold text-blue-600">
                {stats.thisMonthRequests}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                This Month
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">
                {(Number(stats?.totalRequests) || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                Total Revived
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ── LEFT: Form (7 cols) ── */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                    Request Submitted!
                  </h3>
                  <p className="text-[12px] text-gray-500 font-normal max-w-sm mx-auto leading-relaxed">
                    We've received your request and will contact the merchant on your behalf. You'll hear back within 48 hours via email and WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setStep(1); setForm(INITIAL_FORM); }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded-lg border-0 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit Another
                </button>
              </div>
            ) : (
              <div>
                {/* Step Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[14px] font-semibold text-gray-900">
                      {step === 1 && "Merchant Details"}
                      {step === 2 && "Offer Details"}
                      {step === 3 && "Contact Information"}
                      {step === 4 && "Confirm & Submit"}
                    </h2>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {step}/4
                    </span>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((s, i) => {
                      const done = step > s.id;
                      const active = step === s.id;
                      return (
                        <div key={s.id} className="flex items-center flex-1 last:flex-none">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                              done
                                ? "bg-blue-600 text-white"
                                : active
                                  ? "bg-blue-600 text-white ring-3 ring-blue-100"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full ${done ? "bg-blue-600" : "bg-gray-100"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Step names */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="flex items-center flex-1 last:flex-none">
                        <span className={`text-[9px] font-medium ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}>
                          {s.label}
                        </span>
                        {i < STEPS.length - 1 && <div className="flex-1" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form body */}
                <div className="px-5 py-4 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Brand or Business Name *</label>
                        <input className={inputCls} placeholder="e.g. Marbella, Zomato, Starbucks" value={form.brandName} onChange={(e) => f("brandName", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Merchant Website or Instagram (optional)</label>
                        <input className={inputCls} placeholder="e.g. @marbellaranchi or https://brand.com" value={form.merchantWebsite} onChange={(e) => f("merchantWebsite", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>City *</label>
                          <input className={inputCls} placeholder="e.g. Ranchi" value={form.merchantCity} onChange={(e) => f("merchantCity", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>Where did you find it?</label>
                          <select className={inputCls} value={form.whereDidYouFindThisOffer} onChange={(e) => f("whereDidYouFindThisOffer", e.target.value)}>
                            {SOURCE_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="button" onClick={nextStep} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg border-0 cursor-pointer transition-colors mt-1">
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Expired Code (optional)</label>
                          <input className={`${inputCls} uppercase tracking-wider`} placeholder="e.g. SAVE20" value={form.code} onChange={(e) => f("code", e.target.value.toUpperCase())} />
                        </div>
                        <div>
                          <label className={labelCls}>Discount Type *</label>
                          <select className={inputCls} value={form.discountType} onChange={(e) => f("discountType", e.target.value)}>
                            {DISCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>
                      {(form.discountType === "percentage" || form.discountType === "fixed") && (
                        <div>
                          <label className={labelCls}>{form.discountType === "percentage" ? "Discount %" : "Discount ₹ Amount"}</label>
                          <input type="number" className={inputCls} placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 500"} value={form.discountValue} onChange={(e) => f("discountValue", e.target.value)} />
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className={labelCls}>Offer Description * (Max 100 Characters)</label>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {form.description.length}/100
                          </span>
                        </div>
                        <input className={inputCls} maxLength={100} placeholder="e.g. 20% off all bathroom tiles, BOGO coffee" value={form.description} onChange={(e) => f("description", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>When did you see it? *</label>
                          <input type="date" className={inputCls} value={form.whenSeen} onChange={(e) => f("whenSeen", e.target.value)} max={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div>
                          <label className={labelCls}>What were you buying?</label>
                          <input className={inputCls} placeholder="e.g. Espresso, Tiles" value={form.whatBuying} onChange={(e) => f("whatBuying", e.target.value)} />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button type="button" onClick={prevStep} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button type="button" onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg border-0 cursor-pointer transition-colors">
                          Continue <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Your Email *</label>
                        <input type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={(e) => f("email", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>WhatsApp Number *</label>
                        <input type="tel" className={inputCls} placeholder="10-digit number e.g. 9876543210" value={form.mobileNumber} onChange={(e) => f("mobileNumber", e.target.value)} />
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button type="button" onClick={prevStep} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button type="button" onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg border-0 cursor-pointer transition-colors">
                          Continue <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Summary */}
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Review</p>
                        {[
                          { label: "Brand", value: form.brandName },
                          { label: "City", value: form.merchantCity },
                          { label: "Code", value: form.code || "No code" },
                          { label: "Description", value: form.description },
                          { label: "Email", value: form.email },
                          { label: "WhatsApp", value: form.mobileNumber },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center text-[12px]">
                            <span className="text-gray-400 font-medium w-20 flex-shrink-0">{label}</span>
                            <span className="text-gray-800 font-medium text-right truncate">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Consent */}
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.consent}
                            onChange={(e) => f("consent", e.target.checked)}
                            className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          />
                          <span className="text-[11px] text-gray-600 leading-relaxed font-normal">
                            I understand Vouchiqo will attempt to negotiate with the merchant to revive or replace this offer. Revival is not guaranteed, and I may receive an alternative offer if the original cannot be restored. See our{" "}
                            <a href="/privacy#revival-data-clause" target="_blank" className="text-blue-600 underline font-semibold">
                              Privacy Policy (Section 6: Merchant Demand Data Usage)
                            </a>.
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={prevStep} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium rounded-lg border-0 cursor-pointer transition-colors">
                          {loading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                          ) : (
                            <><Send className="w-3.5 h-3.5" /> Submit Revival Request</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">

            {/* How it Works */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
              <h3 className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-4">
                How Revival Works
              </h3>
              <div className="space-y-4">
                {[
                  { n: "1", title: "Submit Details", desc: "Enter the expired code and brand name. Our system cross-references it with the verified brand database." },
                  { n: "2", title: "Merchant Negotiation", desc: "Vouchiqo aggregates demand and presents conversion projections directly to the brand owner." },
                  { n: "3", title: "Code Restored", desc: "Once the merchant approves, the coupon is refreshed with a new expiry and you're notified instantly." },
                ].map((item, i) => (
                  <div key={item.n} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                      {item.n}
                    </div>
                    <div>
                      <h4 className="text-[12px] font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-400">
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                Merchants typically respond within 48 hours.
              </div>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: "Verified", sub: "Process", color: "text-blue-600" },
                { icon: Clock, label: "48 hrs", sub: "Response", color: "text-gray-600" },
                { icon: Star, label: "100%", sub: "Free", color: "text-gray-600" },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Success Stories */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
              <h3 className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Recent Revivals
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-0.5 scrollbar-thin">
                {successStories.map((story, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-semibold text-gray-900 leading-none">{story.brand}</p>
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">{story.offer}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">{story.date}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-blue-200 pl-2">
                      "{story.text}"
                    </p>
                    <p className="text-[10px] text-gray-400 text-right">— {story.user}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
