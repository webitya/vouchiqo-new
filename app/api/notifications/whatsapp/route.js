import {
  VOUCHIQO_SUPPORT_WHATSAPP,
  getWhatsAppDeepLink,
  isTwilioConfigured,
  isWhatsAppCloudConfigured,
  sanitizeWhatsAppNumber,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";
import { rateLimit } from "@/modules/auth/auth.middleware";
import { error, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/whatsapp
 * Returns WhatsApp API configuration status and official support link.
 */
export const GET = asyncHandler(async () => {
  return ok({
    configured: isWhatsAppCloudConfigured() || isTwilioConfigured(),
    metaCloudConfigured: isWhatsAppCloudConfigured(),
    twilioConfigured: isTwilioConfigured(),
    supportNumber: `+${VOUCHIQO_SUPPORT_WHATSAPP}`,
    supportLink: getWhatsAppDeepLink({
      phone: VOUCHIQO_SUPPORT_WHATSAPP,
      message: "Hi Vouchiqo Support, I need help with my account.",
    }),
  });
});

/**
 * POST /api/notifications/whatsapp
 * Dispatch a WhatsApp message or generate an instant click-to-chat deep link.
 *
 * Body: { to: string, message: string, templateName?: string }
 */
export const POST = asyncHandler(async (request) => {
  // Rate limit: max 5 WhatsApp messages per minute per IP.
  // Prevents credential/quota drain abuse via the open relay.
  await rateLimit(request, "POST:/api/notifications/whatsapp", 5, 60);

  const body = await request.json().catch(() => ({}));
  const { to, message, templateName, templateComponents } = body;

  if (!to || !message) {
    return error("Recipient phone ('to') and 'message' are required.", 400);
  }

  const result = await sendWhatsAppMessage({
    to,
    message,
    templateName,
    templateComponents,
  });

  if (!result.success) {
    return error(result.error || "Failed to send WhatsApp message", 500);
  }

  return ok(result, "WhatsApp dispatch initiated successfully.");
});
