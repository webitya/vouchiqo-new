"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TOUR_STEPS } from "@/components/merchant/tour/tourSteps";

const TOUR_STORAGE_KEY = "vouchiqo_merchant_tour_seen";

export function useMerchantTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-launch for merchant dashboard if tour hasn't been seen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!seen && pathname.startsWith("/merchant")) {
        setIsActive(true);
        setCurrentStepIndex(0);
      }
      setIsLoaded(true);
    }
  }, [pathname]);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
    if (!pathname.startsWith("/merchant/dashboard")) {
      router.push("/merchant/dashboard");
    }
  }, [pathname, router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  }, []);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, totalSteps, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const restartTour = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    }
    startTour();
  }, [startTour]);

  return {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    isLoaded,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    restartTour,
  };
}
