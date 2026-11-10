"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * StatusPill
 * Elegant outlined status pill matching the reference design:
 * - Amber outline with clock icon for Pending
 * - Emerald outline with check icon for Active/Paid/Approved
 * - Rose outline with X icon for Rejected/Unpaid/Inactive
 */
export function StatusPill({ status, type, icon: CustomIcon, className }) {
  const norm = String(status || "")
    .toLowerCase()
    .trim();

  let resolvedType = type;
  if (!resolvedType) {
    if (
      ["pending", "review", "queued", "draft", "waiting", "in review"].some(
        (s) => norm.includes(s),
      )
    ) {
      resolvedType = "pending";
    } else if (
      [
        "active",
        "paid",
        "approved",
        "published",
        "completed",
        "success",
        "live",
      ].some((s) => norm.includes(s))
    ) {
      resolvedType = "success";
    } else if (
      [
        "rejected",
        "unpaid",
        "failed",
        "inactive",
        "expired",
        "cancelled",
        "disabled",
      ].some((s) => norm.includes(s))
    ) {
      resolvedType = "danger";
    } else if (
      ["warning", "disputed", "flagged"].some((s) => norm.includes(s))
    ) {
      resolvedType = "warning";
    } else {
      resolvedType = "neutral";
    }
  }

  const styles = {
    pending:
      "border-amber-300 dark:border-amber-600/70 text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20",
    success:
      "border-emerald-300 dark:border-emerald-600/70 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20",
    danger:
      "border-rose-300 dark:border-rose-600/70 text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20",
    warning:
      "border-amber-400 dark:border-amber-600/80 text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30",
    neutral:
      "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40",
  };

  const icons = {
    pending: Clock,
    success: CheckCircle2,
    danger: XCircle,
    warning: AlertCircle,
    neutral: null,
  };

  const IconComponent =
    CustomIcon !== undefined ? CustomIcon : icons[resolvedType];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-semibold tracking-tight transition-colors whitespace-nowrap",
        styles[resolvedType] || styles.neutral,
        className,
      )}
    >
      {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span className="capitalize">{status}</span>
    </span>
  );
}

/**
 * MobileTableCard
 * Master mobile table card based on reference design:
 * - Top header with circular avatar, tiny badge label, bold title, subtitle & chevron
 * - Subtle divider
 * - 2-column key-value grid with muted uppercase labels & bold values
 * - Full-width soft-blue action banner button with right arrow (or custom dual action bar)
 */
export default function MobileTableCard({
  avatar,
  avatarText,
  avatarBg = "bg-blue-600",
  badge,
  title,
  subtitle,
  rightHeader,
  showChevron,
  onHeaderClick,
  fields = [],
  children,
  actionText,
  actionIcon: ActionIcon = ArrowRight,
  actionVariant = "primary",
  onAction,
  actionDisabled = false,
  actions,
  className,
}) {
  const shouldShowChevron =
    showChevron !== undefined ? showChevron : Boolean(onHeaderClick);
  const initials =
    typeof avatarText === "string" && avatarText.trim().length > 0
      ? avatarText
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all space-y-2 text-left font-sans",
        className,
      )}
    >
      {/* Top Header Section */}
      <div
        className={cn(
          "flex items-center gap-2.5",
          onHeaderClick && "cursor-pointer select-none",
        )}
        onClick={onHeaderClick}
      >
        {/* Avatar */}
        {avatar ? (
          <div className="shrink-0">{avatar}</div>
        ) : initials ? (
          <div
            className={cn(
              "w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs",
              avatarBg,
            )}
          >
            {initials}
          </div>
        ) : null}

        {/* Title & Subtitle block */}
        <div className="min-w-0 flex-1">
          {badge && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              {badge}
            </p>
          )}
          {title && (
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right header element or chevron */}
        {rightHeader ? (
          <div className="shrink-0">{rightHeader}</div>
        ) : shouldShowChevron ? (
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        ) : null}
      </div>

      {/* Top Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/80" />

      {/* 2-column Grid of Data Fields */}
      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
          {fields.map((field, idx) => {
            if (!field) return null;
            const isFullWidth = field.fullWidth || false;
            return (
              <div
                key={idx}
                className={cn(
                  "min-w-0",
                  isFullWidth ? "col-span-2" : "col-span-1",
                  field.className,
                )}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 leading-none">
                  {field.label}
                </div>
                <div className="min-w-0">
                  {field.isStatus ? (
                    <StatusPill
                      status={field.value}
                      type={field.statusType}
                      className={field.pillClassName}
                    />
                  ) : field.isAmount ? (
                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {field.value}
                    </div>
                  ) : field.isCode ? (
                    <code className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded font-mono font-bold text-xs">
                      {field.value}
                    </code>
                  ) : typeof field.value === "string" ||
                    typeof field.value === "number" ? (
                    <div className="text-[11.5px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {field.value}
                    </div>
                  ) : (
                    field.value
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Child content */}
      {children}

      {/* Bottom Action Footer */}
      {(actionText || actions) && (
        <div className="pt-0.5">
          {actions ? (
            actions
          ) : (
            <button
              type="button"
              disabled={actionDisabled}
              onClick={onAction}
              className={cn(
                "w-full h-8 rounded-lg px-3 py-1 flex items-center justify-between text-xs font-bold transition-all cursor-pointer select-none",
                actionVariant === "primary" &&
                  "bg-blue-50/90 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-400",
                actionVariant === "success" &&
                  "bg-emerald-50/90 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-400",
                actionVariant === "danger" &&
                  "bg-rose-50/90 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-400",
                actionVariant === "outline" &&
                  "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
                actionDisabled &&
                  "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <span>{actionText}</span>
              {ActionIcon && <ActionIcon className="w-4 h-4 shrink-0" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
