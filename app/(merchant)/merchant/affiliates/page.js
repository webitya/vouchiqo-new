"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  FileSpreadsheet,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useMerchantAffiliateProducts,
  useMerchantProfile,
  useMerchantRecentRedemptions,
} from "@/hooks/use-merchant";

export default function MerchantAffiliatesPage() {
  const queryClient = useQueryClient();
  const [isEditPayoutOpen, setIsEditPayoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch live merchant profile from DB (plan, bankDetails, businessName, etc.)
  const {
    data: merchant,
    isLoading: isLoadingMerchant,
    refetch: refetchMerchant,
  } = useMerchantProfile();

  // 2. Fetch live redemptions / transactions from DB
  const {
    data: redemptionsData = [],
    isLoading: isLoadingRedemptions,
    refetch: refetchRedemptions,
  } = useMerchantRecentRedemptions(500);

  // 3. Fetch live affiliate products listed by this merchant
  const {
    data: affiliateProducts = [],
    isLoading: isLoadingAffiliates,
    refetch: refetchAffiliates,
  } = useMerchantAffiliateProducts();

  // Bank Form State synced with live merchant DB record
  const [bankForm, setBankForm] = useState({
    holderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    accountType: "current",
  });

  useEffect(() => {
    if (merchant) {
      const b = merchant.bankDetails || {};
      setBankForm({
        holderName: b.holderName || merchant.businessName || "",
        bankName: b.bankName || "",
        accountNumber: b.accountNumber || "",
        confirmAccountNumber: b.accountNumber || "",
        ifsc: b.ifsc || "",
        accountType: b.accountType || "current",
      });
    }
  }, [merchant]);

  // Derived real metrics
  const activeAffiliateCount = useMemo(() => {
    const list = Array.isArray(affiliateProducts)
      ? affiliateProducts
      : (affiliateProducts?.products ?? []);
    return list.filter((p) => p.status === "active").length;
  }, [affiliateProducts]);

  const totalAffiliateClicks = useMemo(() => {
    const list = Array.isArray(affiliateProducts)
      ? affiliateProducts
      : (affiliateProducts?.products ?? []);
    return list.reduce((sum, p) => sum + (Number(p.clickCount) || 0), 0);
  }, [affiliateProducts]);

  // Formatted real transactions from redemptionsData
  const transactions = useMemo(() => {
    const list = Array.isArray(redemptionsData)
      ? redemptionsData
      : (redemptionsData?.redemptions ?? []);
    return list.map((red) => {
      const idStr = red._id
        ? red._id.toString().slice(-6).toUpperCase()
        : "TXN";
      const rawDate = red.createdAt ? new Date(red.createdAt) : new Date();
      const formattedDate = rawDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const formattedTime = rawDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const title =
        red.couponId?.title || red.couponCode || "In-Store Offer Redemption";
      const code = red.couponCode || red.couponId?.code || "CLAIM";
      const savings = Number(red.savingsAmount) || 0;
      // Standard Vouchiqo 5% CPA on confirmed savings/spend (or 0% for trial)
      const commission = Math.round(savings * 0.05);

      return {
        id: `RED-${idStr}`,
        rawId: red._id,
        date: formattedDate,
        time: formattedTime,
        title,
        code,
        customer: red.userName || red.userEmail || "Counter Customer",
        savings,
        commission,
        status: "Confirmed",
      };
    });
  }, [redemptionsData]);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

  const totalSavings = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.savings, 0);
  }, [transactions]);

  const totalCommission = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.commission, 0);
  }, [transactions]);

  // Handle saving bank payout details directly to MongoDB
  const handleSavePayout = async (e) => {
    e.preventDefault();

    if (
      bankForm.accountNumber &&
      bankForm.confirmAccountNumber &&
      bankForm.accountNumber !== bankForm.confirmAccountNumber
    ) {
      toast.error("Account numbers do not match. Please verify.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/merchants/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankDetails: {
            holderName: bankForm.holderName.trim(),
            bankName: bankForm.bankName.trim(),
            accountNumber: bankForm.accountNumber.trim(),
            ifsc: bankForm.ifsc.trim().toUpperCase(),
            accountType: bankForm.accountType,
            isVerified: true,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save bank payout details");
      }

      toast.success("Bank payout account saved to database!");
      await refetchMerchant();
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      setIsEditPayoutOpen(false);
    } catch (err) {
      toast.error(err.message || "Error updating bank details");
    } finally {
      setIsSaving(false);
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions available to export yet.");
      return;
    }

    const headers = [
      "Redemption ID",
      "Date",
      "Time",
      "Offer Title",
      "Code",
      "Customer",
      "Customer Savings (INR)",
      "Commission (INR)",
      "Status",
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      `"${t.title.replace(/"/g, '""')}"`,
      t.code,
      `"${t.customer.replace(/"/g, '""')}"`,
      t.savings,
      t.commission,
      t.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Vouchiqo_Commissions_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Commission statement exported to CSV!");
  };

  const handleSyncDB = async () => {
    toast.loading("Syncing with live database...", { id: "sync-db" });
    await Promise.all([
      refetchMerchant(),
      refetchRedemptions(),
      refetchAffiliates(),
    ]);
    toast.success("Synced with live database!", { id: "sync-db" });
  };

  const hasBankLinked = Boolean(
    merchant?.bankDetails?.accountNumber && merchant?.bankDetails?.ifsc,
  );
  const isLoading =
    isLoadingMerchant || isLoadingRedemptions || isLoadingAffiliates;

  return (
    <DashboardLayout
      title="Affiliate & Commission"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans w-full pb-8">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Affiliate &amp; Commission Hub
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Track live in-store redemptions, payout bank account, and
              affiliate recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncDB}
              disabled={isLoading}
              className="text-xs h-8.5 font-medium rounded-xl border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#F72853]" : "text-slate-500"}`}
              />
              <span>Sync DB</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs h-8.5 font-medium rounded-xl border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Export CSV</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8.5 px-3.5 rounded-xl shadow-xs shadow-[#F72853]/25 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Link href="/merchant/affiliate-products">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Affiliate Products</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* REAL METRICS CARDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Current Commission Model */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl p-4 bg-white space-y-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Commission Model
              </span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Percent className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 tracking-tight">
                {merchant?.plan === "pro" ? "4.0%" : "5.0%"} CPA
              </p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                On verified customer counter redemptions
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-normal">Active Plan:</span>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[10px] py-0.5 px-2">
                {merchant?.plan
                  ? `${merchant.plan.toUpperCase()} Plan`
                  : "STARTER Plan"}
              </Badge>
            </div>
          </Card>

          {/* Card 2: Bank Payout Account (Persisted in DB) */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl p-4 bg-white space-y-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-[#F72853]" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Payout Account
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditPayoutOpen(true)}
                className="text-[11px] font-medium text-[#F72853] hover:text-[#e01e47] hover:bg-rose-50 h-6 px-1.5 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{hasBankLinked ? "Edit" : "Setup"}</span>
              </Button>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {merchant?.bankDetails?.bankName || "No Bank Linked Yet"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {merchant?.bankDetails?.accountNumber
                  ? `•••• •••• ${merchant.bankDetails.accountNumber.slice(-4)} (${merchant.bankDetails.ifsc || ""})`
                  : "Add bank details to receive payouts"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-normal truncate max-w-[110px]">
                {merchant?.bankDetails?.holderName ||
                  merchant?.businessName ||
                  "Merchant"}
              </span>
              {hasBankLinked
                ? <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Linked
                  </span>
                : <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Setup
                    Needed
                  </span>}
            </div>
          </Card>

          {/* Card 3: Payout Schedule & Next Cycle */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl p-4 bg-white space-y-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Settlement Cycle
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 tracking-tight">
                1st &amp; 15th Monthly
              </p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Automated NEFT / IMPS direct transfer
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-normal">
                Redemptions Tracked:
              </span>
              <span className="font-semibold text-slate-800">
                {transactions.length} Total
              </span>
            </div>
          </Card>

          {/* Card 4: Affiliate Products Recommendation Hub */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl p-4 bg-white space-y-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Affiliate Products
              </span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 tracking-tight">
                {activeAffiliateCount} Active{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({totalAffiliateClicks} clicks)
                </span>
              </p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Custom affiliate recommendation links
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <Link
                href="/merchant/affiliate-products"
                className="text-xs font-medium text-[#F72853] hover:underline flex items-center gap-1"
              >
                <span>Manage Products</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-medium text-[10px] py-0.5 px-2">
                Live
              </Badge>
            </div>
          </Card>
        </div>

        {/* AFFILIATE MONETIZATION INFO BANNER */}
        <div className="p-3.5 bg-gradient-to-r from-rose-50/60 via-pink-50/30 to-slate-50 rounded-2xl border border-rose-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#F72853] border border-rose-200/80 shadow-2xs flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800">
                Monetize with Custom Affiliate Products
              </h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Add products with your custom referral links (EarnKaro,
                CashKaro, Amazon) to earn extra commissions from your store
                visitors.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-medium h-8 px-3 rounded-xl border-rose-200 text-[#F72853] hover:bg-rose-50 shrink-0 cursor-pointer shadow-2xs"
          >
            <Link href="/merchant/affiliate-products">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
            </Link>
          </Button>
        </div>

        {/* CONFIRMED REDEMPTIONS & COMMISSION BREAKDOWN TABLE */}
        <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden text-left">
          {/* Table Header & Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                Confirmed Redemptions &amp; Commission Statements
              </h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Real-time transactions recorded from customer in-store code
                redemptions.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search offer or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-[#F72853]/20"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoadingRedemptions
              ? <div className="p-10 flex items-center justify-center text-slate-500 text-xs font-normal gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F72853]" />
                  <span>Fetching live transactions from database...</span>
                </div>
              : filteredTransactions.length === 0
                ? <div className="p-8">
                    <EmptyState
                      icon={ShieldCheck}
                      title={
                        searchQuery
                          ? "No matching redemptions found"
                          : "No Confirmed Redemptions Yet"
                      }
                      description={
                        searchQuery
                          ? `No redemption records matched "${searchQuery}". Clear the search to view all.`
                          : "When customers claim and verify your active discount offers at store checkout, real-time records and commission calculations will appear here."
                      }
                      actionLabel={
                        searchQuery ? "Clear Search" : "View Active Offers"
                      }
                      onAction={() => {
                        if (searchQuery) setSearchQuery("");
                        else window.location.href = "/merchant/coupons";
                      }}
                    />
                  </div>
                : <Table className="w-full text-xs font-sans">
                    <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px]">
                          Redemption ID
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px]">
                          Date &amp; Time
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px]">
                          Offer / Coupon
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px]">
                          Customer
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px] text-right">
                          Savings Amount
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px] text-right">
                          Platform Commission
                        </TableHead>
                        <TableHead className="py-2.5 px-3.5 text-slate-500 font-medium text-[11px] text-center">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 font-normal text-slate-700">
                      {filteredTransactions.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-rose-50/20 transition-colors"
                        >
                          <TableCell className="py-2.5 px-3.5 font-mono text-[10px] text-slate-500 font-medium">
                            {row.id}
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 text-slate-600 text-xs">
                            <span>{row.date}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {row.time}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 font-medium text-slate-900 max-w-[220px]">
                            <span className="truncate block">{row.title}</span>
                            <span className="text-[10px] font-mono text-blue-600 font-normal">
                              Code: {row.code}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 text-slate-600 text-xs">
                            {row.customer}
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 text-right font-medium text-slate-800 text-xs">
                            ₹
                            {(Number(row.savings) || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 text-right font-medium text-[#F72853] text-xs">
                            ₹
                            {(Number(row.commission) || 0).toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-3.5 text-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium py-0.5 px-2 shadow-none">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>}
          </div>
        </Card>

        {/* EDIT BANK PAYOUT MODAL (PERSISTED IN MONGODB) */}
        <Dialog open={isEditPayoutOpen} onOpenChange={setIsEditPayoutOpen}>
          <DialogContent className="max-w-md bg-white p-5 sm:p-6 rounded-2xl text-left font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Bank Payout Account Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-normal">
                Enter your verified bank details to receive automated bi-monthly
                payout settlements.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePayout} className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                  <User className="w-3.5 h-3.5 text-[#F72853]" /> Account Holder
                  Name *
                </Label>
                <Input
                  type="text"
                  value={bankForm.holderName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, holderName: e.target.value })
                  }
                  placeholder="e.g. Webitya Enterprises"
                  className="bg-white border-slate-200 text-xs h-9 rounded-xl focus-visible:ring-[#F72853]/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-[#F72853]" /> Bank Name
                  *
                </Label>
                <Input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankName: e.target.value })
                  }
                  placeholder="e.g. HDFC Bank, State Bank of India"
                  className="bg-white border-slate-200 text-xs h-9 rounded-xl focus-visible:ring-[#F72853]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-[#F72853]" />{" "}
                    Account Number *
                  </Label>
                  <Input
                    type="password"
                    value={bankForm.accountNumber}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        accountNumber: e.target.value.trim(),
                      })
                    }
                    placeholder="Enter account number"
                    className="bg-white border-slate-200 text-xs h-9 rounded-xl font-mono focus-visible:ring-[#F72853]/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-[#F72853]" />{" "}
                    Confirm Account *
                  </Label>
                  <Input
                    type="text"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        confirmAccountNumber: e.target.value.trim(),
                      })
                    }
                    placeholder="Re-enter account number"
                    className="bg-white border-slate-200 text-xs h-9 rounded-xl font-mono focus-visible:ring-[#F72853]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                    <Banknote className="w-3.5 h-3.5 text-[#F72853]" /> IFSC
                    Code *
                  </Label>
                  <Input
                    type="text"
                    value={bankForm.ifsc}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        ifsc: e.target.value.toUpperCase().trim(),
                      })
                    }
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="bg-white border-slate-200 text-xs h-9 rounded-xl font-mono uppercase focus-visible:ring-[#F72853]/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                    Account Type
                  </Label>
                  <Select
                    value={bankForm.accountType}
                    onValueChange={(val) =>
                      setBankForm({ ...bankForm, accountType: val })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditPayoutOpen(false)}
                  className="text-xs font-medium rounded-xl h-8.5"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8.5 px-4 rounded-xl shadow-xs shadow-[#F72853]/25 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving
                    ? <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Saving to DB...
                      </>
                    : "Save Bank Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
