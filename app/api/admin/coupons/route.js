import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import {
  deleteAdminCoupon,
  listAllCoupons,
  updateCouponModerationState,
} from "@/modules/admin/admin.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { ValidationError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons
 * List all coupons regardless of status. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listAllCoupons(searchParams);
  return ok(result);
});

/**
 * PUT /api/admin/coupons
 * Update any coupon field (moderation, title, code, discount, dates, status). Admin only.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const { couponId, ...fieldsToUpdate } = body;

  if (!couponId) {
    throw new ValidationError("couponId is required");
  }

  const update = {};
  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (value !== undefined) {
      if (key === "expiresAt" && value) {
        update[key] = new Date(value);
      } else {
        update[key] = value;
      }
    }
  }

  const coupon = await updateCouponModerationState(couponId, update);

  const payload = {
    couponId: String(coupon._id || coupon.id),
    status: coupon.status,
    isVerified: coupon.isVerified,
    title: coupon.title,
    rejectionReason: coupon.rejectionReason || "",
  };

  // Broadcast to Admin and Merchant desks
  await dispatchEvent({ target: "admins", event: SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload });
  await dispatchEvent({ target: "merchants", event: SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload });

  // Direct socket & DB notification to the offer owner merchant user
  if (coupon?.merchantId) {
    const rawMerchantId = coupon.merchantId?._id || coupon.merchantId;
    const merchantDoc = await Merchant.findById(rawMerchantId).lean();
    const targetUserId = merchantDoc?.authId;

    if (targetUserId) {
      const isApproved = coupon.status === "active";
      const isRejected = coupon.status === "rejected";

      await dispatchEvent({
        target: "user",
        userId: String(targetUserId),
        event: SOCKET_EVENTS.COUPON_STATUS_CHANGED,
        payload,
        notify: {
          userId: String(targetUserId),
          type: isApproved ? "coupon_approved" : isRejected ? "coupon_rejected" : "coupon_status_changed",
          category: "system",
          title: isApproved
            ? "Listing Approved & Live"
            : isRejected
              ? "Listing Verification Rejected"
              : `Offer Status Updated (${coupon.status})`,
          message: isApproved
            ? `Your coupon listing '${coupon.title}' has been verified and is now live on Vouchiqo.`
            : isRejected
              ? `Listing '${coupon.title}' requires update: ${coupon.rejectionReason || "Check guidelines and re-submit."}`
              : `Offer '${coupon.title}' status changed to ${coupon.status}.`,
          metadata: payload,
        },
      });
    }
  }

  return ok(coupon, "Coupon updated successfully");
});

/**
 * DELETE /api/admin/coupons
 * Delete a coupon by ID. Admin only.
 */
export const DELETE = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  let couponId = searchParams.get("id") || searchParams.get("couponId");

  if (!couponId) {
    const body = await request.json().catch(() => ({}));
    couponId = body.couponId;
  }

  if (!couponId) {
    throw new ValidationError("couponId is required");
  }

  const coupon = await deleteAdminCoupon(couponId);
  return ok(coupon, "Coupon deleted successfully");
});
