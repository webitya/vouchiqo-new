import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { getOrCreateProfile, updateProfile } from "@/modules/user/user.service";
import { updateUserSchema } from "@/modules/user/user.validation";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET /api/users/me
 * Returns the authenticated user's profile.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);
  const profile = await getOrCreateProfile(user.id, user.role);
  return ok({ user, profile });
});

/**
 * PUT /api/users/me
 * Update the authenticated user's profile.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const body = await request.json();
  const data = updateUserSchema.parse(body);

  const profile = await updateProfile(user.id, data);
  return ok(profile, "Profile updated");
});
