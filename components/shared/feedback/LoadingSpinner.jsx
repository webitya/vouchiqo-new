"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

/**
 * Standalone loading spinner — no layout wrapper.
 * For a full-page loading state inside DashboardLayout, use LoadingState instead.
 *
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} [size="md"] - spinner size
 * @param {string} [className] - extra classes on the wrapper div
 * @param {string} [label] - optional accessible label (screen readers)
 * @param {"center"|"inline"} [variant="inline"] - "center" wraps in a flex-center div
 */
export default function LoadingSpinner({
  size = "md",
  className,
  label = "Loading…",
  variant = "inline",
}) {
  const spinner = (
    <Loader2
      aria-label={label}
      role="status"
      className={cn(
        "animate-spin text-brand-subtext",
        SIZE_MAP[size] ?? SIZE_MAP.md,
        variant === "inline" && className,
      )}
    />
  );

  if (variant === "center") {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full py-12",
          className,
        )}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
