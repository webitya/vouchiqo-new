import { connectDB } from "@/lib/mongodb";
import { reorderBanners } from "@/modules/admin/banner.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { error, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { HTTP, ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/banners/reorder
 * Bulk reorder promo banners by passing an array of ordered banner IDs.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const bannerIds = body.bannerIds || body.orderedIds;

  if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
    return error("Missing or invalid bannerIds array", HTTP.BAD_REQUEST);
  }

  const result = await reorderBanners(bannerIds);
  return ok(result, "Banner order updated successfully");
});
