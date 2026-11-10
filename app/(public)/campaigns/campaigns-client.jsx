"use client";

import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Gift,
  Heart,
  LayoutGrid,
  Percent,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/shared/modals/ConfirmationModal";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";

const CATEGORIES = [
  { id: "all", label: "All Categories", icon: LayoutGrid },
  { id: "fashion", label: "Fashion & Clothing", icon: Tag },
  { id: "food", label: "Food & Dining", icon: Gift },
  { id: "electronics", label: "Electronics & Tech", icon: Zap },
  { id: "beauty", label: "Beauty & Wellness", icon: Heart },
  { id: "travel", label: "Travel & Hotels", icon: TrendingUp },
  { id: "home", label: "Home & Living", icon: Store },
  { id: "fitness", label: "Fitness & Health", icon: ShieldCheck },
];

const DISCOUNT_OPTIONS = [
  { label: "All Discounts", value: 0 },
  { label: "50% or more", value: 50 },
  { label: "30% or more", value: 30 },
  { label: "20% or more", value: 20 },
];

const PRICE_OPTIONS = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹500", value: "under-500" },
  { label: "₹500 - ₹1,000", value: "500-1000" },
  { label: "₹1,000 - ₹2,500", value: "1000-2500" },
  { label: "Above ₹2,500", value: "above-2500" },
];

export default function CampaignsClient({
  initialTrendingCoupons = [],
  initialFeaturedCoupons = [],
  allCoupons = [],
  affiliateProducts = [],
  trendingMerchants = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'coupons' | 'products'
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [priceRange, setPriceRange] = useState("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // 1. Deduplicate coupons
  const combinedCoupons = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const c of [...initialTrendingCoupons, ...initialFeaturedCoupons, ...allCoupons]) {
      if (c._id && !seen.has(c._id)) {
        seen.add(c._id);
        list.push(c);
      }
    }
    return list;
  }, [initialTrendingCoupons, initialFeaturedCoupons, allCoupons]);

  // 2. Build full dynamic brand list from merchants, products, and coupons
  const allAvailableBrands = useMemo(() => {
    const brandMap = new Map();

    for (const m of trendingMerchants) {
      const name = m.businessName || m.name;
      if (name && !brandMap.has(name.toLowerCase())) {
        brandMap.set(name.toLowerCase(), {
          name,
          logo: m.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=08214d&color=ffffff&size=64&bold=true`,
          count: m.totalCoupons || 0,
        });
      }
    }

    for (const p of affiliateProducts) {
      const name = p.merchantName;
      if (name) {
        const key = name.toLowerCase();
        if (brandMap.has(key)) {
          brandMap.get(key).count = (brandMap.get(key).count || 0) + 1;
        } else {
          brandMap.set(key, {
            name,
            logo: p.merchantLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=08214d&color=ffffff&size=64&bold=true`,
            count: 1,
          });
        }
      }
    }

    for (const c of combinedCoupons) {
      const name = c.merchantId?.businessName || c.merchantId?.name;
      if (name) {
        const key = name.toLowerCase();
        if (brandMap.has(key)) {
          brandMap.get(key).count = (brandMap.get(key).count || 0) + 1;
        } else {
          brandMap.set(key, {
            name,
            logo: c.merchantId?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=08214d&color=ffffff&size=64&bold=true`,
            count: 1,
          });
        }
      }
    }

    return Array.from(brandMap.values()).sort((a, b) => b.count - a.count);
  }, [trendingMerchants, affiliateProducts, combinedCoupons]);

  // Filtered brands for brand search inside sidebar
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return allAvailableBrands;
    const q = brandSearch.toLowerCase().trim();
    return allAvailableBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [allAvailableBrands, brandSearch]);

  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName],
    );
  };

  // 3. Filter & Sort Coupons
  const filteredCoupons = useMemo(() => {
    if (selectedType === "products") return [];
    let result = [...combinedCoupons];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((c) => {
        const cat = (c.category || "").toLowerCase();
        const title = (c.title || "").toLowerCase();
        const catId = selectedCategory.toLowerCase();
        return cat.includes(catId) || title.includes(catId);
      });
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      const lowerBrands = selectedBrands.map((b) => b.toLowerCase());
      result = result.filter((c) => {
        const name = (c.merchantId?.businessName || c.merchantId?.name || "").toLowerCase();
        return lowerBrands.some((b) => name.includes(b));
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const code = (c.code || "").toLowerCase();
        const store = (
          c.merchantId?.businessName ||
          c.merchantId?.name ||
          ""
        ).toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          code.includes(q) ||
          store.includes(q)
        );
      });
    }

    // Discount filter
    if (minDiscount > 0) {
      result = result.filter((c) => (c.discountValue || 0) >= minDiscount);
    }

    // Sort
    if (selectedSort === "discount-desc") {
      result.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
    }

    return result;
  }, [combinedCoupons, selectedType, selectedCategory, selectedBrands, searchQuery, minDiscount, selectedSort]);

  // 4. Filter & Sort Affiliate Products
  const filteredAffiliate = useMemo(() => {
    if (selectedType === "coupons") return [];
    let result = [...affiliateProducts];

    // Category filter
    if (selectedCategory !== "all") {
      const catId = selectedCategory.toLowerCase();
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const sub = (p.subcategory || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return cat.includes(catId) || sub.includes(catId) || title.includes(catId);
      });
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      const lowerBrands = selectedBrands.map((b) => b.toLowerCase());
      result = result.filter((p) => {
        const store = (p.merchantName || "").toLowerCase();
        return lowerBrands.some((b) => store.includes(b));
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const store = (p.merchantName || "").toLowerCase();
        return title.includes(q) || store.includes(q);
      });
    }

    // Discount filter
    if (minDiscount > 0) {
      result = result.filter((p) => {
        const disc =
          p.discountPercentage ||
          (p.originalPrice && p.discountPrice
            ? Math.round(((p.originalPrice - p.discountPrice) / p.originalPrice) * 100)
            : 0);
        return disc >= minDiscount;
      });
    }

    // Price range filter
    if (priceRange !== "all") {
      result = result.filter((p) => {
        const price = p.discountPrice || p.originalPrice || 0;
        if (priceRange === "under-500") return price > 0 && price <= 500;
        if (priceRange === "500-1000") return price > 500 && price <= 1000;
        if (priceRange === "1000-2500") return price > 1000 && price <= 2500;
        if (priceRange === "above-2500") return price > 2500;
        return true;
      });
    }

    // Sort options
    if (selectedSort === "discount-desc") {
      result.sort((a, b) => {
        const discA = a.discountPercentage || (a.originalPrice && a.discountPrice ? Math.round(((a.originalPrice - a.discountPrice) / a.originalPrice) * 100) : 0);
        const discB = b.discountPercentage || (b.originalPrice && b.discountPrice ? Math.round(((b.originalPrice - b.discountPrice) / b.originalPrice) * 100) : 0);
        return discB - discA;
      });
    } else if (selectedSort === "price-asc") {
      result.sort((a, b) => {
        const priceA = a.discountPrice || a.originalPrice || 0;
        const priceB = b.discountPrice || b.originalPrice || 0;
        return priceA - priceB;
      });
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => {
        const priceA = a.discountPrice || a.originalPrice || 0;
        const priceB = b.discountPrice || b.originalPrice || 0;
        return priceB - priceA;
      });
    }

    return result;
  }, [affiliateProducts, selectedType, selectedCategory, selectedBrands, searchQuery, minDiscount, priceRange, selectedSort]);

  // 5. Split coupons into 2 rows for marquee
  const { row1Coupons, row2Coupons } = useMemo(() => {
    if (filteredCoupons.length === 0) {
      return { row1Coupons: [], row2Coupons: [] };
    }

    const r1 = [];
    const r2 = [];
    filteredCoupons.forEach((coupon, index) => {
      if (index % 2 === 0) {
        r1.push(coupon);
      } else {
        r2.push(coupon);
      }
    });

    const buildLooped = (arr) => {
      if (arr.length === 0) return [];
      let looped = [...arr];
      while (looped.length < 10) {
        looped = [...looped, ...arr];
      }
      return [...looped, ...looped];
    };

    return {
      row1Coupons: buildLooped(r1.length > 0 ? r1 : filteredCoupons),
      row2Coupons: buildLooped(r2.length > 0 ? r2 : filteredCoupons),
    };
  }, [filteredCoupons]);

  const handleCopyCode = (e, code, couponId) => {
    e.preventDefault();
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(couponId);
      toast.success(`Coupon code "${code}" copied!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const totalCount = filteredCoupons.length + filteredAffiliate.length;

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedBrands.length +
    (minDiscount > 0 ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedBrands([]);
    setBrandSearch("");
    setMinDiscount(0);
    setPriceRange("all");
    setSearchQuery("");
    setSelectedSort("featured");
  };

  // Render modern ticket-style voucher card for marquee
  const renderSquareCouponCard = (coupon, idx) => {
    const merchantName =
      coupon.merchantId?.businessName ||
      coupon.merchantId?.name ||
      "Partner Store";
    const merchantLogo =
      coupon.merchantId?.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
    const hasCode = coupon.code && coupon.code.trim() !== "";
    const isCopied = copiedId === coupon._id;

    const discountValue = coupon.discountValue || 20;
    const discountType = coupon.discountType || "percentage";
    const discountBadge =
      discountType === "percentage"
        ? `${discountValue}% OFF`
        : discountType === "fixed"
          ? `₹${discountValue} OFF`
          : "SPECIAL DEAL";

    return (
      <div
        key={`${coupon._id}-${idx}`}
        onClick={() => {
          if (!hasCode) setSelectedCoupon(coupon);
        }}
        className="w-[260px] sm:w-[280px] h-[146px] shrink-0 bg-white border border-slate-200/90 rounded-xl p-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_20px_rgba(247,40,83,0.12)] hover:border-[#F72853] transition-all duration-200 flex flex-col justify-between select-none group text-left cursor-pointer active:scale-[0.99] relative overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F72853] to-rose-400 opacity-80" />

        {/* Top: Logo + Store + Discount Badge */}
        <div className="flex items-start justify-between gap-1.5 pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0">
              <img
                src={merchantLogo}
                alt={merchantName}
                className="w-full h-full object-contain rounded-md"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-[#F72853] transition-colors">
                {merchantName}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#F72853] border border-rose-200/80 shrink-0 shadow-2xs">
            {discountBadge}
          </span>
        </div>

        {/* Center: Offer Title */}
        <div className="my-1">
          <h3 className="text-[12.5px] font-medium text-slate-800 leading-snug line-clamp-2">
            {coupon.title}
          </h3>
        </div>

        {/* Bottom Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>{coupon.totalClaims ? `${coupon.totalClaims} Claimed` : "Active Deal"}</span>
          </div>

          {hasCode ? (
            <button
              type="button"
              onClick={(e) => handleCopyCode(e, coupon.code, coupon._id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                isCopied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                  : "bg-rose-50/70 text-[#F72853] border-dashed border-rose-300 hover:bg-[#F72853] hover:text-white active:scale-95 shadow-2xs"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <span className="font-mono tracking-tight">{coupon.code}</span>
                  <Copy className="w-3 h-3 opacity-70" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCoupon(coupon);
              }}
              className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#F72853] border border-slate-200 hover:border-rose-200 active:scale-95 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Get Deal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Reusable Sidebar Filter Content (used for both desktop sidebar and mobile drawer)
  const renderSidebarFilters = () => (
    <div className="space-y-5">
      {/* Sidebar Header with Active Count & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#F72853]" />
          <span className="text-sm font-bold text-slate-900">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F72853] text-white text-[11px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs font-semibold text-[#F72853] hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* ── 1. Offer Type Filter ── */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#F72853]" />
          <span>Offer Type</span>
        </h4>
        <div className="space-y-1">
          {[
            { id: "all", label: "All Offers", count: combinedCoupons.length + affiliateProducts.length },
            { id: "coupons", label: "Coupon Codes", count: combinedCoupons.length },
            { id: "products", label: "Product Deals", count: affiliateProducts.length },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedType === type.id
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{type.label}</span>
              <span className="text-[10.5px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {type.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Category Filter ── */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#F72853]" />
            <span>Category</span>
          </h4>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-[11px] font-semibold text-[#F72853] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-50 text-[#F72853] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{cat.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#F72853] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Brand / Store Filter with Search & Checkboxes ── */}
      {allAvailableBrands.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Brand / Store</span>
            </h4>
            {selectedBrands.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className="text-[11px] font-semibold text-[#F72853] hover:underline cursor-pointer"
              >
                Clear ({selectedBrands.length})
              </button>
            )}
          </div>

          {/* Search inside brand list */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full h-7.5 pl-7 pr-2.5 text-[11px] bg-slate-50 rounded-lg border border-slate-200 focus:border-[#F72853] outline-none"
            />
          </div>

          {/* Brand List with Checkboxes */}
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {filteredBrandsList.map((brand, idx) => {
              const isChecked = selectedBrands.includes(brand.name);
              return (
                <label
                  key={idx}
                  onClick={() => handleToggleBrand(brand.name)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                    isChecked
                      ? "bg-rose-50/70 text-[#F72853] font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked
                          ? "bg-[#F72853] border-[#F72853] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <img
                      src={brand.logo}
                      alt=""
                      className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="truncate">{brand.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium ml-1 shrink-0">
                    ({brand.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Discount Filter ── */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-[#F72853]" />
            <span>Discount Range</span>
          </h4>
          {minDiscount > 0 && (
            <button
              type="button"
              onClick={() => setMinDiscount(0)}
              className="text-[11px] font-semibold text-[#F72853] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {DISCOUNT_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMinDiscount(item.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                minDiscount === item.value
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {minDiscount === item.value && <Check className="w-3.5 h-3.5 text-[#F72853]" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. Price Range Filter ── */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#F72853]" />
            <span>Price Range</span>
          </h4>
          {priceRange !== "all" && (
            <button
              type="button"
              onClick={() => setPriceRange("all")}
              className="text-[11px] font-semibold text-[#F72853] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {PRICE_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPriceRange(item.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                priceRange === item.value
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {priceRange === item.value && <Check className="w-3.5 h-3.5 text-[#F72853]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-16 select-none relative">
      {/* ── 1. CLEAN HERO HEADER BAR (NO CLUTTERED PILLS) ── */}
      <div className="w-full bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
              <Link href="/" className="hover:text-[#F72853] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 font-medium">Trending Offers &amp; Brand Campaigns</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
              <span className="bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Tested
              </span>
              <span className="bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#F72853]" />
                Updated Daily
              </span>
              <span className="bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                Free to Claim
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-[#F72853]">🔥 Trending Deals</span> &amp; Brand Offers
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200/80 shadow-2xs">
              {totalCount} Live Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover curated flash discounts, verified coupon codes, and exclusive brand price drops updated daily.
          </p>
        </div>
      </div>

      {/* ── 2. MAIN LAYOUT: STICKY SIDEBAR + FULL-WIDTH CONTENT ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Desktop Left Sticky Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
              {renderSidebarFilters()}
            </div>
          </aside>

          {/* Main Content Column */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Top Toolbar: Search + Mobile Filter Trigger + Sort */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-[#F72853] text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#F72853]" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-[#F72853] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search deals, stores, codes..."
                    className="w-full h-9 pl-8.5 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#F72853] focus:bg-white transition-all shadow-2xs text-slate-800 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort & Count */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-800">{totalCount}</strong> verified deals
                </span>

                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="h-9 px-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 outline-none cursor-pointer focus:border-[#F72853] shadow-2xs"
                  >
                    <option value="featured">Featured Deals</option>
                    <option value="discount-desc">Discount: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Chips Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-xs font-semibold text-slate-500 mr-1">Active:</span>

                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}</span>
                    <button type="button" onClick={() => setSelectedCategory("all")} className="hover:text-rose-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedType !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span className="capitalize">Type: {selectedType}</span>
                    <button type="button" onClick={() => setSelectedType("all")} className="hover:text-rose-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>Brand: {b}</span>
                    <button type="button" onClick={() => handleToggleBrand(b)} className="hover:text-rose-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {minDiscount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>Discount: {minDiscount}%+</span>
                    <button type="button" onClick={() => setMinDiscount(0)} className="hover:text-rose-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>Price: {PRICE_OPTIONS.find((p) => p.value === priceRange)?.label}</span>
                    <button type="button" onClick={() => setPriceRange("all")} className="hover:text-rose-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-[#F72853] hover:underline cursor-pointer ml-1.5"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ── A. 2-ROW MARQUEE COUPONS (When in 'all' or 'coupons' type) ── */}
            {filteredCoupons.length > 0 && (selectedType === "all" || selectedType === "coupons") && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>🏷️ Featured Promo Codes &amp; Vouchers</span>
                    <span className="text-xs font-normal text-slate-500">
                      ({filteredCoupons.length} Available)
                    </span>
                  </h2>
                </div>

                {/* Row 1 (Glides Left with Pause on Hover) */}
                <div className="w-full overflow-hidden py-1 rounded-xl group/row1">
                  <div className="animate-marquee-left gap-3 group-hover/row1:[animation-play-state:paused]">
                    {row1Coupons.map((coupon, idx) =>
                      renderSquareCouponCard(coupon, `r1-${idx}`),
                    )}
                  </div>
                </div>

                {/* Row 2 (Glides Right with Pause on Hover) */}
                <div className="w-full overflow-hidden py-1 rounded-xl group/row2">
                  <div className="animate-marquee-right gap-3 group-hover/row2:[animation-play-state:paused]">
                    {row2Coupons.map((coupon, idx) =>
                      renderSquareCouponCard(coupon, `r2-${idx}`),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── B. PRODUCT DEALS GRID ── */}
            {filteredAffiliate.length > 0 && (selectedType === "all" || selectedType === "products") && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>⚡ Trending Product Deals &amp; Price Drops</span>
                    <span className="text-xs font-normal text-slate-500">
                      ({filteredAffiliate.length} Live Deals)
                    </span>
                  </h2>
                </div>

                {/* Clean responsive grid filling the right column */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
                  {filteredAffiliate.map((product, idx) => (
                    <ProductOfferCard key={product._id || idx} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredCoupons.length === 0 && filteredAffiliate.length === 0 && (
              <div className="w-full py-16">
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 max-w-md mx-auto shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-[#F72853] border border-rose-200/70 flex items-center justify-center mx-auto shadow-2xs">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      No matching offers found
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      We couldn&apos;t find any deals matching your current filter selections. Try resetting filters to view all trending offers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-5 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── 3. MOBILE FILTER DRAWER (Slide-in) ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-10 flex flex-col">
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F72853]" />
                <h3 className="font-bold text-sm text-slate-900">Filter Deals</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {renderSidebarFilters()}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#F72853] hover:bg-[#e01e47] rounded-lg shadow-xs"
              >
                Apply ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Voucher Modal Overlay */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 600));
            return (
              selectedCoupon.code ||
              `VOUCH-${Math.floor(1000 + Math.random() * 9000)}`
            );
          }}
        />
      )}
    </div>
  );
}
