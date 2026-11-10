"use client";

import {
  Activity,
  ArrowLeft,
  Award,
  Building2,
  CreditCard,
  DollarSign,
  ExternalLink,
  LifeBuoy,
  Loader2,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Store,
  Tag,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";
import { FormSelect } from "@/components/shared/form";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminMerchantDetail,
  useReviewMerchant,
  useUpdateAdminMerchant,
} from "@/hooks/use-admin";

const PLAN_OVERRIDE_OPTIONS = [
  { value: "starter", label: "Starter Free (₹0)" },
  { value: "growth", label: "Growth Partner (₹1,499/mo)" },
  { value: "pro", label: "Pro Partner (₹3,999/mo)" },
  { value: "enterprise", label: "Enterprise Partner (₹9,999/mo)" },
];

export default function MerchantDetailPage({ params }) {
  const resolvedParams = use(params);
  const merchantId = resolvedParams.id;

  const { data: detailData, isLoading: loading } =
    useAdminMerchantDetail(merchantId);
  const merchant = detailData?.merchant || null;
  const updateMerchantMutation = useUpdateAdminMerchant(merchantId);
  const reviewMerchantMutation = useReviewMerchant();

  const [activeTab, setActiveTab] = useState("profile");

  // API Action Loading States
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isTogglingSuspend, setIsTogglingSuspend] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Change Plan Modal State
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState("pro");

  useEffect(() => {
    if (merchant?.plan) {
      setTargetPlan(merchant.plan);
    }
  }, [merchant?.plan]);

  const coupons = useMemo(() => {
    if (!detailData) return [];
    return [
      ...(detailData.coupons || []),
      ...(detailData.affiliateProducts || []).map((a) => ({
        ...a,
        code: "Affiliate Link",
        discountType: "percentage",
        discountValue: a.discountPercentage || 0,
        isAffiliate: true,
      })),
    ];
  }, [detailData]);

  // Handle Adding Revival Credits
  const handleAddCredits = useCallback(async () => {
    if (!merchant) return;
    const currentCredits = merchant.revivalCredits || 50;
    const newCredits = currentCredits + 25;
    try {
      setIsAddingCredits(true);
      await updateMerchantMutation.mutateAsync({
        revivalCredits: newCredits,
      });
      toast.success(`Added +25 Revival Credits! (Total: ${newCredits})`);
    } catch (err) {
      toast.error(err.message || "Failed to add revival credits.");
    } finally {
      setIsAddingCredits(false);
    }
  }, [merchant, updateMerchantMutation]);

  // Handle Suspend / Reactivate Account
  const handleToggleSuspend = useCallback(async () => {
    if (!merchant) return;
    const isCurrentlySuspended = merchant.status === "suspended";
    const nextStatus = isCurrentlySuspended ? "approved" : "suspended";
    try {
      setIsTogglingSuspend(true);
      await reviewMerchantMutation.mutateAsync({
        merchantId,
        status: nextStatus,
        rejectionReason: isCurrentlySuspended ? "" : "Suspended by admin",
      });
      toast.success(
        `Merchant account ${isCurrentlySuspended ? "reactivated" : "suspended"}.`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to update account status.");
    } finally {
      setIsTogglingSuspend(false);
    }
  }, [merchant, merchantId, reviewMerchantMutation]);

  // Handle Changing Subscription Plan
  const handleChangePlan = useCallback(async () => {
    try {
      setIsChangingPlan(true);
      await updateMerchantMutation.mutateAsync({
        plan: targetPlan,
      });
      toast.success(
        `Merchant subscription updated to ${targetPlan.toUpperCase()}!`,
      );
      setIsChangePlanOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to change subscription plan.");
    } finally {
      setIsChangingPlan(false);
    }
  }, [merchantId, targetPlan, updateMerchantMutation]);

  // Listings Column Definitions
  const listingColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Offer Title",
        sortable: true,
        cell: (c) => (
          <div>
            <span className="font-bold text-slate-900 block">
              {c.title || c.headline}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {c.code || "VOUCHIQO"}
            </span>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        cell: (c) => (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
            {c.category || "General"}
          </span>
        ),
      },
      {
        key: "claimsCount",
        header: "Total Redemptions",
        sortable: true,
        align: "right",
        cell: (c) => (
          <span className="font-mono font-bold text-slate-900">
            {c.claimsCount || c.redemptions || 0}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        cell: (c) => {
          const s = (c.status || "active").toLowerCase();
          return (
            <Badge
              className={`rounded px-2 py-0.5 border-0 text-[9px] font-bold uppercase ${
                s === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : s === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        key: "createdAt",
        header: "Created Date",
        sortable: true,
        cell: (c) => (
          <span className="font-mono text-[11px] text-slate-500">
            {c.createdAt
              ? new Date(c.createdAt).toLocaleDateString("en-IN")
              : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  // Dynamic Metrics & Subscriptions / Commissions Mock Tables
  const totalCouponsCount = coupons.length;
  const totalRedemptionsCount = coupons.reduce(
    (acc, curr) => acc + (curr.claimsCount || curr.redemptions || 0),
    0,
  );

  const mockSubscriptions = useMemo(
    () => [
      {
        date: merchant?.createdAt
          ? new Date(merchant.createdAt).toLocaleDateString("en-IN")
          : "2026-07-01",
        plan: (merchant?.plan || "starter").toUpperCase(),
        amount:
          merchant?.plan === "pro"
            ? "₹3,999.00"
            : merchant?.plan === "growth"
              ? "₹1,499.00"
              : "₹0.00",
        cycle: "Monthly Recurring",
        status: "ACTIVE",
      },
    ],
    [merchant],
  );

  const mockCommissions = useMemo(
    () => [
      {
        id: "COMM-801",
        date: "2026-07-20",
        item: "Partner Store Listing Redemptions",
        model: "5% Standard Commission",
        amount: `₹${(totalRedemptionsCount * 25).toLocaleString("en-IN")}`,
        status: "Settled",
      },
    ],
    [totalRedemptionsCount],
  );

  const mockTickets = useMemo(
    () => [
      {
        id: "TKT-104",
        date: "2026-07-18",
        subject: "Request for Store Listing Address Update",
        status: "Resolved",
        priority: "Normal",
      },
    ],
    [],
  );

  const mockActivityLog = useMemo(
    () => [
      {
        time: merchant?.updatedAt
          ? new Date(merchant.updatedAt).toLocaleString("en-IN")
          : "Just now",
        action: "Merchant Profile Updated",
        details: `Account status: ${merchant?.status || "approved"}`,
      },
      {
        time: merchant?.createdAt
          ? new Date(merchant.createdAt).toLocaleString("en-IN")
          : "2026-07-01",
        action: "Merchant Registered & Onboarded",
        details: `Initial Plan: ${(merchant?.plan || "starter").toUpperCase()}`,
      },
    ],
    [merchant],
  );

  if (loading) {
    return (
      <DashboardLayout
        title="Merchant Profile Dashboard"
        user={{ name: "Super Admin", role: "admin" }}
      >
        <div className="space-y-6 text-left font-sans w-full pb-8">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const bName = merchant?.businessName || "Merchant Partner";
  const statusStr = (merchant?.status || "pending").toLowerCase();
  const isSuspended = statusStr === "suspended";
  const planName = (merchant?.plan || "starter").toUpperCase();
  const credits = merchant?.revivalCredits || 50;

  return (
    <DashboardLayout
      title="Executive Merchant Control Center"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full pb-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="p-1.5 h-auto rounded-xl">
              <Link href="/admin/merchants">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" /> {bName}
                </h1>
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border-0 uppercase ${
                    isSuspended
                      ? "bg-rose-100 text-rose-800"
                      : statusStr === "approved" || statusStr === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {merchant?.status || "Approved"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold border-slate-200 uppercase"
                >
                  {planName} PLAN
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Merchant ID:{" "}
                <span className="font-mono text-slate-800">{merchantId}</span> •
                Registered:{" "}
                {merchant?.createdAt
                  ? new Date(merchant.createdAt).toLocaleDateString("en-IN")
                  : "—"}
              </p>
            </div>
          </div>

          {/* Header Action Buttons with Loading States */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={isAddingCredits}
              onClick={handleAddCredits}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-3.5 cursor-pointer shadow-xs"
            >
              {isAddingCredits
                ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                : <PlusCircle className="w-3.5 h-3.5 mr-1" />}
              <span>+ Add 25 Credits ({credits})</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsChangePlanOpen(true)}
              className="text-xs font-bold rounded-xl border-slate-200 h-9 px-3.5 cursor-pointer bg-white"
            >
              <Award className="w-3.5 h-3.5 mr-1 text-purple-600" /> Change Plan
            </Button>

            <Button
              disabled={isTogglingSuspend}
              onClick={handleToggleSuspend}
              className={`text-xs font-bold rounded-xl h-9 px-3.5 cursor-pointer ${
                isSuspended
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {isTogglingSuspend
                ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                : isSuspended
                  ? <UserCheck className="w-3.5 h-3.5 mr-1" />
                  : <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
              <span>
                {isSuspended ? "Reactivate Account" : "Suspend Account"}
              </span>
            </Button>
          </div>
        </div>

        {/* 4 EXECUTIVE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-semibold">
          <Card className="p-4 rounded-2xl bg-white border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Offers Listed
            </span>
            <p className="text-2xl font-black text-slate-900">
              {totalCouponsCount}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl bg-white border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Redemptions
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {totalRedemptionsCount.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl bg-white border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Est Revenue (₹)
            </span>
            <p className="text-2xl font-black text-blue-600">
              ₹{(totalRedemptionsCount * 250).toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl bg-white border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Revival Credits Balance
            </span>
            <p className="text-2xl font-black text-[#e85d04]">⚡ {credits}</p>
          </Card>
        </div>

        {/* 6 MASTER TABS NAVIGATION */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4"
        >
          <TabsList className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap gap-1 justify-start h-auto w-full">
            <TabsTrigger
              value="profile"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 mr-1" /> Business Profile
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <Tag className="w-3.5 h-3.5 mr-1" /> Offer Listings (
              {totalCouponsCount})
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" /> Subscription History
            </TabsTrigger>
            <TabsTrigger
              value="commissions"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Commission Ledger
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <LifeBuoy className="w-3.5 h-3.5 mr-1" /> Support Tickets
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 mr-1" /> Activity Log
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BUSINESS PROFILE */}
          <TabsContent value="profile">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" /> Full Verified
                  Merchant Profile
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-slate-200"
                >
                  KYC Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">
                    Legal Business Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {bName}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">
                    Contact Email Address
                  </span>
                  <span className="font-mono text-slate-900 text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {merchant?.contactEmail || merchant?.email || "—"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">
                    Business Category
                  </span>
                  <span className="font-bold text-slate-900 text-sm capitalize">
                    {merchant?.category || "General Retail"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">
                    Primary Phone Contact
                  </span>
                  <span className="font-mono text-slate-900 text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {merchant?.phone ||
                      merchant?.contactPhone ||
                      "+91 98351 23456"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 border border-slate-100 md:col-span-2">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">
                    Store Location / Address
                  </span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e85d04]" />{" "}
                    {merchant?.address ||
                      merchant?.location?.address ||
                      "Ranchi, Jharkhand, India"}
                  </span>
                </div>
              </div>

              {/* Uploaded KYC & Statutory Documents */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Statutory KYC &amp; Visual Document Assets
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Document */}
                  {(() => {
                    const docImgUrl =
                      merchant?.docImage ||
                      merchant?.docFileUrl ||
                      merchant?.docUrl ||
                      merchant?.identityDocumentUrl ||
                      merchant?.docFile;
                    return (
                      <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block">
                            Identity Document (
                            {merchant?.docType || "GST Certificate"})
                          </span>
                          {docImgUrl && (
                            <a
                              href={docImgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Full Size
                            </a>
                          )}
                        </div>
                        {docImgUrl
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={docImgUrl}
                              alt={
                                merchant?.docType || "Primary Identity Document"
                              }
                              className="max-h-48 mx-auto object-contain rounded-xl border border-purple-200 bg-white p-1 shadow-2xs"
                            />
                          : <div className="py-6 text-center text-xs text-slate-400 font-medium">
                              No primary document image uploaded
                            </div>}
                      </div>
                    );
                  })()}

                  {/* Shop Front Photo */}
                  {(() => {
                    const shopImgUrl =
                      merchant?.shopImage ||
                      merchant?.shopPhotoUrl ||
                      merchant?.shopFrontUrl ||
                      merchant?.storePhotoUrl;
                    return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block">
                            Shop Front Photograph
                          </span>
                          {shopImgUrl && (
                            <a
                              href={shopImgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Full Size
                            </a>
                          )}
                        </div>
                        {shopImgUrl
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={shopImgUrl}
                              alt="Shop Front"
                              className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
                            />
                          : <div className="py-6 text-center text-xs text-slate-400 font-medium">
                              No shop front photo uploaded
                            </div>}
                      </div>
                    );
                  })()}

                  {/* Store Logo */}
                  {(() => {
                    const logoImgUrl =
                      merchant?.logo || merchant?.logoUrl || merchant?.shopLogo;
                    return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block">
                            Store Brand Logo
                          </span>
                          {logoImgUrl && (
                            <a
                              href={logoImgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Full Size
                            </a>
                          )}
                        </div>
                        {logoImgUrl
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logoImgUrl}
                              alt="Store Logo"
                              className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
                            />
                          : <div className="py-6 text-center text-xs text-slate-400 font-medium">
                              No store logo uploaded
                            </div>}
                      </div>
                    );
                  })()}

                  {/* Store Banner */}
                  {(() => {
                    const bannerImgUrl =
                      merchant?.banner ||
                      merchant?.bannerUrl ||
                      merchant?.shopBanner;
                    return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block">
                            Store Banner Image
                          </span>
                          {bannerImgUrl && (
                            <a
                              href={bannerImgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Full Size
                            </a>
                          )}
                        </div>
                        {bannerImgUrl
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={bannerImgUrl}
                              alt="Store Banner"
                              className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
                            />
                          : <div className="py-6 text-center text-xs text-slate-400 font-medium">
                              No store banner uploaded
                            </div>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: OFFER LISTINGS */}
          <TabsContent value="listings">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Merchant Offer Listings ({totalCouponsCount})
              </h3>
              <DataTable
                columns={listingColumns}
                data={coupons}
                searchable={true}
                searchPlaceholder="Search merchant offers..."
                defaultPageSize={10}
                emptyState="No offers currently listed for this merchant."
              />
            </Card>
          </TabsContent>

          {/* TAB 3: SUBSCRIPTION HISTORY */}
          <TabsContent value="subscriptions">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Subscription &amp; Billing History
              </h3>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: "Billing Date",
                    cell: (s) => (
                      <span className="font-mono text-xs">{s.date}</span>
                    ),
                  },
                  {
                    key: "plan",
                    header: "Plan Tier",
                    cell: (s) => (
                      <span className="font-bold text-slate-900">{s.plan}</span>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Amount Paid",
                    cell: (s) => (
                      <span className="font-mono font-bold text-slate-900">
                        {s.amount}
                      </span>
                    ),
                  },
                  {
                    key: "cycle",
                    header: "Cycle",
                    cell: (s) => (
                      <span className="text-xs text-slate-500">{s.cycle}</span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (s) => (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        {s.status}
                      </Badge>
                    ),
                  },
                ]}
                data={mockSubscriptions}
                searchable={false}
                defaultPageSize={10}
              />
            </Card>
          </TabsContent>

          {/* TAB 4: COMMISSION LEDGER */}
          <TabsContent value="commissions">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Commission &amp; Settlement Ledger
              </h3>
              <DataTable
                columns={[
                  {
                    key: "id",
                    header: "Transaction ID",
                    cell: (c) => (
                      <span className="font-mono text-xs font-bold">
                        {c.id}
                      </span>
                    ),
                  },
                  {
                    key: "date",
                    header: "Date",
                    cell: (c) => (
                      <span className="font-mono text-xs">{c.date}</span>
                    ),
                  },
                  {
                    key: "item",
                    header: "Listing Item",
                    cell: (c) => (
                      <span className="font-bold text-slate-900">{c.item}</span>
                    ),
                  },
                  {
                    key: "model",
                    header: "Model",
                    cell: (c) => (
                      <span className="text-xs text-slate-600">{c.model}</span>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Commission",
                    cell: (c) => (
                      <span className="font-mono font-bold text-[#e85d04]">
                        {c.amount}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (c) => (
                      <Badge className="bg-blue-100 text-blue-800 text-[9px] font-bold">
                        {c.status}
                      </Badge>
                    ),
                  },
                ]}
                data={mockCommissions}
                searchable={false}
                defaultPageSize={10}
              />
            </Card>
          </TabsContent>

          {/* TAB 5: SUPPORT TICKETS */}
          <TabsContent value="tickets">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Merchant Support Tickets
              </h3>
              <DataTable
                columns={[
                  {
                    key: "id",
                    header: "Ticket ID",
                    cell: (t) => (
                      <span className="font-mono text-xs font-bold">
                        {t.id}
                      </span>
                    ),
                  },
                  {
                    key: "date",
                    header: "Date Filed",
                    cell: (t) => (
                      <span className="font-mono text-xs">{t.date}</span>
                    ),
                  },
                  {
                    key: "subject",
                    header: "Subject",
                    cell: (t) => (
                      <span className="font-bold text-slate-900">
                        {t.subject}
                      </span>
                    ),
                  },
                  {
                    key: "priority",
                    header: "Priority",
                    cell: (t) => (
                      <span className="text-xs font-semibold text-amber-700">
                        {t.priority}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (t) => (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        {t.status}
                      </Badge>
                    ),
                  },
                ]}
                data={mockTickets}
                searchable={false}
                defaultPageSize={10}
              />
            </Card>
          </TabsContent>

          {/* TAB 6: ACTIVITY LOG */}
          <TabsContent value="activity">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Merchant Account Activity Log
              </h3>
              <div className="space-y-3 font-semibold text-xs">
                {mockActivityLog.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {act.action}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {act.details}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CHANGE PLAN OVERRIDE MODAL */}
        <Dialog
          open={isChangePlanOpen}
          onOpenChange={() => !isChangingPlan && setIsChangePlanOpen(false)}
        >
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900">
                Manually Change Merchant Subscription Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Override subscription tier for {bName}.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2">
              <FormSelect
                name="targetPlan"
                label="Select Target Subscription Tier"
                options={PLAN_OVERRIDE_OPTIONS}
                value={targetPlan}
                onValueChange={setTargetPlan}
                triggerClassName="bg-white border-slate-200 text-xs h-10 rounded-xl font-bold"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                variant="outline"
                disabled={isChangingPlan}
                onClick={() => setIsChangePlanOpen(false)}
                className="text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={isChangingPlan}
                onClick={handleChangePlan}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                {isChangingPlan
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  : null}
                <span>Apply Override</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
