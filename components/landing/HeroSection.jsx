"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export function HeroSection({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);

  // Swipe/drag refs
  const dragStart = useRef(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalSwipe = useRef(null);
  const hasMoved = useRef(false);

  // Bottom logos scroll refs
  const thumbTrackRef = useRef(null);
  const thumbRefs = useRef([]);
  const isFirstMount = useRef(true);

  const slides = useMemo(() => {
    const dbBanners = (banners || []).filter(
      (b) =>
        b.slot === "hero" ||
        b.slot === "left-hero" ||
        b.slot === "top-hero" ||
        b.slot === "top" ||
        !b.slot,
    );
    // Sort strictly by priority descending (highest priority first) - support all 50+ banners
    const sorted = [...dbBanners].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );
    return sorted.map((b, idx) => ({ id: b._id || idx, ...b }));
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (!autoRotate || slides.length <= 1 || isDragging.current) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRotate, slides.length]);

  // Function to smoothly center the active bottom logo inside the scroll container
  const scrollToThumb = useCallback((index) => {
    const container = thumbTrackRef.current;
    const item = thumbRefs.current[index];
    if (!container || !item) return;

    const containerWidth = container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;

    // Centering formula: calculates target scroll position so active item is centered
    const targetScrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  }, []);

  // Scroll active logo into view when slide changes (deferred to rAF to avoid forced reflow)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const rafId = requestAnimationFrame(() => {
      scrollToThumb(currentSlide);
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentSlide, scrollToThumb]);

  const handlePrev = useCallback(() => {
    setAutoRotate(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setAutoRotate(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleBrandClick = (idx) => {
    setAutoRotate(false);
    setCurrentSlide(idx);
    scrollToThumb(idx);
  };

  // Touch and Drag handlers for main banner
  const handleTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasMoved.current = false;
    isHorizontalSwipe.current = null;
    setAutoRotate(false);
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
    setAutoRotate(false);
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

  // Scroll bottom logos bar manually left/right
  const scrollThumbBar = (direction) => {
    const container = thumbTrackRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If no DB banners exist for Hero Section
  if (slides.length === 0) {
    return (
      <div className="w-full flex flex-col select-none">
        <section className="select-none w-full text-left">
          <div className="w-full rounded-md overflow-hidden border border-slate-200/80 bg-slate-950 h-[200px] sm:h-[300px] md:h-[380px] flex flex-col items-center justify-center text-white p-6 text-center">
            <ImageIcon className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-300">
              No Banners Available
            </h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col select-none">
      {/* Full Width Banners Section */}
      <section className="select-none w-full text-left">
        <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm relative group border border-slate-200/80 bg-slate-950 h-[180px] xs:h-[210px] sm:h-[280px] md:h-[360px] lg:h-[425px] xl:h-[465px] 2xl:h-[490px] max-h-[500px]">
          {/* Viewport for horizontal sliding */}
          <div
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`flex h-full w-full will-change-transform ${
                isDragging.current
                  ? "transition-none"
                  : "transition-transform duration-500 ease-in-out"
              }`}
              style={{
                transform:
                  dragOffset !== 0
                    ? `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`
                    : `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {slides.map((slide, sIdx) => {
                const isExternal =
                  slide.link?.startsWith("http://") ||
                  slide.link?.startsWith("https://");
                const hasText = Boolean(
                  (slide.title && slide.title.trim() !== "") ||
                    (slide.subtitle && slide.subtitle.trim() !== "") ||
                    (slide.buttonText && slide.buttonText.trim() !== ""),
                );

                const linkContent = (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <SafeImage
                      src={
                        slide.image &&
                        typeof slide.image === "string" &&
                        slide.image.trim() !== ""
                          ? slide.image
                          : slide.imageUrl &&
                              typeof slide.imageUrl === "string" &&
                              slide.imageUrl.trim() !== ""
                            ? slide.imageUrl
                            : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={slide.title || slide.name || "Banner slide"}
                      fill
                      priority={sIdx === 0}
                      fetchPriority={sIdx === 0 ? "high" : "low"}
                      loading={sIdx === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 1440px) 100vw, 1440px"
                      className="object-cover object-center cursor-pointer select-none pointer-events-none"
                    />

                    {/* Optional Text Overlay */}
                    {hasText && (
                      <div
                        className={`absolute inset-0 flex flex-col justify-center px-8 md:px-14 gap-2 pointer-events-none ${
                          slide.textPosition === "center"
                            ? "items-center text-center bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"
                            : slide.textPosition === "right"
                              ? "items-end text-right bg-gradient-to-l from-slate-950/80 via-slate-950/40 to-transparent"
                              : "items-start text-left bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"
                        }`}
                      >
                        {slide.subtitle && (
                          <span
                            className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                            style={{ color: slide.subtitleColor || "#fbbf24" }}
                          >
                            {slide.subtitle}
                          </span>
                        )}
                        {slide.title && (
                          <h2
                            className="text-xl sm:text-3xl md:text-4xl font-extrabold max-w-xl leading-tight"
                            style={{ color: slide.textColor || "#ffffff" }}
                          >
                            {slide.title}
                          </h2>
                        )}
                        {slide.buttonText && (
                          <div className="pt-2">
                            <span
                              className="inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md pointer-events-auto transition-transform active:scale-95"
                              style={{
                                backgroundColor:
                                  slide.buttonBgColor || "#f59e0b",
                                color: slide.buttonTextColor || "#0f172a",
                              }}
                            >
                              {slide.buttonText}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {Boolean(slide.isPaid) && (
                      <div className="absolute top-3 right-3 bg-black/50 text-white/90 text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                        Sponsored
                      </div>
                    )}
                  </div>
                );

                const handleLinkClick = (e) => {
                  if (hasMoved.current) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                };

                return (
                  <div
                    key={slide.id}
                    className="w-full h-full flex-none shrink-0 min-w-full max-w-full basis-full relative overflow-hidden"
                  >
                    {isExternal ? (
                      <a
                        href={slide.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className="block w-full h-full"
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        href={slide.link || "/deals"}
                        onClick={handleLinkClick}
                        className="block w-full h-full"
                      >
                        {linkContent}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Responsive Brands Bar Below (Visible on Mobile & Desktop, supporting 50+ logos) */}
      {slides.some((s) => s.logo || s.name || s.title) && (
        <div className="relative group/thumb flex w-full mt-2 sm:mt-2.5 select-none text-left items-center overflow-hidden">
          {/* Scroll Left Button for Thumbnails (Shown on overflow/hover) */}
          {slides.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbBar("left")}
              className="hidden sm:flex absolute left-1 z-10 items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover/thumb:opacity-100 cursor-pointer"
              aria-label="Scroll logos left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Logos Scroll Track */}
          <div
            ref={thumbTrackRef}
            className="w-full flex items-center overflow-x-auto scrollbar-hide py-2 gap-2 sm:gap-3 px-1 scroll-smooth flex-nowrap"
          >
            {slides.map((brand, idx) => {
              const isActive = idx === currentSlide;
              // Clean readable label from brand name, title, or link slug
              let titleText = brand.name || brand.title || "";
              if (!titleText && brand.link && brand.link !== "#") {
                const parts = brand.link.replace(/\/+$/, "").split("/");
                const last = parts[parts.length - 1];
                if (last && !last.includes("?") && last.length < 30) {
                  titleText = last.replace(/[-_]/g, " ");
                }
              }
              if (!titleText) titleText = `Partner ${idx + 1}`;
              return (
                <button
                  key={brand.id}
                  ref={(el) => {
                    thumbRefs.current[idx] = el;
                  }}
                  onClick={() => handleBrandClick(idx)}
                  type="button"
                  className={`relative flex-none shrink-0 inline-flex items-center justify-center cursor-pointer border rounded-md bg-white p-1.5 w-[76px] sm:w-[84px] h-[36px] sm:h-[40px] transition-all duration-200 ${
                    isActive
                      ? "border-blue-600 shadow-sm ring-1 ring-blue-600/30 scale-105"
                      : "border-slate-200 hover:border-blue-400 opacity-80 hover:opacity-100"
                  }`}
                  title={titleText}
                >
                  {brand.logo &&
                  typeof brand.logo === "string" &&
                  brand.logo.trim() !== "" ? (
                    <SafeImage
                      src={brand.logo}
                      alt={titleText}
                      width={80}
                      height={36}
                      loading="lazy"
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-md select-none pointer-events-none"
                    />
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate max-w-full text-center uppercase px-0.5 select-none">
                      {titleText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button for Thumbnails (Shown on overflow/hover) */}
          {slides.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbBar("right")}
              className="hidden sm:flex absolute right-1 z-10 items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all opacity-0 group-hover/thumb:opacity-100 cursor-pointer"
              aria-label="Scroll logos right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
