"use client";

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Helper functions to safely extract primitive string values/labels
const extractVal = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object")
    return String(v.value || v.city || v.name || v.id || JSON.stringify(v));
  return String(v);
};

const extractLabel = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object")
    return String(v.label || v.name || v.city || v.title || extractVal(v));
  return String(v);
};

/**
 * FormSelect — Universal, DRY Select Dropdown component.
 */
export default function FormSelect({
  name,
  label,
  icon: Icon,
  options = [],
  placeholder = "Select an option",
  required = false,
  error,
  hint,
  value,
  onValueChange,
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
}) {
  const errorMessage =
    error?.message || (typeof error === "string" ? error : undefined);

  // Normalise options into uniform [{ value: string, label: string }] format
  const normalised = Array.isArray(options)
    ? options.map((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
          return { value: String(opt), label: String(opt) };
        }
        if (opt && typeof opt === "object") {
          return {
            value: extractVal(opt.value !== undefined ? opt.value : opt),
            label: extractLabel(opt.label !== undefined ? opt.label : opt),
          };
        }
        return { value: String(opt), label: String(opt) };
      })
    : Object.entries(options).map(([v, l]) => ({
        value: extractVal(v),
        label: extractLabel(l),
      }));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label
          htmlFor={name}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
          <span>{label}</span>
          {required && (
            <span className="text-red-500 font-medium ml-0.5">*</span>
          )}
        </Label>
      )}

      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger
          id={name}
          aria-required={required}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage ? `${name}-error` : hint ? `${name}-hint` : undefined
          }
          className={cn(
            "h-10 text-xs border-slate-200 bg-white text-slate-800 font-medium focus:ring-[#007F79]/20 focus:border-[#007F79] rounded-xl",
            errorMessage && "border-red-500 focus:ring-red-500/20",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-white border border-slate-200 text-slate-800 shadow-lg rounded-xl z-[300] p-1",
            contentClassName,
          )}
        >
          {normalised.map((opt, idx) => (
            <SelectItem
              key={`${opt.value}-${idx}`}
              value={opt.value}
              className="text-xs cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:bg-[#007F79]/10 focus:text-[#007F79] font-medium rounded-lg"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errorMessage && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in-50"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
      {!errorMessage && hint && (
        <p id={`${name}-hint`} className="text-[11px] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
