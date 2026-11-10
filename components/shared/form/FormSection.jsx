"use client";

import { cn } from "@/lib/utils";

/**
 * FormSection — consistent section wrapper for grouping related form fields.
 *
 * @param {string} title - section heading
 * @param {string} [description] - optional subtitle / helper text
 * @param {React.ComponentType} [icon] - lucide icon shown next to the title
 * @param {React.ReactNode} children - form fields inside the section
 * @param {boolean} [noBorder=false] - remove the bottom border
 * @param {string} [className] - extra classes on the wrapper
 */
export default function FormSection({
  title,
  description,
  icon: Icon,
  children,
  noBorder = false,
  className,
}) {
  return (
    <div
      className={cn(
        "pb-6",
        !noBorder && "border-b border-brand-border",
        className,
      )}
    >
      {/* Section header */}
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-brand-text">
          {Icon && (
            <span className="p-1 rounded-md bg-brand-navy/8 text-brand-navy">
              <Icon className="w-3.5 h-3.5" />
            </span>
          )}
          {title}
        </h3>
        {description && (
          <p className="text-xs text-brand-subtext mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
