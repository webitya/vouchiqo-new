"use client";

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * FormTextarea — labelled textarea supporting RHF and controlled forms.
 */
export default function FormTextarea({
  name,
  label,
  icon: Icon,
  rows = 4,
  maxLength,
  showCounter = true,
  placeholder,
  required = false,
  error,
  hint,
  value,
  onChange,
  className,
  ...rest
}) {
  const errorMessage =
    error?.message || (typeof error === "string" ? error : undefined);

  const fieldName = name || rest.name;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label
            htmlFor={fieldName}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
            <span>{label}</span>
            {required && (
              <span className="text-red-500 font-medium ml-0.5">*</span>
            )}
          </Label>
        </div>
      )}

      <Textarea
        id={fieldName}
        name={fieldName}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!errorMessage}
        aria-describedby={
          errorMessage
            ? `${fieldName}-error`
            : hint
              ? `${fieldName}-hint`
              : undefined
        }
        className={cn(
          "text-sm border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-brand-blue/40 resize-none leading-relaxed rounded-xl",
          errorMessage && "border-red-500 focus-visible:ring-red-500/30",
        )}
        {...rest}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
      />

      {errorMessage && (
        <p
          id={`${fieldName}-error`}
          role="alert"
          className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in-50"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
      {!errorMessage && hint && (
        <p id={`${fieldName}-hint`} className="text-[11px] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
