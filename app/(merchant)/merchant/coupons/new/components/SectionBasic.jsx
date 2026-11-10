"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  Upload,
} from "lucide-react";
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
    <Card className="border-slate-200/90 shadow-2xs rounded-xl bg-white p-3.5 sm:p-4 space-y-3.5 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#F72853]" />

      {/* Section Header */}
      <div className="border-b border-slate-100 pb-2.5 pt-0.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-slate-800 tracking-tight">
              Section 2: Basic Offer Details
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Specify headline, short description, merchant category &amp;
              banner image
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Headline & Fixed Merchant Category in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            label="Offer Headline / Title"
            icon={FileText}
            type="text"
            maxLength={80}
            placeholder="e.g. Flat 20% off on all Italian Marble Tiles"
            required
            {...register("headline")}
            error={errors.headline}
            hint={`${headlineValue.length}/80 chars`}
          />

          {/* Locked / Fixed Merchant Category Display */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Offer Category</span>
              <span className="text-red-500 font-medium ml-0.5">*</span>
            </Label>
            <div className="h-9 px-3 flex items-center justify-between rounded-xl border border-rose-200/90 bg-rose-50/30 text-slate-900 font-medium text-xs shadow-2xs">
              <span className="flex items-center gap-2 truncate">
                <span className="text-[#F72853] font-medium">★</span>
                <span>{categoryLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#F72853] bg-white border border-rose-200 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                <Lock className="w-3 h-3 text-[#F72853]" /> Locked to Merchant
                Industry
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Offers are automatically fixed to your registered business
              category.
            </p>
          </div>
        </div>

        {/* Short Description */}
        <FormTextarea
          label="Short Description"
          icon={MessageSquare}
          maxLength={200}
          rows={3}
          placeholder="e.g. Get 20% discount on total invoice amount for all premium tiles."
          required
          {...register("shortDescription")}
          error={errors.shortDescription}
          hint={`${shortDescriptionValue.length}/200 chars`}
        />

        {/* Offer Banner Image Upload Card */}
        <div className="space-y-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
              <ImageIcon className="w-3.5 h-3.5 text-[#F72853]" /> Banner Image
              Upload
              <span className="text-[10px] text-slate-400 font-normal">
                (Optional)
              </span>
            </Label>

            {/* Prominent Image Ratio Callout Badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F72853] bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="font-medium">Aspect Ratio: 2:1</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-slate-700 font-normal">
                800×400px Landscape
              </span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <FormInput
              type="text"
              placeholder="Paste image URL (https://...) or upload below"
              {...register("image")}
              error={errors.image}
              className="flex-1 bg-white h-9 text-xs"
            />

            {/* Upload Button with prominent ratio text */}
            <label className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 h-9 rounded-xl cursor-pointer shrink-0 transition-all shadow-xs">
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>
                {uploadingImage
                  ? "Uploading..."
                  : "Upload 800×400 Banner (2:1)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-2 bg-white rounded-lg border border-slate-200/70 text-[11px] text-slate-600 font-normal flex items-center justify-between flex-wrap gap-1">
            <span>
              💡 <span className="font-medium text-slate-800">Banner Tip:</span>{" "}
              2:1 Horizontal ratio (800px width × 400px height, PNG/JPG max 5MB)
              renders cleanly on all devices.
            </span>
            <span className="text-[#F72853] font-medium text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              2:1 Ratio
            </span>
          </div>
        </div>
      </div>

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
          <span>Next: Discount</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
