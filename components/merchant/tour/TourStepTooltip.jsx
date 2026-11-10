"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TourStepTooltip({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onSkip,
  isActive,
}) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!isActive || !step || !step.anchor) {
      setCoords(null);
      return;
    }

    const positionTooltip = () => {
      const el = document.querySelector(step.anchor);
      if (!el) {
        setCoords({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 170,
        });
        return;
      }

      const rect = el.getBoundingClientRect();
      const tooltipWidth = 340;
      const tooltipHeight = 190;

      // Position right of sidebar item
      let top = rect.top + rect.height / 2 - tooltipHeight / 2;
      let left = rect.right + 16;

      // Clamp within viewport
      top = Math.max(
        16,
        Math.min(window.innerHeight - tooltipHeight - 16, top),
      );
      left = Math.max(
        16,
        Math.min(window.innerWidth - tooltipWidth - 16, left),
      );

      setCoords({ top, left });
    };

    positionTooltip();
    const timer = setTimeout(positionTooltip, 200);
    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip, true);
    };
  }, [step, isActive]);

  if (!isActive || !step) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      style={{
        position: "fixed",
        top: coords ? `${coords.top}px` : "50%",
        left: coords ? `${coords.left}px` : "50%",
        transform: coords ? "none" : "translate(-50%, -50%)",
        zIndex: 70,
      }}
      className="w-[330px] sm:w-[350px] bg-white text-slate-900 rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 text-left relative"
    >
      {/* Top Close Button */}
      <button
        type="button"
        onClick={onSkip}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
        aria-label="Close tour"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Step Header Indicator */}
      <div className="w-fit text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
        STEP {currentStepIndex + 1} OF {totalSteps}
      </div>

      {/* Step Title & Body */}
      <div className="space-y-1.5 pr-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug font-sans">
          {step.title}
        </h3>
        <p className="text-xs text-slate-600 font-normal leading-relaxed font-sans">
          {step.content}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-sans"
        >
          Skip
        </button>
        <Button
          type="button"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-blue-600/20 font-sans"
        >
          {isLastStep ? "Got It" : "Next"}
        </Button>
      </div>
    </div>
  );
}
