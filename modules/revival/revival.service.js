import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import Revival from "@/modules/revival/revival.model";
import { AppError, ForbiddenError, NotFoundError } from "@/utils/app-error";
import { COUPON_STATUS, REVIVAL_STATUS } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

/**
 * Request a revival for an expired coupon.
 * Merchant must own the coupon.
 *
 * @param {string} authId
 * @param {object} data - Validated revival data
 */
export async function requestRevival(authId, data) {
  const merchant = await Merchant.findOne({ authId }).lean();
  if (!merchant) throw new ForbiddenError("Merchant profile not found");

  const coupon = await Coupon.findOne({
    _id: data.couponId,
    merchantId: merchant._id,
    status: COUPON_STATUS.EXPIRED,
  }).lean();

  if (!coupon) {
    throw new AppError(
      "Coupon not found or is not expired",
      400,
      "INVALID_COUPON",
    );
  }

  // Check for pending revival request already
  const existing = await Revival.findOne({
    couponId: data.couponId,
    status: REVIVAL_STATUS.PENDING,
  });

  if (existing) {
    throw new AppError(
      "A revival request is already pending for this coupon",
      409,
      "REVIVAL_PENDING",
    );
  }

  const revival = await Revival.create({
    merchantId: merchant._id,
    couponId: data.couponId,
    requestedBy: authId,
    reason: data.reason,
    newExpiresAt: new Date(data.newExpiresAt),
  });

  return revival;
}

/**
 * Admin: list all revival requests.
 *
 * @param {URLSearchParams} searchParams
 */
export async function listRevivals(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const statusParam = searchParams.get("status");

  const filter = {};
  if (statusParam && statusParam !== "all") {
    filter.status = statusParam;
  }

  const [revivals, total] = await Promise.all([
    Revival.find(filter)
      .populate("couponId", "title code category expiresAt")
      .populate("merchantId", "businessName slug plan")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Revival.countDocuments(filter),
  ]);

  return { revivals, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: approve or reject a revival request.
 *
 * @param {string} revivalId
 * @param {string} adminAuthId
 * @param {"approved" | "rejected"} status
 * @param {string} [reviewNote]
 */
export async function reviewRevival(
  revivalId,
  adminAuthId,
  status,
  reviewNote,
) {
  const revival = await Revival.findOne({
    _id: revivalId,
    status: REVIVAL_STATUS.PENDING,
  });

  if (!revival) throw new NotFoundError("Revival request");

  revival.status = status;
  revival.reviewedBy = adminAuthId;
  revival.reviewedAt = new Date();
  if (reviewNote) revival.reviewNote = reviewNote;
  await revival.save();

  // If approved, re-activate the coupon with the new expiry date
  if (status === REVIVAL_STATUS.APPROVED) {
    await Coupon.findByIdAndUpdate(revival.couponId, {
      $set: {
        status: COUPON_STATUS.ACTIVE,
        expiresAt: revival.newExpiresAt,
      },
    });
  }

  return revival;
}
