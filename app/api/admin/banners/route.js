import { connectDB } from "@/lib/mongodb";
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "@/modules/admin/banner.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { error, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { HTTP, ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/banners
 * Retrieve all banners for admin panel management.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const banners = await getAllBanners();
  return ok(banners);
});

/**
 * POST /api/admin/banners
 * Create a new promo banner.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  if (!body.image || !body.slot) {
    return error(
      "Missing required fields: image or slot",
      HTTP.BAD_REQUEST,
    );
  }

  const banner = await createBanner(body);
  return ok(banner, "Promo banner created successfully");
});

/**
 * PUT /api/admin/banners
 * Update an existing promo banner.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const targetId = body.id || body.bannerId;
  if (!targetId) {
    return error("Missing banner ID", HTTP.BAD_REQUEST);
  }

  const { id, bannerId, ...updateData } = body;

  const banner = await updateBanner(targetId, updateData);
  return ok(banner, "Promo banner updated successfully");
});

/**
 * DELETE /api/admin/banners
 * Delete a promo banner by ID.
 */
export const DELETE = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return error("Missing banner ID in query parameters", HTTP.BAD_REQUEST);
  }

  await deleteBanner(id);
  return ok(null, "Promo banner deleted successfully");
});
