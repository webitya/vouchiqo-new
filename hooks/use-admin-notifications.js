"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useRealtime } from "./use-realtime";
import { useSocket } from "./use-socket";

/**
 * Admin notifications and pending items hook with real-time push & fallback polling.
 */
export function useAdminNotifications() {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket({ role: "admin" });

  const query = useQuery({
    queryKey: qk.admin.notifications(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/notifications");
      return (
        json.data || {
          pendingMerchants: 0,
          pendingCoupons: 0,
          pendingCampaigns: 0,
          total: 0,
        }
      );
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    // Fallback polling when socket is disconnected
    refetchInterval: isConnected ? false : 30000,
  });

  // Listen for new merchant application submission
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, (data) => {
    toast.success(
      `New merchant application submitted: ${data.businessName || "Merchant Partner"}`,
      { duration: 5000, icon: "🏢" },
    );
    queryClient.invalidateQueries({ queryKey: qk.admin.notifications() });
    queryClient.invalidateQueries({ queryKey: qk.admin.pendingMerchants() });
  });

  // Listen for new coupon submission from merchant
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, (data) => {
    toast.success(`New offer submitted: ${data.title || "Discount Offer"}`, {
      duration: 5000,
      icon: "🏷️",
    });
    queryClient.invalidateQueries({ queryKey: qk.admin.notifications() });
    queryClient.invalidateQueries({ queryKey: qk.admin.pendingCoupons() });
  });

  // Listen for generic new admin notifications
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
    if (data?.title) {
      toast(data.title, { duration: 4000, icon: "🔔" });
    }
    queryClient.invalidateQueries({ queryKey: qk.admin.notifications() });
  });

  // Mark admin notifications as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/api/admin/notifications/read", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(qk.admin.notifications(), (old) =>
        old ? { ...old, total: 0 } : old,
      );
      queryClient.invalidateQueries({ queryKey: qk.admin.notifications() });
    },
  });

  return {
    ...query,
    notifications: query.data,
    unreadCount: query.data?.total || 0,
    isConnected,
    markAsRead: markAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
  };
}
