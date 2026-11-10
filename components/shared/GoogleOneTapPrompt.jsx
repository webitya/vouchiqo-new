"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";

export default function GoogleOneTapPrompt() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Only trigger for unauthenticated users on public/customer pages
    if (isPending || session?.user || hasTriggered.current) return;
    if (
      pathname.startsWith("/merchant") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return;
    }

    hasTriggered.current = true;

    // Small delay to ensure clean DOM load and avoid popup collisions
    const timer = setTimeout(() => {
      if (typeof authClient?.oneTap === "function") {
        authClient
          .oneTap({
            context: "signin",
            cancelOnTapOutside: true,
            callbackURL:
              typeof window !== "undefined" ? window.location.href : "/",
          })
          .catch((err) => {
            console.debug("[Google One Tap notice]:", err?.message || err);
          });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [session, isPending, pathname]);

  return null;
}
