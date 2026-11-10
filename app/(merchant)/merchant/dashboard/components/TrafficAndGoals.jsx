"use client";

import { useQueryClient } from "@tanstack/react-query";
import TrafficSourcesDonutChart from "@/components/shared/TrafficSourcesDonutChart";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function TrafficAndGoals({
  pageViews = 0,
  totalRevenue = 0,
  totalClaims = 0,
  totalRedemptions = 0,
  analyticsData = {},
}) {
  const queryClient = useQueryClient();

  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.merchant.dashboard() });
  });

  // Monthly Targets
  const revenueGoal = analyticsData?.goals?.revenueTarget || 100000;
  const revenueActual = Number(totalRevenue) || 0;
  const revenuePct =
    revenueGoal > 0
      ? Math.min(100, Math.round((revenueActual / revenueGoal) * 100))
      : 0;

  const claimsGoal = analyticsData?.goals?.claimsTarget || 50;
  const claimsActual = Number(totalClaims) || 0;
  const claimsPct =
    claimsGoal > 0
      ? Math.min(100, Math.round((claimsActual / claimsGoal) * 100))
      : 0;

  const redemptionsActual = Number(totalRedemptions) || 0;
  const redemptionPct =
    claimsActual > 0
      ? Math.min(100, Math.round((redemptionsActual / claimsActual) * 100))
      : 0;

  return (
    <div className="col-span-full flex flex-col gap-3 xl:col-span-4 font-sans">
      {/* Traffic Sources Donut Card - Matching Reference Mockup */}
      <TrafficSourcesDonutChart
        analyticsData={analyticsData}
        pageViews={pageViews}
      />

      {/* Goals Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-xs overflow-hidden flex flex-col font-sans transition-all duration-300">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-row justify-between items-center">
          <div>
            <h3 className="font-sans text-xs font-bold text-slate-900 tracking-wider uppercase m-0 leading-none">
              Monthly Goals
            </h3>
            <p className="text-[11px] font-normal text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
              Track progress toward targets
            </p>
          </div>
        </div>
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Goal 1: Monthly Revenue */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">
                Monthly Revenue
              </span>
              <span className="text-[#F72853] font-medium text-xs">
                {revenuePct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-[#F72853]"
                style={{ width: `${revenuePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>₹{revenueActual.toLocaleString("en-IN")}</span>
              <span>Target: ₹{revenueGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 2: Coupon Claims */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">Coupon Claims</span>
              <span className="text-blue-600 font-medium text-xs">
                {claimsPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-blue-600"
                style={{ width: `${claimsPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>{claimsActual.toLocaleString("en-IN")}</span>
              <span>Target: {claimsGoal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Goal 3: Conversion Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-700">
                Conversion Rate
              </span>
              <span className="text-emerald-600 font-medium text-xs">
                {redemptionPct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500"
                style={{ width: `${redemptionPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-normal">
              <span>{redemptionsActual} redeemed</span>
              <span>of {claimsActual} claimed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
