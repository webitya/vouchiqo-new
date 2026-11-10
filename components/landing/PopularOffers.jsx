"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

const CATEGORY_GRADIENTS = {
  fashion: "linear-gradient(135deg, #f472b6, #db2777)",
  food: "linear-gradient(135deg, #fb923c, #ea580c)",
  electronics: "linear-gradient(135deg, #00A69D, #007F79)",
  beauty: "linear-gradient(135deg, #f472b6, #e11d48)",
  travel: "linear-gradient(135deg, #2dd4bf, #0d9488)",
  home: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  "home-improvement": "linear-gradient(135deg, #fbbf24, #d97706)",
  fitness: "linear-gradient(135deg, #34d399, #059669)",
  education: "linear-gradient(135deg, #818cf8, #4f46e5)",
  "kids-baby": "linear-gradient(135deg, #fbcfe8, #ec4899)",
  jewellery: "linear-gradient(135deg, #fde047, #ca8a04)",
  automotive: "linear-gradient(135deg, #9ca3af, #4b5563)",
  entertainment: "linear-gradient(135deg, #c084fc, #7e22ce)",
  grocery: "linear-gradient(135deg, #a7f3d0, #059669)",
  finance: "linear-gradient(135deg, #6ee7b7, #047857)",
  other: "linear-gradient(135deg, #38bdf8, #0284c7)",
};

const PopularOfferCard = memo(function PopularOfferCard({ coupon }) {
  const val = coupon.rawDiscountValue || coupon.discountValue;
  const isNum =
    val !== null &&
    val !== undefined &&
    val !== "" &&
    !Number.isNaN(Number(val));
  let discountFormatted = "SPECIAL DEAL";

  if (coupon.offerType === "deal" && coupon.salePrice) {
    if (coupon.originalPrice && coupon.originalPrice > coupon.salePrice) {
      const pct = Math.round(
        ((coupon.originalPrice - coupon.salePrice) / coupon.originalPrice) *
          100,
      );
      discountFormatted = `${pct}% OFF`;
    } else {
      discountFormatted = `₹${coupon.salePrice} DEAL`;
    }
  } else if (coupon.discountType === "percentage" && isNum) {
    discountFormatted = `${val}% OFF`;
  } else if (coupon.discountType === "fixed" && isNum) {
    discountFormatted = `₹${val} OFF`;
  } else if (coupon.specialOfferType) {
    discountFormatted = coupon.specialOfferType.toUpperCase();
  } else if (typeof val === "string" && val.trim() && !isNum) {
    discountFormatted = val.toUpperCase();
  } else if (val) {
    discountFormatted = isNum ? `${val}% OFF` : String(val).toUpperCase();
  }

  const merchantName =
    coupon.merchantId?.businessName || coupon.merchantId?.name || "Partner";

  const coverImage =
    coupon.image ||
    coupon.banner ||
    coupon.merchantId?.banner ||
    coupon.merchantId?.logo ||
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop";

  const logoUrl =
    coupon.merchantId?.logo || coupon.logo || "/placeholder-brand.webp";

  const isExclusive = coupon.isFeatured;

  return (
    <Link
      href={`/deals/${coupon._id}`}
      prefetch={true}
      className="group relative flex flex-col rounded-xl sm:rounded-2xl no-underline cursor-pointer border border-[#EADBCE] bg-[#FFF8EF] shadow-2xs hover:shadow-md hover:border-[#FF2E63]/50 transition-all duration-300 select-none text-left overflow-hidden h-full font-sans"
    >
      {/* 16:9 Aspect Ratio Image Header */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#35104A] shrink-0">
        <SafeImage
          src={coverImage}
          alt={coupon.title || "Offer Banner"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A2B]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Box with Dynamic Depth */}
      <div className="relative flex-1 flex flex-col justify-between bg-[#FFF8EF] px-2.5 sm:px-3.5 pt-4 sm:pt-4.5 pb-2.5 sm:pb-3">
        {/* Floating Merchant Circular Logo */}
        <div
          className="absolute flex items-center justify-center bg-white rounded-full border border-[#EADBCE] shadow-md p-0.5 group-hover:border-[#FF2E63]/40 group-hover:scale-105 transition-all"
          style={{
            width: "32px",
            height: "32px",
            top: "-16px",
            left: "12px",
            zIndex: 10,
          }}
        >
          <SafeImage
            src={logoUrl}
            alt={merchantName || "Logo"}
            width={32}
            height={32}
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
          />
        </div>

        {/* Details Area */}
        <div>
          {/* Discount Title */}
          <div className="mb-0.5">
            <p className="text-left text-[10.5px] sm:text-[12px] font-heading font-extrabold uppercase tracking-tight text-[#FF2E63] leading-tight truncate">
              {isExclusive ? "VOUCHIQO EXCLUSIVE" : discountFormatted}
            </p>
          </div>

          {/* Coupon Description / Title */}
          <div className="mb-1 sm:mb-1.5">
            <p className="text-left text-[10.5px] sm:text-[11.5px] text-[#35104A] group-hover:text-[#FF2E63] transition-colors leading-snug font-medium line-clamp-2 h-[2.5em]">
              {coupon.title}
            </p>
          </div>
        </div>

        {/* Action Button Area with increased height & responsive layout */}
        <div className="mt-auto pt-1 sm:pt-1.5">
          <span className="flex items-center justify-center w-full rounded-lg h-7.5 sm:h-8 md:h-8.5 px-2 text-center text-[10px] sm:text-[11px] font-heading font-bold uppercase tracking-wider text-white transition-all shadow-2xs group-hover:shadow-xs group-hover:bg-[#00605B] bg-[#007F79]">
            Claim Now
          </span>
        </div>
      </div>
    </Link>
  );
});

/* ============================================
   POPULAR OFFERS SECTION (Single-Row Carousel)
   ============================================ */
export default function PopularOffers({ coupons = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Swipe/drag refs
  const dragStart = useRef(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalSwipe = useRef(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finalItems = coupons.length > 0 ? coupons : [];
  const totalSlides = Math.ceil(finalItems.length / itemsPerPage);

  useEffect(() => {
    if (selectedIndex >= totalSlides && totalSlides > 0) {
      setSelectedIndex(0);
    }
  }, [totalSlides, selectedIndex]);

  // Auto-rotation effect for slides (5 seconds interval, pause on hover/drag)
  useEffect(() => {
    if (totalSlides <= 1 || isDragging.current || isHovered) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const slides = useMemo(() => {
    if (!finalItems.length) return [];
    const list = [];
    for (let i = 0; i < totalSlides; i++) {
      const chunk = finalItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
      // If the chunk has fewer than itemsPerPage, wrap around from the beginning so it looks infinite with no empty slots
      if (chunk.length < itemsPerPage && finalItems.length > 0) {
        let wrapIdx = 0;
        while (chunk.length < itemsPerPage) {
          chunk.push(finalItems[wrapIdx % finalItems.length]);
          wrapIdx++;
        }
      }
      list.push(chunk);
    }
    return list;
  }, [finalItems, itemsPerPage, totalSlides]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Touch and Drag Handlers for Mobile & Desktop
  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - dragStart.current;
    const diffY = currentY - dragStartY.current;

    if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
      hasMoved.current = true;
    }

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = false;
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragOffset < -45) {
      handleNext();
    } else if (dragOffset > 45) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleMouseDown = (e) => {
    dragStart.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.clientX - dragStart.current;
    if (Math.abs(diffX) > 6) {
      hasMoved.current = true;
    }
    setDragOffset(diffX);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragOffset < -45) {
      handleNext();
    } else if (dragOffset > 45) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setDragOffset(0);
    }
  };

  if (finalItems.length === 0) return null;

  return (
    <section className="g-sub-banner text-left w-full select-none relative">
      {/* Custom Section Header */}
      <div className="flex justify-between items-center mb-2 sm:mb-2.5">
        <h2 className="text-base sm:text-lg md:text-xl font-heading font-bold text-[#FF2E63] tracking-tight">
          Popular Offers of the Day
        </h2>
      </div>

      {/* Carousel viewport & slides */}
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseLeave();
        }}
      >
        {/* Left Side Chevron for Desktop */}
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
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className={`w-full flex ${
              isDragging.current
                ? "transition-none"
                : "transition-transform duration-500 ease-in-out"
            }`}
            style={{
              transform: `translateX(calc(-${selectedIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {slides.map((slideItems, slideIdx) => (
              <div key={slideIdx} className="w-full flex-shrink-0 min-w-full">
                {/* Single Row: 2 columns on mobile, 4 columns on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 items-stretch">
                  {slideItems.map((coupon, cardIdx) => (
                    <PopularOfferCard
                      key={`${coupon._id || cardIdx}-${slideIdx}-${cardIdx}`}
                      coupon={coupon}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Chevron for Desktop */}
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
}
