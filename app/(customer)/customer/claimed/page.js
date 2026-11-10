"use client";

import { Check, Copy, History, Loader2, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import EmptyState from "@/components/shared/feedback/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useUserRedemptions } from "@/hooks/use-user";
import TableSearch from "@/components/shared/data/TableSearch";

export default function ClaimedCoupons() {
  const { user: authUser } = useUser();
  const user = authUser || { name: "User", role: "customer" };
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: redemptions = [], isLoading: loading } = useUserRedemptions();

  const filteredRedemptions = useMemo(() => {
    if (!searchQuery.trim()) return redemptions;
    const q = searchQuery.toLowerCase();
    return redemptions.filter((r) => {
      const brand = r.merchantId?.businessName || "";
      const title = r.couponId?.title || "";
      const code = r.couponCode || "";
      return (
        brand.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q)
      );
    });
  }, [redemptions, searchQuery]);

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    toast.success("Code copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <DashboardLayout title="Claimed Offers" user={user}>
      <div className="space-y-4 text-left font-sans">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-xs sm:text-[13.5px] font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-[#F72853]" />
            <span>Offer Claims &amp; Redeemed History</span>
          </h2>
          <span className="text-[10px] sm:text-[10.5px] text-[#F72853] font-normal bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
            {redemptions.length} Claimed
          </span>
        </div>

        {loading ? (
          <DashboardSkeleton mode="table" />
        ) : redemptions.length > 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-xs">
                <TableHeader className="bg-slate-50/70 border-b border-slate-100 hover:bg-transparent">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="p-3.5 text-slate-400 font-medium uppercase tracking-wider text-[10px] h-auto">
                      Brand / Store
                    </TableHead>
                    <TableHead className="p-3.5 text-slate-400 font-medium uppercase tracking-wider text-[10px] h-auto">
                      Offer Details
                    </TableHead>
                    <TableHead className="p-3.5 text-slate-400 font-medium uppercase tracking-wider text-[10px] h-auto">
                      Voucher Code
                    </TableHead>
                    <TableHead className="p-3.5 text-slate-400 font-medium uppercase tracking-wider text-[10px] h-auto">
                      Redeemed Date
                    </TableHead>
                    <TableHead className="p-3.5 text-slate-400 font-medium uppercase tracking-wider text-[10px] h-auto text-right">
                      Savings Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filteredRedemptions.map((red, idx) => {
                    const dateStr = new Date(red.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    );
                    const brandName =
                      red.merchantId?.businessName || "Verified Partner";
                    const couponTitle =
                      red.couponId?.title || `${red.discountValue}% OFF`;

                    return (
                      <TableRow
                        key={red._id}
                        className="hover:bg-rose-50/20 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell className="p-3.5 font-medium text-slate-900">
                          {brandName}
                        </TableCell>
                        <TableCell className="p-3.5 text-slate-600">
                          {couponTitle}
                        </TableCell>
                        <TableCell className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md text-[#F72853] text-[11px] font-normal tracking-wide">
                              {red.couponCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(red.couponCode, idx)}
                              className="text-slate-400 hover:text-[#F72853] p-1 rounded-md hover:bg-rose-50 transition-all cursor-pointer border-0 bg-transparent"
                              title="Copy Code"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="p-3.5 text-slate-500 text-[11px]">
                          {dateStr}
                        </TableCell>
                        <TableCell className="p-3.5 text-emerald-600 font-medium text-right">
                          ₹{red.savingsAmount?.toLocaleString("en-IN") || "0"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No claims history"
            description="Your claimed voucher codes will appear here once you redeem them."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
