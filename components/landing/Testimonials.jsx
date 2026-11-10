"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CUSTOMER_TESTIMONIALS } from "@/utils/home-data";

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CUSTOMER_TESTIMONIALS.length);
    }, 4500);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startAutoPlay();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, startAutoPlay]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? CUSTOMER_TESTIMONIALS.length - 1 : prev - 1,
    );
    startAutoPlay();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CUSTOMER_TESTIMONIALS.length);
    startAutoPlay();
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Hover interaction is for pausing auto-scroll
    <section
      className="py-20 bg-brand-surface border-t border-brand-border px-4 w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black font-heading text-brand-navy tracking-tight">
          What Our Members Say
        </h2>
        <p className="text-sm text-brand-subtext mt-2 font-medium">
          Real savings stories from verified developers, creators, and local
          shoppers.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-12">
        {/* Carousel Window */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {CUSTOMER_TESTIMONIALS.map((item, idx) => (
              <div key={idx} className="w-full flex-shrink-0 px-2 md:px-6">
                <div className="bg-brand-bg border border-brand-border rounded-md p-8 md:p-10 shadow-lg relative flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  {/* Left block: Star rating + Quote */}
                  <div className="flex-1 space-y-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-brand-warning">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>

                    <p className="text-base md:text-lg text-brand-text font-medium italic leading-relaxed text-slate-700">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Right block: Author details + savings badge */}
                  <div className="w-full md:w-56 flex-shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-brand-border pt-4 md:pt-0 md:pl-6 space-y-3">
                    <div>
                      <h4 className="font-bold text-brand-navy text-sm md:text-base">
                        {item.author}
                      </h4>
                      <span className="text-xs font-semibold text-brand-subtext">
                        {item.role}
                      </span>
                    </div>

                    {/* Savings Badge */}
                    {item.savings && (
                      <Badge className="bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success/15 w-fit px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-brand-success/10" />
                        <span>{item.savings}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-[-16px] md:left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-brand-border bg-brand-bg text-brand-navy hover:bg-brand-surface shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-[-16px] md:right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-brand-border bg-brand-bg text-brand-navy hover:bg-brand-surface shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {CUSTOMER_TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                startAutoPlay();
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-brand-navy w-6"
                  : "bg-brand-border hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
