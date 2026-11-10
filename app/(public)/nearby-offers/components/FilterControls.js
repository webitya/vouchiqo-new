"use client";

import { Loader2, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Filter controls panel: search bar, filters toggle, collapsible filter drawer.
 */
export default function FilterControls({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  activeFilterCount,
  distance,
  setDistance,
  categoryFilter,
  setCategoryFilter,
  dealTypeFilter,
  setDealTypeFilter,
  sortOrder,
  setSortOrder,
  showMap,
  setShowMap,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search brands or discount deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs border-brand-border bg-white rounded-xl focus:ring-brand-blue w-full shadow-none"
          />
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 h-9 border rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            showFilters || activeFilterCount > 0
              ? "bg-[#eff6ff] text-brand-blue border-blue-200"
              : "bg-white text-slate-700 border-brand-border hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand-blue text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Map View Toggle */}
        {!showMap && (
          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-1.5 px-3 h-9 bg-white text-slate-700 border border-brand-border hover:bg-slate-50 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-none"
          >
            <span className="w-3.5 h-3.5">🗺</span>
            <span>Map View</span>
          </button>
        )}
      </div>

      {/* Collapsible filter drawer */}
      {showFilters && (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 text-left animate-fade-in-up space-y-3.5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <FilterSelect
              label="Radius Distance"
              value={distance}
              onChange={setDistance}
            >
              <SelectItem value="2">Within 2 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km (Default)</SelectItem>
              <SelectItem value="25">Within 25 km</SelectItem>
            </FilterSelect>

            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Dining &amp; Food</SelectItem>
              <SelectItem value="fashion">Fashion &amp; Apparel</SelectItem>
              <SelectItem value="home">Home Improvements</SelectItem>
              <SelectItem value="travel">Travel &amp; Hotels</SelectItem>
            </FilterSelect>

            <FilterSelect
              label="Coupon Type"
              value={dealTypeFilter}
              onChange={setDealTypeFilter}
            >
              <SelectItem value="all">All Coupon Types</SelectItem>
              <SelectItem value="coupon">Promo Codes Only</SelectItem>
              <SelectItem value="offer">Direct Offers Only</SelectItem>
            </FilterSelect>

            <FilterSelect
              label="Sort Results"
              value={sortOrder}
              onChange={setSortOrder}
            >
              <SelectItem value="distance">Nearest First</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
            </FilterSelect>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[10px] font-bold text-slate-500 hover:text-brand-navy hover:underline cursor-pointer bg-transparent border-none"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-brand-subtext uppercase tracking-wide">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-[10px] h-8 bg-white border-brand-border cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-brand-border text-brand-text text-xs">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}
