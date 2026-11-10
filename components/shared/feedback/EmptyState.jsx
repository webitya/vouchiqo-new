import { Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * EmptyState — standard empty / zero-data state display.
 *
 * @param {React.ComponentType} [icon=Info] - lucide icon
 * @param {string} [title="No items found"]
 * @param {string} [description]
 * @param {string} [actionLabel] - CTA button text
 * @param {function} [onAction] - callback CTA click handler
 * @param {string} [actionHref] - link-based CTA (use instead of or alongside onAction)
 * @param {string} [className]
 */
export default function EmptyState({
  icon: Icon = Info,
  title = "No items found",
  description = "There is nothing to display here right now.",
  actionLabel,
  onAction,
  actionHref,
  className,
}) {
  return (
    <div
      className={`bg-brand-bg border border-brand-border rounded-lg p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto shadow-sm my-6 ${className ?? ""}`}
    >
      <div className="p-3 bg-brand-surface rounded-full text-brand-navy border border-brand-border mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-heading text-base font-bold text-brand-text mb-1">
        {title}
      </h3>
      <p className="text-xs text-brand-subtext mb-5 max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Link-based CTA */}
      {actionLabel && actionHref && (
        <Button
          asChild
          className="btn-primary text-xs font-bold px-4 py-2 border-0 h-auto cursor-pointer shadow-none"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}

      {/* Callback-based CTA */}
      {actionLabel && onAction && !actionHref && (
        <Button
          onClick={onAction}
          className="btn-primary text-xs font-bold px-4 py-2 border-0 h-auto cursor-pointer shadow-none"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
