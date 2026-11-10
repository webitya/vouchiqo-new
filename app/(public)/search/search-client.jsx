"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  Folder,
  Layers,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import SafeImage from "@/components/shared/SafeImage";
import { TwitterVerifiedBadge } from "@/components/shared/TwitterVerifiedBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/fetcher";

const CURATED_CATEGORIES = [
  { name: "Food & Dining", slug: "food", emoji: "🍔" },
  { name: "Fashion & Clothing", slug: "fashion", emoji: "🛍️" },
  { name: "Electronics & Gadgets", slug: "electronics", emoji: "💻" },
  { name: "Beauty & Wellness", slug: "beauty", emoji: "💄" },
  { name: "Travel & Hospitality", slug: "travel", emoji: "✈️" },
  { name: "Grocery & Essentials", slug: "grocery", emoji: "🥦" },
];

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams?.get("q") || searchParams?.get("search") || "";

  // State
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'brands' | 'coupons' | 'products' | 'categories'
  const [sortBy, setSortBy] = useState("relevance"); // 'relevance' | 'discount' | 'newest' | 'price-asc' | 'price-desc'
  const [copiedId, setCopiedId] = useState(null);

  // Filters State
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 20, 50
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with URL query parameter
  useEffect(() => {
    const q = searchParams?.get("q") || searchParams?.get("search") || "";
    setActiveQuery(q);
  }, [searchParams]);

  const trimmedQuery = activeQuery.trim();

  // Unified Search Query with TanStack caching
  const { data: rawSearchData, isLoading: queryLoading } = useQuery({
    queryKey: ["search", trimmedQuery],
    queryFn: async () => {
      if (!trimmedQuery) return null;
      const res = await apiFetch(
        `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=36`,
      );
      return res.data;
    },
    enabled: Boolean(trimmedQuery),
    staleTime: 60_000,
  });

  const searchData = rawSearchData || {
    tags: [],
    brands: [],
    coupons: [],
    categories: [],
    products: [],
    total: 0,
  };

  const loading = Boolean(trimmedQuery) && queryLoading;

  // Available Categories in Results
  const availableCategories = useMemo(() => {
    const set = new Set();
    searchData.brands?.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    searchData.coupons?.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    searchData.products?.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [searchData]);

  // Max price among products
  const highestProductPrice = useMemo(() => {
    let max = 5000;
    searchData.products?.forEach((p) => {
      const price = Number(p.discountPrice || p.originalPrice || 0);
      if (price > max) max = price;
    });
    return Math.ceil(max / 500) * 500;
  }, [searchData.products]);

  // Handle Coupon Code Copy
  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied "${code}" to clipboard!`, {
      icon: "📋",
      style: {
        borderRadius: "10px",
        background: "#0F172A",
        color: "#fff",
        fontSize: "13px",
      },
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinDiscount(0);
    setSelectedCategory("all");
    setMaxPrice(highestProductPrice);
    setVerifiedOnly(false);
  };

  const isFiltered =
    minDiscount > 0 ||
    selectedCategory !== "all" ||
    maxPrice < highestProductPrice ||
    verifiedOnly;

  // Filtered & Sorted Brands
  const filteredBrands = useMemo(() => {
    let list = [...(searchData.brands || [])];
    if (verifiedOnly) {
      list = list.filter((b) => b.isVerified);
    }
    if (selectedCategory !== "all") {
      list = list.filter(
        (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    return list;
  }, [searchData.brands, verifiedOnly, selectedCategory]);

  // Filtered & Sorted Coupons
  const filteredCoupons = useMemo(() => {
    let list = [...(searchData.coupons || [])];

    if (minDiscount > 0) {
      list = list.filter((c) => {
        const val = Number(c.discountValue) || 0;
        return val >= minDiscount;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (c) => c.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (sortBy === "discount") {
      list.sort(
        (a, b) =>
          (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0),
      );
    }

    return list;
  }, [searchData.coupons, minDiscount, selectedCategory, sortBy]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...(searchData.products || [])];

    if (minDiscount > 0) {
      list = list.filter((p) => {
        const discount = Number(p.discountPercentage) || 0;
        return discount >= minDiscount;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (maxPrice < highestProductPrice) {
      list = list.filter((p) => {
        const price = Number(p.discountPrice || p.originalPrice || 0);
        return price <= maxPrice;
      });
    }

    if (sortBy === "discount") {
      list.sort(
        (a, b) =>
          (Number(b.discountPercentage) || 0) -
          (Number(a.discountPercentage) || 0),
      );
    } else if (sortBy === "price-asc") {
      list.sort(
        (a, b) =>
          (Number(a.discountPrice || a.originalPrice) || 0) -
          (Number(b.discountPrice || b.originalPrice) || 0),
      );
    } else if (sortBy === "price-desc") {
      list.sort(
        (a, b) =>
          (Number(b.discountPrice || b.originalPrice) || 0) -
          (Number(a.discountPrice || a.originalPrice) || 0),
      );
    }

    return list;
  }, [
    searchData.products,
    minDiscount,
    selectedCategory,
    maxPrice,
    highestProductPrice,
    sortBy,
  ]);

  // Total results
  const totalResults =
    (searchData.tags?.length || 0) +
    (searchData.brands?.length || 0) +
    (searchData.coupons?.length || 0) +
    (searchData.categories?.length || 0) +
    (searchData.products?.length || 0);

  const filteredTotal =
    (searchData.tags?.length || 0) +
    filteredBrands.length +
    filteredCoupons.length +
    (searchData.categories?.length || 0) +
    filteredProducts.length;

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased w-full">
        <Navbar />

        {/* ── 1. Full-Width Compact Header Strip ── */}
        <section className="bg-white border-b border-slate-200/80 w-full">
          <div className="w-full px-3 sm:px-5 lg:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Left: Clean Query Summary & Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <Link
                href="/"
                className="font-medium text-slate-400 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-400">Search</span>
              <span className="text-slate-300">/</span>

              {activeQuery ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Showing</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded text-[10px]">
                    {filteredTotal} results
                  </span>
                  <span className="text-slate-500">for</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[10px]">
                    &ldquo;{activeQuery}&rdquo;
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-slate-700">
                  All Discovery Deals
                </span>
              )}
            </div>

            {/* Right: Sort & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span>Sort:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort results"
                className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="relevance">Relevance</option>
                <option value="discount">Highest Discount</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden gap-1 h-7 text-[11px] font-semibold px-2"
              >
                <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                <span>Filters</span>
                {isFiltered ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                ) : null}
              </Button>
            </div>
          </div>
        </section>

        {/* ── 2. Full-Width Compact Sticky Navigation Tabs ── */}
        <nav
          aria-label="Filter navigation"
          className="sticky top-0 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs w-full"
        >
          <div className="w-full px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1.5">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>All Results</span>
                <span
                  className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                    activeTab === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filteredTotal}
                </span>
              </button>

              {searchData.tags?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("tags")}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                    activeTab === "tags"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>Sub-Category Tags</span>
                  <span
                    className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                      activeTab === "tags"
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {searchData.tags.length}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("brands")}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                  activeTab === "brands"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Brands & Stores</span>
                <span
                  className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                    activeTab === "brands"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filteredBrands.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("coupons")}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                  activeTab === "coupons"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>Coupons & Deals</span>
                <span
                  className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                    activeTab === "coupons"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filteredCoupons.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Products & Deals</span>
                <span
                  className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                    activeTab === "products"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filteredProducts.length}
                </span>
              </button>

              {searchData.categories?.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all h-7 px-2.5 rounded-md cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  <span>Categories</span>
                  <span
                    className={`text-[9px] px-1 py-0 rounded-full font-bold ${
                      activeTab === "categories"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {searchData.categories.length}
                  </span>
                </button>
              ) : null}
            </div>

            {/* Quick Active Filter Chips on Bar */}
            {isFiltered ? (
              <div className="hidden xl:flex items-center gap-1 shrink-0">
                {minDiscount > 0 ? (
                  <button
                    type="button"
                    className="gap-1 inline-flex items-center cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-blue-100"
                    onClick={() => setMinDiscount(0)}
                  >
                    <span>{minDiscount}%+ Off</span>
                    <X className="w-2.5 h-2.5 text-blue-500" />
                  </button>
                ) : null}
                {selectedCategory !== "all" ? (
                  <button
                    type="button"
                    className="gap-1 inline-flex items-center cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium px-1.5 py-0.5 rounded capitalize hover:bg-blue-100"
                    onClick={() => setSelectedCategory("all")}
                  >
                    <span>{selectedCategory}</span>
                    <X className="w-2.5 h-2.5 text-blue-500" />
                  </button>
                ) : null}
                {verifiedOnly ? (
                  <button
                    type="button"
                    className="gap-1 inline-flex items-center cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-blue-100"
                    onClick={() => setVerifiedOnly(false)}
                  >
                    <span>Verified</span>
                    <X className="w-2.5 h-2.5 text-blue-500" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] text-blue-600 font-semibold gap-1 flex items-center h-5 cursor-pointer hover:underline ml-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              </div>
            ) : null}
          </div>
        </nav>

        {/* ── 3. Full-Width Main Canvas with Screen-Height Floor ── */}
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="flex items-start gap-4 xl:gap-5 w-full flex-1">
            {/* ── Left Sidebar Filters (Desktop Compact Sticky) ── */}
            <aside className="hidden lg:block w-48 xl:w-52 shrink-0 sticky top-24 self-start">
              <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-3.5 shadow-2xs">
                {/* Header: Title + Reset */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Filters
                    </span>
                  </div>
                  {isFiltered ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  ) : null}
                </div>

                {/* Filter: Minimum Discount */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Discount
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { label: "All Discounts", value: 0 },
                      { label: "10% or more", value: 10 },
                      { label: "20% or more", value: 20 },
                      { label: "50% or more", value: 50 },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                          minDiscount === opt.value
                            ? "bg-blue-50/80 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="minDiscount"
                          checked={minDiscount === opt.value}
                          onChange={() => setMinDiscount(opt.value)}
                          className="w-3 h-3 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Filter: Categories */}
                {availableCategories.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Category
                    </span>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto pr-0.5 no-scrollbar">
                      <label
                        className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                          selectedCategory === "all"
                            ? "bg-blue-50/80 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedCategory"
                          checked={selectedCategory === "all"}
                          onChange={() => setSelectedCategory("all")}
                          className="w-3 h-3 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>All Categories</span>
                      </label>

                      {availableCategories.map((cat) => (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                            selectedCategory === cat
                              ? "bg-blue-50/80 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedCategory"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                            className="w-3 h-3 text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="capitalize truncate">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {availableCategories.length > 0 ? <Separator /> : null}

                {/* Filter: Verified Deals Only */}
                <div className="flex items-center justify-between pt-0.5">
                  <label
                    htmlFor="verified-filter"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer"
                  >
                    <TwitterVerifiedBadge className="w-3.5 h-3.5" />
                    <span>Verified Deals</span>
                  </label>
                  <Checkbox
                    id="verified-filter"
                    checked={verifiedOnly}
                    onCheckedChange={(val) => setVerifiedOnly(Boolean(val))}
                    className="w-3.5 h-3.5"
                  />
                </div>

                {/* Filter: Price Range (Products) */}
                {searchData.products?.length > 0 ? (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Max Price
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          ₹{maxPrice.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max={highestProductPrice}
                        step="100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>₹200</span>
                        <span>₹{highestProductPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </aside>

            {/* ── Right Results Canvas (Full Expansion, Compact, Clean) ── */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Loading Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <Card key={n} className="p-3 space-y-2.5">
                      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                      <Skeleton className="h-7 w-full rounded-md" />
                    </Card>
                  ))}
                </div>
              ) : null}

              {/* Empty State: Zero Results */}
              {!loading && totalResults === 0 ? (
                <Card className="p-6 sm:p-10 text-center max-w-xl mx-auto shadow-2xs space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-blue-500" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {activeQuery
                        ? `No matches found for "${activeQuery}"`
                        : "Discover top savings & verified deals"}
                    </h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      We couldn&rsquo;t find verified coupons, partner brands,
                      or deals matching your search term. Try exploring popular
                      categories.
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Top Discovery Categories
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CURATED_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs transition-all text-left flex items-center gap-2 group"
                        >
                          <span className="text-base">{cat.emoji}</span>
                          <span className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-blue-600">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
                    >
                      <Link href="/deals" className="gap-1.5">
                        <span>Browse All Deals</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* Empty State: Zero Filtered Results */}
              {!loading && totalResults > 0 && filteredTotal === 0 ? (
                <Card className="p-6 sm:p-8 text-center max-w-md mx-auto shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Filter className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No items match the active filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Try adjusting your discount range, price slider, or category
                    to see matching deals.
                  </p>
                  <div>
                    <Button
                      onClick={resetFilters}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1 rounded-lg text-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* ── Content Sections ── */}
              {!loading && filteredTotal > 0 ? (
                <div className="space-y-6">
                  {/* ── 0. SUB-CATEGORY TAGS (Clean Authentic Related Chips Bar) ── */}
                  {searchData.tags?.length > 0 &&
                  (activeTab === "all" || activeTab === "tags") ? (
                    <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0 mr-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Related Tags:</span>
                      </div>
                      {searchData.tags.map((tagItem) => (
                        <button
                          key={tagItem.id}
                          type="button"
                          onClick={() => {
                            setActiveQuery(tagItem.title);
                            router.push(
                              `/search?q=${encodeURIComponent(tagItem.title)}`,
                            );
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <span>#{tagItem.title}</span>
                          {tagItem.merchantName && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({tagItem.merchantName})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* ── 1. BRANDS & STORES SECTION ── */}
                  {(activeTab === "all" || activeTab === "brands") &&
                  filteredBrands.length > 0 ? (
                    <section className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Brands & Stores
                          </h2>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                            {filteredBrands.length}
                          </span>
                        </div>

                        {activeTab === "all" && filteredBrands.length > 5 ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("brands")}
                            className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View all ({filteredBrands.length})</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>

                      {/* Brands Grid (Wide Responsive, Compact) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredBrands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={brand.href}
                            className="group block bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-2xs p-3 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-200 transition-colors">
                                {brand.logo ? (
                                  <SafeImage
                                    src={brand.logo}
                                    alt={brand.title}
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                ) : (
                                  <Store className="w-4 h-4 text-blue-600" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                    {brand.title}
                                  </h3>
                                  {brand.isVerified ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                          <TwitterVerifiedBadge className="w-3 h-3 shrink-0" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Verified Store
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : null}
                                </div>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {brand.category || "Store"} •{" "}
                                  {brand.totalCoupons || 0} Deals
                                </p>
                              </div>

                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>

                            {(brand.subCategoryTags || brand.tags || [])
                              .length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                                {(brand.subCategoryTags || brand.tags || [])
                                  .slice(0, 2)
                                  .map((chip) => (
                                    <span
                                      key={chip}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-200/70 truncate max-w-[120px]"
                                    >
                                      #{chip}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 2. COUPONS & PROMO CODES SECTION ── */}
                  {(activeTab === "all" || activeTab === "coupons") &&
                  filteredCoupons.length > 0 ? (
                    <section className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Verified Coupons & Offers
                          </h2>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                            {filteredCoupons.length}
                          </span>
                        </div>

                        {activeTab === "all" && filteredCoupons.length > 6 ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("coupons")}
                            className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View all ({filteredCoupons.length})</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>

                      {/* Coupons Grid (Compact, Ticket Aesthetic) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-2xs transition-all duration-150 p-3.5 flex flex-col justify-between group"
                          >
                            <div className="space-y-2.5">
                              {/* Top: Store info & Discount badge */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                    {coupon.merchant?.logo ? (
                                      <SafeImage
                                        src={coupon.merchant.logo}
                                        alt={coupon.merchant.name}
                                        width={28}
                                        height={28}
                                        className="w-full h-full object-contain p-0.5"
                                      />
                                    ) : (
                                      <Store className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] font-bold text-slate-800 truncate block">
                                        {coupon.merchant?.name ||
                                          "Partner Store"}
                                      </span>
                                      <TwitterVerifiedBadge className="w-3 h-3 shrink-0" />
                                    </div>
                                    {coupon.category ? (
                                      <span className="text-[10px] text-slate-400 capitalize block truncate">
                                        {coupon.category}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  {coupon.discountValue
                                    ? `${coupon.discountValue}${
                                        coupon.discountType === "percentage"
                                          ? "% OFF"
                                          : "₹ OFF"
                                      }`
                                    : "SPECIAL DEAL"}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {coupon.title}
                              </h3>
                            </div>

                            {/* Bottom: Copy Code & Claim Action */}
                            <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                              {coupon.code ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyCode(coupon.code, coupon.id)
                                  }
                                  className="font-mono text-[11px] font-semibold border border-dashed border-slate-300 bg-slate-50/80 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  {copiedId === coupon.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700 font-sans text-[10px]">
                                        Copied!
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>{coupon.code}</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  No code needed
                                </span>
                              )}

                              <Link
                                href={coupon.href}
                                className="h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                              >
                                <span>Claim Deal</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 3. MATCHING CATEGORIES SECTION ── */}
                  {(activeTab === "all" || activeTab === "categories") &&
                  searchData.categories?.length > 0 ? (
                    <section className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Categories
                          </h2>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                            {searchData.categories.length}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                        {searchData.categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={cat.href}
                            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                              <span className="text-[11px] font-medium text-slate-800 truncate group-hover:text-blue-600">
                                {cat.title}
                              </span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* ── 4. CURATED PRODUCTS & DEALS SECTION ── */}
                  {(activeTab === "all" || activeTab === "products") &&
                  filteredProducts.length > 0 ? (
                    <section className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Products & Deals
                          </h2>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                            {filteredProducts.length}
                          </span>
                        </div>

                        {activeTab === "all" && filteredProducts.length > 6 ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("products")}
                            className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View all ({filteredProducts.length})</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>

                      {/* Products Grid (Compact & Dense) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {filteredProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-2xs p-2.5 flex flex-col justify-between group transition-all"
                          >
                            <div className="space-y-2">
                              {/* Image Container */}
                              <div className="relative w-full aspect-square rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                {prod.imageUrl ? (
                                  <SafeImage
                                    src={prod.imageUrl}
                                    alt={prod.title}
                                    width={180}
                                    height={180}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                                  />
                                ) : (
                                  <ShoppingBag className="w-6 h-6 text-slate-300" />
                                )}

                                {Number(prod.discountPercentage) > 0 ? (
                                  <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">
                                    {prod.discountPercentage}% OFF
                                  </span>
                                ) : null}
                              </div>

                              {/* Title & Brand */}
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate block">
                                  {prod.merchant?.name ||
                                    prod.category ||
                                    "Deal"}
                                </span>
                                <h3 className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                  {prod.title}
                                </h3>
                              </div>
                            </div>

                            {/* Price & Shop CTA */}
                            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                              <div>
                                {prod.discountPrice ? (
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-bold text-slate-900">
                                      ₹{prod.discountPrice}
                                    </span>
                                    {Number(prod.originalPrice) >
                                    Number(prod.discountPrice) ? (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        ₹{prod.originalPrice}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-600">
                                    Deal
                                  </span>
                                )}
                              </div>

                              <a
                                href={prod.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-6 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold inline-flex items-center gap-1 transition-colors shrink-0"
                              >
                                <span>Shop</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </main>

        {/* ── Mobile Filter Sheet Drawer (Shadcn Sheet) ── */}
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-sm p-0 flex flex-col bg-white"
          >
            <SheetHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <SheetTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Discount */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Discount
                </span>
                <div className="space-y-0.5">
                  {[
                    { label: "All Discounts", value: 0 },
                    { label: "10% or more", value: 10 },
                    { label: "20% or more", value: 20 },
                    { label: "50% or more", value: 50 },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium cursor-pointer ${
                        minDiscount === opt.value
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileMinDiscount"
                        checked={minDiscount === opt.value}
                        onChange={() => setMinDiscount(opt.value)}
                        className="w-3 h-3 text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {availableCategories.length > 0 ? (
                <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Category
                  </span>
                  <div className="space-y-0.5 max-h-40 overflow-y-auto">
                    <label
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium cursor-pointer ${
                        selectedCategory === "all"
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileCategory"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="w-3 h-3 text-blue-600"
                      />
                      <span>All Categories</span>
                    </label>

                    {availableCategories.map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobileCategory"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="w-3 h-3 text-blue-600"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Verified Only */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <label
                  htmlFor="mobile-verified"
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700"
                >
                  <TwitterVerifiedBadge className="w-3.5 h-3.5" />
                  <span>Verified Deals Only</span>
                </label>
                <Checkbox
                  id="mobile-verified"
                  checked={verifiedOnly}
                  onCheckedChange={(val) => setVerifiedOnly(Boolean(val))}
                  className="w-3.5 h-3.5"
                />
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1 text-[11px] font-semibold h-8 rounded-lg"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold h-8 rounded-lg"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Footer />
      </div>
    </TooltipProvider>
  );
}
