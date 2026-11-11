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
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left font-sans shadow-xl overflow-y-auto text-slate-900">
        {/* Header */}
        <DialogHeader className="pr-8 space-y-2 border-b border-slate-100 pb-3 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/30 text-[10px] font-medium px-2 py-0.5 rounded-md">
              Partner Special • 1-Time Pass (Save ₹1,700)
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-snug">
            Boost Store Visits with a 24–48hr Flash Sale
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 font-normal leading-relaxed">
            Drive urgent buyer action with a live countdown and priority search
            spotlight for your store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 pt-1">
          {/* Feature Cards — clean, uniform brand layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#007F79]/30 transition-colors">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007F79]" />
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Countdown Clock
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Ticking timer on deal cards drives instant buyer conversions.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#007F79]/30 transition-colors">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#007F79]" />
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Search Spotlight
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Featured at the top of category feeds and local deal results.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#007F79]/30 transition-colors">
              <div className="flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-[#007F79]" />
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Local Alerts
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Notifies active shoppers in your city looking for immediate
                deals.
              </p>
            </div>
          </div>

          {/* Pricing Block with Royal Plum brand tone */}
          <div className="bg-[#35104A] text-white p-3.5 sm:p-4 rounded-xl border border-[#35104A] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/70 font-medium uppercase tracking-widest block">
                  One-Time Campaign Pass
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    ₹799
                  </span>
                  <span className="text-xs text-white/50 line-through font-normal">
                    ₹2,499
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    68% off
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-normal">
                  All-inclusive. No recurring monthly subscription.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-2 shrink-0">
                <Timer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <span className="block text-[11px] font-medium text-white leading-tight">
                    Instant Activation
                  </span>
                  <span className="block text-[10px] text-white/70 mt-0.5">
                    Ready in 60s
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-3 pt-2 flex items-center justify-between text-[10px] text-white/70 flex-wrap gap-1">
              <span>* Free plan: 1 Flash Sale pass included</span>
              <span className="text-white/80">24h – 48h Promo Window</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2 pt-0.5">
            <Button
              onClick={handleActivatePass}
              disabled={loading}
              className="w-full bg-[#007F79] hover:bg-[#00635E] text-white font-medium text-xs sm:text-sm rounded-lg h-10 shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors border-0"
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
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure SSL • Instant Access</span>
              </div>
              <Link
                href="/merchant/billing"
                onClick={onClose}
                className="text-[11px] font-medium text-[#007F79] hover:underline flex items-center gap-1"
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
