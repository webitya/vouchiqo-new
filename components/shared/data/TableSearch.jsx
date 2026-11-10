"use client";

/**
 * TableSearch — reusable, debounced search bar for data tables.
 *
 * Props:
 *   value        {string}            controlled value (raw input)
 *   onChange     {(val: string)=>void}  called on every keystroke
 *   onDebounced  {(val: string)=>void}  called after debounce delay (default 350 ms)
 *   placeholder  {string}            input placeholder
 *   debounceMs   {number}            debounce delay in ms (default 350)
 *   isLoading    {boolean}           show spinner instead of search icon
 *   resultCount  {number|null}       when provided, shows "N results" beside input
 *   className    {string}
 */

import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function TableSearch({
  value = "",
  onChange,
  onDebounced,
  placeholder = "Search...",
  debounceMs = 350,
  isLoading = false,
  resultCount = null,
  className,
}) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  // Keep local state in sync if parent resets value externally (e.g. clear button)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocalValue(v);
    onChange?.(v);

    if (onDebounced) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onDebounced(v), debounceMs);
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
    onDebounced?.("");
    clearTimeout(timerRef.current);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showSpinner = isLoading && localValue.trim().length > 0;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Input wrapper */}
      <div className="relative flex-1">
        {/* Leading icon */}
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {showSpinner ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400" />
          )}
        </span>

        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            "w-full h-8 pl-8 pr-7 text-[11.5px] rounded-lg border border-slate-200 bg-white",
            "text-slate-800 placeholder:text-slate-400",
            "outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
            "transition-all duration-150",
            showSpinner && "border-blue-300 ring-1 ring-blue-100",
          )}
        />

        {/* Clear button */}
        {localValue.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Result count badge */}
      {resultCount !== null && !isLoading && (
        <span className="shrink-0 text-[10.5px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 tabular-nums whitespace-nowrap">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}

      {/* Searching pill (animated) */}
      {showSpinner && (
        <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 animate-fade-in whitespace-nowrap">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Searching…
        </span>
      )}
    </div>
  );
}

export default TableSearch;