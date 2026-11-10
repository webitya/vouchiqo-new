"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { memo, useEffect, useRef } from "react";
import SafeImage from "@/components/shared/SafeImage";

const ARTICLES = [
  {
    id: 1,
    category: "Shopping Tips",
    title: "10 Proven Ways to Save More Using Coupon Codes in 2025",
    excerpt:
      "Discover insider tricks that seasoned bargain hunters use to stack discounts and maximize savings on every order.",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop",
    readTime: "5 min read",
    date: "Jul 12, 2025",
    href: "/blog/save-more-coupon-codes",
  },
  {
    id: 2,
    category: "Fashion",
    title: "Best Myntra & AJIO Deals This Season — Up to 80% OFF",
    excerpt:
      "We curated the top fashion offers live right now on Myntra and AJIO so you don't have to hunt through thousands of listings.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    readTime: "4 min read",
    date: "Jul 10, 2025",
    href: "/blog/myntra-ajio-deals",
  },
  {
    id: 3,
    category: "Food & Dining",
    title: "Swiggy vs Zomato: Which App Gives Better Discounts in 2025?",
    excerpt:
      "A side-by-side comparison of promo codes, subscription perks, and cashback offers from India's two biggest food delivery apps.",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
    readTime: "6 min read",
    date: "Jul 8, 2025",
    href: "/blog/swiggy-vs-zomato-discounts",
  },
  {
    id: 4,
    category: "Electronics",
    title: "Amazon vs Flipkart: Who Has the Real Deals on Gadgets?",
    excerpt:
      "We tracked 50+ product prices across both platforms for 30 days. Here's who actually wins on laptops, phones, and accessories.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop",
    readTime: "7 min read",
    date: "Jul 5, 2025",
    href: "/blog/amazon-vs-flipkart-gadgets",
  },
  {
    id: 5,
    category: "Travel",
    title: "How to Book Flights 40% Cheaper Using These Hidden Tricks",
    excerpt:
      "From incognito mode myths to real airline coupon stacking, here's an honest guide to flying cheaper across India and abroad.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop",
    readTime: "8 min read",
    date: "Jul 2, 2025",
    href: "/blog/cheap-flight-booking-tricks",
  },
  {
    id: 6,
    category: "Beauty",
    title: "Nykaa Sale Guide: Best Skincare Deals Not to Miss",
    excerpt:
      "Beauty enthusiasts rejoice — we break down every Nykaa sale category, what to buy first, and coupons that actually work.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
    readTime: "5 min read",
    date: "Jun 28, 2025",
    href: "/blog/nykaa-sale-guide",
  },
];

const ArticleCard = memo(function ArticleCard({ article }) {
  return (
    <Link
      href={article.href}
      className="art-card group block no-underline cursor-pointer select-none h-full"
    >
      <div className="art-card__inner flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/90 hover:border-[#F72853] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(247,40,83,0.14)] shadow-2xs h-full">
        {/* Cover image */}
        <div className="h-[140px] sm:h-[150px] overflow-hidden shrink-0 relative bg-slate-100">
          <SafeImage
            src={article.image}
            alt={article.title || "Article Cover"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          />
          {/* Category pill */}
          <span className="absolute top-2.5 left-2.5 bg-rose-50 text-[#F72853] border border-rose-200/80 text-[9px] sm:text-[9.5px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3.5 flex-1 text-left">
          <h3 className="line-clamp-2 text-xs sm:text-[12.5px] font-medium text-slate-800 group-hover:text-[#F72853] transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-[11px] text-slate-500 font-normal leading-relaxed">
            {article.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-slate-100 text-[10.5px] sm:text-[11px] text-slate-400 font-normal">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {article.readTime}
            </span>
            <span>•</span>
            <span>{article.date}</span>
            <span className="ml-auto font-medium text-[#F72853] group-hover:translate-x-0.5 transition-transform">
              Read →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

export function LatestArticles() {
  const scrollRef = useRef(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Triple the items so there is an uninterrupted loop
  const displayArticles = [...ARTICLES, ...ARTICLES, ...ARTICLES];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId;
    const speed = 0.75; // Smooth slow gliding pace

    const tick = () => {
      if (!isPaused.current && !isDragging.current && el) {
        el.scrollLeft += speed;
        // When we pass one third of the scrollable content, seamlessly wrap back
        const singleSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += singleSetWidth;
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  // Mouse drag support
  const handleMouseDown = (e) => {
    isDragging.current = true;
    isPaused.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    isPaused.current = false;
  };

  return (
    <section className="text-left w-full overflow-hidden select-none pb-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div>
          <h2 className="font-medium leading-tight text-[#F72853] text-base sm:text-lg md:text-xl tracking-tight">
            Latest Articles &amp; Guides
          </h2>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
            Tips, deals breakdowns &amp; shopping guides
          </p>
        </div>

        {/* Nav Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-[#F72853] text-slate-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-[#F72853] text-slate-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infinite Scrolling Viewport */}
      <div
        className="relative w-full overflow-hidden py-1"
        onMouseEnter={() => {
          isPaused.current = true;
        }}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {/* Soft edge gradient masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent z-10" />

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={() => {
            isPaused.current = true;
          }}
          onTouchEnd={() => {
            isPaused.current = false;
          }}
          className="flex gap-3.5 sm:gap-4.5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {displayArticles.map((article, idx) => (
            <div
              key={`${article.id}-${idx}`}
              className="w-[260px] sm:w-[290px] md:w-[310px] shrink-0"
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestArticles;
