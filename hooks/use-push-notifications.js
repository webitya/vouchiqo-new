"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  isFCMSupported,
  getFCMToken,
  onForegroundMessage,
} from "@/lib/firebaseClient";

/**
 * usePushNotifications
 *
 * Manages the full lifecycle of browser web push notifications:
 * - Detects FCM support & existing browser permission
 * - Silently re-syncs token on return visits
 * - Registers/unregisters device with the backend
 * - Shows foreground toast when a push arrives while app is open
 *
 * @param {{ userId?: string }} options
 */
export function usePushNotifications({ userId } = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default"); // "default" | "granted" | "denied"
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const unsubForegroundRef = useRef(null);

  // ─── Detect support & existing permission on mount ──────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const supported = await isFCMSupported();
      if (cancelled) return;
      setIsSupported(supported);

      if (!supported) return;

      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      // Silently re-sync if already granted (return visit)
      if (currentPermission === "granted") {
        await silentSync();
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─── Foreground message listener ─────────────────────────────────────────
  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    let active = true;

    onForegroundMessage((payload) => {
      if (!active) return;
      const { notification, data } = payload;
      const title = notification?.title || data?.title || "Vouchiqo";
      const body = notification?.body || data?.body || "You have a new update";
      const url = notification?.click_action || data?.url;

      toast.custom(
        (t) => (
          <div
            className={`flex items-start gap-3 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 max-w-sm w-full transition-all ${
              t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <img
              src="/navbarlogovouchiqo.webp"
              alt="Vouchiqo"
              className="w-8 h-8 rounded-md flex-shrink-0 object-contain"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{body}</p>
              {url && (
                <a
                  href={url}
                  className="text-[11px] text-blue-600 font-medium hover:underline mt-1 inline-block"
                >
                  View →
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 text-xs mt-0.5 flex-shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 6000, position: "bottom-right" },
      );
    }).then((unsub) => {
      unsubForegroundRef.current = unsub;
    });

    return () => {
      active = false;
      if (typeof unsubForegroundRef.current === "function") {
        unsubForegroundRef.current();
        unsubForegroundRef.current = null;
      }
    };
  }, [isSupported, permission]);

  // ─── Silent sync (return visits with existing permission) ────────────────
  const silentSync = useCallback(async () => {
    try {
      const fcmToken = await getFCMToken();
      if (!fcmToken) return;

      setToken(fcmToken);
      setIsSubscribed(true);

      const deviceInfo = getDeviceInfo();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken, deviceInfo }),
      });
    } catch {
      // Silent — don't interrupt UX on return visits
    }
  }, []);

  // ─── Request permission & subscribe ─────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setLoading(false);
        return false;
      }

      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        setLoading(false);
        return false;
      }

      setToken(fcmToken);

      const deviceInfo = getDeviceInfo();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken, deviceInfo }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!", { duration: 3000 });
        return true;
      }
    } catch (err) {
      console.error("[usePushNotifications] requestPermission error:", err);
      toast.error("Failed to enable push notifications.");
    } finally {
      setLoading(false);
    }

    return false;
  }, [isSupported]);

  // ─── Unsubscribe ─────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setIsSubscribed(false);
      setToken(null);
      toast("Push notifications disabled.", { icon: "🔕", duration: 3000 });
    } catch (err) {
      console.error("[usePushNotifications] unsubscribe error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    isSupported,
    permission,
    isSubscribed,
    token,
    loading,
    requestPermission,
    unsubscribe,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

  let platform = "Unknown";
  if (ua.includes("Win")) platform = "Windows";
  else if (ua.includes("Mac")) platform = "macOS";
  else if (ua.includes("Linux")) platform = "Linux";
  else if (ua.includes("Android")) platform = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) platform = "iOS";

  return { browser, platform, userAgent: ua.slice(0, 300) };
}
