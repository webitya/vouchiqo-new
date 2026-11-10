import mongoose from "mongoose";
import { acquireLock, releaseLock } from "@/modules/auth/auth.middleware";
import Claim from "@/modules/claim/claim.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import Redemption from "@/modules/redemption/redemption.model";
import UserProfile from "@/modules/user/user.model";
import { sendMerchantRedemptionNotificationEmail } from "@/lib/email/merchant-email";
import { sendUserCouponRedeemedEmail } from "@/lib/email/user-email";
import { AppError, NotFoundError } from "@/utils/app-error";
import { CLAIM_STATUS, COUPON_STATUS, REDIS_KEYS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

/**
 * Redeem a coupon.
 *
 * Flow:
 * 1. Acquire Redis lock (prevent concurrent double-redemptions)
 * 2. Validate claim and coupon
 * 3. Create redemption record
 * 4. Update counters and claim status atomically
 * 5. Release lock
 *
 * @param {string} userId
 * @param {string} claimId
 * @param {string} couponId
 */
export async function redeemCoupon(userId, claimId, couponId) {
  const lockKey = REDIS_KEYS.redeemLock(couponId, userId);
  const locked = await acquireLock(lockKey);

  if (!locked) {
    throw new AppError(
      "Redemption already in progress. Please wait.",
      409,
      "LOCK_CONFLICT",
    );
  }

  try {
    const claim = await Claim.findOne({
      _id: claimId,
      userId,
      couponId,
      status: CLAIM_STATUS.ACTIVE,
    });

    if (!claim) throw new NotFoundError("Active claim");

    const coupon = await Coupon.findOne({
      _id: couponId,
      status: COUPON_STATUS.ACTIVE,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { endDate: { $gt: new Date() } },
      ],
    }).lean();

    if (!coupon)
      throw new AppError("Coupon is no longer valid", 400, "COUPON_INVALID");

    // Check redemption limit
    if (
      coupon.maxRedemptions &&
      coupon.totalRedemptions >= coupon.maxRedemptions
    ) {
      throw new AppError(
        "Redemption limit reached for this coupon",
        400,
        "REDEMPTION_LIMIT_REACHED",
      );
    }

    // Calculate savings amount
    const savingsAmount = calculateSavings(coupon);

    // Fetch user details from database
    const dbUser = await mongoose.connection.db
      .collection("user")
      .findOne({ _id: new mongoose.Types.ObjectId(userId) });
    const userName = dbUser?.name || "Customer User";
    const userEmail = dbUser?.email || "";

    // Create redemption record
    const redemption = await Redemption.create({
      userId,
      couponId: coupon._id,
      claimId: claim._id,
      merchantId: coupon.merchantId,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalPrice: coupon.originalPrice,
      savingsAmount,
      userName,
      userEmail,
    });

    // Update claim → redeemed
    claim.status = CLAIM_STATUS.REDEEMED;
    claim.redeemedAt = new Date();
    await claim.save();

    // Fetch merchant details for notifications
    const merchant = await Merchant.findById(coupon.merchantId).lean();

    // Trigger Customer Savings Email Notification
    if (userEmail) {
      sendUserCouponRedeemedEmail({
        to: userEmail,
        name: userName,
        couponTitle: coupon.title,
        merchantName: merchant?.businessName || "Merchant Store",
        savingsAmount,
        storeAddress: merchant?.location?.address || "",
      }).catch((err) => console.error("[User Redemption Email Error]:", err));
    }

    // Trigger Merchant Instant Redemption Email Notification
    const merchantEmail = merchant?.contactEmail;
    if (merchantEmail) {
      sendMerchantRedemptionNotificationEmail({
        to: merchantEmail,
        businessName: merchant.businessName,
        offerTitle: coupon.title,
        customerName: userName,
        savingsGiven: savingsAmount,
      }).catch((err) =>
        console.error("[Merchant Redemption Email Error]:", err),
      );
    }

    // Increment counters atomically
    await Promise.all([
      Coupon.findByIdAndUpdate(couponId, { $inc: { totalRedemptions: 1 } }),
      Merchant.findByIdAndUpdate(coupon.merchantId, {
        $inc: { totalRedemptions: 1 },
      }),
      UserProfile.findOneAndUpdate(
        { authId: userId },
        { $inc: { totalSavings: savingsAmount } },
        { upsert: true },
      ),
    ]);

    return redemption;
  } finally {
    await releaseLock(lockKey);
  }
}

/**
 * Get a user's redemption history.
 *
 * @param {string} userId
 * @param {URLSearchParams} searchParams
 */
export async function getUserRedemptions(userId, searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const [redemptions, total] = await Promise.all([
    Redemption.aggregate([
      { $match: { userId } },
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
          localField: "merchantId",
          foreignField: "_id",
          as: "merchantId",
        },
      },
      { $unwind: { path: "$merchantId", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          couponCode: 1,
          discountType: 1,
          discountValue: 1,
          originalPrice: 1,
          savingsAmount: 1,
          createdAt: 1,
          "couponId._id": 1,
          "couponId.title": 1,
          "couponId.image": 1,
          "couponId.category": 1,
          "merchantId._id": 1,
          "merchantId.businessName": 1,
          "merchantId.slug": 1,
          "merchantId.logo": 1,
        },
      },
    ]),
    Redemption.countDocuments({ userId }),
  ]);

  return { redemptions, meta: buildMeta(total, page, limit) };
}

/**
 * Get a merchant's redemption history (coupons redeemed at this merchant).
 *
 * @param {string} merchantId - MongoDB Merchant ID
 * @param {URLSearchParams} searchParams
 */
export async function getMerchantRedemptions(merchantId, searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const [redemptions, total] = await Promise.all([
    Redemption.aggregate([
      { $match: { merchantId } },
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
          from: "user",
          let: { userIdStr: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$userIdStr"] },
                    { $eq: [{ $toString: "$_id" }, "$userIdStr"] },
                  ],
                },
              },
            },
          ],
          as: "userProfile",
        },
      },
      { $unwind: { path: "$userProfile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: {
            _id: { $ifNull: ["$userProfile._id", "$userId"] },
            name: {
              $ifNull: ["$userProfile.name", "$userName", "Customer User"],
            },
            email: { $ifNull: ["$userProfile.email", "$userEmail", ""] },
            image: "$userProfile.image",
          },
          couponCode: 1,
          discountType: 1,
          discountValue: 1,
          originalPrice: 1,
          savingsAmount: 1,
          createdAt: 1,
          couponId: {
            _id: "$couponId._id",
            title: "$couponId.title",
            image: "$couponId.image",
          },
        },
      },
    ]),
    Redemption.countDocuments({ merchantId }),
  ]);

  return { redemptions, meta: buildMeta(total, page, limit) };
}

/**
 * Get a single redemption by ID. Only the owner can view it.
 *
 * @param {string} redemptionId
 * @param {string} userId
 */
export async function getRedemptionById(redemptionId, userId) {
  const redemption = await Redemption.findOne({ _id: redemptionId, userId })
    .populate("couponId", "title image category code")
    .populate("merchantId", "businessName slug logo")
    .lean();

  if (!redemption) throw new NotFoundError("Redemption");
  return redemption;
}

// ─────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────

function calculateSavings(coupon) {
  if (
    coupon.discountType === "percentage" &&
    coupon.originalPrice &&
    coupon.discountValue
  ) {
    return (coupon.originalPrice * coupon.discountValue) / 100;
  }
  if (coupon.discountType === "fixed" && coupon.discountValue) {
    return coupon.discountValue;
  }
  return 0;
}

/**
 * Get aggregated customer savings analytics.
 *
 * @param {string} userId
 */
export async function getSavingsAnalytics(userId) {
  // 1. Fetch all redemptions sorted chronologically for milestones
  const allRedemptions = await Redemption.find({ userId })
    .populate("couponId", "title category image")
    .populate("merchantId", "businessName logo slug")
    .sort({ createdAt: 1 })
    .lean();

  // Calculate lifetime totals
  let totalSavedAllTime = 0;
  let totalSpentAllTime = 0;
  let totalSavedMonth = 0;
  let totalSpentMonth = 0;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  for (const r of allRedemptions) {
    const saved = r.savingsAmount || 0;
    const spent = r.originalPrice > saved ? r.originalPrice - saved : saved * 2; // 50% discount fallback

    totalSavedAllTime += saved;
    totalSpentAllTime += spent;

    const rDate = new Date(r.createdAt);
    if (
      rDate.getFullYear() === currentYear &&
      rDate.getMonth() === currentMonth
    ) {
      totalSavedMonth += saved;
      totalSpentMonth += spent;
    }
  }

  const savingsRate =
    totalSpentAllTime > 0
      ? Math.round((totalSavedAllTime / totalSpentAllTime) * 100)
      : 0;

  // 2. Generate 12-month timeline array
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const timeline = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mIndex = d.getMonth();
    const year = d.getFullYear();

    timeline.push({
      label: `${months[mIndex]} ${year}`,
      year,
      month: mIndex,
      saved: 0,
      spent: 0,
      count: 0,
    });
  }

  for (const r of allRedemptions) {
    const rDate = new Date(r.createdAt);
    const rYear = rDate.getFullYear();
    const rMonth = rDate.getMonth();

    const entry = timeline.find((t) => t.year === rYear && t.month === rMonth);
    if (entry) {
      const saved = r.savingsAmount || 0;
      const spent =
        r.originalPrice > saved ? r.originalPrice - saved : saved * 2;

      entry.saved += saved;
      entry.spent += spent;
      entry.count += 1;
    }
  }

  // 3. Category breakdown
  const categoryMap = {};
  for (const r of allRedemptions) {
    const categoryRaw = r.couponId?.category || "Other";
    const category = categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1);

    categoryMap[category] =
      (categoryMap[category] || 0) + (r.savingsAmount || 0);
  }

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, saved]) => ({
      category,
      saved,
      pct:
        totalSavedAllTime > 0
          ? Math.round((saved / totalSavedAllTime) * 100)
          : 0,
    }))
    .sort((a, b) => b.saved - a.saved);

  // 4. Brand breakdown
  const brandMap = {};
  for (const r of allRedemptions) {
    const brandName = r.merchantId?.businessName || "Unknown Brand";
    const brandLogo = r.merchantId?.logo || "";

    if (!brandMap[brandName]) {
      brandMap[brandName] = {
        brand: brandName,
        logo: brandLogo,
        claims: 0,
        saved: 0,
      };
    }
    brandMap[brandName].claims += 1;
    brandMap[brandName].saved += r.savingsAmount || 0;
  }

  const brandBreakdown = Object.values(brandMap)
    .sort((a, b) => b.saved - a.saved)
    .slice(0, 5)
    .map((b) => ({
      ...b,
      saved: `₹${b.saved.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }));

  // 5. Milestones check
  const thresholds = [
    { id: "m1", title: "First Saving ₹50+", value: 50 },
    { id: "m2", title: "₹500 Saved", value: 500 },
    { id: "m3", title: "₹1,000 Saved", value: 1000 },
    { id: "m4", title: "₹5,000 Saved", value: 5000 },
    { id: "m5", title: "₹10,000 Saved", value: 10000 },
  ];

  let cumulative = 0;
  const milestones = thresholds.map((t) => {
    let achieved = false;
    let achievedAt = null;

    cumulative = 0;
    for (const r of allRedemptions) {
      cumulative += r.savingsAmount || 0;
      if (cumulative >= t.value) {
        achieved = true;
        achievedAt = r.createdAt;
        break;
      }
    }

    return {
      id: t.id,
      title: t.title,
      threshold: t.value,
      achieved,
      achievedAt,
    };
  });

  // Recent transactions list (reverse chronological)
  const recentTransactions = [...allRedemptions].reverse().map((r) => ({
    _id: r._id,
    date: new Date(r.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    brand: r.merchantId?.businessName || "Unknown Brand",
    code: r.couponCode,
    originalPrice: r.originalPrice
      ? `₹${r.originalPrice.toLocaleString("en-IN")}`
      : "—",
    discountApplied:
      r.discountType === "percentage"
        ? `${r.discountValue}% OFF`
        : `₹${r.discountValue} OFF`,
    amountPaid: r.originalPrice
      ? `₹${(r.originalPrice - r.savingsAmount).toLocaleString("en-IN")}`
      : "—",
    amountSaved: `₹${r.savingsAmount.toLocaleString("en-IN")}`,
    category: r.couponId?.category
      ? r.couponId.category.charAt(0).toUpperCase() +
        r.couponId.category.slice(1)
      : "Other",
  }));

  return {
    kpis: {
      totalSavedMonth,
      totalSavedAllTime,
      totalSpentAllTime,
      savingsRate,
      couponUses: allRedemptions.length,
    },
    timeline,
    categoryBreakdown,
    brandBreakdown,
    milestones,
    recentTransactions,
  };
}
