/**
 * Centralized, typed API helpers for Vouchiqo admin and content operations.
 * Separates concerns and removes raw fetch calls from React components.
 */

async function apiRequest(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}

// ─────────────────────────────────────────────
// Coupon Moderation APIs
// ─────────────────────────────────────────────

export async function adminFetchPendingCoupons() {
  const json = await apiRequest("/api/admin/coupons?isVerified=false");
  return json.data?.coupons || [];
}

export async function adminFetchAllCoupons({ status = "", search = "" } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const json = await apiRequest(`/api/admin/coupons?${params.toString()}`);
  return json.data?.coupons || [];
}

export async function adminApproveCoupon(couponId) {
  const json = await apiRequest("/api/admin/coupons", {
    method: "PUT",
    body: JSON.stringify({ couponId, isVerified: true, status: "active" }),
  });
  return json.data;
}

export async function adminRejectCoupon(couponId, reason) {
  const json = await apiRequest("/api/admin/coupons", {
    method: "PUT",
    body: JSON.stringify({
      couponId,
      isVerified: false,
      status: "paused",
      rejectionReason: reason,
    }),
  });
  return json.data;
}

export async function adminUpdateCoupon(couponId, updateData) {
  const json = await apiRequest("/api/admin/coupons", {
    method: "PUT",
    body: JSON.stringify({ couponId, ...updateData }),
  });
  return json.data;
}

export async function adminDeleteCoupon(couponId) {
  const json = await apiRequest(`/api/admin/coupons?id=${couponId}`, {
    method: "DELETE",
  });
  return json.data;
}

// ─────────────────────────────────────────────
// Ticker Management APIs
// ─────────────────────────────────────────────

export async function adminFetchActiveCoupons() {
  const json = await apiRequest("/api/admin/coupons?status=active");
  return json.data?.coupons || [];
}

export async function adminToggleCouponFlag(couponId, field, currentValue) {
  const json = await apiRequest("/api/admin/coupons", {
    method: "PUT",
    body: JSON.stringify({ couponId, [field]: !currentValue }),
  });
  return json.data;
}

// ─────────────────────────────────────────────
// Revival Management APIs
// ─────────────────────────────────────────────

export async function adminFetchMerchantRevivals() {
  const json = await apiRequest("/api/revivals?status=pending");
  return json.data?.revivals || [];
}

export async function adminFetchCustomerRevivals() {
  const json = await apiRequest("/api/revivals/customer?admin=true");
  return json.data?.revivals || [];
}

export async function adminReviewMerchantRevival(revivalId, status) {
  const json = await apiRequest("/api/revivals", {
    method: "PUT",
    body: JSON.stringify({
      revivalId,
      status,
      reviewNote: "Moderated by admin",
    }),
  });
  return json.data;
}

export async function adminReviewCustomerRevival(revivalId, status) {
  const json = await apiRequest("/api/revivals/customer", {
    method: "PUT",
    body: JSON.stringify({ revivalId, status }),
  });
  return json.data;
}

// ─────────────────────────────────────────────
// User Management APIs
// ─────────────────────────────────────────────

export async function adminFetchUsers({
  role = "",
  isActive = "",
  merchantStatus = "",
  search = "",
} = {}) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (isActive !== "") params.set("isActive", isActive);
  if (merchantStatus) params.set("merchantStatus", merchantStatus);
  if (search) params.set("search", search);
  const json = await apiRequest(`/api/admin/users?${params.toString()}`);
  return json.data?.users || [];
}

export async function adminToggleUserStatus(authId, isActive) {
  const json = await apiRequest("/api/admin/users", {
    method: "PUT",
    body: JSON.stringify({ authId, isActive: !isActive }),
  });
  return json.data;
}

export async function adminExportSubscribers() {
  const json = await apiRequest("/api/admin/users?export=true");
  return json.data?.subscribers || [];
}

// ─────────────────────────────────────────────
// Merchant Management APIs
// ─────────────────────────────────────────────

export async function adminFetchMerchants() {
  const json = await apiRequest("/api/admin/merchants");
  return json.data?.merchants || json.data || [];
}

export async function adminReviewMerchant(merchantId, status, rejectionReason) {
  const json = await apiRequest("/api/admin/merchants", {
    method: "PUT",
    body: JSON.stringify({ merchantId, status, rejectionReason }),
  });
  return json.data;
}

export async function adminFetchMerchantDetails(merchantId) {
  const json = await apiRequest(`/api/admin/merchants/${merchantId}`);
  return json.data || { merchant: null, coupons: [] };
}

export async function adminUpdateMerchantDetails(merchantId, updateData) {
  const json = await apiRequest(`/api/admin/merchants/${merchantId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
  return json.data?.merchant;
}

// ─────────────────────────────────────────────
// Campaign Moderation & Review APIs
// ─────────────────────────────────────────────

export async function adminFetchCampaignQueue() {
  const json = await apiRequest("/api/admin/campaigns");
  return json.data?.campaigns || [];
}

export async function adminFetchLiveCampaigns() {
  const json = await apiRequest("/api/admin/campaigns?status=live");
  return json.data?.campaigns || [];
}

export async function adminFetchScheduledCampaigns() {
  const json = await apiRequest("/api/admin/campaigns?status=scheduled");
  return json.data?.campaigns || [];
}

export async function adminFetchCampaignById(id) {
  const json = await apiRequest(`/api/admin/campaigns/${id}`);
  return json.data?.campaign || null;
}

export async function adminFetchCampaignAnalytics() {
  const json = await apiRequest("/api/admin/analytics");
  return json.data || {};
}

export async function adminReviewCampaign(campaignId, statusData) {
  const json = await apiRequest("/api/admin/campaigns", {
    method: "PUT",
    body: JSON.stringify({ campaignId, ...statusData }),
  });
  return json.data?.campaign;
}

// ─────────────────────────────────────────────
// SaaS Revenue APIs
// ─────────────────────────────────────────────

export async function adminFetchRevenueData() {
  const json = await apiRequest("/api/admin/revenue");
  return json.data || {};
}

export async function adminUpdatePayoutStatus(payoutId, status) {
  const json = await apiRequest("/api/admin/revenue", {
    method: "PUT",
    body: JSON.stringify({ payoutId, status }),
  });
  return json.data;
}

// ─────────────────────────────────────────────
// Platform Content/Settings APIs
// ─────────────────────────────────────────────

export async function adminFetchSettings() {
  const json = await apiRequest("/api/admin/settings");
  return json.data?.settings || {};
}

export async function adminUpdateSetting(key, value) {
  const json = await apiRequest("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ key, value }),
  });
  return json.data;
}
