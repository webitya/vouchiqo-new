"use client";

import {
  ArrowUpRight,
  CalendarDays,
  LayoutList,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLAN_COLORS = {
  starter: "bg-slate-200 text-slate-700",
  growth: "bg-blue-100 text-blue-700",
  pro: "bg-blue-100 text-blue-800",
  enterprise: "bg-blue-100 text-blue-900",
};

function UsageBar({ label, icon: Icon, used, limit, color }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isUnlimited = limit === -1;
  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
          <Icon className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}</span>
        </div>
        <span className="font-bold text-slate-700">
          {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct >= 90 ? "bg-rose-500" : color
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">
            {pct}% used
          </p>
        </>
      )}
    </div>
  );
}

export default function PlanUsageCard({
  plan = "starter",
  activeCoupons = 0,
  planLimit = 5,
  campaignsUsed = 0,
  campaignLimit = 0,
  renewalDays = null,
}) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const planColor = PLAN_COLORS[plan] ?? PLAN_COLORS.starter;

  const effectiveListingLimit =
    plan === "starter" ? 3 : plan === "growth" ? 15 : -1;
  const effectiveCampaignLimit =
    plan === "starter" ? 0 : plan === "growth" ? 4 : -1;

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col hover:shadow-sm transition-all duration-200 p-0 gap-0 font-sans">
      <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3 bg-slate-50/50 min-h-[48px]">
        <div>
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Plan Usage
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Your current subscription limits
          </CardDescription>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${planColor}`}
        >
          {planLabel}
        </span>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-4 pt-3 space-y-3">
        <UsageBar
          label="Listings"
          icon={LayoutList}
          used={activeCoupons}
          limit={effectiveListingLimit}
          color="bg-[#2563eb]"
        />
        <UsageBar
          label="Campaigns"
          icon={Megaphone}
          used={campaignsUsed}
          limit={effectiveCampaignLimit}
          color="bg-blue-700"
        />

        {renewalDays !== null && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {renewalDays > 0
                ? `Renews in ${renewalDays} days`
                : renewalDays === 0
                  ? "Renews today"
                  : "Subscription expired"}
            </span>
          </div>
        )}

        <Link
          href="/merchant/billing"
          className="flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 mt-1"
        >
          <span>Upgrade Plan</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
