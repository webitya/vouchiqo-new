import mongoose from "mongoose";

const paymentIntentSchema = new mongoose.Schema(
  {
    idempotencyKey: { type: String, required: true, unique: true },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    // Request Data
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    type: {
      type: String,
      enum: ["SUBSCRIPTION", "ADDON", "COMMISSION"],
      required: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed },

    // Status
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "EXPIRED"],
      default: "PENDING",
    },

    // Gateway Reference
    gatewayOrderId: { type: String },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    // Expiry (30 minutes)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
  },
  { timestamps: true },
);

// Indexes
paymentIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PaymentIntent =
  mongoose.models.PaymentIntent ||
  mongoose.model("PaymentIntent", paymentIntentSchema);
export default PaymentIntent;
