"use client";

import { useEffect, useState } from "react";

export default function TourSpotlight({ targetSelector, isActive }) {
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 150);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [targetSelector, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none transition-all duration-300">
      {/* Target cutout box with dim backdrop */}
      {targetRect ? (
        <div
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
          className="absolute rounded-xl border-2 border-blue-500/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] transition-all duration-300 pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
