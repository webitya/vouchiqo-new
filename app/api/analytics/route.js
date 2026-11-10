import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { getMerchantAnalytics } from "@/modules/analytics/analytics.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { REDIS_KEYS, REDIS_TTL, ROLES } from "@/utils/constants";

/**
 * GET /api/analytics
 * Get analytics for the authenticated merchant's business.
 * Supports ?period=7d|30d|90d|12m query parameter.
 * Returns: overview stats, trend data, traffic sources, top coupons.
 * Redis-cached per merchant+period for 2 minutes (8 heavy aggregations).
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30d";

  const cacheKey = REDIS_KEYS.merchantAnalytics(user.id, period);

  // Fast path: Redis cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return ok(JSON.parse(cached));
  } catch (_) {}

  const analytics = await getMerchantAnalytics(user.id, period);

  // Cache with fire-and-forget
  redis.setex(cacheKey, REDIS_TTL.MERCHANT_ANALYTICS, JSON.stringify(analytics)).catch(() => {});

  return ok(analytics);
});