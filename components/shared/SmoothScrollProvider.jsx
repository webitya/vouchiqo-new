"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";

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
    if (typeof ResizeObserver !== "undefined" && document.body) {
      ro = new ResizeObserver(() => {
        lenis.resize();
      });
      ro.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [lenis]);

  // 4. Modal / Drawer scroll lock auto-detection
  useEffect(() => {
    if (!lenis) return;

    const checkScrollLock = () => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.classList.contains("lenis-stopped");

      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    const mo = new MutationObserver(checkScrollLock);
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class", "data-scroll-locked"],
    });

    return () => mo.disconnect();
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
