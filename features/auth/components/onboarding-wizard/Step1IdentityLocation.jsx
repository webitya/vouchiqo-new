"use client";

import React from "react";
import { Building2, Store, MapPin, Map, Hash, Loader2, X } from "lucide-react";
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
import {
  CATEGORIES,
  BUSINESS_CONSTITUTIONS,
  FieldTip,
} from "./constants";

export default function Step1IdentityLocation({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  duplicateErrors,
  checkDuplicateField,
  isFetchingLocation,
  handleFetchLocation,
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
  return (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
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
                  Registered Business Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Building2
                    className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.registeredName ? "text-rose-500" : "text-slate-400"}`}
                  />
                  <Input
                    type="text"
                    placeholder="Marbella Tiles & Sanitary Pvt Ltd"
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
                    placeholder="Marbella"
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
              <div className="space-y-3 p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="space-y-1">
                  <Label
                    className={getLabelClass(
                      "customCategoryName",
                      "text-xs font-semibold text-blue-950",
                    )}
                  >
                    Custom Category Name{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Handmade Crafts, Event Management..."
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
                      "bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] text-xs rounded-lg h-9 px-3 font-normal text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25",
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
                        "text-xs font-semibold text-blue-950",
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
                      ⚠️ Please write at least {80 - customCategoryCharCount}{" "}
                      more character(s) explaining your business.
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
              <div className="flex flex-wrap gap-1.5 p-2 bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] rounded-lg min-h-[38px] items-center focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/25 focus-within:shadow-[0_2px_12px_rgba(37,99,235,0.22)] transition-all">
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
                  Operating Store Address{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Shop No. 14, Lalpur Chowk, Main Road, Ranchi, Jharkhand – 834001"
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
                    setFormData({ ...formData, googleUrl: e.target.value });
                    clearFieldError("googleUrl");
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

              <div className="space-y-1">
                <Label className={getLabelClass("city")}>
                  City / District <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => {
                    const geo = lookupStateByCity(val);
                    setFormData((prev) => ({
                      ...prev,
                      city: val,
                      state: geo ? geo.state : prev.state,
                      pincode:
                        geo && !prev.pincode ? geo.pincode : prev.pincode,
                    }));
                    clearFieldError("city");
                  }}
                >
                  <SelectTrigger className={getSelectClass("city")}>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {INDIAN_CITIES.map((c) => (
                      <SelectItem
                        key={`${c.city}-${c.state}`}
                        value={c.city}
                        className="text-xs"
                      >
                        {c.city} ({c.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Map
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

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Store GPS Location{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300/80 font-semibold text-xs h-9 rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {isFetchingLocation ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>
                    {formData.latitude
                      ? "GPS Captured ✓"
                      : "Fetch GPS Coordinates"}
                  </span>
                </Button>
                {formData.latitude && formData.longitude ? (
                  <FieldTip
                    text={`Captured: ${formData.latitude}° N, ${formData.longitude}° E`}
                  />
                ) : (
                  <FieldTip text="Auto-detect exact lat & lng for maps navigation." />
                )}
              </div>
            </div>
          </div>
        </Card>
  );
}
