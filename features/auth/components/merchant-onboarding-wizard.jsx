"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@/hooks/use-user";
import { authClient, signUp } from "@/lib/auth-client";

// Import constants and defaults
import {
  COMMISSION_TABLE,
  DEFAULT_COMMITMENTS,
  DEFAULT_PLANS,
  DEFAULT_POLICIES,
  INITIAL_FORM_DATA,
  MASTER_STEPS,
  SHADOW_INPUT_CLASS,
  SHADOW_SELECT_CLASS,
  SHADOW_TEXTAREA_CLASS,
} from "./onboarding-wizard/constants";
import ExitConfirmModal from "./onboarding-wizard/ExitConfirmModal";

// Import legal document utilities
import {
  handleDirectDownload as execDirectDownload,
  handleDownloadAllDocuments as execDownloadAll,
} from "./onboarding-wizard/legal-documents";
import Step1IdentityLocation from "./onboarding-wizard/Step1IdentityLocation";
import Step2ContactAccount from "./onboarding-wizard/Step2ContactAccount";
import Step3DocumentsUploads from "./onboarding-wizard/Step3DocumentsUploads";
import Step4PlanSelection from "./onboarding-wizard/Step4PlanSelection";
import Step5HoursCommission from "./onboarding-wizard/Step5HoursCommission";
import Step6DeclarationsReview from "./onboarding-wizard/Step6DeclarationsReview";
import SubmissionSuccessModal from "./onboarding-wizard/SubmissionSuccessModal";
// Import validation helpers
import {
  validateAgreementsSubmission,
  validateStep,
} from "./onboarding-wizard/validation";
import WizardFooter from "./onboarding-wizard/WizardFooter";
// Import modular step components and modals
import WizardHeader from "./onboarding-wizard/WizardHeader";

export function MerchantOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, isLoaded: sessionLoaded } = useUser();

  // Settings from Admin
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings?public=true");
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.settings || json?.settings || null;
    },
    staleTime: 5000,
  });

  const commitmentItems =
    publicSettings?.merchant_commitments || DEFAULT_COMMITMENTS;
  const policyItems = publicSettings?.policy_agreements || DEFAULT_POLICIES;
  const masterCpaRates = publicSettings?.master_cpa_rates || COMMISSION_TABLE;

  // Dynamic Plans from DB
  const [plansFromDb, setPlansFromDb] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicPlans() {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const json = await res.json();
          const dbPlans = json?.data?.plans || json?.plans;
          if (Array.isArray(dbPlans) && dbPlans.length > 0 && isMounted) {
            setPlansFromDb(dbPlans.filter((p) => p.active !== false));
          }
        }
      } catch (err) {
        console.error("[MerchantWizard] Error fetching dynamic plans:", err);
      }
    }
    loadDynamicPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const merchantPlans =
    plansFromDb || publicSettings?.merchant_plans || DEFAULT_PLANS;

  // Wizard Navigation & Submission States
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState({});
  const [checkingExistingMerchant, setCheckingExistingMerchant] =
    useState(true);
  const [showMasterCpaTable, setShowMasterCpaTable] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);

  // File Uploading States
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingShopPhoto, setUploadingShopPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Geolocation & Sub-category Tags States
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoryTags, setSubCategoryTags] = useState([
    "Dine-in Offers",
    "Special Combos",
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Check if user is already a registered merchant.
  // - Waits for the session to resolve first so authUser is reliable
  // - Uses AbortController with 8 s timeout so fetch can never hang indefinitely
  useEffect(() => {
    // Don't run until Better Auth has finished resolving the session
    if (!sessionLoaded) return;

    let isMounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    async function checkExisting() {
      try {
        // Guest with no session — show the registration form immediately
        if (!authUser) {
          if (isMounted) setCheckingExistingMerchant(false);
          return;
        }

        const res = await fetch("/api/merchants/me", {
          signal: controller.signal,
        });

        if (!res.ok) {
          // 401/403/404 all mean "not a merchant yet" — show the form
          if (isMounted) setCheckingExistingMerchant(false);
          return;
        }

        const json = await res.json();
        const merchant = json?.data?.merchant || json?.data;

        if (
          merchant &&
          (merchant._id || merchant.status || merchant.businessName)
        ) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("vouchiqo_is_merchant", "true");
          }
          if (merchant.status === "approved") {
            router.replace("/merchant/dashboard");
          } else {
            router.replace("/merchant/application-status");
          }
        } else {
          if (isMounted) setCheckingExistingMerchant(false);
        }
      } catch {
        // AbortError (8 s timeout) or network error — always unlock the form
        if (isMounted) setCheckingExistingMerchant(false);
      } finally {
        clearTimeout(timeout);
      }
    }

    checkExisting();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [sessionLoaded, router, authUser]);

  // File Upload Handler
  const handleFileUpload = async (file, targetField, setUploadingState) => {
    if (!file) return;
    setUploadingState(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "merchants");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Upload failed");
      }

      const json = await res.json();
      const fileUrl = json.data?.url;
      setFormData((prev) => ({ ...prev, [targetField]: fileUrl }));
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "File upload failed.");
    } finally {
      setUploadingState(false);
    }
  };

  // Location Geolocation Handler
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setIsFetchingLocation(false);
        toast.success(
          `Location captured: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
        );
      },
      () => {
        setIsFetchingLocation(false);
        toast.error(
          "Could not fetch location. Please allow browser permissions.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Sub-category Tags Handlers
  const handleAddTag = (e) => {
    if (e.key === "Enter" && subCategoryInput.trim()) {
      e.preventDefault();
      if (!subCategoryTags.includes(subCategoryInput.trim())) {
        setSubCategoryTags([...subCategoryTags, subCategoryInput.trim()]);
      }
      setSubCategoryInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSubCategoryTags(subCategoryTags.filter((t) => t !== tagToRemove));
  };

  const customCategoryCharCount = (formData.customCategoryNotes || "").trim()
    .length;

  // Duplicate Check Handler
  const checkDuplicateField = async (field, value) => {
    if (!value || !value.trim()) {
      setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
      return true;
    }
    try {
      const res = await fetch("/api/merchants/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      const json = await res.json();
      if (json.data && !json.data.available) {
        setDuplicateErrors((prev) => ({ ...prev, [field]: json.data.message }));
        toast.error(json.data.message);
        return false;
      } else {
        setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
        return true;
      }
    } catch {
      return true;
    }
  };

  // Auto Suggest Password Handler
  const handleAutoSuggestPassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "@#$%!&*=";
    const allChars = upper + lower + numbers + symbols;

    const pwdArr = [
      upper.charAt(Math.floor(Math.random() * upper.length)),
      lower.charAt(Math.floor(Math.random() * lower.length)),
      numbers.charAt(Math.floor(Math.random() * numbers.length)),
      symbols.charAt(Math.floor(Math.random() * symbols.length)),
    ];

    for (let i = 0; i < 8; i++) {
      pwdArr.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
    }

    const suggested = pwdArr.sort(() => Math.random() - 0.5).join("");
    setFormData((prev) => ({ ...prev, password: suggested }));
    setShowPassword(true);
    toast.success("Generated 12-char complex password!");
  };

  // Step Validation & Navigation Next Handler
  const handleNext = async () => {
    const { isValid, errors } = validateStep(
      currentStep,
      formData,
      customCategoryCharCount,
    );

    if (!isValid) {
      setFieldErrors(errors);
      toast.error(
        currentStep === 4
          ? "Please select a Merchant Plan"
          : currentStep === 5
            ? "Please acknowledge and accept the performance commission structure."
            : "Please complete the required fields highlighted in red.",
      );
      return;
    }
    setFieldErrors({});

    if (currentStep === 2) {
      const emailOk = await checkDuplicateField("email", formData.email);
      const phoneOk = await checkDuplicateField("phone", formData.mobile);
      if (!emailOk || !phoneOk) return;
    }

    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  // Agreements Calculations & Handlers
  const allCommitmentsChecked =
    commitmentItems.length > 0 &&
    commitmentItems.every((c, idx) => {
      const itemKey = c.key || `commit${idx + 1}`;
      return !!formData[itemKey] || !!formData.commitmentsAccepted?.[c.id];
    });

  const allPoliciesChecked =
    policyItems.length > 0 &&
    policyItems.every((p, idx) => {
      const itemKey = p.key || `policy${idx + 1}`;
      return !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
    });

  const areAllAgreementsChecked = allCommitmentsChecked && allPoliciesChecked;

  const totalAgreementsCount = commitmentItems.length + policyItems.length;
  const acceptedAgreementsCount =
    commitmentItems.filter((c, idx) => {
      const itemKey = c.key || `commit${idx + 1}`;
      return !!formData[itemKey] || !!formData.commitmentsAccepted?.[c.id];
    }).length +
    policyItems.filter((p, idx) => {
      const itemKey = p.key || `policy${idx + 1}`;
      return !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
    }).length;

  const handleToggleAllAgreements = (shouldAccept) => {
    const targetState =
      typeof shouldAccept === "boolean"
        ? shouldAccept
        : !areAllAgreementsChecked;

    const updatedCommitments = { ...(formData.commitmentsAccepted || {}) };
    const updatedPolicies = { ...(formData.policiesAccepted || {}) };
    const fieldUpdates = {};

    commitmentItems.forEach((c, idx) => {
      const itemKey = c.key || `commit${idx + 1}`;
      fieldUpdates[itemKey] = targetState;
      if (c.id) updatedCommitments[c.id] = targetState;
    });

    policyItems.forEach((p, idx) => {
      const itemKey = p.key || `policy${idx + 1}`;
      fieldUpdates[itemKey] = targetState;
      if (p.id) updatedPolicies[p.id] = targetState;
    });

    setFormData((prev) => ({
      ...prev,
      ...fieldUpdates,
      commitmentsAccepted: updatedCommitments,
      policiesAccepted: updatedPolicies,
    }));

    if (targetState) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        commitmentItems.forEach((c, idx) => {
          const itemKey = c.key || `commit${idx + 1}`;
          delete next[itemKey];
        });
        policyItems.forEach((p, idx) => {
          const itemKey = p.key || `policy${idx + 1}`;
          delete next[itemKey];
        });
        return next;
      });
      toast.success("All declarations & policy agreements accepted!");
    } else {
      toast("Deselected all agreements", { icon: "ℹ️" });
    }
  };

  const handleToggleCommitmentsOnly = (shouldAccept) => {
    const targetState =
      typeof shouldAccept === "boolean" ? shouldAccept : !allCommitmentsChecked;
    const updatedCommitments = { ...(formData.commitmentsAccepted || {}) };
    const fieldUpdates = {};

    commitmentItems.forEach((c, idx) => {
      const itemKey = c.key || `commit${idx + 1}`;
      fieldUpdates[itemKey] = targetState;
      if (c.id) updatedCommitments[c.id] = targetState;
    });

    setFormData((prev) => ({
      ...prev,
      ...fieldUpdates,
      commitmentsAccepted: updatedCommitments,
    }));

    if (targetState) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        commitmentItems.forEach((c, idx) => {
          const itemKey = c.key || `commit${idx + 1}`;
          delete next[itemKey];
        });
        return next;
      });
      toast.success("All merchant commitments accepted!");
    }
  };

  const handleTogglePoliciesOnly = (shouldAccept) => {
    const targetState =
      typeof shouldAccept === "boolean" ? shouldAccept : !allPoliciesChecked;
    const updatedPolicies = { ...(formData.policiesAccepted || {}) };
    const fieldUpdates = {};

    policyItems.forEach((p, idx) => {
      const itemKey = p.key || `policy${idx + 1}`;
      fieldUpdates[itemKey] = targetState;
      if (p.id) updatedPolicies[p.id] = targetState;
    });

    setFormData((prev) => ({
      ...prev,
      ...fieldUpdates,
      policiesAccepted: updatedPolicies,
    }));

    if (targetState) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        policyItems.forEach((p, idx) => {
          const itemKey = p.key || `policy${idx + 1}`;
          delete next[itemKey];
        });
        return next;
      });
      toast.success("All policy agreements accepted!");
    }
  };

  // Direct Document Download
  const handleDirectDownload = (link, filename, itemId) => {
    execDirectDownload(link, filename, itemId, formData, setDownloadingPdfId);
  };

  // Download All Documents
  const handleDownloadAllDocuments = async () => {
    await execDownloadAll(
      policyItems,
      formData,
      setDownloadProgress,
      setIsDownloadingAll,
      setDownloadingPdfId,
    );
  };

  // Final Form Submission Handler
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const { isValid, errors, effectiveSignatoryName } =
      validateAgreementsSubmission(formData, commitmentItems, policyItems);

    if (!isValid) {
      setFieldErrors(errors);
      toast.error(
        "Please accept all mandatory agreements highlighted with red outlines.",
      );
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      if (!authUser) {
        const { error } = await signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.tradingName || formData.registeredName,
          role: "merchant",
          data: {
            role: "merchant",
            phoneNumber: formData.mobile,
          },
        });

        if (
          error &&
          !error.message?.includes("already registered") &&
          !error.message?.includes("already exists")
        ) {
          throw new Error(error.message || "Registration failed.");
        }
      }

      const cleanPhone = (p) => (p || "").replace(/\D/g, "").slice(-10);
      const cleanUrl = (u) => {
        if (!u || !u.trim()) return "";
        const trimmed = u.trim();
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };

      const merchantPayload = {
        businessName: formData.tradingName || formData.registeredName,
        slug:
          (formData.tradingName || formData.registeredName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 50) || "merchant",
        category: formData.category,
        customCategoryNotes: formData.customCategoryNotes,
        subCategoryTags: subCategoryTags || [],
        tags: subCategoryTags || [],
        constitution: formData.constitution,
        location: {
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          country: "IN",
          coordinates: {
            lat: formData.latitude ? Number(formData.latitude) : undefined,
            lng: formData.longitude ? Number(formData.longitude) : undefined,
          },
        },
        contactEmail: (formData.email || authUser?.email || "")
          .toLowerCase()
          .trim(),
        password: formData.password || undefined,
        contactPhone: cleanPhone(formData.mobile || authUser?.phoneNumber),
        whatsappNumber: cleanPhone(formData.whatsapp || formData.mobile),
        website: cleanUrl(formData.websiteUrl),
        socialLinks: {
          instagram: formData.instagramHandle
            ? formData.instagramHandle.startsWith("http")
              ? formData.instagramHandle
              : `https://instagram.com/${formData.instagramHandle.replace(/^@/, "")}`
            : "",
          facebook: cleanUrl(formData.facebookUrl),
          twitter: "",
          linkedin: "",
        },
        liaisonName: effectiveSignatoryName,
        signatoryName: effectiveSignatoryName,
        liaisonDesignation: formData.designation,
        liaisonPhone: cleanPhone(formData.mobile),
        docType: formData.docType,
        docImage: formData.docFileUrl,
        docFileUrl: formData.docFileUrl,
        shopImage: formData.shopPhotoUrl,
        shopPhotoUrl: formData.shopPhotoUrl,
        logo: formData.logoUrl,
        logoUrl: formData.logoUrl,
        banner: formData.bannerUrl,
        bannerUrl: formData.bannerUrl,
        plan: formData.selectedPlan,
        commissionRate: (() => {
          const matchedComm = masterCpaRates.find(
            (c) =>
              (c.id && c.id === formData.category) ||
              c.category
                .toLowerCase()
                .includes(formData.category.toLowerCase()) ||
              c.category
                .toLowerCase()
                .startsWith(formData.category.slice(0, 4).toLowerCase()),
          );
          return matchedComm ? matchedComm.rate : "3% – 5%";
        })(),
        commissionModel: (() => {
          const matchedComm = masterCpaRates.find(
            (c) =>
              (c.id && c.id === formData.category) ||
              c.category
                .toLowerCase()
                .includes(formData.category.toLowerCase()) ||
              c.category
                .toLowerCase()
                .startsWith(formData.category.slice(0, 4).toLowerCase()),
          );
          return matchedComm ? matchedComm.model : "CPA";
        })(),
        commissionAgreed: formData.commissionAgreed,
        gmapsLink: cleanUrl(formData.googleUrl),
        operatingHours: formData.operatingHours,
      };

      const merchantRes = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merchantPayload),
      });

      if (!merchantRes.ok) {
        const errJson = await merchantRes.json().catch(() => ({}));
        throw new Error(
          errJson.message ||
            errJson.error ||
            "Failed to submit merchant application.",
        );
      }

      try {
        await authClient.getSession({ query: { disableCookieCache: true } });
      } catch (_) {}

      await queryClient.invalidateQueries({
        queryKey: ["merchant-application-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }

      toast.success(
        "Application submitted! Welcome to Vouchiqo for Merchants.",
      );

      setSubmissionSuccessData({
        businessName:
          formData.tradingName || formData.registeredName || "Merchant Partner",
        applicationId: `VQ-2026-${Date.now().toString().slice(-5)}`,
      });
    } catch (err) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMasterStep = currentStep <= 2 ? 1 : currentStep <= 4 ? 2 : 3;

  // Style class getters
  const shadowInputClass = SHADOW_INPUT_CLASS;
  const shadowSelectClass = SHADOW_SELECT_CLASS;
  const shadowTextareaClass = SHADOW_TEXTAREA_CLASS;

  const getLabelClass = (
    fieldName,
    defaultClass = "text-xs font-medium text-slate-700",
  ) => {
    if (fieldErrors[fieldName]) {
      return "text-xs font-bold text-slate-900 transition-all";
    }
    return defaultClass;
  };

  const getInputClass = (fieldName, defaultClass = shadowInputClass) => {
    if (fieldErrors[fieldName]) {
      return "pl-8 bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:outline-none transition-all";
    }
    return defaultClass;
  };

  const getSelectClass = (fieldName, defaultClass = shadowSelectClass) => {
    if (fieldErrors[fieldName]) {
      return "w-full bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 px-3 font-normal focus:outline-none transition-all";
    }
    return defaultClass;
  };

  const getTextareaClass = (fieldName, defaultClass = shadowTextareaClass) => {
    if (fieldErrors[fieldName]) {
      return "bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] text-xs rounded-lg font-normal placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 transition-all";
    }
    return defaultClass;
  };

  if (checkingExistingMerchant) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-xl mx-auto my-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-700">
          Checking merchant account status...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-3 text-left font-sans text-slate-900 pb-0">
      {/* Header Banner & Master Stepper */}
      <WizardHeader
        currentStep={currentStep}
        activeMasterStep={activeMasterStep}
        MASTER_STEPS={MASTER_STEPS}
        onExitClick={() => setShowExitConfirmModal(true)}
        router={router}
      />

      {/* SECTION 1: BUSINESS IDENTITY & LOCATION */}
      {currentStep === 1 && (
        <Step1IdentityLocation
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          duplicateErrors={duplicateErrors}
          checkDuplicateField={checkDuplicateField}
          isFetchingLocation={isFetchingLocation}
          handleFetchLocation={handleFetchLocation}
          subCategoryInput={subCategoryInput}
          setSubCategoryInput={setSubCategoryInput}
          subCategoryTags={subCategoryTags}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          customCategoryCharCount={customCategoryCharCount}
          getInputClass={getInputClass}
          getSelectClass={getSelectClass}
          getTextareaClass={getTextareaClass}
          getLabelClass={getLabelClass}
          shadowInputClass={shadowInputClass}
          shadowSelectClass={shadowSelectClass}
        />
      )}

      {/* SECTION 2: CONTACT & ACCOUNT SETUP */}
      {currentStep === 2 && (
        <Step2ContactAccount
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          duplicateErrors={duplicateErrors}
          checkDuplicateField={checkDuplicateField}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleAutoSuggestPassword={handleAutoSuggestPassword}
          getInputClass={getInputClass}
          getSelectClass={getSelectClass}
          getLabelClass={getLabelClass}
          shadowInputClass={shadowInputClass}
          shadowSelectClass={shadowSelectClass}
        />
      )}

      {/* SECTION 3: BUSINESS VERIFICATION DOCUMENTS */}
      {currentStep === 3 && (
        <Step3DocumentsUploads
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          handleFileUpload={handleFileUpload}
          uploadingDoc={uploadingDoc}
          setUploadingDoc={setUploadingDoc}
          uploadingShopPhoto={uploadingShopPhoto}
          setUploadingShopPhoto={setUploadingShopPhoto}
          uploadingLogo={uploadingLogo}
          setUploadingLogo={setUploadingLogo}
          uploadingBanner={uploadingBanner}
          setUploadingBanner={setUploadingBanner}
          getInputClass={getInputClass}
          getSelectClass={getSelectClass}
          getLabelClass={getLabelClass}
          shadowInputClass={shadowInputClass}
          shadowSelectClass={shadowSelectClass}
        />
      )}

      {/* SECTION 4: PLAN SELECTION */}
      {currentStep === 4 && (
        <Step4PlanSelection
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          merchantPlans={merchantPlans}
          plansFromDb={plansFromDb}
          handleDirectDownload={handleDirectDownload}
          shadowInputClass={shadowInputClass}
        />
      )}

      {/* SECTION 5: COMMISSION & HOURS */}
      {currentStep === 5 && (
        <Step5HoursCommission
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          showMasterCpaTable={showMasterCpaTable}
          setShowMasterCpaTable={setShowMasterCpaTable}
          masterCpaRates={masterCpaRates}
          getLabelClass={getLabelClass}
          shadowSelectClass={shadowSelectClass}
        />
      )}

      {/* SECTION 6: DECLARATIONS & SUBMIT */}
      {currentStep === 6 && (
        <Step6DeclarationsReview
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          commitmentItems={commitmentItems}
          policyItems={policyItems}
          areAllAgreementsChecked={areAllAgreementsChecked}
          allCommitmentsChecked={allCommitmentsChecked}
          allPoliciesChecked={allPoliciesChecked}
          acceptedAgreementsCount={acceptedAgreementsCount}
          totalAgreementsCount={totalAgreementsCount}
          handleToggleAllAgreements={handleToggleAllAgreements}
          handleToggleCommitmentsOnly={handleToggleCommitmentsOnly}
          handleTogglePoliciesOnly={handleTogglePoliciesOnly}
          downloadingPdfId={downloadingPdfId}
          handleDirectDownload={handleDirectDownload}
          handleDownloadAllDocuments={handleDownloadAllDocuments}
          isDownloadingAll={isDownloadingAll}
          downloadProgress={downloadProgress}
          uploadingSignature={uploadingSignature}
          setUploadingSignature={setUploadingSignature}
          handleFileUpload={handleFileUpload}
          setCurrentStep={setCurrentStep}
          getInputClass={getInputClass}
          getLabelClass={getLabelClass}
          shadowInputClass={shadowInputClass}
        />
      )}

      {/* Sticky Bottom Navigation Bar */}
      <WizardFooter
        currentStep={currentStep}
        isSubmitting={isSubmitting}
        onPrev={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
        onNext={handleNext}
        onSubmit={handleSubmit}
        allCommitmentsChecked={allCommitmentsChecked}
        allPoliciesChecked={allPoliciesChecked}
        onToggleCommitmentsOnly={() =>
          handleToggleCommitmentsOnly(!allCommitmentsChecked)
        }
        onTogglePoliciesOnly={() =>
          handleTogglePoliciesOnly(!allPoliciesChecked)
        }
        onDownloadAllDocuments={handleDownloadAllDocuments}
        isDownloadingAll={isDownloadingAll}
        downloadProgress={downloadProgress}
      />

      {/* Exit Confirmation Dialog */}
      <ExitConfirmModal
        isOpen={showExitConfirmModal}
        onClose={() => setShowExitConfirmModal(false)}
        router={router}
      />

      {/* Post-Registration Success Dialog */}
      <SubmissionSuccessModal data={submissionSuccessData} router={router} />
    </div>
  );
}

export default MerchantOnboardingWizard;
