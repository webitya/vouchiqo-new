"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

const CATEGORY_GRADIENTS = {
  fashion: "linear-gradient(135deg, #f472b6, #db2777)",
  food: "linear-gradient(135deg, #fb923c, #ea580c)",
  electronics: "linear-gradient(135deg, #60a5fa, #2563eb)",
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
      className="group relative flex flex-col rounded-xl no-underline cursor-pointer border border-slate-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_20px_rgba(247,40,83,0.14)] hover:border-[#F72853] transition-all duration-300 select-none text-left overflow-hidden h-full"
    >
      {/* 1920x1080 (16:9) Aspect Ratio Image Header */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 shrink-0">
        <SafeImage
          src={coverImage}
          alt={coupon.title || "Offer Banner"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Box with Dynamic Depth */}
      <div className="relative flex-1 flex flex-col justify-between bg-white px-3 sm:px-4 pt-5 sm:pt-6 pb-3 sm:pb-3.5">
        {/* Floating Merchant Circular Logo */}
        <div
          className="absolute flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-md p-0.5 group-hover:border-[#F72853]/40 transition-colors"
          style={{
            width: "38px",
            height: "38px",
            top: "-19px",
            left: "14px",
            zIndex: 10,
          }}
        >
          <SafeImage
            src={logoUrl}
            alt={merchantName || "Logo"}
            width={38}
            height={38}
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
          />
        </div>

        {/* Details Area */}
        <div>
          {/* Discount Title */}
          <div className="mb-0.5">
            <p className="text-left text-[11.5px] sm:text-[13px] font-medium uppercase tracking-tight text-[#F72853] leading-tight">
              {isExclusive ? "VOUCHIQO EXCLUSIVE" : discountFormatted}
            </p>
          </div>

          {/* Coupon Description / Title */}
          <div className="mb-1.5 sm:mb-2">
            <p className="text-left text-[11px] sm:text-xs text-slate-800 group-hover:text-[#F72853] transition-colors leading-snug font-normal line-clamp-2">
              {coupon.title}
            </p>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="mt-auto pt-1">
          {/* Mobile "GRAB NOW" */}
          <div className="sm:hidden">
            <span className="text-left text-[10px] font-medium uppercase tracking-wider text-[#F72853]">
              GRAB NOW &rarr;
            </span>
          </div>

          {/* Desktop Claim Button */}
          <div className="hidden sm:block">
            <span
              className="block w-full rounded-md py-1 text-center text-[11px] font-normal uppercase tracking-wider text-white transition-all shadow-2xs group-hover:brightness-95"
              style={{ backgroundColor: "#3E80DD" }}
            >
              Claim now
            </span>
          </div>
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

  // Auto-rotation effect for slides (6 seconds interval)
  useEffect(() => {
    if (totalSlides <= 1 || isDragging.current) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slides = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalSlides; i++) {
      list.push(finalItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
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
      <div className="flex justify-between items-center mb-3.5 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-[#F72853] tracking-tight">
          Popular Offers of the Day
        </h2>
      </div>

      {/* Carousel viewport & slides */}
      <div className="relative w-full">
        {/* Left Side Chevron for Desktop */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
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
          onMouseLeave={handleMouseLeave}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 items-stretch">
                  {slideItems.map((coupon) => (
                    <PopularOfferCard key={coupon._id} coupon={coupon} />
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
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Slide dots at bottom center */}
      {totalSlides > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`transition-all duration-300 ease-in-out rounded-full cursor-pointer h-1.5 ${
                i === selectedIndex
                  ? "w-7 bg-blue-600 opacity-100"
                  : "w-1.5 bg-slate-300 opacity-50 hover:opacity-100 hover:bg-blue-600"
              }`}
              onClick={() => setSelectedIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
