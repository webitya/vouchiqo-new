"use client";

import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function MonthlyGoalsCard({ analyticsData = {} }) {
  const queryClient = useQueryClient();

  // Socket.IO Real-time listeners to keep goals updated instantly
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
  });

  const kpis = analyticsData?.kpis ?? {};

  // Goal 1: Monthly Revenue MRR
  const revActual = Number(kpis.monthlyRevenue) || 0;
  const revTarget = 50000;
  const revPct =
    revTarget > 0 ? Math.min(100, Math.round((revActual / revTarget) * 100)) : 0;

  // Goal 2: Merchant Partners
  const merchantsActual = Number(kpis.totalMerchants) || 0;
  const merchantsTarget = 50;
  const merchantsPct =
    merchantsTarget > 0
      ? Math.min(100, Math.round((merchantsActual / merchantsTarget) * 100))
      : 0;

  // Goal 3: Active Deals & Offers
  const couponsActual = Number(kpis.activeCoupons) || 0;
  const couponsTarget = 100;
  const couponsPct =
    couponsTarget > 0
      ? Math.min(100, Math.round((couponsActual / couponsTarget) * 100))
      : 0;

  const goals = [
    {
      title: "Monthly Revenue",
      current: `₹${revActual.toLocaleString("en-IN")}`,
      target: `Target: ₹${revTarget.toLocaleString("en-IN")}`,
      pct: revPct,
      color: "bg-[#2563eb]",
    },
    {
      title: "Merchant Partners",
      current: `${merchantsActual.toLocaleString("en-IN")}`,
      target: `Target: ${merchantsTarget.toLocaleString("en-IN")}`,
      pct: merchantsPct,
      color: "bg-[#2563eb]",
    },
    {
      title: "Active Deals & Offers",
      current: `${couponsActual.toLocaleString("en-IN")}`,
      target: `Target: ${couponsTarget.toLocaleString("en-IN")}`,
      pct: couponsPct,
      color: "bg-[#3e80dd]",
    },
  ];

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col p-0 gap-0 text-left font-sans">
      <CardHeader className="px-4 py-3 sm:px-5 sm:py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 min-h-[48px]">
        <CardTitle className="font-sans text-xs font-medium text-slate-800 tracking-wider uppercase m-0 leading-none">
          Monthly Goals
        </CardTitle>
        <CardDescription className="text-[11px] font-normal text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
          Track progress toward targets (Live DB)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-4 space-y-3.5">
        {goals.map((g, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-slate-700 font-normal">{g.title}</span>
              <span className="text-blue-600 font-medium">{g.pct}%</span>
            </div>
            {/* Shadcn Progress component */}
            <Progress
              value={g.pct}
              className="h-1.5 rounded-full bg-slate-100"
              indicatorClassName={g.color}
            />
            <div className="flex items-center justify-between text-[10px] font-normal text-slate-400">
              <span>{g.current}</span>
              <span>{g.target}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
