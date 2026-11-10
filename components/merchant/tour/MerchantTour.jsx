"use client";

import { useEffect, useRef } from "react";
import { useMerchantTour } from "@/hooks/use-merchant-tour";
import TourCard from "./TourCard";

const SIDEBAR_W = 250;

export default function MerchantTour() {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    skipTour,
  } = useMerchantTour();

  const prevAnchorRef = useRef(null);

  // Highlight the active anchor element; remove from previous
  useEffect(() => {
    let timerId = null;
    let retryCount = 0;

    const applyHighlight = () => {
      if (prevAnchorRef.current) {
        prevAnchorRef.current.removeAttribute("data-tour-active");
        prevAnchorRef.current = null;
      }
      if (!isActive || !currentStep?.anchor) return;

      const el = document.querySelector(currentStep.anchor);
      if (el) {
        el.setAttribute(
          "data-tour-active",
          currentStep.mode === "content" ? "content" : "sidebar",
        );
        try {
          el.scrollIntoView({
            behavior: "smooth",
            block: currentStep.mode === "content" ? "center" : "nearest",
            inline: "nearest",
          });
        } catch {}
        prevAnchorRef.current = el;
      } else if (retryCount < 5) {
        retryCount++;
        timerId = setTimeout(applyHighlight, 100);
      }
    };

    applyHighlight();

    return () => {
      if (timerId) clearTimeout(timerId);
      if (prevAnchorRef.current) {
        prevAnchorRef.current.removeAttribute("data-tour-active");
        prevAnchorRef.current = null;
      }
    };
  }, [isActive, currentStep?.anchor, currentStep?.mode]);

  // Lift sidebar above overlay while tour is active
  useEffect(() => {
    const sidebar = document.querySelector("[data-slot='sidebar-container']");
    if (!sidebar) return;
    if (isActive) {
      sidebar.style.zIndex = "65";
    } else {
      sidebar.style.zIndex = "";
    }
    return () => {
      sidebar.style.zIndex = "";
    };
  }, [isActive]);

  if (!isActive) return null;

  const isContentStep = currentStep?.mode === "content";

  return (
    <>
      {isContentStep ? (
        /* Full-page dim for content steps — spotlight around element via outline CSS */
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(10, 20, 40, 0.52)", zIndex: 60 }}
        />
      ) : (
        /* Sidebar-right-only dim for sidebar steps */
        <div
          className="fixed inset-y-0 right-0 pointer-events-none"
          style={{
            left: `${SIDEBAR_W}px`,
            background: "rgba(10, 20, 40, 0.55)",
            zIndex: 60,
          }}
        />
      )}

      <TourCard
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={nextStep}
        onSkip={skipTour}
      />
    </>
  );
}
