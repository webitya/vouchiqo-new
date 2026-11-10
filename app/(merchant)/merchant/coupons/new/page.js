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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Post New Listing</span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    listingType === "affiliate"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200/60"
                      : "bg-rose-50 text-[#F72853] border-rose-200/60"
                  }`}
                >
                  {listingType === "affiliate"
                    ? "Section: Website Product Link"
                    : "Section: Store Offer / Coupon"}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Choose between publishing a store discount coupon/deal or a
                direct product link to your website.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900 border-slate-200 rounded-xl cursor-pointer self-start sm:self-auto"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
            {/* Section A: Offer & Coupon Listing */}
            <div
              onClick={() => handleSwitchType("offer")}
              className={`relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                listingType === "offer"
                  ? "border-[#F72853] bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 shadow-xs ring-2 ring-[#F72853]/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  listingType === "offer"
                    ? "bg-[#F72853] text-white shadow-xs"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Ticket className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Store Offer &amp; Coupon Listing
                  </h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    Voucher Deal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-1">
                  Create promo discount codes, flat ₹ / % off, in-store or
                  online voucher codes, and special seasonal deals for shoppers.
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                  <span>✓ Coupon Codes</span>
                  <span>•</span>
                  <span>✓ Terms &amp; Limits</span>
                  <span>•</span>
                  <span>✓ QR Verification</span>
                </div>
              </div>
              {listingType === "offer" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#F72853] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Section B: Website Product Link Listing */}
            <div
              onClick={() => handleSwitchType("affiliate")}
              className={`relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                listingType === "affiliate"
                  ? "border-indigo-600 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  listingType === "affiliate"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Website Product Link Listing
                  </h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                    Product Link
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-1">
                  List specific products from your website with direct
                  destination link, product image, original vs deal pricing, and
                  buy link.
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                  <span>✓ Direct Website URL</span>
                  <span>•</span>
                  <span>✓ Product Image</span>
                  <span>•</span>
                  <span>✓ Instant Clicks</span>
                </div>
              </div>
              {listingType === "affiliate" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: STORE OFFER & COUPON LISTING */}
        {listingType === "offer" && (
          <div className="flex flex-col gap-3.5 w-full animate-in fade-in duration-200">
            {/* COMPACT STEPPER BAR */}
            <div className="w-full flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-x-auto">
              <Button
                variant="ghost"
                asChild
                className="p-1 h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
              >
                <Link href="/merchant/coupons">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div className="flex items-center flex-1 min-w-0 gap-1.5 sm:gap-3">
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
                            ? "text-slate-900 font-medium"
                            : isPast
                              ? "text-emerald-700 font-normal"
                              : "text-slate-400 font-normal"
                        }`}
                      >
                        <span
                          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                            isActive
                              ? "bg-[#F72853] text-white shadow-2xs"
                              : isPast
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
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
                            isPast ? "bg-emerald-500" : "bg-slate-200"
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
