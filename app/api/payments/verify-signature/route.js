import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import Payment from "@/modules/payment/payment.model";
import { PaymentService } from "@/modules/payment/payment.service";
import { WebhookService } from "@/modules/payment/webhook.service";
import { ok } from "@/utils/api-response";
import { BadRequestError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/verify-signature
 * Verifies Razorpay HMAC SHA256 payment signature with rate-limiting, timing-safe equality,
 * ownership validation, and atomic plan activation.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/verify-signature");

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  let merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    });
  }
  if (!merchant) throw new NotFoundError("Merchant profile");

  const body = await request.json().catch(() => ({}));
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  // 1. Strict input validation
  if (
    !razorpay_order_id ||
    typeof razorpay_order_id !== "string" ||
    !razorpay_payment_id ||
    typeof razorpay_payment_id !== "string" ||
    !razorpay_signature ||
    typeof razorpay_signature !== "string"
  ) {
    throw new BadRequestError("Missing required Razorpay payment signature parameters");
  }

  const orderId = razorpay_order_id.trim();
  const paymentId = razorpay_payment_id.trim();
  const signature = razorpay_signature.trim();

  // 2. Strict HMAC signature verification (Timing-safe comparison)
  const isValid = PaymentService.verifySignature({
    orderId,
    paymentId,
    signature,
  });

  if (!isValid) {
    throw new BadRequestError(
      "Invalid Razorpay payment details! Signature verification failed.",
    );
  }

  // 3. Find server-side Payment record
  const payment = await Payment.findOne({ gatewayOrderId: orderId });
  if (!payment) {
    throw new NotFoundError("Associated payment order record not found");
  }

  // 4. Verify payment ownership
  if (
    user.role !== ROLES.ADMIN &&
    payment.merchantId.toString() !== merchant._id.toString()
  ) {
    throw new BadRequestError("Payment does not belong to the authenticated merchant");
  }

  // 5. Atomic fulfillment via WebhookService
  await WebhookService.handlePaymentCaptured({
    payload: {
      payment: {
        entity: {
          order_id: orderId,
          id: paymentId,
          amount: payment.amount,
          notes: {
            merchantId: merchant._id.toString(),
            plan: payment.metadata?.plan,
            cycle: payment.metadata?.cycle,
            type: payment.metadata?.type || payment.type,
            addOnId: payment.metadata?.addOnId,
          },
        },
      },
    },
  });

  // Re-fetch the fresh merchant profile
  const updatedMerchant = await Merchant.findById(merchant._id);

  return ok(
    updatedMerchant,
    "Payment verified successfully and plan activated!",
  );
});
