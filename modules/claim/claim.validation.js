import { z } from "zod";

export const createClaimSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
});

export const claimQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["active", "redeemed", "expired"]).optional(),
});
