import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  getMerchantById,
  updateMerchant,
} from "@/modules/merchant/merchant.service";
import { updateMerchantSchema } from "@/modules/merchant/merchant.validation";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/merchants/:id
 * Get a single approved merchant's public profile.
 */
export const GET = asyncHandler(async (_request, { params }) => {
  await connectDB();
  const { id } = await params;
  const merchant = await getMerchantById(id, true);
  return ok(merchant);
});

/**
 * PUT /api/merchants/:id
 * Update merchant profile. Only the owner can update.
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const { id } = await params;

  const body = await request.json();
  const data = updateMerchantSchema.parse(body);

  const merchant = await updateMerchant(id, user.id, data, user.role);
  return ok(merchant, "Merchant profile updated");
});
