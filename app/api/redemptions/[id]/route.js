import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { getRedemptionById } from "@/modules/redemption/redemption.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/redemptions/:id
 * Get a single redemption record. User must own it.
 */
export const GET = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { id } = await params;

  const redemption = await getRedemptionById(id, user.id);
  return ok(redemption);
});
