import { connectDB } from "@/lib/mongodb";
import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import {
  createMerchant,
  listMerchants,
} from "@/modules/merchant/merchant.service";
import { createMerchantSchema } from "@/modules/merchant/merchant.validation";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/merchants
 * Admin: list all merchants with filters.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const result = await listMerchants(searchParams);
  return ok(result);
});

/**
 * POST /api/merchants
 * Create a merchant profile for the authenticated user.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const body = await request.json();
  const data = createMerchantSchema.parse(body);

  const merchant = await createMerchant(user.id, data);

  const payload = {
    merchantId: merchant._id || merchant.id,
    businessName: merchant.businessName,
    contactEmail: merchant.contactEmail,
    category: merchant.category,
    createdAt: merchant.createdAt,
  };

  // Dispatch Welcome & Credentials Confirmation Email to merchant and notification to admin
  const lastSent = user.lastWelcomeEmailSentAt ? new Date(user.lastWelcomeEmailSentAt).getTime() : 0;
  const isRecentlySent = Date.now() - lastSent < 60000;

  // Send if not recently sent, OR if a explicit password was provided with this application submission
  if (!isRecentlySent || body.password) {
    sendMerchantWelcomeEmail({
      to: merchant.contactEmail || user.email,
      email: merchant.contactEmail || user.email,
      password: body.password || undefined,
      businessName: merchant.businessName,
      liaisonName: merchant.liaisonName,
      phone: merchant.contactPhone || merchant.liaisonPhone,
      category: merchant.category,
    }).catch((err) => console.error("[Merchant Welcome Email Error]:", err));
  }

  // Broadcast new merchant application to Admins
  await dispatchEvent({
    target: "admins",
    event: SOCKET_EVENTS.APPLICATION_NEW,
    payload,
  });

  // Direct socket & DB notification to applicant merchant user
  await dispatchEvent({
    target: "user",
    userId: user.id,
    event: SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
    payload: {
      merchantId: merchant._id || merchant.id,
      status: "pending",
      businessName: merchant.businessName,
    },
    notify: {
      userId: user.id,
      type: "application_submitted",
      category: "system",
      title: "Merchant Profile Submitted",
      message: `Your business profile '${merchant.businessName}' has been submitted and is pending verification.`,
      metadata: payload,
    },
  });

  return created(merchant, "Merchant profile created. Pending admin approval.");
});
