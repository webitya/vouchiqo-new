import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  listRevivals,
  requestRevival,
  reviewRevival,
} from "@/modules/revival/revival.service";
import {
  createRevivalSchema,
  reviewRevivalSchema,
} from "@/modules/revival/revival.validation";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/revivals
 * Admin: list revival requests.
 *
 * Query params: status (pending | approved | rejected), page, limit
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listRevivals(searchParams);
  return ok(result);
});

/**
 * POST /api/revivals
 * Merchant: request revival of an expired coupon.
 *
 * Body: { couponId, reason, newExpiresAt }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const body = await request.json();
  const data = createRevivalSchema.parse(body);

  const revival = await requestRevival(user.id, data);

  const payload = {
    revivalId: revival._id || revival.id,
    couponId: revival.couponId,
    merchantId: revival.merchantId,
    reason: revival.reason,
    createdAt: revival.createdAt,
  };

  // Broadcast to Admins
  await dispatchEvent({ target: "admins", event: SOCKET_EVENTS.REVIVAL_SUBMITTED, payload });

  // Confirmation & DB notification to merchant
  await dispatchEvent({
    target: "user",
    userId: user.id,
    event: SOCKET_EVENTS.REVIVAL_STATUS_CHANGED,
    payload,
    notify: {
      userId: user.id,
      type: "revival_submitted",
      category: "system",
      title: "Coupon Revival Requested",
      message: "Your request to revive an expired offer listing has been submitted for admin approval.",
      metadata: payload,
    },
  });

  return created(revival, "Revival request submitted");
});

/**
 * PUT /api/revivals
 * Admin: approve or reject a revival request.
 *
 * Body: { revivalId, status: "approved" | "rejected", reviewNote? }
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const { revivalId, ...data } = body;
  const { status, reviewNote } = reviewRevivalSchema.parse(data);

  const revival = await reviewRevival(revivalId, user.id, status, reviewNote);

  const payload = {
    revivalId: revival._id || revival.id,
    status: revival.status,
    reviewNote: revival.reviewNote || "",
  };

  // Broadcast to Admins
  await dispatchEvent({ target: "admins", event: SOCKET_EVENTS.REVIVAL_STATUS_CHANGED, payload });

  // Direct socket & DB notification to merchant user
  if (revival?.merchantId) {
    const merchantDoc = await Merchant.findById(revival.merchantId).lean();
    const merchantUserId = merchantDoc?.authId || merchantDoc?.userId;

    if (merchantUserId) {
      const isApproved = status === "approved";
      await dispatchEvent({
        target: "user",
        userId: String(merchantUserId),
        event: SOCKET_EVENTS.REVIVAL_STATUS_CHANGED,
        payload,
        notify: {
          userId: String(merchantUserId),
          type: isApproved ? "revival_approved" : "revival_rejected",
          category: "system",
          title: isApproved ? "Coupon Revival Approved!" : "Coupon Revival Rejected",
          message: isApproved
            ? "Your request to revive your expired coupon listing has been approved and extended."
            : `Revival request rejected: ${revival.reviewNote || "Check terms."}`,
          metadata: payload,
        },
      });
    }
  }

  return ok(revival, `Revival request ${status}`);
});
