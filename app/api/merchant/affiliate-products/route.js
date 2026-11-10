import { connectDB } from "@/lib/mongodb";
import {
  createAffiliateProduct,
  getMerchantAffiliateProducts,
} from "@/modules/affiliate-product/affiliate-product.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { created, ok } from "@/utils/api-response";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { MERCHANT_STATUS, normalizeCategory, ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/affiliate-products
 * Fetch authenticated merchant's affiliate products.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const authIdStr = user.id ? String(user.id) : null;
  let merchant = null;
  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr }).lean();
  }
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    }).lean();
  }
  if (!merchant) throw new NotFoundError("Merchant profile");

  if (
    merchant.status !== MERCHANT_STATUS.APPROVED &&
    user.role !== ROLES.ADMIN
  ) {
    throw new ForbiddenError(
      `Your merchant profile is currently ${merchant.status}. Only approved merchants can publish affiliate products.`,
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const products = await getMerchantAffiliateProducts(merchant._id, {
    status,
    search,
  });

  return ok(products);
});

/**
 * POST /api/merchant/affiliate-products
 * Create a new affiliate product.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const authIdStr = user.id ? String(user.id) : null;
  let merchant = null;
  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr }).lean();
  }
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    }).lean();
  }
  if (!merchant) throw new NotFoundError("Merchant profile");

  if (
    merchant.status !== MERCHANT_STATUS.APPROVED &&
    user.role !== ROLES.ADMIN
  ) {
    throw new ForbiddenError(
      `Your merchant profile is currently ${merchant.status}. Only approved merchants can publish affiliate products.`,
    );
  }

  const body = await request.json();
  body.category = normalizeCategory(
    body.category || merchant.category || "food",
  );

  const product = await createAffiliateProduct(merchant._id, body);

  return created(product, "Affiliate product created successfully");
});
