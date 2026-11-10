import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { getPlatformSettings } from "@/modules/admin/settings.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/plans
 * Public API endpoint to fetch active merchant subscription plans & pricing from database.
 * Redis-cached for 1 hour (plans almost never change, admin must purge on update).
 */
export const GET = asyncHandler(async () => {
  // Fast path: Redis cache (1 hour TTL)
  try {
    const cached = await redis.get(REDIS_KEYS.PLATFORM_PLANS);
    if (cached) return ok({ plans: JSON.parse(cached) });
  } catch (_) {}

  await connectDB();
  const settingsMap = await getPlatformSettings();
  const rawPlans = settingsMap.merchant_plans || [];

  const plans = Array.isArray(rawPlans)
    ? rawPlans.filter((p) => p.active !== false)
    : [];

  // Cache with fire-and-forget
  redis.setex(REDIS_KEYS.PLATFORM_PLANS, REDIS_TTL.PLATFORM_PLANS, JSON.stringify(plans)).catch(() => {});

  return ok({ plans });
});