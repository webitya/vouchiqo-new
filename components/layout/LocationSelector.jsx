"use client";

import { Check, ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/hooks/use-location";
import { INDIAN_CITIES } from "@/utils/cities";

export default function LocationSelector({
  isMobile = false,
  inDrawer = false,
  onMobileSelect = null,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const { city, setCity, status, detect } = useLocation();

  const isDetecting = status === "detecting";

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Click-outside to close (only if not in mobile drawer to avoid conflicts)
  useEffect(() => {
    if (inDrawer) return;
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [inDrawer]);

  const filtered =
    query.length > 0
      ? INDIAN_CITIES.filter((c) =>
          c.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 10)
      : INDIAN_CITIES.slice(0, 10);

  function handleSelect(selectedCity) {
    setCity(selectedCity);
    setOpen(false);
    setQuery("");
    if (onMobileSelect) onMobileSelect();
  }

  function handleDetect() {
    window.dispatchEvent(new CustomEvent("show-location-prompt"));
    setOpen(false);
    setQuery("");
    if (onMobileSelect) onMobileSelect();
  }

  const displayLabel = isDetecting
    ? "Detecting…"
    : city
      ? city.length > 10
        ? `${city.slice(0, 9)}…`
        : city
      : "Location";

  /* ─── Trigger Button ─── */
  const trigger = (
    <button
      id="location-selector-trigger"
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label="Select location"
      aria-expanded={open}
      className={`
        flex items-center justify-between font-semibold transition-all duration-200 cursor-pointer select-none outline-none
        ${
          inDrawer
            ? "w-full px-4 py-3 text-slate-700 hover:bg-[#eff6ff] hover:text-[#2563eb] border-b border-slate-100"
            : isMobile
              ? "text-[11px] text-[#2563eb] bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-md px-2.5 py-1.5 hover:bg-[#2563eb]/10"
              : "h-8 sm:h-8.5 xl:h-9 text-xs xl:text-[13px] text-blue-700 bg-blue-50/50 border border-blue-200/80 rounded-lg px-2 sm:px-2.5 xl:px-3 hover:bg-blue-100/60 hover:border-blue-300 hover:shadow-xs shrink-0 max-w-[125px] sm:max-w-[135px] xl:max-w-[160px]"
        }
      `}
    >
      <div className="flex items-center gap-1 xl:gap-1.5 min-w-0">
        {isDetecting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        )}
        <span className="truncate leading-none">
          {inDrawer
            ? city
              ? `Location: ${city}`
              : "Select Location"
            : displayLabel}
        </span>
      </div>
      <ChevronDown
        className={`w-3 h-3 xl:w-3.5 xl:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
          open ? "rotate-180 text-blue-500" : ""
        }`}
      />
    </button>
  );

  /* ─── Dropdown Panel (Desktop & Tablet Nav overlay) ─── */
  const dropdown = open && (
    <div
      className="
        absolute top-full mt-2 w-[240px] bg-white rounded-xl
        shadow-xl border border-slate-100 z-[200] overflow-hidden
        animate-[fadeInScale_0.15s_ease-out]
        right-0 lg:right-auto lg:left-0
      "
    >
      <div className="p-2.5 space-y-2">
        {/* GPS Detect Button */}
        <button
          type="button"
          onClick={handleDetect}
          disabled={isDetecting}
          className="
            w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-slate-50 border border-slate-300 text-slate-700
            text-[12px] font-medium
            hover:bg-slate-100 hover:border-slate-400 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          {isDetecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-slate-500" />
          ) : (
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          )}
          <span>{isDetecting ? "Detecting…" : "Use Current Location"}</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg
              bg-slate-50 border border-slate-100 text-slate-800
              placeholder:text-slate-400 outline-none
              focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200
            "
          />
        </div>

        {/* City List */}
        <div className="max-h-[160px] overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
          {filtered.length === 0 ? (
            <p className="text-center text-[11px] text-slate-400 py-2">
              No cities found
            </p>
          ) : (
            filtered.map((c) => {
              const isActive = city === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }
                  `}
                >
                  <span>{c}</span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Clear option */}
        {city && (
          <button
            type="button"
            onClick={() => {
              setCity(null);
              setOpen(false);
            }}
            className="w-full flex items-center justify-center py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11.5px] font-semibold transition-all duration-200 hover:bg-red-100 hover:text-red-700 cursor-pointer"
          >
            Clear Location
          </button>
        )}
      </div>
    </div>
  );

  /* ─── Inline Panel (For Mobile Drawer) ─── */
  const inlinePanel = inDrawer && open && (
    <div className="w-full bg-slate-50/70 border-b border-slate-100 p-3.5 space-y-2.5 animate-fade-in-scale">
      {/* GPS Detect Button */}
      <button
        type="button"
        onClick={handleDetect}
        disabled={isDetecting}
        className="
          w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-white border border-slate-300 text-slate-700
          text-[12px] font-medium
          hover:bg-slate-50 hover:border-slate-400 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
        "
      >
        {isDetecting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-slate-500" />
        ) : (
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
        )}
        <span>{isDetecting ? "Detecting…" : "Use Current Location"}</span>
      </button>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg
            bg-white border border-slate-200 text-slate-800
            placeholder:text-slate-400 outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200
          "
        />
      </div>

      {/* City List */}
      <div className="max-h-[160px] overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-center text-[11px] text-slate-400 py-2">
            No cities found
          </p>
        ) : (
          filtered.map((c) => {
            const isActive = city === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect(c)}
                className={`
                  w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 cursor-pointer
                  ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 bg-white border border-slate-100"
                  }
                `}
              >
                <span>{c}</span>
                {isActive && (
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Clear option */}
      {city && (
        <button
          type="button"
          onClick={() => {
            setCity(null);
            setOpen(false);
          }}
          className="w-full flex items-center justify-center py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11.5px] font-semibold transition-all duration-200 hover:bg-red-100 hover:text-red-700 cursor-pointer"
        >
          Clear Location
        </button>
      )}
    </div>
  );

  return (
    <div className={inDrawer ? "w-full" : "relative shrink-0"} ref={panelRef}>
      {trigger}
      {!inDrawer && dropdown}
      {inDrawer && inlinePanel}
    </div>
  );
}
