"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  MessageSquareHeart,
  Shield,
  Store,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProcessFeedbackModal from "@/components/merchant/feedback/ProcessFeedbackModal";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useProcessFeedback } from "@/hooks/use-process-feedback";
import Step1Identity from "./components/Step1Identity";
import Step2Location from "./components/Step2Location";
import Step3KYC from "./components/Step3KYC";
import { useMerchantProfileForm } from "./hooks/use-merchant-profile-form";

export default function MerchantBusinessProfile() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    formData,
    handleHoursChange,
    step,
    setStep,
    handleNext,
    handleBack,
    isEditing,
    setIsEditing,
    merchant,
    isLoading,
    error,
    handleImageUpload,
    uploadingLogo,
    uploadingBanner,
    uploadingShop,
    uploadingDoc,
    isPending,
    isAdmin,
  } = useMerchantProfileForm();
  const {
    isOpen: isFeedbackOpen,
    openFeedback,
    closeFeedback,
    submitFeedback,
    isSubmitting: isSubmittingFeedback,
    dismissFeedback,
  } = useProcessFeedback("profile_completion");

  if (isLoading) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="settings" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Business Profile" user={{ role: "merchant" }}>
        <div className="text-center py-20 text-rose-600 font-semibold">
          Error loading profile. Please refresh the page.
          <ProcessFeedbackModal
            isOpen={isFeedbackOpen}
            onClose={closeFeedback}
            onSubmit={submitFeedback}
            onDismiss={dismissFeedback}
            isSubmitting={isSubmittingFeedback}
            merchantName={merchant?.businessName}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Profile Status View
  if (!isEditing && merchant) {
    const statusMap = {
      pending: {
        icon: Clock,
        title: "Application Under Review",
        color: "amber",
        text: "Your profile is under review by our admin team.",
      },
      approved: {
        icon: CheckCircle2,
        title: "Account Verified & Active",
        color: "emerald",
        text: "Your account is fully verified. Start creating offers!",
      },
      rejected: {
        icon: X,
        title: "Application Rejected",
        color: "rose",
        text:
          merchant.rejectionReason ||
          "Please correct your details and resubmit.",
      },
    };

    const status = statusMap[merchant.status] || statusMap.pending;
    const StatusIcon = status.icon;

    return (
      <DashboardLayout
        title="Business Profile Onboarding"
        user={{ name: merchant.businessName, role: "merchant" }}
      >
        <div
          data-tour="profile-kyc"
          className="max-w-2xl mx-auto mt-8 text-left font-sans"
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border bg-${status.color}-50 text-${status.color}-600 border-${status.color}-200`}
            >
              <StatusIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide">
                {status.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {status.text}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  window.location.href = "/merchant/application-status";
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md shadow-blue-500/20"
              >
                Track Status
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => openFeedback()}
                className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-blue-600" />
                <span>Give Feedback</span>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const steps = [
    { number: 1, label: "Identity", icon: Store },
    { number: 2, label: "Location", icon: MapPin },
    { number: 3, label: "KYC Details", icon: Shield },
  ];

  return (
    <DashboardLayout
      title="Business Profile Onboarding"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="flex flex-col gap-6 text-left font-sans w-full">
        {/* Stepper Header */}
        <div className="w-full flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                {isEditing
                  ? "Edit Business Profile"
                  : "Complete Merchant Profile"}
              </span>
              {isEditing && (
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Editing Mode
                </span>
              )}
            </div>
            {merchant && isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer h-8 px-3 rounded-lg"
                >
                  Cancel Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSubmit}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-8 px-4 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isPending
                    ? <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    : <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center w-full gap-3 sm:gap-6 pt-1">
            {steps.map((s, idx) => {
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              const isLast = idx === 2;
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-3 ${!isLast ? "flex-1" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setStep(s.number)}
                    className={`flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "text-blue-600 font-extrabold"
                        : isCompleted
                          ? "text-slate-900 font-bold"
                          : "text-slate-400 font-medium"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : isCompleted
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {isCompleted
                        ? <CheckCircle2 className="w-4 h-4" />
                        : s.number}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold tracking-tight">
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Step {s.number}
                      </span>
                    </div>
                  </button>

                  {!isLast && (
                    <div className="hidden sm:block flex-1 h-[2px] bg-slate-200 rounded-full mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Step Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <Step1Identity
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              isEditingExisting={!!merchant}
              isAdmin={isAdmin}
            />
          )}

          {step === 2 && (
            <Step2Location
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              handleImageUpload={handleImageUpload}
              uploadingShop={uploadingShop}
              uploadingLogo={uploadingLogo}
              uploadingBanner={uploadingBanner}
              formData={formData}
              handleHoursChange={handleHoursChange}
            />
          )}

          {step === 3 && (
            <Step3KYC
              setValue={setValue}
              watch={watch}
              errors={errors}
              handleImageUpload={handleImageUpload}
              uploadingDoc={uploadingDoc}
            />
          )}

          {/* Form Actions Footer */}
          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>

            <div className="flex items-center gap-2.5">
              {merchant && isEditing && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-md shadow-rose-500/20 flex items-center gap-2"
                >
                  {isPending
                    ? <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    : <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>}
                </Button>
              )}

              {step < 3
                ? <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                : <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-8 rounded-xl cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {isPending
                      ? <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      : <>
                          <span>
                            {merchant
                              ? "Save Changes"
                              : "Submit Profile"}
                          </span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>}
                  </Button>}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
