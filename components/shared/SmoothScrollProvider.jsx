"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // On touch-only mobile devices, preserve native 120Hz GPU momentum scrolling
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) return;

    let lenis = null;
    let rafId = null;
    let handleAnchorClick = null;
    let isCancelled = false;

    let idleId = null;
    let timerId = null;

    const startLenis = () => {
      if (isCancelled) return;
      import("lenis").then(({ default: Lenis }) => {
        if (isCancelled) return;

        document.documentElement.classList.add("lenis", "lenis-smooth");

        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.1,
          infinite: false,
          autoRaf: false,
        });

        lenisRef.current = lenis;
        setLenisInstance(lenis);
        window.lenis = lenis;

        function raf(time) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        handleAnchorClick = (e) => {
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
      });
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(startLenis, { timeout: 2000 });
    } else {
      timerId = setTimeout(startLenis, 1000);
    }

    return () => {
      isCancelled = true;
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
      if (handleAnchorClick) {
        document.removeEventListener("click", handleAnchorClick);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
        document.documentElement.classList.remove("lenis", "lenis-smooth");
        window.lenis = null;
      }
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset scroll on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    }
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
