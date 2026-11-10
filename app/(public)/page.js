import { HomeClient } from "@/components/landing/HomeClient";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { getPromoBanners } from "@/modules/admin/banner.service";
import { getPublicAffiliateProducts } from "@/modules/affiliate-product/affiliate-product.service";
import { getFeaturedCoupons } from "@/modules/coupon/coupon.service";
import Merchant from "@/modules/merchant/merchant.model";

// ISR page caching (revalidates every 60 seconds, no no-store headers, enables bfcache)
export const revalidate = 60;

const CACHE_KEY = "vouchiqo:homepage:data:v3";
const CACHE_TTL_SECONDS = 300;

async function fetchHomepageData() {
  // 1. Fast path: Check Redis cache first for instant response (< 2ms)
  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY).catch(() => null);
      if (cached) {
        return JSON.parse(cached);
      }
    }
  } catch (err) {
    // Graceful fallback to database
  }

  try {
    // 2. Connect DB
    await connectDB();

    // 3. Parallel fetch all 4 essential data sources concurrently
    const [rawCoupons, rawMerchants, rawBanners, rawProducts] =
      await Promise.all([
        getFeaturedCoupons().catch(() => []),
        Merchant.find({ status: "approved" })
          .select(
            "businessName slug logo banner shopImage category maxDiscount totalCoupons totalRedemptions isVerified status",
          )
          .sort({ totalCoupons: -1, totalRedemptions: -1, createdAt: -1 })
          .limit(36)
          .lean()
          .catch(() => []),
        getPromoBanners().catch(() => []),
        getPublicAffiliateProducts().catch(() => []),
      ]);

    const payload = {
      featuredCoupons: JSON.parse(JSON.stringify(rawCoupons || [])),
      popularMerchants: JSON.parse(JSON.stringify(rawMerchants || [])),
      banners: JSON.parse(JSON.stringify(rawBanners || [])),
      affiliateProducts: JSON.parse(JSON.stringify(rawProducts || [])),
    };

    // 4. Cache in Redis non-blocking in the background
    try {
      if (redis) {
        redis
          .set(CACHE_KEY, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS)
          .catch(() => {});
      }
    } catch (_) {}

    return payload;
  } catch (err) {
    console.error("fetchHomepageData DB error:", err?.message || err);
    return {
      featuredCoupons: [],
      popularMerchants: [],
      banners: [],
      affiliateProducts: [],
    };
  }
}

export default async function Home() {
  const { featuredCoupons, popularMerchants, banners, affiliateProducts } =
    await fetchHomepageData();

  return (
    <HomeClient
      initialCoupons={featuredCoupons}
      popularMerchants={popularMerchants}
      banners={banners}
      affiliateProducts={affiliateProducts}
    />
  );
}
