"use client";

import {
  ArrowRight,
  ExternalLink,
  Heart,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AffiliateDealCard({ product, merchant }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    category,
    description,
  } = product;

  const displayTitle =
    typeof title === "string" ? title : String(title?.title || "Deal Product");

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

  const hasExactPricing = numOrig > 0 && numDisc > 0;
  const savings = hasExactPricing ? Math.max(0, numOrig - numDisc) : 0;
  const calculatedPercent = hasExactPricing
    ? Math.round((savings / numOrig) * 100)
    : discountPercentage || 0;

  // Clean discount pill text (no green badges on image, clean text badge in pricing row)
  let discountBadge = discountText?.trim() || null;
  if (discountBadge && /^B\d+-G\d+%/i.test(discountBadge)) {
    const percentages = discountBadge.match(/\d+(?=%)/g);
    if (percentages && percentages.length > 0) {
      const highest = Math.max(...percentages.map(Number));
      discountBadge = `Up to ${highest}% OFF`;
    }
  }

  if (!discountBadge && calculatedPercent > 0) {
    discountBadge = `${calculatedPercent}% OFF`;
  }

  const categoryName =
    category ||
    merchant?.category ||
    (merchant?.businessName ? `${merchant.businessName} Deals` : "Featured");

  const targetUrl = affiliateUrl || merchant?.website || "#";

  const handleClaimClick = (e) => {
    e.stopPropagation();
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

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <>
      <article
        onClick={() => setIsDetailsOpen(true)}
        className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-row items-center gap-3 sm:gap-4 font-sans select-none cursor-pointer group"
      >
        {/* ── 1. Clean Landscape Banner (Compact Proportional Fit) ── */}
        <div className="relative w-24 sm:w-36 md:w-44 aspect-[3/2] rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
          {imageUrl && !imageFailed ? (
            <SafeImage
              src={imageUrl}
              alt={displayTitle}
              fill
              sizes="(max-width: 640px) 96px, (max-width: 768px) 144px, 176px"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ShoppingBag className="w-6 h-6 text-slate-300" />
          )}
        </div>

        {/* ── 2. Middle Content Column: Live Database Data Only ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 py-0.5">
          {/* Top: Category Pill + Verified Pill */}
          {(categoryName || merchant?.isVerified) && (
            <div className="flex items-center gap-2 flex-wrap">
              {categoryName && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/80 capitalize truncate max-w-[130px]">
                  {categoryName}
                </span>
              )}
              {merchant?.isVerified && (
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Deal</span>
                </span>
              )}
            </div>
          )}

          {/* Middle: Title & Live Description (Only rendered if present in DB) */}
          <div className="min-w-0">
            <h4 className="text-xs sm:text-base md:text-[15.5px] font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
              {displayTitle}
            </h4>
            {description && description.trim() !== "" ? (
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>

          {/* Bottom: Pricing / Deal Badge */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {numDisc > 0 || numOrig > 0 ? (
              <>
                <span className="text-sm sm:text-base md:text-lg font-extrabold text-emerald-600 tracking-tight">
                  ₹{(numDisc > 0 ? numDisc : numOrig).toLocaleString("en-IN")}
                </span>
                {numOrig > 0 && numOrig > numDisc && (
                  <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                    ₹{numOrig.toLocaleString("en-IN")}
                  </span>
                )}
                {discountBadge && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100/80 whitespace-nowrap">
                    {discountBadge}
                  </span>
                )}
              </>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200/80 inline-flex items-center gap-1">
                {discountBadge || "Special Offer"}
              </span>
            )}
          </div>
        </div>

        {/* ── 3. Dedicated Action Section (Anchored on the right) ── */}
        <div className="w-[100px] sm:w-[130px] md:w-[145px] shrink-0 flex flex-col justify-between items-end self-stretch pl-2 sm:pl-3 md:pl-4 border-l border-slate-100 py-0.5">
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 border-rose-200 text-rose-500 shadow-2xs"
                : "bg-white border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-rose-200"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Action CTA & Link */}
          <div className="flex flex-col items-center sm:items-end gap-1 w-full mt-auto">
            <button
              type="button"
              onClick={handleClaimClick}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm py-1.5 sm:py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Claim Deal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
              className="text-[10px] sm:text-[11px] text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <span>View Details</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>
      </article>

      {/* ── 3. Product / Deal Details Modal Dialog ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xl text-left font-sans">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/80 capitalize">
                {categoryName}
              </span>
              {merchant?.businessName && (
                <span className="text-xs text-slate-500 font-medium">
                  via {merchant.businessName}
                </span>
              )}
            </div>
            <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {displayTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {merchant?.businessName
                ? `Official Deal via ${merchant.businessName}`
                : "Verified Store Offer"}
            </DialogDescription>
          </DialogHeader>

          {/* Product Image & Details Body */}
          <div className="space-y-4 pt-2">
            {imageUrl && !imageFailed && (
              <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <SafeImage
                  src={imageUrl}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Pricing Summary */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Deal Price
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  {numDisc > 0 || numOrig > 0 ? (
                    <>
                      <span className="text-xl font-extrabold text-emerald-600">
                        ₹
                        {(numDisc > 0 ? numDisc : numOrig).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                      {numOrig > 0 && numOrig > numDisc && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{numOrig.toLocaleString("en-IN")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-base font-extrabold text-emerald-600">
                      Special Offer
                    </span>
                  )}
                </div>
              </div>

              {discountBadge && (
                <span className="bg-emerald-100/80 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  {discountBadge}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  About this Deal
                </p>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            {/* Affiliate Security Disclaimer */}
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100/80 text-[11px] text-blue-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>
                Clicking &quot;Claim Deal&quot; will securely take you to{" "}
                {merchant?.businessName || "the partner store"}&apos;s website
                with the discount applied.
              </span>
            </div>

            {/* Direct CTA inside Modal */}
            <button
              type="button"
              onClick={(e) => {
                setIsDetailsOpen(false);
                handleClaimClick(e);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Claim Deal on {merchant?.businessName || "Store"}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
