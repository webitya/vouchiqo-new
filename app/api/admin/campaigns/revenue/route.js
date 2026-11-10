import { connectDB } from "@/lib/mongodb";
import { getCampaignRevenueSummary } from "@/modules/admin/revenue.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/campaigns/revenue
 * Returns real in-depth campaign add-on revenue, subscription breakdown,
 * and live Razorpay transactions from MongoDB. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const data = await getCampaignRevenueSummary();
  return ok(data);
});
