"use client";

import { Lock, Plus, RefreshCw, Rocket, Tag } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ACTIONS = [
  {
    id: "post-offer",
    label: "+ Post New Offer",
    href: "/merchant/coupons/new",
    icon: Plus,
    color: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
    locked: false,
  },
  {
    id: "post-deal",
    label: "+ Post New Deal",
    href: "/merchant/coupons/new?type=deal",
    icon: Tag,
    color: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
    locked: false,
  },
  {
    id: "campaign",
    label: "Launch Campaign",
    href: "/merchant/campaigns",
    icon: Rocket,
    color:
      "bg-white border border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 text-slate-800",
    lockedOnStarter: true,
  },
  {
    id: "revive",
    label: "Revive Expired Offers",
    href: "/merchant/coupons?status=expired",
    icon: RefreshCw,
    color:
      "bg-white border border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 text-slate-800",
    lockedOnStarter: true,
  },
];

export default function QuickActionsCard({ plan = "starter" }) {
  const isStarter = plan === "starter";

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 p-0 gap-0 font-sans">
      <CardHeader className="px-4 py-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3 bg-slate-50/50 min-h-[48px]">
        <div>
          <CardTitle className="font-sans text-xs sm:text-[12px] font-bold text-[#08214d] tracking-wider uppercase m-0 leading-none">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal">
            Common tasks to manage your listings
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-4 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const isLocked = isStarter && action.lockedOnStarter;

            if (isLocked) {
              return (
                <div
                  key={action.id}
                  className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed text-xs font-bold select-none"
                  title="Upgrade to unlock"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{action.label}</span>
                  <Lock className="w-3 h-3 ml-auto shrink-0 opacity-60" />
                </div>
              );
            }

            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${action.color}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{action.label}</span>
              </Link>
            );
          })}
        </div>

        {isStarter && (
          <p className="mt-3 text-[10px] text-slate-400 font-semibold text-center">
            Campaign &amp; Revival tools require{" "}
            <Link
              href="/merchant/billing"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-bold"
            >
              Growth plan or above
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
