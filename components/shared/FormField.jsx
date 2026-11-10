"use client";

import { Label } from "@/components/ui/label";

/**
 * Reusable form field label with an optional leading icon and hint.
 *
 * Replaces the 6 verbatim `FieldLabel` copies scattered across merchant
 * components (BusinessInfo, ContactLocation, ImageUploader, OperatingHours,
 * StoreAddress, CouponForm).
 *
 * @param {React.ComponentType} icon - lucide-react icon component
 * @param {string} hint - small grey clarification shown in parentheses
 * @param {string} className - extra classes (e.g. "mb-2" for image uploader)
 */
export default function FormField({
  icon: Icon,
  children,
  hint,
  className = "mb-1.5",
}) {
  return (
    <Label
      className={`text-xs font-bold text-brand-text uppercase flex items-center gap-1.5 ${className} text-left`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
      <span>{children}</span>
      {hint && (
        <span className="text-[10px] font-medium text-brand-subtext normal-case tracking-normal">
          ({hint})
        </span>
      )}
    </Label>
  );
}
