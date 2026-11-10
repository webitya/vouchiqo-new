import mongoose, { Schema } from "mongoose";

/**
 * MerchantApplication Schema
 * Collection: merchant_applications
 */
const merchantApplicationSchema = new Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authId: {
      type: String,
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    subCategoryTags: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],

    // Status Flow: "pending" | "under_review" | "document_verified" | "approved" | "rejected"
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "document_verified",
        "approved",
        "rejected",
      ],
      default: "under_review",
    },

    progressPercentage: {
      type: Number,
      default: 33,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    adminIsReviewing: {
      type: Boolean,
      default: true,
    },

    adminReviewerName: {
      type: String,
      default: "Vouchiqo Verification Desk #4",
    },

    estimatedCompletion: {
      type: String,
      default: "Within 2-4 hours",
    },

    activationWindow: {
      type: String,
      default: "Within 2 hours after verification",
    },

    documents: [
      {
        name: { type: String, required: true },
        type: { type: String }, // e.g. "GST Certificate", "PAN Card", "Trade License"
        status: {
          type: String,
          enum: ["verified", "under_review", "pending", "rejected"],
          default: "under_review",
        },
        verifiedAt: { type: Date },
        url: { type: String },
      },
    ],

    timeline: [
      {
        title: { type: String, required: true },
        detail: { type: String },
        timestamp: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["success", "info", "warning", "error"],
          default: "info",
        },
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const MerchantApplication =
  mongoose.models.MerchantApplication ||
  mongoose.model("MerchantApplication", merchantApplicationSchema);

export default MerchantApplication;
