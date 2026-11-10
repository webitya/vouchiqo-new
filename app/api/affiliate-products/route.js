import { connectDB } from "@/lib/mongodb";
import {
  getPublicAffiliateProducts,
  recordAffiliateProductClick,
} from "@/modules/affiliate-product/affiliate-product.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/affiliate-products
 * Fetch public active affiliate products by merchantId or category
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get("merchantId");
  const category = searchParams.get("category");
  const limit = searchParams.get("limit");

  const products = await getPublicAffiliateProducts({ merchantId, category, limit });
  return ok(products);
});

/**
 * POST /api/affiliate-products
 * Action dispatcher (e.g. record click)
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const body = await request.json();

  if (body.action === "click" && body.productId) {
    await recordAffiliateProductClick(body.productId);
    return ok({ success: true, message: "Click recorded" });
  }

  return ok({ success: true });
});
