import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import {
  getAffiliateProductById,
  updateAffiliateProduct,
  deleteAffiliateProduct,
} from "@/modules/affiliate-product/affiliate-product.service";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/affiliate-products/[id]
 */
export const GET = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { id } = await params;
  const product = await getAffiliateProductById(id);
  return ok(product);
});

/**
 * PUT /api/merchant/affiliate-products/[id]
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const { id } = await params;
  const body = await request.json();

  const product = await updateAffiliateProduct(id, merchant._id, body);
  return ok(product, "Affiliate product updated successfully");
});

/**
 * DELETE /api/merchant/affiliate-products/[id]
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const merchant = await Merchant.findOne({ authId: user.id }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const { id } = await params;

  const result = await deleteAffiliateProduct(id, merchant._id);
  return ok(result, "Affiliate product deleted successfully");
});
