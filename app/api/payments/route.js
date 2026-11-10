import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments
 * Get payment history with pagination and filtering
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  let merchantId = null;
  if (user.role === ROLES.MERCHANT) {
    const merchant = await Merchant.findOne({ authId: user.id });
    merchantId = merchant?._id;
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;

  const result = await PaymentService.getPaymentHistory({
    merchantId,
    type,
    status,
    startDate,
    endDate,
    page: Number(page),
    limit: Number(limit),
  });

  return ok(result, "Payment history retrieved successfully");
});
