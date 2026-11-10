"use client";

import {
  ChevronRight,
  Folder,
  Layers,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  Tag,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";
import { apiFetch } from "@/lib/fetcher";

// Animated rotating placeholder phrases
const PLACEHOLDER_PHRASES = [
  "Search brands, deals, stores...",
  "Search for 'Zomato'...",
  "Search for 'Fashion'...",
  "Search for 'Electronics'...",
  "Search for 'Milton'...",
  "Search for 'Food & Dining'...",
  "Search for 'Beauty'...",
  "Search 'Dine-in Offers'...",
  "Search discount coupons...",
];

// Instant local category index for 0ms visual feedback
const QUICK_CATEGORIES = [
  { name: "Fashion & Clothing", slug: "fashion", type: "Category", emoji: "🛍️" },
  { name: "Food & Dining", slug: "food", type: "Category", emoji: "🍔" },
  {
    name: "Electronics & Gadgets",
    slug: "electronics",
    type: "Category",
    emoji: "💻",
  },
  { name: "Beauty & Wellness", slug: "beauty", type: "Category", emoji: "💄" },
  {
    name: "Travel & Hospitality",
    slug: "travel",
    type: "Category",
    emoji: "✈️",
  },
  { name: "Home & Living", slug: "home", type: "Category", emoji: "🏠" },
  {
    name: "Fitness & Healthcare",
    slug: "fitness",
    type: "Category",
    emoji: "💪",
  },
  {
    name: "Gaming & Entertainment",
    slug: "entertainment",
    type: "Category",
    emoji: "🎮",
  },
  {
    name: "Grocery & Essentials",
    slug: "grocery",
    type: "Category",
    emoji: "🛒",
  },
  {
    name: "Finance & Insurance",
    slug: "finance",
    type: "Category",
    emoji: "💳",
  },
];

export const SearchBar = ({ autoFocus = false, onSelect = null }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allSuggestions, setAllSuggestions] = useState({
    tags: [],
    brands: [],
    coupons: [],
    products: [],
    categories: [],
  });
  const [activeTab, setActiveTab] = useState("all");
  const [totalMatches, setTotalMatches] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollBoxRef = useRef(null);

  // Auto-focus when triggered (e.g. mobile search toggle open)
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Smooth rotating placeholder phrase
  const [phraseIndex, setPhraseIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const placeholderText =
    PLACEHOLDER_PHRASES[phraseIndex % PLACEHOLDER_PHRASES.length] ||
    "Search brands, deals, coupons...";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute search suggestions dynamically via in-depth /api/search
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setAllSuggestions({
        tags: [],
        brands: [],
        coupons: [],
        products: [],
        categories: [],
      });
      setTotalMatches(0);
      setIsOpen(false);
      setLoading(false);
      setSelectedIndex(-1);
      setActiveTab("all");
      return;
    }

    // 1. Instant local category match (0ms latency preview)
    const instantCategories = QUICK_CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q),
    ).map((c) => ({
      id: `local_cat_${c.slug}`,
      title: c.name,
      subtitle: "Explore Category",
      type: "Category",
      href: `/category/${c.slug}`,
      iconType: "category",
      emoji: c.emoji,
    }));

    setAllSuggestions({
      tags: [],
      brands: [],
      coupons: [],
      products: [],
      categories: instantCategories,
    });
    setIsOpen(true);
    setLoading(true);
    setSelectedIndex(-1);

    // 2. Query in-depth unified search API
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const json = await apiFetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=15`,
        ).catch(() => null);
        if (!json || isCancelled) return;

        const data = json.data || {};

        // Sub-Category Tags Chips during merchant registration & coupons
        const tagItems = (data.tags || []).map((t) => ({
          id: `tag_${t.tag || t.title}`,
          title: t.title,
          subtitle: t.subtitle || "Sub-Category Tag Chip",
          type: "Tag",
          href: t.href || `/search?q=${encodeURIComponent(t.title)}`,
          iconType: "tag",
        }));

        const brandItems = (data.brands || []).map((b) => {
          const matchedChip = (b.subCategoryTags || b.tags || []).find((t) =>
            t.toLowerCase().includes(q),
          );
          return {
            id: `brand_${b.id || b.slug}`,
            title: b.title,
            subtitle: matchedChip
              ? `Sub-Category Tag: "${matchedChip}" • Store`
              : b.category
                ? `${b.category} • Store`
                : "Verified Store",
            type: "Brand",
            href: b.href || `/brand/${b.slug}`,
            logo: b.logo,
            iconType: "brand",
            subCategoryTags: b.subCategoryTags || [],
          };
        });

        const couponItems = (data.coupons || []).map((c) => ({
          id: `coupon_${c.id}`,
          title: c.title,
          subtitle: c.merchant?.name
            ? `${c.merchant.name}${c.code ? ` • Code: ${c.code}` : " • Offer"}`
            : c.code
              ? `Code: ${c.code}`
              : "Special Deal",
          type: "Offer",
          href: c.href || `/deals/${c.id}`,
          logo: c.merchant?.logo,
          iconType: "deal",
        }));

        const productItems = (data.products || []).map((p) => ({
          id: `prod_${p.id}`,
          title: p.title,
          subtitle: p.merchant?.name
            ? `${p.merchant.name}${p.discountPrice ? ` • ₹${p.discountPrice}` : ""}`
            : p.discountPrice
              ? `Special Price: ₹${p.discountPrice}`
              : "Product Deal",
          type: "Product",
          href: p.href || "#",
          logo: p.imageUrl,
          iconType: "product",
          isExternal: !!p.href && p.href.startsWith("http"),
        }));

        const categoryItems = (data.categories || []).map((cat) => ({
          id: `cat_${cat.slug}`,
          title: cat.title,
          subtitle: "Explore Category",
          type: "Category",
          href: cat.href || `/category/${cat.slug}`,
          iconType: "category",
          emoji:
            QUICK_CATEGORIES.find((q) => q.slug === cat.slug)?.emoji || "🏷️",
        }));

        if (!isCancelled) {
          setAllSuggestions({
            tags: tagItems,
            brands: brandItems,
            coupons: couponItems,
            products: productItems,
            categories:
              categoryItems.length > 0 ? categoryItems : instantCategories,
          });
          setTotalMatches(data.total || 0);
          setLoading(false);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        if (!isCancelled) setLoading(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Filtered displayed suggestions based on active tab
  const displayedSuggestions = useMemo(() => {
    const { tags, brands, coupons, products, categories } = allSuggestions;

    if (activeTab === "tags") return tags;
    if (activeTab === "offers") return coupons;
    if (activeTab === "products") return products;
    if (activeTab === "brands") return brands;
    if (activeTab === "categories") return categories;

    // "all": Intelligent balanced interleaving so offers, products, tags, and brands are all prominently visible
    const hrefMap = new Map();
    const ordered = [
      ...tags,
      ...coupons.slice(0, 4),
      ...products.slice(0, 4),
      ...brands.slice(0, 6),
      ...coupons.slice(4),
      ...products.slice(4),
      ...brands.slice(6),
      ...categories,
    ];

    const deduplicated = [];
    for (const item of ordered) {
      if (!hrefMap.has(item.href)) {
        hrefMap.set(item.href, true);
        deduplicated.push(item);
      }
    }
    return deduplicated;
  }, [allSuggestions, activeTab]);

  // CRITICAL: Isolated inside wheel scrolling prevention
  // 1. Lenis will ignore this element because of data-lenis-prevent="true"
  // 2. Wheel event is prevented from bubbling to document/window, stopping background scrolling
  // 3. At top/bottom boundary, preventDefault avoids scroll chaining to the page body
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollBoxRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.stopPropagation();

      const { scrollTop, scrollHeight, clientHeight } = el;
      const delta = e.deltaY;

      const atTop = scrollTop <= 0 && delta < 0;
      const atBottom =
        scrollTop + clientHeight >= scrollHeight - 1 && delta > 0;

      if (atTop || atBottom) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

  // Auto-scroll selected item into view during keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && scrollBoxRef.current) {
      const activeElem = scrollBoxRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (activeElem) {
        activeElem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev + 1;
        return next >= displayedSuggestions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? displayedSuggestions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayedSuggestions.length) {
        const selected = displayedSuggestions[selectedIndex];
        setIsOpen(false);
        if (onSelect) onSelect();
        if (selected.isExternal) {
          window.open(selected.href, "_blank", "noopener,noreferrer");
        } else {
          router.push(selected.href);
        }
      } else if (query.trim()) {
        setIsOpen(false);
        if (onSelect) onSelect();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (onSelect) onSelect();
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      setIsOpen(false);
      if (onSelect) onSelect();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setAllSuggestions({
      tags: [],
      brands: [],
      coupons: [],
      products: [],
      categories: [],
    });
    setTotalMatches(0);
    setIsOpen(false);
    setSelectedIndex(-1);
    setActiveTab("all");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasAnyResults =
    allSuggestions.tags.length > 0 ||
    allSuggestions.brands.length > 0 ||
    allSuggestions.coupons.length > 0 ||
    allSuggestions.products.length > 0 ||
    allSuggestions.categories.length > 0;

  return (
    <div ref={containerRef} className="w-full relative flex items-center">
      <Search
        className="absolute left-3 sm:left-3.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors z-10 shrink-0"
        onClick={handleSearchClick}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholderText || "Search brands, deals, coupons..."}
        value={query}
        onFocus={() => {
          if (query.trim() && (hasAnyResults || loading)) {
            setIsOpen(true);
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-8.5 sm:pl-10 pr-9 sm:pr-10 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-slate-400 transition-all duration-200 shadow-2xs"
      />

      {/* Right icons: Loading spinner or Clear button */}
      <div className="absolute right-2.5 sm:right-3 flex items-center gap-1 z-10">
        {loading && (
          <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Live Suggestions Floating Dropdown */}
      {isOpen && (
        <div
          data-lenis-prevent="true"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Header section with counts and quick category filter tabs */}
          <div className="px-3 py-2 border-b border-slate-200/80 bg-slate-50/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
              <span>
                {loading
                  ? "Searching..."
                  : `Results (${displayedSuggestions.length})`}
              </span>
            </div>

            {/* In-depth filter pills if multiple result types exist */}
            {hasAnyResults && (
              <div
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5"
                data-lenis-prevent="true"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedIndex(-1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    activeTab === "all"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Layers
                    className={`w-3 h-3 ${activeTab === "all" ? "text-white" : "text-blue-500"}`}
                  />
                  <span>All</span>
                  <span className="opacity-75 text-[10px]">
                    ({totalMatches || displayedSuggestions.length})
                  </span>
                </button>

                {allSuggestions.tags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("tags");
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      activeTab === "tags"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    <Tag
                      className={`w-3 h-3 ${activeTab === "tags" ? "text-white" : "text-indigo-500"}`}
                    />
                    <span>Sub-Category Tags</span>
                    <span className="opacity-75 text-[10px]">
                      ({allSuggestions.tags.length})
                    </span>
                  </button>
                )}

                {allSuggestions.coupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("offers");
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      activeTab === "offers"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <Ticket
                      className={`w-3 h-3 ${activeTab === "offers" ? "text-white" : "text-amber-500"}`}
                    />
                    <span>Offers</span>
                    <span className="opacity-75 text-[10px]">
                      ({allSuggestions.coupons.length})
                    </span>
                  </button>
                )}

                {allSuggestions.products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("products");
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      activeTab === "products"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    <ShoppingBag
                      className={`w-3 h-3 ${activeTab === "products" ? "text-white" : "text-purple-500"}`}
                    />
                    <span>Products</span>
                    <span className="opacity-75 text-[10px]">
                      ({allSuggestions.products.length})
                    </span>
                  </button>
                )}

                {allSuggestions.brands.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("brands");
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      activeTab === "brands"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <Store
                      className={`w-3 h-3 ${activeTab === "brands" ? "text-white" : "text-blue-500"}`}
                    />
                    <span>Brands</span>
                    <span className="opacity-75 text-[10px]">
                      ({allSuggestions.brands.length})
                    </span>
                  </button>
                )}

                {allSuggestions.categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("categories");
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      activeTab === "categories"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    <Folder
                      className={`w-3 h-3 ${activeTab === "categories" ? "text-white" : "text-emerald-500"}`}
                    />
                    <span>Categories</span>
                    <span className="opacity-75 text-[10px]">
                      ({allSuggestions.categories.length})
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fully Isolated Scrollable Suggestions Box */}
          <div
            ref={scrollBoxRef}
            data-lenis-prevent="true"
            className="max-h-80 overflow-y-auto overscroll-contain divide-y divide-slate-100 search-dropdown-scroll"
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            {displayedSuggestions.length > 0 ? (
              displayedSuggestions.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <Link
                    key={item.id}
                    data-index={index}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelect) onSelect();
                    }}
                    className={`flex items-center justify-between gap-2.5 py-2 px-3 border-b border-slate-100 last:border-b-0 transition-colors group cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 text-blue-900"
                        : "hover:bg-slate-50/80 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Logo / Icon Container */}
                      <div className="w-7 h-7 rounded-md border border-slate-200/90 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-300 transition-colors">
                        {item.iconType === "tag" ? (
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        ) : item.iconType === "category" ? (
                          <Folder className="w-3.5 h-3.5 text-emerald-600" />
                        ) : item.logo && typeof item.logo === "string" ? (
                          <SafeImage
                            src={item.logo}
                            alt={item.title}
                            width={28}
                            height={28}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : item.iconType === "deal" ? (
                          <Ticket className="w-3.5 h-3.5 text-amber-500" />
                        ) : item.iconType === "product" ? (
                          <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                );
              })
            ) : !loading ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No instant matches found for &ldquo;{query}&rdquo;.
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="block mx-auto mt-2 text-blue-600 font-semibold hover:underline"
                >
                  Search everywhere for &ldquo;{query}&rdquo; →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
