import { z } from "zod";

const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Zod validation schema for creating a new merchant coupon / offer.
 */
export const couponSchema = z
  .object({
    offerType: z.enum(["code", "deal", "special"]),

    // Section B (Basic Details)
    headline: z
      .string({ required_error: "Offer Headline is required" })
      .min(1, "Offer Headline is required")
      .max(80, "Headline must not exceed 80 characters"),
    shortDescription: z
      .string({ required_error: "Short Description is required" })
      .min(1, "Short Description is required")
      .max(200, "Description must not exceed 200 characters"),
    category: z.string().min(1, "Primary Category is required"),
    image: z.string().optional(),

    // Section C (Discount & Code Mechanics)
    code: z.string().optional(),
    discountType: z.string().default("% Off"),
    discountValue: z.string().optional(),
    maxCap: z.string().optional(),
    minOrderValue: z.string().optional(),

    originalPrice: z.string().optional(),
    salePrice: z.string().optional(),

    specialOfferType: z.string().optional(),
    redemptionMethod: z.string().optional(),
    offerDetails: z.string().optional(),

    // Section D (Validity & Limits)
    startDate: z
      .string({ required_error: "Start Date is required" })
      .min(1, "Start Date is required"),
    endDate: z
      .string({ required_error: "End Date is required" })
      .min(1, "End Date is required"),
    usageLimit: z.string().optional(),
    perCustomerLimit: z.string().default("1"),
    targetAudience: z.string().default("All Customers (Default)"),
    geographicRestriction: z
      .string()
      .default("Ranchi only — in-store at my listed address"),
    validDays: z.array(z.string()).default([]),
    validHours: z.string().optional(),

    // Section E (Terms & Confirmations)
    termsAndConditions: z
      .string({ required_error: "Terms & Conditions are required" })
      .min(1, "Terms & Conditions are required"),
    combinability: z
      .string()
      .default("No — cannot be combined with any other offer"),
    honouredAllDays: z
      .string()
      .default("Yes — every day during the validity period"),
    internalNote: z.string().optional(),

    agreed1: z.boolean().refine((val) => val === true, {
      message: "You must confirm this mandatory merchant declaration",
    }),
    agreed2: z.boolean().refine((val) => val === true, {
      message: "You must confirm this mandatory merchant declaration",
    }),
    agreed3: z.boolean().refine((val) => val === true, {
      message: "You must confirm this mandatory merchant declaration",
    }),
    agreed4: z.boolean().refine((val) => val === true, {
      message: "You must confirm this mandatory merchant declaration",
    }),
  })
  .superRefine((data, ctx) => {
    // 1. Offer Type Conditional Rules
    if (data.offerType === "code") {
      if (!data.code || data.code.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["code"],
          message: "Offer Code is required for code offer type",
        });
      }
      const isNumericDiscount =
        data.discountType === "% Off" || data.discountType === "Flat ₹ Off";
      if (
        isNumericDiscount &&
        (!data.discountValue || data.discountValue.trim().length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountValue"],
          message:
            data.discountType === "Flat ₹ Off"
              ? "Flat discount amount is required"
              : "Discount percentage is required",
        });
      }
    } else if (data.offerType === "special") {
      if (!data.offerDetails || data.offerDetails.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offerDetails"],
          message: "Full Special Offer Details text is required",
        });
      }
    }

    // 2. Start Date & End Date Past Date Validations
    const todayStr = getTodayStr();

    if (data.startDate && data.startDate < todayStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start Date cannot be in the past",
      });
    }

    if (data.endDate) {
      if (data.endDate < todayStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End Date cannot be in the past",
        });
      } else if (data.startDate && data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End Date must be on or after Start Date",
        });
      }
    }
  });

/**
 * Field list per wizard step for step-by-step validation guards.
 */
export const SECTION_FIELDS = {
  A: ["offerType"],
  B: ["headline", "shortDescription", "category"],
  C: [
    "code",
    "discountType",
    "discountValue",
    "specialOfferType",
    "redemptionMethod",
    "offerDetails",
  ],
  D: ["startDate", "endDate"],
  E: [
    "termsAndConditions",
    "combinability",
    "honouredAllDays",
    "agreed1",
    "agreed2",
    "agreed3",
    "agreed4",
  ],
};
