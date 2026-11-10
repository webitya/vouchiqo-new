import mongoose, { Schema } from "mongoose";
import "../merchant/merchant.model.js";

const promoBannerSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    logo: {
      type: String,
    },
    link: {
      type: String,
      trim: true,
      default: "#",
    },
    slot: {
      type: String,
      enum: ["hero", "trending", "popup", "left-hero", "right-promo", "top-right", "bottom-right"],
      required: true,
      index: true,
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    subtitleColor: {
      type: String,
      default: "#fbbf24",
    },
    buttonBgColor: {
      type: String,
      default: "#f59e0b",
    },
    buttonTextColor: {
      type: String,
      default: "#0f172a",
    },
    textPosition: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    overlayOpacity: {
      type: Number,
      default: 70,
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "promo_banners",
  },
);
promoBannerSchema.index({ status: 1, priority: -1, createdAt: -1 });

const PromoBanner =
  mongoose.models.PromoBanner ||
  mongoose.model("PromoBanner", promoBannerSchema);

export default PromoBanner;
