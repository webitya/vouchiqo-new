"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export const TrendingOffer = ({ banners = [] }) => {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / drag gesture refs
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalSwipe = useRef(null);
  const hasMoved = useRef(false);

  const slides = useMemo(() => {
    const dbTrending = (banners || []).filter(
      (b) => b.slot === "trending" || b.slot === "trending-offer",
    );
    const sorted = [...dbTrending].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );
    return sorted.map((b, idx) => ({ id: b._id || idx, ...b }));
  }, [banners]);

  const total = slides.length;

  // Auto-rotation timer (pauses on user hover / interaction)
  useEffect(() => {
    if (total <= 1 || isPaused || isDragging.current) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  useEffect(() => {
    if (current >= total && total > 0) setCurrent(0);
  }, [total, current]);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setDragOffset(0);
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
    setDragOffset(0);
  }, [total]);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
    setDragOffset(0);
  }, [total]);

  // Touch handlers with directional locking (doesn't interfere with vertical page scroll)
  const handleTouchStart = (e) => {
    if (total <= 1) return;
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    isHorizontalSwipe.current = null;
    hasMoved.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - dragStartX.current;
    const diffY = currentY - dragStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current) {
      hasMoved.current = true;
      // Dampen drag at boundary edges for tactile feel
      if (
        (current === 0 && diffX > 0) ||
        (current === total - 1 && diffX < 0)
      ) {
        setDragOffset(diffX * 0.4);
      } else {
        setDragOffset(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    if (isHorizontalSwipe.current && hasMoved.current) {
      if (dragOffset < -45) {
        goNext();
      } else if (dragOffset > 45) {
        goPrev();
      }
    }
    isDragging.current = false;
    isHorizontalSwipe.current = null;
    setDragOffset(0);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    if (total <= 1) return;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    isHorizontalSwipe.current = true;
    hasMoved.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.clientX - dragStartX.current;
    if (Math.abs(diffX) > 6) {
      hasMoved.current = true;
      if (
        (current === 0 && diffX > 0) ||
        (current === total - 1 && diffX < 0)
      ) {
        setDragOffset(diffX * 0.4);
      } else {
        setDragOffset(diffX);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    if (hasMoved.current) {
      if (dragOffset < -50) {
        goNext();
      } else if (dragOffset > 50) {
        goPrev();
      }
    }
    isDragging.current = false;
    isHorizontalSwipe.current = null;
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (isDragging.current) {
      isDragging.current = false;
      setDragOffset(0);
    }
  };

  // Prevent link click trigger when dragging
  const handleLinkClick = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // If no DB banners exist for Trending Offer section, hide section cleanly
  if (!slides || slides.length === 0) return null;

  return (
    <section className="text-left w-full select-none">
      {/* Heading with slide counter */}
      <div className="flex justify-between items-center mb-2.5 sm:mb-3.5">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-[#F72853] tracking-tight">
          Trending Offer
        </h2>
        {total > 1 && (
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">
            {current + 1} / {total}
          </span>
        )}
      </div>

      {/* Carousel wrapper with AI-compatible 8:3 (~2.67:1 / 2048x768) aspect ratio - responsive on all devices */}
      <div
        className="group relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-950 touch-pan-y"
        style={{
          aspectRatio: "2048 / 768",
          minHeight: "130px",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Horizontal sliding track */}
        <div
          className={`flex h-full w-full will-change-transform ${
            isDragging.current
              ? "transition-none"
              : "transition-transform duration-500 ease-out"
          }`}
          style={{
            transform:
              dragOffset !== 0
                ? `translateX(calc(-${current * 100}% + ${dragOffset}px))`
                : `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((s, idx) => {
            const isExternal =
              s.link?.startsWith("http://") || s.link?.startsWith("https://");
            const targetUrl = s.link && s.link !== "#" ? s.link : "/deals";

            const hasText = Boolean(
              (s.title && s.title.trim() !== "") ||
                (s.subtitle && s.subtitle.trim() !== "") ||
                (s.buttonText && s.buttonText.trim() !== ""),
            );

            const slideContent = (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
                {/* AI-Ready 8:3 Banner Image */}
                <SafeImage
                  src={s.image}
                  alt={s.title || "Trending Banner"}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? "high" : "low"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1440px"
                  className="object-cover object-center select-none pointer-events-none transition-transform duration-700"
                  style={{
                    transform: idx === current ? "scale(1.008)" : "scale(1)",
                  }}
                  draggable={false}
                />

                {/* Optional Text Overlay (Deeply Responsive across Mobile to Desktop) */}
                {hasText && (
                  <div
                    className={`absolute inset-0 flex flex-col justify-center px-4 xs:px-6 sm:px-10 md:px-14 gap-1 sm:gap-2 pointer-events-none ${
                      s.textPosition === "center"
                        ? "items-center text-center bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent"
                        : s.textPosition === "right"
                          ? "items-end text-right bg-gradient-to-l from-slate-950/85 via-slate-950/40 to-transparent"
                          : "items-start text-left bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent"
                    }`}
                  >
                    {s.subtitle && (
                      <span
                        className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm uppercase tracking-wider font-semibold"
                        style={{ color: s.subtitleColor || "#fbbf24" }}
                      >
                        {s.subtitle}
                      </span>
                    )}
                    {s.title && (
                      <h3
                        className="text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl font-extrabold max-w-xs sm:max-w-md md:max-w-xl leading-tight line-clamp-2"
                        style={{ color: s.textColor || "#ffffff" }}
                      >
                        {s.title}
                      </h3>
                    )}
                    {s.buttonText && (
                      <div className="mt-0.5 sm:mt-1">
                        <span
                          className="inline-flex items-center px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded sm:rounded-lg font-bold text-[10px] sm:text-xs shadow-md pointer-events-auto transition-transform active:scale-95"
                          style={{
                            backgroundColor: s.buttonBgColor || "#f59e0b",
                            color: s.buttonTextColor || "#0f172a",
                          }}
                        >
                          {s.buttonText}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sponsored Badge */}
                {s.isPaid && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 text-white/95 text-[7px] sm:text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded backdrop-blur-xs select-none pointer-events-none z-10 border border-white/10">
                    Sponsored
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={s.id}
                className="relative w-full h-full flex-shrink-0 min-w-full overflow-hidden"
              >
                {isExternal ? (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    onClick={handleLinkClick}
                    className="block w-full h-full cursor-pointer"
                  >
                    {slideContent}
                  </a>
                ) : (
                  <Link
                    href={targetUrl}
                    draggable={false}
                    onClick={handleLinkClick}
                    className="block w-full h-full cursor-pointer"
                  >
                    {slideContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Left/Right Navigation Chevron Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goPrev();
              }}
              className="hidden sm:flex absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-xs border border-white/20 shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Previous trending offer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goNext();
              }}
              className="hidden sm:flex absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-xs border border-white/20 shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Next trending offer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Dot navigation — in frosted backdrop pill for 100% visibility on light/dark banners */}
        {total > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/45 backdrop-blur-xs border border-white/10 shadow-sm pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className="border-0 p-0 transition-all duration-300 cursor-pointer rounded-full"
                style={{
                  width: idx === current ? "20px" : "6px",
                  height: "6px",
                  backgroundColor:
                    idx === current ? "#ffffff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingOffer;
