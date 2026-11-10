import { getRazorpayInstance } from "@/lib/razorpay";
import Payment from "./payment.model";

export class RefundService {
  /**
   * Process refund via Razorpay SDK and update Payment record
   */
  static async processRefund({ paymentId, merchantId, amount, reason }) {
    const query = {
      _id: paymentId,
      status: "CAPTURED",
    };
    if (merchantId) {
      query.merchantId = merchantId;
    }
    const payment = await Payment.findOne(query);

    if (!payment) {
      throw new Error("Payment record not found or not in CAPTURED state");
    }

    const refundAmount = amount ? Number(amount) : payment.amount;

    if (refundAmount > payment.amount) {
      throw new Error("Refund amount cannot exceed original payment amount");
    }

    const rzp = getRazorpayInstance();

    try {
      const refund = await rzp.payments.refund(payment.gatewayPaymentId, {
        amount: refundAmount,
        notes: {
          merchantId: merchantId.toString(),
          reason: reason || "Customer requested refund",
        },
      });

      const newStatus =
        refundAmount === payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

      payment.status = newStatus;
      payment.refundedAt = new Date();
      if (!payment.metadata) payment.metadata = {};
      payment.metadata.refundDetails = refund;
      await payment.save();

      return { refund, payment };
    } catch (error) {
      console.error("Refund Service error:", error);
      throw error;
    }
  }
}
