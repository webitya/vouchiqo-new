// components/landing/PopularStores.jsx
"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BrandGridItem from "@/components/shared/cards/BrandGridItem";
import SafeImage from "@/components/shared/SafeImage";
import TwitterVerifiedBadge from "@/components/shared/TwitterVerifiedBadge";

const CATEGORY_FALLBACK_BANNERS = {
  jewellery:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop",
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  grocery:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  fitness:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
  "home-improvement":
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
  travel:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
  education:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
};

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop";

// Pure helper to filter out internal platform / test dummy merchants
const isRealBrand = (m) => {
  if (!m) return false;
  const name = (m.businessName || m.name || "").toLowerCase().trim();
  const slug = (m.slug || "").toLowerCase().trim();
  return (
    !name.includes("vouchiqo") &&
    !slug.includes("vouchiqo") &&
    !name.startsWith("test")
  );
};

export default function PopularStores({ merchants = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Map database merchants into standard structure with fallback support
  const finalStoresList = useMemo(() => {
    const validMerchants = (merchants || []).filter(isRealBrand);
    const listToMap =
      validMerchants.length > 0 ? validMerchants : merchants || [];
    return listToMap.map((m) => {
      const rawCat = m.category || "Deals";
      const cleanCat =
        rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();

      return {
        name: m.businessName || m.name || "Store Partner",
        logo: m.logo || "/placeholder-brand.png",
        href: `/brand/${m.slug}`,
        coupons: m.totalCoupons || 0,
        banner: m.banner || m.shopImage,
        category: cleanCat,
        discount: m.maxDiscount
          ? `Up to ${m.maxDiscount}% OFF`
          : m.totalCoupons > 0
            ? `${m.totalCoupons} LIVE ${m.totalCoupons === 1 ? "OFFER" : "OFFERS"}`
            : null,
        isVerified: m.isVerified ?? m.status === "approved",
        totalOffers: (m.totalCoupons || 0) + (m.totalRedemptions || 0),
      };
    });
  }, [merchants]);

  // Candidate pool of eligible stores: prioritize active coupons + logo + banner of real brands
  const eligibleCandidates = useMemo(() => {
    if (!merchants || merchants.length === 0) return [];

    const validMerchants = merchants.filter(isRealBrand);
    const pool = validMerchants.length > 0 ? validMerchants : merchants;

    const topTier = pool.filter(
      (m) => (m.totalCoupons || 0) > 0 && m.logo && (m.banner || m.shopImage),
    );
    if (topTier.length > 0) return topTier;

    const secondTier = pool.filter((m) => (m.totalCoupons || 0) > 0 && m.logo);
    if (secondTier.length > 0) return secondTier;

    const thirdTier = pool.filter((m) => (m.totalCoupons || 0) > 0);
    if (thirdTier.length > 0) return thirdTier;

    return pool;
  }, [merchants]);

  // Store of the Day changes once every 24 hours (consistent throughout the day)
  const storeOfTheDay = useMemo(() => {
    if (!eligibleCandidates || eligibleCandidates.length === 0) {
      return merchants?.[0] || null;
    }
    // 24-hour day index based on UTC epoch days
    const dayNumber = Math.floor(Date.now() / 86400000);
    // Hash to distribute stores evenly across days without consecutive repeats
    let x = dayNumber | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    const hash = (x ^ (x >>> 16)) >>> 0;
    return eligibleCandidates[hash % eligibleCandidates.length];
  }, [eligibleCandidates, merchants]);

  const sodName =
    storeOfTheDay?.businessName || storeOfTheDay?.name || "Featured Partner";
  const sodCategory = storeOfTheDay?.category
    ? `${storeOfTheDay.category.charAt(0).toUpperCase() + storeOfTheDay.category.slice(1).toLowerCase()} Deals`
    : "Verified Deals";
  const sodCatKey = (storeOfTheDay?.category || "").toLowerCase().trim();
  const sodFallback = CATEGORY_FALLBACK_BANNERS[sodCatKey] || DEFAULT_BANNER;
  const sodBanner =
    storeOfTheDay?.banner || storeOfTheDay?.shopImage || sodFallback;
  const sodLogo = storeOfTheDay?.logo || "/placeholder-brand.webp";
  const sodHref = storeOfTheDay ? `/brand/${storeOfTheDay.slug}` : "/deals";
  const sodCoupons = storeOfTheDay ? storeOfTheDay.totalCoupons || 0 : 0;
  const sodMaxDiscount = storeOfTheDay?.maxDiscount
    ? `Up to ${storeOfTheDay.maxDiscount}% OFF`
    : null;

  // Responsive grouping: 2 cols x 3 rows = 6 on phone, 3 cols x 3 rows = 9 on tablet, 4 cols x 3 rows = 12 on desktop
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(12);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.max(
    1,
    Math.ceil(finalStoresList.length / itemsPerPage),
  );

  // Reset index if out of range
  useEffect(() => {
    if (selectedIndex >= totalSlides) {
      setSelectedIndex(0);
    }
  }, [totalSlides, selectedIndex]);

  // Auto-rotation effect for slides (6 seconds interval, infinite loop)
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slides = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalSlides; i++) {
      list.push(
        finalStoresList.slice(i * itemsPerPage, (i + 1) * itemsPerPage),
      );
    }
    return list;
  }, [finalStoresList, itemsPerPage, totalSlides]);

  // Swipe/drag gestures
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    const dragEnd = e.changedTouches[0].clientX;
    const diff = dragStart.current - dragEnd;
    if (diff > 45) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -45) {
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    isDragging.current = false;
  };

  const handleMouseDown = (e) => {
    dragStart.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    const dragEnd = e.clientX;
    const diff = dragStart.current - dragEnd;
    if (diff > 45) {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    } else if (diff < -45) {
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    isDragging.current = false;
  };

  const handlePrev = useCallback(
    (e) => {
      e?.preventDefault();
      setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    },
    [totalSlides],
  );

  const handleNext = useCallback(
    (e) => {
      e?.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    },
    [totalSlides],
  );

  return (
    <section className="g-pop-store w-full select-none text-left overflow-hidden">
      {/* Custom Section Header with Navigation Controls */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F72853] tracking-tight">
            Popular Stores
          </h2>
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {finalStoresList.length} Stores
          </span>
        </div>

        {totalSlides > 1 && (
          <div className="flex items-center gap-2">
            {/* Slide dots indicator */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    selectedIndex === idx
                      ? "w-4.5 bg-[#F72853]"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 ml-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#F72853] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                aria-label="Previous stores"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#F72853] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                aria-label="Next stores"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile / Tablet View (< lg): Compact & Simple Store of the Day ── */}
      {storeOfTheDay && (
        <div className="block lg:hidden mb-2.5 sm:mb-3">
          <Link
            href={sodHref}
            prefetch={true}
            className="relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50/70 via-white to-pink-50/30 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all duration-200 overflow-hidden no-underline group select-none"
          >
            {/* Subtle banner accent watermark on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden pointer-events-none opacity-20">
              <SafeImage
                src={sodBanner}
                alt={sodName}
                fill
                fallbackSrc={sodFallback}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>

            {/* Brand Logo */}
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-white p-1 border border-slate-150 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform z-10">
              <SafeImage
                src={sodLogo}
                alt={sodName}
                width={52}
                height={52}
                className="max-h-full max-w-full object-contain rounded-lg"
                fallbackSrc="/placeholder-brand.png"
              />
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 z-10">
              {/* Badges line: compact, no gemini icon, single line */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-extrabold bg-[#F72853] text-white tracking-wide uppercase shadow-2xs whitespace-nowrap shrink-0">
                  Store of the Day
                </span>
                <span className="inline-flex items-center text-[9.5px] sm:text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-full capitalize truncate">
                  {sodCategory}
                </span>
              </div>

              {/* Brand Name */}
              <div className="flex items-center gap-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#F72853] transition-colors truncate">
                  {sodName}
                </h3>
                <TwitterVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
              </div>

              {/* Highlights & Discount */}
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                <span className="font-extrabold text-[#F72853] whitespace-nowrap">
                  {sodCoupons > 0
                    ? `${sodCoupons} Live Offers`
                    : "Active Deals"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-emerald-600 truncate">
                  {sodMaxDiscount || "Verified Partner"}
                </span>
              </div>
            </div>

            {/* Subtle Chevron indicator on right */}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#F72853] group-hover:translate-x-0.5 transition-all shrink-0 z-10 mr-0.5" />
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 mt-1 sm:mt-2 items-stretch">
        {/* ── Store of the Day Card ── */}
        <div className="hidden lg:flex lg:w-1/4 shrink-0 flex-col self-stretch">
          <Link
            href={sodHref}
            prefetch={true}
            className="flex-1 relative flex flex-col no-underline cursor-pointer rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs group transition-all duration-300 hover:shadow-[0_12px_28px_rgba(247,40,83,0.16)] hover:border-[#F72853]/60 h-full min-h-0"
          >
            {/* 1. Hero Visual Cover (Rich, vibrant banner - 100% opacity with subtle dark scrim) */}
            <div className="relative w-full h-44 sm:h-48 md:h-52 overflow-hidden bg-slate-900 shrink-0">
              <SafeImage
                src={sodBanner}
                alt={sodName}
                fill
                priority
                fallbackSrc={sodFallback}
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Soft dark gradient: protects badge legibility while keeping banner imagery vibrant & clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/45 pointer-events-none" />

              {/* Top Floating Badges */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#F72853] text-white tracking-wider uppercase shadow-xs">
                  Store Of The Day
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-2xs capitalize">
                  {sodCategory}
                </span>
              </div>
            </div>

            {/* 2. Elevated Brand Logo Seam */}
            <div className="relative -mt-9 sm:-mt-10 px-3.5 sm:px-4.5 z-20 flex items-end justify-between">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-lg ring-4 ring-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300">
                <SafeImage
                  src={sodLogo}
                  alt={sodName}
                  width={72}
                  height={72}
                  className="max-h-full max-w-full object-contain rounded-xl"
                  fallbackSrc="/placeholder-brand.png"
                />
              </div>

              <div className="mb-1 flex items-center bg-emerald-50 border border-emerald-200/90 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs">
                <span>Verified Partner</span>
              </div>
            </div>

            {/* 3. Card Body: Brand Name & Highlights */}
            <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4.5 pt-2 sm:pt-2.5">
              {/* Brand Name & Category */}
              <div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#F72853] transition-colors leading-tight tracking-tight line-clamp-1">
                    {sodName}
                  </h3>
                  <TwitterVerifiedBadge className="w-4 h-4 shrink-0" />
                </div>
                <p className="text-[11.5px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                  Exclusive verified discounts & promotional codes
                </p>
              </div>

              {/* Special Highlights Box */}
              <div className="my-auto py-3">
                <div className="bg-gradient-to-br from-rose-50/70 via-pink-50/30 to-amber-50/40 border border-rose-100/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="text-[#F72853] uppercase tracking-wider text-[10.5px] font-extrabold">
                      Partner Highlights
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 border border-slate-200/80 shadow-2xs">
                      {sodMaxDiscount || "Verified Partner"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5 text-center">
                    <div className="bg-white/95 backdrop-blur-xs rounded-xl p-2 border border-slate-100 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Live Offers
                      </div>
                      <div className="text-sm font-black text-[#F72853]">
                        {sodCoupons > 0 ? `${sodCoupons} Deals` : "Active"}
                      </div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-xs rounded-xl p-2 border border-slate-100 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Access
                      </div>
                      <div className="text-sm font-black text-emerald-600">
                        {sodMaxDiscount
                          ? sodMaxDiscount.replace(/^Up to\s*/i, "")
                          : "100% Free"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="pt-1 mt-auto">
                <div className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#F72853] to-[#e01e47] text-white font-bold text-xs sm:text-sm text-center shadow-md shadow-rose-500/20 group-hover:shadow-lg group-hover:shadow-rose-500/30 group-hover:from-[#e01e47] group-hover:to-[#c7173e] transition-all flex items-center justify-center gap-2">
                  <span>
                    {sodCoupons > 0
                      ? `Explore All ${sodCoupons} Offers`
                      : "Explore Store Offers"}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Sliding Grid of Partner Stores (2 cols on mobile, 3 on tablet, 4 on desktop) ── */}
        <div className="gp-store-wrap w-full lg:w-3/4 overflow-hidden">
          <div
            className="vouchiqo-carousel-viewport w-full cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div
              className="vouchiqo-carousel-container flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
            >
              {slides.map((slideStores, slideIdx) => (
                <div
                  key={slideIdx}
                  className="vouchiqo-carousel-slide w-full flex-shrink-0"
                >
                  <div className="gp-store-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {slideStores.map((store, idx) => (
                      <BrandGridItem
                        key={idx}
                        name={store.name}
                        logo={store.logo}
                        banner={store.banner}
                        category={store.category}
                        discount={store.discount}
                        href={store.href}
                        coupons={store.coupons}
                        isVerified={store.isVerified}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
