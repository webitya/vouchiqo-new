import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { listUsers, setUserActiveStatus } from "@/modules/admin/admin.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import Claim from "@/modules/claim/claim.model";
import Redemption from "@/modules/redemption/redemption.model";
import UserProfile from "@/modules/user/user.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/admin/users
 * List all users. Admin only.
 *
 * Query params: page, limit, role, isActive
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listUsers(searchParams);
  return ok(result);
});

/**
 * PUT /api/admin/users
 * Activate or deactivate a user. Admin only.
 *
 * Body: { authId: string, isActive: boolean }
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { authId, isActive } = await request.json();
  const user = await setUserActiveStatus(authId, isActive);
  return ok(user, `User ${isActive ? "activated" : "deactivated"}`);
});

/**
 * DELETE /api/admin/users
 * Delete a customer user account and all associated claims & redemptions. Admin only.
 *
 * Body: { authId: string } or searchParam ?authId=...
 */
export const DELETE = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  let authId = searchParams.get("authId");
  if (!authId) {
    const body = await request.json().catch(() => ({}));
    authId = body.authId;
  }

  if (!authId) {
    throw new Error("authId is required to delete a user.");
  }

  const db = mongoose.connection.db;

  // 1. Find UserProfile by authId or _id
  const userProfile = await UserProfile.findOne({
    $or: [{ authId }, { _id: mongoose.Types.ObjectId.isValid(authId) ? authId : null }],
  }).lean();

  if (userProfile) {
    const uId = userProfile._id;
    // Delete customer claims
    await Claim.deleteMany({ userId: uId });
    // Delete customer redemptions
    await Redemption.deleteMany({ userId: uId });
    // Delete UserProfile
    await UserProfile.findByIdAndDelete(uId);
  }

  // 2. Delete main auth user record if it exists in 'user' collection
  try {
    if (mongoose.Types.ObjectId.isValid(authId)) {
      await db.collection("user").deleteOne({ _id: new mongoose.Types.ObjectId(authId) });
    } else {
      await db.collection("user").deleteOne({ id: authId });
    }
  } catch (err) {
    console.error("[DELETE /api/admin/users] Auth user delete error:", err);
  }

  return ok({ authId }, "Customer user and all associated records deleted permanently");
});
