"use client";

import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import TrafficSourcesDonutChart from "@/components/shared/TrafficSourcesDonutChart";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function TrafficSourcesCard({ analyticsData = {} }) {
  const queryClient = useQueryClient();

  // Real-time socket updates
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  return <TrafficSourcesDonutChart analyticsData={analyticsData} />;
}
