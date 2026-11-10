"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { useMerchantProfile } from "@/hooks/use-merchant";
import { useZodForm } from "@/hooks/use-zod-form";
import { apiFetch } from "@/lib/fetcher";
import { campaignSchema, STEP_FIELDS } from "../schemas/campaign-schema";

/**
 * Custom hook managing RHF form state, Zod validation, step progression guards,
 * and API queries/mutations for creating a campaign.
 */
export function useCreateCampaignForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [listingSearch, setListingSearch] = useState("");

  const form = useZodForm({
    schema: campaignSchema,
    mode: "onTouched",
    defaultValues: {
      name: "",
      type: "flash",
      festivalName: "Diwali Grand Festival",
      objective: "Maximize Sales",
      headline: "",
      subHeadline: "",
      description: "",
      bannerUrl: "",
      offerType: "Percentage Discount (% off)",
      discountValue: "",
      maxCap: "",
      minOrderValue: "",
      code: "",
      redemptionInstructions: "",
      termsAndConditions: "",
      couponIds: [],
      startDate: "",
      endDate: "",
      hasCountdownTimer: true,
      hasPreTeaser: false,
      preTeaserHeadline: "",
      featuredSlot: false,
      pushNotification: true,
      newsletterInclusion: false,
      socialSharing: true,
      pushSendTime: "",
      audience: "all",
      targetCity: "Ranchi",
      staffReady: "yes",
      stockConfirmation: "yes",
      internalNote: "",
      agreed1: false,
      agreed2: false,
      agreed3: false,
      agreed4: false,
      agreed5: false,
    },
  });

  const { data: merchant, isLoading: loadingProfile } = useMerchantProfile();

  // Fetch both standard coupons and affiliate link deals for attachment to campaign
  const { data: coupons = [] } = useQuery({
    queryKey: ["merchant-coupons-for-campaign", merchant?._id],
    queryFn: async () => {
      if (!merchant) return [];
      const [couponsData, affiliatesData] = await Promise.all([
        apiFetch("/api/coupons?limit=50").catch(() => null),
        apiFetch("/api/merchant/affiliate-products").catch(() => null),
      ]);

      const couponList = (couponsData?.data?.coupons || []).filter(
        (c) =>
          c.merchantId?._id === merchant._id || c.merchantId === merchant._id,
      );

      const affiliateList = (affiliatesData?.data || []).map((a) => ({
        _id: a._id,
        title: a.title,
        code: "Affiliate Link",
        discountType: "percentage",
        discountValue: a.discountPercentage || 0,
        isAffiliate: true,
        affiliateUrl: a.affiliateUrl,
      }));

      return [...couponList, ...affiliateList];
    },
    enabled: !!merchant,
  });

  const isPro = merchant?.plan === "pro" || merchant?.plan === "enterprise";

  const handleNextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] || [];
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = async (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    const fieldsToValidate = STEP_FIELDS[currentStep] || [];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(targetStep);
    }
  };

  const toggleCouponAttachment = (couponId) => {
    const currentList = form.getValues("couponIds") || [];
    const exists = currentList.includes(couponId);
    const updated = exists
      ? currentList.filter((id) => id !== couponId)
      : [...currentList, couponId];
    form.setValue("couponIds", updated, { shouldValidate: true });
  };

  const calculateAddOnTotal = () => {
    const formData = form.watch();
    let total = 0;
    if (formData.featuredSlot) total += 999;
    if (formData.pushNotification && !isPro) total += 599;
    if (formData.newsletterInclusion && !isPro) total += 799;
    return total;
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to submit campaign.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
      toast.success("Campaign submitted successfully for review!");
      router.push("/merchant/campaigns");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({
      isAddonPurchased: true,
      name: formData.name,
      type: formData.type,
      festivalName: formData.festivalName,
      objective: formData.objective,
      headline: formData.headline || formData.name,
      subHeadline: formData.subHeadline,
      description: formData.description,
      bannerUrl: formData.bannerUrl,
      offerDetails: {
        offerType: formData.offerType,
        discountValue: Number(formData.discountValue) || 0,
        maxCap: Number(formData.maxCap) || 0,
        minOrderValue: Number(formData.minOrderValue) || 0,
        code: formData.code,
        redemptionInstructions: formData.redemptionInstructions,
        termsAndConditions: formData.termsAndConditions,
      },
      timing: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        hasCountdownTimer: formData.hasCountdownTimer,
        hasPreTeaser: formData.hasPreTeaser,
        preTeaserHeadline: formData.preTeaserHeadline,
      },
      targeting: {
        audience: formData.audience,
        targetCity: formData.targetCity,
        addOns: [
          ...(formData.featuredSlot ? ["ticker_priority"] : []),
          ...(formData.pushNotification ? ["push"] : []),
          ...(formData.newsletterInclusion ? ["email"] : []),
        ],
        pushSendTime: formData.pushSendTime,
      },
      readiness: {
        staffReady: formData.staffReady,
        stockConfirmation: formData.stockConfirmation,
        internalNote: formData.internalNote,
        checkpointsConfirmed: true,
      },
      couponIds: formData.couponIds,
      status: "live",
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  };

  return {
    form,
    control: form.control,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    formData: form.watch(),
    currentStep,
    setCurrentStep: goToStep,
    handleNextStep,
    handlePrevStep,
    listingSearch,
    setListingSearch,
    toggleCouponAttachment,
    calculateAddOnTotal,
    merchant,
    loadingProfile,
    coupons,
    isPending: mutation.isPending,
  };
}
