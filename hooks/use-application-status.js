"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { authClient } from "@/lib/auth-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useRealtime } from "./use-realtime";
import { useSocket } from "./use-socket";

/**
 * Hook for merchant application status + real-time updates + fallback polling.
 */
export function useApplicationStatus() {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();

  const query = useQuery({
    queryKey: qk.merchant.applicationStatus(),
    queryFn: async () => {
      const json = await apiFetch("/api/merchant/application/status");
      return json.data || null;
    },
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    refetchInterval: (q) => {
      const data = q?.state?.data;
      const isApproved = data?.status === "approved" || data?.status === "active";
      return !isApproved ? 4000 : false;
    },
  });

  // Listen for real-time application status change
  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, (data) => {
    if (data?.status) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
        authClient.getSession({ query: { disableCookieCache: true } }).catch(() => {});
      }

      queryClient.setQueryData(qk.merchant.applicationStatus(), (old) => {
        if (!old) return old;
        const isApproved = data.status === "approved" || data.status === "active";
        const isRejected = data.status === "rejected";
        const isPending = data.status === "pending";
        const progressPercentage = isApproved
          ? 100
          : isRejected
            ? 50
            : isPending
              ? 33
              : 66;

        return {
          ...old,
          status: data.status,
          progressPercentage,
          rejectionReason: data.rejectionReason || old.rejectionReason,
          lastUpdatedAt: new Date().toISOString(),
        };
      });

      // Invalidate to ensure consistent server state across application, profile, and sidebar badges
      queryClient.invalidateQueries({
        queryKey: qk.merchant.applicationStatus(),
      });
      queryClient.invalidateQueries({
        queryKey: qk.merchant.profile(),
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant-profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant-badges"],
      });
    }
  });

  return {
    ...query,
    application: query.data,
    isConnected,
  };
}
