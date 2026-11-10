"use client";

import { useMerchantAnalytics, useMerchantProfile } from "@/hooks/use-merchant";
import {
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  Lock,
  MousePointerClick,
  Share2,
  ShoppingBag,
  Ticket,
  TicketCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ClicksTrendChart = dynamic(
  () => import("./components/ClicksTrendChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full rounded-xl bg-slate-100 animate-pulse" />
    ),
  }
);

const BestDaysChart = dynamic(
  () => import("./components/BestDaysChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
    ),
  }
);
import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/shared/cards/KPICard";
import AnalyticsCard from "@/components/shared/data/AnalyticsCard";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import FormSelect from "@/components/shared/form/FormSelect";
import TrafficSourcesDonutChart from "@/components/shared/TrafficSourcesDonutChart";
import { Button } from "@/components/ui/button";

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "12px",
  },
  labelStyle: { fontSize: "10px", color: "#94a3b8" },
  itemStyle: { fontSize: "12px", color: "#fff" },
};

export default function MerchantAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [couponFilter, setCouponFilter] = useState("all");

  // ── 1. TANSTACK QUERY DATA FETCHING ──
  const { data: merchant, isLoading: loadingProfile } = useMerchantProfile();

  const period = timeRange === "7" ? "7d" : timeRange === "90" ? "90d" : "30d";
  const { data: analyticsData, isLoading: loadingAnalytics } = useMerchantAnalytics(period);

  // ── 2. COMPUTED METRICS FROM DB ──
  const plan = merchant?.plan || "starter";
  const isGrowthPlus = plan !== "starter";

  const kpi = analyticsData?.kpi ?? {};
  const trendData = analyticsData?.trend ?? [];
  const trafficSourcesRaw = analyticsData?.trafficSources ?? [];
  const weekdayTrendData = analyticsData?.weekdayTrend ?? [];
  const topCouponsRaw = analyticsData?.topCoupons ?? [];

  const totalClicks = kpi.totalClicks ?? merchant?.totalClicks ?? 0;
  const totalClaims = kpi.totalClaims ?? merchant?.totalClaims ?? 0;
  const totalRedemptions =
    kpi.totalRedemptions ?? merchant?.totalRedemptions ?? 0;
  const totalImpressions =
    kpi.totalImpressions ?? merchant?.totalImpressions ?? 0;
  const redemptionRate = kpi.redemptionRate ?? "0.0%";

  // Calculate Revenue and Average Order Value (AOV) from DB
  const totalRevenue = useMemo(() => {
    return topCouponsRaw.reduce(
      (sum, c) => sum + (c.totalRedemptions || 0) * (c.discountValue || 100),
      0,
    );
  }, [topCouponsRaw]);

  const aov =
    totalRedemptions > 0 ? Math.round(totalRevenue / totalRedemptions) : 0;

  // Traffic Sources Chart Data (100% Dynamic from DB)
  const trafficSources = useMemo(() => {
    if (!trafficSourcesRaw || trafficSourcesRaw.length === 0) {
      return [{ name: "Direct & Search", value: 100, color: "#2563eb" }];
    }
    const totalVal = trafficSourcesRaw.reduce(
      (sum, s) => sum + (s.value || 0),
      0,
    );
    if (totalVal === 0) {
      return [{ name: "Direct & Search", value: 100, color: "#2563eb" }];
    }
    return trafficSourcesRaw.map((s) => ({
      name: s.name,
      value: Math.round(((s.value || 0) / totalVal) * 100) || 0,
      color: s.color || "#2563eb",
    }));
  }, [trafficSourcesRaw]);

  // Weekday Performance Chart Data (100% Dynamic from DB)
  const dayData = useMemo(() => {
    if (!weekdayTrendData || weekdayTrendData.length === 0) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        value: 0,
      }));
    }
    return weekdayTrendData.map((d) => ({
      day: d.label,
      value: d.redemptions || 0,
    }));
  }, [weekdayTrendData]);

  // Peak Day calculation
  const peakDay = useMemo(() => {
    if (!dayData || dayData.length === 0) return "Mon";
    const max = Math.max(...dayData.map((d) => d.value));
    if (max === 0) return "Mon";
    return dayData.find((d) => d.value === max)?.day || "Mon";
  }, [dayData]);

  // Top 5 Coupons Array (100% Dynamic from DB)
  const top5Coupons = useMemo(() => {
    if (!topCouponsRaw || topCouponsRaw.length === 0) return [];
    return topCouponsRaw.slice(0, 5).map((c) => ({
      name: c.title,
      code: c.code || "OFFER",
      redemptions: c.totalRedemptions || 0,
      clicks: c.clickCount || 0,
      impressions: c.impressionCount || 0,
    }));
  }, [topCouponsRaw]);

  // DataTable Rows (100% Dynamic from DB)
  const tableRows = useMemo(() => {
    if (!topCouponsRaw || topCouponsRaw.length === 0) return [];
    return topCouponsRaw.map((c) => {
      const clicks = c.clickCount || c.viewCount || 0;
      const redemptions = c.totalRedemptions || 0;
      const successRate =
        clicks > 0 ? parseFloat(((redemptions / clicks) * 100).toFixed(1)) : 0;
      const revenue = redemptions * (c.discountValue || 100);

      return {
        id: c._id || c.title,
        title: c.title,
        code: c.code || "—",
        clicks,
        redemptions,
        successRate,
        revenue,
        status: c.status || "active",
      };
    });
  }, [topCouponsRaw]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!tableRows || tableRows.length === 0) {
      alert("No analytics data available to export.");
      return;
    }
    const headers = [
      "Coupon Title",
      "Code",
      "Clicks",
      "Redemptions",
      "Success Rate (%)",
      "Revenue (INR)",
      "Status",
    ];
    const rows = tableRows.map(
      (r) =>
        `"${r.title.replace(/"/g, '""')}","${r.code}",${r.clicks},${r.redemptions},${r.successRate},${r.revenue},"${r.status}"`,
    );
    const csvContent = `\uFEFF${[headers.join(","), ...rows].join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `vouchiqo_analytics_${timeRange}d_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DataTable Columns
  const tableColumns = [
    {
      key: "title",
      header: "Coupon Title",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-800 truncate block max-w-[180px]">
          {row.title}
        </span>
      ),
    },
    {
      key: "code",
      header: "Offer Code",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 uppercase font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Total Clicks",
      sortable: true,
      cell: (row) => (
        <span className="text-right block font-medium">
          {(Number(row?.clicks) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      sortable: true,
      cell: (row) => (
        <span className="text-right block font-bold text-slate-900">
          {(Number(row?.redemptions) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "successRate",
      header: "Conversion Rate",
      sortable: true,
      cell: (row) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full block text-center ${
            (Number(row?.successRate) || 0) >= 10
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {Number(row?.successRate) || 0}%
        </span>
      ),
    },
    {
      key: "revenue",
      header: "Estimated Revenue",
      sortable: true,
      cell: (row) => (
        <span className="text-right block font-black text-slate-900">
          ₹{(Number(row?.revenue) || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  // ── 3. LOADING SKELETON ──
  if (loadingProfile || loadingAnalytics) {
    return (
      <DashboardLayout title="Store Analytics" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  // ── 4. PLAN GATING GUARD ──
  if (!isGrowthPlus) {
    return (
      <DashboardLayout
        title="Store Analytics"
        user={{
          name: merchant?.businessName || "Merchant Partner",
          role: "merchant",
        }}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-6 font-sans">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-black text-slate-900">
              Analytics Requires Growth Plan
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Upgrade to Growth Plan or above to unlock detailed real-time
              analytics: impressions, clicks, redemption rates, coupon
              performance tables, and audience insights.
            </p>
          </div>
          <Link
            href="/merchant/billing"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 border-0 cursor-pointer"
          >
            Upgrade to Growth — ₹1,499/mo
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Store Analytics"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans w-full">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Report Interval:</span>
            <FormSelect
              value={timeRange}
              onValueChange={setTimeRange}
              options={[
                { value: "7", label: "Last 7 Days" },
                { value: "30", label: "Last 30 Days" },
                { value: "90", label: "Last 90 Days" },
              ]}
              triggerClassName="min-w-[155px] bg-slate-50 h-8 border-slate-200 text-xs rounded-xl font-bold"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs h-8 py-1.5 px-3.5 font-bold flex items-center gap-1.5 border-slate-200 rounded-xl cursor-pointer shadow-none text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* 6 Reusable KPI Cards (Dynamic DB values) */}
        <div
          data-tour="analytics-kpi"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          <KPICard
            title="Total Impressions"
            value={(Number(totalImpressions) || 0).toLocaleString()}
            subtitle="ticker & list views"
            icon={Eye}
            iconClassName="bg-blue-50 border-blue-200/80 text-blue-600"
          />
          <KPICard
            title="Total Clicks"
            value={(Number(totalClicks) || 0).toLocaleString()}
            subtitle="offer detail visits"
            icon={Share2}
            iconClassName="bg-indigo-50 border-indigo-200/80 text-indigo-600"
          />
          <KPICard
            title="Coupon Claims"
            value={(Number(totalClaims) || 0).toLocaleString()}
            subtitle="codes claimed"
            icon={Ticket}
            iconClassName="bg-amber-50 border-amber-200/80 text-amber-600"
          />
          <KPICard
            title="Redemptions"
            value={(Number(totalRedemptions) || 0).toLocaleString()}
            subtitle="verified in-store"
            icon={CheckCircle2}
            iconClassName="bg-emerald-50 border-emerald-200/80 text-emerald-600"
          />
          <KPICard
            title="Redemption Rate"
            value={redemptionRate}
            subtitle="clicks → redemptions"
            icon={TrendingUp}
            iconClassName="bg-purple-50 border-purple-200/80 text-purple-600"
          />
          <KPICard
            title="Avg. Order Value"
            value={aov > 0 ? `₹${aov}` : "—"}
            subtitle="est. value / order"
            icon={ShoppingBag}
            iconClassName="bg-blue-50 border-blue-200/80 text-blue-600"
          />
        </div>

        {/* Chart Row 1: Clicks vs Redemptions & Top 5 Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Clicks vs Redemptions Trend Line Chart */}
          <div className="lg:col-span-7 flex flex-col">
            <AnalyticsCard
              title="Clicks vs Redemptions Trend"
              extra={
                <span className="text-[11px] font-semibold text-slate-400">
                  {timeRange === "7"
                    ? "Daily (7D)"
                    : timeRange === "90"
                      ? "Daily (90D)"
                      : "Daily (30D)"}
                </span>
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <MousePointerClick className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Clicks
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <TicketCheck className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Redemptions
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Period Clicks:{" "}
                  <strong className="text-slate-900">{totalClicks}</strong>
                </span>
              </div>

              <div className="h-56 w-full">
                <ClicksTrendChart data={trendData} />
              </div>

            </AnalyticsCard>
          </div>

          {/* Top 5 Coupons by Redemptions Bar List */}
          <div className="lg:col-span-5 flex flex-col">
            <AnalyticsCard
              title="Top 5 Coupons"
              extra={
                <span className="text-[11px] font-semibold text-slate-400">
                  By Redemptions
                </span>
              }
            >
              {top5Coupons.length === 0
                ? <div className="py-12 text-center text-slate-400 font-medium text-xs">
                    No active coupon redemptions recorded.
                  </div>
                : <div className="space-y-3.5 py-1">
                    {top5Coupons.map((coupon, idx) => {
                      const maxVal = top5Coupons[0]?.redemptions || 1;
                      const pct =
                        Math.round((coupon.redemptions / maxVal) * 100) || 0;
                      return (
                        <div key={coupon.name || idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 min-w-0">
                              <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                #{idx + 1}
                              </span>
                              <span
                                className="truncate max-w-[130px] sm:max-w-[170px]"
                                title={coupon.name}
                              >
                                {coupon.name}
                              </span>
                              <span className="font-mono text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1 py-0.2 rounded font-bold shrink-0 uppercase">
                                {coupon.code}
                              </span>
                            </div>
                            <span className="font-black text-slate-900 text-xs shrink-0">
                              {coupon.redemptions}{" "}
                              <span className="text-[9px] text-slate-400 font-medium">
                                used
                              </span>
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? "bg-blue-600" : "bg-blue-400"
                              }`}
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>}
            </AnalyticsCard>
          </div>
        </div>

        {/* Chart Row 2: Traffic Sources & Best Performing Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Traffic Source Pie Chart */}
          <AnalyticsCard
            title="Traffic Source Breakdown"
            extra={
              <span className="text-[11px] font-semibold text-slate-400">
                Channel Share
              </span>
            }
          >
            <div className="py-2">
              <TrafficSourcesDonutChart
                analyticsData={analyticsData}
                pageViews={totalClicks || totalImpressions}
                showCard={false}
              />
            </div>
          </AnalyticsCard>

          {/* Best Performing Days Bar Chart */}
          <AnalyticsCard
            title="Best Performing Days of Week"
            extra={
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md font-bold text-[10px]">
                Peak Day: {peakDay}
              </span>
            }
          >
            <div className="h-52 w-full pt-1">
              <BestDaysChart data={dayData} />
            </div>

          </AnalyticsCard>
        </div>

        {/* 100% Dynamic DataTable for Coupon Performance */}
        <AnalyticsCard title="Coupon Performance Table">
          <DataTable
            columns={tableColumns}
            data={tableRows}
            searchable={true}
            searchPlaceholder="Filter performance by coupon title, code..."
            defaultPageSize={10}
            emptyState="No coupon performance data recorded for this period."
          />
        </AnalyticsCard>
      </div>
    </DashboardLayout>
  );
}
