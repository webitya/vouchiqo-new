"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SectionHeader({
  title,
  onPrev,
  onNext,
  viewAllHref,
  viewAllText = "View More",
}) {
  return (
    <div className="flex justify-between items-center mb-6 select-none text-left">
      <h2 className="text-xl md:text-2xl font-bold text-brand-text font-heading">
        {title}
      </h2>
      {onPrev && onNext ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-subtext hover:bg-brand-surface transition cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-subtext hover:bg-brand-surface transition cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : viewAllHref ? (
        <Link
          href={viewAllHref}
          className="text-brand-blue text-xs font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          <span>{viewAllText}</span>
          <div className="bg-brand-blue/5 rounded-full w-6 h-6 flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-brand-blue" />
          </div>
        </Link>
      ) : null}
    </div>
  );
}
