"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function CouponCard({
  coupon = {},
  isExpanded,
  toggleDetails,
  copiedCouponId,
  handleCopyCode,
  merchant,
}) {
  const hasCode = coupon.code && coupon.code.trim() !== "";
  const offerType = coupon.offerType || (hasCode ? "code" : "deal");
  const discountType = coupon.discountType || "percentage";
  const rawVal = coupon.rawDiscountValue || coupon.discountValue;

  const isNumericValue =
    rawVal !== null &&
    rawVal !== undefined &&
    rawVal !== "" &&
    !Number.isNaN(Number(rawVal));

  let topSaveLabel = "Save";
  let mainDiscountBadge = null;
  let bottomTag = "OFF";

  if (offerType === "deal" && coupon.salePrice) {
    if (coupon.originalPrice && coupon.originalPrice > coupon.salePrice) {
      const pct = Math.round(
        ((coupon.originalPrice - coupon.salePrice) / coupon.originalPrice) *
          100,
      );
      topSaveLabel = "Save";
      mainDiscountBadge = `${pct}%`;
      bottomTag = "OFF";
    } else {
      topSaveLabel = "Deal";
      mainDiscountBadge = `₹${coupon.salePrice}`;
      bottomTag = "PRICE";
    }
  } else if (discountType === "percentage" && isNumericValue) {
    topSaveLabel = "Save";
    mainDiscountBadge = `${rawVal}%`;
    bottomTag = "OFF";
  } else if (discountType === "fixed" && isNumericValue) {
    topSaveLabel = "Save";
    mainDiscountBadge = `₹${rawVal}`;
    bottomTag = "OFF";
  } else if (discountType === "freebie" || offerType === "special") {
    topSaveLabel = "Gift";
    if (coupon.specialOfferType) {
      mainDiscountBadge = coupon.specialOfferType.split(" ")[0];
    } else if (typeof rawVal === "string" && rawVal.trim() && !isNumericValue) {
      mainDiscountBadge = rawVal.length > 8 ? `${rawVal.slice(0, 7)}…` : rawVal;
    } else {
      mainDiscountBadge = "BOGO";
    }
    bottomTag = "DEAL";
  } else if (rawVal) {
    topSaveLabel = "Save";
    mainDiscountBadge = isNumericValue
      ? `${rawVal}%`
      : String(rawVal).length > 8
        ? `${String(rawVal).slice(0, 7)}…`
        : String(rawVal);
    bottomTag = "OFF";
  }

  const expiryLabel = coupon.expiresAt
    ? (() => {
        const d = new Date(coupon.expiresAt);
        const diff = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) return "Expires soon";
        if (diff === 1) return "Expires tomorrow";
        return `Expires in ${diff} days`;
      })()
    : null;

  return (
    <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-[0_8px_20px_rgba(255,46,99,0.14)] hover:border-[#FF2E63] font-sans text-left group">
      {/* Main card row */}
      <div className="flex flex-row items-stretch">
        {/* Discount badge column */}
        <div
          className="w-[75px] sm:w-[115px] flex-shrink-0 flex flex-col items-center justify-center py-3 sm:py-5 px-1.5 sm:px-3 text-center"
          style={{
            background: hasCode
              ? "linear-gradient(160deg, #35104A, #007F79)"
              : "linear-gradient(160deg, #FF2E63, #35104A)",
          }}
        >
          {mainDiscountBadge ? (
            <>
              <span className="text-[8.5px] sm:text-[9px] font-heading font-bold uppercase tracking-widest text-[#FFD166] mb-0.5">
                {topSaveLabel}
              </span>
              <span className="text-lg sm:text-2xl font-heading font-bold text-white leading-none uppercase truncate max-w-full">
                {mainDiscountBadge}
              </span>
              <span className="text-[8px] sm:text-[9px] font-heading font-semibold uppercase tracking-wider text-white/80 mt-0.5 sm:mt-1">
                {bottomTag}
              </span>
            </>
          ) : (
            <>
              <span className="text-[8.5px] sm:text-[9px] font-heading font-bold uppercase tracking-widest text-[#FFD166] mb-0.5">
                {hasCode ? "Code" : "Deal"}
              </span>
              <span className="text-sm sm:text-base font-heading font-bold text-white leading-none">
                {hasCode ? "PROMO" : "OFFER"}
              </span>
              <span className="text-[8px] sm:text-[9px] font-heading font-semibold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded mt-1 text-white">
                Active
              </span>
            </>
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 p-2.5 sm:p-3.5 flex flex-col justify-between gap-2 text-left min-w-0">
          <div className="space-y-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 px-2 py-0.5 rounded text-[10px] font-heading font-semibold">
                <CheckCircle2 className="w-3 h-3 text-[#007F79]" />
                100% Verified
              </span>
              <span className="text-[11px] text-[#6B4C82] font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-[#6B4C82]" /> Community Tested
              </span>
              {expiryLabel && (
                <span className="text-[10px] text-[#FF8C05] font-semibold bg-[#FF8C05]/10 px-1.5 py-0.5 rounded border border-[#FF8C05]/20">
                  {expiryLabel}
                </span>
              )}
            </div>

            {/* Title / Headline */}
            <h3 className="text-[13.5px] sm:text-[15px] font-heading font-bold text-[#35104A] leading-snug">
              {coupon.title || coupon.headline}
            </h3>

            {/* Description */}
            {(coupon.description || coupon.shortDescription) && (
              <p className="text-xs text-[#6B4C82] leading-relaxed line-clamp-2 font-medium">
                {coupon.description || coupon.shortDescription}
              </p>
            )}

            {/* Additional In-Depth Info Chips */}
            {(coupon.minOrderValue || coupon.maxCap || coupon.validHours) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-heading font-semibold text-[#35104A]">
                {coupon.minOrderValue && (
                  <span className="bg-white border border-[#EADBCE] px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#007F79]" /> Min Bill:
                    ₹{coupon.minOrderValue}
                  </span>
                )}
                {coupon.maxCap && (
                  <span className="bg-white border border-[#EADBCE] px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#6B4C82]" /> Max Cap: ₹
                    {coupon.maxCap}
                  </span>
                )}
                {coupon.validHours && (
                  <span className="bg-[#007F79]/10 border border-[#007F79]/20 text-[#007F79] px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#007F79]" />{" "}
                    {coupon.validHours}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions row */}
          <div className="flex justify-between items-center pt-1.5 border-t border-[#EADBCE]">
            <button
              onClick={toggleDetails}
              type="button"
              className="text-xs font-heading font-semibold text-[#6B4C82] hover:text-[#007F79] transition-colors flex items-center gap-1 border-0 bg-transparent cursor-pointer p-0"
            >
              {isExpanded ? "Hide details" : "Show details"}
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {hasCode ? (
              <div>
                {copiedCouponId === coupon._id ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 text-[11px] sm:text-xs font-heading font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#007F79]" />
                    Code Copied!
                  </span>
                ) : (
                  <button
                    onClick={() => handleCopyCode(coupon.code, coupon._id)}
                    type="button"
                    className="bg-[#FF2E63] hover:bg-[#35104A] active:bg-[#35104A] text-white text-[11px] sm:text-xs font-heading font-bold px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl border-0 cursor-pointer transition-colors shadow-2xs"
                  >
                    Get Code
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleCopyCode("", coupon._id)}
                type="button"
                className="bg-[#007F79] hover:bg-[#35104A] active:bg-[#35104A] text-white text-[11px] sm:text-xs font-heading font-bold px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl border-0 cursor-pointer transition-colors flex items-center gap-1 sm:gap-1.5 shadow-2xs"
              >
                <span>Get Deal</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details in depth */}
      {isExpanded && (
        <div className="bg-white border-t border-[#EADBCE] px-3.5 sm:px-4 py-2.5 sm:py-3 text-left space-y-2 font-sans">
          <div className="space-y-1">
            <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#6B4C82]">
              Terms &amp; Redemption Conditions
            </p>
            {coupon.termsAndConditions ? (
              <p className="text-xs text-[#35104A] font-medium leading-relaxed whitespace-pre-line">
                {coupon.termsAndConditions}
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-[#6B4C82] font-medium list-disc pl-4">
                <li>
                  Applicable only on verified purchases for {merchant?.businessName || "this merchant"}.
                </li>
                <li>
                  Discount applies to base invoice total; taxes and fees
                  excluded.
                </li>
                <li>Cannot be combined with other ongoing store promotions.</li>
              </ul>
            )}
          </div>

          {coupon.redemptionMethod && (
            <div className="pt-1.5 border-t border-[#EADBCE] flex items-center justify-between text-xs font-heading font-bold text-[#35104A]">
              <span>Redemption Method:</span>
              <span className="text-[#007F79] bg-[#007F79]/10 px-2.5 py-0.5 rounded-md border border-[#007F79]/20">
                {coupon.redemptionMethod}
              </span>
            </div>
          )}

          {hasCode && (
            <div className="pt-1.5 border-t border-[#EADBCE] flex items-center gap-2">
              <span className="text-xs font-heading font-bold text-[#6B4C82]">
                Promo code:
              </span>
              <span className="font-mono bg-[#FFF8EF] border border-[#EADBCE] text-[#007F79] px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase shadow-2xs">
                {coupon.code}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
