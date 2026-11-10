import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/affiliate-products
 * List all merchant affiliate products and brand deals across the platform. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  } else {
    filter.status = { $ne: "deleted" };
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
      { discountText: { $regex: safe, $options: "i" } },
    ];
  }

  const products = await AffiliateProduct.find(filter)
    .populate("merchantId", "businessName slug category logo contactEmail contactPhone status")
    .sort({ createdAt: -1 })
    .lean();

  return ok(products);
});
