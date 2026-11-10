"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

export default function ExpiredOfferCard({
  coupon,
  revivalStatus,
  handleReviveExpired,
}) {
  const isSuccess = revivalStatus[coupon._id] === "success";
  const isLoading = revivalStatus[coupon._id] === "loading";

  return (
    <div
      className="bg-white border border-brand-border/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-70"
      style={{ fontFamily: "var(--font-sans), sans-serif" }}
    >
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          {coupon.code && (
            <span className="font-mono text-[11px] bg-warm-ivory px-2 py-0.5 rounded text-royal-plum/50 line-through">
              {coupon.code}
            </span>
          )}
          <span className="bg-festival-pink/10 text-festival-pink border border-festival-pink/20 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider">
            Expired
          </span>
        </div>
        <h4 className="text-[13px] font-medium text-royal-plum/80 leading-snug">
          {coupon.title}
        </h4>
        {coupon.description && (
          <p className="text-[11px] text-royal-plum/60 leading-snug font-normal">
            {coupon.description}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        {isSuccess ? (
          <div className="flex items-center gap-1.5 text-[11px] text-festival-teal font-semibold bg-festival-teal/10 border border-festival-teal/20 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Revival Requested
          </div>
        ) : (
          <button
            disabled={isLoading}
            onClick={() => handleReviveExpired(coupon._id)}
            type="button"
            className="bg-warm-ivory hover:bg-festival-teal/10 hover:text-festival-teal hover:border-festival-teal/30 text-royal-plum text-[12px] font-medium py-2 px-3 rounded-lg flex items-center gap-1.5 border border-brand-border cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revive Offer</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
