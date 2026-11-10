import { generateIdempotencyKey } from "@/utils/crypto-utils";
import { IdempotencyService } from "./idempotency.service";
import Payment from "./payment.model";

/**
 * Next.js App Router Helper for Idempotency logic
 * @param {Request} request
 * @param {Object} user - Authenticated user object
 * @returns {Promise<{idempotencyKey: string, existingResult: Object|null}>}
 */
export async function handleIdempotency(request, user) {
  const headerKey =
    request.headers.get("idempotency-key") ||
    request.headers.get("Idempotency-Key");
  let idempotencyKey = headerKey?.trim();

  if (!idempotencyKey) {
    idempotencyKey = generateIdempotencyKey({ user });
  }

  const existingIntent = await IdempotencyService.getIntent(
    idempotencyKey,
    user?.merchantId || user?.id,
  );

  if (existingIntent) {
    if (existingIntent.status === "COMPLETED" && existingIntent.paymentId) {
      const payment = await Payment.findById(existingIntent.paymentId);
      return {
        idempotencyKey,
        existingResult: {
          success: true,
          data: payment,
          idempotent: true,
        },
      };
    }

    if (existingIntent.status === "FAILED") {
      return {
        idempotencyKey,
        existingResult: {
          success: false,
          error: "Payment previously failed for this idempotency key",
          idempotent: true,
        },
      };
    }
  }

  return { idempotencyKey, existingResult: null };
}
