import { z } from "zod";

/**
 * Zod validation schema for creating a new merchant campaign.
 */
export const campaignSchema = z.object({
  // Step 1: Basics
  name: z
    .string({ required_error: "Campaign Name is required" })
    .min(2, "Campaign Name must be at least 2 characters")
    .max(100, "Campaign Name must not exceed 100 characters"),
  type: z.enum([
    "flash",
    "festival",
    "new-user",
    "seasonal",
    "loyalty",
    "bundle",
    "revival",
  ]),
  festivalName: z.string().optional(),
  objective: z.string().min(1, "Primary Campaign Objective is required"),
  headline: z.string().optional(),
  subHeadline: z.string().optional(),
  description: z.string().optional(),

  // Step 2: Listings & Details
  bannerUrl: z.string().optional(),
  offerType: z.string().default("Percentage Discount (% off)"),
  discountValue: z.string().optional(),
  maxCap: z.string().optional(),
  minOrderValue: z.string().optional(),
  code: z
    .string({ required_error: "Promo Code is required" })
    .min(1, "Promo Code is required"),
  redemptionInstructions: z.string().optional(),
  termsAndConditions: z.string().optional(),
  couponIds: z.array(z.string()).default([]),

  // Step 3: Timing & Promotion
  startDate: z
    .string({ required_error: "Start Date is required" })
    .min(1, "Start Date is required"),
  endDate: z
    .string({ required_error: "End Date is required" })
    .min(1, "End Date is required"),
  hasCountdownTimer: z.boolean().default(true),
  hasPreTeaser: z.boolean().default(false),
  preTeaserHeadline: z.string().optional(),
  featuredSlot: z.boolean().default(false),
  pushNotification: z.boolean().default(true),
  newsletterInclusion: z.boolean().default(false),
  socialSharing: z.boolean().default(true),
  pushSendTime: z.string().optional(),
  audience: z.string().default("all"),
  targetCity: z.string().default("Ranchi"),

  // Step 4: Review & Compliance Checkboxes
  staffReady: z.string().default("yes"),
  stockConfirmation: z.string().default("yes"),
  internalNote: z.string().optional(),
  agreed1: z.boolean().refine((val) => val === true, {
    message: "You must confirm this mandatory merchant checkpoint",
  }),
  agreed2: z.boolean().refine((val) => val === true, {
    message: "You must confirm this mandatory merchant checkpoint",
  }),
  agreed3: z.boolean().refine((val) => val === true, {
    message: "You must confirm this mandatory merchant checkpoint",
  }),
  agreed4: z.boolean().refine((val) => val === true, {
    message: "You must confirm this mandatory merchant checkpoint",
  }),
  agreed5: z.boolean().refine((val) => val === true, {
    message: "You must confirm this mandatory merchant checkpoint",
  }),
});

/**
 * Field list per wizard step for step-by-step validation guards.
 */
export const STEP_FIELDS = {
  1: ["name", "type", "objective"],
  2: ["code", "offerType"],
  3: ["startDate", "endDate"],
  4: ["agreed1", "agreed2", "agreed3", "agreed4", "agreed5"],
};
