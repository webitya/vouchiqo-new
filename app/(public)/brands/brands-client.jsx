"use client";

import { Search, Store, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";

export default function BrandsClient({ brands = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter real database brands by search query
  const filteredBrands = useMemo(() => {
    let list = brands;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.slug?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [brands, searchQuery]);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-14 text-left select-none">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-2.5 sm:px-4 md:px-5 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-slate-500 font-normal mb-0.5">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Partner Brands</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-[13.5px] sm:text-[15px] font-medium text-[#F72853] tracking-normal">
              All Partner Brands &amp; Stores
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-normal bg-rose-50 text-[#F72853] border border-rose-200/60">
              {filteredBrands.length} Brands
            </span>
          </div>

          {/* Compact Inline Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 font-normal placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. BRANDS RESPONSIVE GRID ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-3.5">
            {filteredBrands.map((brand) => (
              <BrandGridItem
                key={brand._id}
                name={brand.businessName}
                logo={brand.logo}
                banner={brand.banner || brand.shopImage}
                category={brand.category || "Top Brand"}
                href={`/brand/${brand.slug}`}
                coupons={
                  (brand.totalCoupons || 0) +
                  (brand.totalAffiliateProducts || 0)
                }
                isVerified={brand.isVerified ?? brand.status === "approved"}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto space-y-3 shadow-2xs my-8">
            <Store className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-normal text-slate-700">
              No partner brands found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-normal rounded-lg transition-colors cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
