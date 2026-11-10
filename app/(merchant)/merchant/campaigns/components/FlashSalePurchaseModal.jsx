"use client";

import {
  ArrowRight,
  BellRing,
  Clock,
  Loader2,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FlashSalePurchaseModal({
  isOpen,
  onClose,
  onPurchasedSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleActivatePass = async () => {
    setLoading(true);
    const toastId = toast.loading("Activating your Flash Sale Pass...");
    try {
      const res = await fetch("/api/merchants/me/flash-sale-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to activate Flash Sale pass");
      }

      toast.success(
        "Flash Sale Campaign Pass unlocked! You can now create your Flash Sale campaign.",
        { id: toastId, duration: 5000 },
      );
      onClose();
      if (onPurchasedSuccess) {
        onPurchasedSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Payment activation failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-2xl md:max-w-3xl max-h-[92vh] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-left font-sans shadow-2xl overflow-y-auto text-slate-900">

        {/* Header */}
        <DialogHeader className="pr-8 space-y-3 border-b border-slate-100 pb-4 text-left">

          {/* Badge row — semantic colors, short labels, consistent style */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Primary label — brand identity */}
            <span className="inline-flex items-center bg-[#F72853] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md tracking-wide uppercase">
              Partner Special
            </span>
            {/* Scarcity label — amber for limited/one-time */}
            <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
              1-Time Pass
            </span>
            {/* Savings label — green for value/savings (universal standard) */}
            <span className="hidden sm:inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
              Save ₹1,700
            </span>
          </div>

          {/* Headline — short, benefit-driven, no emoji clutter */}
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
            Boost Store Visits with a 24–48hr Flash Sale
          </DialogTitle>

          {/* Description — one tight sentence */}
          <DialogDescription className="text-[12px] sm:text-[13px] text-slate-500 font-normal leading-relaxed">
            Drive urgent buyer action with a live countdown — get 5x more clicks from active shoppers in your area, one-time fee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* Feature Cards — consistent neutral card bg, icon color tied to function */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

            {/* Urgency — amber: universal "time/warning" color */}
            <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-[9.5px] font-medium bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-md">
                  Urgency
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11.5px] font-semibold text-slate-900 leading-tight">
                  Live Countdown Clock
                </h4>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                  Ticking timer on deal cards drives instant buyer conversions.
                </p>
              </div>
            </div>

            {/* Reach — blue: universal "broadcast/network" color */}
            <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-[9.5px] font-medium bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded-md">
                  Priority Reach
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11.5px] font-semibold text-slate-900 leading-tight">
                  5x Search Spotlight
                </h4>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                  Featured at the top of category feeds and local deal results.
                </p>
              </div>
            </div>

            {/* Alert — violet: universal "notification/alert" color */}
            <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                  <BellRing className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-[9.5px] font-medium bg-violet-50 border border-violet-200 text-violet-700 px-1.5 py-0.5 rounded-md">
                  Local Alert
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11.5px] font-semibold text-slate-900 leading-tight">
                  Targeted Local Notify
                </h4>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                  Notifies shoppers in your city hunting for dining and retail deals.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  One-Time Campaign Pass
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ₹799
                  </span>
                  <span className="text-xs text-slate-500 line-through font-normal">
                    ₹2,499
                  </span>
                  {/* Emerald for savings/discount — universal, expected */}
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    68% off
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  All-inclusive. No monthly subscription required.
                </p>
              </div>

              {/* Instant activation — amber for action/speed */}
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 shrink-0">
                <div className="w-7 h-7 rounded-md bg-amber-400/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-semibold text-white leading-tight">
                    Instant Activation
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Ready in 60s
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-3 pt-2.5 flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-1">
              <span>* Free plan: 1 Flash Sale pass included</span>
              <span className="text-slate-400">24h – 48h Promo Window</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2.5 pt-0.5">
            <Button
              onClick={handleActivatePass}
              disabled={loading}
              className="w-full bg-[#F72853] hover:bg-[#e01e47] text-white font-bold text-xs sm:text-sm rounded-xl h-11 sm:h-12 shadow-md shadow-[#F72853]/25 cursor-pointer flex items-center justify-center gap-2 transition-all border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹799 &amp; Unlock Flash Sale</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] px-0.5">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Secure SSL • Instant Access</span>
              </div>
              <Link
                href="/merchant/billing"
                onClick={onClose}
                className="text-[11px] font-semibold text-[#F72853] hover:underline flex items-center gap-1"
              >
                <span>Unlimited Campaigns? Upgrade</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}