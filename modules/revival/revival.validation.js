import { z } from "zod";

export const createRevivalSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),

  reason: z
    .string()
    .min(20, "Please provide a reason of at least 20 characters")
    .max(500),

  newExpiresAt: z
    .string()
    .datetime({ message: "newExpiresAt must be a valid ISO 8601 date" })
    .refine(
      (val) => new Date(val) > new Date(),
      "New expiry date must be in the future",
    ),
});

export const reviewRevivalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().max(300).optional(),
});
