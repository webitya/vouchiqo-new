"use client";

import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";
import SafeImage from "@/components/shared/SafeImage";

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
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [priceRange, setPriceRange] = useState("all");
  const [offerType, setOfferType] = useState("all");
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("search") || searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams, searchQuery]);

  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [copiedId, setCopiedId] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Lock background scroll when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-scroll-locked", "true");
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-scroll-locked");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-scroll-locked");
    };
  }, [isMobileFilterOpen]);

  const rawSlug = categoryInfo?.slug || "electronics";

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
            `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=35104a&color=ffd166&size=64&bold=true`,
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

    if (selectedSub !== "all") {
      list = list.filter((c) => c.computedSub === selectedSub);
    }

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

    if (minDiscount > 0) {
      list = list.filter((c) => {
        const disc = c.discountType === "percentage" ? c.discountValue : 0;
        return matchesDiscount(disc, minDiscount);
      });
    }

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

    if (selectedSub !== "all") {
      list = list.filter((p) => p.computedSub === selectedSub);
    }

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

    if (minDiscount > 0) {
      list = list.filter((p) => {
        const disc = p.discountPercentage <= 100 ? p.discountPercentage : 0;
        return matchesDiscount(disc, minDiscount);
      });
    }

    if (priceRange !== "all") {
      list = list.filter((p) => {
        const price = p.discountPrice || p.originalPrice || 0;
        return matchesPriceRange(price, priceRange);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.merchantName?.toLowerCase().includes(q),
      );
    }

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

  // Direct native wheel listener to ensure smooth independent brand scrolling without Lenis interference
  const bindBrandScrollRef = (node) => {
    if (!node || node._wheelBound) return;
    node._wheelBound = true;
    node.addEventListener(
      "wheel",
      (e) => {
        if (node.scrollHeight > node.clientHeight) {
          e.stopPropagation();
          node.scrollTop += e.deltaY;
        }
      },
      { passive: false },
    );
  };

  // Reusable Filter Sidebar Content - Clean, modern, NO unnecessary decorative icons
  const FilterPanelContent = (
    <div className="space-y-6 text-left font-sans">
      {/* ── Subcategory / Department ── */}
      {activeSubcategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
              Department
            </h3>
            {selectedSub !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedSub("all")}
                className="text-[11px] font-heading font-medium text-[#007F79] hover:text-[#35104A] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSelectedSub("all")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                selectedSub === "all"
                  ? "bg-[#007F79] text-white font-heading font-semibold shadow-xs"
                  : "text-[#35104A] hover:bg-[#FFF8EF] hover:text-[#007F79] font-medium"
              }`}
            >
              <span>All {categoryInfo?.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                  selectedSub === "all"
                    ? "bg-white/20 text-white font-heading font-medium"
                    : "text-[#6B4C82] bg-[#EADBCE]/50 font-medium"
                }`}
              >
                {coupons.length + affiliateProducts.length}
              </span>
            </button>

            {activeSubcategories.map((sub, idx) => {
              const isSelected = selectedSub === sub.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedSub(sub.name === selectedSub ? "all" : sub.name)
                  }
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                    isSelected
                      ? "bg-[#007F79] text-white font-heading font-semibold shadow-xs"
                      : "text-[#35104A] hover:bg-[#FFF8EF] hover:text-[#007F79] font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{sub.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white font-heading font-medium"
                        : "text-[#6B4C82] bg-[#EADBCE]/50 font-medium"
                    }`}
                  >
                    {sub.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Brand Filter ── */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-[#EADBCE]">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
              Brand / Store
            </h3>
            {selectedBrands.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className="text-[11px] font-heading font-medium text-[#007F79] hover:text-[#35104A] hover:underline cursor-pointer"
              >
                Clear ({selectedBrands.length})
              </button>
            )}
          </div>

          {availableBrands.length > 5 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B4C82]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-white text-[#35104A] placeholder:text-[#6B4C82]/60 rounded-xl border border-[#EADBCE] focus:border-[#007F79] focus:ring-1 focus:ring-[#007F79]/20 outline-none"
              />
            </div>
          )}

          <div
            ref={bindBrandScrollRef}
            data-lenis-prevent="true"
            onWheel={(e) => {
              e.stopPropagation();
              const container = e.currentTarget;
              if (container.scrollHeight > container.clientHeight) {
                container.scrollTop += e.deltaY;
              }
            }}
            className="max-h-52 overflow-y-auto overscroll-contain space-y-0.5 pr-1 custom-scrollbar"
            style={{
              overscrollBehavior: "contain",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredBrandsList.map((brand, idx) => {
              const isChecked = selectedBrands.includes(brand.name);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleBrand(brand.name)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors touch-manipulation active:scale-[0.99] text-left ${
                    isChecked
                      ? "bg-[#007F79]/10 text-[#007F79] font-heading font-semibold"
                      : "hover:bg-[#FFF8EF] text-[#35104A]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                        isChecked
                          ? "bg-[#007F79] border-[#007F79] text-white"
                          : "border-[#EADBCE] bg-white"
                      }`}
                    >
                      {isChecked && (
                        <Check className="w-2.5 h-2.5 stroke-[2]" />
                      )}
                    </div>
                    <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-[#EADBCE]/50 bg-white flex items-center justify-center pointer-events-none">
                      <SafeImage
                        src={brand.logo}
                        alt={brand.name || "Brand logo"}
                        width={16}
                        height={16}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="truncate">{brand.name}</span>
                  </div>
                  <span className="text-[10px] text-[#6B4C82] font-medium ml-1 shrink-0">
                    ({brand.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Discount Range ── */}
      <div className="space-y-2 pt-4 border-t border-[#EADBCE]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
            Discount
          </h3>
          {minDiscount > 0 && (
            <button
              type="button"
              onClick={() => setMinDiscount(0)}
              className="text-[11px] font-heading font-medium text-[#007F79] hover:text-[#35104A] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          {[
            { label: "70% or more", value: 70 },
            { label: "50% or more", value: 50 },
            { label: "30% or more", value: 30 },
            { label: "All Discounts", value: 0 },
          ].map((item) => {
            const isSelected = minDiscount === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMinDiscount(item.value)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                  isSelected
                    ? "bg-[#007F79]/10 text-[#007F79] font-heading font-semibold border border-[#007F79]/20"
                    : "text-[#35104A] hover:bg-[#FFF8EF] hover:text-[#007F79] font-medium"
                }`}
              >
                <span>{item.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[2] text-[#007F79]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div className="space-y-2 pt-4 border-t border-[#EADBCE]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
            Price Range
          </h3>
          {priceRange !== "all" && (
            <button
              type="button"
              onClick={() => setPriceRange("all")}
              className="text-[11px] font-heading font-medium text-[#007F79] hover:text-[#35104A] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          {[
            { label: "All Prices", value: "all" },
            { label: "Under ₹1,000", value: "under-1000" },
            { label: "₹1,000 - ₹5,000", value: "1000-5000" },
            { label: "₹5,000 - ₹25,000", value: "5000-25000" },
            { label: "Above ₹25,000", value: "above-25000" },
          ].map((item) => {
            const isSelected = priceRange === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setPriceRange(item.value)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                  isSelected
                    ? "bg-[#007F79]/10 text-[#007F79] font-heading font-semibold border border-[#007F79]/20"
                    : "text-[#35104A] hover:bg-[#FFF8EF] hover:text-[#007F79] font-medium"
                }`}
              >
                <span>{item.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[2] text-[#007F79]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#FFFDF9] text-[#35104A] font-sans min-h-screen pb-24 md:pb-16 text-left relative">
      {/* ── 1. FULL-WIDTH EDITORIAL HERO HEADER ── */}
      <div className="w-full bg-gradient-to-b from-[#FFF8EF] to-[#FFFDF9] border-b border-[#EADBCE]/80 px-2.5 sm:px-4 md:px-5 py-2.5 sm:py-3.5">
        <div className="w-full">
          {/* Breadcrumbs - Clean text, no unnecessary home icon */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-[#6B4C82] font-medium mb-1.5"
          >
            <Link href="/" className="hover:text-[#007F79] transition-colors">
              Home
            </Link>
            <span className="text-[#EADBCE]">/</span>
            <Link
              href="/categories"
              className="hover:text-[#007F79] transition-colors"
            >
              Categories
            </Link>
            <span className="text-[#EADBCE]">/</span>
            <span className="text-[#35104A] font-heading font-semibold">
              {categoryInfo?.title}
            </span>
          </nav>

          {/* Title & Subtitle - Clean, human editorial header */}
          <div>
            <h1 className="text-lg sm:text-2xl font-heading font-semibold text-[#35104A] tracking-tight">
              {categoryInfo?.title} Deals &amp; Offers
            </h1>
            <p className="text-xs text-[#6B4C82] mt-0.5 font-normal">
              Verified coupons, exclusive price drops, and store offers updated
              daily.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. FULL-WIDTH 2-COLUMN LAYOUT ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-4">
        <div className="flex items-start gap-3.5 sm:gap-4 lg:gap-4.5">
          {/* ── LEFT DESKTOP FILTER SIDEBAR ── */}
          <aside
            data-lenis-prevent="true"
            className="w-56 lg:w-64 shrink-0 hidden md:block bg-[#FFFDF9] rounded-xl border border-[#EADBCE] shadow-2xs p-3 sm:p-3.5 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto custom-scrollbar overscroll-contain"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-heading font-semibold text-[#35104A]">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#007F79] text-white text-[10px] font-heading font-medium flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-heading font-medium text-[#007F79] hover:text-[#35104A] hover:underline flex items-center gap-1 cursor-pointer"
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
            {/* Top Toolbar: Search + Sort + Tabs */}
            <div className="bg-[#FFFDF9] rounded-xl p-2 sm:p-2.5 border border-[#EADBCE] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4C82]/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search deals in ${categoryInfo?.title || "category"}...`}
                  className="w-full h-9 pl-10 pr-8 bg-white text-xs sm:text-sm text-[#35104A] placeholder:text-[#6B4C82]/60 rounded-xl border border-[#EADBCE] focus:border-[#007F79] focus:ring-1 focus:ring-[#007F79]/15 outline-none transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B4C82] hover:text-[#35104A] p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button + Offer Type Tabs */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-1.5 h-9 px-3 bg-[#FFF8EF] hover:bg-[#EADBCE]/50 text-[#35104A] border border-[#EADBCE] text-xs font-heading font-medium rounded-xl transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#007F79]" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#007F79] text-white text-[9.5px] font-heading font-medium flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Offer Type Tabs */}
                {coupons.length > 0 && (
                  <div className="inline-flex bg-[#FFF8EF] p-0.5 rounded-xl border border-[#EADBCE] shrink-0">
                    <button
                      type="button"
                      onClick={() => setOfferType("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-heading transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        offerType === "all"
                          ? "bg-white text-[#35104A] font-semibold shadow-2xs border border-[#EADBCE]/60"
                          : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                      }`}
                    >
                      All ({coupons.length + affiliateProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferType("deals")}
                      className={`px-3 py-1 rounded-lg text-xs font-heading transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        offerType === "deals"
                          ? "bg-white text-[#007F79] font-semibold shadow-2xs border border-[#EADBCE]/60"
                          : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                      }`}
                    >
                      Deals ({affiliateProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferType("coupons")}
                      className={`px-3 py-1 rounded-lg text-xs font-heading transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        offerType === "coupons"
                          ? "bg-white text-[#007F79] font-semibold shadow-2xs border border-[#EADBCE]/60"
                          : "text-[#6B4C82] hover:text-[#35104A] font-medium"
                      }`}
                    >
                      Coupons ({coupons.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Chips Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-heading font-medium text-[#6B4C82] mr-1">
                  Active:
                </span>

                {selectedSub !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/25">
                    <span>{selectedSub}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSub("all")}
                      className="hover:text-[#35104A] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/25"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrand(b)}
                      className="hover:text-[#35104A] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {minDiscount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/25">
                    <span>{minDiscount}%+ OFF</span>
                    <button
                      type="button"
                      onClick={() => setMinDiscount(0)}
                      className="hover:text-[#35104A] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/25">
                    <span>{priceRange.replace("-", " to ")}</span>
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                      className="hover:text-[#35104A] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-medium bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/25">
                    <span>"{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-[#35104A] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-heading font-medium text-[#6B4C82] hover:text-[#007F79] underline cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs text-[#6B4C82] px-0.5 font-sans">
              <p>
                Showing{" "}
                <strong className="text-[#35104A] font-heading font-semibold">
                  {totalFilteredCount}
                </strong>{" "}
                verified deals
                {selectedSub !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <strong className="text-[#007F79] font-heading font-semibold">
                      {selectedSub}
                    </strong>
                  </span>
                )}
              </p>
            </div>

            {/* ── STORE PROMO CODES (IF ANY) ── */}
            {filteredCoupons.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <h2 className="text-xs sm:text-[13px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
                  Promo Codes ({filteredCoupons.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                  {filteredCoupons.map((coupon) => {
                    const merchantName =
                      coupon.merchantId?.businessName ||
                      coupon.merchantId?.name ||
                      "Partner Store";
                    const merchantLogo =
                      coupon.merchantId?.logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=35104a&color=ffd166&size=64&bold=true`;
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
                        className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-3.5 shadow-2xs hover:shadow-[0_8px_20px_rgba(53,16,74,0.08)] hover:border-[#007F79]/50 transition-all duration-300 flex flex-col justify-between group text-left cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <SafeImage
                                src={merchantLogo}
                                alt={merchantName || "Merchant logo"}
                                width={32}
                                height={32}
                                className="w-full h-full object-contain rounded-md"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-heading font-semibold text-[#35104A] truncate group-hover:text-[#007F79] transition-colors">
                                {merchantName}
                              </p>
                              <span className="text-[9.5px] font-medium text-[#007F79]">
                                Verified Store
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-heading font-semibold uppercase tracking-tight bg-[#FF8C05]/10 text-[#FF8C05] border border-[#FF8C05]/20 shrink-0">
                            {discountBadge}
                          </span>
                        </div>

                        <div className="my-2.5 space-y-1">
                          <h3 className="text-xs sm:text-[13px] font-heading font-semibold text-[#35104A] leading-snug line-clamp-2">
                            {coupon.title}
                          </h3>
                          {coupon.description && (
                            <p className="text-[11px] text-[#6B4C82] line-clamp-2 font-normal leading-relaxed">
                              {coupon.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-dashed border-[#EADBCE] flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#6B4C82] font-medium">
                            {coupon.totalClaims
                              ? `${coupon.totalClaims} Claimed`
                              : "Verified Active"}
                          </span>

                          {hasCode ? (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopyCode(e, coupon.code, coupon._id)
                              }
                              className={`px-2.5 py-1 text-xs font-heading font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                                isCopied
                                  ? "bg-[#007F79] text-white border-[#007F79] shadow-2xs"
                                  : "bg-[#FFF8EF] hover:bg-[#35104A] hover:text-white text-[#35104A] border-dashed border-[#007F79]/50 hover:border-[#35104A] active:scale-95 shadow-2xs"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>COPIED</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-mono tracking-wider">
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
                              className="px-2.5 py-1 bg-[#007F79] hover:bg-[#00605B] text-white border border-[#007F79] active:scale-95 text-xs font-heading font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>Get Deal</span>
                              <ExternalLink className="w-3 h-3 text-white/80" />
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
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-[13px] font-heading font-semibold uppercase tracking-wider text-[#35104A]">
                    Product Deals &amp; Offers ({filteredAffiliate.length})
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
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
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADBCE] p-10 sm:p-14 text-center space-y-3 shadow-2xs">
                <h3 className="text-sm sm:text-base font-heading font-semibold text-[#35104A]">
                  No matching deals found
                </h3>
                <p className="text-xs text-[#6B4C82] max-w-sm mx-auto leading-relaxed">
                  No deals match your selected filters. Try clearing your
                  filters or search keywords to see all available offers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#007F79] hover:bg-[#00605B] text-white text-xs font-heading font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-[100] flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#1D062B]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter options"
            className="relative w-full max-w-[320px] sm:max-w-xs bg-[#FFFDF9] border-l border-[#EADBCE] h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EADBCE] bg-[#FFF8EF] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-heading font-semibold text-[#35104A]">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#007F79] text-white text-[10px] font-heading font-medium flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-[#6B4C82] hover:text-[#35104A] hover:bg-[#EADBCE]/40 cursor-pointer touch-manipulation active:scale-90 transition-all"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto p-4 custom-scrollbar overscroll-contain"
              style={{
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
            >
              {FilterPanelContent}
            </div>

            {/* Footer Actions (Sticky Bottom with iOS Home-Bar Safe Inset) */}
            <div className="p-3.5 sm:p-4 border-t border-[#EADBCE] bg-[#FFF8EF] shrink-0 flex items-center gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2 rounded-xl border border-[#EADBCE] bg-white text-xs font-heading font-semibold text-[#35104A] hover:bg-[#FFF8EF] cursor-pointer touch-manipulation active:scale-95 transition-all"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#007F79] hover:bg-[#00605B] text-xs font-heading font-semibold text-white shadow-xs cursor-pointer touch-manipulation active:scale-95 transition-all"
              >
                Apply ({totalFilteredCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TRUST & SAVINGS GUIDE / FAQS SECTION ── */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 mt-7">
        <div className="bg-[#FFFDF9] rounded-xl p-4 sm:p-6 border border-[#EADBCE] shadow-2xs">
          <div className="mb-4 text-left">
            <span className="inline-block text-[11px] font-heading font-medium text-[#007F79] bg-[#007F79]/10 border border-[#007F79]/20 px-3 py-0.5 rounded-full mb-1.5">
              Shopping Guide
            </span>
            <h2 className="text-base sm:text-lg font-heading font-semibold text-[#35104A]">
              How to Save More in {categoryInfo?.title}
            </h2>
            <p className="text-xs text-[#6B4C82] mt-0.5">
              Helpful answers and verified tips to maximize your discount
              savings on Vouchiqo.
            </p>
          </div>

          <div className="divide-y divide-[#EADBCE]/60">
            {currentFaqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-2.5 text-left">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                  >
                    <span className="text-xs sm:text-[13px] font-heading font-semibold text-[#35104A] group-hover:text-[#007F79] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6B4C82] group-hover:text-[#007F79] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2 text-xs sm:text-[13px] text-[#6B4C82] leading-relaxed font-normal">
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
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-[#35104A] text-white hover:bg-[#007F79] shadow-lg shadow-[#35104A]/25 border border-white/10 transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
