"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE } from "@/components/shared/QueryProvider";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Fetch merchant-side analytics (revenue, claims, redemptions).
 * Used by the merchant dashboard and analytics pages.
 */
export function useMerchantAnalytics() {
  return useQuery({
    queryKey: qk.merchant.analytics(),
    staleTime: STALE.analytics,
    queryFn: async () => {
      const json = await apiFetch("/api/analytics");
      return json.data;
    },
  });
}

/**
 * Fetch admin-side analytics (platform-wide KPIs + pending actions).
 * Used by the admin dashboard.
 */
export function useAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: qk.admin.analytics(),
    staleTime: STALE.analytics,
    queryFn: async () => {
      const json = await apiFetch("/api/admin/analytics");
      return json.data;
    },
    ...options,
  });
}

/**
 * Fetch recent redemption activity for the merchant dashboard table.
 * @param {number} limit - number of rows to fetch (default 5)
 */
export function useRecentRedemptions(limit = 5) {
  return useQuery({
    queryKey: qk.merchant.recentRedemptions(),
    staleTime: STALE.analytics,
    queryFn: async () => {
      const json = await apiFetch(`/api/redemptions?limit=${limit}`);
      return json.data;
    },
  });
}
