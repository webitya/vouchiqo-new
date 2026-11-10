"use client";

import { BarChart3, Calendar, Copy, Edit3, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CampaignListGrid({
  campaigns = [],
  onCreateClick,
  onEdit,
  onDuplicate,
  onReport,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left font-sans">
      {/* Dashed Create Card */}
      <div
        onClick={onCreateClick}
        className="border-2 border-dashed border-slate-300/80 hover:border-[#F72853] bg-slate-50/50 hover:bg-rose-50/20 transition-all rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] group shadow-2xs"
      >
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 group-hover:border-[#F72853] group-hover:scale-105 transition-all flex items-center justify-center text-slate-400 group-hover:text-[#F72853] mb-2 shadow-2xs">
          <Plus className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#F72853] transition-colors">
          Create Campaign
        </h3>
        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
          Plan &amp; launch a coordinated promotion
        </p>
      </div>

      {/* Campaign Cards */}
      {campaigns.map((camp) => (
        <Card
          key={camp._id || camp.name}
          className="border border-slate-200/90 shadow-2xs hover:border-rose-200 transition-all rounded-2xl overflow-hidden bg-white p-3.5 space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs font-semibold text-slate-900 leading-snug truncate max-w-[170px]">
                    {camp.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-slate-100 text-slate-700 capitalize py-0 px-1.5 border-0"
                  >
                    {camp.type}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  {camp.startDate
                    ? `${new Date(camp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(camp.endDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Flexible Schedule"}
                </p>
              </div>
              <Badge
                className={`text-[10px] font-medium border-0 shrink-0 py-0.5 px-2 rounded-full ${
                  camp.status === "live"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    : camp.status === "pending_review"
                      ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {camp.status === "live"
                  ? "● Live"
                  : (camp.status || "pending_review").replace("_", " ")}
              </Badge>
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {(camp.stats?.clicks ?? camp.clicks ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                  Clicks
                </span>
              </div>
              <div className="border-x border-slate-200/60">
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {(
                    camp.stats?.redemptions ??
                    camp.redemptions ??
                    0
                  ).toLocaleString()}
                </span>
                <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                  Redemptions
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {camp.stats?.revenue ??
                    `₹${((camp.stats?.redemptions ?? camp.redemptions ?? 0) * 250).toLocaleString()}`}
                </span>
                <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                  Revenue
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(camp)}
              className="h-7 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-medium gap-1 px-2.5 cursor-pointer shadow-none"
            >
              <Edit3 className="w-3 h-3 text-slate-400" /> Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate?.(camp)}
              className="h-7 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-medium gap-1 px-2.5 cursor-pointer shadow-none"
            >
              <Copy className="w-3 h-3 text-slate-400" /> Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReport?.(camp)}
              className="h-7 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 text-[11px] font-medium gap-1 px-2.5 cursor-pointer shadow-none"
            >
              <BarChart3 className="w-3 h-3 text-slate-400" /> Report
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(camp)}
              className="h-7 rounded-xl text-rose-600 border-rose-200/80 bg-rose-50/50 hover:bg-rose-100 text-[11px] font-medium gap-1 px-2.5 ml-auto cursor-pointer shadow-none"
            >
              <Trash2 className="w-3 h-3 text-rose-500" /> Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
