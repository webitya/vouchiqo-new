import { connectDB } from "@/lib/mongodb";
import { checkWebhookIpWhitelist } from "@/modules/payment/payment-auth.middleware";
import { WebhookService } from "@/modules/payment/webhook.service";
import { error as errorResponse, ok } from "@/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/razorpay
 * Razorpay Webhook endpoint (Raw body text parsing + IP check + HMAC signature verification)
 */
export async function POST(request) {
  try {
    await connectDB();

    if (!checkWebhookIpWhitelist(request)) {
      return errorResponse("Access denied: Client IP not whitelisted", 403);
    }

    const signature = request.headers.get("x-razorpay-signature");
    const rawBody = await request.text();

    if (!rawBody) {
      return errorResponse("Missing webhook payload", 400);
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid JSON payload", 400);
    }

    const eventId =
      payload.event_id ||
      payload.contains?.[0] ||
      `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const eventType = payload.event;

    if (!eventType) {
      return errorResponse("Missing event type in webhook", 400);
    }

    const result = await WebhookService.processWebhook(
      eventId,
      eventType,
      payload,
      signature,
      rawBody,
    );

    return ok(result, "Webhook processed successfully");
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return errorResponse(error.message || "Webhook processing failed", 400);
  }
}
