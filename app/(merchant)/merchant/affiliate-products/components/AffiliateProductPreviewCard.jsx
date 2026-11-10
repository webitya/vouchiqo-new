"use client";

import {
  Check,
  Copy,
  Edit2,
  ExternalLink,
  MousePointerClick,
  Power,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export const CATEGORIES = [
  "Fashion & Clothing",
  "Electronics & Gadgets",
  "Food & Dining",
  "Beauty & Wellness",
  "Travel & Hospitality",
  "Home & Living",
  "Fitness & Healthcare",
  "Education & Courses",
  "Website & Tech",
  "Services",
  "General Offers",
];

export const CATEGORY_COLORS = {
  "Home & Living": "bg-slate-900 text-white border-slate-800",
  "Electronics & Gadgets": "bg-blue-600 text-white border-blue-500",
  "Fashion & Clothing": "bg-purple-600 text-white border-purple-500",
  "Food & Dining": "bg-amber-500 text-slate-950 border-amber-400 font-bold",
  "Beauty & Wellness": "bg-pink-600 text-white border-pink-500",
  "Travel & Hospitality": "bg-teal-600 text-white border-teal-500",
  "Fitness & Healthcare": "bg-emerald-600 text-white border-emerald-500",
  "Education & Courses": "bg-indigo-600 text-white border-indigo-500",
  "Website & Tech": "bg-sky-600 text-white border-sky-500",
  Services: "bg-violet-600 text-white border-violet-500",
  "General Offers": "bg-slate-800 text-white border-slate-700",
};

export default function AffiliateProductPreviewCard({
  product = {},
  isPreview = false,
  onCopy = null,
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
  isDeleting = false,
  isToggling = false,
}) {
  const [copied, setCopied] = useState(false);

  const title = product.title || "Sample Product Title";
  const category = product.category || "General Offers";
  const originalPrice = Number(product.originalPrice) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const discountPercentage = Number(product.discountPercentage) || 0;
  const discountText = product.discountText || "";
  const affiliateUrl = product.affiliateUrl || "https://webitya.com";
  const imageUrl = product.imageUrl || "";
  const status = product.status || "active";
  const clickCount = product.clickCount || 0;

  const hasExactPricing = originalPrice > 0 && discountPrice > 0;
  const hasFixedPrice = discountPrice > 0 && originalPrice === 0;
  const savings = hasExactPricing
    ? Math.max(0, originalPrice - discountPrice)
    : 0;
  const savingsPercent = hasExactPricing
    ? Math.round((savings / originalPrice) * 100)
    : discountPercentage;

  // Format Top Badge text
  let badgeDiscountText = discountText || null;
  if (!badgeDiscountText) {
    if (hasExactPricing) {
      badgeDiscountText = `${savingsPercent}% OFF`;
    } else if (hasFixedPrice) {
      badgeDiscountText = `JUST @ ₹${discountPrice}`;
    } else if (discountPercentage > 0) {
      badgeDiscountText = `${discountPercentage}% OFF`;
    }
  }

  const badgeStyle =
    CATEGORY_COLORS[category] || "bg-slate-900 text-white border-slate-800";

  const handleCopy = (e) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(affiliateUrl, product._id);
    } else {
      navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs hover:shadow-xs hover:border-[#F72853]/50 transition-all flex flex-col justify-between relative overflow-hidden font-sans text-left w-full ${
        status === "paused" ? "opacity-75 bg-slate-50/50" : ""
      }`}
    >
      {/* Top Banner & Status Indicator */}
      <div className="space-y-2">
        <div className="relative w-full h-36 sm:h-40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-lg overflow-hidden border border-slate-100 group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <ShoppingBag className="w-7 h-7 mb-1 opacity-60 text-rose-400" />
              <span className="text-xs font-normal text-slate-300">
                Product Image
              </span>
            </div>
          )}

          {/* Category Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border shadow-xs ${badgeStyle}`}
            >
              <Tag className="w-2.5 h-2.5 shrink-0" />
              {category}
            </span>
          </div>

          {/* Discount Tag (Top Right) */}
          {badgeDiscountText && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center gap-1 bg-[#F72853] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs border border-rose-500 max-w-[150px] truncate">
                <Tag className="w-2.5 h-2.5 shrink-0" />
                {badgeDiscountText}
              </span>
            </div>
          )}

          {/* Status Badge overlay for Paused state */}
          {status === "paused" && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="bg-amber-500 text-slate-950 font-medium text-xs px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5" />
                Listing Paused
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
            {title}
          </h3>
          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing Info Box */}
        <div className="flex items-center justify-between bg-slate-50/90 p-2 rounded-lg border border-slate-200/80">
          {hasExactPricing ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-semibold text-[#F72853]">
                  ₹{discountPrice.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              </div>
              {savings > 0 && (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  Save ₹{savings.toLocaleString()}
                </span>
              )}
            </>
          ) : hasFixedPrice ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-normal text-slate-500">
                  Offer Price:
                </span>
                <span className="text-sm sm:text-base font-semibold text-emerald-600">
                  ₹{discountPrice.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#F72853] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 truncate max-w-[160px]">
                {discountText || `Just @ ₹${discountPrice}`}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-[#F72853] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80">
                {badgeDiscountText || "SPECIAL OFFER"}
              </span>
              <span className="text-xs font-normal text-slate-500">
                Brand Deal
              </span>
            </div>
          )}
        </div>

        {/* Affiliate Link Input / Display Box */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block">
            Affiliate Destination Link
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200/80 text-xs">
            <span className="truncate text-slate-700 text-xs flex-1 font-normal font-mono">
              {affiliateUrl}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-500 hover:text-[#F72853] hover:bg-white rounded transition-colors cursor-pointer shrink-0"
              title="Copy Affiliate Link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-500 hover:text-[#F72853] hover:bg-white rounded transition-colors shrink-0"
              title="Open Destination Link"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Footer Actions (Hidden in Preview mode) */}
      {!isPreview && (
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-normal text-xs">
            <MousePointerClick className="w-3.5 h-3.5 text-[#F72853]" />
            <span>{clickCount} clicks</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(product)}
                disabled={isToggling}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                }`}
                title={
                  status === "active" ? "Pause Product" : "Activate Product"
                }
              >
                <Power className="w-3 h-3" />
                <span>{status === "active" ? "Active" : "Paused"}</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="p-1 text-slate-500 hover:text-[#F72853] hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Edit Product"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product._id)}
                disabled={isDeleting}
                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
