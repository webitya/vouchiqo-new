"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Controller to maintain Lenis state across route changes,
 * dynamic content expansions, and modal scroll locks with 0 stuck states.
 */
function LenisSyncController() {
  const lenis = useLenis();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // 1. Expose to window.lenis for global access
  useEffect(() => {
    if (!lenis) return;
    window.lenis = lenis;
    return () => {
      window.lenis = null;
    };
  }, [lenis]);

  // 2. Next.js Route changes: reset to top and recalculate dimensions
  useEffect(() => {
    if (!lenis) return;
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      lenis.scrollTo(0, { immediate: true });
      lenis.start();
      requestAnimationFrame(() => {
        lenis.resize();
      });
    }
  }, [pathname, lenis]);

  // 3. Dynamic content expansions: keep scroll limits synced via ResizeObserver (No Stuck)
  useEffect(() => {
    if (!lenis) return;

    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener("resize", handleResize);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        lenis.resize();
      });
      if (document.body) ro.observe(document.body);
      if (document.documentElement) ro.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [lenis]);

  // 4. Modal / Drawer scroll lock auto-detection with 0-deadlock guarantee
  useEffect(() => {
    if (!lenis) return;

    const checkScrollLock = () => {
      // ONLY check if an actual external modal/drawer or body lock is present.
      // NEVER check lenis-stopped class because Lenis adds that to itself, creating an infinite deadlock.
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked") ||
        document.body.classList.contains("overflow-hidden");

      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
        lenis.resize();
      }
    };

    // Run initial check
    checkScrollLock();

    // Auto-recover immediately on user scroll/touch if body is not locked
    const handleInteractionRecovery = () => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked") ||
        document.body.classList.contains("overflow-hidden");

      if (!isLocked && lenis.isStopped) {
        lenis.start();
        lenis.resize();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkScrollLock();
        lenis.resize();
      }
    };

    const mo = new MutationObserver(checkScrollLock);
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class", "data-scroll-locked"],
    });

    window.addEventListener("wheel", handleInteractionRecovery, {
      passive: true,
    });
    window.addEventListener("touchstart", handleInteractionRecovery, {
      passive: true,
    });
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mo.disconnect();
      window.removeEventListener("wheel", handleInteractionRecovery);
      window.removeEventListener("touchstart", handleInteractionRecovery);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [lenis]);

  // 5. Smooth Anchor Links (e.g. #faq, #deals, etc.)
  useEffect(() => {
    if (!lenis) return;

    const handleAnchorClick = (e) => {
      const target = e.target.closest("a[href*='#']");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href === "#") return;

      if (href.startsWith("#")) {
        const elem = document.querySelector(href);
        if (elem) {
          e.preventDefault();
          lenis.scrollTo(elem, { offset: -90, duration: 1.2 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [lenis]);

  return null;
}

export { useLenis };

export default function SmoothScrollProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false, // Preserves native 120Hz GPU touch momentum on mobile/tablet (prevents gesture lock/stuck)
        infinite: false,
        autoRaf: true,
      }}
    >
      <LenisSyncController />
      {children}
    </ReactLenis>
  );
}
