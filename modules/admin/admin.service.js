import { invalidateCouponCaches } from "@/modules/coupon/coupon.service";
import mongoose from "mongoose";
import { redis } from "@/lib/redis";
import { escapeRegex } from "@/lib/security";
import Coupon from "@/modules/coupon/coupon.model";
import UserProfile from "@/modules/user/user.model";
import { NotFoundError } from "@/utils/app-error";
import { REDIS_KEYS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

/**
 * List all users with pagination.
 * Joins auth 'user' collection for names and emails.
 *
 * Production-grade approach:
 * - Search ($match on name/email) fires BEFORE $lookup stages — uses collection indexes
 * - Single $facet aggregation returns paginated data + total in one DB round-trip
 * - Inline escapeRegex prevents ReDoS attacks on user input
 *
 * @param {URLSearchParams} searchParams
 */
export async function listUsers(searchParams) {
  const isExport = searchParams.get("export") === "true";
  const db = mongoose.connection.db;

  if (isExport) {
    const subscribers = await db
      .collection("user")
      .find({ role: { $ne: "admin" } })
      .project({ name: 1, email: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();
    return { subscribers };
  }

  const { page, limit, skip } = parsePagination(searchParams);
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");
  const merchantStatus = searchParams.get("merchantStatus");
  const search = (searchParams.get("search") || "").trim();

  // ── Stage 1: Pre-pipeline match — runs BEFORE expensive $lookup stages ──
  // Applying filters here lets MongoDB use native indexes on the 'user' collection.
  const preMatch = {};

  if (role) {
    preMatch.role = role.toLowerCase();
  } else {
    // Default: exclude admin accounts from the customer directory
    preMatch.role = { $ne: "admin" };
  }

  if (isActive !== null && isActive !== undefined && isActive !== "") {
    preMatch.isActive = isActive === "true";
  }

  if (search) {
    // Escape special regex chars to prevent ReDoS attacks
    const safeQ = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match on raw 'user' collection fields (before $project renames them)
    preMatch.$or = [
      { name: { $regex: safeQ, $options: "i" } },
      { email: { $regex: safeQ, $options: "i" } },
    ];
  }

  // ── Pipeline definition ─────────────────────────────────────────────────
  const pipeline = [
    // Fast pre-filter using collection indexes
    { $match: preMatch },

    { $sort: { createdAt: -1 } },

    // Stringify ObjectId for cross-collection string joins
    { $addFields: { authIdStr: { $toString: "$_id" } } },

    // Join user profile (totalSavings, emailNotifications)
    {
      $lookup: {
        from: "userprofiles",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$authId", "$$uId"] } } },
          { $limit: 1 },
        ],
        as: "profile",
      },
    },

    // Join merchant profile (businessName, status, plan) — $limit: 1 optimises lookup
    {
      $lookup: {
        from: "merchants",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$authId", "$$uId"] } } },
          { $limit: 1 },
          { $project: { businessName: 1, status: 1, plan: 1 } },
        ],
        as: "merchantProfile",
      },
    },

    // Count claims instead of pulling every document
    {
      $lookup: {
        from: "claims",
        let: { uId: "$authIdStr" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uId"] } } },
          { $count: "total" },
        ],
        as: "claimsCount",
      },
    },

    // Project the clean output shape consumed by the frontend
    {
      $project: {
        _id: 1,
        authId: "$authIdStr",
        name: { $ifNull: ["$name", "User"] },
        email: { $ifNull: ["$email", ""] },
        role: { $ifNull: ["$role", "customer"] },
        isActive: { $ifNull: ["$isActive", true] },
        createdAt: 1,
        totalSavings: { $ifNull: [{ $arrayElemAt: ["$profile.totalSavings", 0] }, 0] },
        emailNotifications: { $ifNull: [{ $arrayElemAt: ["$profile.emailNotifications", 0] }, true] },
        couponsSaved: { $ifNull: [{ $arrayElemAt: ["$claimsCount.total", 0] }, 0] },
        businessName: { $arrayElemAt: ["$merchantProfile.businessName", 0] },
        merchantStatus: { $arrayElemAt: ["$merchantProfile.status", 0] },
        merchantPlan: { $arrayElemAt: ["$merchantProfile.plan", 0] },
      },
    },
  ];

  // Post-projection filter: merchantStatus only exists after $project
  if (merchantStatus) {
    pipeline.push({ $match: { merchantStatus } });
  }

  // ── Single $facet pass: data + count in one DB round-trip ──────────────
  const [facetResult] = await db.collection("user").aggregate([
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        count: [{ $count: "total" }],
      },
    },
  ]).toArray();

  const users = facetResult?.data || [];
  const total = facetResult?.count?.[0]?.total ?? 0;

  return { users, meta: buildMeta(total, page, limit) };
}

/**
 * Activate or deactivate a user in both user_profiles and the auth 'user' collections.
 *
 * @param {string} authId
 * @param {boolean} isActive
 */
export async function setUserActiveStatus(authId, isActive) {
  const [profile, _authUser] = await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId },
      { $set: { isActive } },
      { new: true },
    ),
    mongoose.connection.db
      .collection("user")
      .updateOne({ _id: authId }, { $set: { isActive } }),
  ]);

  if (!profile) throw new NotFoundError("User");
  return profile;
}

// ─────────────────────────────────────────────
// Coupons
// ─────────────────────────────────────────────

/**
 * List ALL coupons regardless of status (admin view).
 *
 * @param {URLSearchParams} searchParams
 */
export async function listAllCoupons(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const isVerified = searchParams.get("isVerified");
  const search = searchParams.get("search");

  const filter = {};
  if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: "deleted" };
  }
  if (isVerified !== null && isVerified !== undefined) {
    filter.isVerified = isVerified === "true";
  }
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { code: { $regex: safe, $options: "i" } },
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate(
        "merchantId",
        "businessName slug plan contactEmail contactPhone whatsappNumber website location category customCategoryNotes status businessType isVerified logo banner liaisonName liaisonDesignation liaisonPhone gstin docType docImage shopImage regionalHubCity constitution",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  return { coupons, meta: buildMeta(total, page, limit) };
}

/**
 * Toggle featured or hot flag on a coupon (admin action).
 *
 * @param {string} couponId
 * @param {{ isFeatured?: boolean, isHot?: boolean }} flags
 */
export async function setCouponFlags(couponId, flags) {
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: flags },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");

  await invalidateCouponCaches(coupon).catch(() => {});

  return coupon;
}

/**
 * Update coupon moderation state, flags, status, or rejection reasons.
 *
 * @param {string} couponId
 * @param {object} update
 */
export async function updateCouponModerationState(couponId, update) {
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: update },
    { new: true },
  );

  if (!coupon) throw new NotFoundError("Coupon");

  await invalidateCouponCaches(coupon).catch(() => {});

  return coupon;
}

/**
 * Permanently delete a coupon (admin action).
 *
 * @param {string} couponId
 */
export async function deleteAdminCoupon(couponId) {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) throw new NotFoundError("Coupon");

  await invalidateCouponCaches(coupon).catch(() => {});

  return coupon;
}
