import { connectDB } from "@/lib/mongodb";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import Notification from "@/modules/notification/notification.model";
import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/merchant/badges
 * Returns real-time sidebar badges & application status for the authenticated merchant.
 */
export const GET = asyncHandler(async (request) => {
  const { user } = await requireAuth(request);
  const cacheKey = REDIS_KEYS.merchantBadges(user.id);

  // Fast path: Redis cache (< 1ms)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return ok(JSON.parse(cached));
    }
  } catch (err) {
    console.warn("[Badges Cache] Lookup failed:", err?.message);
  }

  await connectDB();

  const merchant = await Merchant.findOne({
    $or: [
      { authId: user.id },
      ...(user.email
        ? [{ contactEmail: user.email.toLowerCase().trim() }]
        : []),
    ],
  }).lean();

  if (!merchant) {
    const emptyBadges = {
      status: "not_submitted",
      totalCoupons: 0,
      activeCoupons: 0,
      expiredCoupons: 0,
      totalCampaigns: 0,
      unreadNotifications: 0,
    };
    try {
      await redis.set(cacheKey, JSON.stringify(emptyBadges), "EX", 60);
    } catch {}
    return ok(emptyBadges);
  }

  const now = new Date();

  const [
    couponTotal,
    couponActive,
    couponExpired,
    affiliateTotal,
    affiliateActive,
    totalCampaigns,
    unreadNotifications,
  ] = await Promise.all([
    Coupon.countDocuments({ merchantId: merchant._id }),
    Coupon.countDocuments({ merchantId: merchant._id, status: "active" }),
    Coupon.countDocuments({ merchantId: merchant._id, status: "expired" }),
    AffiliateProduct.countDocuments({
      merchantId: merchant._id,
      status: { $ne: "deleted" },
    }),
    AffiliateProduct.countDocuments({
      merchantId: merchant._id,
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }),
    Campaign.countDocuments({ merchantId: merchant._id }),
    Notification.countDocuments({ userId: user.id, isRead: false }),
  ]);

  const badges = {
    status: merchant.status || "pending",
    plan: merchant.plan || "starter",
    businessName: merchant.businessName,
    logo: merchant.logo || merchant.logoUrl || null,
    totalCoupons: couponTotal + affiliateTotal,
    activeCoupons: couponActive + affiliateActive,
    expiredCoupons: couponExpired,
    totalCampaigns,
    unreadNotifications,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(badges), "EX", REDIS_TTL.MERCHANT_BADGES);
  } catch (err) {
    console.warn("[Badges Cache] Save failed:", err?.message);
  }

  return ok(badges);
});
