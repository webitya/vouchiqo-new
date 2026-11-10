import crypto from "node:crypto";

/**
 * Generate idempotency key for requests
 * Format: {merchantId/userId}_{timestamp}_{randomHex}
 */
export function generateIdempotencyKey(req) {
  const prefix = req?.user?.id || req?.user?.merchantId || "anon";
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Hash sensitive data using SHA256
 */
export function hashData(data) {
  return crypto
    .createHash("sha256")
    .update(typeof data === "string" ? data : JSON.stringify(data))
    .digest("hex");
}

/**
 * Encrypt text using AES-256-GCM
 */
export function encryptData(
  text,
  secretKey = process.env.PAYMENT_ENCRYPTION_KEY,
) {
  if (!secretKey) {
    throw new Error("PAYMENT_ENCRYPTION_KEY is required for data encryption");
  }
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    encrypted: encrypted.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt text using AES-256-GCM
 */
export function decryptData(
  encryptedData,
  secretKey = process.env.PAYMENT_ENCRYPTION_KEY,
) {
  if (!secretKey) {
    throw new Error("PAYMENT_ENCRYPTION_KEY is required for data decryption");
  }
  const { iv, encrypted, authTag } = encryptedData;
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
