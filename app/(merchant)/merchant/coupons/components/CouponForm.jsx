"use client";

import {
  Calendar as CalendarIcon,
  Eye,
  FileText,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Loader2,
  Lock,
  MessageSquare,
  Percent,
  Settings,
  Tag,
  Ticket,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FormActions,
  FormDatePicker,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form";
import SafeImage from "@/components/shared/SafeImage";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  { id: "services", label: "Services & IT Solutions" },
  { id: "others", label: "Others / Custom Category" },
];

const DISCOUNT_TYPES = [
  { value: "percentage", label: "% Percentage Off" },
  { value: "fixed", label: "Flat ₹ Amount Off" },
  { value: "freebie", label: "Free Gift / Freebie" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active / Enabled" },
  { value: "paused", label: "Paused / Suspended" },
  { value: "expired", label: "Expired / Closed" },
];

const LISTING_TYPES = [
  { id: "coupon", label: "Promo Code", desc: "Code for checkout / in-store" },
  { id: "deal", label: "Sale / Flat Offer", desc: "Discounted price link" },
  { id: "special", label: "Special / Gift", desc: "BOGO or Freebie package" },
];

/**
 * CouponForm — create / edit a coupon listing.
 * Fully organized with consistent 2-column grid spacing and UI/UX hierarchy.
 */
export default function CouponForm({
  formData,
  setFormData,
  listingType,
  setListingType,
  handleSubmit,
  isPending,
  submitText = "Save Offer",
  isEdit = false,
  merchantPlan = "starter",
  merchantName = "Store Name",
  merchantCategory = null,
  isCategoryLocked = true,
}) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("folder", "coupons");

    setUploadingImage(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Upload failed");
      }

      const json = await res.json();
      const imageUrl = json.data?.secure_url || json.data?.url || json.url;

      if (!imageUrl) throw new Error("No URL returned from upload");

      update("image", imageUrl);
      toast.success("Offer photo updated successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const resolvedCategory = merchantCategory || formData.category || "food";

  const selectedCategory =
    CATEGORIES.find(
      (c) =>
        c.id === resolvedCategory ||
        c.label.toLowerCase() === String(resolvedCategory).toLowerCase(),
    ) ||
    CATEGORIES.find(
      (c) =>
        c.id === formData.category ||
        c.label.toLowerCase() === String(formData.category).toLowerCase(),
    ) ||
    CATEGORIES.find((c) => c.id === "others") ||
    CATEGORIES[0];

  // Keep formData.category in sync with the locked category slug
  useEffect(() => {
    if (
      isCategoryLocked &&
      selectedCategory?.id &&
      formData.category !== selectedCategory.id
    ) {
      setFormData((prev) => ({ ...prev, category: selectedCategory.id }));
    }
  }, [isCategoryLocked, selectedCategory?.id, formData.category, setFormData]);

  const canFeature = merchantPlan === "pro" || merchantPlan === "enterprise";

  const discountLabel =
    formData.discountType === "percentage"
      ? `${formData.discountValue || "0"}% OFF`
      : formData.discountType === "fixed"
        ? `₹${formData.discountValue || "0"} OFF`
        : "Free Gift";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start font-sans"
    >
      {/* LEFT COLUMN: Organized Form Input Cards */}
      <div className="lg:col-span-7 space-y-6">
        {/* Listing Format Selector (Only when creating) */}
        {!isEdit && setListingType && (
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4">
            <FormSection title="Choose Listing Format" icon={Settings} noBorder>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setListingType(t.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      listingType === t.id
                        ? "border-blue-600 bg-blue-50/50 shadow-2xs font-bold text-slate-900"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">
                      {t.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                      {t.desc}
                    </span>
                  </button>
                ))}
              </div>
            </FormSection>
          </Card>
        )}

        {/* Card 1: Main Offer Details */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <FormSection
            title={isEdit ? "Edit Offer Details" : "Offer Details"}
            icon={FileText}
            noBorder
          >
            <FormInput
              name="title"
              label="Offer Title / Headline"
              icon={Tag}
              placeholder="e.g. Free Drink with Meal"
              value={formData.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={70}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isCategoryLocked ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F72853]" />
                    <span>Offer Category</span>
                    <span className="text-red-500 font-medium ml-0.5">*</span>
                  </Label>
                  <div className="h-10 px-3.5 flex items-center justify-between rounded-xl border border-rose-200/90 bg-rose-50/30 text-slate-900 font-medium text-xs shadow-2xs">
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-[#F72853] font-bold">★</span>
                      <span className="font-semibold text-slate-900">
                        {selectedCategory.label}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#F72853] bg-white border border-rose-200 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                      <Lock className="w-3 h-3 text-[#F72853]" /> Locked to
                      Merchant Industry
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Offers are automatically fixed to your registered business
                    category.
                  </p>
                </div>
              ) : (
                <FormSelect
                  name="category"
                  label="Category"
                  icon={Layers}
                  options={CATEGORIES.map((c) => ({
                    value: c.id,
                    label: c.label,
                  }))}
                  value={selectedCategory.id}
                  onValueChange={(val) => update("category", val)}
                  required
                />
              )}

              <FormInput
                name="code"
                label="Promo Code"
                icon={Ticket}
                placeholder="FREEDRINK"
                value={formData.code}
                onChange={(e) =>
                  update(
                    "code",
                    e.target.value.toUpperCase().replace(/\s/g, ""),
                  )
                }
                className="font-mono uppercase font-bold"
                required
              />
            </div>

            {formData.category === "others" && (
              <FormInput
                name="customCategory"
                label="Custom Category Name"
                icon={Layers}
                placeholder="Specify custom offer category"
                value={formData.customCategory || ""}
                onChange={(e) => update("customCategory", e.target.value)}
                required
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormSelect
                name="discountType"
                label="Discount Type"
                icon={Percent}
                options={DISCOUNT_TYPES}
                value={formData.discountType || "percentage"}
                onValueChange={(val) => update("discountType", val)}
                required
              />
              <FormInput
                name="discountValue"
                label="Discount Value (₹ or %)"
                icon={IndianRupee}
                type="number"
                placeholder="0"
                value={formData.discountValue}
                onChange={(e) => update("discountValue", e.target.value)}
              />
            </div>

            <FormTextarea
              name="description"
              label="Terms &amp; Short Description"
              icon={MessageSquare}
              rows={3}
              placeholder="Enjoy great deals and savings on your order..."
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={300}
              showCounter
              required
            />

            {/* Offer Banner Photo / Image Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Offer Photo / Banner</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Optional)
                  </span>
                </Label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                  <span>Aspect Ratio: 2:1</span>
                  <span className="text-slate-400">•</span>
                  <span>800×400px</span>
                </span>
              </div>

              {/* If an image exists, show thumbnail preview and change/remove controls */}
              {formData.image ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <div className="relative w-full sm:w-44 h-22 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs">
                    <SafeImage
                      src={formData.image}
                      alt="Offer banner"
                      width={176}
                      height={88}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate block">
                        Current Offer Photo
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {formData.image}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Change / Upload Button */}
                      <label className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 h-8 rounded-lg cursor-pointer transition-colors shadow-2xs">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => update("image", "")}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2.5 h-8 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* No image yet: show upload box & URL input */
                <div className="space-y-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-300">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <FormInput
                      name="image"
                      type="text"
                      placeholder="Paste image URL (https://...) or upload below"
                      value={formData.image || ""}
                      onChange={(e) => update("image", e.target.value)}
                      className="flex-1 bg-white h-9 text-xs"
                    />

                    <label className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 h-9 rounded-lg cursor-pointer shrink-0 transition-colors shadow-2xs">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo (2:1)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Expandable direct URL editor when image is already set */}
              {formData.image && (
                <details className="text-[11px] text-slate-500 pt-0.5">
                  <summary className="hover:text-blue-600 font-medium select-none cursor-pointer">
                    Or edit direct image URL
                  </summary>
                  <div className="mt-1.5">
                    <FormInput
                      name="image"
                      type="text"
                      placeholder="https://..."
                      value={formData.image || ""}
                      onChange={(e) => update("image", e.target.value)}
                      className="bg-white h-8 text-xs"
                    />
                  </div>
                </details>
              )}
            </div>
          </FormSection>
        </Card>

        {/* Card 2: Limits, Expiry & Status */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
          <FormSection
            title="Validity, Limits &amp; Status"
            icon={CalendarIcon}
            noBorder
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormDatePicker
                name="expiresAt"
                label="Expiry Date"
                icon={CalendarIcon}
                value={formData.expiresAt}
                onChange={(val) => update("expiresAt", val)}
                minDate={new Date()}
                required
              />
              <FormInput
                name="maxClaims"
                label="Claims Limit"
                icon={Users}
                type="number"
                placeholder="e.g. 500"
                value={formData.maxClaims}
                onChange={(e) => update("maxClaims", e.target.value)}
              />
              {isEdit && (
                <FormSelect
                  name="status"
                  label="Offer Status"
                  icon={Settings}
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onValueChange={(val) => update("status", val)}
                />
              )}
            </div>

            {/* Featured placement toggle card */}
            <div className="border-t border-slate-100 pt-4 mt-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Featured Homepage Placement
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pin this deal to the homepage hero grid for 5x customer
                    visibility.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!canFeature && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold"
                    >
                      Pro/Enterprise Only
                    </Badge>
                  )}
                  <Switch
                    disabled={!canFeature}
                    checked={formData.isFeatured}
                    onCheckedChange={(val) => update("isFeatured", val)}
                  />
                </div>
              </div>
            </div>

            <FormActions
              submitText={submitText}
              loading={isPending}
              align="end"
            />
          </FormSection>
        </Card>
      </div>

      {/* RIGHT COLUMN: Sticky Real-Time Live Card Preview */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-blue-600" /> Real-Time Live Card
              Preview
            </span>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-bold"
            >
              Live Preview
            </Badge>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Image Hero */}
            <div
              className="h-36 bg-slate-900 relative flex items-end p-4 bg-cover bg-center"
              style={{
                backgroundImage: formData.image
                  ? `url(${formData.image})`
                  : "linear-gradient(to right, #0f172a, #1e293b)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <Badge className="bg-blue-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 border-0">
                  {selectedCategory.label}
                </Badge>
                <span className="text-white text-[10px] font-bold bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  {merchantName}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  {formData.title || "Free Drink with Meal"}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                  {formData.description ||
                    "Enjoy great deals and savings on Free Drink with Meal."}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Use Promo Code
                </span>
                <span className="font-mono text-base font-black text-slate-900 uppercase tracking-widest block">
                  {formData.code || "FREEDRINK"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">
                    Discount
                  </span>
                  <span className="text-blue-600 font-black">
                    {discountLabel}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">
                    Valid Until
                  </span>
                  <span className="text-slate-900 font-bold">
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleDateString(
                          "en-US",
                          { month: "numeric", day: "numeric", year: "numeric" },
                        )
                      : "Select Date"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}
