"use client";

import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
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
    <Card className="border-slate-200 shadow-xs rounded-xl bg-white p-3.5 sm:p-4 space-y-4 text-left font-sans">
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-heading font-semibold text-slate-900">
            Section 3: Discount &amp; In-Store Mechanics
          </h3>
          <p className="text-[11px] text-slate-500 font-normal">
            Configure codes, discount values, caps &amp; in-store pricing
            structure
          </p>
        </div>
      </div>

      {offerType === "code" && (
        <div className="space-y-4">
          {/* Offer Code Input with Auto-generate button */}
          <FormInput
            label="Offer Code (Uppercase, No Spaces)"
            action={
              <Button
                type="button"
                variant="ghost"
                onClick={generateRandomCode}
                className="text-xs font-medium text-[#007F79] hover:text-[#00635E] hover:bg-[#007F79]/10 flex items-center gap-1.5 cursor-pointer h-7 px-2 rounded-md transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-generate Code</span>
              </Button>
            }
            type="text"
            placeholder="SAVE20"
            required
            {...register("code")}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/\s/g, "");
              e.target.value = val;
              setValue("code", val, { shouldValidate: true });
            }}
            error={errors.code}
            inputClassName="font-mono uppercase font-semibold text-sm tracking-wider"
          />

          {/* Discount Type & Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Discount Type"
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
                type="number"
                placeholder="20"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isFlatDiscount && (
              <FormInput
                label="Flat Discount Amount (₹)"
                type="number"
                placeholder="200"
                required
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}

            {isCustomDeal && (
              <FormInput
                label="Deal / Offer Detail"
                type="text"
                placeholder="Buy 1 Get 1 Free"
                {...register("discountValue")}
                error={errors.discountValue}
              />
            )}
          </div>

          {/* Max Cap & Min Order Value in 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Maximum Discount Cap (₹)"
              type="number"
              placeholder="2000"
              {...register("maxCap")}
              error={errors.maxCap}
            />

            <FormInput
              label="Minimum In-Store Purchase Value (₹)"
              type="number"
              placeholder="5000"
              {...register("minOrderValue")}
              error={errors.minOrderValue}
            />
          </div>
        </div>
      )}

      {/* In-Store Price Drop / Deal Mode */}
      {offerType === "deal" && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-normal">
            <span className="font-medium text-slate-900">In-Store Deal:</span>{" "}
            Set your original store MRP and discounted offer price for customers
            visiting your store.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Original Price (MRP ₹)"
              type="number"
              placeholder="2000"
              {...register("originalPrice")}
              error={errors.originalPrice}
            />

            <FormInput
              label="Special Store Offer Price (Deal ₹)"
              type="number"
              placeholder="1499"
              {...register("salePrice")}
              error={errors.salePrice}
              inputClassName="font-medium text-emerald-700"
            />
          </div>
        </div>
      )}

      {/* Special Offer / Gift Mode */}
      {offerType === "special" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="specialOfferType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Special Offer Format"
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
            rows={3}
            placeholder="Buy any 2 items and get 1 complimentary gift."
            required
            {...register("offerDetails")}
            error={errors.offerDetails}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-medium rounded-lg border-slate-200 cursor-pointer h-8 px-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Next: Validity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
