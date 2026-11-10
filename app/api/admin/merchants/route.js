import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  listMerchants,
  reviewMerchant,
} from "@/modules/merchant/merchant.service";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/merchants
 * List all merchants with any status. Admin only.
 *
 * Query params: page, limit, status
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listMerchants(searchParams);
  return ok(result);
});

/**
 * PUT /api/admin/merchants
 * Approve or reject a merchant. Admin only.
 *
 * Body: { merchantId: string, status: "approved" | "rejected", rejectionReason?: string }
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { merchantId, status, rejectionReason } = await request.json();
  const merchant = await reviewMerchant(merchantId, status, rejectionReason);

  const payload = {
    merchantId: merchant._id || merchant.id,
    status: merchant.status,
    businessName: merchant.businessName,
    rejectionReason: merchant.rejectionReason || "",
  };

  // Broadcast to Admin desk
  await dispatchEvent({ target: "admins", event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, payload });

  await dispatchEvent({
    target: "merchants",
    event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
    payload,
  });

  // Direct socket & DB notification to merchant user
  const merchantUserId = merchant?.authId || merchant?.userId;
  if (merchantUserId) {
    const isApproved = status === "approved";
    const isRejected = status === "rejected";

    await dispatchEvent({
      target: "user",
      userId: String(merchantUserId),
      event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
      payload,
      notify: {
        userId: String(merchantUserId),
        type: isApproved ? "merchant_approved" : isRejected ? "merchant_rejected" : "application_status_changed",
        category: "system",
        title: isApproved
          ? "Merchant Account Approved & Live"
          : isRejected
            ? "Merchant Application Rejected"
            : `Application Status Changed (${status})`,
        message: isApproved
          ? `Your business profile '${merchant.businessName}' has been verified and is live on Vouchiqo.`
          : isRejected
            ? `Your application for '${merchant.businessName}' was rejected: ${merchant.rejectionReason || "Check credentials."}`
            : `Status for '${merchant.businessName}' updated to ${status}.`,
        metadata: payload,
      },
    });
  }

  return ok(merchant, `Merchant ${status}`);
});
