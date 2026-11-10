import { Suspense } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";
import MerchantsClient from "./merchants-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Stores Offers & Promo Codes | Vouchiqo",
  description:
    "Find verified coupon codes, discounts and deals from all your favorite online stores on Vouchiqo.",
};

export default async function MerchantsPage() {
  // Fast path: Redis cache (5 minutes)
  try {
    const cached = await redis.get(REDIS_KEYS.MERCHANTS_LIST);
    if (cached) {
      const data = JSON.parse(cached);
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <Suspense
            fallback={
              <div className="p-8 text-center text-slate-400">
                Loading merchants...
              </div>
            }
          >
            <MerchantsClient
              merchants={data.merchantsList}
              totalMerchants={data.totalMerchantsCount}
              totalCoupons={data.totalCouponsCount}
            />
          </Suspense>
          <Footer />
        </div>
      );
    }
  } catch (_) {}

  await connectDB();

  // Find all approved merchants
  const dbMerchants = await Merchant.find({ status: "approved" })
    .select("businessName slug logo category isVerified")
    .lean();

  // Get active coupon counts grouped by merchantId
  const [couponCounts, affiliateCounts] = await Promise.all([
    Coupon.aggregate([
      {
        $match: {
          status: "active",
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: "$merchantId",
          total: { $sum: 1 },
        },
      },
    ]),
    AffiliateProduct.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: "$merchantId",
          total: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Combine DB merchants with their coupon & affiliate counts
  const merchantsList = dbMerchants.map((m) => {
    const countData = couponCounts.find(
      (c) => c._id.toString() === m._id.toString(),
    );
    const affiliateData = affiliateCounts.find(
      (a) => a._id.toString() === m._id.toString(),
    );

    const totalOffers =
      (countData ? countData.total : 0) +
      (affiliateData ? affiliateData.total : 0);

    return {
      _id: m._id.toString(),
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || "",
      category: m.category,
      totalCoupons: totalOffers,
      isVerified: m.isVerified,
    };
  });

  // Calculate stats
  const totalMerchantsCount = dbMerchants.length;
  const totalCouponsCount =
    couponCounts.reduce((a, c) => a + c.total, 0) +
    affiliateCounts.reduce((a, c) => a + c.total, 0);

  // Cache processed merchants data in Redis
  try {
    const cachePayload = {
      merchantsList,
      totalMerchantsCount,
      totalCouponsCount,
    };
    redis
      .setex(
        REDIS_KEYS.MERCHANTS_LIST,
        REDIS_TTL.MERCHANTS_LIST,
        JSON.stringify(cachePayload),
      )
      .catch(() => {});
  } catch (_) {}

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400">
            Loading merchants...
          </div>
        }
      >
        <MerchantsClient
          merchants={merchantsList}
          totalMerchants={totalMerchantsCount}
          totalCoupons={totalCouponsCount}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
