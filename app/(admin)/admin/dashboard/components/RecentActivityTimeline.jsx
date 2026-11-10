"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { ArrowUpRight, Store, Tag } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/fetcher";

export default function RecentActivityTimeline() {
  const { data: analyticsData } = useQuery({
    queryKey: qk.admin.analytics(),
    queryFn: async () => {
      const json = await apiFetch("/api/admin/analytics");
      return json.data;
    },
  });

  const pendingActions = analyticsData?.pendingActions || [];

  const activities =
    pendingActions.length > 0
      ? pendingActions.map((item) => {
          const isMerchant = item.type === "Merchant";
          return {
            icon: isMerchant ? Store : Tag,
            color: isMerchant ? "text-[#2563eb]" : "text-[#3e80dd]",
            bg: isMerchant ? "bg-[#2563eb]/10" : "bg-[#3e80dd]/10",
            title: isMerchant
              ? "New Merchant Application"
              : "New Offer Submitted",
            desc: `${item.name} (${item.type} Moderation Queue)`,
            time: item.date || "Today",
          };
        })
      : [
          {
            icon: Store,
            color: "text-[#2563eb]",
            bg: "bg-[#2563eb]/10",
            title: "System Active",
            desc: "All merchant applications up to date",
            time: "Live",
          },
        ];

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full p-0 gap-0 text-left font-sans">
      <CardHeader className="px-4 py-3 sm:px-5 sm:py-3 border-b border-slate-100 flex flex-row justify-between items-center gap-3 bg-gradient-to-r from-emerald-50/60 via-white to-blue-50/40 min-h-[48px]">
        <div>
          <CardTitle className="font-sans text-xs font-medium text-slate-800 tracking-wider uppercase m-0 leading-none">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-[11px] font-normal text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Live moderation events from your platform
          </CardDescription>
        </div>
        <Link
          href="/admin/approvals/merchants"
          className="text-xs font-normal text-[#2563eb] hover:underline flex items-center gap-0.5"
        >
          <span>View all</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-4">
        <div className="space-y-3.5">
          {activities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg ${act.bg} ${act.color} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="flex-grow space-y-0.5 text-xs text-left">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-medium text-slate-800">
                      {act.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal whitespace-nowrap">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
