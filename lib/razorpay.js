import crypto from "node:crypto";
import Razorpay from "razorpay";

export const razorpayKeyId = (
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  ""
).trim();

export const razorpayKeySecret = (
  process.env.RAZORPAY_KEY_SECRET || ""
).trim();

export const razorpayWebhookSecret = (
  process.env.RAZORPAY_WEBHOOK_SECRET || ""
).trim();

let instance = null;

export function getRazorpayInstance() {
  if (!instance) {
    instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  }
  return instance;
}

export const razorpayConfig = {
  keyId: razorpayKeyId,
  keySecret: razorpayKeySecret,
  webhookSecret: razorpayWebhookSecret,
  currency: "INR",
  timeout: 30000,
};

/**
 * Timing-safe string comparison to mitigate HMAC timing side-channel attacks
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
function safeCompareSignatures(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const cleanA = a.trim().toLowerCase();
  const cleanB = b.trim().toLowerCase();
  
  // SHA256 hex digests are 64 characters
  if (cleanA.length !== 64 || cleanB.length !== 64) {
    return false;
  }

  const bufA = Buffer.from(cleanA, "utf8");
  const bufB = Buffer.from(cleanB, "utf8");

  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Creates a Razorpay order in INR (amount in paise or INR)
 * @param {Object} params - { amount (in INR or paise if passesInPaise=true), currency, receipt, notes, passesInPaise }
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
  passesInPaise = false,
}) {
  const rzp = getRazorpayInstance();
  const amountInPaise = passesInPaise
    ? Math.round(Number(amount))
    : Math.round(Number(amount) * 100);

  const options = {
    amount: amountInPaise,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes,
  };

  const order = await rzp.orders.create(options);
  return order;
}

/**
 * Verifies Razorpay payment signature for checkout verification with timing-safe comparison
 * @param {Object} params - { orderId, paymentId, signature }
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature || typeof signature !== "string") {
    return false;
  }

  if (!razorpayKeySecret) {
    console.error("[Razorpay Security] RAZORPAY_KEY_SECRET is not configured.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompareSignatures(generatedSignature, signature);
}

/**
 * Verifies Razorpay Webhook signature with timing-safe comparison
 * @param {string|Object} body - Raw string body or JSON object
 * @param {string} signature - x-razorpay-signature header
 * @param {string} [secret] - Webhook secret override
 */
export function verifyRazorpayWebhookSignature(body, signature, secret) {
  const webhookSecret = secret || razorpayWebhookSecret;
  if (!webhookSecret || !signature || typeof signature !== "string") {
    return false;
  }

  const payloadString = typeof body === "string" ? body : JSON.stringify(body);

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadString)
    .digest("hex");

  return safeCompareSignatures(expectedSignature, signature);
}
