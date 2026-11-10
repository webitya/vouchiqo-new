import mongoose from "mongoose";
import Claim from "@/modules/claim/claim.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { sendUserCouponClaimedEmail } from "@/lib/email/user-email";
import { logger } from "@/lib/logger";
import { AppError, NotFoundError } from "@/utils/app-error";
import { CLAIM_STATUS, COUPON_STATUS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

/**
 * Claim a coupon — creates a bookmark/save for the user.
 * Prevents duplicate claims via unique index on {userId, couponId}.
 *
 * @param {string} userId - Better Auth user ID
 * @param {string} couponId
 */
export async function claimCoupon(userId, couponId) {
  const coupon = await Coupon.findOne({
    _id: couponId,
    status: COUPON_STATUS.ACTIVE,
    $or: [{ expiresAt: { $gt: new Date() } }, { endDate: { $gt: new Date() } }],
  }).lean();

  if (!coupon) throw new NotFoundError("Coupon");

  // Check claim limit
  if (coupon.maxClaims && coupon.totalClaims >= coupon.maxClaims) {
    throw new AppError(
      "This coupon has reached its claim limit",
      400,
      "CLAIM_LIMIT_REACHED",
    );
  }

  // Check if user already claimed this coupon
  const existingClaim = await Claim.findOne({ userId, couponId: coupon._id })
    .select("_id")
    .lean();
  if (existingClaim) {
    throw new AppError(
      "You have already saved/claimed this coupon",
      400,
      "ALREADY_CLAIMED",
    );
  }

  // Fetch user details from database
  const userCol = mongoose.connection.db?.collection("user");
  let dbUser = null;
  if (userCol) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await userCol.findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { name: 1, email: 1 } },
      );
    }
    if (!dbUser) {
      dbUser = await userCol.findOne(
        { _id: String(userId) },
        { projection: { name: 1, email: 1 } },
      );
    }
  }
  const userName = dbUser?.name || "Customer User";
  const userEmail = dbUser?.email || "";

  // Create the claim — unique index handles duplicate prevention
  const claim = await Claim.create({
    userId,
    couponId: coupon._id,
    merchantId: coupon.merchantId,
    userName,
    userEmail,
  });

  // Fetch Merchant for email details
  const merchant = await Merchant.findById(coupon.merchantId)
    .select("businessName")
    .lean();

  // Trigger Coupon Claimed Email to Customer
  if (userEmail) {
    sendUserCouponClaimedEmail({
      to: userEmail,
      name: userName,
      couponTitle: coupon.title,
      merchantName: merchant?.businessName || "Vouchiqo Partner",
      couponCode: coupon.code,
      discountText:
        coupon.discountType === "percentage"
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`,
      validTill: coupon.expiresAt,
    }).catch((err) =>
      logger.error(
        { err, userId, couponId },
        "Coupon claimed email dispatch error",
      ),
    );
  }

  // Increment claim counters atomically (coupon + merchant)
  await Promise.all([
    Coupon.findByIdAndUpdate(couponId, { $inc: { totalClaims: 1 } }),
    Merchant.findByIdAndUpdate(coupon.merchantId, {
      $inc: { totalClaims: 1 },
    }),
  ]);

  return claim;
}

/**
 * Get all claims for a user (their saved coupons).
 *
 * @param {string} userId
 * @param {URLSearchParams} searchParams
 */
export async function getUserClaims(userId, searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") ?? CLAIM_STATUS.ACTIVE;

  const filter = { userId, status };

  const [claims, total] = await Promise.all([
    Claim.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "couponId",
        },
      },
      { $unwind: { path: "$couponId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "merchants",
          localField: "couponId.merchantId",
          foreignField: "_id",
          as: "couponId.merchantId",
        },
      },
      {
        $unwind: {
          path: "$couponId.merchantId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "couponId._id": 1,
          "couponId.title": 1,
          "couponId.discountValue": 1,
          "couponId.discountType": 1,
          "couponId.description": 1,
          "couponId.expiresAt": 1,
          "couponId.successRate": 1,
          "couponId.isMerchantVerified": 1,
          "couponId.isVouchiqoVerified": 1,
          "couponId.workedToday": 1,
          "couponId.merchantId._id": 1,
          "couponId.merchantId.businessName": 1,
          "couponId.merchantId.slug": 1,
          "couponId.merchantId.logo": 1,
        },
      },
    ]),
    Claim.countDocuments(filter),
  ]);

  return { claims, meta: buildMeta(total, page, limit) };
}

/**
 * Remove a saved coupon (delete the claim).
 *
 * @param {string} claimId
 * @param {string} userId
 */
export async function removeClaim(claimId, userId) {
  const claim = await Claim.findOneAndDelete({
    _id: claimId,
    userId,
    status: CLAIM_STATUS.ACTIVE, // Can't remove already-redeemed claims
  });

  if (!claim) throw new NotFoundError("Claim");

  await Coupon.findByIdAndUpdate(claim.couponId, { $inc: { totalClaims: -1 } });
}

/**
 * Get all claims for a merchant (users who have claimed/saved their coupons).
 *
 * @param {string} merchantId - MongoDB Merchant ID
 * @param {URLSearchParams} searchParams
 */
export async function getMerchantClaims(merchantId, searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const [claims, total] = await Promise.all([
    Claim.aggregate([
      { $match: { merchantId: new mongoose.Types.ObjectId(merchantId) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "coupon",
        },
      },
      { $unwind: { path: "$coupon", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          userName: { $ifNull: ["$userName", "Customer User"] },
          userEmail: { $ifNull: ["$userEmail", ""] },
          status: 1,
          createdAt: 1,
          coupon: {
            _id: "$coupon._id",
            title: "$coupon.title",
            code: "$coupon.code",
            discountType: "$coupon.discountType",
            discountValue: "$coupon.discountValue",
          },
        },
      },
    ]),
    Claim.countDocuments({ merchantId }),
  ]);

  return { claims, meta: buildMeta(total, page, limit) };
}
