"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function CouponCard({
  coupon,
  onRedeem,
  isLocal = false,
  isMarbellaLocal = false,
  source = "category",
}) {
  const {
    _id,
    title,
    discountValue,
    discountType,
    description,
    merchantId,
    expiresAt,
  } = coupon;

  const cardRef = useRef(null);
  const track = useTrackEvent();
  const trackedImpression = useRef(false);

  const mId = typeof merchantId === "object" ? merchantId?._id : merchantId;
  const rawMerchantName = typeof merchantId === "object" ? merchantId?.businessName : (typeof merchantId === "string" ? merchantId : undefined);
  const mName = typeof rawMerchantName === "string" ? rawMerchantName : "Partner";

  useEffect(() => {
    if (!cardRef.current || trackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !trackedImpression.current) {
            trackedImpression.current = true;
            track("impression", { couponId: _id, merchantId: mId, source });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [_id, mId, source, track]);

  const handleCardClick = () => {
    track("click", { couponId: _id, merchantId: mId, source });
  };

  const rawVal = coupon.rawDiscountValue || discountValue;
  const rawType = coupon.rawDiscountType || discountType;
  const isNum = rawVal !== null && rawVal !== undefined && rawVal !== "" && !isNaN(Number(rawVal));
  const num = Number(rawVal);

  const discountFormatted = (() => {
    if (rawType === "percentage") {
      if (isNum && num <= 100) return `${num}% OFF`;
      if (isNum && num > 100) return `₹${num} OFF`;
      return `${rawVal || 15}% OFF`;
    }
    if (rawType === "fixed" || rawType === "flat") {
      return isNum ? `₹${num} OFF` : `₹${rawVal || 200} OFF`;
    }
    if (rawType === "freebie" || rawType === "bogo") {
      return "BUY 1 GET 1 FREE";
    }
    return isNum && num <= 100 ? `${num}% OFF` : isNum ? `₹${num} OFF` : "SPECIAL OFFER";
  })();

  const isExpiringSoon = expiresAt
    ? new Date(expiresAt) - Date.now() < 86400000 * 2 // Less than 2 days
    : false;

  const isHotOrFeatured = coupon.isHot || coupon.isFeatured;
  const displayTitle = typeof title === "string" ? title : "Exclusive Offer";
  const displayDesc = typeof description === "string" ? description : "No description provided. Terms and conditions apply.";

  return (
    <div
      ref={cardRef}
      className={`relative bg-white border border-[#EADBCE] rounded-xl shadow-sm overflow-hidden flex flex-col justify-between h-full group hover:shadow-md hover:-translate-y-0.5 hover:border-[#FF2E63]/40 transition-all duration-200 font-sans ${isHotOrFeatured ? "ring-1 ring-[#007F79]" : ""}`}
    >
      {/* Top Section */}
      <Link
        href={`/deals/${_id}`}
        onClick={handleCardClick}
        className="p-3.5 flex-1 block hover:no-underline cursor-pointer"
      >
        {/* Merchant Brand Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#35104A]/5 border border-[#35104A]/10 flex items-center justify-center font-heading font-bold text-[11px] text-[#35104A]">
            {mName ? mName[0].toUpperCase() : "M"}
          </div>
          <span className="text-[11px] font-medium text-[#6B4C82] uppercase tracking-wider truncate">
            {mName}
          </span>
        </div>

        {/* Discount Value */}
        <h3 className="text-lg font-heading font-bold text-[#35104A] mb-0.5 group-hover:text-[#FF2E63] transition-colors">
          {discountFormatted}
        </h3>
        <p className="text-xs font-semibold text-[#35104A] mb-1.5 leading-snug line-clamp-1">
          {displayTitle}
        </p>
        <p className="text-[11px] text-[#6B4C82] line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>
      </Link>

      {/* Ticket Cutout Divider */}
      <div className="relative w-full my-0.5">
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FFF8EF] border border-[#EADBCE] z-10" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FFF8EF] border border-[#EADBCE] z-10" />
        <div className="border-t border-dashed border-[#EADBCE] w-full" />
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 bg-[#FFF8EF]/50">
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#007F79] bg-[#007F79]/10 px-2 py-0.5 rounded-full select-none border border-[#007F79]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007F79]" />
            <span>Active Today</span>
          </span>
          {isExpiringSoon && (
            <span className="text-[10px] font-semibold text-[#FF2E63] flex items-center gap-1 select-none">
              <ShieldAlert className="w-3 h-3" />
              <span>Expiring Soon</span>
            </span>
          )}
        </div>
        {onRedeem ? (
          <Button
            onClick={() => {
              handleCardClick();
              onRedeem(coupon);
            }}
            className="w-full text-xs py-2 rounded-xl shadow-2xs border-0 h-auto cursor-pointer font-heading font-bold bg-[#FF2E63] hover:bg-[#E02253] text-white transition-colors"
          >
            Claim Offer
          </Button>
        ) : (
          <Button
            asChild
            onClick={handleCardClick}
            className="w-full text-xs py-2 rounded-xl shadow-2xs border-0 h-auto cursor-pointer text-center justify-center font-heading font-bold bg-[#FF2E63] hover:bg-[#E02253] text-white transition-colors"
          >
            <Link href={`/deals/${_id}`}>View Offer</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
