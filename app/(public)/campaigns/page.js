import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import { getPublicAffiliateProducts } from "@/modules/affiliate-product/affiliate-product.service";
import {
  getFeaturedCoupons,
  getTrendingCoupons,
  listCoupons,
} from "@/modules/coupon/coupon.service";
import Merchant from "@/modules/merchant/merchant.model";
import CampaignsClient from "./campaigns-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trending Deals, Hot Offers & Viral Discounts | Vouchiqo",
  description:
    "Discover today's most popular verified brand offers, flash sales, and discount codes on Vouchiqo.",
};

export default async function CampaignsPage() {
  await connectDB();

  // 1. Fetch live trending coupons
  const trendingRaw = await getTrendingCoupons();
  const trendingCoupons = JSON.parse(JSON.stringify(trendingRaw || []));

  // 2. Fetch featured active coupons
  const featuredRaw = await getFeaturedCoupons();
  const featuredCoupons = JSON.parse(JSON.stringify(featuredRaw || []));

  // 3. Fetch broader active coupons
  const allResult = await listCoupons(
    new URLSearchParams({ limit: "40", sortBy: "createdAt", sortOrder: "desc" }),
  );
  const allCoupons = JSON.parse(JSON.stringify(allResult?.coupons || []));

  // 4. Fetch live affiliate products
  let affiliateProducts = [];
  try {
    const rawAffiliate = await getPublicAffiliateProducts({ limit: 24 });
    affiliateProducts = JSON.parse(
      JSON.stringify(rawAffiliate?.products || rawAffiliate || []),
    );
  } catch (err) {
    console.error("Error fetching affiliate products:", err);
  }

  // 5. Fetch trending brand merchants
  let trendingMerchants = [];
  try {
    const rawMerchants = await Merchant.find({
      status: "approved",
    })
      .select(
        "businessName slug logo banner totalCoupons totalRedemptions followerCount isVerified category",
      )
      .sort({ totalRedemptions: -1, createdAt: -1 })
      .limit(20)
      .lean();
    trendingMerchants = JSON.parse(JSON.stringify(rawMerchants || []));
  } catch (err) {
    console.error("Error fetching merchants:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <Navbar />
      <CampaignsClient
        initialTrendingCoupons={trendingCoupons}
        initialFeaturedCoupons={featuredCoupons}
        allCoupons={allCoupons}
        affiliateProducts={affiliateProducts}
        trendingMerchants={trendingMerchants}
      />
      <Footer />
    </div>
  );
}
