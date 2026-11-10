import mongoose, { Schema } from "mongoose";

const campaignSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: true,
    }, // e.g. "flash", "festival", "new-user", "seasonal", "loyalty", "bundle", "revival"
    objective: {
      type: String,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
    },
    subHeadline: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    bannerUrl: {
      type: String,
      trim: true,
    },
    offerDetails: {
      offerType: { type: String },
      discountValue: { type: Number },
      maxCap: { type: Number },
      minOrderValue: { type: Number },
      redemptionLimit: { type: Number },
      code: { type: String, trim: true },
      redemptionInstructions: { type: String },
      termsAndConditions: { type: String },
    },
    timing: {
      startDate: { type: Date },
      endDate: { type: Date },
      hasCountdownTimer: { type: Boolean, default: true },
      hasPreTeaser: { type: Boolean, default: false },
      preTeaserHeadline: { type: String },
    },
    targeting: {
      audience: { type: String, default: "all" },
      targetCity: { type: String },
      addOns: [{ type: String }],
      pushSendTime: { type: Date },
      preferredEmailSubject: { type: String },
    },
    readiness: {
      staffReady: { type: String },
      stockConfirmation: { type: String },
      internalNote: { type: String },
      checkpointsConfirmed: { type: Boolean, default: false },
    },
    couponIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
    settings: {
      homepageSlot: { type: Boolean, default: false },
      pushNotification: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "scheduled", "live", "ended", "rejected"],
      default: "pending_review",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
    collection: "campaigns",
    strict: false,
  },
);

/**
 * Compound Indexes (Engineered per Rule 28 & 29)
 * 1. merchantId + createdAt: Supports merchant dashboard listing and active campaign lookups
 * 2. status + createdAt: Supports admin review queue, moderation facet, and counts
 */
campaignSchema.index({ merchantId: 1, createdAt: -1 });
campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign =
  mongoose.models.Campaign ?? mongoose.model("Campaign", campaignSchema);
export default Campaign;
