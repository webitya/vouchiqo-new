import mongoose, { Schema } from "mongoose";

/**
 * AffiliateProduct Schema
 * Merchants or admins can list affiliate products with custom affiliate links (e.g., CashKaro, Bitly, EarnKaro).
 *
 * Collection: affiliate_products
 */
const affiliateProductSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: [true, "Merchant reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [140, "Title cannot exceed 140 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price cannot be negative"],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountText: {
      type: String,
      trim: true,
      default: "",
    },
    affiliateUrl: {
      type: String,
      required: [true, "Affiliate link URL is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "affiliate_products",
  }
);

// Calculate discount percentage before saving if pricing is specified
affiliateProductSchema.pre("save", function () {
  if (this.originalPrice && this.discountPrice && this.originalPrice > 0) {
    const savings = this.originalPrice - this.discountPrice;
    this.discountPercentage = Math.max(0, Math.round((savings / this.originalPrice) * 100));
  }
});

affiliateProductSchema.index({ merchantId: 1, status: 1 });
affiliateProductSchema.index({ status: 1, category: 1 });
affiliateProductSchema.index({ status: 1, category: 1, createdAt: -1 });
affiliateProductSchema.index({ status: 1, createdAt: -1 });

const AffiliateProduct = mongoose.models.AffiliateProduct || mongoose.model("AffiliateProduct", affiliateProductSchema);

export default AffiliateProduct;
