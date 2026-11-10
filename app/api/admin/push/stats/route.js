import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import PushSubscription from "@/modules/push-subscription/push-subscription.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/push/stats
 *
 * Returns push subscription statistics for the admin dashboard.
 * Admin-only endpoint.
 *
 * Response: { activeDevices, registeredUsers, guestDevices, revokedTokens }
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, "admin");

  const [activeDevices, registeredUsers, guestDevices, revokedTokens] =
    await Promise.all([
      PushSubscription.countDocuments({ status: "active" }),
      PushSubscription.countDocuments({ status: "active", userId: { $ne: null } }),
      PushSubscription.countDocuments({ status: "active", userId: null }),
      PushSubscription.countDocuments({ status: { $in: ["unsubscribed", "revoked"] } }),
    ]);

  return ok(
    { activeDevices, registeredUsers, guestDevices, revokedTokens },
    "Push stats retrieved",
  );
});
