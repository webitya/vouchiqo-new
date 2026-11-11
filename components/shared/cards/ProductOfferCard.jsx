"use client";

import { ArrowUpRight, ShieldCheck } from "lucide-react";
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
      className="group relative flex flex-col rounded-xl no-underline cursor-pointer border border-[#EADBCE] bg-[#FFF8EF] shadow-2xs hover:shadow-md hover:border-[#007F79]/50 hover:shadow-[0_8px_20px_rgba(0,127,121,0.12)] hover:-translate-y-0.5 transition-all duration-200 text-left overflow-hidden h-full font-sans touch-manipulation active:scale-[0.98]"
    >
      {/* ===== Product Banner Image - 16:9 native aspect ratio for compact promotional banners ===== */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#35104A] shrink-0 pointer-events-none">
        <SafeImage
          src={coverImage}
          alt={title || "Offer banner"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] pointer-events-none"
        />

        {/* Subtle bottom vignette to ensure contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A2B]/40 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Floating discount badge - top-left */}
        {badgeLabel && (
          <div className="absolute top-2 left-2 z-10 bg-[#007F79] text-white text-[9.5px] sm:text-[10px] font-heading font-semibold px-1.5 sm:px-2 py-0.5 rounded shadow-2xs leading-none tracking-wide pointer-events-none">
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>

      {/* ===== Card Body ===== */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-3 gap-1.5 bg-[#FFF8EF] pointer-events-none">
        {/* Brand / Merchant Row */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-3.5 h-3.5 rounded-full border border-[#EADBCE] bg-white overflow-hidden shrink-0 flex items-center justify-center p-0.5">
            <SafeImage
              src={merchantLogo}
              alt={merchantName || "Merchant"}
              width={14}
              height={14}
              className="w-full h-full object-contain rounded-full select-none pointer-events-none"
            />
          </div>
          <span className="text-[10px] sm:text-[10.5px] font-medium text-[#6B4C82] truncate leading-none">
            {merchantName}
          </span>
          <ShieldCheck
            className="w-3 h-3 text-[#007F79] shrink-0 stroke-[1.6]"
            title="Verified Store"
          />
        </div>

        {/* Product Title - 2-line clamp, high contrast readability */}
        <h3 className="text-[12px] sm:text-[12.5px] font-heading font-semibold text-[#35104A] group-hover:text-[#007F79] transition-colors leading-[1.3] line-clamp-2 min-h-[32px]">
          {title}
        </h3>

        {/* Price & Value Block */}
        <div className="flex items-baseline gap-1.5 flex-wrap min-h-[18px]">
          {numDisc > 0 ? (
            <>
              <span className="text-[14px] sm:text-[15px] font-heading font-semibold text-[#35104A] tracking-tight leading-none">
                ₹{numDisc.toLocaleString("en-IN")}
              </span>
              {numOrig > numDisc && (
                <span className="text-[10.5px] text-[#6B4C82]/60 line-through leading-none">
                  ₹{numOrig.toLocaleString("en-IN")}
                </span>
              )}
              {savings > 0 && (
                <span className="text-[9.5px] sm:text-[10px] font-medium text-[#007F79] bg-[#007F79]/10 border border-[#007F79]/20 px-1.5 py-0.5 rounded leading-none">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] sm:text-[10.5px] font-heading font-semibold text-[#007F79] bg-white border border-[#007F79]/25 px-1.5 py-0.5 rounded-md leading-none shadow-2xs">
              {discountText?.trim() ? discountText : "Exclusive Deal"}
            </span>
          )}
        </div>

        {/* CTA - Proportional Fitts's Law Target */}
        <div className="mt-auto pt-1">
          <span className="flex items-center justify-center gap-1.5 w-full h-7 sm:h-7.5 rounded-lg text-[11px] sm:text-[11.5px] font-heading font-semibold text-white bg-[#007F79] group-hover:bg-[#00605B] active:scale-[0.98] transition-all duration-150 shadow-2xs group-hover:shadow-xs">
            <span>Grab Offer</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
});

export default ProductOfferCard;
