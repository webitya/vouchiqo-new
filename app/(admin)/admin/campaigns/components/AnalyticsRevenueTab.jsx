"use client";

import { CreditCard, Download, PieChart } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const REVENUE_TRANSACTIONS = [
  {
    id: "TXN-8491",
    date: "2026-07-20",
    merchant: "Marbella Tiles",
    campaign: "Summer Sale Blast",
    addon: "Ticker Priority (3 Days)",
    amount: 999,
    status: "Paid",
  },
  {
    id: "TXN-8492",
    date: "2026-07-19",
    merchant: "Burger House",
    campaign: "BOGO Fiesta",
    addon: "Push Notification",
    amount: 599,
    status: "Paid",
  },
  {
    id: "TXN-8493",
    date: "2026-07-18",
    merchant: "JewelCraft Ranchi",
    campaign: "Pre-Diwali Festival",
    addon: "Festival Package",
    amount: 2999,
    status: "Paid",
  },
];

export default function AnalyticsRevenueTab() {
  const handleGeneratePdf = () => {
    toast.success("Generating Post-Campaign Performance PDF Report...");
    setTimeout(() => {
      toast.success("PDF Report downloaded successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Channel Attribution Breakdown */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" /> Channel Conversion
            Attribution
          </h3>
          <Button
            size="sm"
            onClick={handleGeneratePdf}
            className="bg-[#e85d04] hover:bg-orange-600 text-white font-bold text-xs h-8 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-xs font-bold text-amber-800 block">
              Homepage Ticker
            </span>
            <span className="text-lg font-black text-slate-900 block mt-0.5">
              48.2%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              878 Redemptions
            </span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-800 block">
              Email Blast (E-9)
            </span>
            <span className="text-lg font-black text-slate-900 block mt-0.5">
              28.4%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              517 Redemptions
            </span>
          </div>
          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
            <span className="text-xs font-bold text-orange-800 block">
              Push Notification
            </span>
            <span className="text-lg font-black text-slate-900 block mt-0.5">
              18.1%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              330 Redemptions
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-700 block">
              Direct / Organic
            </span>
            <span className="text-lg font-black text-slate-900 block mt-0.5">
              5.3%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              95 Redemptions
            </span>
          </div>
        </div>
      </Card>

      {/* Razorpay Add-On Revenue Table */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Campaign Add-On
            Razorpay Revenue Log
          </h3>
          <Badge className="bg-emerald-50 text-emerald-800 font-bold text-xs border-0">
            Total Revenue: ₹4,597
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/60">
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Txn ID
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Merchant
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Add-On Purchased
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Amount
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600 text-right">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REVENUE_TRANSACTIONS.map((tx) => (
              <TableRow key={tx.id} className="border-slate-100">
                <TableCell className="font-mono text-xs font-bold text-slate-700">
                  {tx.id}
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-600">
                  {tx.date}
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900">
                  {tx.merchant}
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-800">
                  {tx.addon}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-[#e85d04]">
                  ₹{tx.amount}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold">
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
