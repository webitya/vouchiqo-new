"use client";

import toast from "react-hot-toast";

/**
 * Generate official legal text for agreements and policies.
 */
export const getLegalDocumentText = (docId, docTitle, data) => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const bName =
    data?.tradingName ||
    data?.registeredName ||
    "Merchant Partner Enterprise";
  const lName =
    data?.contactName || data?.signatoryName || "Authorized Signatory";
  const city = data?.city || "Ranchi";
  const state = data?.state || "Jharkhand";

  const header = `================================================================================
VOUCHIQO PLATFORM OFFICIAL LEGAL DOCUMENT
Document: ${(docTitle || "Agreement").toUpperCase()}
Date: ${dateStr}
Merchant Business: ${bName}
Authorized Signatory: ${lName}
Jurisdiction: ${city}, ${state}, India
================================================================================\n\n`;

  if (docId === "merchant_agreement" || docId?.includes("merchant")) {
    return (
      header +
      `1. ENGAGEMENT & SCOPE
This Merchant Agreement governs the partnership between Vouchiqo Technologies Pvt. Ltd. ("Platform") and ${bName} ("Merchant Partner"). The Merchant agrees to list genuine deals, discounts, and promotional offers for consumers on the Vouchiqo platform in Ranchi and Jharkhand.

2. MERCHANT COVENANTS & SERVICE STANDARDS
- The Merchant agrees to honour all valid, active, and verified vouchers and coupon codes presented by customers without discrimination or hidden surcharges.
- Counter and billing staff must be trained to verify codes promptly via the Vouchiqo Merchant Portal.
- The Merchant agrees to record accurate transaction values upon redemption confirmation.

3. COMMISSION & COMMERCIAL TERMS
- Performance commission is payable strictly upon verified redemptions according to the agreed category rate.
- Rates and starter benefits are locked for 6 to 12 months under the Founding Merchant Program.

4. TERM & TERMINATION
- Either party may terminate with 30 days written notice. Immediate suspension applies for willful non-honouring of valid customer vouchers or fraudulent redemption reporting.

Governing Law: Courts of Ranchi, Jharkhand, India.
Authorized Acceptance: Recorded digitally via Vouchiqo Merchant Onboarding Portal.`
    );
  }

  if (docId === "terms_of_service" || docId?.includes("terms")) {
    return (
      header +
      `1. ACCEPTANCE OF TERMS
By accessing the Vouchiqo Merchant Portal, the Merchant agrees to adhere to these Terms of Service.

2. LISTING GUIDELINES
- All published coupons, discounts, and flash sales must reflect authentic commercial offerings.
- Deceptive promotions, false MRP markups, or unavailable stock listings are strictly prohibited.

3. ACCOUNT SECURITY
The Merchant is solely responsible for maintaining credentials of authorized counter attendants and manager logins.

4. PLATFORM AVAILABILITY
Vouchiqo maintains high-availability servers for real-time coupon verification with 99.5% uptime commitment.`
    );
  }

  if (docId === "privacy_policy" || docId?.includes("privacy")) {
    return (
      header +
      `1. DATA PRIVACY & STEWARDSHIP
Vouchiqo values merchant confidentiality. Statutory documents (GSTIN/MSME/Trade License), store coordinates, and financial metrics are stored with bank-grade encryption (AES-256).

2. USAGE OF BUSINESS DATA
Business information, storefront imagery, and operating hours are published across consumer deal channels. Sensitive compliance documents remain restricted to compliance auditors.

3. COMPLIANCE WITH REGULATIONS
In compliance with the Digital Personal Data Protection Act (DPDPA), 2023 and applicable Indian e-commerce regulations.`
    );
  }

  if (docId === "verification_policy" || docId?.includes("verification")) {
    return (
      header +
      `1. STATUTORY AUDIT & STOREFRONT VERIFICATION
All merchant partners undergo document and location verification by Vouchiqo Compliance Desk #4 (Ranchi Operations).

2. VERIFICATION TIMELINES
Document review is typically processed within 2 to 4 hours of submission. Merchants receive live SMS and dashboard notifications upon status updates.

3. REJECTION & RECTIFICATION
If any statutory document is illegible or unverified, merchants are granted immediate access to update details via the Merchant Portal.`
    );
  }

  if (docId === "refund_cancellation" || docId?.includes("refund")) {
    return (
      header +
      `1. SUBSCRIPTION TRIAL & CANCELLATION
Paid merchant tiers (Growth, Pro) include a 14-day zero-risk trial. If cancelled during the trial period, no subscription fees are billed.

2. CONSUMER DISPUTE RESOLUTION
In the event a customer reports a valid voucher was dishonoured, Vouchiqo mediation team reviews counter records within 24 hours.

3. COMMISSION REVERSALS
Any performance commission charged on reversed, cancelled, or disputed transactions will be promptly refunded to the merchant ledger.`
    );
  }

  return (
    header +
    `This document constitutes an official policy agreement between Vouchiqo Technologies and ${bName}. All terms, conditions, and operational guidelines specified in the Vouchiqo Merchant Portal apply in full force.`
  );
};

/**
 * Downloads generated text as a file blob in the browser.
 */
export const downloadLegalBlob = (filename, textContent) => {
  const cleanName = (filename || "Agreement")
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Vouchiqo_${cleanName}.txt`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 1000);
};

/**
 * Direct file download helper supporting both external Google Drive URLs and synthesized legal blobs.
 */
export const handleDirectDownload = (link, filename, itemId, formData, setDownloadingPdfId) => {
  setDownloadingPdfId(itemId);
  toast.success(`Starting download: ${filename || "Agreement"}...`, {
    id: `dl-${itemId}`,
  });

  const isRealExternalUrl =
    link &&
    link.trim() &&
    !link.includes("1_sample_") &&
    !link.includes("sample_") &&
    !link.includes("example.com") &&
    /^https?:\/\//i.test(link.trim());

  if (isRealExternalUrl) {
    const trimmed = link.trim();
    const m =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    const directUrl =
      m && m[1]
        ? `https://drive.google.com/uc?export=download&id=${m[1]}`
        : trimmed;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = directUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch {}
      setDownloadingPdfId(null);
    }, 2500);
  } else {
    setTimeout(() => {
      const docText = getLegalDocumentText(
        itemId,
        filename || "Agreement",
        formData,
      );
      downloadLegalBlob(filename || itemId, docText);
      setDownloadingPdfId(null);
    }, 300);
  }
};

/**
 * Downloads all policy documents sequentially with progress updates.
 */
export const handleDownloadAllDocuments = async (
  policyItems,
  formData,
  setDownloadProgress,
  setIsDownloadingAll,
  setDownloadingPdfId,
) => {
  setIsDownloadingAll(true);
  toast.info(`Downloading all ${policyItems.length} legal documents...`, {
    id: "dl-all-start",
  });

  for (let i = 0; i < policyItems.length; i++) {
    const p = policyItems[i];
    const itemKey = p.id || p.key || `policy${i + 1}`;
    const title = p.title || p.text || `Document ${i + 1}`;
    setDownloadingPdfId(itemKey);
    setDownloadProgress(`(${i + 1}/${policyItems.length})`);

    const isRealExternalUrl =
      p.link &&
      p.link.trim() &&
      !p.link.includes("1_sample_") &&
      !p.link.includes("sample_") &&
      !p.link.includes("example.com") &&
      /^https?:\/\//i.test(p.link.trim());

    if (isRealExternalUrl) {
      const trimmed = p.link.trim();
      const m =
        trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      const directUrl =
        m && m[1]
          ? `https://drive.google.com/uc?export=download&id=${m[1]}`
          : trimmed;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = directUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try {
          if (document.body.contains(iframe))
            document.body.removeChild(iframe);
        } catch {}
      }, 2000);
    } else {
      const docText = getLegalDocumentText(itemKey, title, formData);
      downloadLegalBlob(title, docText);
    }

    // Stagger downloads by 450ms so browser doesn't block multiple files
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  setDownloadingPdfId(null);
  setIsDownloadingAll(false);
  setDownloadProgress("");
  toast.success("All 5 policy documents downloaded successfully!", {
    id: "dl-all-success",
  });
};
