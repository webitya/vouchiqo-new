import mongoose, { Schema } from "mongoose";

/**
 * Feedback model for process-based milestone reviews (e.g. Profile Completion,
 * Onboarding Wizard, First Coupon Creation).
 *
 * Collection: feedbacks
 */
const feedbackSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      index: true,
      default: null,
    },
    authId: {
      type: String,
      required: true,
      index: true,
    },
    merchantName: {
      type: String,
      trim: true,
      default: "",
    },
    merchantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    processType: {
      type: String,
      enum: [
        "profile_completion",
        "onboarding_wizard",
        "first_coupon",
        "general",
      ],
      default: "profile_completion",
      index: true,
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    scaleScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    selectedTags: {
      type: [String],
      default: [],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
    profileHealthAtSubmission: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  },
);

feedbackSchema.index({ authId: 1, processType: 1 });

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
export default Feedback;
