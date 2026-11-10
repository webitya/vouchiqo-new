"use client";

import { useCallback } from "react";

/**
 * Custom hook for fire-and-forget client-side analytics event tracking.
 * Posts to /api/analytics/event in the background without blocking UI rendering.
 */
export function useTrackEvent() {
  const track = useCallback(
    (eventType, { couponId, merchantId, source = "direct" } = {}) => {
      if (typeof window === "undefined" || !eventType) return;

      try {
        const payload = JSON.stringify({
          eventType,
          couponId: couponId || null,
          merchantId: merchantId || null,
          source,
        });

        if (navigator?.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/analytics/event", blob);
        } else {
          fetch("/api/analytics/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Ignore background tracking failures
      }
    },
    [],
  );

  return track;
}
