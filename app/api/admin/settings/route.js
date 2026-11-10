import { connectDB } from "@/lib/mongodb";
import {
  getPlatformSettings,
  savePlatformSetting,
} from "@/modules/admin/settings.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Fetch all platform configurations. Public read or admin.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get("public") === "true";

  if (!isPublic) {
    try {
      await requireRole(request, ROLES.ADMIN);
    } catch {
      // If auth check fails, fallback to returning public platform settings map
    }
  }

  const settingsMap = await getPlatformSettings();
  return ok({ settings: settingsMap, ...settingsMap });
});

/**
 * PUT /api/admin/settings
 * Save platform configurations. Admin only.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { key, value } = await request.json();
  const setting = await savePlatformSetting(key, value);
  return ok(setting, `Platform setting '${key}' updated successfully`);
});
