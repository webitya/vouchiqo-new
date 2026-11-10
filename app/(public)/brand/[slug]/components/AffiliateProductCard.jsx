"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export default function AffiliateProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const {
    _id,
    title,
    originalPrice,
    discountPrice,
    discountPercentage,
    discountText,
    affiliateUrl,
    imageUrl,
  } = product;

  const displayTitle =
    typeof title === "string" ? title : String(title?.title || "Special Deal");
  const numOrig =
    typeof originalPrice === "number"
      ? originalPrice
      : Number(originalPrice) || 0;
  let numDisc =
    typeof discountPrice === "number"
      ? discountPrice
      : Number(discountPrice) || 0;

  // Extract price from discountText if discountPrice is missing (e.g. "Starts @ ₹999")
  if (numDisc === 0 && discountText) {
    const match = discountText.match(
      /(?:starts?\s*(?:at|@)?\s*|under\s*|price\s*:\s*)?(?:₹|rs\.?)\s*(\d[\d,]*)/i,
    );
    if (match?.[1]) {
      const parsed = Number(match[1].replace(/,/g, ""));
      if (parsed > 0) numDisc = parsed;
    }
  }

  const effectivePrice = numDisc > 0 ? numDisc : numOrig > 0 ? numOrig : null;
  const hasExactPricing = numOrig > 0 && numDisc > 0 && numOrig > numDisc;
  const savings = hasExactPricing ? Math.max(0, numOrig - numDisc) : 0;
  const percentOff = hasExactPricing
    ? Math.round((savings / numOrig) * 100)
    : discountPercentage || 0;

  // Determine real discount text or fallback
  let displayDiscount = discountText?.trim() || null;
  if (displayDiscount && /^B\d+-G\d+%/i.test(displayDiscount)) {
    const percentages = displayDiscount.match(/\d+(?=%)/g);
    if (percentages && percentages.length > 0) {
      const highest = Math.max(...percentages.map(Number));
      displayDiscount = `Up to ${highest}% OFF`;
    }
  }

  if (!displayDiscount) {
    if (percentOff > 0) {
      displayDiscount = `${percentOff}% OFF`;
    } else {
      displayDiscount = "Special Offer";
    }
  }

  const handleClick = (e) => {
    // If heart button was clicked, don't navigate
    if (e.target.closest(".wishlist-btn")) return;

    try {
      const payload = JSON.stringify({ action: "click", productId: _id });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/affiliate-products", blob);
      } else {
        fetch("/api/affiliate-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}

    window.open(affiliateUrl || "#", "_blank", "noopener,noreferrer");
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer select-none text-left font-sans"
    >
      {/* Banner Image Container with Floating Wishlist Heart */}
      <div className="relative w-full aspect-[3/2] bg-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 260px"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
        )}

        {/* Floating Heart Wishlist Button on Top Right */}
        <button
          type="button"
          onClick={toggleWishlist}
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className="wishlist-btn absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white shadow-xs border border-slate-200/80 flex items-center justify-center cursor-pointer active:scale-90 transition-all z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isFavorite
                ? "fill-rose-500 text-rose-500"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
        </button>
      </div>

      {/* Product Details Below Image */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-1.5">
        <h4
          className="text-xs sm:text-[13.5px] font-semibold text-slate-800 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors"
          title={displayTitle}
        >
          {displayTitle}
        </h4>

        {/* Real Deal / Price Row - Consistent height & structure for all cards */}
        <div className="pt-0.5 min-h-[24px] flex items-center">
          {effectivePrice ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                ₹{effectivePrice.toLocaleString("en-IN")}
              </span>
              {hasExactPricing && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  ₹{numOrig.toLocaleString("en-IN")}
                </span>
              )}
              {displayDiscount && displayDiscount !== `₹${effectivePrice}` && (
                <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {displayDiscount}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Special Deal
              </span>
              {displayDiscount && (
                <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {displayDiscount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
