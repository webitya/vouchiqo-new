"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Search,
  ShoppingBag,
  TicketPercent,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";
import SafeImage from "@/components/shared/SafeImage";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "electronics", label: "Electronics" },
  { id: "food", label: "Food & Dining" },
  { id: "beauty", label: "Beauty" },
  { id: "fitness", label: "Fitness" },
  { id: "home", label: "Home & Living" },
  { id: "travel", label: "Travel" },
];

const SORT_OPTIONS = [
  { id: "trending", label: "Sort: Trending" },
  { id: "discount-desc", label: "Sort: Highest Discount" },
  { id: "price-asc", label: "Sort: Price (Low to High)" },
  { id: "price-desc", label: "Sort: Price (High to Low)" },
  { id: "newest", label: "Sort: Newest" },
];

export default function TrendingClient({
  initialTrendingCoupons = [],
  initialFeaturedCoupons = [],
  allCoupons = [],
  affiliateProducts = [],
  trendingMerchants = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'coupons' | 'products'
  const [selectedSort, setSelectedSort] = useState("trending");
  const [minDiscount, setMinDiscount] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // 1. Deduplicate Coupons
  const combinedCoupons = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const c of [
      ...initialTrendingCoupons,
      ...initialFeaturedCoupons,
      ...allCoupons,
    ]) {
      if (c?._id && !seen.has(String(c._id))) {
        seen.add(String(c._id));
        list.push(c);
      }
    }
    return list;
  }, [initialTrendingCoupons, initialFeaturedCoupons, allCoupons]);

  // 2. Filter Coupons
  const filteredCoupons = useMemo(() => {
    if (selectedType === "products") return [];
    let list = [...combinedCoupons];

    // Category
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((c) => {
        const cCat = (c.category || "").toLowerCase();
        const mCat = (c.merchantId?.category || "").toLowerCase();
        const title = (c.title || "").toLowerCase();
        return cCat.includes(cat) || mCat.includes(cat) || title.includes(cat);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const code = (c.code || "").toLowerCase();
        const mName = (
          c.merchantId?.businessName ||
          c.merchantId?.name ||
          ""
        ).toLowerCase();
        const desc = (c.description || "").toLowerCase();
        return (
          title.includes(q) ||
          code.includes(q) ||
          mName.includes(q) ||
          desc.includes(q)
        );
      });
    }

    // Min Discount
    if (minDiscount > 0) {
      list = list.filter((c) => (c.discountValue || 0) >= minDiscount);
    }

    // Sort
    if (selectedSort === "discount-desc") {
      list.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
    } else if (selectedSort === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else {
      list.sort((a, b) => (b.totalClaims || 0) - (a.totalClaims || 0));
    }

    return list;
  }, [
    combinedCoupons,
    selectedType,
    selectedCategory,
    searchQuery,
    minDiscount,
    selectedSort,
  ]);

  // 3. Filter Affiliate Products
  const filteredProducts = useMemo(() => {
    if (selectedType === "coupons") return [];
    let list = [...affiliateProducts];

    // Category
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return pCat.includes(cat) || title.includes(cat);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const mName = (
          p.merchantName ||
          p.merchantId?.businessName ||
          ""
        ).toLowerCase();
        return title.includes(q) || mName.includes(q);
      });
    }

    // Min Discount
    if (minDiscount > 0) {
      list = list.filter((p) => {
        const disc =
          p.discountPercentage ||
          (p.originalPrice && p.discountPrice
            ? Math.round(
                ((p.originalPrice - p.discountPrice) / p.originalPrice) * 100,
              )
            : 0);
        return disc >= minDiscount;
      });
    }

    // Sort
    if (selectedSort === "discount-desc") {
      list.sort((a, b) => {
        const discA =
          a.discountPercentage ||
          (a.originalPrice && a.discountPrice
            ? Math.round(
                ((a.originalPrice - a.discountPrice) / a.originalPrice) * 100,
              )
            : 0);
        const discB =
          b.discountPercentage ||
          (b.originalPrice && b.discountPrice
            ? Math.round(
                ((b.originalPrice - b.discountPrice) / b.originalPrice) * 100,
              )
            : 0);
        return discB - discA;
      });
    } else if (selectedSort === "price-asc") {
      list.sort(
        (a, b) =>
          (a.discountPrice || a.originalPrice || 0) -
          (b.discountPrice || b.originalPrice || 0),
      );
    } else if (selectedSort === "price-desc") {
      list.sort(
        (a, b) =>
          (b.discountPrice || b.originalPrice || 0) -
          (a.discountPrice || a.originalPrice || 0),
      );
    } else if (selectedSort === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    return list;
  }, [
    affiliateProducts,
    selectedType,
    selectedCategory,
    searchQuery,
    minDiscount,
    selectedSort,
  ]);

  // Featured spotlight subset (top 4 deals)
  const spotlightDeals = useMemo(() => {
    const list = [];
    if (filteredCoupons.length > 0) list.push(filteredCoupons[0]);
    if (filteredCoupons.length > 1) list.push(filteredCoupons[1]);
    if (filteredCoupons.length > 2) list.push(filteredCoupons[2]);
    if (filteredCoupons.length > 3) list.push(filteredCoupons[3]);
    return list;
  }, [filteredCoupons]);

  // Copy code handler
  const handleCopyCode = (e, code, couponId) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedSort("trending");
    setMinDiscount(0);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    minDiscount > 0;

  return (
    <div className="w-full bg-[#FFFDF9] text-[#35104A] font-sans min-h-screen pb-24 sm:pb-20 text-left">
      {/* ── 1. CLEAN FULL-WIDTH HERO HEADER ── */}
      <section className="w-full bg-[#35104A] text-white pt-5 pb-7 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-[#35104A]/60">
        <div className="w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#FFF8EF]/70 font-medium mb-2.5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#FFF8EF]/40" />
            <span className="text-white font-semibold">Trending</span>
          </nav>

          {/* Title & One-line Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-white tracking-tight">
                Trending Deals
              </h1>
              <p className="text-xs sm:text-sm text-[#FFF8EF]/80 font-normal mt-1">
                Verified promo codes, exclusive store discounts, and trending
                price cuts.
              </p>
            </div>

            <div className="text-xs text-[#FFF8EF]/75 font-medium shrink-0">
              Showing{" "}
              <strong className="text-white font-heading font-semibold">
                {filteredCoupons.length + filteredProducts.length}
              </strong>{" "}
              active offers
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. UNIFIED FULL-WIDTH CONTROLS BAR ── */}
      <section className="w-full bg-[#FFFDF9] border-b border-[#EADBCE] sticky top-16 z-30 shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-3 space-y-2.5">
          {/* Top Row: Type Tabs + Search & Sort */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Minimalist Segmented View */}
            <div className="inline-flex bg-[#FFF8EF] p-1 rounded-lg border border-[#EADBCE] gap-1 self-start md:self-auto font-heading text-xs">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedType === "all"
                    ? "bg-[#35104A] text-white font-semibold shadow-2xs"
                    : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                }`}
              >
                All Offers ({combinedCoupons.length + affiliateProducts.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("coupons")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedType === "coupons"
                    ? "bg-[#35104A] text-white font-semibold shadow-2xs"
                    : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                }`}
              >
                Coupon Codes ({combinedCoupons.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("products")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedType === "products"
                    ? "bg-[#35104A] text-white font-semibold shadow-2xs"
                    : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                }`}
              >
                Product Deals ({affiliateProducts.length})
              </button>
            </div>

            {/* Right: Search + Sort Dropdown */}
            <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#6B4C82] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search store, code or offer..."
                  className="w-full h-8.5 pl-8.5 pr-7 text-xs bg-white border border-[#EADBCE] rounded-lg outline-none focus:border-[#007F79] text-[#35104A] placeholder-[#6B4C82]/60 font-medium transition-all"
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

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="h-8.5 px-2.5 bg-white text-xs font-heading font-medium text-[#35104A] rounded-lg border border-[#EADBCE] outline-none cursor-pointer focus:border-[#007F79] shadow-2xs shrink-0"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Horizontal Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 pb-0.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#007F79] text-white border-[#007F79] font-semibold"
                      : "bg-[#FFF8EF] text-[#6B4C82] border-[#EADBCE] hover:text-[#35104A] hover:border-[#007F79]/40 font-medium"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            <div className="h-4 w-[1px] bg-[#EADBCE] mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setMinDiscount((prev) => (prev === 50 ? 0 : 50))}
              className={`px-2.5 py-1 rounded-lg text-xs font-heading whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                minDiscount === 50
                  ? "bg-[#FF8C05] text-white border-[#FF8C05] font-semibold"
                  : "bg-[#FFF8EF] text-[#FF8C05] border-[#FF8C05]/40 hover:bg-[#FF8C05]/10 font-medium"
              }`}
            >
              50%+ OFF
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-heading font-medium text-[#007F79] hover:underline px-2 cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. FULL-WIDTH CONTENT GRID ── */}
      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 space-y-8">
        {/* ── FEATURED SPOTLIGHT (Only on 'all' view when not searching) ── */}
        {!searchQuery.trim() &&
          selectedCategory === "all" &&
          spotlightDeals.length > 0 &&
          selectedType === "all" && (
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-[#35104A]">
                Featured Deals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {spotlightDeals.map((coupon, idx) => {
                  const merchantName =
                    coupon.merchantId?.businessName ||
                    coupon.merchantId?.name ||
                    "Partner Store";
                  const merchantLogo =
                    coupon.merchantId?.logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=35104A&color=ffffff&size=64&bold=true`;
                  const brandSlug = coupon.merchantId?.slug;
                  const hasCode = coupon.code && coupon.code.trim() !== "";
                  const isCopied = copiedId === coupon._id;

                  const discountValue = coupon.discountValue || 20;
                  const discountType = coupon.discountType || "percentage";
                  const discountText =
                    discountType === "percentage"
                      ? `${discountValue}% OFF`
                      : `₹${discountValue} OFF`;

                  return (
                    <div
                      key={`spotlight-${coupon._id}-${idx}`}
                      className="bg-[#FFF8EF] border border-[#EADBCE] hover:border-[#007F79] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between text-left group"
                    >
                      <div>
                        {/* Store Row + Discount Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#EADBCE] p-1 flex items-center justify-center shrink-0">
                              <SafeImage
                                src={merchantLogo}
                                alt={merchantName}
                                width={28}
                                height={28}
                                className="max-h-full max-w-full object-contain rounded"
                              />
                            </div>
                            <span className="text-xs font-heading font-semibold text-[#35104A] truncate">
                              {merchantName}
                            </span>
                          </div>

                          <span className="text-xs font-heading font-semibold text-[#007F79]">
                            {discountText}
                          </span>
                        </div>

                        {/* Offer Title */}
                        <h3 className="text-xs sm:text-[13px] font-heading font-semibold text-[#35104A] line-clamp-2 leading-snug mt-2.5">
                          {coupon.title}
                        </h3>
                      </div>

                      {/* Bottom CTA */}
                      <div className="pt-2.5 mt-2.5 border-t border-[#EADBCE]/80 flex items-center justify-end">
                        {hasCode ? (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCopyCode(e, coupon.code, coupon._id)
                            }
                            className={`w-full py-1.5 px-3 text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              isCopied
                                ? "bg-[#007F79] text-white border-[#007F79]"
                                : "bg-white text-[#007F79] border-dashed border-[#007F79]/50 hover:bg-[#007F79] hover:text-white"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white stroke-[2]" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <span className="font-mono">{coupon.code}</span>
                                <Copy className="w-3 h-3 opacity-70 stroke-[1.75]" />
                              </>
                            )}
                          </button>
                        ) : (
                          <a
                            href={brandSlug ? `/brand/${brandSlug}` : "/deals"}
                            className="w-full py-1.5 px-3 bg-[#007F79] hover:bg-[#00605B] text-white text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <span>Claim Offer</span>
                            <ArrowRight className="w-3 h-3 stroke-[1.75]" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* ── SECTION B: PROMO CODES ── */}
        {(selectedType === "all" || selectedType === "coupons") && (
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-[#35104A]">
              Promo Codes
            </h2>

            {filteredCoupons.length === 0 ? (
              <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-8 text-center space-y-2">
                <TicketPercent className="w-7 h-7 stroke-[1.6] text-[#6B4C82]/50 mx-auto" />
                <h3 className="text-sm font-heading font-semibold text-[#35104A]">
                  No coupon codes found
                </h3>
                <p className="text-xs text-[#6B4C82]">
                  Try adjusting your search or category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5">
                {filteredCoupons.map((coupon, idx) => {
                  const merchantName =
                    coupon.merchantId?.businessName ||
                    coupon.merchantId?.name ||
                    "Partner Store";
                  const merchantLogo =
                    coupon.merchantId?.logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=35104A&color=ffffff&size=64&bold=true`;
                  const brandSlug = coupon.merchantId?.slug;
                  const hasCode = coupon.code && coupon.code.trim() !== "";
                  const isCopied = copiedId === coupon._id;

                  const discountValue = coupon.discountValue || 20;
                  const discountType = coupon.discountType || "percentage";
                  const discountText =
                    discountType === "percentage"
                      ? `${discountValue}% OFF`
                      : `₹${discountValue} OFF`;

                  return (
                    <div
                      key={`coupon-${coupon._id}-${idx}`}
                      className="bg-[#FFF8EF] border border-[#EADBCE] hover:border-[#007F79] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between text-left group"
                    >
                      <div>
                        {/* Store Row + Discount Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#EADBCE] p-1 flex items-center justify-center shrink-0">
                              <SafeImage
                                src={merchantLogo}
                                alt={merchantName}
                                width={28}
                                height={28}
                                className="max-h-full max-w-full object-contain rounded"
                              />
                            </div>
                            <span className="text-xs font-heading font-semibold text-[#35104A] truncate">
                              {merchantName}
                            </span>
                          </div>

                          <span className="text-xs font-heading font-semibold text-[#007F79]">
                            {discountText}
                          </span>
                        </div>

                        {/* Offer Title */}
                        <h3 className="text-xs sm:text-[13px] font-heading font-semibold text-[#35104A] line-clamp-2 leading-snug mt-2.5">
                          {coupon.title}
                        </h3>
                      </div>

                      {/* Bottom CTA */}
                      <div className="pt-2.5 mt-2.5 border-t border-[#EADBCE]/80 flex items-center justify-end">
                        {hasCode ? (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCopyCode(e, coupon.code, coupon._id)
                            }
                            className={`w-full py-1.5 px-3 text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              isCopied
                                ? "bg-[#007F79] text-white border-[#007F79]"
                                : "bg-white text-[#007F79] border-dashed border-[#007F79]/50 hover:bg-[#007F79] hover:text-white"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white stroke-[2]" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <span className="font-mono">{coupon.code}</span>
                                <Copy className="w-3 h-3 opacity-70 stroke-[1.75]" />
                              </>
                            )}
                          </button>
                        ) : (
                          <a
                            href={brandSlug ? `/brand/${brandSlug}` : "/deals"}
                            className="w-full py-1.5 px-3 bg-[#007F79] hover:bg-[#00605B] text-white text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <span>Claim Offer</span>
                            <ArrowRight className="w-3 h-3 stroke-[1.75]" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── SECTION C: PRODUCT DEALS ── */}
        {(selectedType === "all" || selectedType === "products") && (
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-[#35104A]">
              Product Deals
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-8 text-center space-y-2">
                <ShoppingBag className="w-7 h-7 stroke-[1.6] text-[#6B4C82]/50 mx-auto" />
                <h3 className="text-sm font-heading font-semibold text-[#35104A]">
                  No product deals found
                </h3>
                <p className="text-xs text-[#6B4C82]">
                  Try adjusting your search or category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5">
                {filteredProducts.map((product) => (
                  <ProductOfferCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
