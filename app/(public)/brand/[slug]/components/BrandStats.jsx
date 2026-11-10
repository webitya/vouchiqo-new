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
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50/80",
    },
    {
      label: "Best Discount",
      value: discountLabel,
      Icon: Percent,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50/80",
    },
    {
      label: "Channel",
      value: channelName,
      Icon: Store,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50/80",
    },
    {
      label: "Category",
      value: categoryName,
      Icon: LayoutGrid,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50/80",
    },
  ];

  return (
    <>
      {/* ── Mobile Layout (< lg): Compact divide-x bar as seen on linen-club ── */}
      <div className="block lg:hidden w-full bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs font-sans">
        <div className="grid grid-cols-4 divide-x divide-slate-100 text-left">
          {stats.map((s, idx) => {
            const IconComp = s.Icon;
            return (
              <div
                key={s.label}
                className={`flex flex-col justify-between ${
                  idx === 0
                    ? "pr-2 sm:pr-4"
                    : idx === 3
                      ? "pl-2 sm:pl-4"
                      : "px-2 sm:px-4"
                }`}
              >
                <div
                  className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <IconComp
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconColor}`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-normal text-slate-500 mt-2 block whitespace-nowrap truncate">
                  {s.label}
                </span>
                <span className="text-xs sm:text-base font-bold text-slate-900 mt-0.5 block truncate">
                  {s.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Layout (lg: and above): 4 Separate Hoverable Cards matching hammer ── */}
      <div className="hidden lg:grid grid-cols-4 gap-3 text-left font-sans">
        {stats.map((s) => {
          const IconComp = s.Icon;
          return (
            <div
              key={s.label}
              className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all hover:border-blue-300 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block">
                  {s.label}
                </span>
                <span className="text-[13.5px] font-medium text-slate-800 mt-0.5 block capitalize truncate max-w-[110px]">
                  {s.value}
                </span>
              </div>
              <div
                className={`w-8.5 h-8.5 rounded-xl ${s.bgColor} flex items-center justify-center shrink-0`}
              >
                <IconComp className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
