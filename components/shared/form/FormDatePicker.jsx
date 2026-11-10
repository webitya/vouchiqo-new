"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * FormDatePicker — labelled date picker using shadcn Calendar in a Popover.
 *
 * @param {string} name - field name
 * @param {string} label - visible label text
 * @param {React.ComponentType} [icon] - lucide icon prepended to label
 * @param {Date} [value] - controlled date value
 * @param {function} [onChange] - (date: Date) => void
 * @param {Date} [minDate] - earliest selectable date
 * @param {Date} [maxDate] - latest selectable date
 * @param {string} [placeholder="Pick a date"]
 * @param {boolean} [required=false]
 * @param {string} [error]
 * @param {string} [hint]
 * @param {boolean} [disabled=false]
 * @param {string} [dateFormat="PPP"] - date-fns format string
 * @param {string} [className]
 */
export default function FormDatePicker({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  required = false,
  error,
  hint,
  disabled = false,
  dateFormat = "PPP",
  className,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label
          htmlFor={name}
          className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            disabled={disabled}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${name}-error` : hint ? `${name}-hint` : undefined
            }
            className={cn(
              "h-9 w-full justify-start text-left font-normal text-sm border-brand-border bg-brand-bg hover:bg-brand-surface",
              !value && "text-brand-subtext/60",
              error && "border-brand-error",
              "shadow-none",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-subtext shrink-0" />
            {value ? (
              <span className="text-brand-text">
                {format(value, dateFormat)}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-brand-bg border-brand-border shadow-lg"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-[11px] text-brand-error font-medium"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${name}-hint`} className="text-[11px] text-brand-subtext">
          {hint}
        </p>
      )}
    </div>
  );
}
