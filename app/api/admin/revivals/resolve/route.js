import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  getAlternativeSuggestions,
  resolveCustomerRevival,
} from "@/modules/revival/customer-revival.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/admin/revivals/resolve
 * Admin-only: Fetch up to 3 alternative coupon suggestions for a declined request.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const revivalId = searchParams.get("revivalId");

  if (!revivalId) {
    return ok({ suggestions: [] });
  }

  const suggestions = await getAlternativeSuggestions(revivalId);
  return ok({ suggestions });
});

/**
 * POST /api/admin/revivals/resolve
 * Admin-only: Resolve customer revival request with outcomes (regenerate/alternative/decline).
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const {
    revivalId,
    outcomeStatus,
    declineReason,
    alternativeOfferId,
    includeInPublicFeed,
  } = body;

  const result = await resolveCustomerRevival(revivalId, {
    outcomeStatus,
    declineReason,
    alternativeOfferId,
    includeInPublicFeed,
  });

  return ok(result, "Customer revival request resolved successfully");
});
