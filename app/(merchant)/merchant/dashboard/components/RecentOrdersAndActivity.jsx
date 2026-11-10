"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecentOrdersAndActivity({
  recentRedemptions,
  recentClaims = [],
  recentActivities,
}) {
  const [activeTab, setActiveTab] = useState("redemptions");

  const displayList =
    activeTab === "redemptions" ? recentRedemptions : recentClaims;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
      {/* Recent Orders / Claims List (8/12 width) */}
      <div className="col-span-full xl:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full text-left font-sans">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/40">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
              {activeTab === "redemptions"
                ? "Recent Redemptions"
                : "Recent Coupon Claims"}
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
              {activeTab === "redemptions"
                ? "Latest redeemed transactions from your store"
                : "Customer claims and saved codes from your store"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Tab Switched Header */}
            <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("redemptions")}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer border-0 ${
                  activeTab === "redemptions"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
              >
                Redemptions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer border-0 ${
                  activeTab === "claims"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
              >
                Claims ({recentClaims.length})
              </button>
            </div>

            <Link
              href="/merchant/coupons"
              className="text-xs font-medium text-[#F72853] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <Table className="w-full text-xs font-sans">
            <TableHeader className="bg-slate-50/60 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-2 px-3 text-slate-500 font-medium text-[11px]">
                  Customer
                </TableHead>
                <TableHead className="py-2 px-3 text-slate-500 font-medium text-[11px]">
                  {activeTab === "redemptions" ? "Order ID" : "Claim ID"}
                </TableHead>
                <TableHead className="py-2 px-3 text-slate-500 font-medium text-[11px]">
                  Product
                </TableHead>
                <TableHead className="py-2 px-3 text-slate-500 font-medium text-[11px]">
                  Status
                </TableHead>
                <TableHead className="py-2 px-3 text-slate-500 font-medium text-[11px] text-right">
                  {activeTab === "redemptions" ? "Amount" : "Promo Code"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 font-normal text-slate-700">
              {displayList.length > 0 ? (
                displayList.map((tx, idx) => (
                  <TableRow
                    key={tx.id || idx}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <TableCell className="py-2 px-3 flex items-center gap-2">
                      <div
                        className={`w-6.5 h-6.5 rounded-full ${tx.bg || "bg-[#F72853]"} text-white flex items-center justify-center font-medium text-[9px] shadow-2xs shrink-0`}
                      >
                        {tx.initials || "CU"}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-slate-800 text-xs">
                          {tx.name || tx.userName || "Customer"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {tx.email || "customer@example.com"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 font-mono text-[10px] text-slate-500">
                      {tx.id?.slice(0, 8) || "—"}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-slate-700 font-normal text-xs">
                      {tx.product || tx.couponTitle || "Discount Offer"}
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <Badge
                        className={`rounded-full px-2 py-0.5 border-0 text-[10px] font-medium shadow-none ${
                          tx.status === "Completed" ||
                          activeTab === "redemptions"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : "bg-rose-50 text-[#F72853] border border-rose-200/80"
                        }`}
                      >
                        {tx.status ||
                          (activeTab === "redemptions"
                            ? "Redeemed"
                            : "Claimed")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right text-slate-800 font-medium text-xs">
                      {tx.amount || "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-slate-400 text-xs font-normal"
                  >
                    No recent {activeTab} recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Activity Timeline (4/12 width) */}
      <div className="col-span-full xl:col-span-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full font-sans">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/40">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
              Latest events from your store
            </p>
          </div>
          <Link
            href="/merchant/analytics"
            className="text-xs font-medium text-[#F72853] hover:underline flex items-center gap-0.5"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-3.5 sm:p-4">
          <div className="space-y-2.5">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div
                      className={`w-6.5 h-6.5 rounded-lg ${act.bg} ${act.color} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon className="w-3 h-3 stroke-[2]" />
                    </div>
                    <div className="flex-grow space-y-0.5 text-xs text-left">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-medium text-slate-800 text-[11px]">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-tight">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs font-normal">
                No recent store activities recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
