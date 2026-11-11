"use client";

import {
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  Hash,
  Loader2,
  Map as MapIcon,
  MapPin,
  Search,
  Store,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";
import { BUSINESS_CONSTITUTIONS, CATEGORIES, FieldTip } from "./constants";

export default function Step1IdentityLocation({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  duplicateErrors,
  checkDuplicateField,
  isFetchingLocation,
  handleFetchLocation,
  handleGoogleUrlChange,
  subCategoryInput,
  setSubCategoryInput,
  subCategoryTags,
  handleAddTag,
  handleRemoveTag,
  customCategoryCharCount,
  getInputClass,
  getSelectClass,
  getTextareaClass,
  getLabelClass,
  shadowInputClass,
  shadowSelectClass,
}) {
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const cityDropdownRef = useRef(null);
  const citySearchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target)
      ) {
        setIsCityOpen(false);
      }
    }
    if (isCityOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => citySearchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCityOpen]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return INDIAN_CITIES;
    const q = citySearch.toLowerCase().trim();
    return INDIAN_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        Boolean(c.pincode?.includes(q)),
    );
  }, [citySearch]);

  const handleCitySelect = (cityName) => {
    const geo = lookupStateByCity(cityName);
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      state: geo ? geo.state : prev.state,
      pincode: geo && !prev.pincode ? geo.pincode : prev.pincode,
    }));
    clearFieldError("city");
    setIsCityOpen(false);
    setCitySearch("");
  };

  const bindCityScrollListRef = (node) => {
    if (!node || node._wheelBound) return;
    node._wheelBound = true;
    node.addEventListener(
      "wheel",
      (e) => {
        if (node.scrollHeight > node.clientHeight) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
          const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
          node.scrollTop += delta;
        }
      },
      { passive: false },
    );
  };

  return (
    <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5 overflow-visible">
      <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-slate-900">
            Section A: Business Identity &amp; Location
          </h3>
          <p className="text-xs text-slate-500 font-normal">
            Enter legal registered name and store operating address
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-medium border-slate-200 text-slate-600"
        >
          Section 1 of 6
        </Badge>
      </div>

      <div className="space-y-3">
        {/* 4-Column Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className={getLabelClass("registeredName")}>
              Registered Business Name <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Building2
                className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.registeredName ? "text-rose-500" : "text-slate-400"}`}
              />
              <Input
                type="text"
                placeholder="Registered Business Name"
                value={formData.registeredName}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    registeredName: e.target.value,
                  });
                  clearFieldError("registeredName");
                }}
                className={getInputClass("registeredName")}
              />
            </div>
            {fieldErrors.registeredName ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.registeredName}
              </p>
            ) : (
              <FieldTip text="Used for official business verification & tax invoicing." />
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Brand / Store Display Name{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="Store Name / Trading Name"
                value={formData.tradingName}
                onChange={(e) =>
                  setFormData({ ...formData, tradingName: e.target.value })
                }
                className={shadowInputClass}
              />
            </div>
            <FieldTip text="Customer-facing store name on deal cards & vouchers." />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Business Constitution <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.constitution}
              onValueChange={(val) =>
                setFormData({ ...formData, constitution: val })
              }
            >
              <SelectTrigger className={shadowSelectClass}>
                <SelectValue placeholder="Select constitution" />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                {BUSINESS_CONSTITUTIONS.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldTip text="Determines statutory compliance requirements." />
          </div>

          <div className="space-y-1">
            <Label className={getLabelClass("category")}>
              Primary Category <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(val) => {
                setFormData({ ...formData, category: val });
                clearFieldError("category");
              }}
            >
              <SelectTrigger className={getSelectClass("category")}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[300]">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.category}
              </p>
            ) : (
              <FieldTip text="Places your store in the correct offer section." />
            )}
          </div>
        </div>

        {/* Special Category Custom Field */}
        {formData.category === "others" && (
          <div className="space-y-3 p-3 bg-warm-ivory border border-brand-border rounded-lg">
            <div className="space-y-1">
              <Label
                className={getLabelClass(
                  "customCategoryName",
                  "text-xs font-semibold text-royal-plum",
                )}
              >
                Custom Category Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Handmade Crafts, Event Management..."
                value={formData.customCategoryName || ""}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    customCategoryName: e.target.value,
                  });
                  clearFieldError("customCategoryName");
                }}
                className={getInputClass(
                  "customCategoryName",
                  "bg-white border-2 border-brand-border shadow-xs text-xs rounded-lg h-9 px-3 font-normal text-slate-900 focus:border-festival-teal focus:ring-2 focus:ring-festival-teal/30",
                )}
              />
              {fieldErrors.customCategoryName && (
                <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                  {fieldErrors.customCategoryName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  className={getLabelClass(
                    "customCategoryNotes",
                    "text-xs font-semibold text-royal-plum",
                  )}
                >
                  Explain your business in detail{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <span
                  className={`text-[11px] font-mono ${
                    customCategoryCharCount >= 80
                      ? "text-emerald-700 font-bold"
                      : "text-amber-700 font-semibold"
                  }`}
                >
                  Characters: {customCategoryCharCount} / 80 min
                </span>
              </div>
              <Textarea
                rows={2}
                placeholder="Describe your offerings, unique products, services and store operational setup in detail (minimum 80 characters required)..."
                value={formData.customCategoryNotes}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    customCategoryNotes: e.target.value,
                  });
                  clearFieldError("customCategoryNotes");
                }}
                className={getTextareaClass("customCategoryNotes")}
              />
              {fieldErrors.customCategoryNotes ? (
                <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                  {fieldErrors.customCategoryNotes}
                </p>
              ) : customCategoryCharCount < 80 ? (
                <p className="text-[10px] text-amber-700 font-medium">
                  ⚠️ Please write at least {80 - customCategoryCharCount} more
                  character(s) explaining your business.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Sub-Category Chips */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            Sub-Category Tags Chips (Press Enter)
          </Label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-white border-2 border-brand-border shadow-xs rounded-lg min-h-[38px] items-center focus-within:border-festival-teal focus-within:ring-2 focus-within:ring-festival-teal/30 focus-within:shadow-md transition-all">
            {subCategoryTags.map((tag) => (
              <Badge
                key={tag}
                className="bg-slate-100 text-slate-800 border-slate-200 text-xs font-medium py-0.5 px-2 flex items-center gap-1 shadow-2xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              placeholder="Type tag & press Enter..."
              value={subCategoryInput}
              onChange={(e) => setSubCategoryInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent text-xs outline-none flex-1 min-w-[140px] font-normal text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <FieldTip text="Helps shoppers find your specific offers using search & filter keywords." />
        </div>

        {/* Operating Address & GMB Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className={getLabelClass("address")}>
              Operating Store Address <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={2}
              placeholder="Shop / Unit No., Building Name, Street / Landmark, City, State – PIN"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                clearFieldError("address");
              }}
              className={getTextareaClass("address")}
            />
            {fieldErrors.address ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.address}
              </p>
            ) : (
              <FieldTip text="Customers will visit this exact address to redeem in-store vouchers." />
            )}
          </div>

          <div className="space-y-1">
            <Label className={getLabelClass("googleUrl")}>
              Google Maps / GMB Profile Location Link{" "}
              <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={2}
              placeholder="https://maps.google.com/?q=... or GMB Profile Link"
              value={formData.googleUrl}
              onChange={(e) => {
                if (handleGoogleUrlChange) {
                  handleGoogleUrlChange(e.target.value);
                } else {
                  setFormData({ ...formData, googleUrl: e.target.value });
                  clearFieldError("googleUrl");
                }
              }}
              className={getTextareaClass("googleUrl")}
            />
            {fieldErrors.googleUrl ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.googleUrl}
              </p>
            ) : (
              <FieldTip text="Powers 1-tap Google Maps directions on deal vouchers." />
            )}
          </div>
        </div>

        {/* Geo & Pin Code Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className={getLabelClass("pincode")}>
              PIN Code <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Hash
                className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.pincode ? "text-rose-500" : "text-slate-400"}`}
              />
              <Input
                type="text"
                maxLength={6}
                placeholder="834001"
                value={formData.pincode}
                onChange={async (e) => {
                  const pin = e.target.value;
                  setFormData((prev) => ({ ...prev, pincode: pin }));
                  clearFieldError("pincode");
                  if (pin.length === 6) {
                    const geo = await lookupByPincode(pin);
                    if (geo) {
                      setFormData((prev) => ({
                        ...prev,
                        city: geo.city || prev.city,
                        state: geo.state || prev.state,
                      }));
                    }
                  }
                }}
                className={getInputClass("pincode")}
              />
            </div>
            {fieldErrors.pincode ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.pincode}
              </p>
            ) : (
              <FieldTip text="Groups your store under pin code offer filters." />
            )}
          </div>

          <div className="space-y-1 relative" ref={cityDropdownRef}>
            <Label className={getLabelClass("city")}>
              City / District <span className="text-rose-500">*</span>
            </Label>

            {/* Searchable Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCityOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between text-left cursor-pointer transition-all ${getSelectClass("city")}`}
            >
              <span className="truncate">
                {formData.city
                  ? `${formData.city}${
                      formData.state ? ` (${formData.state})` : ""
                    }`
                  : "Select City / District"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isCityOpen ? "rotate-180 text-festival-teal" : ""
                }`}
              />
            </button>

            {/* Dropdown with Instant Search Input */}
            {isCityOpen && (
              <div
                data-lenis-prevent="true"
                className="absolute left-0 right-0 top-full mt-1.5 z-[350] bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-2 animate-fadeInScale"
              >
                {/* Search Field */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={citySearchInputRef}
                    type="text"
                    placeholder="Search city, state, or PIN..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50 text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:bg-white focus:border-festival-teal focus:ring-1 focus:ring-festival-teal/20 outline-none transition-all font-sans"
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => setCitySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Scrollable City List */}
                <div
                  ref={bindCityScrollListRef}
                  data-lenis-prevent="true"
                  onWheel={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget;
                    if (container.scrollHeight > container.clientHeight) {
                      const delta =
                        e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
                      container.scrollTop += delta;
                    }
                  }}
                  className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar overscroll-contain"
                  style={{
                    overscrollBehavior: "contain",
                    touchAction: "pan-y",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {filteredCities.length === 0 ? (
                    <div className="py-2.5 px-2 text-center space-y-1.5">
                      <p className="text-xs text-slate-500">
                        No city found matching "{citySearch}"
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleCitySelect(citySearch.trim());
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-festival-teal hover:underline cursor-pointer bg-festival-teal/5 border border-festival-teal/20 px-2.5 py-1 rounded-md"
                      >
                        <span>+ Use "{citySearch.trim()}" as custom city</span>
                      </button>
                    </div>
                  ) : (
                    filteredCities.map((c) => {
                      const isSelected =
                        formData.city?.toLowerCase() === c.city.toLowerCase();
                      return (
                        <button
                          key={`${c.city}-${c.state}`}
                          type="button"
                          onClick={() => handleCitySelect(c.city)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-festival-teal text-white font-medium"
                              : "text-slate-700 hover:bg-slate-100 hover:text-festival-teal"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{c.city}</span>
                            <span
                              className={`text-[10.5px] ${
                                isSelected ? "text-white/80" : "text-slate-400"
                              }`}
                            >
                              ({c.state})
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {fieldErrors.city ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.city}
              </p>
            ) : (
              <FieldTip text="Lists your store under regional city offer hubs." />
            )}
          </div>

          <div className="space-y-1">
            <Label className={getLabelClass("state")}>
              State <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <MapIcon
                className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.state ? "text-rose-500" : "text-slate-400"}`}
              />
              <Input
                type="text"
                value={formData.state}
                onChange={(e) => {
                  setFormData({ ...formData, state: e.target.value });
                  clearFieldError("state");
                }}
                className={getInputClass("state")}
              />
            </div>
            {fieldErrors.state ? (
              <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                {fieldErrors.state}
              </p>
            ) : (
              <FieldTip text="Required for state GST & statutory compliance." />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-700">
                Store GPS Location{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              {formData.latitude && formData.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#007F79] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <span>Verify on Map</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <Button
              type="button"
              onClick={handleFetchLocation}
              disabled={isFetchingLocation}
              className={`w-full font-medium text-xs h-9 rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-all ${
                formData.latitude && formData.longitude
                  ? "bg-[#007F79]/10 text-[#007F79] border-2 border-[#007F79]/30 hover:bg-[#007F79]/20"
                  : "bg-warm-ivory hover:bg-festival-teal/20 text-festival-teal border-2 border-brand-border"
              }`}
            >
              {isFetchingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-festival-teal" />
              )}
              <span className="truncate">
                {isFetchingLocation
                  ? "Detecting Coordinates…"
                  : formData.latitude && formData.longitude
                    ? `GPS Pinned (${formData.latitude}, ${formData.longitude}) ✓`
                    : "Fetch GPS Coordinates"}
              </span>
            </Button>

            {formData.latitude && formData.longitude ? (
              <div className="flex items-center justify-between text-[11px] text-[#007F79] bg-[#007F79]/5 border border-[#007F79]/20 rounded-md px-2 py-1">
                <span className="truncate">
                  {formData.gpsSource === "google_maps"
                    ? "Google Maps link parsed ✓"
                    : formData.gpsAccuracy
                      ? `GPS (±${formData.gpsAccuracy}m precision)`
                      : formData.gpsSource === "address"
                        ? "Address landmark resolved"
                        : "GPS Coordinates Captured ✓"}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => setShowManualCoords((prev) => !prev)}
                    className="text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    {showManualCoords ? "Hide Inputs" : "Edit Coords"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        latitude: "",
                        longitude: "",
                        gpsAccuracy: null,
                        gpsSource: "",
                      }))
                    }
                    className="text-[10px] text-rose-500 hover:text-rose-700 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <FieldTip text="Auto-detect exact lat & lng for maps navigation." />
                <button
                  type="button"
                  onClick={() => setShowManualCoords((prev) => !prev)}
                  className="text-[10px] text-[#007F79] hover:underline shrink-0 ml-1 cursor-pointer font-medium"
                >
                  {showManualCoords ? "Hide" : "Enter manually"}
                </button>
              </div>
            )}

            {/* Collapsible Manual Coordinates Inputs */}
            {showManualCoords && (
              <div className="grid grid-cols-2 gap-2 pt-1.5 animate-fadeInScale bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-[10.5px] text-slate-600 font-medium">
                    Latitude (° N)
                  </Label>
                  <Input
                    type="text"
                    placeholder="23.344100"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value.trim(),
                        gpsSource: "manual",
                      })
                    }
                    className="h-8 text-xs bg-white border border-slate-200 text-slate-800 font-sans"
                  />
                </div>
                <div>
                  <Label className="text-[10.5px] text-slate-600 font-medium">
                    Longitude (° E)
                  </Label>
                  <Input
                    type="text"
                    placeholder="85.309600"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value.trim(),
                        gpsSource: "manual",
                      })
                    }
                    className="h-8 text-xs bg-white border border-slate-200 text-slate-800 font-sans"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
