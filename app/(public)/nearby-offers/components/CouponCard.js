"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/badge";

/**
 * Individual nearby coupon card.
 */
export default function NearbyCouponCard({ coupon, showMap, onCardClick }) {
  const brandName = coupon.merchantId?.businessName || "Verified Brand";
  const isMarbella = brandName.toLowerCase() === "marbella";
  const discountText =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  return (
    <div
      className={`bg-white border rounded-2xl p-4 transition-all hover:border-brand-blue cursor-pointer shadow-sm relative flex gap-3.5 group hover:shadow-md ${
        isMarbella
          ? "border-[#2563eb]/45 bg-[#2563eb]/[0.02]"
          : "border-brand-border"
      }`}
      onClick={() => onCardClick?.(coupon)}
    >
      {/* Merchant logo */}
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
        {coupon.merchantId?.logo
          ? <SafeImage
              src={coupon.merchantId.logo}
              alt={brandName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          : <div className="w-full h-full bg-brand-navy text-white font-black flex items-center justify-center text-[15px]">
              {brandName[0]}
            </div>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5 text-left">
        <div className="flex justify-between items-center gap-1.5">
          <h4 className="font-extrabold text-[10px] text-brand-navy uppercase tracking-wider truncate">
            {brandName}
          </h4>
          <span className="text-[10px] font-black text-brand-blue bg-[#eff6ff] px-2 py-0.5 rounded-full whitespace-nowrap">
            {coupon.distance} km away
          </span>
        </div>
        <div className="space-y-0.5">
          <h3 className="font-black text-base text-brand-text group-hover:text-brand-blue transition-colors leading-snug">
            {discountText}
          </h3>
          <p className="text-[11px] text-brand-subtext font-semibold leading-relaxed line-clamp-1">
            {coupon.title}
          </p>
        </div>
        <p className="text-[9px] text-slate-400 font-semibold truncate leading-none flex items-center gap-1 pt-0.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{coupon.address}</span>
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 shadow-none text-[8px] font-bold px-2 py-0.5 rounded uppercase">
            {coupon.category}
          </Badge>
          <Link
            href={`/deals/${coupon._id}`}
            className="text-[11px] font-extrabold text-brand-blue hover:underline flex items-center gap-0.5 ml-auto"
          >
            Claim Offer <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
