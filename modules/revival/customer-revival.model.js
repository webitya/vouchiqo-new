import mongoose, { Schema } from "mongoose";

/**
 * CustomerRevival model.
 * Stores coupon revival requests submitted by customers/visitors.
 * Captures in-depth competitive intelligence and routes to appropriate queue (Category A/B/C).
 *
 * Collection: customer_revivals
 */
const customerRevivalSchema = new Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
    },

    brandName: {
      type: String,
      required: [true, "Brand/store name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
    },

    whereDidYouFindThisOffer: {
      type: String,
      trim: true,
    },

    merchantWebsite: {
      type: String,
      trim: true,
    },

    merchantCity: {
      type: String,
      trim: true,
      index: true,
    },

    discountType: {
      type: String,
      trim: true,
    },

    discountValue: {
      type: Number,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    whenSeen: {
      type: Date,
    },

    whatBuying: {
      type: String,
      trim: true,
    },

    mobileNumber: {
      type: String,
      trim: true,
    },

    consent: {
      type: Boolean,
      default: false,
    },

    possibleDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },

    category: {
      type: String,
      enum: ["A", "B", "C"],
      index: true,
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    outcomeStatus: {
      type: String,
      enum: [
        "pending",
        "resolved_regenerated",
        "resolved_alternative",
        "declined",
      ],
      default: "pending",
      index: true,
    },

    declineReason: {
      type: String,
      trim: true,
    },

    alternativeOfferId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },

    includeInPublicFeed: {
      type: Boolean,
      default: false,
      index: true,
    },

    needsFollowUp: {
      type: Boolean,
      default: false,
      index: true,
    },

    votes: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "customer_revivals",
  },
);

// Indexes for query speed & duplicate checking
customerRevivalSchema.index({ brandName: 1, code: 1 });
customerRevivalSchema.index({ email: 1, brandName: 1, createdAt: -1 });

const CustomerRevival =
  mongoose.models.CustomerRevival ??
  mongoose.model("CustomerRevival", customerRevivalSchema);

export default CustomerRevival;
