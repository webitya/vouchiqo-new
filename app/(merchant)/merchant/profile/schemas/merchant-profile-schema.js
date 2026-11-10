import { z } from "zod";

/**
 * Zod validation schema for merchant business profile onboarding & editing.
 */
export const merchantProfileSchema = z.object({
  // Step 1: Identity
  businessName: z.string().optional(),
  slug: z.string().optional(),
  category: z.string().optional(),
  customCategoryNotes: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z
    .string()
    .email("Please enter a valid email address")
    .or(z.string().max(0))
    .optional(),
  contactPhone: z.string().optional(),
  constitution: z.string().optional(),
  liaisonName: z.string().optional(),
  liaisonDesignation: z.string().optional(),
  liaisonPhone: z.string().optional(),

  // Step 2: Location
  address: z.string().optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("IN"),
  lat: z.union([z.string(), z.number()]).optional(),
  lng: z.union([z.string(), z.number()]).optional(),
  gmapsLink: z.string().optional(),

  // Media
  logo: z.string().optional(),
  banner: z.string().optional(),
  shopImage: z.string().optional(),

  // Store Operating Hours
  operatingHours: z.record(z.any()).optional(),

  // Step 3: KYC
  docType: z.string().optional(),
  docImage: z.string().optional(),
  gstin: z
    .any()
    .optional()
    .refine(
      (val) => {
        if (!val || typeof val !== "string") return true;
        const clean = val.trim().toUpperCase();
        if (clean.length === 0) return true;
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          clean,
        );
      },
      {
        message:
          "Please enter a valid 15-character GSTIN (e.g. 22AAAAA1111A1Z1) or leave empty",
      },
    ),
  isGstExempt: z.boolean().default(false),
});

/**
 * Field list per wizard step for step-by-step validation guards.
 */
export const STEP_FIELDS = {
  1: [],
  2: [],
  3: [],
};
