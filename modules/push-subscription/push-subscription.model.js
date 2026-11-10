import mongoose, { Schema } from "mongoose";

/**
 * PushSubscription model.
 *
 * Stores FCM device registration tokens for web push notifications.
 * Separate from the in-app Notification model.
 *
 * Collection: push_subscriptions
 */
const pushSubscriptionSchema = new Schema(
  {
    /** FCM device registration token — unique per device/browser */
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /** Better-auth user ID — null for anonymous/guest visitors */
    userId: {
      type: String,
      default: null,
      index: true,
    },

    /** Browser/device metadata for filtering and diagnostics */
    deviceInfo: {
      browser: { type: String, default: "Unknown" },
      platform: { type: String, default: "Unknown" },
      userAgent: { type: String, default: "" },
    },

    /** Subscription lifecycle status */
    status: {
      type: String,
      enum: ["active", "unsubscribed", "revoked"],
      default: "active",
      index: true,
    },

    /** Last time this token successfully received a push */
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "push_subscriptions",
  },
);

pushSubscriptionSchema.index({ status: 1, userId: 1 });
pushSubscriptionSchema.index({ status: 1, createdAt: -1 });

const PushSubscription =
  mongoose.models.PushSubscription ??
  mongoose.model("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
