"use client";

import { LayoutGrid, Percent, Store, Tag } from "lucide-react";

export default function BrandStats({
  coupons = [],
  merchant = {},
  affiliateProducts = [],
  affiliateCount = 0,
}) {
  const actualAffiliateCount = affiliateCount || affiliateProducts?.length || 0;
  const totalOffersCount = (coupons?.length || 0) + actualAffiliateCount;

  const pctArr = [
    ...coupons
      .filter(
        (c) =>
          c.discountType === "percentage" &&
          c.discountValue !== null &&
          c.discountValue !== undefined &&
          !Number.isNaN(Number(c.discountValue)),
      )
      .map((c) => Number(c.discountValue)),
    ...affiliateProducts
      .filter(
        (p) =>
          p.discountPercentage && !Number.isNaN(Number(p.discountPercentage)),
      )
      .map((p) => Number(p.discountPercentage)),
  ];

  const fixedArr = [
    ...coupons
      .filter(
        (c) =>
          c.discountType === "fixed" &&
          c.discountValue !== null &&
          c.discountValue !== undefined &&
          !Number.isNaN(Number(c.discountValue)),
      )
      .map((c) => Number(c.discountValue)),
    ...affiliateProducts
      .filter(
        (p) =>
          p.originalPrice &&
          p.discountPrice &&
          p.originalPrice > p.discountPrice,
      )
      .map((p) => Number(p.originalPrice - p.discountPrice)),
  ];
  const hasFreebie = coupons.some((c) => c.discountType === "freebie");

  let discountLabel = "See Deals";
  if (pctArr.length > 0) {
    discountLabel = `Up to ${Math.max(...pctArr)}%`;
  } else if (merchant.maxDiscount) {
    discountLabel = `Up to ${merchant.maxDiscount}%`;
  } else if (fixedArr.length > 0) {
    discountLabel = `Up to ₹${Math.max(...fixedArr)}`;
  } else if (hasFreebie) {
    discountLabel = "Freebies";
  }

  const categoryName =
    merchant.category === "kids-baby"
      ? "Kids-Baby"
      : merchant.category
        ? merchant.category.charAt(0).toUpperCase() + merchant.category.slice(1)
        : "General";

  const channelName =
    merchant.businessType === "both"
      ? "Both"
      : merchant.businessType === "offline"
        ? "In-Store"
        : merchant.businessType === "online"
          ? "Online"
          : "Both";

  const stats = [
    {
      label: "Active Deals",
      value: `${totalOffersCount || 0}`,
      Icon: Tag,
      iconColor: "text-[#007F79]",
      bgColor: "bg-[#007F79]/10",
    },
    {
      label: "Best Discount",
      value: discountLabel,
      Icon: Percent,
      iconColor: "text-[#FF2E63]",
      bgColor: "bg-[#FF2E63]/10",
    },
    {
      label: "Channel",
      value: channelName,
      Icon: Store,
      iconColor: "text-[#35104A]",
      bgColor: "bg-[#35104A]/10",
    },
    {
      label: "Category",
      value: categoryName,
      Icon: LayoutGrid,
      iconColor: "text-[#FF8C05]",
      bgColor: "bg-[#FF8C05]/10",
    },
  ];

  return (
    <>
      {/* ── Mobile Layout (< lg): Compact divide-x bar in Brand Colors ── */}
      <div className="block lg:hidden w-full bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-2.5 sm:p-3 shadow-2xs font-sans">
        <div className="grid grid-cols-4 divide-x divide-[#EADBCE] text-left">
          {stats.map((s, idx) => {
            const IconComp = s.Icon;
            return (
              <div
                key={s.label}
                className={`flex flex-col justify-between ${
                  idx === 0
                    ? "pr-1.5 sm:pr-3"
                    : idx === 3
                      ? "pl-1.5 sm:pl-3"
                      : "px-1.5 sm:px-3"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <IconComp
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconColor}`}
                  />
                </div>
                <span className="text-[9.5px] sm:text-[11px] font-heading font-bold text-[#6B4C82] uppercase mt-1.5 block whitespace-nowrap truncate">
                  {s.label}
                </span>
                <span className="text-xs sm:text-sm font-heading font-bold text-[#35104A] mt-0.5 block truncate">
                  {s.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Layout (lg: and above): Compact Brand Cards ── */}
      <div className="hidden lg:grid grid-cols-4 gap-2.5 text-left font-sans">
        {stats.map((s) => {
          const IconComp = s.Icon;
          return (
            <div
              key={s.label}
              className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all hover:border-[#007F79] flex items-center justify-between"
            >
              <div>
                <span className="text-[9.5px] font-heading font-bold text-[#6B4C82] uppercase tracking-wider block">
                  {s.label}
                </span>
                <span className="text-[13px] font-heading font-bold text-[#35104A] mt-0.5 block capitalize truncate max-w-[110px]">
                  {s.value}
                </span>
              </div>
              <div
                className={`w-7.5 h-7.5 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0`}
              >
                <IconComp className={`w-3.5 h-3.5 ${s.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
