"use client";

import { Rocket, Tag, Target, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import CampaignStepper from "../components/CampaignStepper";
import LiveCampaignPreview from "../components/LiveCampaignPreview";
import StepBasics from "../components/steps/StepBasics";
import StepListings from "../components/steps/StepListings";
import StepPromotion from "../components/steps/StepPromotion";
import StepReview from "../components/steps/StepReview";
import { useCreateCampaignForm } from "./hooks/use-create-campaign-form";

const CAMPAIGN_TYPES = [
  {
    id: "flash",
    name: "Flash Sale",
    icon: Zap,
    badge: "2hrs – 48hrs",
    desc: "A deep discount for a very short window with a live countdown timer for maximum urgency.",
  },
  {
    id: "festival",
    name: "Festival Campaign",
    icon: Tag,
    badge: "3 – 7 days",
    desc: "Tied to Indian festivals (Diwali, Chhath, Holi, Navratri, Eid) with pre-launch teaser option.",
  },
  {
    id: "new-user",
    name: "New Customer Acquisition",
    icon: Target,
    badge: "3 – 14 days",
    desc: "Targets users who haven't visited your brand page before. Displays 'First-Time Offer' badge.",
  },
  {
    id: "seasonal",
    name: "Seasonal / Clearance",
    icon: Tag,
    badge: "7 – 21 days",
    desc: "Stock clearance or seasonal changes (Monsoon Sale, End-of-Summer, Back-to-School).",
  },
  {
    id: "loyalty",
    name: "Loyalty / Returning Customer",
    icon: Users,
    badge: "7 – 14 days",
    desc: "Targets users who previously redeemed your offers with a 'Welcome Back' alert.",
  },
  {
    id: "bundle",
    name: "Bundle / BOGO Campaign",
    icon: Trophy,
    badge: "3 – 14 days",
    desc: "Built around Buy 1 Get 1 Free, combo packages, or value-add free gifts.",
  },
  {
    id: "revival",
    name: "Revival Campaign",
    icon: Rocket,
    badge: "24 – 48hrs",
    desc: "Re-activates multiple expired offers at once ('Second Chance Sale') with a revival badge.",
  },
];

const OBJECTIVES = [
  "Maximize Sales",
  "Drive Traffic",
  "Collect Leads",
  "App Installs",
  "Brand Awareness",
];

const TARGET_AUDIENCES = [
  { id: "all", label: "All Vouchiqo Users" },
  { id: "new", label: "New Users" },
  { id: "category", label: "Category Interest" },
  { id: "city", label: "City-based" },
];

const WIZARD_STEPS = [
  { number: 1, label: "Basics" },
  { number: 2, label: "Listings" },
  { number: 3, label: "Promotion" },
  { number: 4, label: "Review" },
];

export default function CreateNewCampaignPage() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    formData,
    currentStep,
    setCurrentStep,
    handleNextStep,
    handlePrevStep,
    listingSearch,
    setListingSearch,
    toggleCouponAttachment,
    calculateAddOnTotal,
    merchant,
    loadingProfile,
    coupons,
    isPending,
  } = useCreateCampaignForm();

  if (loadingProfile) {
    return (
      <DashboardLayout title="Create Campaign" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const isFreeMerchant =
    !merchant?.plan ||
    merchant?.plan === "starter" ||
    String(merchant?.plan).toLowerCase().includes("starter") ||
    String(merchant?.plan).toLowerCase().includes("free");

  const filteredCoupons = coupons.filter(
    (c) =>
      c.title?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      c.code?.toLowerCase().includes(listingSearch.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="Create Campaign"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-4 text-left font-sans w-full">
        {isFreeMerchant && (
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 rounded-xl text-xs font-sans shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#F72853] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                ⚡
              </span>
              <div>
                <span className="font-bold text-slate-900">
                  Free Partner Flash Sale Pass Active
                </span>
                <span className="text-slate-600 block text-[11px]">
                  Configuring your 1-time 24–48hr Flash Sale Campaign with live
                  countdown timer.
                </span>
              </div>
            </div>
            <Link
              href="/merchant/billing"
              className="text-[#F72853] hover:underline font-semibold text-xs whitespace-nowrap"
            >
              Need all 7 campaign types? Upgrade →
            </Link>
          </div>
        )}

        <CampaignStepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onCancel={() => router.push("/merchant/campaigns")}
        />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          <div className="lg:col-span-7 space-y-4">
            {currentStep === 1 && (
              <StepBasics
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                campaignTypes={CAMPAIGN_TYPES}
                objectives={OBJECTIVES}
                isFreeMerchant={isFreeMerchant}
                onCancel={() => router.push("/merchant/campaigns")}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <StepListings
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                filteredCoupons={filteredCoupons}
                listingSearch={listingSearch}
                setListingSearch={setListingSearch}
                toggleCouponAttachment={toggleCouponAttachment}
                onBack={handlePrevStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 3 && (
              <StepPromotion
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                targetAudiences={TARGET_AUDIENCES}
                onBack={handlePrevStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 4 && (
              <StepReview
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                formData={formData}
                calculateAddOnTotal={calculateAddOnTotal}
                onSubmit={handleSubmit}
                isPending={isPending}
                onBack={handlePrevStep}
              />
            )}
          </div>

          <LiveCampaignPreview
            campaignData={formData}
            merchantName={merchant?.businessName}
          />
        </form>
      </div>
    </DashboardLayout>
  );
}
