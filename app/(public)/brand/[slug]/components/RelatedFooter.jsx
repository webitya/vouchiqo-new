"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";

export default function RelatedFooter({ relatedBrands = [], merchant = {} }) {
  if (!relatedBrands || relatedBrands.length === 0) return null;

  const categoryName = merchant.category || "Similar Brands";

  return (
    <section className="w-full bg-white border-t border-slate-200/90 py-5 sm:py-7 select-none font-sans">
      <div className="w-full max-w-[1440px] mx-auto px-2.5 sm:px-4 md:px-5 lg:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2.5 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-[13.5px] font-medium text-slate-800 tracking-normal">
              Related Brands in {categoryName}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-normal bg-blue-50 text-blue-700 border border-blue-200/60">
              {relatedBrands.length} Stores
            </span>
          </div>

          <Link
            href="/brands"
            className="text-[11px] sm:text-xs font-normal text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid: 2 col on mobile, 3 on tablet, 4 on desktop, 6 on xl */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {relatedBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brand/${brand.slug}`}
              className="bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group active:scale-95"
            >
              {/* Brand Logo Avatar */}
              <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-lg bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-300 transition-colors overflow-hidden">
                {brand.logo ? (
                  <SafeImage
                    src={brand.logo}
                    alt={brand.businessName}
                    width={38}
                    height={38}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-medium text-xs sm:text-sm text-blue-600 uppercase">
                    {brand.businessName?.[0]}
                  </span>
                )}
              </div>

              {/* Brand Details */}
              <div className="min-w-0 flex-1 text-left">
                <h5 className="font-medium text-[11.5px] sm:text-[12.5px] text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
                  {brand.businessName}
                </h5>
                <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-normal block mt-0.5 capitalize truncate">
                  {brand.category || "Store"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
