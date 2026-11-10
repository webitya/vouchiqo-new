"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductOfferCard from "@/components/shared/cards/ProductOfferCard";
import { TODAY_PRODUCT_DEALS } from "./constants";

export const DealsOfTheDay = ({ affiliateProducts = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Auto-scroll loop every 5 seconds (pauses on hover)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const slides = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalSlides; i++) {
      const chunk = displayItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
      if (chunk.length < itemsPerPage && displayItems.length > 0) {
        let wrapIdx = 0;
        while (chunk.length < itemsPerPage) {
          chunk.push(displayItems[wrapIdx % displayItems.length]);
          wrapIdx++;
        }
      }
      list.push(chunk);
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
    <section className="text-left w-full select-none pb-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-2.5">
        <h2 className="text-base sm:text-lg md:text-xl font-heading font-bold text-[#FF2E63] tracking-tight">
          Affiliate Products
        </h2>
        <Link
          href="/deals"
          className="text-xs font-sans font-semibold text-[#007F79] hover:text-[#35104A] hover:underline transition-all"
        >
          View All →
        </Link>
      </div>

      {/* Slider Viewport Container */}
      <div
        className="relative w-full pb-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Chevron */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute -left-2.5 sm:-left-3.5 lg:-left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#35104A] hover:bg-[#FF2E63] text-white border border-white/30 shadow-[0_4px_14px_rgba(53,16,74,0.4)] items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
          </button>
        )}

        {/* Viewport */}
        <div
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing py-1"
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-3.5 items-stretch">
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
            className="hidden sm:flex absolute -right-2.5 sm:-right-3.5 lg:-right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#35104A] hover:bg-[#FF2E63] text-white border border-white/30 shadow-[0_4px_14px_rgba(53,16,74,0.4)] items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </section>
  );
};

export default DealsOfTheDay;
