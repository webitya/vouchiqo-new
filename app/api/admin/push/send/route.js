import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import { sendPushToTokens } from "@/lib/firebaseAdmin";
import PushSubscription from "@/modules/push-subscription/push-subscription.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/push/send
 *
 * Broadcast a web push notification to a filtered audience.
 * Admin-only. Automatically prunes invalid tokens returned by FCM.
 *
 * Body:
 * {
 *   title: string,          // max 80 chars
 *   body: string,           // max 240 chars
 *   url?: string,           // deep-link on click
 *   image?: string,         // banner image URL (2:1 ratio)
 *   icon?: string,          // notification icon
 *   category?: string,      // for tagging/deduplication
 *   audience: "all" | "users" | "guests" | "user" | "test",
 *   targetUserId?: string,  // required when audience === "user"
 *   testToken?: string,     // required when audience === "test"
 * }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, "admin");

  const body = await request.json();
  const {
    title,
    body: messageBody,
    url,
    image,
    icon,
    category = "general",
    audience = "all",
    targetUserId,
    testToken,
  } = body;

  if (!title || !messageBody) {
    const { error } = await import("@/utils/api-response");
    return error("Title and body are required", 400);
  }

  let tokens = [];

  if (audience === "test") {
    // Single-device test — requires a specific token
    if (!testToken) {
      const { error } = await import("@/utils/api-response");
      return error("testToken is required for test audience", 400);
    }
    tokens = [testToken];
  } else if (audience === "user") {
    // Specific user by ID
    if (!targetUserId) {
      const { error } = await import("@/utils/api-response");
      return error("targetUserId is required for user audience", 400);
    }
    const subs = await PushSubscription.find({
      userId: targetUserId,
      status: "active",
    }).select("token").lean();
    tokens = subs.map((s) => s.token);
  } else if (audience === "users") {
    // All authenticated/registered users only
    const subs = await PushSubscription.find({
      status: "active",
      userId: { $ne: null },
    }).select("token").lean();
    tokens = subs.map((s) => s.token);
  } else if (audience === "guests") {
    // Anonymous visitors only
    const subs = await PushSubscription.find({
      status: "active",
      userId: null,
    }).select("token").lean();
    tokens = subs.map((s) => s.token);
  } else {
    // "all" — every active subscription
    const subs = await PushSubscription.find({ status: "active" })
      .select("token")
      .lean();
    tokens = subs.map((s) => s.token);
  }

  if (tokens.length === 0) {
    return ok(
      { sent: 0, failed: 0, pruned: 0 },
      "No active subscriptions for this audience",
    );
  }

  const { successCount, failureCount, invalidTokens } = await sendPushToTokens(
    tokens,
    { title, body: messageBody, url, image, icon, category, tag: category },
  );

  // Auto-prune revoked/invalid tokens from DB
  let pruned = 0;
  if (invalidTokens.length > 0) {
    const result = await PushSubscription.updateMany(
      { token: { $in: invalidTokens } },
      { $set: { status: "revoked" } },
    );
    pruned = result.modifiedCount;
  }

  return ok(
    {
      sent: successCount,
      failed: failureCount,
      pruned,
      totalTargeted: tokens.length,
    },
    `Push sent to ${successCount} device(s)`,
  );
});
