import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import { CATEGORY_META } from "@/utils/category-meta";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Returns all active categories with metadata and real-time coupon counts
 */
export const GET = asyncHandler(async () => {
  await connectDB();

  // Aggregate active coupon counts per category
  const counts = await Coupon.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    if (c._id) countMap[String(c._id).toLowerCase()] = c.count;
  });

  const categories = Object.entries(CATEGORY_META).map(([slug, meta]) => ({
    slug,
    title: meta.title,
    icon: meta.icon,
    count: countMap[slug.toLowerCase()] || 0,
    banner: meta.banner || null,
  }));

  return ok(categories, "Categories retrieved successfully");
});
