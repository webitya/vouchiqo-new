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
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-rose-300/80 transition-all duration-200 overflow-hidden select-none text-left w-full h-[168px] sm:h-[176px]"
      style={{ textDecoration: "none" }}
    >
      {/* ── 1. Top Half: Visual Imagery & Category Tag ── */}
      <div className="relative w-full h-1/2 overflow-hidden bg-slate-900">
        <SafeImage
          src={bgBanner}
          alt={name || "Store Banner"}
          fill
          fallbackSrc={fallbackBanner}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Soft Dark Vignette for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/35 pointer-events-none" />

        {/* Category Label (Flush in Top Left Corner) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
          <span className="bg-black/60 backdrop-blur-xs text-white font-semibold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md border border-white/20 shadow-2xs tracking-wide capitalize">
            {category || "Deals"}
          </span>
        </div>
      </div>

      {/* ── 2. Floating Circular Brand Logo (Anchor - Shifted more to left edge) ── */}
      <div className="absolute top-1/2 left-1.5 sm:left-2 -translate-y-1/2 z-20">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shadow-md ring-3 ring-white group-hover:ring-rose-50 transition-all">
          {!imgError && validLogo ? (
            <SafeImage
              src={validLogo}
              alt={name || "Store Logo"}
              width={48}
              height={48}
              className="max-h-full max-w-full object-contain rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
              {name ? name.slice(0, 2) : "VT"}
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Half: Store Details with Verified Twitter Tick & Clean Offer Pill ── */}
      <div className="pt-6 sm:pt-6.5 pb-2.5 px-2 sm:px-2.5 flex flex-col justify-between h-1/2 bg-white text-left font-sans">
        {/* Brand Name + Twitter Verified Tick Badge on the Right */}
        <div className="flex items-center gap-1 min-w-0 pr-1">
          <h4 className="text-[13px] sm:text-[13.5px] font-extrabold text-slate-900 uppercase tracking-tight truncate group-hover:text-[#F72853] transition-colors leading-tight">
            {name}
          </h4>
          {isVerified && (
            <TwitterVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
          )}
        </div>

        {/* Bottom Highlight Row (Clean Offer Pill without redundant text) */}
        <div className="flex items-center gap-1 mt-auto pt-1 w-full min-w-0">
          <span className="inline-flex items-center text-[9px] sm:text-[9.5px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md truncate max-w-full">
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
