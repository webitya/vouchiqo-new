"use client";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  FileText,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

import LivePreviewCard from "./components/LivePreviewCard";
import SectionAffiliateProduct from "./components/SectionAffiliateProduct";
import SectionBasic from "./components/SectionBasic";
import SectionDiscount from "./components/SectionDiscount";
import SectionTerms from "./components/SectionTerms";
import SectionType from "./components/SectionType";
import SectionValidity from "./components/SectionValidity";
import { useCreateCouponForm } from "./hooks/use-create-coupon-form";

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

const SECTIONS = [
  { number: 1, key: "A", name: "Offer Type", icon: Tag },
  { number: 2, key: "B", name: "Basic Details", icon: FileText },
  { number: 3, key: "C", name: "Discount & Code", icon: Ticket },
  { number: 4, key: "D", name: "Validity & Limits", icon: CalendarIcon },
  { number: 5, key: "E", name: "Terms & Submit", icon: ShieldCheck },
];

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramType = searchParams.get("type");
  const initialType = paramType === "affiliate" ? "affiliate" : "offer";
  const [listingType, setListingType] = useState(initialType);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    formData,
    activeSection,
    goToSection,
    goToNextSection,
    goToPrevSection,
    generateRandomCode,
    handleImageUpload,
    uploadingImage,
    toggleDay,
    merchant,
    isPending,
  } = useCreateCouponForm();

  const handleSwitchType = (type) => {
    setListingType(type);
    router.replace(`/merchant/coupons/new?type=${type}`, { scroll: false });
  };

  const currentSectionObj =
    SECTIONS.find((s) => s.key === activeSection) || SECTIONS[0];

  const resolvedCategoryId = merchant?.category || formData.category || "food";
  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === resolvedCategoryId)?.label ||
    merchant?.category ||
    "Food & Dining";

  return (
    <DashboardLayout
      title="Post New Listing"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-3.5 text-left font-sans w-full">
        {/* UNIFIED 2-SECTION SWITCHER HUB */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
            <div>
              <h1 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight">
                Post New Listing
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Choose between publishing a store discount coupon/deal or a
                direct product link to your website.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900 border-slate-200 rounded-lg cursor-pointer self-start sm:self-auto"
            >
              <Link
                href="/merchant/coupons"
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Listings</span>
              </Link>
            </Button>
          </div>

          {/* 2 Interactive Format Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
            {/* Section A: Offer & Coupon Listing */}
            <div
              onClick={() => handleSwitchType("offer")}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                listingType === "offer"
                  ? "border-[#007F79] bg-[#007F79]/5 shadow-xs ring-1 ring-[#007F79]/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  listingType === "offer"
                    ? "bg-[#007F79] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-xs sm:text-sm font-heading font-medium text-slate-900">
                  Store Offer &amp; Coupon Listing
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-normal mt-0.5 line-clamp-1">
                  Promo codes, flat ₹ / % off in-store or online voucher deals.
                </p>
              </div>
              {listingType === "offer" && (
                <div className="absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-[#007F79] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Section B: Website Product Link Listing */}
            <div
              onClick={() => handleSwitchType("affiliate")}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                listingType === "affiliate"
                  ? "border-[#007F79] bg-[#007F79]/5 shadow-xs ring-1 ring-[#007F79]/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  listingType === "affiliate"
                    ? "bg-[#007F79] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-xs sm:text-sm font-heading font-medium text-slate-900">
                  Website Product Link Listing
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-normal mt-0.5 line-clamp-1">
                  Direct product link to your website with product images and
                  pricing.
                </p>
              </div>
              {listingType === "affiliate" && (
                <div className="absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-[#007F79] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: STORE OFFER & COUPON LISTING */}
        {listingType === "offer" && (
          <div className="flex flex-col gap-3 w-full animate-in fade-in duration-200">
            {/* COMPACT STEPPER BAR */}
            <div className="w-full flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded-lg shadow-xs overflow-x-auto">
              <Button
                variant="ghost"
                asChild
                className="p-1 h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
              >
                <Link href="/merchant/coupons">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div className="flex items-center flex-1 min-w-0 gap-1.5 sm:gap-2.5">
                {SECTIONS.map((sec, idx) => {
                  const isActive = activeSection === sec.key;
                  const isPast = currentSectionObj.number > sec.number;
                  const isLast = idx === SECTIONS.length - 1;
                  return (
                    <div
                      key={sec.key}
                      className={`flex items-center gap-1.5 ${!isLast ? "flex-1" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => goToSection(sec.key)}
                        className={`flex items-center gap-1.5 text-[11px] transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? "text-[#35104A] font-medium"
                            : isPast
                              ? "text-[#007F79] font-normal"
                              : "text-slate-400 font-normal"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                            isActive
                              ? "bg-[#007F79] text-white shadow-xs"
                              : isPast
                                ? "bg-teal-50 text-[#007F79] border border-teal-200"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isPast
                            ? <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                            : sec.number}
                        </span>
                        <span className="hidden sm:inline whitespace-nowrap">
                          S{sec.number}: {sec.name}
                        </span>
                        <span className="sm:hidden whitespace-nowrap">
                          S{sec.number}
                        </span>
                      </button>
                      {!isLast && (
                        <div
                          className={`h-0.5 flex-1 rounded-full transition-colors min-w-[8px] ${
                            isPast ? "bg-[#007F79]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-COLUMN LAYOUT FOR COUPON FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-7 space-y-3.5"
                noValidate
              >
                {activeSection === "A" && (
                  <SectionType
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    onNext={goToNextSection}
                  />
                )}
                {activeSection === "B" && (
                  <SectionBasic
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    merchant={merchant}
                    uploadingImage={uploadingImage}
                    handleImageUpload={handleImageUpload}
                    onBack={goToPrevSection}
                    onNext={goToNextSection}
                  />
                )}
                {activeSection === "C" && (
                  <SectionDiscount
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    generateRandomCode={generateRandomCode}
                    onBack={goToPrevSection}
                    onNext={goToNextSection}
                  />
                )}
                {activeSection === "D" && (
                  <SectionValidity
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    toggleDay={toggleDay}
                    onBack={goToPrevSection}
                    onNext={goToNextSection}
                  />
                )}
                {activeSection === "E" && (
                  <SectionTerms
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    onSubmit={handleSubmit}
                    isPending={isPending}
                    onBack={goToPrevSection}
                  />
                )}
              </form>

              <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
                <LivePreviewCard
                  formData={formData}
                  merchant={merchant}
                  selectedCategoryLabel={selectedCategoryLabel}
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: WEBSITE PRODUCT LINK LISTING */}
        {listingType === "affiliate" && (
          <div className="w-full animate-in fade-in duration-200">
            <SectionAffiliateProduct merchant={merchant} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CreateCouponPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-sans">
          Loading listing creator...
        </div>
      }
    >
      <CreateListingContent />
    </Suspense>
  );
}
