"use client";

import {
  CheckCircle2,
  Eye,
  IndianRupee,
  LayoutList,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function RechartsSparkline({
  data = [],
  dataKey = "value",
  color = "#F72853",
}) {
  if (data.length === 0) return null;
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 1, right: 1, left: 1, bottom: 1 }}
        >
          <defs>
            <linearGradient
              id={`sparkGrad-${dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkGrad-${dataKey})`}
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  sparkData,
  sparkKey,
  sparkColor,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-2xs group relative overflow-hidden transition-all duration-200 hover:border-slate-300 font-sans">
      <div className="p-3.5 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-normal text-slate-500">{title}</p>
            <p className="text-xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
              {trend !== null && trend !== undefined ? (
                trend >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                )
              ) : null}
              {trend !== null && trend !== undefined && (
                <span
                  className={`text-[11px] font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-normal">
                {trend !== null && trend !== undefined
                  ? "vs last month"
                  : subtitle}
              </span>
            </div>
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${iconBg}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </div>
      <div className="h-7 w-full mt-1.5">
        <RechartsSparkline
          data={sparkData}
          dataKey={sparkKey}
          color={sparkColor}
        />
      </div>
    </div>
  );
}

export default function KpiCards({
  totalRevenue = 0,
  revenueMoM,
  totalClaims = 0,
  totalRedemptions = 0,
  ordersMoM,
  pageViews = 0,
  trendData = [],
  activeCoupons = 0,
  planLimit = 0,
}) {
  const listingPct =
    planLimit > 0
      ? Math.min(100, Math.round((activeCoupons / planLimit) * 100))
      : 0;

  const numRevenue = Number(totalRevenue);
  const safeTotalRevenue = Number.isNaN(numRevenue) ? 0 : numRevenue;
  const numRedemptions = Number(totalRedemptions);
  const safeTotalRedemptions = Number.isNaN(numRedemptions)
    ? 0
    : numRedemptions;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Total Clicks */}
      <KpiCard
        title="Total Clicks This Month"
        value={pageViews > 0 ? pageViews.toLocaleString("en-IN") : "0"}
        subtitle="Coupon page visits"
        icon={Eye}
        iconBg="bg-rose-50 text-[#F72853]"
        iconColor="text-[#F72853]"
        sparkData={trendData.map((t) => t.views || 0)}
        sparkKey="clicks"
        sparkColor="#F72853"
      />

      {/* Card 2: Coupon Redemptions */}
      <KpiCard
        title="Coupon Redemptions"
        value={safeTotalRedemptions.toLocaleString("en-IN")}
        trend={safeTotalRedemptions > 0 ? ordersMoM : null}
        subtitle="Redeemed by customers"
        icon={CheckCircle2}
        iconBg="bg-emerald-50 text-emerald-600"
        iconColor="text-emerald-600"
        sparkData={trendData.map((t) => t.redemptions || t.orders || 0)}
        sparkKey="redemptions"
        sparkColor="#10b981"
      />

      {/* Card 3: Revenue Driven */}
      <KpiCard
        title="Est. Revenue Driven"
        value={`₹${safeTotalRevenue.toLocaleString("en-IN")}`}
        trend={safeTotalRevenue > 0 ? revenueMoM : null}
        subtitle="Gross sale value driven"
        icon={IndianRupee}
        iconBg="bg-blue-50 text-blue-600"
        iconColor="text-blue-600"
        sparkData={trendData.map((t) => t.revenue || 0)}
        sparkKey="revenue"
        sparkColor="#3b82f6"
      />

      {/* Card 4: Active Listings with plan limit */}
      <div className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-2xs group relative overflow-hidden transition-all duration-200 hover:border-slate-300 font-sans">
        <div className="p-3.5 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1 w-full">
              <p className="text-xs font-normal text-slate-500">
                Active Listings
              </p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight">
                {activeCoupons ?? 0}
                {planLimit > 0 && (
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    / {planLimit}
                  </span>
                )}
              </p>
              {planLimit > 0 ? (
                <div className="space-y-1 w-full pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${listingPct >= 90 ? "bg-[#F72853]" : "bg-purple-600"}`}
                      style={{ width: `${listingPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {listingPct}% of plan limit used
                  </p>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">
                  Live coupons &amp; deals
                </span>
              )}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 ml-2.5 shrink-0">
              <LayoutList className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="h-7 w-full mt-1.5">
          <RechartsSparkline
            data={trendData.map((t) => t.views || t.orders || 0)}
            dataKey="listings"
            color="#8b5cf6"
          />
        </div>
      </div>
    </div>
  );
}
