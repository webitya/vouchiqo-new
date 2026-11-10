"use client";

import { Bookmark, Trash2 } from "lucide-react";
import CouponCard from "@/components/shared/cards/CouponCard";
import EmptyState from "@/components/shared/feedback/EmptyState";

export default function SavedDealsTab({
  savedClaims,
  handleRemoveClaim,
  setSelectedSavedCoupon,
}) {
  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight">
          Bookmarked &amp; Saved Offers ({savedClaims.length})
        </h3>
      </div>
      {savedClaims.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {savedClaims.map((coupon) => (
            <div key={coupon._id} className="relative group">
              <CouponCard
                coupon={coupon}
                onRedeem={(c) => setSelectedSavedCoupon(c)}
              />
              <button
                type="button"
                onClick={(e) => handleRemoveClaim(e, coupon.claimId)}
                className="absolute top-2.5 right-10 z-20 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center shadow-2xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete Bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved offers"
          description="Save offers while browsing to keep track of deals you want to use later."
        />
      )}
    </div>
  );
}
