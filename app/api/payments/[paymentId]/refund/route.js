import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/:paymentId/refund
 * Request partial or full refund (Restricted to Administrator only)
 */
export const POST = asyncHandler(async (request, { params }) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/refund");

  const { paymentId } = await params;
  
  // Security Hardening: Payment refunds must strictly be initiated by ADMIN
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json().catch(() => ({}));
  const { amount, reason } = body;

  const result = await PaymentService.refundPayment(
    paymentId,
    null, // null allows admin to process refund for any merchant
    amount,
    reason,
  );

  return ok(result, "Refund processed successfully");
});
