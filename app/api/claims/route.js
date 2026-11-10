import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { rateLimit, requireAuth } from "@/modules/auth/auth.middleware";
import {
  claimCoupon,
  getMerchantClaims,
  getUserClaims,
} from "@/modules/claim/claim.service";
import {
  claimQuerySchema,
  createClaimSchema,
} from "@/modules/claim/claim.validation";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/claims
 * Get the authenticated user's (or merchant's) saved/claimed coupons.
 *
 * Query params: page, limit, status (active | redeemed | expired)
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { searchParams } = new URL(request.url);

  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    if (!merchant) return ok({ claims: [] });

    const result = await getMerchantClaims(merchant._id, searchParams);
    return ok(result);
  }

  claimQuerySchema.parse(Object.fromEntries(searchParams));
  const result = await getUserClaims(user.id, searchParams);
  return ok(result);
});

/**
 * POST /api/claims
 * Save/claim a coupon for the authenticated user.
 *
 * Body: { couponId: string }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  await rateLimit(request, "POST:/api/claims", 30, 60);

  const body = await request.json();
  const { couponId } = createClaimSchema.parse(body);

  const claim = await claimCoupon(user.id, couponId);

  // Emit socket event and DB notification to the coupon's merchant
  const couponDoc = await Coupon.findById(couponId).lean();
  if (couponDoc?.merchantId) {
    const merchantDoc = await Merchant.findById(couponDoc.merchantId).lean();
    const merchantUserId = merchantDoc?.authId || merchantDoc?.userId;

    if (merchantUserId) {
      const payload = {
        claimId: claim._id || claim.id,
        couponId: couponDoc._id,
        couponTitle: couponDoc.title,
        claimedAt: new Date().toISOString(),
      };

      await dispatchEvent({
        target: "user",
        userId: String(merchantUserId),
        event: SOCKET_EVENTS.COUPON_CLAIMED,
        payload,
        notify: {
          userId: String(merchantUserId),
          type: "coupon_claimed",
          category: "campaign",
          title: "New Coupon Claimed!",
          message: `A customer saved your offer listing '${couponDoc.title}'.`,
          metadata: payload,
        },
      });
    }
  }

  return created(claim, "Coupon saved to your collection");
});
