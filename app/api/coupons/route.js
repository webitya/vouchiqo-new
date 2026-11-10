import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import { createCoupon, listCoupons } from "@/modules/coupon/coupon.service";
import { createCouponSchema } from "@/modules/coupon/coupon.validation";
import Merchant from "@/modules/merchant/merchant.model";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/coupons
 * Public: Browse active coupons (filtered).
 * Merchant query (?merchant=me): Return merchant's own coupons regardless of status.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);

  if (searchParams.get("merchant") === "me") {
    const { user } = await requireAuth(request);
    const merchant = await Merchant.findOne({ authId: user.id });

    if (!merchant) {
      return ok({ coupons: [] });
    }

    const merchantParams = new URLSearchParams(searchParams);
    merchantParams.set("merchantId", merchant._id.toString());
    merchantParams.set("isMerchantSelf", "true");
    merchantParams.delete("status");

    const result = await listCoupons(merchantParams);
    return ok(result);
  }

  const result = await listCoupons(searchParams);
  return ok(result);
});

/**
 * POST /api/coupons
 * Create a new coupon (Merchant or Admin).
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const body = await request.json();
  const data = createCouponSchema.parse(body);

  const coupon = await createCoupon(user.id, data, user.email);

  const payload = {
    couponId: coupon._id || coupon.id,
    title: coupon.title,
    code: coupon.code,
    merchantId: coupon.merchantId,
    status: coupon.status,
    isVerified: coupon.isVerified,
    createdAt: coupon.createdAt,
  };

  // 1. Broadcast event to Admins for review
  await dispatchEvent({
    target: "admins",
    event: SOCKET_EVENTS.COUPON_SUBMITTED,
    payload,
  });

  // 2. Confirmation & DB notification to merchant
  await dispatchEvent({
    target: "user",
    userId: user.id,
    event: SOCKET_EVENTS.COUPON_SUBMITTED_CONFIRMATION,
    payload,
    notify: {
      userId: user.id,
      type: "coupon_submitted",
      category: "system",
      title: "Coupon Submitted for Approval",
      message: `Your offer listing '${coupon.title}' has been submitted and is currently under review by Vouchiqo moderation.`,
      metadata: payload,
    },
  });

  return created(coupon, "Coupon created successfully");
});
