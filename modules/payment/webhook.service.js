import {
  sendMerchantPaymentCompletedEmail,
  sendMerchantPaymentFailedEmail,
} from "@/lib/email/merchant-email";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import Merchant from "@/modules/merchant/merchant.model";
import { IdempotencyService } from "./idempotency.service";
import { PaymentStateService } from "./payment-state.service";
import Payment from "./payment.model";
import WebhookLog from "./webhook-log.model";

export class WebhookService {
  /**
   * Verify webhook signature helper
   */
  static verifySignature(payload, signature, secret) {
    return verifyRazorpayWebhookSignature(payload, signature, secret);
  }

  /**
   * Process webhook event with log deduplication & Redis state tracking
   */
  static async processWebhook(eventId, eventType, payload, signature, rawBody) {
    if (!signature || typeof signature !== "string") {
      throw new Error("Missing or invalid webhook signature header");
    }

    const existing = await WebhookLog.findOne({ eventId });
    if (existing && existing.processed) {
      return { processed: true, skipped: true, logId: existing._id };
    }

    const payloadToVerify = rawBody || (typeof payload === "string" ? payload : JSON.stringify(payload));
    const isVerified = this.verifySignature(payloadToVerify, signature);

    let log = existing;
    if (!log) {
      log = new WebhookLog({
        eventId,
        eventType,
        payload,
        signature,
        verified: isVerified,
      });
      await log.save();
    }

    if (!isVerified) {
      log.processed = true;
      log.error = "Invalid webhook signature";
      await log.save();
      throw new Error("Invalid webhook signature");
    }

    let result;
    try {
      switch (eventType) {
        case "payment.captured":
          result = await this.handlePaymentCaptured(payload);
          break;
        case "payment.failed":
          result = await this.handlePaymentFailed(payload);
          break;
        case "refund.created":
          result = await this.handleRefundCreated(payload);
          break;
        case "subscription.charged":
          result = await this.handleSubscriptionCharged(payload);
          break;
        case "subscription.activated":
          result = await this.handleSubscriptionActivated(payload);
          break;
        case "subscription.cancelled":
          result = await this.handleSubscriptionCancelled(payload);
          break;
        default:
          result = { message: `Event ${eventType} received and logged` };
      }

      log.processed = true;
      log.processedAt = new Date();
      await log.save();
      return result;
    } catch (err) {
      log.error = err.message || String(err);
      log.attempts = (log.attempts || 0) + 1;
      log.lastAttemptAt = new Date();
      await log.save();
      throw err;
    }
  }

  /**
   * Handle payment.captured event with Redis distributed locking & atomic state update
   */
  static async handlePaymentCaptured(payload) {
    const paymentData =
      payload.payload?.payment?.entity || payload.payment || {};
    const { order_id, id: payment_id, notes, amount } = paymentData;

    if (order_id) {
      await PaymentStateService.acquireLock(order_id);
    }

    try {
      const payment = await Payment.findOne({
        $or: [{ gatewayOrderId: order_id }, { gatewayPaymentId: payment_id }],
      });

      if (!payment) {
        return {
          warning: "No matching payment record found for order",
          order_id,
        };
      }

      // Idempotency: If already CAPTURED, return immediately without duplicate fulfillment
      if (payment.status === "CAPTURED") {
        return {
          success: true,
          alreadyCaptured: true,
          paymentId: payment._id,
        };
      }

      // Atomic transition: Ensure only ONE worker transitions from non-CAPTURED to CAPTURED
      const updatedPayment = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: { $ne: "CAPTURED" },
        },
        {
          $set: {
            status: "CAPTURED",
            gatewayPaymentId: payment_id,
            paidAt: new Date(),
          },
        },
        { new: true },
      );

      // If another concurrent request completed the transition first, exit cleanly
      if (!updatedPayment) {
        return {
          success: true,
          alreadyCaptured: true,
          paymentId: payment._id,
        };
      }

      if (updatedPayment.idempotencyKey) {
        await IdempotencyService.completeIntent(
          updatedPayment.idempotencyKey,
          updatedPayment._id,
        );
      }

      // Update Redis payment state
      if (order_id) {
        await PaymentStateService.setState(order_id, {
          status: "CAPTURED",
          gatewayPaymentId: payment_id,
          paidAt: updatedPayment.paidAt,
        });
      }

      // Authoritative merchant fulfillment
      // Always prioritize metadata stored securely on the Payment record over external notes
      const targetMerchantId = updatedPayment.merchantId || notes?.merchantId;
      if (targetMerchantId) {
        const merchant = await Merchant.findById(targetMerchantId);
        if (merchant) {
          merchant.paymentStatus = "completed";

          const paymentType = updatedPayment.type || updatedPayment.metadata?.type || notes?.type;
          const isSubscription = paymentType === "SUBSCRIPTION" || notes?.type === "subscription";

          if (isSubscription) {
            const plan = updatedPayment.metadata?.plan || notes?.plan || "growth";
            const cycle = updatedPayment.metadata?.cycle || notes?.cycle || "monthly";
            const expiryDays = cycle === "yearly" ? 365 : 30;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + expiryDays);

            merchant.plan = plan;
            merchant.planExpiry = expiryDate;
            merchant.planStartedAt = merchant.planStartedAt || new Date();
            merchant.subscriptionStatus = "active";
            merchant.lastPaymentId = payment_id;
            merchant.lastOrderId = order_id;

            if (plan === "pro") {
              merchant.revivalCredits = (merchant.revivalCredits || 0) + 50;
            } else if (plan === "enterprise") {
              merchant.revivalCredits = 999999;
            }
            await merchant.save();
          } else {
            const addOnId = updatedPayment.metadata?.addOnId || notes?.addOnId;
            if (addOnId === "revival_pack") {
              merchant.revivalCredits = (merchant.revivalCredits || 0) + 25;
            }
            merchant.lastPaymentId = payment_id;
            await merchant.save();
          }

          // Trigger Payment Receipt Email to Merchant
          const targetEmail = merchant.contactEmail || merchant.email;
          if (targetEmail) {
            sendMerchantPaymentCompletedEmail({
              to: targetEmail,
              businessName: merchant.businessName,
              amount: amount || updatedPayment.amount || 0,
              transactionId: payment_id,
              orderId: order_id,
              planName: (updatedPayment.metadata?.plan || notes?.plan || merchant.plan || "growth").toUpperCase(),
              planExpiry: merchant.planExpiry,
            }).catch((err) => console.error("[Webhook Payment Email Error]:", err));
          }
        }
      }

      return { success: true, paymentId: updatedPayment._id };
    } finally {
      if (order_id) {
        await PaymentStateService.releaseLock(order_id);
      }
    }
  }

  /**
   * Handle payment.failed event
   */
  static async handlePaymentFailed(payload) {
    const paymentData =
      payload.payload?.payment?.entity || payload.payment || {};
    const { order_id, error_description } = paymentData;

    const payment = await Payment.findOne({ gatewayOrderId: order_id });
    if (payment) {
      payment.status = "FAILED";
      payment.failedAt = new Date();
      payment.metadata = { ...payment.metadata, error: error_description };
      await payment.save();

      if (payment.idempotencyKey) {
        await IdempotencyService.failIntent(
          payment.idempotencyKey,
          error_description,
        );
      }

      if (order_id) {
        await PaymentStateService.setState(order_id, {
          status: "FAILED",
          error: error_description,
        });
      }

      const merchant = await Merchant.findById(payment.merchantId);
      const failedTargetEmail = merchant?.contactEmail || merchant?.email;
      if (failedTargetEmail) {
        sendMerchantPaymentFailedEmail({
          to: failedTargetEmail,
          businessName: merchant.businessName,
          planName: (payment.metadata?.plan || "subscription").toUpperCase(),
          amount: payment.amount,
          failureReason: error_description,
        }).catch((err) => console.error("[Payment Failed Email Error]:", err));
      }
    }

    return { success: true, order_id };
  }

  /**
   * Handle refund.created event
   */
  static async handleRefundCreated(payload) {
    const refundData = payload.payload?.refund?.entity || payload.refund || {};
    const { payment_id, amount } = refundData;

    const payment = await Payment.findOne({ gatewayPaymentId: payment_id });
    if (payment) {
      const refundAmountPaise = Number(amount);
      const newStatus =
        refundAmountPaise >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

      payment.status = newStatus;
      payment.refundedAt = new Date();
      await payment.save();

      if (payment.gatewayOrderId) {
        await PaymentStateService.setState(payment.gatewayOrderId, {
          status: newStatus,
          refundedAt: payment.refundedAt,
        });
      }
    }

    return { success: true, payment_id };
  }

  /**
   * Handle subscription.charged event
   */
  static async handleSubscriptionCharged(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, payment_id, notes } = subData;

    if (notes?.merchantId) {
      const merchant = await Merchant.findById(notes.merchantId);
      if (merchant) {
        merchant.subscriptionStatus = "active";
        merchant.lastPaymentId = payment_id;
        await merchant.save();
      }
    }

    return { success: true, subscription_id };
  }

  /**
   * Handle subscription.activated event
   */
  static async handleSubscriptionActivated(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, notes } = subData;

    if (notes?.merchantId) {
      await Merchant.findByIdAndUpdate(notes.merchantId, {
        subscriptionStatus: "active",
      });
    }

    return { success: true, subscription_id };
  }

  /**
   * Handle subscription.cancelled event
   */
  static async handleSubscriptionCancelled(payload) {
    const subData = payload.payload?.subscription?.entity || payload || {};
    const { id: subscription_id, notes } = subData;

    if (notes?.merchantId) {
      await Merchant.findByIdAndUpdate(notes.merchantId, {
        subscriptionStatus: "cancelled",
      });
    }

    return { success: true, subscription_id };
  }
}

export default WebhookService;
