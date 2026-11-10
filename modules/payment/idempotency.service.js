import { paymentConfig } from "@/lib/payment-config";
import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";
import PaymentIntent from "./payment-intent.model";

export class IdempotencyService {
  /**
   * Create a new payment intent with Redis state caching
   */
  static async createIntent({
    idempotencyKey,
    merchantId,
    amount,
    currency = "INR",
    type,
    metadata = {},
  }) {
    const expiresAt = new Date(
      Date.now() + paymentConfig.intentExpiryMinutes * 60 * 1000,
    );

    const intent = new PaymentIntent({
      idempotencyKey,
      merchantId,
      amount,
      currency,
      type,
      metadata,
      status: "PENDING",
      expiresAt,
    });

    await intent.save();

    // Cache intent in Redis (30 mins TTL)
    const redisKey = REDIS_KEYS.paymentIntent(idempotencyKey);
    try {
      await redis.set(
        redisKey,
        JSON.stringify(intent.toObject()),
        "EX",
        REDIS_TTL.PAYMENT_INTENT,
      );
    } catch (err) {
      console.warn("[Redis] Intent cache error:", err.message);
    }

    return intent;
  }

  /**
   * Mark intent as completed in MongoDB + Redis
   */
  static async completeIntent(idempotencyKey, paymentId) {
    const intent = await PaymentIntent.findOne({ idempotencyKey });
    if (!intent) {
      return null;
    }

    intent.status = "COMPLETED";
    intent.paymentId = paymentId;
    await intent.save();

    // Update Redis cache
    const redisKey = REDIS_KEYS.paymentIntent(idempotencyKey);
    try {
      await redis.set(
        redisKey,
        JSON.stringify(intent.toObject()),
        "EX",
        REDIS_TTL.PAYMENT_INTENT,
      );
    } catch (err) {
      console.warn("[Redis] Intent cache update error:", err.message);
    }

    return intent;
  }

  /**
   * Mark intent as failed in MongoDB + Redis
   */
  static async failIntent(idempotencyKey, error) {
    const intent = await PaymentIntent.findOne({ idempotencyKey });
    if (!intent) {
      return null;
    }

    intent.status = "FAILED";
    intent.metadata = { ...intent.metadata, error: String(error) };
    await intent.save();

    // Update Redis cache
    const redisKey = REDIS_KEYS.paymentIntent(idempotencyKey);
    try {
      await redis.set(
        redisKey,
        JSON.stringify(intent.toObject()),
        "EX",
        REDIS_TTL.PAYMENT_INTENT,
      );
    } catch (err) {
      console.warn("[Redis] Intent cache update error:", err.message);
    }

    return intent;
  }

  /**
   * Check if intent exists and is valid (Redis hit -> MongoDB fallback)
   */
  static async getIntent(idempotencyKey, merchantId) {
    const redisKey = REDIS_KEYS.paymentIntent(idempotencyKey);

    // 1. Fast sub-millisecond Redis Cache check
    try {
      const cached = await redis.get(redisKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!merchantId || String(parsed.merchantId) === String(merchantId)) {
          if (new Date(parsed.expiresAt) > new Date()) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("[Redis] Intent cache read error:", err.message);
    }

    // 2. MongoDB Fallback
    const query = { idempotencyKey };
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const intent = await PaymentIntent.findOne(query);
    if (!intent) {
      return null;
    }

    // Check expiry
    if (intent.expiresAt < new Date()) {
      await PaymentIntent.deleteOne({ _id: intent._id });
      try {
        await redis.del(redisKey);
      } catch (err) {
        // ignore
      }
      return null;
    }

    // Cache back in Redis
    try {
      await redis.set(
        redisKey,
        JSON.stringify(intent.toObject()),
        "EX",
        REDIS_TTL.PAYMENT_INTENT,
      );
    } catch (err) {
      // ignore
    }

    return intent;
  }
}

export default IdempotencyService;
