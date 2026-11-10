import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true }, // Gateway payment ID or internal UUID
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Payment Details
    amount: { type: Number, required: true }, // In paise (₹1 = 100 paise)
    currency: { type: String, default: "INR" },
    type: {
      type: String,
      enum: ["SUBSCRIPTION", "ADDON", "COMMISSION", "REFUND", "PAYOUT"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "AUTHORIZED",
        "CAPTURED",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ],
      default: "PENDING",
    },

    // Gateway References
    gateway: { type: String, default: "RAZORPAY" },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },

    // Idempotency
    idempotencyKey: { type: String, required: true, unique: true },

    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    description: { type: String },

    // Timestamps
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes
paymentSchema.index({ merchantId: 1, type: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
