"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

// Mock coupons database for the 4 collection brands
const BRAND_COUPONS = {
  "hostinger coupons": [
    {
      value: "FLAT 75% OFF",
      desc: "Premium Web Hosting - Up to 75% OFF + Free Domain",
    },
    {
      value: "EXTRA 10% OFF",
      desc: "Extra 10% OFF sitewide on all managed hosting plans",
    },
    {
      value: "FREE HOSTING",
      desc: "Get 3 months free hosting with 48-month plan",
    },
  ],
  "uber coupons": [
    {
      value: "FLAT 50% OFF",
      desc: "Uber Moto — Flat 50% OFF on Bike Rides | New User",
    },
    {
      value: "FLAT ₹100 OFF",
      desc: "Save ₹100 on your first 3 Uber Premier bookings",
    },
    {
      value: "20% DISCOUNT",
      desc: "Get 20% OFF on Uber Auto rides across select cities",
    },
  ],
  klook: [
    {
      value: "FLAT 15% OFF",
      desc: "Save 15% on theme park tickets and local experiences",
    },
    {
      value: "FLAT 10% OFF",
      desc: "Get 10% OFF on car rentals and hotel bookings",
    },
    {
      value: "BUY 1 GET 1",
      desc: "Buy 1 Get 1 Free on select sightseeing tours",
    },
  ],
  "redrail coupons": [
    {
      value: "FLAT ₹150 OFF",
      desc: "Save flat ₹150 on your first train ticket booking",
    },
    {
      value: "FLAT ₹100 OFF",
      desc: "Flat ₹100 OFF + 10% cashback on all bus ticket bookings",
    },
    {
      value: "FREE CANCEL",
      desc: "Free cancellation on train bookings using code REDFREE",
    },
  ],
};

export default function CollectionCard({ title, logo, image, href = "#" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize key
  const normKey = title?.toLowerCase().trim();
  const coupons = BRAND_COUPONS[normKey] || [
    { value: "SPECIAL DEAL", desc: `Exclusive discounts on ${title} products` },
    { value: "SAVE 15%", desc: `Save 15% on all bookings this week` },
  ];

  const totalCoupons = coupons.length;

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIdx((prev) => (prev === 0 ? totalCoupons - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIdx((prev) => (prev === totalCoupons - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIdx(index);
  };

  const handleRedeem = (e) => {
    e.stopPropagation();
    e.preventDefault();
    alert(`Redeemed coupon: ${coupons[activeIdx].value}`);
  };

  return (
    <div
      className="bg-white rounded-md shadow-sm border border-slate-200/80 overflow-hidden relative transition-all duration-300 hover:shadow-lg select-none text-left flex flex-col h-[380px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 bg-white">
        <div className="w-10 h-10 rounded-full border border-slate-200 p-0.5 bg-white flex items-center justify-center overflow-hidden shrink-0">
          <SafeImage
            src={logo}
            alt={title}
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-[14px] font-bold text-slate-800 tracking-wide uppercase">
          {title}
        </span>
      </div>

      {/* Body Area */}
      <div className="relative flex-1 bg-slate-50 overflow-hidden">
        {/* Product image (always rendered, underlay when hovered) */}
        <div className="absolute inset-0 p-4">
          <SafeImage
            src={image}
            alt={`${title} Banner`}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="w-full h-full object-cover rounded-md transition-all duration-500"
          />
        </div>

        {/* Hover overlay coupon box */}
        <div
          className={`absolute inset-x-0 bottom-0 top-0 bg-white p-6 flex flex-col justify-between items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          {/* Coupon content sliding container */}
          <div className="w-full flex-1 flex flex-col justify-center items-center text-center">
            {/* Sliding text content */}
            <div className="transition-all duration-300 transform">
              <span className="text-xl font-black text-brand-blue uppercase tracking-wider block mb-3">
                {coupons[activeIdx].value}
              </span>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-[200px] mx-auto">
                {coupons[activeIdx].desc}
              </p>
            </div>

            {/* Slider Dots & Arrows */}
            {totalCoupons > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                {/* Prev Arrow */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer bg-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {coupons.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => handleDotClick(e, i)}
                      className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeIdx
                          ? "w-5 bg-[#D1DE31] opacity-100"
                          : "w-1 bg-slate-300 opacity-55 hover:bg-[#D1DE31] hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Arrow */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer bg-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* REDEEM button */}
          <button
            type="button"
            onClick={handleRedeem}
            className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-extrabold text-[13px] tracking-widest uppercase rounded-md transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border-none"
          >
            REDEEM
          </button>
        </div>
      </div>
    </div>
  );
}
