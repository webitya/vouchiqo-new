// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// User Roles
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ROLES = {
  CUSTOMER: "customer",
  MERCHANT: "merchant",
  ADMIN: "admin",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Coupon
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const COUPON_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
  DELETED: "deleted",
};

export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  FREEBIE: "freebie",
};

export const COUPON_CATEGORIES = [
  "fashion",
  "food",
  "electronics",
  "beauty",
  "travel",
  "home",
  "home-improvement",
  "fitness",
  "education",
  "kids-baby",
  "jewellery",
  "automotive",
  "entertainment",
  "grocery",
  "finance",
  "services",
  "others",
];

export function normalizeCategory(raw) {
  if (!raw) return "food";
  const lower = String(raw).toLowerCase().trim();

  if (COUPON_CATEGORIES.includes(lower)) return lower;

  if (
    lower.includes("food") ||
    lower.includes("dining") ||
    lower.includes("restaurant") ||
    lower.includes("caf")
  )
    return "food";
  if (lower.includes("fashion") || lower.includes("cloth")) return "fashion";
  if (
    lower.includes("auto") ||
    lower.includes("car") ||
    lower.includes("vehicle")
  )
    return "automotive";
  if (lower.includes("electr") || lower.includes("gadget"))
    return "electronics";
  if (
    lower.includes("beauty") ||
    lower.includes("well") ||
    lower.includes("salon")
  )
    return "beauty";
  if (
    lower.includes("travel") ||
    lower.includes("hotel") ||
    lower.includes("hospitality")
  )
    return "travel";
  if (lower.includes("improvement")) return "home-improvement";
  if (lower.includes("home") || lower.includes("living")) return "home";
  if (
    lower.includes("fit") ||
    lower.includes("health") ||
    lower.includes("gym")
  )
    return "fitness";
  if (
    lower.includes("edu") ||
    lower.includes("course") ||
    lower.includes("school")
  )
    return "education";
  if (lower.includes("kid") || lower.includes("baby")) return "kids-baby";
  if (lower.includes("jewel") || lower.includes("gold")) return "jewellery";
  if (lower.includes("game") || lower.includes("entertain"))
    return "entertainment";
  if (lower.includes("groc") || lower.includes("essential")) return "grocery";
  if (lower.includes("finan") || lower.includes("insur")) return "finance";
  if (
    lower.includes("service") ||
    lower.includes("web") ||
    lower.includes("soft") ||
    lower.includes("tech") ||
    lower.includes("consult") ||
    lower.includes("agency") ||
    lower.includes("design") ||
    lower.includes("digital")
  )
    return "services";

  return "others";
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Claim
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CLAIM_STATUS = {
  ACTIVE: "active",
  REDEEMED: "redeemed",
  EXPIRED: "expired",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Merchant
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const MERCHANT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Revival
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const REVIVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Pagination
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 500,
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HTTP Status Codes
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Razorpay Plan IDs & Subscription Matrix (Task 6)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const RAZORPAY_PLANS = {
  GROWTH_MONTHLY: "vouchiqo_growth_monthly",
  GROWTH_ANNUAL: "vouchiqo_growth_annual",
  PRO_MONTHLY: "vouchiqo_pro_monthly",
  PRO_ANNUAL: "vouchiqo_pro_annual",
};

export const SUBSCRIPTION_MATRIX = {
  starter: {
    name: "Starter (Free)",
    priceMonthly: 0,
    priceYearly: 0,
    razorpayPlanId: null, // Free plan (no Razorpay plan needed)
    activeListingsLimit: 3,
    campaignsLimit: 0, // Campaign Manager disabled
    revivalCredits: 0,
    apiAccess: false,
    supportSla: "72hr email",
  },
  growth: {
    name: "Growth Partner",
    priceMonthly: 1499,
    priceYearly: 14900,
    razorpayPlanId: {
      monthly: RAZORPAY_PLANS.GROWTH_MONTHLY,
      yearly: RAZORPAY_PLANS.GROWTH_ANNUAL,
    },
    activeListingsLimit: 15,
    campaignsLimit: 1, // 1/quarter
    revivalCredits: 0, // Add-on only
    apiAccess: false,
    supportSla: "48hr email",
  },
  pro: {
    name: "Pro Partner",
    priceMonthly: 3999,
    priceYearly: 39990,
    razorpayPlanId: {
      monthly: RAZORPAY_PLANS.PRO_MONTHLY,
      yearly: RAZORPAY_PLANS.PRO_ANNUAL,
    },
    activeListingsLimit: 999, // Unlimited
    campaignsLimit: 4, // 4/year
    revivalCredits: 50, // 50/month
    featuredSlotDays: 2,
    pushNotifications: 1,
    apiAccess: false,
    supportSla: "24hr priority",
  },
  enterprise: {
    name: "Enterprise Partner",
    priceMonthly: null, // Custom
    priceYearly: null, // Negotiable / Manual Invoice
    razorpayPlanId: null, // Manual invoice
    activeListingsLimit: 999, // Unlimited
    campaignsLimit: 999, // Unlimited
    revivalCredits: 999999, // Unlimited
    apiAccess: "Full Read/Write",
    supportSla: "4hr dedicated",
  },
};

export const ADDONS_PRICING = [
  {
    id: "revival_pack",
    name: "Expired Offer Revival Pack",
    price: 499,
    unit: "25 revivals",
  },
  {
    id: "campaign_boost",
    name: "Flash Campaign Boost",
    price: 799,
    unit: "Single campaign",
  },
  {
    id: "featured_slot",
    name: "Homepage Featured Slot",
    price: 999,
    unit: "3 days",
  },
  {
    id: "push_notification",
    name: "Push Notification",
    price: 599,
    unit: "Single send",
  },
  {
    id: "festival_package",
    name: "Festival Campaign Package",
    price: 2999,
    unit: "All channels + teaser",
  },
  {
    id: "analytics_report",
    name: "Performance Analytics Report",
    price: 799,
    unit: "Deep report PDF",
  },
  {
    id: "email_blast",
    name: "Dedicated Email Blast",
    price: 799,
    unit: "Send to category subscribers",
  },
];
export const REDIS_TTL = {
  SESSION: 86400, // 24 hours
  OTP: 300, // 5 minutes
  RATE_LIMIT: 60, // 1 minute
  FEATURED: 300, // 5 minutes
  TRENDING: 120, // 2 minutes
  REDEEM_LOCK: 10, // 10 seconds
  BANNERS: 300, // 5 minutes
  PAYMENT_LOCK: 30, // 30 seconds distributed lock for payment processing
  PAYMENT_INTENT: 1800, // 30 minutes intent cache
  PAYMENT_STATE: 86400, // 24 hours state cache
  // Auth session cache TTLs (Redis-cached auth layer)
  AUTH_SESSION: 300, // 5 minutes -- cached session token lookup
  AUTH_USER: 300, // 5 minutes -- cached user role lookup
  MERCHANT_PROFILE: 300, // 5 minutes -- cached merchant profile lookup
  MERCHANT_BADGES: 30, // 30 seconds -- cached merchant badge counts
  // Public data caches (high-traffic, read-heavy)
  PLATFORM_STATS: 120, // 2 minutes - countDocuments expensive
  PLATFORM_PLANS: 3600, // 1 hour - plans change rarely
  MERCHANT_ANALYTICS: 120, // 2 minutes - 8 aggregations per request
  MERCHANT_CAMPAIGNS: 60, // 60 seconds - per-merchant campaign list
  COUPON_DETAIL: 120, // 2 minutes - individual coupon page
  CATEGORIES: 3600, // 1 hour - static category list
  BRANDS_LIST: 300, // 5 minutes - public /brands listing
  MERCHANTS_LIST: 300, // 5 minutes - public /merchants listing
  BRAND_DETAIL: 300, // 5 minutes - public brand page /brand/[slug]
  CATEGORIES_SUMMARY: 3600, // 1 hour - public categories summary
  CATEGORY_DEALS: 300, // 5 minutes - public deals in category /category/[slug]
  ADMIN_ANALYTICS: 60, // 60 seconds - admin dashboard KPIs
  ADMIN_REVENUE: 120, // 2 minutes - admin revenue stats
  MERCHANT_PUBLIC: 300, // 5 minutes - single merchant public profile
  SEARCH_GLOBAL: 60, // 60 seconds - public search query cache
};

export const REDIS_KEYS = {
  FEATURED_DEALS: "home:featured",
  TRENDING_DEALS: "home:trending",
  BANNERS: "home:banners",
  rateLimit: (ip, route) => `rl:${ip}:${route}`,
  redeemLock: (couponId, userId) => `redeem:lock:${couponId}:${userId}`,
  otp: (userId) => `otp:${userId}`,
  paymentLock: (orderId) => `payment:lock:${orderId}`,
  paymentIntent: (idempotencyKey) => `payment:intent:${idempotencyKey}`,
  paymentState: (orderId) => `payment:state:${orderId}`,
  // Auth session cache keys
  session: (token) => `auth:session:${token}`,
  userRole: (userId) => `auth:user:${userId}`,
  merchantProfile: (authId) => `auth:merchant:${authId}`,
  merchantBadges: (merchantId) => `auth:badges:${merchantId}`,
  // Public platform data keys
  PLATFORM_STATS: "platform:stats",
  PLATFORM_PLANS: "platform:plans",
  CATEGORIES: "platform:categories",
  // Merchant-specific data caches
  merchantAnalytics: (merchantId, period) =>
    `merchant:analytics:${merchantId}:${period}`,
  merchantCampaigns: (merchantId) => `merchant:campaigns:${merchantId}`,
  couponDetail: (couponId) => `coupon:detail:${couponId}`,
  merchantPublic: (id) => `merchant:public:${id}`,
  brandDetail: (slug) => `brand:detail:${slug}`,
  categoryDeals: (slug) => `category:deals:${slug}`,
  BRANDS_LIST: "platform:brands",
  MERCHANTS_LIST: "platform:merchants",
  CATEGORIES_SUMMARY: "platform:categories:summary",
  HOMEPAGE_DATA: "vouchiqo:homepage:data:v3",
  ADMIN_ANALYTICS: "admin:analytics:overview",
  ADMIN_REVENUE: "admin:revenue:summary",
  // Real-time Sorted Sets for trending leaderboards
  TRENDING_COUPONS_ZSET: "zset:trending:coupons",
  POPULAR_BRANDS_ZSET: "zset:popular:brands",
  searchGlobal: (q) => `search:global:${q}`,
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Queues
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  COUPONS: "coupons",
  REVIVALS: "revivals",
};

export const JOB_NAMES = {
  SEND_EMAIL: "send-email",
  RECORD_VIEW: "record-view",
  RECORD_IMPRESSION: "record-impression",
  RECORD_CLICK: "record-click",
  RECORD_COPY_CODE: "record-copy-code",
  RECORD_STORE_VIEW: "record-store-view",
  RECORD_BANNER_CLICK: "record-banner-click",
  RECORD_UNIQUE_CODE_GEN: "record-unique-code-gen",
  EXPIRE_COUPON: "expire-coupon",
  CHECK_REVIVALS: "check-expired",
};
