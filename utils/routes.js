/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Vouchiqo Route & Redirect Manager
 * ──────────────────────────────────────────────────────────────────────────────
 * Production-ready centralized routing config and path helpers.
 * Eliminates hardcoded URL strings, manages dynamic parameters, and enforces
 * access rules across Customer, Merchant, and Admin layouts.
 */

import { ROLES } from "./constants";

// Centralized Route Registry
export const ROUTES = {
  // Public Client Routes
  HOME: "/",
  BRANDS: "/brands",
  BRAND_DETAIL: (slug) => `/brand/${slug}`,
  DEAL_DETAIL: (id) => `/deals/${id}`,
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (slug) => `/category/${slug}`,
  REVIVAL: "/revival",
  EXPIRED_REVIVAL: "/expired-coupon-revival",
  FAQ: "/faq",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/contact",
  NEARBY_OFFERS: "/nearby-offers",
  SUBMIT: "/submit",

  // Authentication Routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    ADMIN_LOGIN: "/admin-login",
    MERCHANT_LOGIN: "/merchant-login",
    MERCHANT_REGISTER: "/merchant-register",
    MERCHANT_FORGOT_PASSWORD: "/merchant-forgot-password",
    MERCHANT_RESET_PASSWORD: "/merchant-reset-password",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_OTP: "/verify-otp",
    CALLBACK: "/auth/callback",
  },

  // Customer Dashboard & Profile Layouts
  CUSTOMER: {
    DASHBOARD: "/customer/dashboard",
    BRANDS: "/customer/brands",
    CLAIMED: "/customer/claimed",
    SAVED: "/customer/saved",
    SAVINGS: "/customer/savings",
    PROFILE: "/profile",
    SETTINGS: "/profile/settings",
  },

  // Merchant Layouts
  MERCHANT: {
    DASHBOARD: "/merchant/dashboard",
    ANALYTICS: "/merchant/analytics",
    PROFILE: "/merchant/profile",
    COUPONS: "/merchant/coupons",
    CREATE_COUPON: "/merchant/coupons/new",
    CAMPAIGNS: "/merchant/campaigns",
    BILLING: "/merchant/billing",
  },

  // Admin / Platform Layouts
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    APPROVALS_MERCHANTS: "/admin/approvals/merchants",
    APPROVALS_COUPONS: "/admin/approvals/coupons",
    USERS: "/admin/users",
    FEATURED: "/admin/featured",
    REVIVALS: "/admin/revivals",
    REVENUE: "/admin/revenue",
    CONTENT: "/admin/content",
  },

  // API Endpoints Registry
  API: {
    SEED: "/api/seed",
    STATS: "/api/stats",
    CAMPAIGNS: "/api/campaigns",
    CATEGORIES: "/api/categories",
    UPLOADS: "/api/uploads",
    AUTH_CALLBACK: "/api/auth/callback",
    GET_SESSION: "/api/auth/get-session",
    GOOGLE_CHECK: "/api/auth/google-check",
    ADMIN: {
      ANALYTICS: "/api/admin/analytics",
      COUPONS: "/api/admin/coupons",
      MERCHANTS: "/api/admin/merchants",
      REVENUE: "/api/admin/revenue",
      SETTINGS: "/api/admin/settings",
      USERS: "/api/admin/users",
    },
    MERCHANTS: {
      BASE: "/api/merchants",
      DETAIL: (id) => `/api/merchants/${id}`,
      ME: "/api/merchants/me",
    },
    PAYMENTS: {
      BASE: "/api/payments",
      CREATE_ORDER: "/api/payments/create-order",
      VERIFY: "/api/payments/verify",
      VERIFY_SIGNATURE: "/api/payments/verify-signature",
      REFUND: (id) => `/api/payments/${id}/refund`,
      WEBHOOK: "/api/webhooks/razorpay",
    },
    COUPONS: {
      BASE: "/api/coupons",
      DETAIL: (id) => `/api/coupons/${id}`,
    },
    CLAIMS: {
      BASE: "/api/claims",
      DETAIL: (id) => `/api/claims/${id}`,
    },
    REDEMPTIONS: {
      BASE: "/api/redemptions",
      DETAIL: (id) => `/api/redemptions/${id}`,
    },
    REVIVALS: {
      BASE: "/api/revivals",
      CUSTOMER: "/api/revivals/customer",
    },
    USERS: {
      BASE: "/api/users",
      SAVINGS: "/api/users/savings",
    },
  },
};

/**
 * Resolves the default dashboard redirect URL for a specific user role.
 *
 * @param {string} role - The user's role (customer | merchant | admin)
 * @returns {string} The path to redirect to.
 */
export function getRedirectForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    case ROLES.MERCHANT:
      return ROUTES.MERCHANT.DASHBOARD;
    default:
      // Customers land on the public homepage, not the stub /customer/dashboard
      return ROUTES.HOME;
  }
}

/**
 * Determines if a given pathname is a public auth-form route.
 * Auth pages are accessible without a session (login, register, etc.)
 *
 * @param {string} pathname - The route pathname to check.
 * @returns {boolean} True if the route requires authentication.
 */
export function isProtectedRoute(pathname) {
  // These are explicitly public — never require auth
  const publicAuthPages = [
    "/login",
    "/register",
    "/admin-login",
    "/merchant-login",
    "/merchant-register",
    "/merchant-forgot-password",
    "/merchant-reset-password",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ];

  if (publicAuthPages.includes(pathname)) return false;

  // These namespaces always require authentication
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/merchant") ||
    pathname.startsWith("/customer") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  );
}

/**
 * Validates if the user role is authorized to access the given path layout.
 * Admin is superadmin and can access all routes.
 *
 * @param {string} pathname - The route pathname.
 * @param {string} role - The user's authenticated role.
 * @returns {boolean} True if the user is authorized for the route.
 */
export function isAuthorizedForRoute(pathname, role) {
  // Admin is superadmin — can access everything
  if (role === ROLES.ADMIN) return true;

  // Block merchants from admin routes
  if (pathname.startsWith("/admin") && role !== ROLES.ADMIN) return false;

  // Block customers from merchant routes
  if (pathname.startsWith("/merchant") && role !== ROLES.MERCHANT) return false;

  // Block merchants from customer-specific routes
  if (pathname.startsWith("/customer") && role === ROLES.MERCHANT) return false;

  return true;
}
