import { Suspense } from "react";
import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Merchant from "@/modules/merchant/merchant.model";
import BrandsClient from "./brands-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Partner Brands & Stores Offers | Vouchiqo",
  description:
    "Find real verified promo codes, discount vouchers, and affiliate product deals from authentic partner merchants on Vouchiqo.",
};

export default async function BrandsPage() {
  // Fast path: Redis cache (5 minutes)
  try {
    const cached = await redis.get(REDIS_KEYS.BRANDS_LIST);
    if (cached) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
          <Navbar />
          <Suspense
            fallback={
              <div className="p-8 text-center text-slate-400">
                Loading brands...
              </div>
            }
          >
            <BrandsClient brands={JSON.parse(cached)} />
          </Suspense>
          <Footer />
        </div>
      );
    }
  } catch (_) {}

  try {
    await connectDB();

    // Parallel database execution (Rule 74 — eliminate request waterfalls)
    const [dbMerchants, couponCounts, affiliateCounts] = await Promise.all([
      Merchant.find({ status: "approved" })
        .select(
          "businessName slug logo banner shopImage category isVerified status",
        )
        .sort({ businessName: 1 })
        .lean(),
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

    // Fast O(1) map lookups for aggregate counts
    const couponCountMap = new Map();
    for (const c of couponCounts) {
      if (c._id) couponCountMap.set(c._id.toString(), c.total);
    }
    const affiliateCountMap = new Map();
    for (const a of affiliateCounts) {
      if (a._id) affiliateCountMap.set(a._id.toString(), a.total);
    }

    // Combine DB merchants with real coupon & affiliate counts
    const brandsList = dbMerchants.map((m) => {
      const mIdStr = m._id.toString();
      return {
        _id: mIdStr,
        businessName: m.businessName,
        slug: m.slug,
        logo: m.logo || "",
        banner: m.banner || m.shopImage || "",
        category: m.category || "General Store",
        totalCoupons: couponCountMap.get(mIdStr) || 0,
        totalAffiliateProducts: affiliateCountMap.get(mIdStr) || 0,
        isVerified: m.isVerified ?? true,
      };
    });

    // Cache processed brands list in Redis
    try {
      redis
        .setex(
          REDIS_KEYS.BRANDS_LIST,
          REDIS_TTL.BRANDS_LIST,
          JSON.stringify(brandsList),
        )
        .catch(() => {});
    } catch (_) {}

    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Navbar />
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-400">
              Loading brands...
            </div>
          }
        >
          <BrandsClient brands={brandsList} />
        </Suspense>
        <Footer />
      </div>
    );
  } catch (err) {
    console.error("BrandsPage database fetch error:", err?.message || err);
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Navbar />
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-400">
              Loading brands...
            </div>
          }
        >
          <BrandsClient brands={[]} />
        </Suspense>
        <Footer />
      </div>
    );
  }
}
