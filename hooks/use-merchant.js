"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { STALE } from "@/components/shared/QueryProvider";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Fetch the current merchant's business profile.
 *
 * Replaces the 7 inline copies of the `["merchant-profile"]` query that were
 * pasted across analytics, billing, campaigns, coupons, coupons/new,
 * coupons/[id], and profile.
 *
 * @returns {object} useQuery result — `data` is the merchant object (or null)
 */
export function useMerchantProfile(options = {}) {
  return useQuery({
    queryKey: qk.merchant.profile(),
    staleTime: STALE.profile,
    queryFn: async () => {
      try {
        const json = await apiFetch("/api/merchants/me");
        return json.data || null;
      } catch (err) {
        if (err?.status === 404) return null;
        throw err;
      }
    },
    ...options,
  });
}

/**
 * Fetch merchant performance analytics.
 */
export function useMerchantAnalytics(period = "") {
  return useQuery({
    queryKey: period ? [...qk.merchant.analytics(), period] : qk.merchant.analytics(),
    queryFn: async () => {
      const json = await apiFetch(`/api/analytics${period ? `?period=${period}` : ""}`);
      return json.data;
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch recent redemptions for merchant desk.
 */
export function useMerchantRecentRedemptions(limit = 5) {
  return useQuery({
    queryKey: [...qk.merchant.recentRedemptions(), limit],
    queryFn: async () => {
      const json = await apiFetch(`/api/redemptions?limit=${limit}`);
      return json.data || { redemptions: [] };
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch recent claims for merchant desk.
 */
export function useMerchantRecentClaims(limit = 5) {
  return useQuery({
    queryKey: ["merchant-recent-claims", limit],
    queryFn: async () => {
      const json = await apiFetch(`/api/claims?limit=${limit}`);
      return json.data || { claims: [] };
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch affiliate products for merchant.
 */
export function useMerchantAffiliateProducts(status = "") {
  const query = new URLSearchParams();
  if (status && status !== "all") query.set("status", status);
  const qs = query.toString();

  return useQuery({
    queryKey: ["merchant-affiliate-products", status],
    queryFn: async () => {
      const json = await apiFetch(`/api/merchant/affiliate-products${qs ? `?${qs}` : ""}`);
      return json.data || [];
    },
    staleTime: 30_000,
  });
}

/**
 * Update merchant affiliate product.
 */
export function useUpdateMerchantAffiliateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      apiFetch(`/api/merchant/affiliate-products/${id}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-affiliate-products"] });
      toast.success("Affiliate product updated successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update affiliate product.");
    },
  });
}

/**
 * Delete merchant affiliate product.
 */
export function useDeleteMerchantAffiliateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) =>
      apiFetch(`/api/merchant/affiliate-products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-affiliate-products"] });
      toast.success("Affiliate product deleted successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete affiliate product.");
    },
  });
}

/**
 * Fetch marketing campaigns for merchant.
 */
export function useMerchantCampaigns() {
  return useQuery({
    queryKey: qk.merchant.campaigns(),
    queryFn: async () => {
      const json = await apiFetch("/api/campaigns");
      return (
        json?.data?.campaigns ||
        (Array.isArray(json?.data) ? json.data : []) ||
        []
      );
    },
    staleTime: 30_000,
  });
}


