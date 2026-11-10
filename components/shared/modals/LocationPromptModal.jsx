"use client";

import { Loader2, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "@/hooks/use-location";

export default function LocationPromptModal() {
  const [show, setShow] = useState(false);
  const [isAcceptClicked, setIsAcceptClicked] = useState(false);
  const { city, status, detect } = useLocation();

  const isDetecting = status === "detecting" || isAcceptClicked;

  // Show modal if no city is set and hasn't been prompted/dismissed in localStorage
  useEffect(() => {
    try {
      const prompted = localStorage.getItem("vouchiqo_location_prompted");
      if (!city && prompted !== "true") {
        const timer = setTimeout(() => {
          if (!document.querySelector('[data-slot="dialog-content"]')) {
            setShow(true);
          }
        }, 1800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, [city]);

  // Listen for custom trigger event from Navbar or location selector
  useEffect(() => {
    const handleOpen = () => setShow(true);
    window.addEventListener("show-location-prompt", handleOpen);
    return () => window.removeEventListener("show-location-prompt", handleOpen);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem("vouchiqo_location_prompted", "true");
    } catch (e) {}
    setIsAcceptClicked(false);
    setShow(false);
  };

  const handleAccept = () => {
    try {
      localStorage.setItem("vouchiqo_location_prompted", "true");
    } catch (e) {}
    setIsAcceptClicked(true);
    detect();

    // Fallback timer: guarantee modal auto-closes after 3.5s max even if browser prompt hangs
    setTimeout(() => {
      setShow(false);
      setIsAcceptClicked(false);
    }, 3500);
  };

  // Close modal automatically whenever detection completes or status transitions
  useEffect(() => {
    if (show && isAcceptClicked) {
      if (
        status === "ready" ||
        status === "denied" ||
        status === "unavailable" ||
        status === "idle"
      ) {
        setShow(false);
        setIsAcceptClicked(false);
      }
    }
  }, [show, isAcceptClicked, status]);

  // Also close modal if city is populated
  useEffect(() => {
    if (city && show) {
      setShow(false);
      setIsAcceptClicked(false);
    }
  }, [city, show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-fade-in font-sans">
      <div className="bg-white rounded-2xl border border-brand-border shadow-2xl w-full max-w-[320px] overflow-hidden p-5 space-y-4 animate-scale-up text-center relative">
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-royal-plum/40 hover:text-royal-plum p-1 rounded-full hover:bg-warm-ivory transition-colors cursor-pointer border-0 bg-transparent"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Pin Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-festival-teal/10 border border-festival-teal/20 flex items-center justify-center text-festival-teal">
          <MapPin className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold font-heading text-royal-plum leading-snug">
            Allow Location Permission
          </h3>
          <p className="text-[12px] text-royal-plum/70 font-normal leading-relaxed px-1">
            We need your location to show verified nearby deals and partner
            stores around you.
          </p>
        </div>

        {/* Simple 2 Button Row */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2 bg-warm-ivory border border-brand-border hover:bg-brand-surface text-royal-plum text-[12px] font-medium rounded-lg cursor-pointer transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isDetecting}
            className="flex-1 py-2 bg-festival-teal hover:bg-[#00635E] disabled:opacity-50 text-white text-[12px] font-heading font-bold rounded-lg border-0 cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Allowing...</span>
              </>
            ) : (
              <span>Accept</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
