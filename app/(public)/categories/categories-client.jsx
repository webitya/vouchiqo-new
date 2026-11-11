"use client";

import {
  Baby,
  Car,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Gamepad2,
  Gem,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  Layers,
  Plane,
  Search,
  Shirt,
  ShoppingCart,
  Utensils,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

// Standard Category Icons
const CATEGORY_ICONS = {
  fashion: Shirt,
  food: Utensils,
  electronics: Laptop,
  beauty: Heart,
  travel: Plane,
  home: Home,
  "home-improvement": Wrench,
  fitness: Dumbbell,
  education: GraduationCap,
  "kids-baby": Baby,
  jewellery: Gem,
  automotive: Car,
  entertainment: Gamepad2,
  grocery: ShoppingCart,
  finance: CreditCard,
};

export default function CategoriesClient({
  categories = [],
  totalCategories = 15,
  totalOffers = 0,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  return (
    <div className="w-full bg-[#FFFDF9] text-[#35104A] font-sans min-h-screen pb-24 sm:pb-12 text-left">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-[#FFFDF9] border-b border-[#EADBCE] px-3 sm:px-4 md:px-5 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B4C82] font-normal mb-0.5">
          <Link href="/" className="hover:text-[#007F79] transition-colors">
            Home
          </Link>
          <span className="text-[#EADBCE]">/</span>
          <span className="text-[#35104A] font-medium">Categories</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-[15px] font-heading font-semibold text-[#35104A] tracking-normal">
              Explore Categories
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 shadow-2xs">
              {totalCategories} Categories
            </span>
          </div>

          {/* Search Category Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B4C82]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EADBCE] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#35104A] placeholder:text-[#6B4C82]/60 focus:outline-none focus:border-[#007F79] focus:ring-1 focus:ring-[#007F79]/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B4C82] hover:text-[#35104A] cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. CATEGORIES RESPONSIVE GRID ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 sm:py-5">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 md:gap-4">
            {filteredCategories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.slug] || Layers;
              const offerCountLabel =
                cat.total > 0 ? `${cat.total} Live Offers` : "Explore Deals";

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  prefetch={true}
                  className="group relative flex flex-col justify-between bg-[#FFFDF9] border border-[#EADBCE] rounded-[18px] overflow-hidden shadow-2xs hover:shadow-[0_10px_24px_rgba(53,16,74,0.08)] hover:border-[#007F79]/50 transition-all duration-200 no-underline text-left cursor-pointer h-[200px] sm:h-[215px] touch-manipulation active:scale-[0.98]"
                >
                  {/* ── 1. Top 50%: Photographic Hero ── */}
                  <div className="relative w-full h-[50%] overflow-hidden bg-[#35104A]/5 shrink-0 pointer-events-none">
                    <SafeImage
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                      fallbackSrc="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A2B]/45 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* ── 2. Floating Circular Category Icon Badge ── */}
                  <div className="absolute top-[50%] left-3 sm:left-3.5 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-9.5 h-9.5 sm:w-10.5 sm:h-10.5 rounded-full bg-[#35104A] text-[#FFD166] group-hover:bg-[#007F79] group-hover:text-white p-1 flex items-center justify-center shadow-xs ring-3 sm:ring-4 ring-[#FFFDF9] group-hover:scale-105 transition-all duration-200">
                      <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.6]" />
                    </div>
                  </div>

                  {/* ── 3. Bottom 50%: Title & Action Row ── */}
                  <div className="pt-6 sm:pt-6.5 pb-3 sm:pb-3.5 px-3 sm:px-3.5 flex flex-col justify-between flex-1 bg-[#FFFDF9] pointer-events-none">
                    <div>
                      <h2 className="text-[13px] sm:text-[14px] font-heading font-semibold text-[#35104A] leading-snug tracking-tight group-hover:text-[#007F79] transition-colors line-clamp-1">
                        {cat.title}
                      </h2>
                      {cat.description && (
                        <p className="text-[9.5px] sm:text-[10px] text-[#6B4C82] line-clamp-1 font-normal mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Metric pill & arrow button */}
                    <div className="flex items-center justify-between gap-1.5 mt-auto pt-2">
                      <span className="inline-flex items-center text-[9px] sm:text-[9.5px] font-medium text-[#007F79] bg-[#007F79]/10 border border-[#007F79]/20 px-2 py-0.5 rounded-md truncate max-w-[110px] sm:max-w-[130px]">
                        {offerCountLabel}
                      </span>

                      <div className="w-6 h-6 rounded-full bg-[#35104A] group-hover:bg-[#007F79] text-[#FFD166] group-hover:text-white flex items-center justify-center transition-all duration-150 shrink-0 shadow-2xs">
                        <ChevronRight className="w-3.5 h-3.5 stroke-[1.75] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFFDF9] rounded-xl border border-[#EADBCE] p-8 text-center space-y-2 max-w-md mx-auto my-8 shadow-2xs">
            <Layers className="w-8 h-8 text-[#007F79] stroke-[1.6] mx-auto" />
            <h3 className="text-sm font-heading font-semibold text-[#35104A]">
              No categories found
            </h3>
            <p className="text-xs text-[#6B4C82] font-normal">
              No category matched &quot;{searchQuery}&quot;. Try searching
              another keyword.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3.5 py-1.5 bg-[#007F79] hover:bg-[#00605B] text-white text-xs font-heading font-semibold rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
