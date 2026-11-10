"use client";

import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  GripVertical,
  Layers,
  ListOrdered,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Tag,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";
import { FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRealtime } from "@/hooks/use-realtime";
import { adminFetchCampaignQueue } from "@/lib/api-helpers";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";
import TableSearch from "@/components/shared/data/TableSearch";

// 8 Distinct Colorful Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  {
    row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900",
  },
  {
    row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900",
  },
  {
    row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900",
  },
  {
    row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900",
  },
  {
    row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900",
  },
  {
    row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900",
  },
  {
    row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900",
  },
  {
    row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900",
  },
];

// Dynamic Priority Score Calculation
function calculatePriorityScore(campaign) {
  let score = 50;
  const cType = (campaign.type || "").toLowerCase();
  if (cType === "festival") score += 30;
  else if (cType === "flash") score += 20;

  const addOns = campaign.targeting?.addOns || campaign.addOns || [];
  score += (addOns.length || 0) * 10;

  const startDate = campaign.startDate || campaign.timing?.startDate;
  if (startDate) {
    const hoursToStart = (new Date(startDate) - Date.now()) / (1000 * 60 * 60);
    if (hoursToStart > 0 && hoursToStart <= 72) score += 25;
  }

  const planTier = campaign.merchantId?.plan || campaign.planTier || "starter";
  if (planTier.includes("pro") || planTier.includes("enterprise")) {
    score += 15;
  }

  return score;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All Campaign Types" },
  { value: "festival", label: "Festival Campaign" },
  { value: "flash", label: "Flash Sale" },
  { value: "bundle", label: "Bundle / BOGO" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plan Tiers" },
  { value: "starter", label: "Starter Free" },
  { value: "growth", label: "Growth Partner" },
  { value: "pro", label: "Pro Partner" },
  { value: "enterprise", label: "Enterprise" },
];

export default function AdminCampaignQueuePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetchCampaignQueue();
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaign queue:", err);
      toast.error("Failed to load campaign review queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Real-time listener for new campaign submissions from merchants
  useRealtime(SOCKET_EVENTS.CAMPAIGN_SUBMITTED, () => {
    fetchQueue();
  });

  // Real-time listener for status changes
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, () => {
    fetchQueue();
  });

  const scoredQueue = useMemo(() => {
    return campaigns
      .map((c) => ({
        ...c,
        priorityScore: calculatePriorityScore(c),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [campaigns]);

  const stats = useMemo(() => {
    const total = scoredQueue.length;
    const festivals = scoredQueue.filter((c) => (c.type || "").toLowerCase() === "festival").length;
    const flash = scoredQueue.filter((c) => (c.type || "").toLowerCase() === "flash").length;
    const highPriority = scoredQueue.filter((c) => c.priorityScore >= 70).length;
    return { total, festivals, flash, highPriority };
  }, [scoredQueue]);

  const filteredQueue = useMemo(() => {
    return scoredQueue.filter((c) => {
      const cType = (c.type || "").toLowerCase();
      const planTier = (c.merchantId?.plan || c.planTier || "").toLowerCase();

      // Tab filter
      if (activeTab === "festivals" && cType !== "festival") return false;
      if (activeTab === "flash" && cType !== "flash") return false;
      if (activeTab === "high_priority" && c.priorityScore < 70) return false;

      // Select filters
      const matchesType = typeFilter === "all" || cType === typeFilter;
      const matchesPlan =
        planFilter === "all" || planTier.includes(planFilter.toLowerCase());

      return matchesType && matchesPlan;
    });
  }, [scoredQueue, typeFilter, planFilter, activeTab]);

  const displayCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return filteredQueue;
    const q = searchQuery.toLowerCase();
    return filteredQueue.filter((m) => {
      const merchantName = m.merchantId?.businessName || m.merchantName || "";
      const title = m.name || m.campaignName || m.title || "";
      const type = m.type || m.campaignType || "";
      return [merchantName, title, type].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [filteredQueue, searchQuery]);

  const getRowClassName = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Campaign & Merchant",
        sortable: true,
        cell: (row) => {
          const merchantName =
            row.merchantId?.businessName || row.merchantName || "Merchant Partner";
          const initials = (row.name || row.campaignName || "CP")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
              <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="font-medium text-slate-900 text-[11.5px] leading-tight block truncate">
                  {row.name || row.campaignName || "Untitled Campaign"}
                </span>
                <div className="flex items-center gap-1 text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                  <Store className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="truncate">{merchantName}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "campaignType",
        header: "Campaign Type",
        sortable: true,
        cell: (row) => {
          const cType = (row.type || row.campaignType || "flash").toLowerCase();
          return (
            <span
              className={cn(
                "capitalize text-[10px] font-medium px-2 py-0.5 rounded-md border shadow-2xs inline-block whitespace-nowrap",
                cType === "festival"
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : cType === "flash"
                    ? "bg-orange-100 text-orange-800 border-orange-300"
                    : "bg-white/95 text-slate-800 border-slate-300/90",
              )}
            >
              {cType}
            </span>
          );
        },
      },
      {
        key: "planTier",
        header: "Plan Tier",
        sortable: true,
        cell: (row) => {
          const plan = row.merchantId?.plan || row.planTier || "starter";
          return (
            <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-300/90 inline-block shadow-2xs">
              {plan}
            </span>
          );
        },
      },
      {
        key: "addOns",
        header: "Add-Ons",
        cell: (row) => {
          const addOns = row.targeting?.addOns || row.addOns || [];
          return (
            <div className="flex flex-wrap gap-1">
              {addOns.length > 0 ? (
                addOns.map((ao, idx) => (
                  <span
                    key={idx}
                    className="bg-white/95 text-amber-800 border border-amber-300 text-[9px] font-medium px-1.5 py-0.2 rounded shadow-2xs"
                  >
                    {ao}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">None</span>
              )}
            </div>
          );
        },
      },
      {
        key: "submissionTime",
        header: "Submitted",
        sortable: true,
        cell: (row) => (
          <span className="text-[10.5px] text-slate-600 font-normal whitespace-nowrap">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "priorityScore",
        header: "Priority Score",
        sortable: true,
        cell: (row) => (
          <span className="bg-white/95 text-orange-700 px-2 py-0.5 rounded-md border border-orange-200 font-medium text-[11px] inline-flex items-center gap-1 shadow-2xs">
            <span>Score</span>
            <span className="font-semibold">{row.priorityScore}</span>
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (row) => {
          const id = row._id || row.id;
          return (
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="sm"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  >
                    <Link href={`/admin/campaigns/queue/${id}`}>
                      <Eye className="h-3 w-3" />
                      <span className="sr-only">Review Campaign</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Review &amp; Approve Campaign Submission
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <DashboardLayout
      title="Dedicated Campaign Review Queue"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Campaign Review Queue
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Auto-calculated priority scores and real-time merchant campaign submissions queue.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueue}
              disabled={loading}
              className="self-start sm:self-auto gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </Button>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "all"
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total in Queue
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <ListOrdered className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("festivals")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "festivals"
                  ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Festival Specials
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.festivals}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("flash")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "flash"
                  ? "bg-orange-50/70 border-orange-300 ring-1 ring-orange-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Flash Sales
                  </span>
                  <span className="text-base font-medium text-orange-700 mt-0.5 block leading-none">
                    {stats.flash}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("high_priority")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "high_priority"
                  ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    High Priority (&gt;70)
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                    {stats.highPriority}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Container */}
          <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden text-left">
            <TableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns by title, type, or merchant..."
            />
            <DataTable
              columns={columns}
              data={displayCampaigns}
              loading={loading}
              searchable={false}
              externalSearch={true}
              searchPlaceholder="Search campaigns by merchant name, title..."
              getRowClassName={getRowClassName}
              rightActions={
                <div className="flex items-center gap-2">
                  <FormSelect
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                    placeholder="Campaign Type"
                    options={TYPE_OPTIONS}
                    triggerClassName="w-[140px] h-7 text-[11px] bg-white border-slate-200 font-medium"
                  />
                  <FormSelect
                    value={planFilter}
                    onValueChange={setPlanFilter}
                    placeholder="Plan Tier"
                    options={PLAN_OPTIONS}
                    triggerClassName="w-[130px] h-7 text-[11px] bg-white border-slate-200 font-medium"
                  />

                  <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                    {[
                      {
                        id: "all",
                        label: "All",
                        count: stats.total,
                        description: "View all submitted campaign requests in queue",
                      },
                      {
                        id: "festivals",
                        label: "Festivals",
                        count: stats.festivals,
                        description: "Filter to festival & seasonal holiday campaigns",
                      },
                      {
                        id: "flash",
                        label: "Flash",
                        count: stats.flash,
                        description: "Filter to time-limited flash sale campaigns",
                      },
                      {
                        id: "high_priority",
                        label: "High Priority",
                        count: stats.highPriority,
                        description: "Filter to urgent submissions scoring over 70",
                      },
                    ].map((tab) => (
                      <Tooltip key={tab.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                              activeTab === tab.id
                                ? "bg-white text-blue-600 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800 bg-transparent",
                            )}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={cn(
                                "text-[9px] px-1 rounded-full",
                                activeTab === tab.id
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-200/70 text-slate-600",
                              )}
                            >
                              {tab.count}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                          {tab.description}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              }
              defaultPageSize={10}
              emptyState="No pending campaigns match the selected filters."
            />
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
