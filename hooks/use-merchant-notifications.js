"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useRealtime } from "./use-realtime";
import { useSocket } from "./use-socket";

/**
 * Merchant real-time notifications hook.
 * Fetches notifications from DB and listens for live socket emissions.
 */
export function useMerchantNotifications(userId = null) {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket({ userId, role: "merchant" });

  const query = useQuery({
    queryKey: qk.merchant.notifications(),
    queryFn: async () => {
      const json = await apiFetch("/api/notifications");
      return json.data?.notifications || (Array.isArray(json.data) ? json.data : []);
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: isConnected ? false : 30000,
  });

  const notifications = query.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  // Real-time listener: New direct notification
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
    if (data?.notification?.title) {
      toast(data.notification.title, { duration: 4000, icon: "🔔" });
    }
    queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
  });

  // Real-time listener: Offer listing status change (Approval / Rejection)
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, (data) => {
    if (data?.title) {
      const isApproved = data.status === "active";
      toast(
        isApproved
          ? `Listing Approved: "${data.title}" is now live!`
          : `Listing Status Changed: "${data.title}" (${data.status})`,
        { duration: 5000, icon: isApproved ? "✅" : "⚠️" },
      );
    }
    queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
  });

  // Real-time listener: Campaign status change
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, (data) => {
    if (data?.name) {
      toast(`Campaign Update: "${data.name}" (${data.status})`, {
        duration: 5000,
        icon: "🚀",
      });
    }
    queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
  });

  // Real-time listener: Customer claimed coupon
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, (data) => {
    if (data?.couponTitle) {
      toast.success(`A customer saved your offer: "${data.couponTitle}"`, {
        duration: 4000,
        icon: "🎟️",
      });
    }
    queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
  });

  // Real-time listener: Customer redeemed coupon
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, (data) => {
    if (data?.couponTitle) {
      toast.success(`Coupon Redeemed: "${data.couponTitle}"!`, {
        duration: 5000,
        icon: "🎉",
      });
    }
    queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
  });

  // Mutation: Mark single notification read
  const markItemReadMutation = useMutation({
    mutationFn: async (id) => {
      return apiFetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
    },
  });

  // Mutation: Mark all notifications read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.merchant.notifications() });
      toast.success("All notifications marked as read!");
    },
  });

  return {
    ...query,
    notifications,
    unreadCount,
    isConnected,
    markItemRead: markItemReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markAllReadMutation.isPending,
  };
}
