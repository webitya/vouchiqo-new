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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-fade-in"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[320px] overflow-hidden p-5 space-y-4 animate-scale-up text-center relative">
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Pin Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <MapPin className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
            Allow Location Permission
          </h3>
          <p className="text-[12px] text-gray-500 font-normal leading-relaxed px-1">
            We need your location to show verified nearby deals and partner
            stores around you.
          </p>
        </div>

        {/* Simple 2 Button Row */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isDetecting}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[12px] font-medium rounded-lg border-0 cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
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
