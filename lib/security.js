import crypto from "crypto";

/**
 * Safe string for use in regex queries.
 * Prevents Regular Expression Denial of Service (ReDoS) and regex injection.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip HTML and dangerous content from string inputs.
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== "string") return "";

  // Remove HTML comments
  let clean = input.replace(/<!--[\s\S]*?-->/g, "");

  // Remove script tags and their contents entirely
  clean = clean.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove style tags and their contents entirely
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove all other HTML tags
  clean = clean.replace(/<[^>]+>/g, "");

  return clean.trim();
}

/**
 * Sanitize an object recursively (typically for request bodies).
 *
 * @param {object} obj
 * @returns {object}
 */
export function sanitizeObject(obj) {
  if (obj === null) return null;

  if (Array.isArray(obj)) {
    return obj.map((value) =>
      typeof value === "string"
        ? sanitizeString(value)
        : typeof value === "object" && value !== null
          ? sanitizeObject(value)
          : value,
    );
  }

  if (typeof obj !== "object") return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "string"
        ? sanitizeString(value)
        : typeof value === "object" && value !== null
          ? sanitizeObject(value)
          : value,
    ]),
  );
}

/**
 * MongoDB injection prevention — check if any input contains MongoDB operators (starting with $).
 *
 * @param {any} value
 * @returns {boolean}
 */
export function containsMongoOperator(value) {
  if (typeof value === "string") {
    return /^\$/.test(value.trim());
  }
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).some((k) => k.startsWith("$"));
  }
  return false;
}

/**
 * Mask email address for display in logs or UI (e.g. revival list for admin).
 *
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  const masked = local.length > 3 ? local.slice(0, 2) + "***" : "***";
  return `${masked}@${domain}`;
}

/**
 * Mask phone number for display.
 *
 * @param {string} phone
 * @returns {string}
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return phone;
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

/**
 * Generate a cryptographically random secure coupon code.
 * Format: VOUCH-XXXXX-XXXXX
 *
 * @returns {string}
 */
export function generateSecureCouponCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit confusing characters (0/O, 1/I)
  const segment = (len) =>
    Array.from(crypto.randomBytes(len))
      .map((b) => chars[b % chars.length])
      .join("");

  return `VOUCH-${segment(5)}-${segment(5)}`;
}

/**
 * Validate coupon code format before query to save DB lookup overhead.
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isValidCouponCodeFormat(code) {
  if (typeof code !== "string") return false;
  const generatedPattern = /^VOUCH-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
  const merchantPattern = /^[A-Z0-9_-]{3,30}$/;
  return generatedPattern.test(code) || merchantPattern.test(code);
}
