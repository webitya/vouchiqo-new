"use client";

import { ArrowUpRight, Flame, ShieldCheck } from "lucide-react";
import { memo } from "react";
import SafeImage from "@/components/shared/SafeImage";

export const ProductOfferCard = memo(function ProductOfferCard({ product }) {
  if (!product) return null;

  const {
    _id,
    title,
    originalPrice = 0,
    discountPrice = 0,
    discountPercentage = 0,
    discountText,
    merchantName: rawMerchantName,
    merchantLogo: rawMerchantLogo,
    merchantId,
    merchant,
    productImage,
    imageUrl,
    affiliateUrl,
    href,
  } = product;

  const merchantObj =
    typeof merchantId === "object" && merchantId !== null
      ? merchantId
      : typeof merchant === "object" && merchant !== null
        ? merchant
        : {};

  const merchantName =
    rawMerchantName ||
    product.merchantName ||
    merchantObj.businessName ||
    merchantObj.name ||
    "Partner Store";

  const merchantLogo =
    rawMerchantLogo ||
    product.merchantLogo ||
    merchantObj.logo ||
    (merchantName && merchantName !== "Partner Store"
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=08214d&color=ffffff&size=64&bold=true`
      : "/placeholder-brand.webp");

  const coverImage =
    imageUrl ||
    productImage ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";

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
  const savings =
    numOrig > 0 && numDisc > 0 ? Math.max(0, numOrig - numDisc) : 0;
  const computedPercent =
    numOrig > 0 && numDisc > 0
      ? Math.round((savings / numOrig) * 100)
      : discountPercentage || 0;

  // Floating discount badge on image
  let badgeLabel = null;
  if (computedPercent > 0 && computedPercent <= 100) {
    badgeLabel = `${computedPercent}% OFF`;
  } else if (discountText?.trim()) {
    badgeLabel = discountText.trim();
  } else if (numDisc > 0 && numOrig > numDisc) {
    badgeLabel = `SAVE ₹${savings.toLocaleString("en-IN")}`;
  }

  const destinationUrl = affiliateUrl || href || `/deals`;

  const handleClick = (e) => {
    if (_id) {
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
    }

    if (affiliateUrl?.startsWith("http")) {
      e.preventDefault();
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      href={destinationUrl}
      onClick={handleClick}
      target={affiliateUrl?.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-xl no-underline cursor-pointer border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.09)] hover:border-rose-300 hover:-translate-y-1 transition-all duration-200 select-none text-left overflow-hidden h-full"
    >
      {/* ===== Product Banner Image - 16:10 native aspect ratio for promotional banners ===== */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100/70 shrink-0">
        <SafeImage
          src={coverImage}
          alt={title || "Offer banner"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] select-none pointer-events-none"
        />

        {/* Subtle bottom vignette to ensure contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Floating discount badge - top-left */}
        {badgeLabel && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-[#F72853] text-white text-[10.5px] font-bold px-2 py-0.5 rounded shadow-sm leading-none tracking-wide">
            <Flame className="w-2.5 h-2.5 fill-white text-white shrink-0" />
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>

      {/* ===== Card Body ===== */}
      <div className="flex-1 flex flex-col p-3.5 gap-2">
        {/* Brand / Merchant Row */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-4 h-4 rounded-full border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-0.5">
              <SafeImage
                src={merchantLogo}
                alt={merchantName || "Merchant"}
                width={16}
                height={16}
                className="w-full h-full object-contain rounded-full select-none pointer-events-none"
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500 truncate leading-none">
              {merchantName}
            </span>
            <ShieldCheck
              className="w-3 h-3 text-emerald-500 shrink-0"
              title="Verified Store"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-normal shrink-0">
            Verified Deal
          </span>
        </div>

        {/* Product Title - 2-line clamp, high contrast readability */}
        <h3 className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#F72853] transition-colors leading-[1.35] line-clamp-2 min-h-[36px]">
          {title}
        </h3>

        {/* Price & Value Block */}
        <div className="flex items-baseline gap-1.5 flex-wrap min-h-[22px]">
          {numDisc > 0 ? (
            <>
              <span className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
                ₹{numDisc.toLocaleString("en-IN")}
              </span>
              {numOrig > numDisc && (
                <span className="text-[11.5px] text-slate-400 line-through leading-none">
                  ₹{numOrig.toLocaleString("en-IN")}
                </span>
              )}
              {savings > 0 && (
                <span className="text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded leading-none">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </>
          ) : (
            <span className="text-[11.5px] font-semibold text-[#F72853] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md leading-none">
              {discountText?.trim() ? discountText : "Exclusive Deal"}
            </span>
          )}
        </div>

        {/* CTA - Proportional Fitts's Law Target */}
        <div className="mt-auto pt-1.5">
          <span className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg text-xs font-semibold text-white bg-[#F72853] group-hover:bg-[#E01E47] active:scale-[0.98] transition-all duration-150 shadow-[0_2px_6px_rgba(247,40,83,0.22)] group-hover:shadow-[0_4px_12px_rgba(247,40,83,0.32)]">
            <span>Grab Offer</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
});

export default ProductOfferCard;
