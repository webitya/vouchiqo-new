import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    gatewayPaymentMethodId: { type: String, required: true },

    last4: { type: String, required: true },
    brand: {
      type: String,
      enum: ["VISA", "MASTERCARD", "AMEX", "RUPEE", "UNKNOWN"],
    },
    expMonth: { type: String },
    expYear: { type: String },
    country: { type: String },

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes
paymentMethodSchema.index({ merchantId: 1 });
paymentMethodSchema.index({ merchantId: 1, isDefault: 1 });

export const PaymentMethod =
  mongoose.models.PaymentMethod ||
  mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;
