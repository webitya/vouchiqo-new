import mongoose from "mongoose";
import Merchant from "@/modules/merchant/merchant.model";
import UserProfile from "@/modules/user/user.model";
import { NotFoundError } from "@/utils/app-error";

/**
 * Get or create a user profile for a given Better Auth user ID.
 * Creates a profile on first access (lazy initialization).
 *
 * @param {string} authId
 */
export async function getOrCreateProfile(authId, defaultRole = "customer") {
  let profile = await UserProfile.findOne({ authId });
  const isMerchant = await Merchant.exists({ authId });
  const targetRole = isMerchant ? "merchant" : (profile?.role || defaultRole);

  if (!profile) {
    profile = await UserProfile.create({ authId, role: targetRole });
  } else if (isMerchant && profile.role !== "merchant") {
    profile.role = "merchant";
    await profile.save();
  }

  return profile;
}

/**
 * Get user profile by auth ID. Throws if not found.
 *
 * @param {string} authId
 */
export async function getProfile(authId) {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) throw new NotFoundError("User profile");
  return profile;
}

/**
 * Update a user's profile data.
 *
 * @param {string} authId
 * @param {object} data - Validated update data
 */
export async function updateProfile(authId, data) {
  const { name, phone, ...profileData } = data;

  if (name !== undefined || phone !== undefined) {
    const userUpdate = {};
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined && phone !== "") {
      userUpdate.phone = phone;
      userUpdate.phoneNumber = phone;
    }

    const query = { $or: [{ id: authId }, { _id: authId }] };
    try {
      if (mongoose.Types.ObjectId.isValid(authId)) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(authId) });
      }
    } catch (e) {}

    await mongoose.connection.db
      .collection("user")
      .updateOne(query, { $set: userUpdate });
  }

  const profile = await UserProfile.findOneAndUpdate(
    { authId },
    { $set: profileData },
    { new: true, runValidators: true, upsert: true },
  );
  return profile;
}

/**
 * Get the customer savings dashboard.
 * Returns total savings, redemption count, and recent redemptions.
 *
 * @param {string} authId
 */
export async function getSavingsSummary(authId) {
  const profile = await UserProfile.findOne({ authId }).lean();
  return {
    totalSavings: profile?.totalSavings ?? 0,
    savedCouponsCount: profile?.savedCoupons?.length ?? 0,
    followedMerchantsCount: profile?.followedMerchants?.length ?? 0,
  };
}

/**
 * Follow a merchant.
 *
 * @param {string} authId
 * @param {string} merchantId
 */
export async function followMerchant(authId, merchantId) {
  await UserProfile.findOneAndUpdate(
    { authId },
    { $addToSet: { followedMerchants: merchantId } },
    { upsert: true },
  );
}

/**
 * Unfollow a merchant.
 *
 * @param {string} authId
 * @param {string} merchantId
 */
export async function unfollowMerchant(authId, merchantId) {
  await UserProfile.findOneAndUpdate(
    { authId },
    { $pull: { followedMerchants: merchantId } },
  );
}
