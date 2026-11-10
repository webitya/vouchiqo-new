import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import Notification from "@/modules/notification/notification.model";
import {
  getUserNotifications,
  markAllRead,
} from "@/modules/notification/notification.service";
import Redemption from "@/modules/redemption/redemption.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Returns live in-app notifications for the authenticated user from DB.
 */
export const GET = asyncHandler(async (request) => {
  let user = null;
  try {
    const authRes = await requireAuth(request);
    user = authRes?.user;
  } catch {
    // Unauthenticated request
  }
  if (!user) {
    return ok({ notifications: [], total: 0, unreadCount: 0 });
  }
  await connectDB();
  const { searchParams } = new URL(request.url);

  const result = await getUserNotifications(user.id, searchParams);
  let notifications = result.notifications || [];

  // If no stored notification documents exist in DB, synthesize live notifications from real DB state
  if (notifications.length === 0) {
    const merchant = await Merchant.findOne({ authId: user.id }).lean();
    const synth = [];

    if (merchant) {
      if (merchant.status === "approved") {
        synth.push({
          _id: `sys-app-${merchant._id}`,
          title: "Merchant Account Approved & Live",
          message: `Your store '${merchant.businessName}' has been verified and is live on Vouchiqo.`,
          type: "Listing Approved",
          category: "system",
          createdAt: merchant.createdAt || new Date(),
          isRead: false,
        });
      }

      // Check redemptions count
      const redemptionsCount = await Redemption.countDocuments({
        merchantId: merchant._id,
      });
      if (redemptionsCount > 0) {
        synth.push({
          _id: `sys-red-${merchant._id}`,
          title: "Customer Redemptions Milestone",
          message: `Your business has recorded ${redemptionsCount} customer coupon redemptions on Vouchiqo.`,
          type: "Milestone reached",
          category: "campaign",
          createdAt: new Date(),
          isRead: false,
        });
      }

      // Check expiring coupons
      const expiringCoupons = await Coupon.find({
        merchantId: merchant._id,
        status: "active",
        expiresAt: { $gt: new Date(), $lt: new Date(Date.now() + 86400000 * 3) },
      }).lean();

      expiringCoupons.forEach((c) => {
        synth.push({
          _id: `sys-exp-${c._id}`,
          title: "Offer Expiring Soon Warning",
          message: `Offer listing '${c.title}' (Code: ${c.code || "AUTO"}) is expiring soon. Consider renewing or boosting it.`,
          type: "Expiring Soon",
          category: "campaign",
          createdAt: c.createdAt || new Date(),
          isRead: false,
        });
      });
    }

    notifications = synth;
  }

  return ok({ notifications, meta: result.meta });
});

/**
 * POST /api/notifications
 * Mark all or specific notifications as read.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const body = await request.json().catch(() => ({}));

  if (body.id) {
    await Notification.updateOne(
      { _id: body.id, userId: user.id },
      { $set: { isRead: true } },
    );
  } else {
    await markAllRead(user.id);
  }

  return ok({ message: "Notifications updated successfully" });
});
