import mongoose, { Schema } from "mongoose";
import { REVIVAL_STATUS } from "@/utils/constants";

/**
 * Revival model — request to bring back an expired coupon.
 *
 * Merchants can request revival of expired coupons.
 * Admin reviews and approves/rejects.
 *
 * Collection: revivals
 */
const revivalSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },

    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    requestedBy: {
      type: String, // Better Auth user ID of the merchant
      required: true,
    },

    reason: {
      type: String,
      required: [true, "Reason for revival is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },

    newExpiresAt: {
      type: Date,
      required: [true, "New expiry date is required"],
    },

    status: {
      type: String,
      enum: Object.values(REVIVAL_STATUS),
      default: REVIVAL_STATUS.PENDING,
      index: true,
    },

    // Admin review details
    reviewedBy: { type: String }, // Better Auth user ID of admin
    reviewedAt: { type: Date },
    reviewNote: { type: String, maxlength: 300 },
  },
  {
    timestamps: true,
    collection: "revivals",
  },
);

const Revival =
  mongoose.models.Revival ?? mongoose.model("Revival", revivalSchema);

export default Revival;
