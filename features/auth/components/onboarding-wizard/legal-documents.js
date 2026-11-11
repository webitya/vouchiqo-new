"use client";

import toast from "react-hot-toast";

/**
 * Sanitizes characters outside standard WinAnsi / ASCII for Type 1 Helvetica in PDF 1.4.
 */
function cleanTextForPdf(str) {
  if (!str) return "";
  return String(str)
    .replace(/[₹]/g, "INR ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u25CF]/g, "*")
    .replace(/[\u2026]/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

/**
 * Escapes characters for PDF literal text strings: \( \) \\
 */
function escapePdfString(str) {
  const clean = cleanTextForPdf(str);
  return clean
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Generates a valid PDF 1.4 binary (Uint8Array) with standard typography,
 * page breaking, branded header, metadata box, and digital seal.
 */
export function generateLegalPdfBinary({
  title,
  subtitle,
  metadata = [],
  sections = [],
}) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 13;
  const startY = pageHeight - margin - 15;

  const pages = [];
  let currentPageOps = [];
  let currentY = startY;

  function initPage() {
    // Top festival teal banner
    currentPageOps.push("0.082 0.584 0.533 rg"); // #159588
    currentPageOps.push(`0 ${pageHeight - 6} ${pageWidth} 6 re f`);
    currentPageOps.push("0 g"); // Reset fill
  }

  function checkPageBreak(neededHeight) {
    if (currentY - neededHeight < margin + 35) {
      addFooter(pages.length + 1);
      pages.push(currentPageOps);
      currentPageOps = [];
      currentY = startY;
      initPage();
    }
  }

  function addFooter(pageNum) {
    currentPageOps.push("0.82 0.82 0.82 RG 0.5 w");
    currentPageOps.push(`${margin} 38 m ${pageWidth - margin} 38 l S`);
    currentPageOps.push(
      `BT /F2 8 Tf 0.45 0.45 0.45 rg ${margin} 26 Td (Vouchiqo Technologies Pvt. Ltd. | Official Statutory Document | Page ${pageNum}) Tj ET`,
    );
    currentPageOps.push("0 g");
  }

  initPage();

  // Document Title Header
  currentPageOps.push(
    `BT /F1 15 Tf 0.082 0.584 0.533 rg ${margin} ${currentY} Td (${escapePdfString(title)}) Tj ET`,
  );
  currentY -= 20;

  if (subtitle) {
    currentPageOps.push(
      `BT /F2 9.5 Tf 0.35 0.4 0.45 rg ${margin} ${currentY} Td (${escapePdfString(subtitle)}) Tj ET`,
    );
    currentY -= 16;
  }

  // Thin separator line
  currentPageOps.push("0.85 0.85 0.85 RG 0.75 w");
  currentPageOps.push(
    `${margin} ${currentY} m ${pageWidth - margin} ${currentY} l S`,
  );
  currentY -= 14;

  // Metadata block
  if (metadata.length > 0) {
    const rowHeight = 14;
    const boxHeight = metadata.length * rowHeight + 12;
    checkPageBreak(boxHeight + 10);

    currentPageOps.push(
      `0.965 0.975 0.985 rg ${margin} ${currentY - boxHeight + 8} ${contentWidth} ${boxHeight} re f`,
    );
    currentPageOps.push(
      `0.85 0.89 0.93 RG 0.75 w ${margin} ${currentY - boxHeight + 8} ${contentWidth} ${boxHeight} re S`,
    );

    let metaY = currentY - 4;
    for (const item of metadata) {
      currentPageOps.push(
        `BT /F1 8.5 Tf 0.15 0.22 0.28 rg ${margin + 12} ${metaY} Td (${escapePdfString(item.label)}:) Tj ET`,
      );
      currentPageOps.push(
        `BT /F2 8.5 Tf 0.2 0.25 0.3 rg ${margin + 140} ${metaY} Td (${escapePdfString(item.value)}) Tj ET`,
      );
      metaY -= rowHeight;
    }
    currentY -= boxHeight + 12;
  }

  // Sections
  for (const sec of sections) {
    checkPageBreak(30);
    if (sec.heading) {
      currentPageOps.push(
        `BT /F1 10.5 Tf 0.082 0.584 0.533 rg ${margin} ${currentY} Td (${escapePdfString(sec.heading)}) Tj ET`,
      );
      currentY -= 15;
    }

    if (sec.paragraphs) {
      for (const p of sec.paragraphs) {
        const words = cleanTextForPdf(p).split(/\s+/).filter(Boolean);
        let curLine = "";
        for (const w of words) {
          const testLine = curLine ? `${curLine} ${w}` : w;
          const approxWidth = testLine.length * 4.9;
          if (approxWidth > contentWidth && curLine) {
            checkPageBreak(lineHeight);
            currentPageOps.push(
              `BT /F2 9 Tf 0.2 0.22 0.25 rg ${margin} ${currentY} Td (${escapePdfString(curLine)}) Tj ET`,
            );
            currentY -= lineHeight;
            curLine = w;
          } else {
            curLine = testLine;
          }
        }
        if (curLine) {
          checkPageBreak(lineHeight);
          currentPageOps.push(
            `BT /F2 9 Tf 0.2 0.22 0.25 rg ${margin} ${currentY} Td (${escapePdfString(curLine)}) Tj ET`,
          );
          currentY -= lineHeight;
        }
        currentY -= 5;
      }
    }
    currentY -= 6;
  }

  // Digital Signatory Seal Box
  checkPageBreak(65);
  const sealBoxY = currentY - 55;
  currentPageOps.push(
    `0.94 0.985 0.97 rg ${margin} ${sealBoxY} ${contentWidth} 50 re f`,
  );
  currentPageOps.push(
    `0.082 0.584 0.533 RG 0.8 w ${margin} ${sealBoxY} ${contentWidth} 50 re S`,
  );
  currentPageOps.push(
    `BT /F1 9 Tf 0.082 0.584 0.533 rg ${margin + 12} ${sealBoxY + 34} Td (DIGITAL VERIFICATION & MERCHANT ACCEPTANCE RECORD) Tj ET`,
  );
  currentPageOps.push(
    `BT /F2 8 Tf 0.2 0.3 0.3 rg ${margin + 12} ${sealBoxY + 20} Td (Recorded digitally via Vouchiqo Merchant Onboarding Portal. Legally binding under IT Act 2000.) Tj ET`,
  );
  const hashId = `VQC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  currentPageOps.push(
    `BT /F2 7.5 Tf 0.4 0.45 0.5 rg ${margin + 12} ${sealBoxY + 8} Td (Digital Audit Hash: ${hashId} | Jurisdiction: Ranchi, Jharkhand) Tj ET`,
  );

  addFooter(pages.length + 1);
  pages.push(currentPageOps);

  const totalPages = pages.length;
  const pageObjIds = [];
  const contentObjIds = [];

  let nextId = 5;
  for (let i = 0; i < totalPages; i++) {
    pageObjIds.push(nextId++);
    contentObjIds.push(nextId++);
  }

  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];

  function writeObj(id, str) {
    offsets[id] = out.length;
    out += `${id} 0 obj\n${str}\nendobj\n`;
  }

  writeObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  writeObj(
    2,
    `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${totalPages} >>`,
  );
  writeObj(
    3,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );
  writeObj(
    4,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );

  for (let i = 0; i < totalPages; i++) {
    const pageId = pageObjIds[i];
    const contentId = contentObjIds[i];
    const streamContent = pages[i].join("\n");
    const streamLen = streamContent.length;

    writeObj(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    writeObj(
      contentId,
      `<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`,
    );
  }

  const startXref = out.length;
  const totalObjs = nextId;

  out += `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
  for (let i = 1; i < totalObjs; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    out += `${offsetStr} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  const uint8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) {
    uint8[i] = out.charCodeAt(i) & 0xff;
  }
  return uint8;
}

/**
 * Returns structured document schema for any policy agreement.
 */
export function getLegalDocumentModel(docId, docTitle, data = {}) {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const bName =
    data?.tradingName ||
    data?.registeredName ||
    "Registered Merchant Partner Enterprise";
  const lName =
    data?.contactName || data?.signatoryName || "Authorized Signatory Liaison";
  const address =
    [
      data?.address,
      data?.city,
      data?.state,
      data?.pincode ? `- ${data.pincode}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "Ranchi, Jharkhand, India";
  const city = data?.city || "Ranchi";
  const state = data?.state || "Jharkhand";

  const key = `${docId || ""} ${docTitle || ""}`.toLowerCase();

  const metadata = [
    {
      label: "Document Reference",
      value: `VQC-LGL-${(docId || "AGR").toUpperCase().replace(/[^A-Z0-9]/g, "")}-2026`,
    },
    { label: "Merchant Enterprise", value: bName },
    { label: "Authorized Signatory", value: lName },
    { label: "Store Address", value: address },
    { label: "Governing Jurisdiction", value: `${city}, ${state}, India` },
    { label: "Execution Date", value: dateStr },
  ];

  if (key.includes("privacy")) {
    return {
      title: "VOUCHIQO PRIVACY & DATA PROTECTION POLICY",
      subtitle:
        "Merchant Partner Confidentiality, Data Security & Statutory Protection Framework",
      metadata,
      sections: [
        {
          heading: "1. DATA STEWARDSHIP & INFORMATION SECURITY",
          paragraphs: [
            "Vouchiqo Technologies Pvt. Ltd. ('Vouchiqo') is committed to safeguarding merchant partner privacy. All statutory documents (GSTIN certificates, PAN records, trade licenses, bank details, and GPS coordinates) submitted during onboarding are secured using industry-standard AES-256 encryption.",
            "Merchant administrative credentials and transaction confirmation records are protected under multi-layer access protocols.",
          ],
        },
        {
          heading: "2. PUBLIC STOREFRONT VS. CONFIDENTIAL RECORDS",
          paragraphs: [
            "Customer-facing data (store display name, verified location, operating hours, categories, and published deal offers) will be displayed on the Vouchiqo consumer application and portal.",
            "Statutory identification records, bank verification tokens, and compliance filings remain strictly confidential and will never be shared with third parties or external marketing networks.",
          ],
        },
        {
          heading: "3. STATUTORY COMPLIANCE",
          paragraphs: [
            "This policy operates in strict compliance with the Digital Personal Data Protection Act (DPDPA), 2023 and the Information Technology Act, 2000 of India.",
          ],
        },
        {
          heading: "4. AUDIT TRAILS & DATA RETENTION",
          paragraphs: [
            "Voucher redemption logs, billing confirmation timestamps, and liaison updates are maintained in immutable audit logs for reconciliation, dispute resolution, and statutory tax accounting.",
          ],
        },
      ],
    };
  }

  if (key.includes("verification")) {
    return {
      title: "VOUCHIQO MERCHANT VERIFICATION POLICY",
      subtitle:
        "Storefront Verification, Statutory Compliance & Quality Standards Framework",
      metadata,
      sections: [
        {
          heading: "1. STATUTORY AUDIT & LOCATION VERIFICATION",
          paragraphs: [
            "All merchant partners undergo verification by Vouchiqo Ranchi Operations Desk. Verification encompasses business legal entity check, physical store location confirmation, category classification, and authorized liaison credentials.",
          ],
        },
        {
          heading: "2. REVIEW TIMELINES & STATUS NOTIFICATIONS",
          paragraphs: [
            "Application verification is processed within 2 to 4 business hours. The merchant liaison receives live status updates via SMS and dashboard alerts as each compliance stage progresses.",
          ],
        },
        {
          heading: "3. REJECTION & RE-SUBMISSION PROCESS",
          paragraphs: [
            "If any uploaded document is illegible, expired, or non-matching, the merchant receives immediate guidance with self-service re-upload access through the Merchant Portal.",
          ],
        },
        {
          heading: "4. ONGOING INTEGRITY CHECKS",
          paragraphs: [
            "Periodic audits are conducted to maintain deal accuracy, prompt voucher redemption, and authentic customer service across all participating stores.",
          ],
        },
      ],
    };
  }

  if (key.includes("refund")) {
    return {
      title: "VOUCHIQO REFUND, CANCELLATION & DISPUTE POLICY",
      subtitle:
        "Commercial Transparency, Subscription Guarantees & Commission Reversals",
      metadata,
      sections: [
        {
          heading: "1. ZERO-RISK SUBSCRIPTION TRIAL",
          paragraphs: [
            "Paid merchant subscription tiers (Growth, Pro) include a 14-day zero-risk evaluation period. If cancelled during this trial window, no subscription charges are debited.",
          ],
        },
        {
          heading: "2. CONSUMER VOUCHER DISPUTE RESOLUTION",
          paragraphs: [
            "In the event of a customer dispute regarding voucher validity, the Vouchiqo merchant mediation team reviews counter records within 24 hours to ensure fair resolution.",
          ],
        },
        {
          heading: "3. PERFORMANCE COMMISSION REVERSALS",
          paragraphs: [
            "Any performance commission charged on cancelled, reversed, or fraudulent customer transactions is immediately credited back to the merchant settlement ledger.",
          ],
        },
        {
          heading: "4. ESCALATION DESK",
          paragraphs: [
            "Merchants have direct access to the Ranchi Merchant Support Desk for rapid dispute resolution and billing clarifications.",
          ],
        },
      ],
    };
  }

  if (key.includes("founding")) {
    return {
      title: "VOUCHIQO FOUNDING MERCHANT PROGRAM CHARTER",
      subtitle:
        "Exclusive Launch Partner Privileges, Guaranteed Rate Lock & Priority Visibility",
      metadata,
      sections: [
        {
          heading: "1. PROGRAM PURPOSE & FOUNDING PRIVILEGES",
          paragraphs: [
            "The Founding Merchant Program is an exclusive launch charter initiated by Vouchiqo Technologies Pvt. Ltd. to support pioneering merchants across Ranchi and Jharkhand. Founding Partners receive locked commercial rates, priority customer discovery, and dedicated launch support.",
          ],
        },
        {
          heading: "2. COMMISSION & SUBSCRIPTION RATE LOCK",
          paragraphs: [
            "Vouchiqo guarantees that agreed CPA performance commission rates and Starter Plan benefits are locked for a minimum term of 6 to 12 months from the date of account verification. No unannounced commission increases or hidden operational surcharges will apply.",
          ],
        },
        {
          heading: "3. PRIORITY SEARCH PLACEMENT & STORE BADGING",
          paragraphs: [
            "Founding Merchants receive permanent 'Founding Partner' status across customer search results, top placement in category carousels, and priority highlighting in weekly regional festival deal roundups across Ranchi.",
          ],
        },
        {
          heading: "4. DEDICATED CONCIERGE & ONBOARDING ASSISTANCE",
          paragraphs: [
            "Founding partners receive 1-on-1 assistance for deal configuration, counter staff training on coupon verification, and personalized digital marketing collateral.",
          ],
        },
      ],
    };
  }

  // Default: Merchant Agreement / Terms & Conditions
  return {
    title: "VOUCHIQO MERCHANT PARTNER AGREEMENT & TERMS",
    subtitle:
      "Official Merchant Commercial Operating Agreement & Operational Covenants",
    metadata,
    sections: [
      {
        heading: "1. ENGAGEMENT & COMMERCIAL SCOPE",
        paragraphs: [
          `This Merchant Agreement governs the partnership between Vouchiqo Technologies Pvt. Ltd. ("Platform") and ${bName} ("Merchant Partner"). The Merchant agrees to list genuine deals, discounts, and promotional offers for consumers on the Vouchiqo platform in Ranchi and Jharkhand.`,
        ],
      },
      {
        heading: "2. MERCHANT COVENANTS & SERVICE STANDARDS",
        paragraphs: [
          "The Merchant covenants to honour all valid, active, and verified vouchers and coupon codes presented by customers without discrimination, extra surcharges, or artificial restrictions.",
          "Counter and billing staff must be trained to verify codes promptly via the Vouchiqo Merchant Portal or attendant terminal.",
          "The Merchant agrees to record accurate transaction values upon redemption confirmation.",
        ],
      },
      {
        heading: "3. COMMISSION & COMMERCIAL TERMS",
        paragraphs: [
          "Performance commission is payable strictly upon verified customer redemptions as per the agreed category CPA schedule.",
          "Starter rates and benefits are locked under the Founding Merchant Program guidelines.",
        ],
      },
      {
        heading: "4. TERM, TERMINATION & JURISDICTION",
        paragraphs: [
          "Either party may terminate this agreement with 30 days written notice. Immediate suspension applies for willful non-honouring of valid customer vouchers or fraudulent redemption reporting.",
          `Governing Law & Jurisdiction: Courts of ${city}, ${state}, India. Recorded digitally via Vouchiqo Merchant Onboarding Portal.`,
        ],
      },
    ],
  };
}

/**
 * Downloads a generated file (Uint8Array / Blob / string) as a clean .pdf in the browser.
 * Absolutely NO route changes, NO external navigation.
 */
export const downloadLegalBlob = (filename, fileData) => {
  if (typeof window === "undefined") return;

  const cleanName = (filename || "Agreement")
    .replace(/^Agree\s+to\s+/i, "")
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  let blob;
  if (fileData instanceof Blob) {
    blob = fileData;
  } else if (
    fileData instanceof Uint8Array ||
    fileData instanceof ArrayBuffer
  ) {
    blob = new Blob([fileData], { type: "application/pdf" });
  } else {
    blob = new Blob([fileData], { type: "application/pdf" });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Vouchiqo_${cleanName}.pdf`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch {}
  }, 1500);
};

/**
 * Direct file download helper: generates and downloads the official PDF directly in the browser.
 * Guarantees zero route change and zero external Google Drive redirects.
 */
export const handleDirectDownload = (
  link,
  filename,
  itemId,
  formData,
  setDownloadingPdfId,
) => {
  setDownloadingPdfId(itemId);
  toast.success(`Preparing ${filename || "Document"} PDF...`, {
    id: `dl-${itemId}`,
  });

  setTimeout(() => {
    try {
      const docModel = getLegalDocumentModel(
        itemId,
        filename || "Agreement",
        formData,
      );
      const pdfBytes = generateLegalPdfBinary(docModel);
      downloadLegalBlob(filename || itemId, pdfBytes);
      toast.success(`${filename || "Document"} downloaded!`, {
        id: `dl-${itemId}`,
      });
    } catch (err) {
      console.error("[Download] PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try again.", {
        id: `dl-${itemId}`,
      });
    } finally {
      setTimeout(() => {
        setDownloadingPdfId(null);
      }, 700);
    }
  }, 350);
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
  if (!policyItems || policyItems.length === 0) return;

  setIsDownloadingAll(true);
  toast.info(
    `Downloading all ${policyItems.length} legal documents as PDFs...`,
    {
      id: "dl-all-start",
    },
  );

  for (let i = 0; i < policyItems.length; i++) {
    const p = policyItems[i];
    const itemKey = p.id || p.key || `policy${i + 1}`;
    const title = p.title || p.text || `Document ${i + 1}`;
    setDownloadingPdfId(itemKey);
    setDownloadProgress(`(${i + 1}/${policyItems.length})`);

    try {
      const docModel = getLegalDocumentModel(itemKey, title, formData);
      const pdfBytes = generateLegalPdfBinary(docModel);
      downloadLegalBlob(title, pdfBytes);
    } catch (err) {
      console.error(`[DownloadAll] Error on ${title}:`, err);
    }

    // Stagger downloads by 450ms so browser doesn't throttle multiple downloads
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  setDownloadingPdfId(null);
  setIsDownloadingAll(false);
  setDownloadProgress("");
  toast.success(
    `All ${policyItems.length} policy documents downloaded successfully!`,
    {
      id: "dl-all-success",
    },
  );
};

/**
 * Plain-text fallback for backward compatibility.
 */
export const getLegalDocumentText = (docId, docTitle, data) => {
  const model = getLegalDocumentModel(docId, docTitle, data);
  let text = `================================================================================\n${model.title}\n${model.subtitle}\n================================================================================\n\n`;
  for (const m of model.metadata) {
    text += `${m.label}: ${m.value}\n`;
  }
  text += "\n";
  for (const s of model.sections) {
    text += `\n${s.heading}\n`;
    for (const p of s.paragraphs) {
      text += `${p}\n`;
    }
  }
  return text;
};
