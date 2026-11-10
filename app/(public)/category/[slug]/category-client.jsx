"use client";

import {
  ArrowUp,
  ArrowUpDown,
  Baby,
  Car,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Flame,
  Gamepad2,
  Gem,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  Layers,
  Percent,
  Plane,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Utensils,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";

// Map slugs to category icons
const CATEGORY_ICONS = {
  electronics: Laptop,
  fashion: Shirt,
  food: Utensils,
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

// Intelligent dynamic subcategory classifier based on actual product contents
function classifyProduct(item, categorySlug) {
  const text =
    `${item.title || ""} ${item.description || ""} ${item.tags || ""}`.toLowerCase();

  if (categorySlug === "electronics") {
    if (
      /laptop|thinkbook|vivobook|pc|acer|lenovo|asus|computer|ryzen/i.test(text)
    ) {
      return "Laptops & Computers";
    }
    if (/headphone|earbud|tws|speaker|audio|sound|stone|spotify/i.test(text)) {
      return "Audio & Headphones";
    }
    if (/smartwatch|watch|storm call/i.test(text)) {
      return "Smartwatches & Wearables";
    }
    if (
      /refrigerator|washing machine|cooktop|gas stove|air fryer|water heater|geyser|vacuum|treadmill|lumiere|civic/i.test(
        text,
      )
    ) {
      return "Home & Kitchen Appliances";
    }
    if (/tv|television|projector|led/i.test(text)) {
      return "TVs & Entertainment";
    }
    if (
      /straightener|hair dryer|airwrap|styler|trimmer|airstrait|corrale|supersonic/i.test(
        text,
      )
    ) {
      return "Personal Grooming & Care";
    }
    return "Other Electronics";
  }

  if (categorySlug === "fashion") {
    if (/men|shirt|jeans|tshirt|t-shirt|trouser/i.test(text))
      return "Men's Fashion";
    if (/women|dress|saree|kurti|top|skirt/i.test(text)) return "Women's Wear";
    if (/shoe|sneaker|footwear|sandal|boot/i.test(text)) return "Footwear";
    if (/watch|accessory|belt|wallet|sunglass|bag/i.test(text))
      return "Watches & Accessories";
    return "Fashion Deals";
  }

  if (categorySlug === "food") {
    if (/pizza|burger|fast food|cafe|snack/i.test(text))
      return "Fast Food & Snacks";
    if (/dining|restaurant|buffet|fine dining/i.test(text))
      return "Fine Dining";
    if (/cake|bakery|dessert|sweet|ice cream/i.test(text))
      return "Bakery & Desserts";
    return "Food & Dining";
  }

  if (categorySlug === "beauty") {
    if (/makeup|lipstick|foundation|eyeliner/i.test(text)) return "Makeup";
    if (/skincare|serum|cream|lotion|sunscreen/i.test(text)) return "Skincare";
    if (/hair|shampoo|conditioner|oil/i.test(text)) return "Haircare";
    if (/perfume|fragrance|deodorant/i.test(text))
      return "Fragrance & Perfumes";
    return "Beauty & Wellness";
  }

  return "Featured Offers";
}

// Category FAQs for SEO & trust
const CATEGORY_FAQS = {
  electronics: [
    {
      q: "How do I redeem electronics deals and promo codes?",
      a: "For product price drops and direct deals, click 'Grab Offer' to be redirected to the verified partner store with the discount auto-applied. For promo codes, click 'Copy Code' and paste it at store checkout.",
    },
    {
      q: "Are the laptop, audio, and gadget discounts 100% verified?",
      a: "Yes. Our team regularly tests and validates pricing and discount coupons directly with certified partner stores and brand websites before featuring them.",
    },
    {
      q: "Can I get extra cashback or bank card discounts on these offers?",
      a: "In most cases, store promo codes and deal prices can be combined with bank card EMI or payment gateway cashback offers during final checkout on the partner site.",
    },
    {
      q: "How frequently are new electronics offers added?",
      a: "We refresh deals and price drops multiple times daily as top brands launch flash sales and new coupon campaigns.",
    },
  ],
  default: [
    {
      q: "How do I use coupons and promo codes on Vouchiqo?",
      a: "Click 'Copy Code' on any coupon card to copy the code to your clipboard, then visit the partner store and paste the code into the voucher/promo field at checkout.",
    },
    {
      q: "Are all discount deals and coupons free to use?",
      a: "Yes! All promo codes, cashback links, and discount deals listed on Vouchiqo are 100% free with no registration fee required.",
    },
    {
      q: "What should I do if a promo code does not work?",
      a: "Some codes have minimum order requirements or are limited to first-time users. Check the terms or try another active offer from the brand list above.",
    },
  ],
};

// Helper to filter price
function matchesPriceRange(price, range) {
  if (range === "all") return true;
  if (price === 0 || price === undefined || price === null) return true;
  if (range === "under-1000") return price < 1000;
  if (range === "1000-5000") return price >= 1000 && price <= 5000;
  if (range === "5000-25000") return price > 5000 && price <= 25000;
  if (range === "above-25000") return price > 25000;
  return true;
}

// Helper to filter discount
function matchesDiscount(percent, min) {
  if (min === 0) return true;
  return (percent || 0) >= min;
}

export default function CategoryClient({
  categoryInfo,
  coupons = [],
  affiliateProducts = [],
}) {
  // State for all filters
  const [selectedSub, setSelectedSub] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState([]); // array of brand names
  const [minDiscount, setMinDiscount] = useState(0); // 0, 30, 50, 70
  const [priceRange, setPriceRange] = useState("all"); // 'all', 'under-1000', '1000-5000', '5000-20000', 'above-20000'
  const [offerType, setOfferType] = useState("all"); // 'all' | 'deals' | 'coupons'
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("search") || searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'discount-desc' | 'price-asc' | 'price-desc' | 'latest'
  const [copiedId, setCopiedId] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const rawSlug = categoryInfo?.slug || "electronics";
  const CategoryIcon = CATEGORY_ICONS[rawSlug] || Tag;

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Tag each product with its dynamic subcategory
  const enrichedAffiliate = useMemo(() => {
    return affiliateProducts.map((p) => ({
      ...p,
      computedSub: classifyProduct(p, rawSlug),
    }));
  }, [affiliateProducts, rawSlug]);

  const enrichedCoupons = useMemo(() => {
    return coupons.map((c) => ({
      ...c,
      computedSub: classifyProduct(c, rawSlug),
    }));
  }, [coupons, rawSlug]);

  // 2. Extract ONLY subcategories that actually have deals (count > 0)
  const activeSubcategories = useMemo(() => {
    const counts = {};

    for (const p of enrichedAffiliate) {
      const sub = p.computedSub;
      if (sub) counts[sub] = (counts[sub] || 0) + 1;
    }
    for (const c of enrichedCoupons) {
      const sub = c.computedSub;
      if (sub) counts[sub] = (counts[sub] || 0) + 1;
    }

    // Return only those with count > 0, sorted by largest count first
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [enrichedAffiliate, enrichedCoupons]);

  // 3. Extract all unique brands with their count and logo
  const availableBrands = useMemo(() => {
    const map = new Map();

    const addBrand = (name, logo) => {
      if (!name || typeof name !== "string") return;
      const clean = name.trim();
      if (!clean || clean.toLowerCase() === "partner store") return;
      const key = clean.toLowerCase();
      if (map.has(key)) {
        map.get(key).count += 1;
      } else {
        map.set(key, {
          name: clean,
          logo:
            logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=08214d&color=ffffff&size=64&bold=true`,
          count: 1,
        });
      }
    };

    for (const c of coupons) {
      const name = c.merchantId?.businessName || c.merchantId?.name;
      const logo = c.merchantId?.logo;
      addBrand(name, logo);
    }

    for (const p of affiliateProducts) {
      const name =
        p.merchantName ||
        (typeof p.merchantId === "object" ? p.merchantId?.businessName : null);
      const logo =
        p.merchantLogo ||
        (typeof p.merchantId === "object" ? p.merchantId?.logo : null);
      addBrand(name, logo);
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [coupons, affiliateProducts]);

  // Filtered brands for brand search box
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    const q = brandSearch.toLowerCase().trim();
    return availableBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [availableBrands, brandSearch]);

  // 4. Calculate max discount percentage in category
  const maxDiscount = useMemo(() => {
    let max = 0;
    for (const c of coupons) {
      if (
        c.discountValue &&
        c.discountType === "percentage" &&
        c.discountValue <= 100
      ) {
        max = Math.max(max, c.discountValue);
      }
    }
    for (const p of affiliateProducts) {
      if (p.discountPercentage && p.discountPercentage <= 100) {
        max = Math.max(max, p.discountPercentage);
      }
    }
    return max > 0 ? max : 75;
  }, [coupons, affiliateProducts]);

  // 5. Filtered & Sorted Coupons
  const filteredCoupons = useMemo(() => {
    if (offerType === "deals") return [];
    let list = [...enrichedCoupons];

    // Subcategory filter
    if (selectedSub !== "all") {
      list = list.filter((c) => c.computedSub === selectedSub);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((c) => {
        const name = (
          c.merchantId?.businessName ||
          c.merchantId?.name ||
          ""
        ).toLowerCase();
        return selectedBrands.some((b) => b.toLowerCase() === name);
      });
    }

    // Discount filter
    if (minDiscount > 0) {
      list = list.filter((c) => {
        const disc = c.discountType === "percentage" ? c.discountValue : 0;
        return matchesDiscount(disc, minDiscount);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q) ||
          (typeof c.merchantId === "object" &&
            c.merchantId?.businessName?.toLowerCase().includes(q)),
      );
    }

    // Sort
    if (sortBy === "discount-desc") {
      list.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
    } else if (sortBy === "latest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else {
      list.sort((a, b) => (b.totalClaims || 0) - (a.totalClaims || 0));
    }

    return list;
  }, [
    enrichedCoupons,
    selectedSub,
    selectedBrands,
    minDiscount,
    offerType,
    searchQuery,
    sortBy,
  ]);

  // 6. Filtered & Sorted Affiliate Products
  const filteredAffiliate = useMemo(() => {
    if (offerType === "coupons") return [];
    let list = [...enrichedAffiliate];

    // Subcategory filter
    if (selectedSub !== "all") {
      list = list.filter((p) => p.computedSub === selectedSub);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => {
        const name = (
          p.merchantName ||
          (typeof p.merchantId === "object"
            ? p.merchantId?.businessName
            : "") ||
          ""
        ).toLowerCase();
        return selectedBrands.some((b) => b.toLowerCase() === name);
      });
    }

    // Discount filter
    if (minDiscount > 0) {
      list = list.filter((p) => {
        const disc = p.discountPercentage <= 100 ? p.discountPercentage : 0;
        return matchesDiscount(disc, minDiscount);
      });
    }

    // Price range filter
    if (priceRange !== "all") {
      list = list.filter((p) => {
        const price = p.discountPrice || p.originalPrice || 0;
        return matchesPriceRange(price, priceRange);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.merchantName?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortBy === "discount-desc") {
      list.sort((a, b) => {
        const pA = a.discountPercentage <= 100 ? a.discountPercentage : 0;
        const pB = b.discountPercentage <= 100 ? b.discountPercentage : 0;
        return pB - pA;
      });
    } else if (sortBy === "price-asc") {
      list.sort(
        (a, b) => (a.discountPrice || 999999) - (b.discountPrice || 999999),
      );
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.discountPrice || 0) - (a.discountPrice || 0));
    } else if (sortBy === "latest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    } else {
      list.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    }

    return list;
  }, [
    enrichedAffiliate,
    selectedSub,
    selectedBrands,
    minDiscount,
    priceRange,
    offerType,
    searchQuery,
    sortBy,
  ]);

  const totalFilteredCount = filteredCoupons.length + filteredAffiliate.length;

  // Check if any filter is active
  const activeFiltersCount =
    (selectedSub !== "all" ? 1 : 0) +
    selectedBrands.length +
    (minDiscount > 0 ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (offerType !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedSub("all");
    setSelectedBrands([]);
    setMinDiscount(0);
    setPriceRange("all");
    setOfferType("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName],
    );
  };

  const handleCopyCode = (e, code, couponId) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(couponId);
      toast.success(`Offer code "${code}" copied!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const currentFaqs = CATEGORY_FAQS[rawSlug] || CATEGORY_FAQS.default;

  // Reusable Filter Sidebar Content (shared between desktop sidebar and mobile drawer)
  const FilterPanelContent = (
    <div className="space-y-6 text-left font-sans">
      {/* ── Subcategory / Department ── */}
      {activeSubcategories.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Department</span>
            </h3>
            {selectedSub !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedSub("all")}
                className="text-[11px] font-semibold text-[#F72853] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedSub("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedSub === "all"
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>All {categoryInfo?.title}</span>
              <span className="text-[10.5px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                {coupons.length + affiliateProducts.length}
              </span>
            </button>

            {activeSubcategories.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setSelectedSub(sub.name === selectedSub ? "all" : sub.name)
                }
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedSub === sub.name
                    ? "bg-rose-50 text-[#F72853] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate pr-2">{sub.name}</span>
                <span className="text-[10.5px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full shrink-0">
                  {sub.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Brand Filter (Only brands with real deals) ── */}
      {availableBrands.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Brand / Store</span>
            </h3>
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

          {/* Brand Search Input if many brands */}
          {availableBrands.length > 5 && (
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
          )}

          {/* Brand Checkbox List */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
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

      {/* ── Discount Range ── */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-[#F72853]" />
            <span>Discount</span>
          </h3>
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
          {[
            { label: "70% or more", value: 70 },
            { label: "50% or more", value: 50 },
            { label: "30% or more", value: 30 },
            { label: "All Discounts", value: 0 },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMinDiscount(item.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                minDiscount === item.value
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {minDiscount === item.value && (
                <Check className="w-3.5 h-3.5 text-[#F72853]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#F72853]" />
            <span>Price Range</span>
          </h3>
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
          {[
            { label: "All Prices", value: "all" },
            { label: "Under ₹1,000", value: "under-1000" },
            { label: "₹1,000 - ₹5,000", value: "1000-5000" },
            { label: "₹5,000 - ₹25,000", value: "5000-25000" },
            { label: "Above ₹25,000", value: "above-25000" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPriceRange(item.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                priceRange === item.value
                  ? "bg-rose-50 text-[#F72853] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {priceRange === item.value && (
                <Check className="w-3.5 h-3.5 text-[#F72853]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-16 select-none relative">
      {/* ── 1. COMPACT HERO HEADER ── */}
      <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 md:px-8 py-4">
        <div className="w-full">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-2"
          >
            <Link
              href="/"
              className="hover:text-[#F72853] transition-colors flex items-center gap-1"
            >
              <Home className="w-3 h-3 text-slate-400" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/categories"
              className="hover:text-[#F72853] transition-colors"
            >
              Categories
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">
              {categoryInfo?.title}
            </span>
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#F72853] to-[#FF4D6D] text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <CategoryIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{categoryInfo?.title} Deals &amp; Offers</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-[#F72853] border border-rose-200/80">
                    {coupons.length + affiliateProducts.length} Live
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Verified coupons, exclusive price drops, and store offers
                  updated daily.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Tested
              </span>
              <span className="bg-rose-50 text-[#F72853] px-2.5 py-1 rounded-lg border border-rose-200/60 flex items-center gap-1 shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-[#F72853]" />
                Up to {maxDiscount}% OFF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN 2-COLUMN E-COMMERCE LAYOUT ── */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-5">
        <div className="flex items-start gap-6">
          {/* ── LEFT DESKTOP FILTER SIDEBAR ── */}
          <aside className="w-64 lg:w-72 shrink-0 hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F72853]" />
                <span className="text-sm font-bold text-slate-900">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#F72853] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#F72853] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {FilterPanelContent}
          </aside>

          {/* ── RIGHT MAIN CONTENT AREA ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Top Toolbar: Search + Sort + Mobile Filter Trigger */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search deals in ${categoryInfo?.title || "category"}...`}
                  className="w-full h-9 pl-9 pr-8 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#F72853] focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button + Sort Selector */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {/* Mobile Filter Button (visible only on mobile) */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-1.5 h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#F72853]" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#F72853] text-white text-[9.5px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Offer Type Tabs */}
                {coupons.length > 0 && (
                  <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOfferType("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        offerType === "all"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600"
                      }`}
                    >
                      All ({coupons.length + affiliateProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferType("deals")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        offerType === "deals"
                          ? "bg-white text-[#F72853] shadow-2xs"
                          : "text-slate-600"
                      }`}
                    >
                      Deals ({affiliateProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferType("coupons")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        offerType === "coupons"
                          ? "bg-white text-[#F72853] shadow-2xs"
                          : "text-slate-600"
                      }`}
                    >
                      Coupons ({coupons.length})
                    </button>
                  </div>
                )}

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 px-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer focus:border-[#F72853]"
                  >
                    <option value="featured">Featured Deals</option>
                    <option value="discount-desc">Discount: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="latest">Newest Added</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Chips Bar (Shows what user has filtered) */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Active:
                </span>

                {selectedSub !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>{selectedSub}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSub("all")}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrand(b)}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {minDiscount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>{minDiscount}%+ OFF</span>
                    <button
                      type="button"
                      onClick={() => setMinDiscount(0)}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>{priceRange.replace("-", " to ")}</span>
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#F72853] border border-rose-200">
                    <span>"{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#F72853] underline cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <p>
                Showing{" "}
                <strong className="text-slate-900">{totalFilteredCount}</strong>{" "}
                verified deals
                {selectedSub !== "all" && (
                  <span>
                    {" "}
                    in <strong className="text-[#F72853]">{selectedSub}</strong>
                  </span>
                )}
              </p>
            </div>

            {/* ── STORE PROMO CODES (IF ANY) ── */}
            {filteredCoupons.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#F72853]" />
                  <span>Promo Codes ({filteredCoupons.length})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredCoupons.map((coupon) => {
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
                        key={coupon._id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-[0_8px_20px_rgba(247,40,83,0.12)] hover:border-rose-300 transition-all duration-300 flex flex-col justify-between select-none group text-left cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0">
                              <img
                                src={merchantLogo}
                                alt={merchantName}
                                className="w-full h-full object-contain rounded-sm"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=f72853&color=ffffff&size=64&bold=true`;
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#F72853] transition-colors">
                                {merchantName}
                              </p>
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-[#F72853] border border-rose-200/70 shrink-0">
                            {discountBadge}
                          </span>
                        </div>

                        <div className="my-2.5 space-y-0.5">
                          <h3 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                            {coupon.title}
                          </h3>
                          {coupon.description && (
                            <p className="text-[10.5px] text-slate-500 line-clamp-1 font-normal">
                              {coupon.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span>
                              {coupon.totalClaims
                                ? `${coupon.totalClaims} Claimed`
                                : "Active"}
                            </span>
                          </div>

                          {hasCode ? (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopyCode(e, coupon.code, coupon._id)
                              }
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                                isCopied
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-rose-50 text-[#F72853] border-rose-200 hover:bg-[#F72853] hover:text-white active:scale-95"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-mono">
                                    {coupon.code}
                                  </span>
                                  <Copy className="w-3 h-3 opacity-70" />
                                </>
                              )}
                            </button>
                          ) : (
                            <a
                              href={coupon.affiliateUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#F72853] border border-slate-200 hover:border-rose-200 active:scale-95 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Get Deal</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── PRODUCT DEALS & PRICE DROPS GRID ── */}
            {filteredAffiliate.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Product Deals &amp; Price Drops (
                      {filteredAffiliate.length})
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {filteredAffiliate.map((product, idx) => (
                    <ProductOfferCard
                      key={product._id || idx}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── EMPTY STATE WHEN NO RESULTS MATCH ── */}
            {totalFilteredCount === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#F72853] flex items-center justify-center mx-auto shadow-2xs">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  No matching deals found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  No deals match your selected filters. Try clearing your
                  filters or search keywords to see all available offers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── 3. MOBILE FILTER SLIDE-OVER DRAWER (SHEET) ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F72853]" />
                <span className="text-sm font-bold text-slate-900">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#F72853] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {FilterPanelContent}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F72853] hover:bg-[#e01e47] text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Apply ({totalFilteredCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TRUST & SAVINGS GUIDE / FAQS SECTION ── */}
      <div className="w-full px-4 sm:px-6 md:px-8 mt-12">
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
          <div className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F72853] bg-rose-50 px-2.5 py-0.5 rounded-full mb-1">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>Smart Shopping Guide</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              How to Save More in {categoryInfo?.title}
            </h2>
            <p className="text-xs text-slate-500">
              Helpful answers and verified tips to maximize your discount
              savings on Vouchiqo.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {currentFaqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-2.5 text-left">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                  >
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#F72853] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-[#F72853] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2 text-xs text-slate-600 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. FLOATING BACK TO TOP BUTTON ── */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-[#F72853] shadow-lg shadow-slate-900/20 backdrop-blur-xs transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
