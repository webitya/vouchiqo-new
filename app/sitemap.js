import { connectDB } from "@/lib/mongodb";
import PlatformSetting from "@/modules/admin/settings.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";

export const dynamic = "force-dynamic";

/**
 * Next.js Dynamic Sitemap Generator (App Router).
 * Resolves static routes, categories, active brand storefronts, and verified coupons.
 */
export default async function sitemap() {
  await connectDB();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com";

  // 1. Static Routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/expired-coupon-revival`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nearby-offers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/campaigns`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Dynamic Categories
  let categories = [];
  try {
    const setting = await PlatformSetting.findOne({ key: "categories" }).lean();
    if (setting?.value) {
      categories = setting.value.filter((c) => c.active);
    }
  } catch (err) {
    console.error("Failed to load categories for sitemap:", err);
  }

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Dynamic Merchant Brand Stores
  let brands = [];
  try {
    brands = await Merchant.find({ status: "approved" })
      .select("slug updatedAt")
      .lean();
  } catch (err) {
    console.error("Failed to load merchants for sitemap:", err);
  }

  const brandRoutes = brands.map((brand) => ({
    url: `${baseUrl}/brand/${brand.slug}`,
    lastModified: brand.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Dynamic Coupon Deal Details
  let coupons = [];
  try {
    coupons = await Coupon.find({
      status: "active",
      isVerified: true,
      expiresAt: { $gt: new Date() },
    })
      .select("_id updatedAt")
      .lean();
  } catch (err) {
    console.error("Failed to load coupons for sitemap:", err);
  }

  const dealRoutes = coupons.map((c) => ({
    url: `${baseUrl}/deals/${c._id}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...dealRoutes];
}
