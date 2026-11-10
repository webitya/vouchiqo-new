/**
 * Form validation helpers for Merchant Onboarding Wizard
 */

export function validateStep(currentStep, formData, customCategoryCharCount) {
  const errors = {};

  if (currentStep === 1) {
    if (!formData.registeredName?.trim()) {
      errors.registeredName = "Registered Business Name is required";
    }
    if (!formData.category) {
      errors.category = "Primary Category is required";
    }
    if (formData.category === "others") {
      if (!formData.customCategoryName?.trim()) {
        errors.customCategoryName = "Custom Category Name is required";
      }
      if (customCategoryCharCount < 80) {
        errors.customCategoryNotes = `At least ${80 - customCategoryCharCount} more character(s) required (minimum 80 chars).`;
      }
    }
    if (!formData.address?.trim()) {
      errors.address = "Operating Store Address is required";
    }
    if (!formData.pincode || formData.pincode.length < 6) {
      errors.pincode = "Valid 6-digit PIN Code is required";
    }
    if (!formData.city?.trim()) {
      errors.city = "City / District is required";
    }
    if (!formData.state?.trim()) {
      errors.state = "State is required";
    }
  } else if (currentStep === 2) {
    if (!formData.contactName?.trim()) {
      errors.contactName = "Authorised Liaison Name is required";
    }
    if (!formData.designation) {
      errors.designation = "Designation is required";
    }
    if (!formData.mobile?.trim() || formData.mobile.length < 10) {
      errors.mobile = "Valid 10-digit Mobile Number is required";
    }
    if (!formData.email?.trim() || !formData.email.includes("@")) {
      errors.email = "Valid Business Email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  } else if (currentStep === 4) {
    if (!formData.selectedPlan) {
      errors.selectedPlan = "Please select a Merchant Plan";
    }
  } else if (currentStep === 5) {
    if (!formData.commissionAgreed) {
      errors.commissionAgreed =
        "Please acknowledge and accept the performance commission structure to proceed";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAgreementsSubmission(formData, commitmentItems, policyItems) {
  const errors = {};

  commitmentItems.forEach((c, idx) => {
    if (c.required === false) return;
    const itemKey = c.key || `commit${idx + 1}`;
    const isChecked =
      !!formData[itemKey] || !!formData.commitmentsAccepted?.[c.id];
    if (!isChecked) errors[itemKey] = true;
  });

  policyItems.forEach((p, idx) => {
    if (p.required === false) return;
    const itemKey = p.key || `policy${idx + 1}`;
    const isChecked =
      !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
    if (!isChecked) errors[itemKey] = true;
  });

  const effectiveSignatoryName = (
    formData.contactName ||
    formData.signatoryName ||
    ""
  ).trim();

  if (!effectiveSignatoryName) {
    errors.contactName = "Please enter Authorized Liaison Name in Section B";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    effectiveSignatoryName,
  };
}
