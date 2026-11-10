"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SIDEBAR_W = 250;
const CARD_GAP = 14;
const CARD_W = 290;

export default function TourCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onSkip,
}) {
  const [pos, setPos] = useState({ top: 240, left: SIDEBAR_W + CARD_GAP });
  const [arrowTop, setArrowTop] = useState(24);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!step?.anchor) return;

    let timer1, timer2, timer3;

    const compute = () => {
      const el = document.querySelector(step.anchor);
      const card = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cardH = card ? card.offsetHeight : 180;

      if (step.mode === "content") {
        const placement = step.placement || "bottom";
        let top;
        let left = rect.left + rect.width / 2 - CARD_W / 2;

        if (placement === "bottom") {
          top = rect.bottom + 14;
        } else if (placement === "top") {
          top = rect.top - cardH - 14;
        } else if (placement === "right") {
          top = rect.top + rect.height / 2 - cardH / 2;
          left = rect.right + 14;
        } else {
          top = rect.bottom + 14;
        }

        top = Math.max(16, Math.min(window.innerHeight - cardH - 16, top));
        left = Math.max(
          SIDEBAR_W + 16,
          Math.min(window.innerWidth - CARD_W - 16, left),
        );

        setPos({ top, left });
      } else {
        // Sidebar mode: card sits to the RIGHT of the sidebar, aligned with the item
        const itemCenterY = rect.top + rect.height / 2;
        let top = itemCenterY - cardH / 2;
        const left = SIDEBAR_W + CARD_GAP;

        top = Math.max(16, Math.min(window.innerHeight - cardH - 16, top));

        // Calculate exact arrow vertical position relative to card top
        const computedArrowTop = Math.max(
          14,
          Math.min(cardH - 24, itemCenterY - top - 10),
        );
        setArrowTop(computedArrowTop);

        setPos({ top, left });
      }
    };

    compute();
    timer1 = setTimeout(compute, 50);
    timer2 = setTimeout(compute, 150);
    timer3 = setTimeout(compute, 300);

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [step?.anchor, step?.mode, step?.placement]);

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        zIndex: 70,
        width: `${CARD_W}px`,
      }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 text-left animate-in fade-in zoom-in-95 duration-200 relative font-sans"
    >
      {/* Pointer arrow pointing to target element */}
      {step.mode !== "content" && (
        <div
          style={{ top: `${arrowTop}px` }}
          className="absolute -left-2.5 w-5 h-5 bg-white border-l border-b border-slate-200/90 rotate-45 shadow-2xs transition-all duration-150"
          aria-hidden="true"
        />
      )}
      {step.mode === "content" && step.placement === "bottom" && (
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t border-l border-slate-200/90 rotate-45 shadow-2xs"
          aria-hidden="true"
        />
      )}
      {step.mode === "content" && step.placement === "top" && (
        <div
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b border-r border-slate-200/90 rotate-45 shadow-2xs"
          aria-hidden="true"
        />
      )}

      {/* Step label + close */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider font-sans">
          STEP {currentStepIndex + 1} OF {totalSteps}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-slate-100"
          aria-label="Close tour"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 leading-snug tracking-tight mb-1 font-sans relative z-10">
        {step.title}
      </h3>

      {/* Body */}
      <p className="text-xs text-slate-600 font-normal leading-relaxed mb-3.5 font-sans relative z-10">
        {step.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 relative z-10">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-sans"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-all shadow-md shadow-blue-600/20 font-sans hover:scale-[1.02]"
        >
          {isLastStep ? "Got it" : "Next"}
        </button>
      </div>
    </div>
  );
}
