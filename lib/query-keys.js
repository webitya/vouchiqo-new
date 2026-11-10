/**
 * Centralised TanStack Query key factory.
 *
 * Every query and invalidation call should reference this module so that
 * cache keys are defined in ONE place.
 *
 * Usage in hooks:
 *   import { qk } from "@/lib/query-keys";
 *   useQuery({ queryKey: qk.merchant.profile(), queryFn: ... })
 *
 * Usage in invalidation:
 *   queryClient.invalidateQueries({ queryKey: qk.coupons.all });
 */

const merchantKeys = {
  profile: () => ["merchant-profile"],
  applicationStatus: () => ["merchant-application-status"],
  analytics: () => ["merchant-analytics"],
  dashboard: () => ["merchant-dashboard"],
  recentRedemptions: () => ["merchant-recent-redemptions"],
  campaigns: () => ["merchant-campaigns"],
  couponsForCampaign: () => ["merchant-coupons-for-campaign"],
  coupons: (merchantId) => ["merchant-coupons", merchantId],
  coupon: (id) => ["merchant-coupon", id],
  revivals: () => ["merchant-revivals"],
  notifications: () => ["merchant-notifications"],
};

const adminKeys = {
  analytics: () => ["admin-analytics"],
  notifications: () => ["admin-notifications"],
  coupons: (filters = {}) => ["admin-coupons", filters],
  pendingCoupons: () => ["admin-pending-coupons"],
  pendingMerchants: () => ["admin-pending-merchants"],
  merchants: (filters = {}) => ["admin-merchants", filters],
  merchantDetail: (id) => ["admin-merchant", id],
  campaigns: (filters = {}) => ["admin-campaigns", filters],
  campaignQueue: () => ["admin-campaign-queue"],
  liveCampaigns: () => ["admin-live-campaigns"],
  scheduledCampaigns: () => ["admin-scheduled-campaigns"],
  campaignAnalytics: () => ["admin-campaign-analytics"],
  campaignDetail: (id) => ["admin-campaign", id],
  banners: () => ["admin-banners"],
  revenue: () => ["admin-revenue"],
  campaignRevenue: () => ["admin-campaign-revenue"],
  affiliateProducts: (filters = {}) => ["admin-affiliate-products", filters],
  broadcastRecipients: () => ["admin-broadcast-recipients"],
  settings: () => ["admin-settings"],
  merchantRevivals: () => ["admin-merchant-revivals"],
  customerRevivals: () => ["admin-customer-revivals"],
  users: (filters = {}) => ["admin-users", filters],
};

const couponKeys = {
  /** Invalidation target for all coupon-related queries. */
  all: () => ["coupons"],
  list: (filters = {}) => ["coupons", "list", filters],
  detail: (id) => ["coupon", id],
};

const notificationKeys = {
  all: () => ["notifications"],
  unread: () => ["notifications-unread"],
};

const userKeys = {
  profile: () => ["user-profile"],
  claims: (status) => (status ? ["user-claims", status] : ["user-claims"]),
  savings: () => ["user-savings"],
  savedDeals: () => ["user-saved-deals"],
  revivals: () => ["customer-revivals"],
  redemptions: () => ["user-redemptions"],
};

export const qk = {
  merchant: merchantKeys,
  admin: adminKeys,
  coupons: couponKeys,
  notifications: notificationKeys,
  user: userKeys,
};
