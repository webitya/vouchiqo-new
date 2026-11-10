import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/:paymentId
 * Get single payment details by ID
 */
export const GET = asyncHandler(async (request, { params }) => {
  await connectDB();
  const { paymentId } = await params;

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  let merchantId = null;
  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    merchantId = merchant?._id;
  }

  const payment = await PaymentService.getPayment(paymentId, merchantId);

  return ok(payment, "Payment details retrieved successfully");
});
