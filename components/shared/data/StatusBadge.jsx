"use client";

import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Loader2,
  PauseCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mapping of status string → { label, icon, colours }.
 * Add more status values here as the product grows.
 */
const STATUS_CONFIG = {
  // Generic & Live statuses
  active: {
    label: "Active",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  live: {
    label: "Live",
    icon: Zap,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  ended: {
    label: "Ended",
    icon: XCircle,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
  not_contacted: {
    label: "Not Contacted",
    icon: Clock,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-300",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    classes: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  inactive: {
    label: "Inactive",
    icon: PauseCircle,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  pending_review: {
    label: "Pending Review",
    icon: Eye,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    classes: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  draft: {
    label: "Draft",
    icon: FileEdit,
    classes: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-300",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    icon: Ban,
    classes: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  // Campaign-specific
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    classes: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  // Subscription-specific
  trial: {
    label: "Trial",
    icon: Clock,
    classes: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const SIZE_MAP = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-0.5 gap-1.5",
  lg: "text-sm px-2.5 py-1 gap-2",
};

const ICON_SIZE_MAP = {
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
};

const DOT_SIZE_MAP = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

/**
 * StatusBadge — renders a pill badge for any status string.
 *
 * @param {string} status - e.g. "active" | "expired" | "draft" | "pending" | "cancelled"
 * @param {"sm"|"md"|"lg"} [size="md"] - badge size
 * @param {"dot"|"icon"|"text"} [variant="icon"] - what to show alongside the label
 * @param {string} [className] - extra classes
 * @param {string} [label] - override the auto-generated label
 */
export default function StatusBadge({
  status = "inactive",
  size = "md",
  variant = "icon",
  className,
  label,
}) {
  const normalized = status?.toLowerCase?.().replace(/\s+/g, "_") ?? "inactive";
  const config = STATUS_CONFIG[normalized] ?? {
    label: status,
    icon: AlertCircle,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  };

  const Icon = config.icon;
  const isSpinning = normalized === "processing";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        SIZE_MAP[size] ?? SIZE_MAP.md,
        config.classes,
        className,
      )}
    >
      {variant === "dot" && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            DOT_SIZE_MAP[size] ?? DOT_SIZE_MAP.md,
            config.dot,
          )}
        />
      )}
      {variant === "icon" && (
        <Icon
          className={cn(
            ICON_SIZE_MAP[size] ?? ICON_SIZE_MAP.md,
            isSpinning && "animate-spin",
          )}
        />
      )}
      {label ?? config.label}
    </span>
  );
}
