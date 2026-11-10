"use client";

import {
  BarChart3,
  DollarSign,
  MousePointer,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * CampaignReportModal — Detailed analytics report dialog for a selected campaign.
 */
export default function CampaignReportModal({
  open,
  onOpenChange,
  campaign = null,
}) {
  if (!campaign) return null;

  const clicks = campaign.stats?.clicks ?? 12840;
  const redemptions = campaign.stats?.redemptions ?? 1820;
  const revenue = campaign.stats?.revenue ?? "₹482K";
  const convRate =
    clicks > 0 ? ((redemptions / clicks) * 100).toFixed(1) : "14.2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white p-4 sm:p-5 rounded-xl border border-slate-200 text-left shadow-lg">
        <DialogHeader className="space-y-1 pb-2.5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F72853]" />
              Campaign Analytics Report
            </DialogTitle>
            <Badge className="bg-rose-50 text-[#F72853] border-rose-200 text-[10px] font-medium capitalize">
              {campaign.type || "Flash Sale"}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500 font-normal">
            Performance summary for "{campaign.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#F72853] mx-auto flex items-center justify-center">
                <MousePointer className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-900 block">
                {clicks.toLocaleString()}
              </span>
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider block">
                Total Clicks
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-900 block">
                {redemptions.toLocaleString()}
              </span>
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider block">
                Redemptions
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#F72853] mx-auto flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-900 block">
                {revenue}
              </span>
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider block">
                Est. Revenue
              </span>
            </div>
          </div>

          {/* Efficiency Details */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-emerald-950">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />{" "}
                Redemption Conversion Rate
              </span>
              <span className="font-mono text-xs sm:text-sm font-semibold">
                {convRate}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug font-normal">
              This campaign achieved an above-average conversion rate. 14 out of
              every 100 viewers redeemed a coupon code during the active window.
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-medium text-slate-700 text-[11px]">
              Campaign Metadata
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal uppercase">
                  Status
                </span>
                <span className="font-medium text-slate-800 capitalize">
                  {campaign.status
                    ? campaign.status.replace("_", " ")
                    : "Pending Review"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-normal uppercase">
                  Objective
                </span>
                <span className="font-medium text-slate-800">
                  {campaign.objective || "Maximize Sales"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
