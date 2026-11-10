"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";
import { TODAY_PRODUCT_DEALS } from "./constants";

export const DealsOfTheDay = ({ affiliateProducts = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Format products list directly from props (fallback to curated deals if prop is empty)
  const displayItems = useMemo(() => {
    if (affiliateProducts && affiliateProducts.length > 0) {
      return affiliateProducts.map((p) => ({
        _id: p._id,
        title:
          typeof p.title === "string"
            ? p.title
            : p.title?.title || "Special Deal",
        originalPrice: p.originalPrice || 0,
        discountPrice: p.discountPrice || 0,
        discountPercentage: p.discountPercentage || 0,
        discountText:
          p.discountText ||
          (p.discountPercentage ? `${p.discountPercentage}% OFF` : null),
        merchantName:
          p.merchantId?.businessName || p.merchantName || "Partner Brand",
        merchantLogo:
          p.merchantId?.logo || p.merchantLogo || "/placeholder-brand.webp",
        productImage: p.imageUrl || p.productImage,
        imageUrl: p.imageUrl,
        affiliateUrl: p.affiliateUrl || p.href,
      }));
    }
    return TODAY_PRODUCT_DEALS;
  }, [affiliateProducts]);

  const itemsPerPage = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(displayItems.length / itemsPerPage);

  // Auto-scroll loop every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slides = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalSlides; i++) {
      list.push(displayItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
    }
    return list;
  }, [displayItems, itemsPerPage, totalSlides]);

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

  // Drag and swipe gestures
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
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
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
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    isDragging.current = false;
  };

  if (displayItems.length === 0) return null;

  return (
    <section className="text-left w-full overflow-hidden select-none pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-[#F72853] tracking-tight">
          Affiliate Products
        </h2>
        <Link
          href="/deals"
          className="text-xs font-normal text-[#F72853] hover:underline transition-all"
        >
          View All →
        </Link>
      </div>

      {/* Slider Viewport Container */}
      <div className="relative w-full pb-2">
        {/* Left Chevron */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md items-center justify-center hover:bg-white text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Viewport */}
        <div
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing py-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className="w-full flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
          >
            {slides.map((slideItems, slideIdx) => (
              <div key={slideIdx} className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 items-stretch">
                  {slideItems.map((product, idx) => (
                    <ProductOfferCard
                      key={product._id || idx}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chevron */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md items-center justify-center hover:bg-white text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default DealsOfTheDay;
