import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  deleteCoupon,
  getCouponById,
  setCouponStatus,
  updateCoupon,
} from "@/modules/coupon/coupon.service";
import { updateCouponSchema } from "@/modules/coupon/coupon.validation";
import { noContent, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/coupons/:id
 * Get a single active coupon. Public.
 * Increments view count via async queue job.
 */
export const GET = asyncHandler(async (_request, { params }) => {
  await connectDB();
  const { id } = await params;
  const coupon = await getCouponById(id);
  return ok(coupon);
});

/**
 * PUT /api/coupons/:id
 * Update a coupon. Merchant owner only.
 * Also handles pausing/resuming via { status: "paused" | "active" }.
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const { id } = await params;

  const body = await request.json();
  const data = updateCouponSchema.parse(body);

  let coupon;
  // If only changing status (pause/resume), use dedicated function
  if (Object.keys(data).length === 1 && data.status) {
    coupon = await setCouponStatus(id, user.id, data.status);
  } else {
    coupon = await updateCoupon(id, user.id, data);
  }

  // Socket emissions for real-time updates across admin and merchant desks
  try {
    const { emitToAdmins, emitToMerchants } = await import(
      "@/lib/socket/server"
    );
    const { SOCKET_EVENTS } = await import("@/lib/socket/events");

    const payload = {
      couponId: String(coupon._id || coupon.id),
      status: coupon.status,
      isVerified: coupon.isVerified,
      title: coupon.title,
      rejectionReason: coupon.rejectionReason || "",
    };

    emitToAdmins(SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload);
    emitToMerchants(SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload);
    if (coupon.status === "pending") {
      emitToAdmins(SOCKET_EVENTS.COUPON_SUBMITTED, payload);
    }
  } catch (err) {
    console.error("[PUT /api/coupons/:id] Socket emit error:", err);
  }

  return ok(coupon, "Coupon updated successfully");
});

/**
 * DELETE /api/coupons/:id
 * Soft-delete a coupon. Merchant owner only.
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const { id } = await params;

  await deleteCoupon(id, user.id);

  try {
    const { emitToAdmins, emitToMerchants } = await import(
      "@/lib/socket/server"
    );
    const { SOCKET_EVENTS } = await import("@/lib/socket/events");

    const payload = { couponId: String(id), status: "deleted" };
    emitToAdmins(SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload);
    emitToMerchants(SOCKET_EVENTS.COUPON_STATUS_CHANGED, payload);
  } catch (err) {
    console.error("[DELETE /api/coupons/:id] Socket emit error:", err);
  }

  return noContent();
});
