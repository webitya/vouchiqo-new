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
 * POST /api/payments/verify
 * Standard payment verification endpoint with idempotent execution & timing-safe HMAC checks
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/verify");

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  let merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    });
  }
  const merchantId = merchant?._id;

  const body = await request.json().catch(() => ({}));
  const { orderId, paymentId, signature } = body;

  if (
    !orderId ||
    typeof orderId !== "string" ||
    !paymentId ||
    typeof paymentId !== "string" ||
    !signature ||
    typeof signature !== "string"
  ) {
    throw new BadRequestError("Missing required payment verification parameters");
  }

  const cleanOrderId = orderId.trim();
  const cleanPaymentId = paymentId.trim();
  const cleanSignature = signature.trim();

  const isValid = PaymentService.verifySignature({
    orderId: cleanOrderId,
    paymentId: cleanPaymentId,
    signature: cleanSignature,
  });

  if (!isValid) {
    throw new BadRequestError("Invalid signature verification failed");
  }

  const payment = await Payment.findOne({ gatewayOrderId: cleanOrderId });
  if (!payment) {
    throw new NotFoundError("Payment transaction");
  }

  if (
    user.role !== ROLES.ADMIN &&
    merchantId &&
    payment.merchantId.toString() !== merchantId.toString()
  ) {
    throw new BadRequestError("Unauthorized payment verification");
  }

  // Idempotent fulfillment via WebhookService
  await WebhookService.handlePaymentCaptured({
    payload: {
      payment: {
        entity: {
          order_id: cleanOrderId,
          id: cleanPaymentId,
          amount: payment.amount,
          notes: {
            merchantId: payment.merchantId?.toString(),
            plan: payment.metadata?.plan,
            cycle: payment.metadata?.cycle,
            type: payment.metadata?.type || payment.type,
            addOnId: payment.metadata?.addOnId,
          },
        },
      },
    },
  });

  const updatedPayment = await PaymentService.getPayment(
    payment._id,
    user.role === ROLES.ADMIN ? null : merchantId,
  );

  return ok(
    updatedPayment,
    "Payment signature verified and plan activated successfully",
  );
});
