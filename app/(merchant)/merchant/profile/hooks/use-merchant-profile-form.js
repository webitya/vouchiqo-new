"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useMerchantProfile } from "@/hooks/use-merchant";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { showError, showSuccess } from "@/lib/toast";
import { normalizeCategory } from "@/utils/constants";
import {
  merchantProfileSchema,
  STEP_FIELDS,
} from "../schemas/merchant-profile-schema";

/**
 * Custom hook managing merchant business profile state, Zod validation,
 * step navigation guards, image uploads, and profile save mutations.
 */
export const DEFAULT_OPERATING_HOURS = {
  Monday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Tuesday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Wednesday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Thursday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Friday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Saturday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: false,
    isOpen: true,
  },
  Sunday: {
    open: "10:00 AM",
    close: "08:00 PM",
    openTime: "10:00 AM",
    closeTime: "08:00 PM",
    closed: true,
    isOpen: false,
  },
};

export function useMerchantProfileForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { role } = useUser();
  const isAdmin = role === "admin";
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingShop, setUploadingShop] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const form = useZodForm({
    schema: merchantProfileSchema,
    defaultValues: {
      businessName: "",
      slug: "",
      category: "food",
      description: "",
      contactEmail: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      country: "IN",
      lat: "",
      lng: "",
      contactPhone: "",
      constitution: "proprietorship",
      liaisonName: "",
      liaisonDesignation: "owner",
      liaisonPhone: "",
      gmapsLink: "",
      docType: "GST Registration Certificate",
      docImage: "",
      gstin: "",
      isGstExempt: false,
      shopImage: "",
      logo: "",
      banner: "",
      operatingHours: DEFAULT_OPERATING_HOURS,
    },
  });

  const {
    data: merchant,
    isLoading,
    error,
  } = useMerchantProfile();

  useEffect(() => {
    if (merchant) {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const forceEdit = searchParams.get("edit") === "true";
      setIsEditing(forceEdit);
      form.reset({
        businessName: merchant.businessName ?? merchant.registeredName ?? "",
        slug: merchant.slug ?? "",
        category: normalizeCategory(merchant.category),
        customCategoryNotes: merchant.customCategoryNotes ?? "",
        description: merchant.description ?? "",
        contactEmail: merchant.contactEmail ?? merchant.email ?? "",
        address: merchant.location?.address ?? merchant.address ?? "",
        pincode: merchant.location?.pincode ?? merchant.pincode ?? "",
        city: merchant.location?.city ?? merchant.city ?? "",
        state: merchant.location?.state ?? merchant.state ?? "",
        country: merchant.location?.country ?? "IN",
        lat: merchant.location?.coordinates?.lat ?? "",
        lng: merchant.location?.coordinates?.lng ?? "",
        contactPhone:
          merchant.contactPhone ??
          merchant.liaisonPhone ??
          merchant.mobile ??
          "",
        constitution: merchant.constitution ?? "proprietorship",
        liaisonName:
          merchant.liaisonName ??
          merchant.contactName ??
          merchant.signatoryName ??
          "",
        liaisonDesignation:
          merchant.liaisonDesignation ?? merchant.designation ?? "owner",
        liaisonPhone:
          merchant.liaisonPhone ??
          merchant.contactPhone ??
          merchant.mobile ??
          "",
        gmapsLink: merchant.gmapsLink ?? merchant.googleUrl ?? "",
        docType: merchant.docType ?? "GST Registration Certificate",
        docImage: merchant.docImage ?? merchant.docFileUrl ?? "",
        gstin: merchant.gstin ?? "",
        isGstExempt: merchant.isGstExempt ?? false,
        shopImage: merchant.shopImage ?? merchant.shopPhotoUrl ?? "",
        logo: merchant.logo ?? merchant.logoUrl ?? "",
        banner: merchant.banner ?? merchant.bannerUrl ?? "",
        operatingHours:
          merchant.operatingHours &&
          Object.keys(merchant.operatingHours).length > 0
            ? merchant.operatingHours
            : DEFAULT_OPERATING_HOURS,
      });
    } else {
      setIsEditing(true);
    }
  }, [merchant, form.reset]);

  const handleHoursChange = (day, field, value) => {
    const currentHours =
      form.getValues("operatingHours") || DEFAULT_OPERATING_HOURS;
    const dayData = currentHours[day] || {
      open: "10:00 AM",
      close: "08:00 PM",
      openTime: "10:00 AM",
      closeTime: "08:00 PM",
      closed: false,
      isOpen: true,
    };

    const updatedDay = { ...dayData };

    if (field === "closed") {
      const isClosed = Boolean(value);
      updatedDay.closed = isClosed;
      updatedDay.isOpen = !isClosed;
    } else if (field === "open") {
      updatedDay.open = value;
      updatedDay.openTime = value;
    } else if (field === "close") {
      updatedDay.close = value;
      updatedDay.closeTime = value;
    } else {
      updatedDay[field] = value;
    }

    const updatedHours = {
      ...currentHours,
      [day]: updatedDay,
    };
    form.setValue("operatingHours", updatedHours, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleNext = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const fieldsToValidate = STEP_FIELDS[step] || [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const goToStep = async (targetStep, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    const fieldsToValidate = STEP_FIELDS[step] || [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(targetStep);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", field);

    if (field === "logo") setUploadingLogo(true);
    if (field === "banner") setUploadingBanner(true);
    if (field === "shopImage") setUploadingShop(true);
    if (field === "docImage") setUploadingDoc(true);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      form.setValue(field, json.data?.url, { shouldValidate: true });
      showSuccess("Image uploaded successfully!");
    } catch (err) {
      showError(err.message || "Failed to upload file.");
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
      setUploadingShop(false);
      setUploadingDoc(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const url = merchant ? "/api/merchants/me" : "/api/merchants";
      const method = merchant ? "PUT" : "POST";
      return apiFetch(url, {
        method,
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.merchant.profile() });
      queryClient.invalidateQueries({
        queryKey: ["merchant-application-status"],
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
      queryClient.invalidateQueries({
        queryKey: ["merchant-affiliate-products"],
      });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-products"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["merchant-active-coupons"],
      });

      showSuccess(
        "Category & Profile details updated successfully across all listings!",
      );
      setIsEditing(false);

      if (merchant) {
        router.replace("/merchant/profile");
      } else {
        router.push("/merchant/application-status");
      }
    },
    onError: (err) => {
      showError(err.message ?? "Failed to save profile.");
    },
  });

  const onSubmit = (formData) => {
    saveMutation.mutate({
      ...formData,
      category: normalizeCategory(formData.category),
      location: {
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        coordinates: {
          lat:
            formData.lat !== "" && formData.lat != null
              ? Number(formData.lat)
              : undefined,
          lng:
            formData.lng !== "" && formData.lng != null
              ? Number(formData.lng)
              : undefined,
        },
      },
    });
  };

  return {
    form,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    formData: form.watch(),
    step,
    setStep: goToStep,
    handleNext,
    handleBack,
    isEditing,
    setIsEditing,
    merchant,
    isLoading,
    error,
    handleImageUpload,
    handleHoursChange,
    uploadingLogo,
    uploadingBanner,
    uploadingShop,
    uploadingDoc,
    isPending: saveMutation.isPending,
    isAdmin,
  };
}
