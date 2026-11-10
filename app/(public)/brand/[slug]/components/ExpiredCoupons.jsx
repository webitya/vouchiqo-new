"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

/**
 * Expired coupons section with revival button for brand detail page.
 */
export default function ExpiredCoupons({
  expiredCoupons,
  revivalStatus,
  onRevive,
}) {
  if (expiredCoupons.length === 0) return null;

  return (
    <div className="space-y-3 pt-4">
      <h3 className="text-xs sm:text-[13px] font-medium text-[#F72853] uppercase tracking-wider text-left">
        Expired Offers
      </h3>
      <div className="space-y-2">
        {expiredCoupons.map((coupon) => {
          const isSuccess = revivalStatus[coupon._id] === "success";
          const isLoading = revivalStatus[coupon._id] === "loading";

          return (
            <div
              key={coupon._id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden"
            >
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  {coupon.code && (
                    <span className="font-mono text-xs bg-[#f1f5f9] px-2 py-0.5 rounded text-slate-400 line-through">
                      {coupon.code}
                    </span>
                  )}
                  <span className="bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                    Expired
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  {coupon.title}
                </h4>
                <p className="text-[11px] text-[#6b7280] leading-snug">
                  {coupon.description}
                </p>
              </div>

              <div className="flex-shrink-0 self-stretch sm:self-auto flex items-center justify-end">
                {isSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#2f855a] font-bold bg-[#eaf5ec] border border-[#c6f6d5] px-4 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Revival Vote Counted</span>
                  </div>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => onRevive(coupon._id)}
                    type="button"
                    className="bg-[#3e80dd] hover:bg-[#2563eb] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
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
        })}
      </div>
    </div>
  );
}
