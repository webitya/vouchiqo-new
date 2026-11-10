import { connectDB } from "@/lib/mongodb";
import {
  getRevenueSummary,
  updatePayoutStatus,
} from "@/modules/admin/revenue.service";
import { requireRole } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/revenue
 * Returns platform billing stats, MRR, invoices, and payouts. Admin only.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const data = await getRevenueSummary();
  return ok(data);
});

/**
 * PUT /api/admin/revenue
 * Updates a payout status (e.g. marking as paid). Admin only.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { payoutId, status } = await request.json();

  if (!payoutId || !status) {
    return Response.json(
      { status: "error", message: "Payout ID and status are required" },
      { status: 400 },
    );
  }

  const updatedPayout = await updatePayoutStatus(payoutId, status);
  return ok(updatedPayout, "Payout status updated successfully");
});
