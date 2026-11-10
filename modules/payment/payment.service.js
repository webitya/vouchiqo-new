import { paymentConfig } from "@/lib/payment-config";
import {
  createRazorpayOrder,
  getRazorpayInstance,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { validatePaymentAmount } from "@/utils/payment-utils";
import { IdempotencyService } from "./idempotency.service";
import { PaymentStateService } from "./payment-state.service";
import Payment from "./payment.model";
import { RefundService } from "./refund.service";

export class PaymentService {
  /**
   * Create a payment order with idempotency check & Redis state caching
   */
  static async createOrder({
    merchantId,
    amount, // In paise
    currency = "INR",
    type = "ADDON",
    description,
    metadata = {},
    idempotencyKey,
  }) {
    validatePaymentAmount(amount);

    // Check or create intent with sub-millisecond Redis cache
    let intent = await IdempotencyService.getIntent(idempotencyKey, merchantId);

    if (!intent) {
      intent = await IdempotencyService.createIntent({
        idempotencyKey,
        merchantId,
        amount,
        currency,
        type,
        metadata,
      });
    }

    if (intent.status === "COMPLETED" && intent.paymentId) {
      const payment = await Payment.findById(intent.paymentId);
      return { payment, intent, isDuplicate: true };
    }

    let razorpayOrder;
    if (intent.gatewayOrderId) {
      razorpayOrder = { id: intent.gatewayOrderId, amount, currency };
    } else {
      const receipt = `rcpt_${idempotencyKey.slice(-10)}_${Date.now().toString().slice(-6)}`;
      razorpayOrder = await createRazorpayOrder({
        amount: intent.amount,
        currency: intent.currency,
        receipt,
        notes: {
          merchantId: merchantId.toString(),
          idempotencyKey: intent.idempotencyKey,
          type: intent.type,
          ...metadata,
        },
        passesInPaise: true,
      });

      intent.gatewayOrderId = razorpayOrder.id;
      await intent.save();
    }

    let payment = await Payment.findOne({
      idempotencyKey: intent.idempotencyKey,
    });
    if (!payment) {
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      payment = new Payment({
        paymentId,
        merchantId,
        amount: intent.amount,
        currency: intent.currency,
        type: intent.type,
        gateway: "RAZORPAY",
        gatewayOrderId: razorpayOrder.id,
        idempotencyKey: intent.idempotencyKey,
        description: description || `Payment for ${intent.type}`,
        metadata,
        status: "PENDING",
      });
      await payment.save();
    }

    // Set live payment transaction state in Redis
    await PaymentStateService.setState(razorpayOrder.id, {
      status: "PENDING",
      amount: intent.amount,
      type: intent.type,
      merchantId: merchantId.toString(),
      paymentId: payment._id.toString(),
    });

    return {
      order: razorpayOrder,
      payment,
      intent,
      isDuplicate: false,
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  static verifySignature({ orderId, paymentId, signature }) {
    return verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });
  }

  /**
   * Capture manual payment via Razorpay SDK with Redis distributed locking
   */
  static async capturePayment(orderId, paymentId, amount) {
    // Acquire Redis distributed lock (30s)
    const locked = await PaymentStateService.acquireLock(orderId);
    if (!locked) {
      console.log(
        `[Redis Lock] Order ${orderId} is currently processing elsewhere`,
      );
    }

    try {
      const rzp = getRazorpayInstance();
      const capturedPayment = await rzp.payments.capture(paymentId, amount);

      const paymentRecord = await Payment.findOne({ gatewayOrderId: orderId });
      if (paymentRecord) {
        paymentRecord.status = "CAPTURED";
        paymentRecord.gatewayPaymentId = paymentId;
        paymentRecord.paidAt = new Date();
        await paymentRecord.save();

        await IdempotencyService.completeIntent(
          paymentRecord.idempotencyKey,
          paymentRecord._id,
        );

        // Update live state in Redis
        await PaymentStateService.setState(orderId, {
          status: "CAPTURED",
          gatewayPaymentId: paymentId,
          paidAt: paymentRecord.paidAt,
        });
      }

      return capturedPayment;
    } catch (error) {
      console.error("Payment capture failed:", error);
      throw error;
    } finally {
      await PaymentStateService.releaseLock(orderId);
    }
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId, merchantId) {
    const query = { _id: paymentId };
    if (merchantId) query.merchantId = merchantId;

    const payment = await Payment.findOne(query);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    return payment;
  }

  /**
   * Get payment history with filtering & pagination
   */
  static async getPaymentHistory({
    merchantId,
    type,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  }) {
    const query = {};
    if (merchantId) query.merchantId = merchantId;
    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Initiate refund
   */
  static async refundPayment(paymentId, merchantId, amount, reason) {
    const result = await RefundService.processRefund({
      paymentId,
      merchantId,
      amount,
      reason,
    });

    if (result.payment?.gatewayOrderId) {
      await PaymentStateService.setState(result.payment.gatewayOrderId, {
        status: result.payment.status,
        refundedAt: result.payment.refundedAt,
      });
    }

    return result;
  }
}

export default PaymentService;
