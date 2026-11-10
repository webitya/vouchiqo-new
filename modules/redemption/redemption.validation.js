import { z } from "zod";

export const redeemSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  couponId: z.string().min(1, "Coupon ID is required"),
});
