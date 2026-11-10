import mongoose, { Schema } from "mongoose";

/**
 * Redemption model — the actual use of a coupon at a merchant.
 *
 * Created when a customer redeems a claim.
 * Stores the discount snapshot so history is accurate even if the coupon changes.
 *
 * Collection: redemptions
 */
const redemptionSchema = new Schema(
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
      index: true,
    },

    claimId: {
      type: Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },

    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },

    // Snapshot of coupon at time of redemption
    couponCode: { type: String, required: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number },
    originalPrice: { type: Number },

    // Calculated savings
    savingsAmount: { type: Number, default: 0 },
    userName: { type: String },
    userEmail: { type: String },
  },
  {
    timestamps: true,
    collection: "redemptions",
  },
);

redemptionSchema.index({ userId: 1, createdAt: -1 });
redemptionSchema.index({ merchantId: 1, createdAt: -1 });

const Redemption =
  mongoose.models.Redemption ?? mongoose.model("Redemption", redemptionSchema);

export default Redemption;
