import mongoose, { Schema } from "mongoose";
import { ROLES } from "../../utils/constants.js";

/**
 * User Profile model.
 *
 * Better Auth manages authentication (sign-up, sign-in, sessions) in its own
 * `user` collection. This model stores application-specific user data linked
 * by the Better Auth user ID.
 *
 * Collection: user_profiles
 */
const userProfileSchema = new Schema(
  {
    // Links to Better Auth's user.id
    authId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },

    // Coupons the user has bookmarked/saved (via Claims)
    savedCoupons: [{ type: Schema.Types.ObjectId, ref: "Coupon" }],

    // Merchants the user follows
    followedMerchants: [{ type: Schema.Types.ObjectId, ref: "Merchant" }],

    // User's shopping interest categories
    interests: [{ type: String }],

    gender: {
      type: String,
      enum: ["men", "women", "not_preferred"],
      default: null,
    },

    isOnboarded: {
      type: Boolean,
      default: false,
      index: true,
    },

    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    // Notification settings
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    expiryAlerts: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
    totalSavings: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    lastWelcomeEmailSentAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "user_profiles",
  },
);

// Avoid mongoose model re-registration during HMR
const UserProfile =
  mongoose.models.UserProfile ??
  mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;
