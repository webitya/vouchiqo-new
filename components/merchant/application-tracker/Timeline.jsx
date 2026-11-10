"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  Info,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Timeline — Fully responsive chronological activity timeline with full-width titles
 * and date/time sub-rows built using Shadcn UI primitives.
 *
 * @param {object} props
 * @param {Array} props.events - List of timeline activity events
 * @param {number} [props.progressPercentage] - Overall verification percentage (0-100)
 */
export default function Timeline({ events = [], progressPercentage = 66 }) {
  if (!events || events.length === 0) return null;

  const completedEvents = events.filter(
    (e) => e.type === "success" || e.completed === true,
  ).length;
  const activeProgress = progressPercentage || 66;

  const getEventBadge = (type) => {
    switch (type) {
      case "success":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-normal px-2 py-0.5 shadow-none">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" /> Completed
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-normal px-2 py-0.5 shadow-none">
            <Clock className="w-3 h-3 mr-1 text-slate-500" /> In Audit
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-normal px-2 py-0.5 shadow-none">
            <AlertCircle className="w-3 h-3 mr-1 text-red-600" /> Action Needed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-normal px-2 py-0.5 shadow-none">
            <Info className="w-3 h-3 mr-1 text-blue-600" /> Notice
          </Badge>
        );
    }
  };

  const getEventIcon = (title = "", type = "") => {
    const t = title.toLowerCase();
    if (t.includes("submitted") || t.includes("application")) {
      return <FileCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (t.includes("email") || t.includes("confirmation")) {
      return <Info className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (t.includes("assigned") || t.includes("admin")) {
      return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (t.includes("tax") || t.includes("gst") || t.includes("verified")) {
      return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
    return <Clock className="w-3.5 h-3.5 text-slate-500" />;
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const date = new Date(ts);
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(ts);
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden text-left font-sans h-full">
      {/* Card Header */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-medium text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Verification Timeline
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">
              Audit activity log for your profile
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-normal px-2 py-0.5"
          >
            {completedEvents} of {events.length} Completed
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[10px] font-normal text-slate-500">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-600" /> Audit Progress
            </span>
            <span className="text-blue-600 text-xs font-medium">
              {activeProgress}%
            </span>
          </div>
          <Progress
            value={activeProgress}
            className="h-1.5 bg-slate-100"
            indicatorClassName="bg-blue-600"
          />
        </div>
      </CardHeader>

      {/* Card Content Timeline Items */}
      <CardContent className="p-4 pt-4">
        <div className="relative border-l border-slate-200 ml-3 pl-4 space-y-4">
          {events.map((evt, idx) => (
            <div key={idx} className="relative group space-y-1">
              <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-2xs">
                {getEventIcon(evt.title, evt.type)}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1">
                <h5 className="text-xs font-medium text-slate-900 leading-snug">
                  {evt.title}
                </h5>
                <div>{getEventBadge(evt.type)}</div>
              </div>

              {evt.detail && (
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  {evt.detail}
                </p>
              )}

              {evt.timestamp && (
                <span className="text-[10px] text-slate-400 font-normal block">
                  {formatTime(evt.timestamp)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
