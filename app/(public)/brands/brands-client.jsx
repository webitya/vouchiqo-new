"use client";

import { Search, Store, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";

const INITIAL_BATCH_SIZE = 24; // Fills initial viewport on desktop (6 cols x 4 rows) and mobile
const BATCH_INCREMENT = 18; // Smooth increments on scroll

export default function BrandsClient({ brands = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const observerTargetRef = useRef(null);

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

  // Reset batch count when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setVisibleCount(INITIAL_BATCH_SIZE);
    }
  }, [searchQuery]);

  // Progressive infinite scroll: loads next batch when user scrolls near the bottom
  useEffect(() => {
    if (visibleCount >= filteredBrands.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_INCREMENT, filteredBrands.length),
          );
        }
      },
      { rootMargin: "350px", threshold: 0 },
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [visibleCount, filteredBrands.length]);

  // Sliced brands to render in DOM
  const displayedBrands = useMemo(() => {
    return filteredBrands.slice(0, visibleCount);
  }, [filteredBrands, visibleCount]);

  return (
    <div className="w-full bg-[#FFFDF9] text-[#35104A] font-sans min-h-screen pb-14 text-left select-none">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-[#FFF8EF] border-b border-[#EADBCE] px-2.5 sm:px-4 md:px-5 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#6B4C82] font-normal mb-0.5">
          <Link href="/" className="hover:text-[#007F79] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#35104A] font-medium">Partner Brands</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-[13.5px] sm:text-[15px] font-heading font-semibold text-[#35104A] tracking-normal">
              All Partner Brands &amp; Stores
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 shadow-2xs">
              {filteredBrands.length} Brands
            </span>
          </div>

          {/* Compact Inline Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B4C82]/60 stroke-[1.75]" />
            <input
              type="text"
              placeholder="Search brand or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EADBCE] rounded-lg pl-8 pr-7 py-1 text-xs text-[#35104A] font-medium placeholder-[#6B4C82]/50 focus:outline-none focus:border-[#007F79] focus:ring-1 focus:ring-[#007F79]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B4C82] hover:text-[#35104A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. BRANDS RESPONSIVE GRID ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4">
        {displayedBrands.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-3.5">
              {displayedBrands.map((brand) => (
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

            {/* Scroll Sentinel for progressive loading */}
            {visibleCount < filteredBrands.length && (
              <div
                ref={observerTargetRef}
                className="w-full py-8 flex flex-col items-center justify-center gap-2 text-[#6B4C82]"
              >
                <div className="w-5 h-5 border-2 border-[#007F79] border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-heading font-medium text-[#6B4C82]">
                  Loading more brands ({displayedBrands.length} of{" "}
                  {filteredBrands.length})...
                </span>
              </div>
            )}

            {/* End of list confirmation */}
            {visibleCount >= filteredBrands.length &&
              filteredBrands.length > INITIAL_BATCH_SIZE && (
                <div className="w-full py-6 text-center text-[11px] font-medium text-[#6B4C82]/60">
                  Showing all {filteredBrands.length} partner brands &amp;
                  stores
                </div>
              )}
          </>
        ) : (
          <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-8 text-center max-w-md mx-auto space-y-3 shadow-2xs my-8">
            <Store className="w-8 h-8 text-[#6B4C82]/50 stroke-[1.6] mx-auto" />
            <p className="text-xs font-normal text-[#6B4C82]">
              No partner brands found matching &quot;{searchQuery}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3 py-1 bg-[#007F79] hover:bg-[#00605B] text-white text-xs font-heading font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
