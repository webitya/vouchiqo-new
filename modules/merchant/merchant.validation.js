import { z } from "zod";
import { COUPON_CATEGORIES, normalizeCategory } from "@/utils/constants.js";

export const createMerchantSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),

  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    )
    .optional()
    .or(z.literal("")),

  description: z.string().max(500).optional(),
  shortDescription: z.string().max(300).optional(),
  longDescription: z.string().max(1000).optional(),

  category: z.preprocess(
    (val) => normalizeCategory(val),
    z.enum(COUPON_CATEGORIES),
  ),
  customCategoryNotes: z.string().optional(),
  subCategoryTags: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  location: z
    .object({
      address: z.string().optional(),
      pincode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().default("IN"),
      coordinates: z
        .object({
          lat: z.number().optional(),
          lng: z.number().optional(),
        })
        .optional(),
    })
    .optional(),

  contactEmail: z.string().email().or(z.string().max(0)).optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  website: z.string().optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  businessType: z
    .enum(["online", "physical", "both"])
    .or(z.string())
    .optional(),
  operatingHours: z.record(z.any()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  autoApproveRevival: z.boolean().optional(),
  plan: z.string().optional(),
  commissionRate: z.string().optional(),
  commissionModel: z.string().optional(),
  commissionAgreed: z.boolean().optional(),

  // KYC compliance onboarding fields
  constitution: z
    .enum([
      "proprietorship",
      "partnership",
      "llp",
      "pvt_ltd",
      "private_limited",
      "public_limited",
      "others",
    ])
    .or(z.string())
    .optional(),
  liaisonName: z.string().optional(),
  liaisonDesignation: z
    .enum(["owner", "partner", "manager", "director", "others"])
    .or(z.string())
    .optional(),
  liaisonPhone: z.string().optional(),
  regionalHubCity: z.string().optional(),
  gmapsLink: z.string().optional(),
  docType: z.string().optional(),
  docImage: z.string().optional(),
  gstin: z.string().optional(),
  isGstExempt: z.boolean().optional(),
  shopImage: z.string().optional(),
});

export const updateMerchantSchema = createMerchantSchema.partial();
