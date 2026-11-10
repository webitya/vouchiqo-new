import mongoose, { Schema } from "mongoose";

/**
 * Notification model.
 *
 * Stores in-app notifications for merchants, customers, and admins.
 *
 * Collection: notifications
 */
const notificationSchema = new Schema(
  {
    userId: {
      type: String, // Better Auth user ID
      required: true,
      index: true,
    },

    type: {
      type: String,
      default: "system",
      index: true,
    },

    category: {
      type: String,
      enum: ["system", "campaign", "billing", "general"],
      default: "system",
    },

    title: {
      type: String,
      required: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    isRead: { type: Boolean, default: false, index: true },

    // Extra context (e.g. couponId, merchantId, campaignId) for deep-linking
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ??
  mongoose.model("Notification", notificationSchema);

export default Notification;
