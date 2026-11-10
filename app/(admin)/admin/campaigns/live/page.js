"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  Percent,
  Play,
  Plus,
  PlusCircle,
  RefreshCw,
  Store,
  Tag,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  adminFetchLiveCampaigns,
  adminReviewCampaign,
} from "@/lib/api-helpers";
import { cn } from "@/lib/utils";

// 8 Distinct Colorful Card Palettes (Clearly visible without hover)
const CARD_COLOR_THEMES = [
  {
    card: "bg-blue-50/50 border-l-[3.5px] border-l-blue-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-emerald-50/50 border-l-[3.5px] border-l-emerald-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-amber-50/50 border-l-[3.5px] border-l-amber-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-purple-50/50 border-l-[3.5px] border-l-purple-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-indigo-50/50 border-l-[3.5px] border-l-indigo-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-rose-50/50 border-l-[3.5px] border-l-rose-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-teal-50/50 border-l-[3.5px] border-l-teal-600 border-slate-200/90 text-slate-900",
  },
  {
    card: "bg-orange-50/50 border-l-[3.5px] border-l-orange-600 border-slate-200/90 text-slate-900",
  },
];

export default function AdminLiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Button API Loading States
  const [isPausing, setIsPausing] = useState(false);
  const [isUpdatingCap, setIsUpdatingCap] = useState(false);
  const [endingId, setEndingId] = useState(null);

  // Pause Modal State
  const [pauseCampaign, setPauseCampaign] = useState(null);
  const [pauseReason, setPauseReason] = useState("");

  // Increase Cap Modal State
  const [capCampaign, setCapCampaign] = useState(null);
  const [newCapValue, setNewCapValue] = useState("");

  const fetchLiveCampaigns = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminFetchLiveCampaigns();
      setCampaigns(data);
      setLastRefreshed(new Date().toLocaleTimeString("en-IN"));
    } catch (err) {
      console.error("Error fetching live campaigns:", err);
      if (!silent) toast.error("Failed to load live campaigns.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveCampaigns();
    const interval = setInterval(() => {
      fetchLiveCampaigns(true);
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchLiveCampaigns]);

  const handleConfirmPause = useCallback(async () => {
    if (!pauseReason.trim() || pauseReason.trim().length < 20) {
      toast.error(
        "Pause requires a mandatory reason of at least 20 characters!",
      );
      return;
    }
    const targetId = pauseCampaign._id || pauseCampaign.id;
    try {
      setIsPausing(true);
      await adminReviewCampaign(targetId, {
        status: "paused",
        pauseReason,
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === targetId || c.id === targetId
            ? { ...c, status: "paused" }
            : c,
        ),
      );
      toast.success("Campaign paused successfully.");
      setPauseCampaign(null);
      setPauseReason("");
    } catch (err) {
      toast.error(err.message || "Failed to pause campaign.");
    } finally {
      setIsPausing(false);
    }
  }, [pauseCampaign, pauseReason]);

  const handleConfirmIncreaseCap = useCallback(async () => {
    const currentCap =
      capCampaign?.offerDetails?.redemptionLimit ||
      capCampaign?.capLimit ||
      500;
    if (!newCapValue || Number(newCapValue) <= currentCap) {
      toast.error("New cap must be greater than current cap!");
      return;
    }
    const targetId = capCampaign._id || capCampaign.id;
    try {
      setIsUpdatingCap(true);
      await adminReviewCampaign(targetId, {
        capLimit: Number(newCapValue),
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === targetId || c.id === targetId
            ? {
                ...c,
                capLimit: Number(newCapValue),
                offerDetails: {
                  ...c.offerDetails,
                  redemptionLimit: Number(newCapValue),
                },
              }
            : c,
        ),
      );
      toast.success(`Cap limit increased to ${newCapValue}!`);
      setCapCampaign(null);
      setNewCapValue("");
    } catch (err) {
      toast.error(err.message || "Failed to update cap limit.");
    } finally {
      setIsUpdatingCap(false);
    }
  }, [capCampaign, newCapValue]);

  const handleEndNow = useCallback(async (id) => {
    try {
      setEndingId(id);
      await adminReviewCampaign(id, { status: "ended" });
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === id || c.id === id ? { ...c, status: "ended" } : c,
        ),
      );
      toast.error("Campaign ended immediately.");
    } catch (err) {
      toast.error(err.message || "Failed to end campaign.");
    } finally {
      setEndingId(null);
    }
  }, []);

  const liveList = useMemo(() => {
    return campaigns.map((c) => {
      const redemptions = c.redemptions || c.totalRedemptions || 0;
      const capLimit = c.offerDetails?.redemptionLimit || c.capLimit || 1000;
      const impressions = c.impressions || c.totalImpressions || 0;
      const clicks = c.clicks || c.totalClicks || 0;
      const convRate =
        impressions > 0
          ? `${((redemptions / impressions) * 100).toFixed(1)}%`
          : "0.0%";

      const alerts = [];
      const capPercent = Math.min(
        100,
        Math.round((redemptions / capLimit) * 100),
      );
      if (capPercent >= 80) {
        alerts.push(
          `${capPercent}% Cap Reached (${redemptions} / ${capLimit})`,
        );
      }
      if (impressions > 500 && redemptions / impressions < 0.05) {
        alerts.push("Conversion Rate below threshold (< 5%)");
      }

      return {
        ...c,
        id: c._id || c.id,
        merchantName:
          c.merchantId?.businessName || c.merchant || "Merchant Partner",
        impressions,
        clicks,
        redemptions,
        capLimit,
        conversionRate: convRate,
        capPercent,
        alerts,
        displayStatus: c.status ? c.status.toUpperCase() : "LIVE",
      };
    });
  }, [campaigns]);

  const filteredList = useMemo(() => {
    if (statusFilter === "near_cap") {
      return liveList.filter((c) => c.capPercent >= 80);
    }
    if (statusFilter === "paused") {
      return liveList.filter((c) => c.status === "paused");
    }
    return liveList;
  }, [liveList, statusFilter]);

  const stats = useMemo(() => {
    const total = liveList.length;
    const totalRedemptions = liveList.reduce((acc, c) => acc + (c.redemptions || 0), 0);
    const nearCapCount = liveList.filter((c) => c.capPercent >= 80).length;
    const activeCount = liveList.filter((c) => c.status !== "paused" && c.status !== "ended").length;
    return { total, totalRedemptions, nearCapCount, activeCount };
  }, [liveList]);

  return (
    <DashboardLayout
      title="Live Campaign Monitoring"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Live Campaign Monitoring
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Real-time redemption tracking, automated capacity alerts, pause controls, and cap adjustments.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 font-normal">
                Updated: {lastRefreshed || "Just now"}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => fetchLiveCampaigns(false)}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                statusFilter === "all"
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Active Campaigns
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.activeCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setStatusFilter("all")}
              className="rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans bg-white border-slate-200/80 hover:border-slate-300"
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Redemptions
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.totalRedemptions.toLocaleString()}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setStatusFilter("near_cap")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                statusFilter === "near_cap"
                  ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Near Cap (&gt;80%)
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                    {stats.nearCapCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setStatusFilter("paused")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                statusFilter === "paused"
                  ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Monitored
                  </span>
                  <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Campaign Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="p-4 space-y-3 rounded-2xl bg-white border-slate-200/90 shadow-2xs"
                >
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <Card className="p-8 text-center border-slate-200/90 rounded-2xl bg-white space-y-1 shadow-2xs">
              <Zap className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <h3 className="text-xs font-medium text-slate-800">
                No Active Live Campaigns
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                There are currently no active live campaigns matching your filter.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredList.map((c, index) => {
                const theme = CARD_COLOR_THEMES[index % CARD_COLOR_THEMES.length];
                const isEnding = endingId === c.id;

                const initials = (c.name || "CP")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <Card
                    key={c.id}
                    className={cn(
                      "shadow-2xs rounded-2xl p-3.5 space-y-3 flex flex-col justify-between transition-all",
                      theme.card,
                    )}
                  >
                    <div className="space-y-2.5">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                              {c.name || "Live Campaign"}
                            </h3>
                            <p className="text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                              {c.merchantName}
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          ● {c.displayStatus}
                        </span>
                      </div>

                      {/* Alerts */}
                      {c.alerts.length > 0 && (
                        <div className="space-y-1">
                          {c.alerts.map((alt, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 bg-white/95 border border-amber-300/90 rounded-md text-[9.5px] font-medium text-amber-900 flex items-center gap-1.5 shadow-2xs"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{alt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* KPI Mini Grid */}
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        <div className="p-1.5 bg-white/95 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-slate-500 font-normal block text-[9px]">
                            Views
                          </span>
                          <span className="font-medium text-slate-900 text-[10.5px] leading-tight block mt-0.5">
                            {c.impressions.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-1.5 bg-white/95 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-slate-500 font-normal block text-[9px]">
                            Clicks
                          </span>
                          <span className="font-medium text-slate-900 text-[10.5px] leading-tight block mt-0.5">
                            {(Number(c?.clicks) || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-1.5 bg-white/95 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-slate-500 font-normal block text-[9px]">
                            Claims
                          </span>
                          <span className="font-medium text-emerald-800 text-[10.5px] leading-tight block mt-0.5">
                            {(Number(c?.redemptions) || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-1.5 bg-white/95 rounded-lg border border-slate-200/80 shadow-2xs">
                          <span className="text-slate-500 font-normal block text-[9px]">
                            Conv.
                          </span>
                          <span className="font-medium text-blue-700 text-[10.5px] leading-tight block mt-0.5">
                            {c.conversionRate}
                          </span>
                        </div>
                      </div>

                      {/* Cap Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-slate-700">
                          <span>Capacity Used</span>
                          <span>
                            {c.capPercent}% ({c.redemptions}/{c.capLimit})
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              c.capPercent >= 80 ? "bg-rose-500" : "bg-blue-600",
                            )}
                            style={{ width: `${c.capPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar with Tooltips */}
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-200/60">
                      {c.status?.toLowerCase() !== "ended" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPauseCampaign(c)}
                                className="h-6.5 px-2 text-[10.5px] font-medium text-amber-700 border-amber-300 hover:bg-amber-50 bg-white rounded-md cursor-pointer shadow-2xs gap-1"
                              >
                                <PauseCircle className="w-3 h-3" />
                                <span>Pause</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                              Temporarily pause live campaign claims
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCapCampaign(c);
                                  setNewCapValue(String(c.capLimit + 500));
                                }}
                                className="h-6.5 px-2 text-[10.5px] font-medium text-blue-700 border-blue-300 hover:bg-blue-50 bg-white rounded-md cursor-pointer shadow-2xs gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Boost Cap</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                              Increase maximum redemption capacity limit
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isEnding}
                                onClick={() => handleEndNow(c.id)}
                                className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs shrink-0"
                              >
                                {isEnding ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                <span className="sr-only">End Campaign</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                              End campaign immediately
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* PAUSE CAMPAIGN MODAL */}
          <Dialog
            open={!!pauseCampaign}
            onOpenChange={() => !isPausing && setPauseCampaign(null)}
          >
            <DialogContent className="max-w-md bg-white p-5 rounded-2xl font-sans text-left">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-sm font-medium text-amber-900">
                  Pause Live Campaign
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-normal">
                  Provide mandatory pause reason (min 20 characters).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 pt-2">
                <Label className="text-[11px] font-medium text-slate-800">
                  Pause Reason *
                </Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Paused temporarily due to counter billing queue overload."
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  className="bg-white border-slate-200 text-xs rounded-xl font-normal"
                />
                <span className="text-[10px] text-amber-700 font-normal block text-right">
                  {pauseReason.length}/20 min chars required
                </span>
              </div>
              <DialogFooter className="pt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPausing}
                  onClick={() => setPauseCampaign(null)}
                  className="text-xs font-medium rounded-lg h-7.5"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isPausing}
                  onClick={handleConfirmPause}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg h-7.5"
                >
                  {isPausing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : null}
                  <span>Confirm Pause</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* INCREASE CAP MODAL */}
          <Dialog
            open={!!capCampaign}
            onOpenChange={() => !isUpdatingCap && setCapCampaign(null)}
          >
            <DialogContent className="max-w-md bg-white p-5 rounded-2xl font-sans text-left">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-sm font-medium text-slate-900">
                  Increase Campaign Redemption Cap
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-normal">
                  Current Cap: {capCampaign?.capLimit} claims
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 pt-2">
                <Label className="text-[11px] font-medium text-slate-800">
                  New Total Cap Limit *
                </Label>
                <Input
                  type="number"
                  value={newCapValue}
                  onChange={(e) => setNewCapValue(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-8 rounded-lg font-normal"
                />
              </div>
              <DialogFooter className="pt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingCap}
                  onClick={() => setCapCampaign(null)}
                  className="text-xs font-medium rounded-lg h-7.5"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isUpdatingCap}
                  onClick={handleConfirmIncreaseCap}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5"
                >
                  {isUpdatingCap ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : null}
                  <span>Update Cap Limit</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
