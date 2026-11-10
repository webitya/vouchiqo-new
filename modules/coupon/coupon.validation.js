import { z } from "zod";
import { COUPON_CATEGORIES, normalizeCategory } from "@/utils/constants";

/**
 * Validation schemas for coupon-related inputs.
 * All user input is validated through these before hitting services.
 */

export const createCouponSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(120, "Title cannot exceed 120 characters"),

    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(30, "Coupon code cannot exceed 30 characters")
      .toUpperCase(),

    discountType: z.enum(["percentage", "fixed", "freebie"]),

    discountValue: z.number().nonnegative().optional(),

    originalPrice: z.number().nonnegative().optional(),

    category: z.preprocess(
      (val) => normalizeCategory(val),
      z.enum(COUPON_CATEGORIES),
    ),

    tags: z.array(z.string().max(30)).max(10).optional(),

    image: z
      .string()
      .url("Image must be a valid URL")
      .optional()
      .or(z.literal("")),

    maxClaims: z.number().int().positive().optional(),
    maxRedemptions: z.number().int().positive().optional(),

    isFeatured: z.boolean().optional(),

    status: z
      .enum(["pending", "active", "paused", "expired", "deleted"])
      .optional(),

    expiresAt: z
      .string()
      .datetime({ message: "expiresAt must be a valid ISO 8601 date" })
      .refine(
        (val) => new Date(val) > new Date(),
        "Expiry date must be in the future",
      ),

    location: z
      .object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        isOnline: z.boolean().default(false),
      })
      .optional(),
  })
  .passthrough();

export const updateCouponSchema = createCouponSchema.partial();

export const couponQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.preprocess(
    (val) => (val ? normalizeCategory(val) : undefined),
    z.enum(COUPON_CATEGORIES).optional(),
  ),
  search: z.string().max(100).optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  discountType: z.enum(["percentage", "fixed", "freebie"]).optional(),
  sortBy: z
    .enum(["createdAt", "expiresAt", "totalClaims", "discountValue"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  merchantId: z.string().optional(),
  status: z
    .enum(["pending", "active", "paused", "expired", "deleted"])
    .optional(),
  allDates: z.coerce.boolean().optional(),
});
