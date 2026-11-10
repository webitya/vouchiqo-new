"use client";

import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  IndianRupee,
  Loader2,
  Megaphone,
  PlusCircle,
  RefreshCw,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Timer,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  adminFetchScheduledCampaigns,
  adminReviewCampaign,
} from "@/lib/api-helpers";
import { cn } from "@/lib/utils";

const FESTIVAL_DATES = [
  {
    name: "Diwali Grand Fest",
    date: "2026-11-01",
    color: "bg-purple-100/90 text-purple-800 border-purple-200",
  },
  {
    name: "Dussehra Mega Sale",
    date: "2026-10-12",
    color: "bg-amber-100/90 text-amber-800 border-amber-200",
  },
  {
    name: "Holi Colours Offer",
    date: "2026-03-04",
    color: "bg-orange-100/90 text-orange-800 border-orange-200",
  },
  {
    name: "Eid Festive Specials",
    date: "2026-03-20",
    color: "bg-emerald-100/90 text-emerald-800 border-emerald-200",
  },
];

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

export default function AdminCampaignCalendarPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // API Loading State
  const [isSaving, setIsSaving] = useState(false);

  // Form states inside adjustment modal
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editCountdown, setEditCountdown] = useState(true);
  const [editTeaser, setEditTeaser] = useState(true);
  const [editTeaserHeadline, setEditTeaserHeadline] = useState("");

  const fetchScheduled = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetchScheduledCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error("Error loading scheduled campaigns:", err);
      toast.error("Failed to load scheduled campaign calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  const handleOpenAdjust = useCallback((cmp) => {
    setSelectedCampaign(cmp);
    const startStr = cmp.startDate
      ? new Date(cmp.startDate).toISOString().split("T")[0]
      : cmp.timing?.startDate
        ? new Date(cmp.timing.startDate).toISOString().split("T")[0]
        : "";
    const endStr = cmp.endDate
      ? new Date(cmp.endDate).toISOString().split("T")[0]
      : cmp.timing?.endDate
        ? new Date(cmp.timing.endDate).toISOString().split("T")[0]
        : "";

    setEditStartDate(startStr);
    setEditEndDate(endStr);
    setEditCountdown(cmp.timing?.hasCountdownTimer ?? true);
    setEditTeaser(cmp.timing?.hasPreTeaser ?? true);
    setEditTeaserHeadline(cmp.timing?.preTeaserHeadline || cmp.headline || "");
    setIsAdjustModalOpen(true);
  }, []);

  const handleSaveSchedule = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedCampaign) return;

      const targetId = selectedCampaign._id || selectedCampaign.id;
      try {
        setIsSaving(true);
        await adminReviewCampaign(targetId, {
          scheduleDate: editStartDate,
          endDate: editEndDate,
          timing: {
            startDate: new Date(`${editStartDate}T10:00:00`),
            endDate: new Date(`${editEndDate}T23:59:59`),
            hasCountdownTimer: editCountdown,
            hasPreTeaser: editTeaser,
            preTeaserHeadline: editTeaserHeadline,
          },
        });

        setCampaigns((prev) =>
          prev.map((c) =>
            c._id === targetId || c.id === targetId
              ? {
                  ...c,
                  startDate: `${editStartDate}T10:00`,
                  endDate: `${editEndDate}T23:59`,
                  timing: {
                    ...c.timing,
                    hasCountdownTimer: editCountdown,
                    hasPreTeaser: editTeaser,
                    preTeaserHeadline: editTeaserHeadline,
                  },
                }
              : c,
          ),
        );
        toast.success("Campaign launch schedule & teaser updated!");
        setIsAdjustModalOpen(false);
      } catch (err) {
        toast.error(err.message || "Failed to update campaign schedule.");
      } finally {
        setIsSaving(false);
      }
    },
    [
      selectedCampaign,
      editStartDate,
      editEndDate,
      editCountdown,
      editTeaser,
      editTeaserHeadline,
    ],
  );

  const formattedCampaigns = useMemo(() => {
    return campaigns.map((c) => ({
      ...c,
      id: c._id || c.id,
      merchantName:
        c.merchantId?.businessName || c.merchant || "Merchant Partner",
      startFormatted: c.startDate
        ? new Date(c.startDate).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : c.timing?.startDate
          ? new Date(c.timing.startDate).toLocaleString("en-IN", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—",
      endFormatted: c.endDate
        ? new Date(c.endDate).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : c.timing?.endDate
          ? new Date(c.timing.endDate).toLocaleString("en-IN", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—",
      hasCountdown: c.timing?.hasCountdownTimer ?? c.hasCountdownTimer ?? true,
      hasPreTeaser: c.timing?.hasPreTeaser ?? c.hasPreTeaser ?? false,
      teaserHeadline: c.timing?.preTeaserHeadline || c.teaserHeadline || "",
    }));
  }, [campaigns]);

  const stats = useMemo(() => {
    const totalScheduled = formattedCampaigns.length;
    const withCountdowns = formattedCampaigns.filter((c) => c.hasCountdown).length;
    const withTeasers = formattedCampaigns.filter((c) => c.hasPreTeaser).length;
    return { totalScheduled, withCountdowns, withTeasers, festivalCount: FESTIVAL_DATES.length };
  }, [formattedCampaigns]);

  return (
    <DashboardLayout
      title="Campaign Calendar & Scheduling"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Campaign Scheduling &amp; Calendar
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Go-live date/time pickers, countdown timers, pre-launch teasers &amp; automatic cron scheduler.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Cron Auto-Scheduler Active
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={fetchScheduled}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Scheduled Campaigns
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.totalScheduled}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Festival Targets
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.festivalCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Countdowns Active
                  </span>
                  <span className="text-base font-medium text-orange-700 mt-0.5 block leading-none">
                    {stats.withCountdowns}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center shrink-0">
                  <Timer className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Pre-Launch Teasers
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.withTeasers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flagged Festival Dates Banner */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 space-y-2 font-sans">
            <h3 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" /> Flagged National Festival Campaign Dates
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FESTIVAL_DATES.map((fest) => (
                <div
                  key={fest.name}
                  className={cn(
                    "p-2 rounded-xl border text-[11px] font-medium flex justify-between items-center shadow-2xs",
                    fest.color,
                  )}
                >
                  <span className="truncate">{fest.name}</span>
                  <span className="font-mono text-[10px] font-normal shrink-0 ml-1">{fest.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Scheduled Campaigns List */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                Scheduled Campaigns Queue
              </h3>
              <span className="text-[10.5px] text-slate-500 font-normal">
                {formattedCampaigns.length} upcoming launches
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-3 border border-slate-200 rounded-xl space-y-1.5"
                  >
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                    <Skeleton className="h-3.5 w-1/2 rounded-md" />
                  </div>
                ))}
              </div>
            ) : formattedCampaigns.length === 0 ? (
              <div className="p-6 text-center text-[11px] text-slate-400 font-normal">
                No scheduled campaigns found in the calendar queue.
              </div>
            ) : (
              <div className="space-y-2">
                {formattedCampaigns.map((c, index) => {
                  const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
                  const initials = (c.name || "SC")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-2 shadow-2xs transition-all",
                        theme.row,
                      )}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-6 h-6 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <h4 className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                            {c.name || "Scheduled Campaign"}
                          </h4>
                          <span className="bg-white/95 text-blue-800 border border-blue-200 text-[9.5px] font-medium px-1.5 py-0.2 rounded shadow-2xs">
                            {c.merchantName}
                          </span>
                          {c.hasCountdown && (
                            <span className="bg-white/95 text-orange-800 border border-orange-200 text-[9.5px] font-medium px-1.5 py-0.2 rounded shadow-2xs">
                              Countdown Active
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-600 font-normal leading-none pl-8">
                          Go-Live: <span className="text-slate-900 font-mono font-medium">{c.startFormatted}</span> • End: <span className="text-slate-900 font-mono font-medium">{c.endFormatted}</span>
                        </p>

                        {c.hasPreTeaser && (
                          <span className="text-[10px] text-purple-700 font-medium block pl-8">
                            Pre-Teaser: &quot;{c.teaserHeadline}&quot;
                          </span>
                        )}
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleOpenAdjust(c)}
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-[11px] font-medium h-7 px-2.5 rounded-lg cursor-pointer shadow-2xs shrink-0 gap-1"
                          >
                            <Sliders className="w-3 h-3 text-blue-600" />
                            <span>Adjust Schedule</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                          Adjust go-live dates, countdown timer, and pre-launch teaser
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ADJUST SCHEDULE MODAL */}
          <Dialog
            open={isAdjustModalOpen}
            onOpenChange={() => !isSaving && setIsAdjustModalOpen(false)}
          >
            <DialogContent className="max-w-md bg-white p-5 rounded-2xl font-sans text-left">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-sm font-medium text-slate-900">
                  Adjust Launch Schedule
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-normal">
                  Adjust launch time up to 2 hours before automated launch.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveSchedule} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-800">
                    Go-Live Launch Date *
                  </Label>
                  <DatePicker
                    value={editStartDate}
                    onChange={setEditStartDate}
                    placeholder="Select launch date"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-800">
                    End Expiry Date *
                  </Label>
                  <DatePicker
                    value={editEndDate}
                    onChange={setEditEndDate}
                    placeholder="Select end date"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1.5 text-[11px]">
                  <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editCountdown}
                      onChange={(e) => setEditCountdown(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>Activate Countdown Timer on Offer Card</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editTeaser}
                      onChange={(e) => setEditTeaser(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>Activate Festival Pre-Launch Teaser Banner</span>
                  </label>
                </div>

                {editTeaser && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-800">
                      Pre-Launch Teaser Headline (Max 60 Chars) *
                    </Label>
                    <Input
                      type="text"
                      maxLength={60}
                      value={editTeaserHeadline}
                      onChange={(e) => setEditTeaserHeadline(e.target.value)}
                      placeholder="e.g. Pre-Diwali Deals Unlocking Soon!"
                      className="bg-white border-slate-200 text-xs h-8 rounded-lg font-normal"
                    />
                  </div>
                )}

                <DialogFooter className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="text-xs font-medium rounded-lg h-7.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : null}
                    <span>Save Schedule</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
