import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import PushSubscription from "@/modules/push-subscription/push-subscription.model";
import { ok, created } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/subscribe
 *
 * Upsert an FCM device token.
 * Attaches the authenticated user's ID if a session exists.
 * Accepts anonymous/guest subscriptions (userId = null).
 *
 * Body: { token, deviceInfo?: { browser, platform, userAgent } }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { token, deviceInfo = {} } = body;

  if (!token || typeof token !== "string") {
    const { error } = await import("@/utils/api-response");
    return error("FCM token is required", 400);
  }

  // Attempt to get authenticated user (optional — guests are fine)
  let userId = null;
  try {
    const authRes = await requireAuth(request);
    if (authRes?.user?.id) {
      userId = authRes.user.id;
    }
  } catch {
    // Not authenticated — treat as guest
  }

  const existing = await PushSubscription.findOne({ token });

  if (existing) {
    // Re-activate if it was previously unsubscribed
    existing.status = "active";
    existing.lastActiveAt = new Date();
    if (userId && !existing.userId) {
      existing.userId = userId;
    }
    if (deviceInfo.browser) existing.deviceInfo = deviceInfo;
    await existing.save();
    return ok({ subscribed: true, isNew: false }, "Push subscription updated");
  }

  const subscription = await PushSubscription.create({
    token,
    userId,
    deviceInfo: {
      browser: deviceInfo.browser || "Unknown",
      platform: deviceInfo.platform || "Unknown",
      userAgent: deviceInfo.userAgent || "",
    },
    status: "active",
    lastActiveAt: new Date(),
  });

  return created(
    { subscribed: true, isNew: true, id: subscription._id },
    "Push subscription registered",
  );
});
