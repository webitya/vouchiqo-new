"use client";

import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FormActions — standardised submit + cancel row for all forms.
 *
 * @param {string} [submitText="Save Changes"] - submit button label
 * @param {string} [cancelText="Cancel"] - cancel button label
 * @param {boolean} [loading=false] - shows spinner on submit button
 * @param {boolean} [disabled=false] - disables the submit button
 * @param {function} [onCancel] - cancel click handler (omit to hide cancel button)
 * @param {React.ComponentType} [submitIcon=Save] - icon shown on submit button
 * @param {"start"|"end"|"between"} [align="end"] - row alignment
 * @param {boolean} [destructive=false] - makes submit button red (delete flows)
 * @param {string} [className] - extra classes on the wrapper div
 */
export default function FormActions({
  submitText = "Save Changes",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  onCancel,
  submitIcon: SubmitIcon = Save,
  align = "end",
  destructive = false,
  className,
}) {
  const alignClass =
    {
      start: "justify-start",
      end: "justify-end",
      between: "justify-between",
    }[align] ?? "justify-end";

  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 border-t border-brand-border",
        alignClass,
        className,
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-9 px-4 text-sm font-semibold border-brand-border text-brand-subtext hover:text-brand-text hover:bg-brand-surface shadow-none cursor-pointer"
        >
          <X className="w-4 h-4 mr-1.5" />
          {cancelText}
        </Button>
      )}

      <Button
        type="submit"
        disabled={loading || disabled}
        className={cn(
          "h-9 px-5 text-sm font-bold shadow-none cursor-pointer flex items-center gap-1.5",
          destructive
            ? "bg-brand-error hover:bg-red-700 text-white"
            : "bg-brand-navy hover:bg-brand-navy/90 text-white",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <SubmitIcon className="w-4 h-4" />
            {submitText}
          </>
        )}
      </Button>
    </div>
  );
}
