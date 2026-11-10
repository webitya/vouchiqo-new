import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import CustomerRevival from "@/modules/revival/customer-revival.model";
import { resolveCustomerRevival } from "@/modules/revival/customer-revival.service";
import { ok } from "@/utils/api-response";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * POST /api/merchant/revivals/resolve
 * Resolve a customer revival request. Scoped to resource owner (merchant).
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json();
  const { revivalId, outcomeStatus, declineReason, alternativeOfferId } = body;

  const revivalRequest = await CustomerRevival.findById(revivalId).lean();
  if (!revivalRequest) throw new NotFoundError("Revival request");

  // Verify resource ownership: must match merchant's business name
  const merchantBrand = merchant.businessName.toLowerCase().trim();
  const requestBrand = revivalRequest.brandName.toLowerCase().trim();

  if (merchantBrand !== requestBrand && user.role !== ROLES.ADMIN) {
    throw new ForbiddenError(
      "You do not have permission to resolve this request",
    );
  }

  const result = await resolveCustomerRevival(revivalId, {
    outcomeStatus,
    declineReason,
    alternativeOfferId,
  });

  return ok(result, "Customer revival request resolved successfully");
});
