import mongoose, { Schema } from "mongoose";
import {
  COUPON_CATEGORIES,
  COUPON_STATUS,
  DISCOUNT_TYPE,
  normalizeCategory,
} from "@/utils/constants";

/**
 * Coupon model.
 *
 * Central entity in the platform. Merchants create coupons.
 * Customers browse, claim, and redeem them.
 *
 * Denormalized counters (totalClaims, totalRedemptions, viewCount)
 * are updated atomically with $inc — avoids extra queries.
 *
 * Collection: coupons
 */
const couponSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    code: {
      type: String,
      required: [true, "Coupon code is required"],
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: true,
    },

    discountValue: { type: Number, min: 0 },

    originalPrice: { type: Number, min: 0 },

    category: {
      type: String,
      enum: COUPON_CATEGORIES,
      required: true,
      index: true,
      set: (val) => normalizeCategory(val),
    },

    tags: [{ type: String, maxlength: 30 }],

    image: { type: String }, // Cloudinary URL

    status: {
      type: String,
      enum: ["pending", "active", "paused", "expired", "deleted"],
      default: COUPON_STATUS.PENDING,
      index: true,
    },

    // Limits — null means unlimited
    maxClaims: { type: Number, default: null },
    maxRedemptions: { type: Number, default: null },

    // Atomic counters
    totalClaims: { type: Number, default: 0 },
    totalRedemptions: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
    copyCodeCount: { type: Number, default: 0 },
    uniqueCodeGenCount: { type: Number, default: 0 },

    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: true,
    },

    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      isOnline: { type: Boolean, default: false },
    },

    // Admin-controlled flags
    isFeatured: { type: Boolean, default: false, index: true },
    isHot: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false, index: true },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
    collection: "coupons",
    strict: false,
  },
);

// Compound indexes for common query patterns
couponSchema.index({ status: 1, category: 1, expiresAt: 1 });
couponSchema.index({ merchantId: 1, status: 1, expiresAt: 1 });
couponSchema.index({ status: 1, expiresAt: 1 });
couponSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });
couponSchema.index({
  isHot: 1,
  isVerified: 1,
  status: 1,
  expiresAt: 1,
  totalClaims: -1,
});
couponSchema.index({ category: 1, status: 1, expiresAt: 1 });
couponSchema.index({ merchantId: 1, status: 1 });
couponSchema.index({ isFeatured: 1, status: 1 });
couponSchema.index({ status: 1, isVerified: 1, createdAt: -1 });
couponSchema.index({ isHot: 1, status: 1 });
couponSchema.index({ "location.city": 1, status: 1 });

// Text index for search
couponSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 } },
);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
