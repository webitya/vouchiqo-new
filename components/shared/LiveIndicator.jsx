"use client";

import { useSocketContext } from "./SocketProvider";

/**
 * Clean UI Indicator showing real-time socket status.
 *
 * @param {{ className?: string, showLabel?: boolean, label?: string }} props
 */
export function LiveIndicator({ className = "", showLabel = true, label }) {
  const { isConnected } = useSocketContext();

  const textLabel = label || (isConnected ? "Realtime Live" : "Polling Active");

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm transition-all duration-200 ${
        isConnected
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      } ${className}`}
      title={
        isConnected
          ? "Real-time WebSockets Active"
          : "Fallback polling active (30s)"
      }
    >
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${
          isConnected ? "bg-emerald-600" : "bg-amber-500"
        }`}
      />
      {showLabel && <span>{textLabel}</span>}
    </div>
  );
}
