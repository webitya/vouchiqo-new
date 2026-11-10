import { paymentConfig } from "@/lib/payment-config";

/**
 * Convert Rupees to Paise
 */
export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/**
 * Convert Paise to Rupees
 */
export function toRupees(paise) {
  return Number((Number(paise) / 100).toFixed(2));
}

/**
 * Validate payment amount in paise against configured limits
 */
export function validatePaymentAmount(amountInPaise) {
  const numAmount = Number(amountInPaise);
  if (Number.isNaN(numAmount) || numAmount <= 0) {
    throw new Error("Invalid payment amount");
  }
  if (numAmount < paymentConfig.minAmount) {
    throw new Error(
      `Minimum payment amount is ₹${toRupees(paymentConfig.minAmount)}`,
    );
  }
  if (numAmount > paymentConfig.maxAmount) {
    throw new Error(
      `Maximum payment amount is ₹${toRupees(paymentConfig.maxAmount)}`,
    );
  }
  return true;
}

/**
 * Format currency string (INR)
 */
export function formatCurrency(amount, inPaise = false) {
  const rupees = inPaise ? toRupees(amount) : Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(rupees);
}
