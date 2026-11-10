import mongoose, { Schema } from "mongoose";

/**
 * AnalyticsEvent model.
 *
 * Daily aggregated event log for time-series charts.
 * Bucket key: { merchantId, couponId, eventType, source, date }
 * Allows atomic $inc operations without growing arrays or scanning raw logs.
 *
 * Collection: analytics_events
 */
const analyticsEventSchema = new Schema(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      index: true,
    },

    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "impression",
        "click",
        "copy_code",
        "store_view",
        "banner_click",
        "unique_code_gen",
        "redemption",
      ],
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ["homepage", "category", "search", "direct", "campaign", "other"],
      default: "direct",
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "analytics_events",
  },
);

// Compound index for bucket upserting and fast range aggregations
analyticsEventSchema.index(
  { merchantId: 1, eventType: 1, date: 1, couponId: 1, source: 1 },
  { unique: true },
);

const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ??
  mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
