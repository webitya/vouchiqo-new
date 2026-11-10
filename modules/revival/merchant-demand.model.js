import mongoose, { Schema } from "mongoose";

/**
 * MerchantDemand model.
 * Stores de-duplicated demand signal metrics for unlisted and churned merchants.
 * Used to power the internal Merchant Demand Intelligence report/leads pipeline.
 *
 * Collection: merchant_demands
 */
const merchantDemandSchema = new Schema(
  {
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      unique: true, // Keyed by case-insensitive, whitespace-normalized brand name
    },

    status: {
      type: String,
      enum: ["never_listed", "previously_listed"],
      default: "never_listed",
      index: true,
    },

    category: {
      type: String,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      trim: true,
      index: true,
    },

    submissionCount: {
      type: Number,
      default: 1,
      index: true,
    },

    sourcePlatforms: [
      {
        type: String,
        trim: true,
      },
    ],

    firstSeen: {
      type: Date,
      default: Date.now,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    sampleOffers: [
      {
        discountType: { type: String },
        description: { type: String },
      },
    ],

    outreachStatus: {
      type: String,
      enum: [
        "not_contacted",
        "contacted",
        "awaiting_response",
        "declined",
        "converted",
      ],
      default: "not_contacted",
      index: true,
    },

    doNotContact: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "merchant_demands",
  },
);

const MerchantDemand =
  mongoose.models.MerchantDemand ??
  mongoose.model("MerchantDemand", merchantDemandSchema);

export default MerchantDemand;
