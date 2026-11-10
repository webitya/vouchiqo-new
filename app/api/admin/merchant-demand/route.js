import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  listMerchantDemands,
  updateMerchantDemandOutreach,
} from "@/modules/revival/customer-revival.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/admin/merchant-demand
 * Admin-only: list all merchant demand leads.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listMerchantDemands(searchParams);
  return ok(result);
});

/**
 * PUT /api/admin/merchant-demand
 * Admin-only: update outreach status or Do-Not-Contact flag.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const { demandId, outreachStatus, doNotContact } = body;

  const result = await updateMerchantDemandOutreach(demandId, {
    outreachStatus,
    doNotContact,
  });

  return ok(result, "Merchant demand record updated successfully");
});
