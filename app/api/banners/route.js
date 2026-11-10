import { connectDB } from "@/lib/mongodb";
import { getPromoBanners } from "@/modules/admin/banner.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/banners
 * Returns a list of active promo banners.
 */
export const GET = asyncHandler(async () => {
  await connectDB();
  const banners = await getPromoBanners();
  return ok(banners);
});
