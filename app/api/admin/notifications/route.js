import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications
 * Returns pending numbers for admin real-time badge counters.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const [pendingMerchants, pendingCoupons, pendingCampaigns] =
    await Promise.all([
      Merchant.countDocuments({ status: "pending" }),
      Coupon.countDocuments({ isVerified: false }),
      Campaign.countDocuments({ status: "pending" }),
    ]);

  const total = pendingMerchants + pendingCoupons + pendingCampaigns;

  return ok({
    pendingMerchants,
    pendingCoupons,
    pendingCampaigns,
    total,
  });
});
