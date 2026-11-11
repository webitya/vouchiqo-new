"use client";

import { ArrowLeft, ArrowRight, Lock, Upload } from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormInput, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
  { id: "others", label: "Others / Custom Category" },
];

export default function SectionBasic({
  control,
  register,
  setValue,
  watch,
  errors,
  merchant,
  uploadingImage,
  handleImageUpload,
  onBack,
  onNext,
}) {
  const headlineValue = useWatch({ control, name: "headline" }) ?? "";
  const shortDescriptionValue =
    useWatch({ control, name: "shortDescription" }) ?? "";
  const selectedCategory = useWatch({ control, name: "category" });

  const registeredCategoryId = merchant?.category || selectedCategory || "food";
  const categoryObj = CATEGORIES.find((c) => c.id === registeredCategoryId);
  const categoryLabel = categoryObj?.label || registeredCategoryId;

  return (
    <Card className="border-slate-200 shadow-xs rounded-xl bg-white p-3 sm:p-3.5 space-y-3 text-left font-sans">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-heading font-semibold text-slate-900">
            Section 2: Basic Offer Details
          </h3>
          <p className="text-[11px] text-slate-500 font-normal">
            Specify headline, short description, merchant category &amp; banner
            image
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Headline & Fixed Merchant Category in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            label="Offer Headline / Title"
            type="text"
            maxLength={80}
            placeholder="Flat 20% off on all items"
            required
            {...register("headline")}
            error={errors.headline}
            hint={`${headlineValue.length}/80 chars`}
          />

          {/* Locked / Fixed Merchant Category Display */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Offer Category <span className="text-red-500">*</span>
            </Label>
            <div className="h-9 px-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-normal">
              <span className="truncate">{categoryLabel}</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3" /> Fixed
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-normal">
              Automatically fixed to your registered business category.
            </p>
          </div>
        </div>

        {/* Short Description */}
        <FormTextarea
          label="Short Description"
          maxLength={200}
          rows={3}
          placeholder="Get 20% discount on total billing amount."
          required
          {...register("shortDescription")}
          error={errors.shortDescription}
          hint={`${shortDescriptionValue.length}/200 chars`}
        />

        {/* Offer Banner Image Upload */}
        <div className="space-y-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <Label className="font-medium text-xs text-slate-700 block">
            Banner Image{" "}
            <span className="text-[10px] text-slate-400 font-normal">
              (Optional)
            </span>
          </Label>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <FormInput
              type="text"
              placeholder="Paste image URL (https://...) or upload"
              {...register("image")}
              error={errors.image}
              className="flex-1"
              inputClassName="h-9 text-xs"
            />

            <label className="flex items-center justify-center gap-1.5 bg-[#007F79] hover:bg-[#00635E] text-white font-medium text-xs px-3.5 h-9 rounded-lg cursor-pointer shrink-0 transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-[11px] text-slate-500 font-normal">
            Recommended: 2:1 landscape banner (800×400px, PNG/JPG max 5MB).
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2 border-t border-slate-100">
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
          <span>Next: Discount</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
