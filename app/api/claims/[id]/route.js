import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { removeClaim } from "@/modules/claim/claim.service";
import { noContent } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * DELETE /api/claims/:id
 * Remove a saved coupon from the user's collection.
 * Only works for claims that haven't been redeemed yet.
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { id } = await params;

  await removeClaim(id, user.id);
  return noContent();
});
