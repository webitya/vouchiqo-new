"use client";

import dynamic from "next/dynamic";

import { useEffect, useState } from "react";

const GoogleOneTapPrompt = dynamic(
  () => import("@/components/shared/GoogleOneTapPrompt"),
  { ssr: false },
);
const PushNotificationPrompt = dynamic(
  () => import("@/components/shared/PushNotificationPrompt"),
  { ssr: false },
);
const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false },
);

export default function ClientPrompts() {
  const [canLoadPrompts, setCanLoadPrompts] = useState(false);

  useEffect(() => {
    // Defer auxiliary third-party prompts until browser idle to unblock main thread and LCP
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(() => setCanLoadPrompts(true), {
        timeout: 2500,
      });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => setCanLoadPrompts(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "13px", fontWeight: 600 },
        }}
      />
      {canLoadPrompts && (
        <>
          <GoogleOneTapPrompt />
          <PushNotificationPrompt />
        </>
      )}
    </>
  );
}
