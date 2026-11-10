import { paymentConfig } from "@/lib/payment-config";
import { rateLimit } from "@/modules/auth/auth.middleware";

/**
 * Payment endpoints rate limiter wrapper (max 10 requests per 15 minutes)
 */
export async function enforcePaymentRateLimit(
  request,
  routeIdentifier = "PAYMENT_ENDPOINT",
) {
  return rateLimit(request, routeIdentifier, 10, 15 * 60);
}

/**
 * Check if the request client IP is allowed by Razorpay Webhook IP Whitelist
 */
export function checkWebhookIpWhitelist(request) {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";

  const cleanIP = clientIP.replace("::ffff:", "");
  const allowed = paymentConfig.allowedWebhookIPs;

  if (allowed.length === 0 || allowed.includes("*")) {
    return true;
  }

  // Check prefix match or exact match
  return allowed.some((ip) => {
    if (ip.includes("/")) {
      const prefix = ip.split("/")[0].split(".").slice(0, 2).join(".");
      return cleanIP.startsWith(prefix);
    }
    return cleanIP === ip;
  });
}
