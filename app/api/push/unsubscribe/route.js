import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/modules/push-subscription/push-subscription.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/unsubscribe
 *
 * Mark an FCM token as unsubscribed.
 * Does not delete — keeps the record for analytics and pruning audits.
 *
 * Body: { token }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { token } = body;

  if (!token || typeof token !== "string") {
    const { error } = await import("@/utils/api-response");
    return error("FCM token is required", 400);
  }

  await PushSubscription.findOneAndUpdate(
    { token },
    { $set: { status: "unsubscribed", lastActiveAt: new Date() } },
    { new: true },
  );

  return ok({ unsubscribed: true }, "Push subscription removed");
});
