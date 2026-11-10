import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { rateLimit, requireAuth } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import {
  getMerchantRedemptions,
  getUserRedemptions,
  redeemCoupon,
} from "@/modules/redemption/redemption.service";
import { redeemSchema } from "@/modules/redemption/redemption.validation";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/redemptions
 * Get the authenticated user's (or merchant's) redemption history.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { searchParams } = new URL(request.url);

  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    if (!merchant) return ok({ redemptions: [] });

    const result = await getMerchantRedemptions(merchant._id, searchParams);
    return ok(result);
  }

  const result = await getUserRedemptions(user.id, searchParams);
  return ok(result);
});

/**
 * POST /api/redemptions
 * Redeem a claimed coupon.
 *
 * Uses a Redis distributed lock to prevent race conditions.
 *
 * Body: { claimId: string, couponId: string }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  await rateLimit(request, "POST:/api/redemptions", 20, 60);

  const body = await request.json();
  const { claimId, couponId } = redeemSchema.parse(body);

  const redemption = await redeemCoupon(user.id, claimId, couponId);

  // Emit socket event and DB notification to the coupon's merchant
  const couponDoc = await Coupon.findById(couponId).lean();
  if (couponDoc?.merchantId) {
    const merchantDoc = await Merchant.findById(couponDoc.merchantId).lean();
    const merchantUserId = merchantDoc?.authId || merchantDoc?.userId;

    if (merchantUserId) {
      const payload = {
        redemptionId: redemption._id || redemption.id,
        couponId: couponDoc._id,
        couponTitle: couponDoc.title,
        savingsAmount: redemption.savingsAmount || 0,
        redeemedAt: new Date().toISOString(),
      };

      await dispatchEvent({
        target: "user",
        userId: String(merchantUserId),
        event: SOCKET_EVENTS.COUPON_REDEEMED,
        payload,
        notify: {
          userId: String(merchantUserId),
          type: "coupon_redeemed",
          category: "campaign",
          title: "Coupon Redeemed!",
          message: `A customer successfully redeemed offer '${couponDoc.title}'.`,
          metadata: payload,
        },
      });
    }
  }

  return created(redemption, "Coupon redeemed successfully");
});
