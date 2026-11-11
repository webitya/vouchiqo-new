"use client";

import {
  Check,
  ChevronDown,
  Compass,
  Crosshair,
  Image as ImageIcon,
  Link2,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormInput, FormTextarea } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseGmapsCoordinates } from "@/lib/location-resolver";
import { showError, showSuccess } from "@/lib/toast";
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";
import OperatingHours from "./OperatingHours";

export default function Step2Location({
  register,
  setValue,
  watch,
  errors,
  handleImageUpload,
  uploadingShop,
  uploadingLogo,
  uploadingBanner,
  formData,
  handleHoursChange,
}) {
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
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

  const shopImage = watch("shopImage");
  const logo = watch("logo");
  const banner = watch("banner");
  const selectedCity = watch("city");
  const pincodeVal = watch("pincode") || "";

  const handleDetectGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setValue("lat", lat, { shouldValidate: true });
        setValue("lng", lng, { shouldValidate: true });
        setIsDetectingGps(false);
        showSuccess(`Exact GPS location detected: ${lat}, ${lng}`);
      },
      (err) => {
        setIsDetectingGps(false);
        showError(
          `GPS Detection: ${err.message || "Failed to fetch position"}. Please enter manually or check location permissions.`,
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleGmapsLinkChange = (e) => {
    const url = e.target.value;
    setValue("gmapsLink", url, { shouldValidate: true });
    const parsed = parseGmapsCoordinates(url);
    if (parsed) {
      setValue("lat", parsed.lat, { shouldValidate: true });
      setValue("lng", parsed.lng, { shouldValidate: true });
      showSuccess(
        `Extracted GPS coordinates from Google Maps: ${parsed.lat}, ${parsed.lng}`,
      );
    }
  };

  const handleCityChange = (cityName) => {
    setValue("city", cityName, { shouldValidate: true });
    const geo = lookupStateByCity(cityName);
    if (geo) {
      setValue("state", geo.state, { shouldValidate: true });
      if (!pincodeVal) {
        setValue("pincode", geo.pincode, { shouldValidate: true });
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setValue("pincode", pin, { shouldValidate: true });

    if (pin.length === 6) {
      setIsGeoLoading(true);
      const geo = await lookupByPincode(pin);
      setIsGeoLoading(false);

      if (geo) {
        if (geo.city) setValue("city", geo.city, { shouldValidate: true });
        if (geo.state) setValue("state", geo.state, { shouldValidate: true });
      }
    }
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

  const cityOptions = INDIAN_CITIES.map((c) => ({
    value: typeof c === "string" ? c : c.city,
    label: typeof c === "string" ? c : `${c.city} (${c.state})`,
  }));

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left font-sans overflow-visible">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>2. Visuals, Location &amp; Coordination</span>
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200"
        >
          Step 2 of 3
        </Badge>
      </div>

      {/* Media Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "SHOP PHOTO (OPTIONAL)",
            field: "shopImage",
            state: shopImage,
            loading: uploadingShop,
            ratio: "Ratio 1200×800 (Optional)",
            btnText: "Upload Photo (1200×800)",
          },
          {
            label: "STORE LOGO",
            field: "logo",
            state: logo,
            loading: uploadingLogo,
            ratio: "Ratio 1:1 Square (400×400)",
            btnText: "Upload Logo (400×400)",
          },
          {
            label: "BANNER IMAGE",
            field: "banner",
            state: banner,
            loading: uploadingBanner,
            ratio: "Ratio 1200×400",
            btnText: "Upload Banner (1200×400)",
          },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-festival-teal" />
                {item.label}
              </span>
              <span className="text-[9px] font-semibold text-slate-400">
                {item.ratio}
              </span>
            </div>
            <div className="relative group flex flex-col items-center justify-between border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/60 hover:bg-slate-100/80 transition-all cursor-pointer min-h-[140px] overflow-hidden text-center">
              {item.state ? (
                <div className="w-full flex flex-col items-center justify-center space-y-1.5 py-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.state}
                    alt={item.label}
                    className="max-h-24 max-w-full object-contain rounded-lg border border-slate-200 shadow-2xs"
                  />
                  <span className="text-[10px] text-festival-teal font-bold underline">
                    Click to replace image
                  </span>
                </div>
              ) : (
                <div className="my-auto py-2 space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-festival-teal transition-colors mx-auto mb-1" />
                  <span className="text-xs text-slate-700 font-bold block">
                    {item.loading ? "Uploading..." : `Upload ${item.label}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {item.ratio}
                  </span>
                </div>
              )}

              <div className="w-full mt-2 pt-1 border-t border-slate-200/60">
                <span className="w-full py-1.5 px-2 bg-festival-teal hover:bg-festival-teal-dark text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-2xs transition-colors">
                  <Upload className="w-3 h-3" />
                  {item.loading ? "Uploading..." : item.btnText}
                </span>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, item.field)}
                disabled={item.loading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FormTextarea
            label="Complete Physical Store Address"
            icon={MapPin}
            rows={2}
            placeholder="Shop No, Building Name, Street, Landmark"
            {...register("address")}
            error={errors.address}
          />
        </div>

        <FormInput
          label="Postal PIN Code"
          icon={MapPin}
          placeholder="834001"
          maxLength={6}
          {...register("pincode")}
          onChange={handlePincodeChange}
          error={errors.pincode}
          hint={isGeoLoading ? "Auto-detecting City & State..." : undefined}
        />

        <div className="space-y-1 relative" ref={cityDropdownRef}>
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-festival-teal" />
            <span>Store City Location</span>
            <span className="text-rose-500 font-medium">*</span>
          </label>

          {/* Searchable Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCityOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer transition-all h-10 px-3 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl focus:border-festival-teal focus:ring-2 focus:ring-festival-teal/20"
          >
            <span className="truncate">
              {selectedCity
                ? `${selectedCity}${
                    watch("state") ? ` (${watch("state")})` : ""
                  }`
                : "Search & select city..."}
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
              className="absolute left-0 right-0 top-full mt-1.5 z-[350] bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-2"
            >
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

              <div
                ref={bindCityScrollListRef}
                data-lenis-prevent="true"
                onWheel={(e) => {
                  e.stopPropagation();
                  const container = e.currentTarget;
                  if (container.scrollHeight > container.clientHeight) {
                    const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
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
                      onClick={() => handleCityChange(citySearch.trim())}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-festival-teal hover:underline cursor-pointer bg-festival-teal/5 border border-festival-teal/20 px-2.5 py-1 rounded-md"
                    >
                      <span>+ Use "{citySearch.trim()}" as custom city</span>
                    </button>
                  </div>
                ) : (
                  filteredCities.map((c) => {
                    const isSelected =
                      selectedCity?.toLowerCase() === c.city.toLowerCase();
                    return (
                      <button
                        key={`${c.city}-${c.state}`}
                        type="button"
                        onClick={() => handleCityChange(c.city)}
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

          {errors.city && (
            <p className="text-xs text-red-500 font-medium mt-0.5">
              {errors.city.message || "City is required"}
            </p>
          )}
        </div>

        <FormInput
          label="State / Region"
          icon={MapPin}
          placeholder="State Name"
          {...register("state")}
          error={errors.state}
        />

        <FormInput
          label="Google Maps Business Location Link (GMB)"
          icon={Link2}
          placeholder="https://maps.app.goo.gl/... or paste GMB link"
          {...register("gmapsLink")}
          onChange={handleGmapsLinkChange}
          error={errors.gmapsLink}
          hint="Pasting a Google Maps link will auto-extract latitude & longitude"
        />
      </div>

      {/* GPS & MAP COORDINATES SECTION */}
      <div className="border border-brand-border bg-warm-ivory p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-festival-teal" />
              Exact Store GPS Coordinates (Latitude &amp; Longitude)
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Powers 100% accurate pin positioning and distance calculation on
              Nearby Offers map
            </p>
          </div>

          <Button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="bg-festival-teal hover:bg-festival-teal-dark text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isDetectingGps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>
              {isDetectingGps
                ? "Detecting GPS..."
                : "Detect Current GPS Location"}
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <FormInput
            label="Latitude (GPS)"
            icon={Compass}
            placeholder="23.344102"
            {...register("lat")}
            error={errors.lat}
          />
          <FormInput
            label="Longitude (GPS)"
            icon={Compass}
            placeholder="85.309615"
            {...register("lng")}
            error={errors.lng}
          />
        </div>
      </div>

      {/* STORE OPERATING HOURS SECTION */}
      {formData && handleHoursChange && (
        <OperatingHours
          formData={formData}
          handleHoursChange={handleHoursChange}
        />
      )}
    </Card>
  );
}
