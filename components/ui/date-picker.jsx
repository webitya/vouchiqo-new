"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Safely parse YYYY-MM-DD string into a local Date without timezone offset shift
const parseLocalDate = (dateStr) => {
  if (!dateStr) return undefined;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === "string") {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        return new Date(y, m, d);
      }
    }
  }
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  iconColor = "text-blue-600",
  minDate = new Date(new Date().setHours(0, 0, 0, 0)),
  allowPastDates = false,
}) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = parseLocalDate(value);

  const handleSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  const isDateDisabled = (date) => {
    if (allowPastDates) return false;
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return targetDate < startOfToday;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium text-xs h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 cursor-pointer shadow-2xs transition-all",
            !value && "text-slate-400 font-normal",
            value && "border-slate-300 bg-slate-50/50 font-bold text-slate-900",
            className,
          )}
        >
          <CalendarIcon className={cn("mr-2 h-4 w-4 shrink-0", iconColor)} />
          {selectedDate && !Number.isNaN(selectedDate.getTime()) ? (
            <span className="font-bold text-slate-900 text-xs font-mono">
              {selectedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[350] rounded-2xl bg-white border-slate-200 shadow-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
