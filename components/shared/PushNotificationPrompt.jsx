"use client";

import { useState, useEffect } from "react";
import { Bell, Share, X } from "lucide-react";
import toast from "react-hot-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const DISMISS_KEY = "push_prompt_dismissed_until";
const SNOOZE_DAYS = 7;

/**
 * PushNotificationPrompt
 *
 * Floating opt-in banner with cross-platform and iOS Apple Phone support.
 * - On iPhone / iPad (iOS Safari non-standalone), guides user to Add to Home Screen.
 * - On desktop / Android / standalone PWA, prompts for Notification permission directly.
 * - Snoozes for 7 days if dismissed.
 */
export default function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  const { isSupported, permission, isSubscribed, loading, requestPermission } =
    usePushNotifications();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    setIsIOSDevice(isIOS);
    setIsStandaloneApp(isStandalone);

    if (typeof Notification !== "undefined") {
      if (
        Notification.permission === "granted" ||
        Notification.permission === "denied"
      ) {
        setVisible(false);
        return;
      }
    }

    if (!isSupported && !isIOS) return;
    if (permission === "granted" || permission === "denied") return;
    if (isSubscribed) return;

    // Check snooze dismissal
    try {
      const until = localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < Number(until)) return;
    } catch {
      // localStorage unavailable — show anyway
    }

    // Delay slightly so the prompt doesn't flash on first paint
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [isSupported, permission, isSubscribed]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {}
  };

  const handleAllow = async () => {
    try {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "denied"
      ) {
        toast(
          "Notifications are blocked in your browser settings. Please enable them in site settings.",
          {
            icon: "🔒",
            duration: 5000,
          },
        );
        setVisible(false);
        try {
          localStorage.setItem(
            DISMISS_KEY,
            String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000),
          );
        } catch {}
        return;
      }

      const granted = await requestPermission();
      setVisible(false);
      try {
        localStorage.setItem(
          DISMISS_KEY,
          String(
            Date.now() + (granted ? 365 : SNOOZE_DAYS) * 24 * 60 * 60 * 1000,
          ),
        );
      } catch {}
    } catch (err) {
      console.error("[Push Prompt Error]:", err);
      setVisible(false);
    }
  };

  if (!visible) return null;

  const showIOSGuide = isIOSDevice && !isStandaloneApp;

  return (
    <div
      className="fixed z-50 right-3 sm:right-6 left-auto
                 bottom-[85px] sm:bottom-6
                 w-[calc(100vw-24px)] max-w-[280px] sm:max-w-[300px]
                 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-xl rounded-xl
                 p-3.5 flex items-start gap-2.5 font-sans
                 animate-in fade-in slide-in-from-bottom-3 duration-300 text-left"
      role="dialog"
      aria-label="Enable push notifications"
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        {showIOSGuide ? (
          <>
            <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5 text-[#F72853]" />
              <span>iPhone Deal Alerts</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug font-normal">
              To enable notifications on Apple iOS: tap the{" "}
              <strong className="text-slate-800 font-semibold">Share</strong> button in Safari and choose{" "}
              <strong className="text-[#F72853] font-semibold">"Add to Home Screen"</strong>.
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              Turn on notifications
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Get instant updates on new deals, offer expiries, and alerts.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                id="push-allow-btn"
                type="button"
                onClick={handleAllow}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F72853] hover:bg-[#e01e47]
                           text-white text-[11px] font-medium rounded-md shadow-xs
                           transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Bell className="w-3 h-3" />
                )}
                Allow
              </button>
              <button
                id="push-dismiss-btn"
                type="button"
                onClick={handleDismiss}
                className="px-2 py-1 text-[11px] font-medium text-slate-500
                           hover:text-slate-700 hover:bg-slate-100 rounded-md
                           transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 -mr-1 -mt-0.5 rounded"
        aria-label="Close notification prompt"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
