"use client";

import Link from "next/link";
import { memo, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";
import TwitterVerifiedBadge from "@/components/shared/TwitterVerifiedBadge";

const CATEGORY_FALLBACK_BANNERS = {
  jewellery:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop",
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  grocery:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  fitness:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
  "home-improvement":
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
  travel:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
  education:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
};

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop";

export const BrandGridItem = memo(function BrandGridItem({
  name,
  logo,
  banner,
  category,
  discount,
  href,
  coupons = 12,
  isVerified = true,
}) {
  const [imgError, setImgError] = useState(false);

  const catKey = (category || "").toLowerCase().trim();
  const fallbackBanner = CATEGORY_FALLBACK_BANNERS[catKey] || DEFAULT_BANNER;

  const bgBanner =
    banner && typeof banner === "string" && banner.trim() !== ""
      ? banner
      : fallbackBanner;

  const validLogo =
    logo && typeof logo === "string" && logo.trim() !== "" ? logo : null;

  return (
    <Link
      href={href || "#"}
      prefetch={true}
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-[#EADBCE] bg-[#FFF8EF] shadow-2xs hover:shadow-md hover:border-[#FF2E63]/40 transition-all duration-200 overflow-hidden select-none text-left w-full h-[142px] sm:h-[148px] font-sans"
      style={{ textDecoration: "none" }}
    >
      {/* ── 1. Top Half: Visual Imagery & Category Tag ── */}
      <div className="relative w-full h-1/2 overflow-hidden bg-[#35104A]">
        <SafeImage
          src={bgBanner}
          alt={name || "Store Banner"}
          fill
          fallbackSrc={fallbackBanner}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Soft Dark Vignette for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A2B]/75 via-[#1F0A2B]/20 to-transparent pointer-events-none" />

        {/* Category Label (Flush in Top Left Corner) */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <span className="bg-[#35104A]/75 backdrop-blur-xs text-white font-heading font-semibold text-[8.5px] sm:text-[9px] px-1.5 py-0.5 rounded-md border border-white/20 shadow-2xs tracking-wide capitalize">
            {category || "Deals"}
          </span>
        </div>
      </div>

      {/* ── 2. Floating Circular Brand Logo (Anchor - Shifted to left edge) ── */}
      <div className="absolute top-1/2 left-1.5 sm:left-2 -translate-y-1/2 z-20">
        <div className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-white border border-[#EADBCE] p-1 flex items-center justify-center shadow-md ring-2 ring-white group-hover:ring-[#FFF8EF] transition-all">
          {!imgError && validLogo ? (
            <SafeImage
              src={validLogo}
              alt={name || "Store Logo"}
              width={40}
              height={40}
              className="max-h-full max-w-full object-contain rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[10px] font-heading font-black text-[#35104A] uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Half: Store Details with Verified Twitter Tick & Clean Offer Pill ── */}
      <div className="pt-4.5 sm:pt-5 pb-2 px-2 sm:px-2.5 flex flex-col justify-between h-1/2 bg-[#FFF8EF] text-left font-sans">
        {/* Brand Name + Twitter Verified Tick Badge on the Right */}
        <div className="flex items-center gap-1 min-w-0 pr-1">
          <h4 className="text-[12px] sm:text-[12.5px] font-heading font-bold text-[#35104A] uppercase tracking-tight truncate group-hover:text-[#FF2E63] transition-colors leading-tight">
            {name}
          </h4>
          {isVerified && (
            <TwitterVerifiedBadge className="w-3 h-3 shrink-0" />
          )}
        </div>

        {/* Bottom Highlight Row (Clean Offer Pill on Warm Ivory) */}
        <div className="flex items-center gap-1 mt-auto pt-0.5 w-full min-w-0">
          <span className="inline-flex items-center text-[8.5px] sm:text-[9px] font-heading font-bold text-[#FF2E63] bg-white border border-[#FF2E63]/25 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-full shadow-2xs">
            {discount ||
              (coupons > 0
                ? `${coupons} LIVE ${coupons === 1 ? "OFFER" : "OFFERS"}`
                : "UP TO 50% OFF")}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default BrandGridItem;
