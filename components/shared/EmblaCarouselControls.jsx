"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function EmblaCarouselControls({
  totalSlides,
  selectedIndex,
  onPrev,
  onNext,
  onDotClick,
  className = "",
}) {
  if (totalSlides <= 1) return null;

  return (
    <div
      className={`v2-embla-controls flex items-center justify-end gap-2.5 ${className}`}
    >
      {/* Prev button */}
      <button
        type="button"
        className="embla__prev embla__btn w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 bg-transparent shadow-none"
        title="Previous Slide"
        aria-label="Go to Previous Slide"
        onClick={onPrev}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="embla__dots flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`transition-all duration-300 ease-in-out rounded-full cursor-pointer h-1.5 ${
              i === selectedIndex
                ? "w-6 bg-blue-600 opacity-100"
                : "w-1.5 bg-slate-300 opacity-60 hover:opacity-100 hover:bg-blue-600"
            }`}
            onClick={() => onDotClick(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        type="button"
        className="embla__next embla__btn w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 bg-transparent shadow-none"
        title="Next Slide"
        aria-label="Go to Next Slide"
        onClick={onNext}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
