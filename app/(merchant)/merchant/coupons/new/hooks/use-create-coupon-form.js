"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useMerchantProfile } from "@/hooks/use-merchant";
import { useZodForm } from "@/hooks/use-zod-form";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { couponSchema, SECTION_FIELDS } from "../schemas/coupon-schema";

const SECTION_ORDER = ["A", "B", "C", "D", "E"];

/**
 * Custom hook managing the multi-step form state, Zod validation,
 * step-by-step navigation guards, and API mutations for CreateCoupon.
 */
export function useCreateCouponForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const track = useTrackEvent();
  const [activeSection, setActiveSection] = useState("A");
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useZodForm({
    schema: couponSchema,
    mode: "onTouched",
    defaultValues: {
      offerType: "code",
      headline: "",
      shortDescription: "",
      category: "home-improvement",
      image: "",
      code: "",
      discountType: "% Off",
      discountValue: "",
      maxCap: "",
      minOrderValue: "",
      dealUrl: "",
      originalPrice: "",
      salePrice: "",
      specialOfferType: "BOGO (Buy 1 Get 1)",
      offerDetails: "",
      redemptionMethod: "Show Vouchiqo Smart Code at counter",
      startDate: "",
      endDate: "",
      usageLimit: "",
      perCustomerLimit: "1",
      targetAudience: "All Customers (Default)",
      geographicRestriction: "Ranchi only — in-store at my listed address",
      validDays: [],
      validHours: "",
      termsAndConditions: "",
      combinability: "No — cannot be combined with any other offer",
      honouredAllDays: "Yes — every day during the validity period",
      internalNote: "",
      agreed1: false,
      agreed2: false,
      agreed3: false,
      agreed4: false,
    },
  });

  const { data: merchant } = useMerchantProfile();

  // Auto-fill category from merchant's registered profile and keep it locked
  useEffect(() => {
    if (merchant?.category) {
      form.setValue("category", merchant.category, { shouldValidate: true });
    }
  }, [merchant?.category, form]);

  // Step-by-step navigation guard
  const goToNextSection = async () => {
    const fieldsToValidate = SECTION_FIELDS[activeSection] || [];
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) return; // Block step progression if current step has errors

    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      setActiveSection(SECTION_ORDER[currentIndex + 1]);
    }
  };

  const goToPrevSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(SECTION_ORDER[currentIndex - 1]);
    }
  };

  const goToSection = async (targetSection) => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    const targetIndex = SECTION_ORDER.indexOf(targetSection);

    // If navigating backward, always allow
    if (targetIndex <= currentIndex) {
      setActiveSection(targetSection);
      return;
    }

    // If jumping forward, validate current section fields first
    const fieldsToValidate = SECTION_FIELDS[activeSection] || [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setActiveSection(targetSection);
    }
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "SAVE";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("code", code, { shouldValidate: true });
    track("unique_code_gen", { source: "merchant_dashboard" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", "coupons");

    setUploadingImage(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      const imageUrl = json.data?.url;

      form.setValue("image", imageUrl, { shouldValidate: true });
      toast.success("Offer image uploaded!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleDay = (day) => {
    const currentDays = form.getValues("validDays") || [];
    const exists = currentDays.includes(day);
    const updated = exists
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    form.setValue("validDays", updated, { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiFetch("/api/coupons", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.coupons.all() });
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
      toast.success("Offer submitted for verification! 4-hour SLA active.");
      router.push("/merchant/coupons");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const onSubmit = (formData) => {
    let backendDiscountType = "percentage";
    if (formData.offerType === "code") {
      if (formData.discountType.includes("Flat")) backendDiscountType = "fixed";
      else if (
        formData.discountType.includes("Free") ||
        formData.discountType.includes("BOGO") ||
        formData.discountType.includes("Other")
      )
        backendDiscountType = "freebie";
    } else if (formData.offerType === "special") {
      backendDiscountType = "freebie";
    } else if (formData.offerType === "deal") {
      backendDiscountType = "fixed";
    }

    const rawDiscountNum = Number(formData.discountValue);
    const isNum =
      formData.discountValue !== undefined &&
      formData.discountValue !== null &&
      formData.discountValue !== "" &&
      !Number.isNaN(rawDiscountNum);

    const parsedDiscount = isNum ? rawDiscountNum : formData.discountValue || 0;

    const rawOriginal = Number(formData.originalPrice);
    const parsedOriginal =
      !Number.isNaN(rawOriginal) && rawOriginal > 0 ? rawOriginal : undefined;

    const rawSale = Number(formData.salePrice);
    const parsedSale =
      !Number.isNaN(rawSale) && rawSale > 0 ? rawSale : undefined;

    const expiryDate = new Date(formData.endDate);
    expiryDate.setHours(23, 59, 59, 999);

    const payload = {
      title: formData.headline,
      description: formData.shortDescription,
      code: formData.code || "DEALOFFER",
      discountType: backendDiscountType,
      discountValue: parsedDiscount,
      rawDiscountValue: formData.discountValue,
      rawDiscountType: formData.discountType,
      originalPrice: parsedOriginal,
      salePrice: parsedSale,
      category: formData.category,
      image: formData.image?.trim() ? formData.image.trim() : undefined,
      expiresAt: expiryDate.toISOString(),
      maxClaims: Number(formData.usageLimit) || undefined,
      offerType: formData.offerType,
      headline: formData.headline,
      shortDescription: formData.shortDescription,
      maxCap: Number(formData.maxCap) || undefined,
      minOrderValue: Number(formData.minOrderValue) || undefined,
      specialOfferType: formData.specialOfferType,
      offerDetails: formData.offerDetails,
      redemptionMethod: formData.redemptionMethod,
      startDate: formData.startDate,
      endDate: formData.endDate,
      perCustomerLimit: formData.perCustomerLimit,
      targetAudience: formData.targetAudience,
      geographicRestriction: formData.geographicRestriction,
      validDays: formData.validDays,
      validHours: formData.validHours,
      termsAndConditions: formData.termsAndConditions,
      combinability: formData.combinability,
      honouredAllDays: formData.honouredAllDays,
      internalNote: formData.internalNote,
      status: "pending",
      isVerified: false,
      location: {
        city: merchant?.address?.city || "Ranchi",
        state: merchant?.address?.state || "Jharkhand",
        isOnline: false,
      },
    };

    mutation.mutate(payload);
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
    activeSection,
    goToSection,
    goToNextSection,
    goToPrevSection,
    generateRandomCode,
    handleImageUpload,
    uploadingImage,
    toggleDay,
    merchant,
    isPending: mutation.isPending,
  };
}
