"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  Filter,
  History,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useUserActivities } from "@/hooks/use-user";

export default function ActivityTab() {
  const { activities, isLoading } = useUserActivities();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredActivities = activities.filter((act) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "claims") return act.type === "claim";
    if (activeFilter === "redemptions") return act.type === "redemption";
    if (activeFilter === "revivals") return act.type === "revival";
    if (activeFilter === "account") return act.type === "account" || act.type === "milestone";
    return true;
  });

  const filterTabs = [
    { id: "all", label: "All Activity", count: activities.length },
    {
      id: "claims",
      label: "Claims & Saves",
      count: activities.filter((a) => a.type === "claim").length,
    },
    {
      id: "redemptions",
      label: "Redemptions",
      count: activities.filter((a) => a.type === "redemption").length,
    },
    {
      id: "revivals",
      label: "Revivals",
      count: activities.filter((a) => a.type === "revival").length,
    },
  ];

  return (
    <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 w-full text-left font-sans">
      {/* Header and Filter Controls */}
      <div className="space-y-3 border-b border-[#EADBCE] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-heading font-semibold text-[#35104A] tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#007F79]/10 border border-[#007F79]/20 flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-[#007F79]" />
              </div>
              <span>Your Chronological Activity</span>
            </h3>
            <p className="text-xs font-sans text-[#6B4C82] mt-0.5">
              Real-time audit log of your coupon claims, store redemptions, savings milestones, and revival votes.
            </p>
          </div>

          <span className="text-[11px] font-heading font-semibold text-[#007F79] bg-[#007F79]/10 px-2.5 py-1 rounded-full border border-[#007F79]/20 self-start sm:self-auto">
            {activities.length} Total Events
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#007F79] text-white font-semibold shadow-xs"
                    : "bg-[#FFF8EF] hover:bg-white text-[#35104A] border border-[#EADBCE] hover:border-[#007F79] font-medium"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#EADBCE]/50 text-[#6B4C82]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-sans text-[#6B4C82] space-y-2">
          <div className="w-6 h-6 border-2 border-[#007F79] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading your activity timeline...</p>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-6 relative pl-4 sm:pl-5 border-l-2 border-[#EADBCE] ml-2 sm:ml-2.5">
          {filteredActivities.map((act) => {
            const Icon = act.icon || History;
            return (
              <div key={act.id} className="relative space-y-1 group">
                {/* Node on vertical timeline bar */}
                <div
                  className={`absolute -left-[23px] sm:-left-[27px] top-1 w-3 h-3 rounded-full ${act.badgeColor || "bg-[#007F79]"} ring-4 ring-[#FFFDF9] group-hover:scale-125 transition-transform`}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#35104A] leading-tight group-hover:text-[#007F79] transition-colors">
                      {act.title}
                    </span>
                    {act.type === "redemption" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 text-[9px] font-heading font-semibold">
                        SAVED DEAL
                      </span>
                    )}
                    {act.type === "claim" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#35104A]/10 text-[#35104A] border border-[#35104A]/20 text-[9px] font-heading font-semibold">
                        CLAIMED
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-[10px] sm:text-[11px] text-[#6B4C82] whitespace-nowrap shrink-0">
                    {act.time}
                  </span>
                </div>

                <p className="font-sans text-xs text-[#6B4C82] leading-relaxed">
                  {act.description}
                </p>

                {act.couponId && (
                  <div className="pt-1">
                    <Link
                      href={`/deals/${act.couponId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#007F79] hover:underline"
                    >
                      <span>View Offer Details →</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FFF8EF] border border-dashed border-[#EADBCE] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2 select-none min-h-[140px]">
          <div className="w-10 h-10 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#007F79] shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <span className="font-heading font-semibold text-xs text-[#35104A]">
            No activities in this category
          </span>
          <p className="font-sans text-[11px] text-[#6B4C82] max-w-xs">
            Explore active vouchers or claim new deals to log store visits and savings.
          </p>
          <Link
            href="/trending"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#007F79] hover:underline"
          >
            Browse Trending Deals →
          </Link>
        </div>
      )}
    </div>
  );
}
