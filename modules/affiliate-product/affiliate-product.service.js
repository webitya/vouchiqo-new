import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import { REDIS_KEYS } from "@/utils/constants";
import AffiliateProduct from "./affiliate-product.model";

async function invalidateHomepageCache() {
  try {
    if (redis) {
      await redis.del(REDIS_KEYS.HOMEPAGE_DATA).catch(() => {});
    }
  } catch (_) {}
}

/**
 * Synchronize merchant's denormalized totalCoupons counter (coupons + affiliate deals)
 */
export async function syncMerchantTotalCoupons(merchantId) {
  if (!merchantId) return;
  try {
    await connectDB();
    const [couponCount, affiliateCount] = await Promise.all([
      Coupon.countDocuments({
        merchantId,
        status: { $nin: ["deleted"] },
      }),
      AffiliateProduct.countDocuments({
        merchantId,
        status: { $nin: ["deleted"] },
      }),
    ]);
    await Merchant.findByIdAndUpdate(merchantId, {
      $set: { totalCoupons: couponCount + affiliateCount },
    });
  } catch (err) {
    console.error("[syncMerchantTotalCoupons Error]:", err);
  }
}

/**
 * Create a new affiliate product
 */
export async function createAffiliateProduct(merchantId, data) {
  await connectDB();

  const originalPrice = Number(data.originalPrice) || 0;
  const discountPrice = Number(data.discountPrice) || 0;
  let discountPercentage = Number(data.discountPercentage) || 0;

  if (originalPrice > 0 && discountPrice > 0) {
    discountPercentage = Math.round(
      ((originalPrice - discountPrice) / originalPrice) * 100,
    );
  }

  const product = await AffiliateProduct.create({
    merchantId,
    title: data.title,
    description: data.description || "",
    category: data.category,
    originalPrice,
    discountPrice,
    discountPercentage: Math.max(0, discountPercentage),
    discountText: data.discountText || "",
    affiliateUrl: data.affiliateUrl,
    imageUrl: data.imageUrl || "",
    status: data.status || "active",
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
  });

  // Keep merchant total offers counter synced and invalidate homepage cache
  await syncMerchantTotalCoupons(merchantId);
  await invalidateHomepageCache();

  return product;
}

/**
 * Get merchant's affiliate products
 */
export async function getMerchantAffiliateProducts(merchantId, query = {}) {
  await connectDB();
  const filter = { merchantId, status: { $ne: "deleted" } };

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.search) {
    filter.title = new RegExp(query.search, "i");
  }

  const products = await AffiliateProduct.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return products;
}

/**
 * Public: Get active affiliate products for a merchant or category with limit
 */
export async function getPublicAffiliateProducts(query = {}) {
  await connectDB();
  const filter = { status: "active" };

  if (query.merchantId) {
    filter.merchantId = query.merchantId;
  }

  if (query.category) {
    filter.category = query.category;
  }

  const limit = Math.min(Number(query.limit) || 24, 100);

  const products = await AffiliateProduct.find(filter)
    .populate("merchantId", "businessName logo slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products;
}

/**
 * Get single affiliate product by ID
 */
export async function getAffiliateProductById(productId) {
  await connectDB();
  const product = await AffiliateProduct.findById(productId).lean();
  if (!product || product.status === "deleted") {
    throw new NotFoundError("Affiliate product not found");
  }
  return product;
}

/**
 * Update affiliate product
 */
export async function updateAffiliateProduct(productId, merchantId, data) {
  await connectDB();

  const product = await AffiliateProduct.findById(productId);
  if (!product || product.status === "deleted") {
    throw new NotFoundError("Affiliate product not found");
  }

  if (String(product.merchantId) !== String(merchantId)) {
    throw new ForbiddenError("You are not authorized to edit this product");
  }

  if (data.title !== undefined) product.title = data.title;
  if (data.description !== undefined) product.description = data.description;
  if (data.category !== undefined) product.category = data.category;
  if (data.originalPrice !== undefined)
    product.originalPrice = Number(data.originalPrice) || 0;
  if (data.discountPrice !== undefined)
    product.discountPrice = Number(data.discountPrice) || 0;
  if (data.discountPercentage !== undefined)
    product.discountPercentage = Number(data.discountPercentage) || 0;
  if (data.discountText !== undefined) product.discountText = data.discountText;
  if (data.affiliateUrl !== undefined) product.affiliateUrl = data.affiliateUrl;
  if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl;
  if (data.status !== undefined) product.status = data.status;
  if (data.expiresAt !== undefined)
    product.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  if (product.originalPrice > 0 && product.discountPrice > 0) {
    const savings = product.originalPrice - product.discountPrice;
    product.discountPercentage = Math.max(
      0,
      Math.round((savings / product.originalPrice) * 100),
    );
  }

  await product.save();

  // Keep merchant total offers counter synced and invalidate homepage cache
  await syncMerchantTotalCoupons(merchantId);
  await invalidateHomepageCache();

  return product;
}

/**
 * Delete affiliate product
 */
export async function deleteAffiliateProduct(productId, merchantId) {
  await connectDB();

  const product = await AffiliateProduct.findById(productId);
  if (!product || product.status === "deleted") {
    throw new NotFoundError("Affiliate product not found");
  }

  if (String(product.merchantId) !== String(merchantId)) {
    throw new ForbiddenError("You are not authorized to delete this product");
  }

  product.status = "deleted";
  await product.save();

  // Keep merchant total offers counter synced and invalidate homepage cache
  await syncMerchantTotalCoupons(merchantId);
  await invalidateHomepageCache();

  return { success: true, message: "Affiliate product deleted" };
}

/**
 * Increment click count
 */
export async function recordAffiliateProductClick(productId) {
  await connectDB();
  await AffiliateProduct.findByIdAndUpdate(productId, {
    $inc: { clickCount: 1 },
  });
}
