"use client";

import { Briefcase, Link2, Mail, Phone, Store, User } from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { normalizeCategory } from "@/utils/constants";

const CATEGORIES = [
  { value: "fashion", label: "Fashion & Clothing" },
  { value: "food", label: "Food & Dining" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "home", label: "Home & Living" },
  { value: "home-improvement", label: "Home Improvement" },
  { value: "fitness", label: "Fitness & Healthcare" },
  { value: "education", label: "Education & Courses" },
  { value: "kids-baby", label: "Kids & Baby Products" },
  { value: "jewellery", label: "Jewellery & Accessories" },
  { value: "automotive", label: "Automobile & Auto Services" },
  { value: "entertainment", label: "Gaming & Entertainment" },
  { value: "grocery", label: "Grocery & Essentials" },
  { value: "finance", label: "Finance & Insurance" },
  { value: "others", label: "Others / Custom Category" },
];

const CONSTITUTIONS = [
  { value: "proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "private_limited", label: "Private Limited Company (Pvt Ltd)" },
  { value: "public_limited", label: "Public Limited Company" },
];

const DESIGNATIONS = [
  { value: "owner", label: "Proprietor / Managing Partner" },
  { value: "director", label: "Company Director" },
  { value: "manager", label: "Authorized Signatory / General Manager" },
];

export default function Step1Identity({
  register,
  setValue,
  watch,
  errors,
  isEditingExisting = false,
  isAdmin = false,
}) {
  const selectedConstitution = watch("constitution");
  const selectedCategory = watch("category");
  const selectedDesignation = watch("liaisonDesignation");

  const isSlugLocked = isEditingExisting && !isAdmin;

  const handleBusinessNameChange = (e) => {
    const val = e.target.value;
    setValue("businessName", val, { shouldValidate: true });
    if (!isEditingExisting) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-600" />
          <span>1. Business Logical Identity &amp; Categorization</span>
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200"
        >
          Step 1 of 3
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Legal Entity Corporate Name"
          icon={Store}
          placeholder="e.g. Burger House Pvt Ltd"
          {...register("businessName")}
          onChange={handleBusinessNameChange}
          error={errors.businessName}
        />

        <FormInput
          label="Consumer Trade Brand Name"
          icon={Link2}
          placeholder="e.g. Burger House"
          {...register("slug")}
          disabled={isSlugLocked}
          onChange={(e) => {
            if (!isSlugLocked) {
              setValue(
                "slug",
                e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                { shouldValidate: true },
              );
            }
          }}
          error={errors.slug}
          hint={
            isSlugLocked
              ? "🔒 Brand slug is locked after creation. Only Super Admin can modify."
              : "Sub-domain slug for your offer page"
          }
        />

        <FormSelect
          label="Business Constitution Type"
          icon={Briefcase}
          options={CONSTITUTIONS}
          value={selectedConstitution || "proprietorship"}
          onValueChange={(val) =>
            setValue("constitution", val, { shouldValidate: true })
          }
          error={errors.constitution}
        />

        <FormSelect
          label="Primary Industry Vertical"
          icon={Store}
          options={CATEGORIES}
          value={normalizeCategory(selectedCategory || "food")}
          onValueChange={(val) =>
            setValue("category", normalizeCategory(val), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          error={errors.category}
        />

        {selectedCategory === "others" && (
          <div className="col-span-full">
            <FormInput
              label="Custom Category Name / Description"
              icon={Store}
              placeholder="Specify your custom business category (e.g. Handmade Crafts, Event Management)"
              {...register("customCategoryNotes")}
              error={errors.customCategoryNotes}
            />
          </div>
        )}

        <FormInput
          label="Official Contact Email"
          icon={Mail}
          type="email"
          placeholder="contact@business.com"
          {...register("contactEmail")}
          error={errors.contactEmail}
        />

        <FormInput
          label="Primary Phone Number"
          icon={Phone}
          type="tel"
          placeholder="10-digit mobile number"
          {...register("contactPhone")}
          error={errors.contactPhone}
        />

        <FormInput
          label="Primary Contact Representative"
          icon={User}
          placeholder="Full Name"
          {...register("liaisonName")}
          error={errors.liaisonName}
        />

        <FormSelect
          label="Representative Position"
          icon={Briefcase}
          options={DESIGNATIONS}
          value={selectedDesignation || "owner"}
          onValueChange={(val) =>
            setValue("liaisonDesignation", val, { shouldValidate: true })
          }
          error={errors.liaisonDesignation}
        />
      </div>
    </Card>
  );
}
