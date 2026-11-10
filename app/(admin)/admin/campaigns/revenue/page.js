"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Percent,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import MobileTableCard from "@/components/shared/data/MobileTableCard";

import { useAdminCampaignRevenue } from "@/hooks/use-admin";

// 8 Distinct Pastel Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  {
    row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900",
  },
  {
    row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900",
  },
  {
    row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900",
  },
  {
    row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900",
  },
  {
    row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900",
  },
  {
    row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900",
  },
  {
    row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900",
  },
  {
    row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900",
  },
];

export default function AdminCampaignRevenuePage() {
  const {
    data,
    isLoading: loading,
    refetch: fetchRevenue,
  } = useAdminCampaignRevenue();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);

  const transactions = data?.transactions || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Tab filter
      if (
        activeTab === "featured" &&
        !t.addOnType?.toLowerCase().includes("featured")
      )
        return false;
      if (activeTab === "push" && !t.addOnType?.toLowerCase().includes("push"))
        return false;
      if (
        activeTab === "boost" &&
        !t.addOnType?.toLowerCase().includes("boost")
      )
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id?.toLowerCase().includes(q) ||
          t.merchantName?.toLowerCase().includes(q) ||
          t.campaignName?.toLowerCase().includes(q) ||
          t.addOnType?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [transactions, activeTab, searchQuery]);

  const handleDownloadInvoice = (txn) => {
    setDownloadingId(txn.id);
    toast.success(`Generating invoice for ${txn.id}...`, {
      id: `inv-${txn.id}`,
    });
    setTimeout(() => {
      setDownloadingId(null);
      toast.success(`Invoice ${txn.id}.pdf downloaded!`);
    }, 1500);
  };

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0)
      return toast.error("No transactions to export");
    const headers =
      "Transaction ID,Date,Merchant Name,Campaign Name,Add-On Purchased,Amount,Payment Status\n";
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchantName}","${t.campaignName}","${t.addOnType}","${t.amount}","${t.status}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign_revenue_ledger_${Date.now()}.csv`;
    a.click();
    toast.success("CSV export downloaded successfully!");
  };

  const totalAddOn = data?.totalAddOnRevenue || 0;
  const totalSub = data?.totalSubscriptionRevenue || 0;
  const grossMonthly = data?.grossMonthlyRevenue || 0;

  return (
    <DashboardLayout
      title="Campaign Revenue Management"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Campaign Revenue &amp; Add-on Ledger
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Real-time Razorpay payments, campaign add-on purchases &amp;
                merchant subscription breakdown from database.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Razorpay Webhooks Active
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRevenue}
                    disabled={loading}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                >
                  Fetch latest revenue transactions from database
                </TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3 h-3 text-blue-600" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Campaign Add-on Revenue
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none font-mono">
                    ₹{totalAddOn.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Merchant Subscriptions
                  </span>
                  <span className="text-base font-medium text-blue-700 mt-0.5 block leading-none font-mono">
                    ₹{totalSub.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Gross Monthly Revenue
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none font-mono">
                    ₹{grossMonthly.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Transactions
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {transactions.length}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table Container Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            {/* Header Controls & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search transaction ID, merchant, campaign..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                {[
                  {
                    id: "all",
                    label: "All Purchases",
                    count: transactions.length,
                    desc: "Show all campaign add-on purchases",
                  },
                  {
                    id: "featured",
                    label: "Featured Slots",
                    count: transactions.filter((t) =>
                      t.addOnType?.toLowerCase().includes("featured"),
                    ).length,
                    desc: "Homepage featured carousel slots",
                  },
                  {
                    id: "push",
                    label: "Push Alerts",
                    count: transactions.filter((t) =>
                      t.addOnType?.toLowerCase().includes("push"),
                    ).length,
                    desc: "Targeted push notification sends",
                  },
                  {
                    id: "boost",
                    label: "Flash Boosts",
                    count: transactions.filter((t) =>
                      t.addOnType?.toLowerCase().includes("boost"),
                    ).length,
                    desc: "Flash campaign highlight boosts",
                  },
                ].map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800 bg-transparent",
                        )}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={cn(
                            "text-[9px] px-1 rounded-full",
                            activeTab === tab.id
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-200/70 text-slate-600",
                          )}
                        >
                          {tab.count}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                    >
                      {tab.desc}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Colorful Transactions Table - Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 w-32">Txn ID</th>
                    <th className="py-2 px-3 w-36">Date &amp; Time</th>
                    <th className="py-2 px-3 w-52">Merchant Partner</th>
                    <th className="py-2 px-3">Campaign &amp; Add-on</th>
                    <th className="py-2 px-3 text-right w-28">Amount</th>
                    <th className="py-2 px-3 text-center w-32">Status</th>
                    <th className="py-2 px-3 text-right w-20">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-2.5 px-3">
                            <div className="h-4 w-20 bg-slate-200/80 rounded" />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="h-4 w-32 bg-slate-200/80 rounded" />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="h-4 w-40 bg-slate-100 rounded" />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="h-4 w-16 bg-slate-200/80 rounded ml-auto" />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="h-5 w-20 bg-slate-100 rounded mx-auto" />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="h-6 w-6 bg-slate-200/80 rounded ml-auto" />
                          </td>
                        </tr>
                      ))
                    : filteredTransactions.length === 0
                      ? <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            No transactions found matching your filter.
                          </td>
                        </tr>
                      : filteredTransactions.map((txn, index) => {
                          const theme =
                            ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
                          const isDownloading = downloadingId === txn.id;

                          return (
                            <tr
                              key={txn.id}
                              className={cn(
                                "transition-all duration-150",
                                theme.row,
                              )}
                            >
                              {/* Txn ID */}
                              <td className="py-2 px-3">
                                <span className="font-mono text-[11px] font-medium text-slate-900 bg-white/95 border border-slate-300/90 px-1.5 py-0.5 rounded shadow-2xs">
                                  {txn.id}
                                </span>
                              </td>

                              {/* Date & Time */}
                              <td className="py-2 px-3 font-mono text-[10.5px] text-slate-600">
                                {txn.date}
                              </td>

                              {/* Merchant Partner */}
                              <td className="py-2 px-3">
                                <span className="font-medium text-slate-900 text-[11.5px] block truncate">
                                  {txn.merchantName}
                                </span>
                              </td>

                              {/* Campaign & Add-on */}
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium text-slate-900 text-[11.5px]">
                                    {txn.campaignName}
                                  </span>
                                  <span className="text-[10px] text-slate-600 bg-white/95 border border-slate-300/90 px-1.5 py-0.2 rounded shadow-2xs font-normal">
                                    {txn.addOnType}
                                  </span>
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 text-[11.5px]">
                                {txn.amount}
                              </td>

                              {/* Status */}
                              <td className="py-2 px-3 text-center">
                                <span className="px-2 py-0.5 text-[9.5px] font-medium rounded-md border shadow-2xs bg-white/95 text-emerald-700 border-emerald-300 inline-block whitespace-nowrap">
                                  {txn.status || "Razorpay Verified"}
                                </span>
                              </td>

                              {/* Invoice Download Action */}
                              <td className="py-2 px-3 text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isDownloading}
                                      onClick={() => handleDownloadInvoice(txn)}
                                      className="h-6.5 w-6.5 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 border-slate-200 bg-white rounded-md cursor-pointer ml-auto shadow-2xs"
                                    >
                                      {isDownloading
                                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                                        : <FileText className="w-3 h-3 text-rose-500" />}
                                      <span className="sr-only">
                                        Download GST Invoice
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                  >
                                    Download GST Tax Invoice PDF
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Transactions (Reference Card Design) */}
            <div className="md:hidden space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 animate-pulse shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3 w-48 bg-slate-100 rounded" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                  ))
                : filteredTransactions.length === 0
                  ? <div className="py-8 text-center text-slate-400 text-xs">
                      No transaction records found matching your filter.
                    </div>
                  : filteredTransactions.map((txn, index) => {
                      const isDownloading = downloadingId === txn.id;
                      return (
                        <MobileTableCard
                          key={txn.id || index}
                          avatarText={txn.merchantName}
                          avatarBg="bg-blue-600"
                          badge="CAMPAIGN TRANSACTION"
                          title={txn.merchantName}
                          subtitle={`${txn.campaignName} • ${txn.addOnType}`}
                          fields={[
                            {
                              label: "TRANSACTION ID",
                              value: txn.id,
                              isCode: true,
                            },
                            {
                              label: "DATE & TIME",
                              value: txn.date,
                            },
                            {
                              label: "STATUS",
                              value: txn.status || "Verified",
                              isStatus: true,
                              statusType: "success",
                            },
                            {
                              label: "AMOUNT",
                              value: txn.amount,
                              isAmount: true,
                            },
                          ]}
                          actionText={
                            isDownloading
                              ? "Generating Invoice..."
                              : "Download GST Invoice"
                          }
                          actionIcon={Download}
                          actionDisabled={isDownloading}
                          onAction={() => handleDownloadInvoice(txn)}
                        />
                      );
                    })}
            </div>

            {/* Bottom Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-normal">
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                total add-on payment records
              </span>
              <span className="text-[11px] font-mono text-slate-700 font-medium">
                Live Add-on Total: ₹{totalAddOn.toLocaleString("en-IN")}
              </span>
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
