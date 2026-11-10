"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StatsEditor({
  statsForm,
  setStatsForm,
  handleSaveSetting,
  savingKey,
}) {
  return (
    <Card className="bg-white border border-brand-border rounded-2xl shadow-sm">
      <CardHeader className="border-b border-brand-border pb-3.5 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 text-brand-blue" />
          <span>Revival Page Statistics</span>
        </CardTitle>
        <Button
          onClick={() => handleSaveSetting("revival_stats", statsForm)}
          disabled={savingKey === "revival_stats"}
          className="bg-brand-navy hover:bg-brand-navy/95 text-white text-xs h-8 px-4 font-bold rounded-lg cursor-pointer border-0 shadow-none flex items-center gap-1.5"
        >
          {savingKey === "revival_stats" ? "Saving..." : "Save Stats"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Total requests */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Total Requests (Processed)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={statsForm.totalRequests}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    totalRequests: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none px-3"
              />
            </div>
          </div>

          {/* This month requests */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Processed This Month
            </label>
            <div className="relative">
              <Input
                type="number"
                value={statsForm.thisMonthRequests}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    thisMonthRequests: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none px-3"
              />
            </div>
          </div>

          {/* Recovered amount */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Recovered Savings (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₹
              </span>
              <Input
                type="number"
                value={statsForm.recoveredAmount}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    recoveredAmount: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none pl-7 pr-3"
              />
            </div>
          </div>

          {/* Success rate */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Revival Success Rate (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={statsForm.successRate}
                onChange={(e) =>
                  setStatsForm({
                    ...statsForm,
                    successRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-brand-surface text-xs focus:ring-brand-blue border-brand-border h-9 shadow-none pr-7 pl-3"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
