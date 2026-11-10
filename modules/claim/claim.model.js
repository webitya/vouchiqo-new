import mongoose, { Schema } from "mongoose";
import { CLAIM_STATUS } from "@/utils/constants";

/**
 * Claim model — represents a customer saving/bookmarking a coupon.
 *
 * One claim per user per coupon (enforced via unique compound index).
 * Status transitions: active → redeemed | active → expired
 *
 * Collection: claims
 */
const claimSchema = new Schema(
  {
    userId: {
      type: String, // Better Auth user ID
      required: true,
      index: true,
    },

    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(CLAIM_STATUS),
      default: CLAIM_STATUS.ACTIVE,
      index: true,
    },

    redeemedAt: { type: Date },
    userName: { type: String },
    userEmail: { type: String },
  },
  {
    timestamps: true,
    collection: "claims",
  },
);

// Prevent duplicate claims for the same user+coupon combination
claimSchema.index({ userId: 1, couponId: 1 }, { unique: true });
claimSchema.index({ userId: 1, status: 1 });

/**
 * Compound Index (Engineered per Rule 28 & 29)
 * Query: getMerchantClaims (Claim.aggregate matching merchantId and sorting by createdAt: -1)
 * Why: Allows IXSCAN on merchant's claims and pipeline sort without in-memory sort or COLLSCAN
 */
claimSchema.index({ merchantId: 1, createdAt: -1 });

const Claim = mongoose.models.Claim ?? mongoose.model("Claim", claimSchema);

export default Claim;
