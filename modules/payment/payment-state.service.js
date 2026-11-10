import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

export class PaymentStateService {
  /**
   * Acquire a Redis distributed lock for an order
   * Prevents race conditions between webhook callbacks & client verification calls
   * @param {string} orderId
   * @param {number} ttl - Lock TTL in seconds (default: 30s)
   * @returns {Promise<boolean>} true if lock acquired, false if already locked
   */
  static async acquireLock(orderId, ttl = REDIS_TTL.PAYMENT_LOCK) {
    if (!orderId) return true;
    const lockKey = REDIS_KEYS.paymentLock(orderId);
    try {
      const result = await redis.set(lockKey, "locked", "EX", ttl, "NX");
      return result === "OK";
    } catch (err) {
      console.warn("[Redis] Lock acquisition error:", err.message);
      return true; // Fallback if Redis offline
    }
  }

  /**
   * Release Redis distributed lock for an order
   * @param {string} orderId
   */
  static async releaseLock(orderId) {
    if (!orderId) return;
    const lockKey = REDIS_KEYS.paymentLock(orderId);
    try {
      await redis.del(lockKey);
    } catch (err) {
      console.warn("[Redis] Lock release error:", err.message);
    }
  }

  /**
   * Save live payment transaction state in Redis
   * @param {string} orderId
   * @param {Object} stateData - { status, amount, type, merchantId, paymentId }
   */
  static async setState(orderId, stateData) {
    if (!orderId) return;
    const stateKey = REDIS_KEYS.paymentState(orderId);
    try {
      await redis.set(
        stateKey,
        JSON.stringify({ ...stateData, updatedAt: new Date().toISOString() }),
        "EX",
        REDIS_TTL.PAYMENT_STATE,
      );
    } catch (err) {
      console.warn("[Redis] State set error:", err.message);
    }
  }

  /**
   * Get live payment transaction state from Redis
   * @param {string} orderId
   * @returns {Promise<Object|null>}
   */
  static async getState(orderId) {
    if (!orderId) return null;
    const stateKey = REDIS_KEYS.paymentState(orderId);
    try {
      const data = await redis.get(stateKey);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn("[Redis] State get error:", err.message);
      return null;
    }
  }
}
