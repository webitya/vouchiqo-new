"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import TableSearch from "@/components/shared/data/TableSearch";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminMerchants, useReviewMerchant } from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";
import MerchantKycDialog from "./MerchantKycDialog";

// 8 Distinct Colorful Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  {
    row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900",
    avatar: "bg-white text-blue-700 border-blue-300 shadow-2xs",
    category: "bg-white/95 text-blue-900 border-blue-300",
  },
  {
    row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900",
    avatar: "bg-white text-emerald-700 border-emerald-300 shadow-2xs",
    category: "bg-white/95 text-emerald-900 border-emerald-300",
  },
  {
    row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900",
    avatar: "bg-white text-amber-700 border-amber-300 shadow-2xs",
    category: "bg-white/95 text-amber-900 border-amber-300",
  },
  {
    row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900",
    avatar: "bg-white text-purple-700 border-purple-300 shadow-2xs",
    category: "bg-white/95 text-purple-900 border-purple-300",
  },
  {
    row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900",
    avatar: "bg-white text-indigo-700 border-indigo-300 shadow-2xs",
    category: "bg-white/95 text-indigo-900 border-indigo-300",
  },
  {
    row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900",
    avatar: "bg-white text-rose-700 border-rose-300 shadow-2xs",
    category: "bg-white/95 text-rose-900 border-rose-300",
  },
  {
    row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900",
    avatar: "bg-white text-teal-700 border-teal-300 shadow-2xs",
    category: "bg-white/95 text-teal-900 border-teal-300",
  },
  {
    row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900",
    avatar: "bg-white text-orange-700 border-orange-300 shadow-2xs",
    category: "bg-white/95 text-orange-900 border-orange-300",
  },
];

export default function MerchantApprovalsClient() {
  const queryClient = useQueryClient();
  const {
    data: allMerchants = [],
    isLoading,
    refetch,
  } = useAdminMerchants({ limit: 500 });
  const reviewMutation = useReviewMerchant();

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tab filtered merchants
  const filteredMerchants = useMemo(() => {
    if (activeTab === "pending") {
      return allMerchants.filter((m) => m.status === "pending" || !m.status);
    }
    if (activeTab === "approved") {
      return allMerchants.filter(
        (m) => m.status === "approved" || m.status === "active",
      );
    }
    if (activeTab === "rejected") {
      return allMerchants.filter((m) => m.status === "rejected");
    }
    return allMerchants;
  }, [allMerchants, activeTab]);

  const displayMerchants = useMemo(() => {
    if (!searchQuery.trim()) return filteredMerchants;
    const q = searchQuery.toLowerCase();
    return filteredMerchants.filter((m) =>
      [m.businessName, m.contactEmail, m.category, m.plan, m.location?.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [filteredMerchants, searchQuery]);

  const stats = useMemo(() => {
    const total = allMerchants.length;
    const pending = allMerchants.filter(
      (m) => m.status === "pending" || !m.status,
    ).length;
    const approved = allMerchants.filter(
      (m) => m.status === "approved" || m.status === "active",
    ).length;
    const rejected = allMerchants.filter((m) => m.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [allMerchants]);

  // Real-time listener for new merchant applications and status updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  const handleAction = (merchantId, status) => {
    reviewMutation.mutate(
      { merchantId, status },
      {
        onSuccess: () => setKycDialogOpen(false),
      },
    );
  };

  const handleOpenKyc = (merchant) => {
    setSelectedMerchant(merchant);
    setKycDialogOpen(true);
  };

  const getRowClassName = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  const columns = [
    {
      header: "Business Name",
      accessorKey: "businessName",
      cell: (row) => {
        const locationStr =
          row.location?.city && row.location?.state
            ? `${row.location.city}, ${row.location.state}`
            : row.location?.city ||
              row.location?.address ||
              row.city ||
              row.slug ||
              "Main Outlet";

        const initials = (row.businessName || "MB")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-2 py-0.5 min-w-[180px]">
            <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                {row.businessName || "Merchant Business"}
              </p>
              <p className="text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                {locationStr}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-300/90 inline-block shadow-2xs">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Chosen Plan",
      accessorKey: "plan",
      cell: (row) => {
        const rawPlan = (row.plan || "starter").toLowerCase();
        const planMap = {
          starter: {
            label: "STARTER",
            bg: "bg-white/90 text-slate-700 border-slate-200",
          },
          growth: {
            label: "GROWTH",
            bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          },
          pro: {
            label: "PRO",
            bg: "bg-blue-100 text-blue-800 border-blue-200",
          },
          enterprise: {
            label: "ENTERPRISE",
            bg: "bg-purple-100 text-purple-800 border-purple-200",
          },
        };
        const pInfo = planMap[rawPlan] || planMap.starter;
        return (
          <span
            className={cn(
              "px-1.5 py-0.5 text-[9px] font-medium tracking-wide rounded border inline-block whitespace-nowrap shadow-2xs",
              pInfo.bg,
            )}
          >
            {pInfo.label}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status || "pending"} size="sm" />,
    },
    {
      header: "Owner / Email",
      accessorKey: "userId",
      cell: (row) => {
        const ownerName =
          row.liaisonName ||
          row.ownerName ||
          row.contactPerson ||
          (row.userId?.name && !row.userId.name.includes("@")
            ? row.userId.name
            : null) ||
          row.businessName ||
          "Merchant Owner";
        return (
          <div className="py-0.5 min-w-[140px]">
            <p className="text-[11px] font-medium text-slate-800 capitalize leading-tight truncate">
              {ownerName}
            </p>
            <p className="text-[9.5px] text-slate-500 font-normal truncate mt-0.5 leading-none">
              {row.userId?.email || row.contactEmail || "No Email"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row) => (
        <span className="text-[10.5px] text-slate-700 font-normal whitespace-nowrap">
          {row.phone || row.contactPhone || row.location?.phone || "—"}
        </span>
      ),
    },
    {
      header: "Applied On",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-[10.5px] text-slate-500 font-normal whitespace-nowrap">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          {/* Review KYC Documents */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenKyc(row)}
                className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
              >
                <Eye className="h-3 w-3" />
                <span className="sr-only">Review KYC</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
            >
              Review KYC &amp; Verification Details
            </TooltipContent>
          </Tooltip>

          {/* Step 1: If pending, show Accept Form button */}
          {(row.status === "pending" || !row.status) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => handleAction(row._id, "form_accepted")}
                  disabled={reviewMutation.isPending}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Accept Form</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
              >
                Accept Application Form
              </TooltipContent>
            </Tooltip>
          )}

          {/* Step 2: If form_accepted or under_review, show Approve button */}
          {(row.status === "form_accepted" ||
            row.status === "under_review") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => handleAction(row._id, "approved")}
                  disabled={reviewMutation.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="sr-only">Approve Partner</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
              >
                Approve Partner Account
              </TooltipContent>
            </Tooltip>
          )}

          {row.status !== "approved" && row.status !== "rejected" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => handleAction(row._id, "rejected")}
                  disabled={reviewMutation.isPending}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Reject Application</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
              >
                Reject Application
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full space-y-3 pb-12 font-sans text-left">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div>
            <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
              Merchant Applications Queue
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              Review submitted merchant account applications, verify business
              credentials, and approve or decline partner access.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start sm:self-auto gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
          >
            <RefreshCw
              className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh Queue</span>
          </Button>
        </div>

        {/* 4 Mini KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Card
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              activeTab === "all"
                ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Total Submissions
                </span>
                <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-10 rounded mt-0.5" /> : stats.total}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab("pending")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              activeTab === "pending"
                ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Pending Review
                </span>
                <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-8 rounded mt-0.5 bg-amber-200/60" /> : stats.pending}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab("approved")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              activeTab === "approved"
                ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Approved Partners
                </span>
                <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-10 rounded mt-0.5 bg-emerald-200/60" /> : stats.approved}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab("rejected")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              activeTab === "rejected"
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Rejected / Needs Fix
                </span>
                <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-8 rounded mt-0.5 bg-rose-200/60" /> : stats.rejected}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Ban className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden">
          <div className="mb-3">
            <TableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, category, city..."
              resultCount={!isLoading ? displayMerchants.length : null}
            />
          </div>
          <DataTable
            columns={columns}
            data={displayMerchants}
            loading={isLoading}
            searchable={false}
            externalSearch={true}
            getRowClassName={getRowClassName}
            renderMobileCard={(row) => {
              const imageSrc =
                row.logo ||
                row.logoUrl ||
                row.shopLogo ||
                row.shopPhotoUrl ||
                row.shopFrontUrl ||
                row.docImage;

              const initials = (row.businessName || "ST")
                .trim()
                .split(/\s+/)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const rawPlan = (row.plan || "starter").toLowerCase();
              const planMap = {
                starter: {
                  label: "STARTER",
                  bg: "bg-slate-100 text-slate-700 border-slate-200",
                },
                growth: {
                  label: "GROWTH",
                  bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                },
                pro: {
                  label: "PRO",
                  bg: "bg-blue-50 text-blue-700 border-blue-200",
                },
                enterprise: {
                  label: "ENTERPRISE",
                  bg: "bg-purple-50 text-purple-700 border-purple-200",
                },
              };
              const pInfo = planMap[rawPlan] || planMap.starter;

              const ownerName =
                row.liaisonName ||
                row.ownerName ||
                row.contactPerson ||
                (row.userId?.name && !row.userId.name.includes("@")
                  ? row.userId.name
                  : null) ||
                row.businessName ||
                "Merchant Owner";

              const ownerEmail = row.userId?.email || row.contactEmail;
              const phone =
                row.phone || row.contactPhone || row.location?.phone || "—";
              const appliedDate = row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently";

              const locationStr = [
                row.location?.city || row.city,
                row.location?.state || row.state,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2 text-left font-sans">
                  {/* Compact Header: Logo/Avatar + Business Name & Email/Location below + Top-Right Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={row.businessName}
                          className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-slate-200/80 shadow-2xs"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "w-8.5 h-8.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs",
                          imageSrc &&
                            "hidden [img:not([style*='display: none']) ~ &]:hidden",
                        )}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                          {row.businessName}
                        </h4>
                        {ownerEmail && (
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5 leading-none">
                            {ownerEmail}
                          </p>
                        )}
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal leading-none">
                          {row.category
                            ? `${row.category.charAt(0).toUpperCase() + row.category.slice(1)} • `
                            : ""}
                          {locationStr || "Verified"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={row.status || "pending"} size="sm" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 dark:border-slate-800/60" />

                  {/* Dense 2x2 Key-Value Grid (Clean, Balanced & No Redundancy) */}
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-left">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 leading-none">
                        CHOSEN PLAN
                      </div>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[9px] font-bold tracking-wide rounded border inline-block",
                          pInfo.bg,
                        )}
                      >
                        {pInfo.label}
                      </span>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 leading-none">
                        APPLIED ON
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {appliedDate}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 leading-none">
                        CONTACT PERSON
                      </div>
                      <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {ownerName}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 leading-none">
                        PHONE
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {phone}
                      </div>
                    </div>
                  </div>

                  {/* Compact Full-Width Action Strip */}
                  <div className="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenKyc(row)}
                      className="flex-1 h-7.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review KYC & Details</span>
                    </Button>

                    {row.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(row._id, "form_accepted")}
                        className="h-7.5 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </Card>

        {/* Merchant KYC Review Dialog */}
        <MerchantKycDialog
          open={kycDialogOpen}
          onOpenChange={setKycDialogOpen}
          merchant={selectedMerchant}
          onAction={handleAction}
        />
      </div>
    </TooltipProvider>
  );
}
