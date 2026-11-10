"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Centralized TanStack Query hooks for all admin operations.
 * Single source of truth for admin data fetching, mutations, and cache management.
 */

// ─────────────────────────────────────────────
// Admin Overview Analytics
// ─────────────────────────────────────────────

/**
 * Fetch platform-wide admin analytics and KPI metrics.
 */
export function useAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: qk.admin.analytics(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/analytics");
      return json.data || null;
    },
    staleTime: 30_000,
    ...options,
  });
}

// ─────────────────────────────────────────────
// Admin Coupons / Moderation / Offers
// ─────────────────────────────────────────────

/**
 * Fetch coupons with server-side filters (status, search, isVerified).
 */
export function useAdminCoupons({ status = "", search = "", isVerified } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (isVerified !== undefined && isVerified !== null) {
    params.set("isVerified", String(isVerified));
  }
  const qs = params.toString();

  return useQuery({
    queryKey: qk.admin.coupons({ status, search, isVerified }),
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/coupons${qs ? `?${qs}` : ""}`);
      return json.data?.coupons || [];
    },
    staleTime: 30_000, // socket invalidates on live events
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch pending coupons specifically for moderation desk.
 */
export function useAdminPendingCoupons() {
  return useQuery({
    queryKey: qk.admin.pendingCoupons(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/coupons?status=pending");
      return json.data?.coupons || [];
    },
    staleTime: 30_000, // socket invalidates on live events
    refetchOnWindowFocus: false,
  });
}

/**
 * Approve a pending coupon.
 */
export function useApproveAdminCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId) =>
      apiFetch("/api/admin/coupons", {
        method: "PUT",
        body: { couponId, isVerified: true, status: "active" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: qk.admin.pendingCoupons(),
        refetchType: "active",
      });
      toast.success("Offer approved and published!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to approve offer.");
    },
  });
}

/**
 * Reject a pending coupon with a reason.
 */
export function useRejectAdminCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, reason }) =>
      apiFetch("/api/admin/coupons", {
        method: "PUT",
        body: {
          couponId,
          isVerified: false,
          status: "paused",
          rejectionReason: reason,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: qk.admin.pendingCoupons(),
        refetchType: "active",
      });
      toast.success("Offer rejected.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reject offer.");
    },
  });
}

/**
 * Update arbitrary fields on an admin coupon.
 */
export function useUpdateAdminCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, ...updateData }) =>
      apiFetch("/api/admin/coupons", {
        method: "PUT",
        body: { couponId, ...updateData },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: qk.admin.pendingCoupons() });
      toast.success("Offer updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update offer.");
    },
  });
}

/**
 * Delete a coupon from the admin desk.
 */
export function useDeleteAdminCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId) =>
      apiFetch(`/api/admin/coupons?id=${couponId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: qk.admin.pendingCoupons() });
      toast.success("Offer deleted.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete offer.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Merchants Management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fetch all registered merchants.
 */
export function useAdminMerchants(params = {}) {
  const { status = "", search = "", limit = 500 } = params;
  const sp = new URLSearchParams();
  if (status) sp.set("status", status);
  if (search) sp.set("search", search);
  if (limit) sp.set("limit", String(limit));
  const qs = sp.toString();

  return useQuery({
    queryKey: qk.admin.merchants(params),
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/merchants${qs ? `?${qs}` : ""}`);
      return json.data?.merchants || json.data || [];
    },
    staleTime: 30_000, // invalidated by useRealtime in consuming components
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch merchant details and their listed coupons.
 */
export function useAdminMerchantDetail(merchantId) {
  return useQuery({
    queryKey: qk.admin.merchantDetail(merchantId),
    enabled: !!merchantId,
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/merchants/${merchantId}`);
      return json.data || { merchant: null, coupons: [] };
    },
  });
}

/**
 * Review/Approve/Reject a merchant account application.
 */
export function useReviewMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantId, status, rejectionReason }) =>
      apiFetch("/api/admin/merchants", {
        method: "PUT",
        body: { merchantId, status, rejectionReason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
      toast.success("Merchant status updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update merchant status.");
    },
  });
}

/**
 * Update merchant profile details from admin portal.
 */
export function useUpdateAdminMerchant(merchantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData) =>
      apiFetch(`/api/admin/merchants/${merchantId}`, {
        method: "PUT",
        body: updateData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
      queryClient.invalidateQueries({
        queryKey: qk.admin.merchantDetail(merchantId),
      });
      toast.success("Merchant details updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update merchant details.");
    },
  });
}

/**
 * Delete merchant partner from admin portal.
 */
export function useDeleteAdminMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (merchantId) =>
      apiFetch(`/api/admin/merchants/${merchantId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
      toast.success("Merchant partner and associated data deleted!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete merchant.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Campaign Moderation & Management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fetch campaigns by status (pending, live, scheduled, etc.).
 */
export function useAdminCampaigns(status = "") {
  const qs = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: qk.admin.campaigns({ status }),
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/campaigns${qs}`);
      return json.data?.campaigns || [];
    },
    staleTime: 15_000,
  });
}

/**
 * Fetch single campaign details.
 */
export function useAdminCampaignDetail(campaignId) {
  return useQuery({
    queryKey: qk.admin.campaignDetail(campaignId),
    enabled: !!campaignId,
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/campaigns/${campaignId}`);
      return json.data?.campaign || null;
    },
  });
}

/**
 * Fetch campaign queue (pending approval).
 */
export function useAdminCampaignQueue() {
  return useQuery({
    queryKey: qk.admin.campaignQueue(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/campaigns?status=pending");
      return json.data?.campaigns || [];
    },
    staleTime: 10_000,
  });
}

/**
 * Fetch campaign analytics summary.
 */
export function useAdminCampaignAnalytics() {
  return useQuery({
    queryKey: qk.admin.campaignAnalytics(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/analytics");
      return json.data || {};
    },
    staleTime: 60_000,
  });
}

/**
 * Review/Approve/Reject a merchant marketing campaign.
 */
export function useReviewCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, ...statusData }) =>
      apiFetch("/api/admin/campaigns", {
        method: "PUT",
        body: { campaignId, ...statusData },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: qk.admin.campaignQueue() });
      toast.success("Campaign updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update campaign.");
    },
  });
}

/**
 * Deploy/Create admin campaign broadcast.
 */
export function useCreateAdminCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      apiFetch("/api/admin/campaigns", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: qk.admin.campaignQueue() });
      toast.success(
        "Platform Multi-Channel Broadcast successfully deployed live!",
      );
    },
    onError: (err) => {
      toast.error(err.message || "Failed to deploy broadcast.");
    },
  });
}

/**
 * Fetch campaign revenue and transactions.
 */
export function useAdminCampaignRevenue() {
  return useQuery({
    queryKey: qk.admin.campaignRevenue(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/campaigns/revenue");
      return json.data || { kpis: {}, transactions: [] };
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch affiliate products for admin moderation.
 */
export function useAdminAffiliateProducts({ status = "", search = "" } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  const qs = params.toString();

  return useQuery({
    queryKey: qk.admin.affiliateProducts({ status, search }),
    queryFn: async () => {
      const json = await apiFetch(
        `/api/admin/affiliate-products${qs ? `?${qs}` : ""}`,
      );
      return json.data || json || [];
    },
    staleTime: 30_000,
  });
}

/**
 * Update affiliate product status or details.
 */
export function useUpdateAffiliateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) =>
      apiFetch(`/api/admin/affiliate-products/${id}`, {
        method: "PUT",
        body: updateData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-affiliate-products"],
        exact: false,
      });
      toast.success("Affiliate product updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update affiliate product.");
    },
  });
}

/**
 * Delete affiliate product.
 */
export function useDeleteAffiliateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) =>
      apiFetch(`/api/admin/affiliate-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-affiliate-products"],
        exact: false,
      });
      toast.success("Affiliate product deleted!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete affiliate product.");
    },
  });
}

/**
 * Fetch broadcast email recipients.
 */
export function useBroadcastRecipients() {
  return useQuery({
    queryKey: qk.admin.broadcastRecipients(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/broadcast/email");
      return json.data || null;
    },
    staleTime: 60_000,
  });
}

// ─────────────────────────────────────────────
// Banners Management
// ─────────────────────────────────────────────

/**
 * Fetch homepage/category promotional banners.
 */
export function useAdminBanners() {
  return useQuery({
    queryKey: qk.admin.banners(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/banners");
      return json.data?.banners || json.data || [];
    },
    staleTime: 30_000,
  });
}

/**
 * Create a new promotional banner.
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bannerData) =>
      apiFetch("/api/admin/banners", { method: "POST", body: bannerData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.banners() });
      toast.success("Banner created!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create banner.");
    },
  });
}

/**
 * Update an existing promotional banner.
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) =>
      apiFetch("/api/admin/banners", {
        method: "PUT",
        body: { id, ...updateData },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.banners() });
      toast.success("Banner updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update banner.");
    },
  });
}

/**
 * Delete a promotional banner.
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bannerId) =>
      apiFetch(`/api/admin/banners?id=${bannerId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.banners() });
      toast.success("Banner deleted.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete banner.");
    },
  });
}

/**
 * Reorder promotional banners.
 */
export function useReorderBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (arg) => {
      const bannerIds = Array.isArray(arg) ? arg : arg?.bannerIds || arg?.items;
      return apiFetch("/api/admin/banners/reorder", {
        method: "PUT",
        body: { bannerIds },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.banners() });
      toast.success("Banner display order updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save banner reorder.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Platform Content / Settings
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useAdminSettings() {
  return useQuery({
    queryKey: qk.admin.settings(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/settings");
      return json.data?.settings || {};
    },
  });
}

export function useUpdateAdminSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }) =>
      apiFetch("/api/admin/settings", { method: "PUT", body: { key, value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.settings() });
      toast.success("Setting updated.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SaaS Revenue
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useAdminRevenue() {
  return useQuery({
    queryKey: qk.admin.revenue(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/revenue");
      return json.data || {};
    },
  });
}

export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, status }) =>
      apiFetch("/api/admin/revenue", {
        method: "PUT",
        body: { payoutId, status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.revenue() });
      toast.success("Payout status updated.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Revival Management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useMerchantRevivals() {
  return useQuery({
    queryKey: qk.admin.merchantRevivals(),
    queryFn: async () => {
      const json = await apiFetch("/api/revivals?status=pending");
      return json.data?.revivals || [];
    },
  });
}

export function useCustomerRevivals() {
  return useQuery({
    queryKey: qk.admin.customerRevivals(),
    queryFn: async () => {
      const json = await apiFetch("/api/revivals/customer?admin=true");
      return json.data?.revivals || [];
    },
  });
}

export function useReviewMerchantRevival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ revivalId, status, reviewNote }) =>
      apiFetch("/api/revivals", {
        method: "PUT",
        body: {
          revivalId,
          status,
          reviewNote:
            reviewNote ||
            (status === "approved" ? "Approved by admin" : "Rejected by admin"),
        },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.admin.merchantRevivals() });
      toast.success(`Revival request ${variables.status}!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update revival status.");
    },
  });
}

export function useReviewCustomerRevival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ revivalId, status }) =>
      apiFetch("/api/revivals/customer", {
        method: "PUT",
        body: { revivalId, status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.admin.customerRevivals() });
      toast.success("Customer revival updated.");
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// User Management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useAdminUsers(filters = {}) {
  const {
    role = "",
    isActive = "",
    merchantStatus = "",
    search = "",
  } = filters;

  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (isActive !== "") params.set("isActive", isActive);
  if (merchantStatus) params.set("merchantStatus", merchantStatus);
  if (search) params.set("search", search);
  const qs = params.toString();

  return useQuery({
    queryKey: qk.admin.users({ role, isActive, merchantStatus, search }),
    queryFn: async () => {
      const json = await apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
      return json.data?.users || [];
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ authId, isActive }) =>
      apiFetch("/api/admin/users", {
        method: "PUT",
        body: { authId, isActive: !isActive },
      }),
    onMutate: async ({ authId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const prev = queryClient.getQueriesData({ queryKey: ["admin-users"] });
      queryClient.setQueriesData({ queryKey: ["admin-users"] }, (old) =>
        Array.isArray(old)
          ? old.map((u) =>
              u.authId === authId ? { ...u, isActive: !isActive } : u,
            )
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error("Failed to update user status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useExportSubscribers() {
  return useMutation({
    mutationFn: async () => {
      const json = await apiFetch("/api/admin/users?export=true");
      return json.data?.subscribers || [];
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authId) =>
      apiFetch(`/api/admin/users?authId=${authId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
      toast.success(
        "Customer account and all associated records deleted permanently!",
      );
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete customer user.");
    },
  });
}
