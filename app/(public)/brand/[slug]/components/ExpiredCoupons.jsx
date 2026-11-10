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
    <div className="space-y-2.5 pt-3 font-sans">
      <h3 className="text-xs sm:text-[13px] font-heading font-bold text-[#FF2E63] uppercase tracking-wider text-left">
        Expired Offers
      </h3>
      <div className="space-y-2">
        {expiredCoupons.map((coupon) => {
          const isSuccess = revivalStatus[coupon._id] === "success";
          const isLoading = revivalStatus[coupon._id] === "loading";

          return (
            <div
              key={coupon._id}
              className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative overflow-hidden"
            >
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  {coupon.code && (
                    <span className="font-mono text-xs bg-[#FFFDF9] px-2 py-0.5 rounded text-[#35104A]/60 line-through border border-[#EADBCE]">
                      {coupon.code}
                    </span>
                  )}
                  <span className="bg-[#FF2E63]/10 text-[#FF2E63] border border-[#FF2E63]/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-heading">
                    Expired
                  </span>
                </div>
                <h4 className="text-sm font-heading font-bold text-[#35104A]">
                  {coupon.title}
                </h4>
                <p className="text-[11px] text-[#6B4C82] leading-snug">
                  {coupon.description}
                </p>
              </div>

              <div className="flex-shrink-0 self-stretch sm:self-auto flex items-center justify-end">
                {isSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#007F79] font-bold bg-[#007F79]/10 border border-[#007F79]/20 px-3.5 py-1.5 rounded-lg font-heading">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Revival Vote Counted</span>
                  </div>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => onRevive(coupon._id)}
                    type="button"
                    className="bg-[#FF2E63] hover:bg-[#35104A] text-white text-xs font-heading font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 border-0 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
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
