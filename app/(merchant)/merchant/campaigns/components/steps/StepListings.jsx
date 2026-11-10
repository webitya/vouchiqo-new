"use client";

import { Check, Percent, Plus, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { useWatch } from "react-hook-form";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OFFER_TYPES = [
  {
    value: "Percentage Discount (% off)",
    label: "Percentage Discount (% off)",
  },
  { value: "Flat ₹ Amount Off", label: "Flat ₹ Amount Off" },
  {
    value: "Buy One Get One (BOGO)",
    label: "Buy One Get One (BOGO)",
  },
  {
    value: "Free Gift / Service with Purchase",
    label: "Free Gift / Service with Purchase",
  },
  { value: "Bundle / Combo Pricing", label: "Bundle / Combo Pricing" },
];

export default function StepListings({
  control,
  register,
  setValue,
  watch,
  errors,
  filteredCoupons,
  listingSearch,
  setListingSearch,
  toggleCouponAttachment,
  onBack,
  onNext,
}) {
  const selectedOfferType = useWatch({ control, name: "offerType" });
  const rawCouponIds = useWatch({ control, name: "couponIds" });
  const attachedCouponIds = Array.isArray(rawCouponIds) ? rawCouponIds : [];

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans">
      <div className="border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-semibold text-slate-900">
          Step 2: Attach Listings
        </h3>
        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
          Set campaign promo code, offer type &amp; select coupons to attach to
          this campaign
        </p>
      </div>

      <div className="space-y-4">
        {/* Promo Code & Offer Type settings in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Campaign Promo Code"
            icon={Ticket}
            type="text"
            placeholder="e.g. SAVE20"
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
            className="font-mono uppercase font-semibold text-sm"
          />

          <FormSelect
            label="Offer Type"
            icon={Percent}
            options={OFFER_TYPES}
            required
            value={selectedOfferType}
            onValueChange={(val) =>
              setValue("offerType", val, { shouldValidate: true })
            }
            error={errors.offerType}
          />
        </div>

        {/* Search coupons */}
        <FormInput
          icon={Search}
          type="text"
          placeholder="Search coupons or deals by title or code..."
          value={listingSearch}
          onChange={(e) => setListingSearch(e.target.value)}
        />

        {/* Coupon selection list */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {filteredCoupons.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-400 font-medium">
              No coupons found matching search.
            </div>
          ) : (
            filteredCoupons.map((couponItem) => {
              const isAttached = attachedCouponIds.includes(couponItem._id);
              return (
                <div
                  key={couponItem._id}
                  onClick={() => toggleCouponAttachment(couponItem._id)}
                  className={cn(
                    "p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all select-none",
                    isAttached
                      ? "bg-rose-50/60 border-l-4 border-l-[#F72853]"
                      : "hover:bg-slate-50/80",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Plain CSS checkbox indicator */}
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                        isAttached
                          ? "border-[#F72853] bg-[#F72853] text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {isAttached && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        {couponItem.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium uppercase">
                        {couponItem.code || "DEALOFFER"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#F72853] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/80">
                    {couponItem.discountType === "percentage"
                      ? `${couponItem.discountValue || 0}% OFF`
                      : `₹${couponItem.discountValue || 0} OFF`}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <Link
          href="/merchant/coupons"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F72853] hover:text-[#e01e47] hover:underline"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </Link>
      </div>

      {/* Step 2 Actions */}
      <div className="flex justify-between pt-3.5 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-slate-600 border-slate-200 text-xs font-medium rounded-xl h-8 sm:h-9 px-4 cursor-pointer hover:bg-slate-50"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 sm:h-9 px-5 rounded-xl cursor-pointer shadow-xs"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
