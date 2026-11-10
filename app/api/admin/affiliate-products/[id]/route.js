import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/affiliate-products/[id]
 * Super Admin update of an affiliate product or brand deal
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const body = await request.json();

  const product = await AffiliateProduct.findById(id);
  if (!product || product.status === "deleted") {
    throw new NotFoundError("Affiliate product not found");
  }

  if (body.title !== undefined) product.title = body.title;
  if (body.description !== undefined) product.description = body.description;
  if (body.category !== undefined) product.category = body.category;
  if (body.originalPrice !== undefined) product.originalPrice = Number(body.originalPrice) || 0;
  if (body.discountPrice !== undefined) product.discountPrice = Number(body.discountPrice) || 0;
  if (body.discountPercentage !== undefined) product.discountPercentage = Number(body.discountPercentage) || 0;
  if (body.discountText !== undefined) product.discountText = body.discountText;
  if (body.affiliateUrl !== undefined) product.affiliateUrl = body.affiliateUrl;
  if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl;
  if (body.status !== undefined) product.status = body.status;

  if (product.originalPrice > 0 && product.discountPrice > 0) {
    const savings = product.originalPrice - product.discountPrice;
    product.discountPercentage = Math.max(0, Math.round((savings / product.originalPrice) * 100));
  }

  await product.save();
  return ok(product);
});

/**
 * DELETE /api/admin/affiliate-products/[id]
 * Super Admin deletion of an affiliate product or brand deal
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const product = await AffiliateProduct.findById(id);

  if (!product || product.status === "deleted") {
    throw new NotFoundError("Affiliate product not found");
  }

  product.status = "deleted";
  await product.save();

  return ok({ success: true, message: "Affiliate product deleted by admin" });
});
