"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";
import {
  Baby,
  Car,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Gamepad2,
  Gem,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  Layers,
  Plane,
  Search,
  Shirt,
  ShoppingCart,
  Smartphone,
  Tag,
  Utensils,
  X,
} from "lucide-react";

// Category Lucide Icon mapping
const CATEGORY_ICONS = {
  fashion: Shirt,
  food: Utensils,
  electronics: Smartphone,
  beauty: Heart,
  travel: Plane,
  home: Home,
  "home-improvement": Hammer,
  fitness: Dumbbell,
  education: GraduationCap,
  "kids-baby": Baby,
  jewellery: Gem,
  automotive: Car,
  entertainment: Gamepad2,
  grocery: ShoppingCart,
  finance: CreditCard,
};

const CATEGORY_COLORS = {
  fashion: { bg: "bg-rose-500", text: "text-white" },
  food: { bg: "bg-amber-600", text: "text-white" },
  electronics: { bg: "bg-blue-600", text: "text-white" },
  beauty: { bg: "bg-emerald-600", text: "text-white" },
  travel: { bg: "bg-cyan-600", text: "text-white" },
  home: { bg: "bg-orange-600", text: "text-white" },
  "home-improvement": { bg: "bg-stone-600", text: "text-white" },
  fitness: { bg: "bg-red-600", text: "text-white" },
  education: { bg: "bg-indigo-600", text: "text-white" },
  "kids-baby": { bg: "bg-pink-500", text: "text-white" },
  jewellery: { bg: "bg-yellow-600", text: "text-white" },
  automotive: { bg: "bg-slate-700", text: "text-white" },
  entertainment: { bg: "bg-purple-600", text: "text-white" },
  grocery: { bg: "bg-green-600", text: "text-white" },
  finance: { bg: "bg-teal-600", text: "text-white" },
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
        (cat.description && cat.description.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-12 select-none">
      {/* ── 1. COMPACT HEADER BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-4 md:px-5 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mb-0.5">
          <Link href="/" className="hover:text-[#F72853] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Categories</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-normal">
              Explore Categories
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-[#F72853] border border-rose-200/60 shadow-2xs">
              {totalCategories} Categories
            </span>
          </div>

          {/* Search Category Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F72853] transition-all"
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

      {/* ── 2. CATEGORIES RESPONSIVE GRID ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 sm:py-5">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 md:gap-4">
            {filteredCategories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.slug] || Layers;
              const colorTheme = CATEGORY_COLORS[cat.slug] || {
                bg: "bg-slate-800",
                text: "text-white",
              };
              const offerCountLabel =
                cat.total > 0
                  ? `${cat.total} Live Offers`
                  : "Explore Deals";

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col justify-between bg-white border border-slate-200/90 rounded-[18px] overflow-hidden shadow-[0_3px_12px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)] hover:border-slate-300 transition-all duration-200 no-underline text-left cursor-pointer select-none h-[200px] sm:h-[215px]"
                >
                  {/* ── 1. Top 50%: Photographic Hero ── */}
                  <div className="relative w-full h-[50%] overflow-hidden bg-slate-100 shrink-0">
                    <SafeImage
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                      fallbackSrc="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* ── 2. Floating Circular Category Icon Badge ── */}
                  <div className="absolute top-[50%] left-3 sm:left-3.5 -translate-y-1/2 z-20">
                    <div
                      className={`w-9.5 h-9.5 sm:w-10.5 sm:h-10.5 rounded-full ${colorTheme.bg} ${colorTheme.text} p-1 flex items-center justify-center shadow-md ring-3 sm:ring-4 ring-white group-hover:scale-105 transition-transform duration-200`}
                    >
                      <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                  </div>

                  {/* ── 3. Bottom 50%: Title & Action Row with Generous Margins ── */}
                  <div className="pt-6 sm:pt-6.5 pb-3.5 sm:pb-4 px-3 sm:px-3.5 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="text-[13px] sm:text-[14.5px] font-bold text-slate-900 leading-snug tracking-tight group-hover:text-[#F72853] transition-colors line-clamp-1">
                        {cat.title}
                      </h3>
                      {cat.description && (
                        <p className="text-[9.5px] sm:text-[10px] text-slate-500 line-clamp-1 font-normal mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Metric pill & arrow button */}
                    <div className="flex items-center justify-between gap-1.5 mt-auto pt-2">
                      <span className="inline-flex items-center text-[9px] sm:text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px] truncate max-w-[110px] sm:max-w-[130px]">
                        {offerCountLabel}
                      </span>

                      <div className="w-6 h-6 rounded-full bg-slate-900 group-hover:bg-[#F72853] text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2 max-w-md mx-auto my-8 shadow-2xs">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-medium text-slate-800">
              No categories found
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              No category matched &quot;{searchQuery}&quot;. Try searching another keyword.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3 py-1 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
