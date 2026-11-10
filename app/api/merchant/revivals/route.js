import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import CustomerRevival from "@/modules/revival/customer-revival.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/revivals
 * Retrieve customer revival requests for the authenticated merchant's business.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const businessNameLower = merchant.businessName.toLowerCase().trim();
  const revivals = await CustomerRevival.find({
    brandName: new RegExp(`^${escapeRegex(businessNameLower)}$`, "i"),
  })
    .sort({ createdAt: -1 })
    .lean();

  return ok({ revivals });
});
