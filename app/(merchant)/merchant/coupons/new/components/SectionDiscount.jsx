"use client";

import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  FileText,
  Gift,
  Percent,
  RefreshCw,
  ShieldCheck,
  Tag,
  Ticket,
} from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DISCOUNT_TYPES = [
  { value: "% Off", label: "% Off (Percentage Discount)" },
  { value: "Flat ₹ Off", label: "Flat ₹ Off (Fixed Amount)" },
  { value: "BOGO", label: "BOGO (Buy 1 Get 1)" },
  { value: "Free Gift", label: "Free Gift with In-Store Purchase" },
  { value: "Other", label: "Other Custom In-Store Deal" },
];

const SPECIAL_OFFER_TYPES = [
  { value: "BOGO (Buy 1 Get 1)", label: "BOGO (Buy 1 Get 1)" },
  {
    value: "Free Gift with Purchase",
    label: "Free Gift with In-Store Purchase",
  },
  { value: "Free Service Upgrade", label: "Free In-Store Service Upgrade" },
  { value: "Bundle / Combo Price", label: "In-Store Combo Price" },
  { value: "Loyalty Reward", label: "Store Loyalty Reward" },
  { value: "Other Special Deal", label: "Other In-Store Special Deal" },
];

const REDEMPTION_METHODS = [
  {
    value: "Show Vouchiqo Smart Code at counter",
    label: "Show Vouchiqo Smart Code at store counter",
  },
  {
    value: "Show digital voucher on phone to cashier",
    label: "Show digital voucher on phone to cashier",
  },
  {
    value: "In-store QR code scan at billing counter",
    label: "In-store QR code scan at billing counter",
  },
];

export default function SectionDiscount({
  control,
  register,
  setValue,
  watch,
  errors,
  generateRandomCode,
  onBack,
  onNext,
}) {
  const offerType = useWatch({ control, name: "offerType" });
  const discountType = useWatch({ control, name: "discountType" }) || "% Off";
  const specialOfferType = useWatch({ control, name: "specialOfferType" });
  const redemptionMethod = useWatch({ control, name: "redemptionMethod" });

  const isFlatDiscount = discountType === "Flat ₹ Off";
  const isPercentageDiscount = discountType === "% Off";
  const isCustomDeal = !isFlatDiscount && !isPercentageDiscount;

  return (
    <Card className="border-slate-200/90 shadow-2xs rounded-xl bg-white p-3.5 sm:p-4 space-y-3.5 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#F72853]" />

      <div className="border-b border-slate-100 pb-2.5 pt-0.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] shrink-0">
            <Ticket className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-slate-800 tracking-tight">
              Section 3: Discount &amp; In-Store Mechanics
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Configure codes, discount values, caps &amp; in-store pricing
              structure
            </p>
          </div>
        </div>
      </div>

      {offerType === "code" && (
        <div className="space-y-3">
          {/* Offer Code Input Card */}
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 block">
                Offer Code Configuration
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={generateRandomCode}
                className="text-[11px] font-medium text-[#F72853] hover:text-[#e01e47] flex items-center gap-1 cursor-pointer h-auto p-0 border-0 bg-transparent shadow-none"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Auto-generate Code
              </Button>
            </div>
            <FormInput
              label="Offer Code (Uppercase, No Spaces)"
              icon={Ticket}
              type="text"
              placeholder="e.g. MARBLE20"
              required
              {...register("code")}
              onChange={(e) =>
                setValue(
                  "code",
                  e.target.value.toUpperCase().replace(/\s/g, ""),
                  { shouldValidate: true },
                )
              }
              error={errors.code}
              className="font-mono uppercase font-medium text-sm bg-white h-9"
            />
          </div>

          {/* Discount Type & Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Discount Type"
                  icon={Percent}
                  options={DISCOUNT_TYPES}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("discountType", val, { shouldValidate: true });
                    const currentVal = watch("discountValue");
                    const isNum =
                      currentVal !== undefined &&
                      currentVal !== null &&
                      currentVal !== "" &&
                      !Number.isNaN(Number(currentVal));
                    if (val === "% Off" || val === "Flat ₹ Off") {
                      if (!isNum) {
                        setValue("discountValue", "", { shouldValidate: true });
                      }
                    } else if (val === "BOGO") {
                      if (
                        isNum ||
                        !currentVal ||
                        currentVal === "20" ||
                        currentVal === "200"
                      ) {
                        setValue("discountValue", "Buy 1 Get 1", {
                          shouldValidate: true,
                        });
                      }
                    } else if (val === "Free Gift") {
                      if (
                        isNum ||
                        !currentVal ||
                        currentVal === "20" ||
                        currentVal === "200"
                      ) {
                        setValue("discountValue", "Free Gift with Purchase", {
                          shouldValidate: true,
                        });
                      }
                    } else if (val === "Other") {
                      if (isNum) {
                        setValue("discountValue", "Special In-Store Offer", {
                          shouldValidate: true,
                        });
                      }
                    }
                  }}
                  error={errors.discountType}
                />
              )}
            />

            {isPercentageDiscount && (
              <FormInput
                label="Discount Percentage (%)"
                icon={Percent}
                type="number"
                placeholder="e.g. 20 (for 20% off)"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isFlatDiscount && (
              <FormInput
                label="Flat Discount Amount (₹)"
                icon={DollarSign}
                type="number"
                placeholder="e.g. 200 (for ₹200 off)"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isCustomDeal && (
              <FormInput
                label="Deal / Offer Detail"
                icon={Gift}
                type="text"
                placeholder="e.g. Buy 1 Get 1 or Free Gift on bill"
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}
          </div>

          {/* Max Cap & Min Order Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <FormInput
              label="Maximum Discount Cap (₹)"
              icon={ShieldCheck}
              type="number"
              placeholder="e.g. 2000 (Optional limit)"
              {...register("maxCap")}
              error={errors.maxCap}
            />

            <FormInput
              label="Minimum In-Store Purchase Value (₹)"
              icon={Tag}
              type="number"
              placeholder="e.g. 5000 (Optional minimum bill)"
              {...register("minOrderValue")}
              error={errors.minOrderValue}
            />
          </div>
        </div>
      )}

      {/* In-Store Price Drop / Deal Mode */}
      {offerType === "deal" && (
        <div className="space-y-3">
          <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl text-xs text-slate-700 font-normal flex items-center gap-2">
            <span>💡</span>
            <span>
              <span className="font-medium text-slate-900">In-Store Deal:</span>{" "}
              Set your original store MRP and discounted offer price for
              customers visiting your store.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              label="Original Price (MRP ₹)"
              icon={DollarSign}
              type="number"
              placeholder="e.g. 2000"
              {...register("originalPrice")}
              error={errors.originalPrice}
            />

            <FormInput
              label="Special Store Offer Price (Deal ₹)"
              icon={Tag}
              type="number"
              placeholder="e.g. 1499"
              {...register("salePrice")}
              error={errors.salePrice}
              className="font-medium text-emerald-700"
            />
          </div>
        </div>
      )}

      {/* Special Offer / Gift Mode */}
      {offerType === "special" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Controller
              name="specialOfferType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Special Offer Format"
                  icon={Gift}
                  options={SPECIAL_OFFER_TYPES}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("specialOfferType", val, { shouldValidate: true });
                  }}
                  error={errors.specialOfferType}
                />
              )}
            />

            <Controller
              name="redemptionMethod"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Redemption Method"
                  icon={Ticket}
                  options={REDEMPTION_METHODS}
                  required
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("redemptionMethod", val, { shouldValidate: true });
                  }}
                  error={errors.redemptionMethod}
                />
              )}
            />
          </div>

          <FormTextarea
            label="Full Special Offer Details"
            icon={FileText}
            rows={3}
            placeholder="e.g. Buy any 2 Marble Slabs and get 1 Grout Sealer packet completely FREE."
            required
            {...register("offerDetails")}
            error={errors.offerDetails}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2.5 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-medium rounded-xl border-slate-200 cursor-pointer h-8 px-3.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Next: Validity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
