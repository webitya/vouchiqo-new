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
      className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-70"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          {coupon.code && (
            <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 line-through">
              {coupon.code}
            </span>
          )}
          <span className="bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider">
            Expired
          </span>
        </div>
        <h4 className="text-[13px] font-medium text-gray-600 leading-snug">
          {coupon.title}
        </h4>
        {coupon.description && (
          <p className="text-[11px] text-gray-400 leading-snug font-normal">
            {coupon.description}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        {isSuccess ? (
          <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-semibold bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Revival Requested
          </div>
        ) : (
          <button
            disabled={isLoading}
            onClick={() => handleReviveExpired(coupon._id)}
            type="button"
            className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 text-[12px] font-medium py-2 px-3 rounded-lg flex items-center gap-1.5 border border-gray-200 cursor-pointer disabled:opacity-50 transition-colors"
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
