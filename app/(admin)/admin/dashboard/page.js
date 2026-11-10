"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  IndianRupee,
  Store,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/shared/cards/KPICard";
import DashboardChart from "@/components/shared/data/DashboardChart";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAnalytics } from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

import MonthlyGoalsCard from "./components/MonthlyGoalsCard";
import RecentActivityTimeline from "./components/RecentActivityTimeline";
import TrafficSourcesCard from "./components/TrafficSourcesCard";

const DEFAULT_TREND_DATA = [
  { label: "Jan", revenue: 0, orders: 0, profit: 0 },
  { label: "Feb", revenue: 0, orders: 0, profit: 0 },
  { label: "Mar", revenue: 0, orders: 0, profit: 0 },
  { label: "Apr", revenue: 0, orders: 0, profit: 0 },
  { label: "May", revenue: 0, orders: 0, profit: 0 },
  { label: "Jun", revenue: 0, orders: 0, profit: 0 },
  { label: "Jul", revenue: 0, orders: 0, profit: 0 },
  { label: "Aug", revenue: 0, orders: 0, profit: 0 },
  { label: "Sep", revenue: 0, orders: 0, profit: 0 },
  { label: "Oct", revenue: 0, orders: 0, profit: 0 },
  { label: "Nov", revenue: 0, orders: 0, profit: 0 },
  { label: "Dec", revenue: 0, orders: 0, profit: 0 },
];

import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeMetricTab, setActiveMetricTab] = useState("revenue");

  // Real-time notifications and pending counts hook
  const { unreadCount } = useAdminNotifications();

  // Real-time socket listeners for live merchant data & applications
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
  });

  // Fetch admin analytics
  const { data: analyticsData, isLoading } = useAdminAnalytics();

  const kpis = analyticsData?.kpis ?? {
    totalUsers: 0,
    totalMerchants: 0,
    activeCoupons: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
  };

  const trendData = analyticsData?.trendData ?? DEFAULT_TREND_DATA;

  const chartSeries = {
    revenue: [{ key: "revenue", name: "Revenue (₹)", color: "#2563eb" }],
    orders: [{ key: "orders", name: "Orders", color: "#1d4ed8" }],
    profit: [{ key: "profit", name: "Profit (₹)", color: "#0a2e6e" }],
  };

  const orderColumns = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-[10px] shrink-0">
            {row.customer.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-slate-800 block text-xs">
              {row.customer}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {row.type} Moderation
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Order ID",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.id}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <span className="font-normal text-slate-700">{row.product}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      cell: (row) => (
        <div className="text-right">
          <span className="font-medium text-slate-800 block text-xs">
            {row.amount}
          </span>
          <Link
            href={
              row.type === "Merchant"
                ? "/admin/approvals/merchants"
                : "/admin/approvals/coupons"
            }
            className="text-[10px] text-[#2563eb] hover:underline font-normal"
          >
            Review →
          </Link>
        </div>
      ),
    },
  ];

  const livePendingOrders = (analyticsData?.pendingActions || []).map(
    (item) => ({
      id: item.id.slice(-8).toUpperCase(),
      customer: item.name,
      type: item.type,
      product: `${item.type} Moderation Audit`,
      status: item.status.toLowerCase().includes("pending")
        ? "pending"
        : "under_review",
      amount: item.type === "Merchant" ? "₹1,499.00" : "₹0.00",
    }),
  );

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-3 text-left font-sans w-full pb-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-2 text-left">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Super Admin Dashboard
              </h1>
              <LiveIndicator />
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Welcome back, Admin. Here's what's happening with your business
              today.
            </p>
          </div>
          <Link
            href="/admin/approvals/merchants"
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs relative shrink-0"
          >
            <span>Review Queue</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-medium px-1.5 py-0.2 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* 4 Reusable KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <KPICard
            variant="emerald"
            title="Total Revenue"
            value={`₹${(kpis.monthlyRevenue || 0).toLocaleString()}`}
            subtitle="Platform subscription MRR"
            icon={IndianRupee}
            iconClassName="bg-emerald-50 border-emerald-200/90 text-emerald-600 shadow-2xs"
            loading={isLoading}
          />
          <KPICard
            variant="blue"
            title="Active Users"
            value={(kpis.totalUsers || 0).toLocaleString()}
            subtitle="Registered user accounts"
            icon={Users}
            iconClassName="bg-blue-50 border-blue-200/90 text-blue-600 shadow-2xs"
            loading={isLoading}
          />
          <KPICard
            variant="amber"
            title="Total Orders"
            value={(
              kpis.totalOrders ??
              kpis.totalRedemptions ??
              0
            ).toLocaleString()}
            subtitle="Redeemed coupon orders"
            icon={Tag}
            iconClassName="bg-amber-50 border-amber-200/90 text-amber-600 shadow-2xs"
            loading={isLoading}
          />
          <KPICard
            variant="purple"
            title="Page Views"
            value={(analyticsData?.totalVisits ?? 0).toLocaleString()}
            subtitle="Live offer page visits"
            icon={Store}
            iconClassName="bg-purple-50 border-purple-200/90 text-purple-600 shadow-2xs"
            loading={isLoading}
          />
        </div>

        {/* Overview Chart & Traffic Column */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <Card className="col-span-full xl:col-span-8 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full p-0 gap-0">
            <CardHeader className="px-3.5 py-2.5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30 min-h-[44px]">
              <div>
                <CardTitle className="font-sans text-xs font-medium text-slate-800 tracking-wider uppercase m-0 leading-none">
                  Overview
                </CardTitle>
                <CardDescription className="text-[11px] font-normal text-slate-500 mt-0.5 leading-none font-sans normal-case tracking-normal">
                  Monthly performance for the current year
                </CardDescription>
              </div>
              <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-100/90 shrink-0 select-none">
                {["revenue", "orders", "profit"].map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setActiveMetricTab(metric)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-all uppercase cursor-pointer border-0 ${
                      activeMetricTab === metric
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 pt-3">
              <DashboardChart
                title=""
                data={trendData}
                series={chartSeries[activeMetricTab]}
                type={activeMetricTab === "orders" ? "bar" : "area"}
              />
            </CardContent>
          </Card>

          <div className="col-span-full flex flex-col gap-3 xl:col-span-4">
            <TrafficSourcesCard analyticsData={analyticsData} />
            <MonthlyGoalsCard analyticsData={analyticsData} />
          </div>
        </div>

        {/* Recent Orders & Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <Card className="col-span-full xl:col-span-8 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full p-0 gap-0">
            <CardHeader className="px-3.5 py-2.5 border-b border-slate-100 flex flex-row justify-between items-center gap-3 bg-slate-50/50 min-h-[44px]">
              <div>
                <CardTitle className="font-sans text-xs font-medium text-slate-800 tracking-wider uppercase m-0 leading-none">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-[11px] font-normal text-slate-500 mt-0.5 leading-none font-sans normal-case tracking-normal">
                  Latest transactions from your store
                </CardDescription>
              </div>
              <Link
                href="/admin/approvals/merchants"
                className="text-[11px] font-medium text-[#2563eb] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 pt-2">
              <DataTable
                columns={orderColumns}
                data={livePendingOrders}
                loading={isLoading}
                searchable={false}
                defaultPageSize={5}
                emptyState="No pending moderation orders in queue."
                renderMobileCard={(row) => {
                  const isMerchant = row.type === "Merchant";
                  const reviewHref = isMerchant
                    ? "/admin/approvals/merchants"
                    : "/admin/approvals/coupons";
                  const initials = (row.customer || "CU")
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all space-y-2 text-left font-sans">
                      {/* Header: Single Avatar + Customer Name & Type + Top-Right Status */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-snug">
                              {row.customer}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                              {isMerchant
                                ? "Merchant Verification"
                                : "Coupon Moderation"}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={row.status} size="sm" />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 dark:border-slate-800/80" />

                      {/* 2-Column Key-Value Grid */}
                      <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 items-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                            Order ID
                          </div>
                          <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold text-xs inline-block">
                            #{row.id}
                          </code>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                            Audit Fee
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {row.amount}
                          </div>
                        </div>
                      </div>

                      {/* Full-Width Touch Action Button (Fitts's Law) */}
                      <div className="pt-0.5">
                        <Link
                          href={reviewHref}
                          className="w-full min-h-[34px] rounded-lg px-3 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-400 flex items-center justify-between text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none group"
                        >
                          <span>
                            Review{" "}
                            {isMerchant
                              ? "Merchant Application"
                              : "Coupon Offer"}
                          </span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </Link>
                      </div>
                    </div>
                  );
                }}
              />
            </CardContent>
          </Card>

          <div className="col-span-full xl:col-span-4">
            <RecentActivityTimeline />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
