import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { getSavingsAnalytics } from "@/modules/redemption/redemption.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/users/savings
 * Returns aggregated savings analytics and history for the authenticated user.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const analytics = await getSavingsAnalytics(user.id);
  return ok(analytics);
});
