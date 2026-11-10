export const paymentConfig = {
  // Amount limits (in paise: ₹1 = 100 paise)
  minAmount: 100, // ₹1
  maxAmount: 10000000, // ₹1,00,000

  // Idempotency
  idempotencyTTL: 60 * 60 * 24, // 24 hours in seconds
  intentExpiryMinutes: 30,

  // Retry
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds

  // Webhook
  webhookTimeout: 30000, // 30 seconds
  allowedWebhookIPs: (
    process.env.RAZORPAY_WEBHOOK_IPS ||
    "52.66.0.0/16,13.127.0.0/16,13.235.0.0/16"
  )
    .split(",")
    .map((ip) => ip.trim()),

  // Payment Types
  types: {
    SUBSCRIPTION: "SUBSCRIPTION",
    ADDON: "ADDON",
    COMMISSION: "COMMISSION",
    REFUND: "REFUND",
    PAYOUT: "PAYOUT",
  },

  // Status Mapping
  statusMapping: {
    created: "PENDING",
    authorized: "AUTHORIZED",
    captured: "CAPTURED",
    failed: "FAILED",
    refunded: "REFUNDED",
    partially_refunded: "PARTIALLY_REFUNDED",
  },
};
