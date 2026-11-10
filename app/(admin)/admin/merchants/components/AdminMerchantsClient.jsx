"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "@/components/shared/data/DataTable";
import TableSearch from "@/components/shared/data/TableSearch";
import FormSelect from "@/components/shared/form/FormSelect";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
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
import {
  useAdminMerchants,
  useDeleteAdminMerchant,
  useReviewMerchant,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { exportToCsv } from "@/lib/exportCsv";
import { cn } from "@/lib/utils";
import MerchantKycDialog from "../../approvals/merchants/components/MerchantKycDialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending Approval" },
  { value: "form_accepted", label: "Form Accepted" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "starter", label: "Starter Free" },
  { value: "growth", label: "Growth Partner" },
  { value: "pro", label: "Pro Partner" },
  { value: "enterprise", label: "Enterprise" },
];

// 8 Distinct Colorful Row Palettes (Clearly visible without hover)
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

export default function AdminMerchantsClient({
  defaultTab = "all",
  title = "Merchants Management",
  description = "Overview of all merchant accounts, application approvals, subscription tiers, and activity logs.",
}) {
  const queryClient = useQueryClient();
  const { data: merchants = [], isLoading, refetch } = useAdminMerchants({ limit: 500 });
  const reviewMutation = useReviewMerchant();
  const deleteMerchantMutation = useDeleteAdminMerchant();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const stats = useMemo(() => {
    const total = merchants.length;
    const active = merchants.filter((m) => m.status === "active" || m.status === "approved").length;
    const pending = merchants.filter((m) => m.status === "pending" || m.status === "form_accepted" || m.status === "under_review").length;
    const suspended = merchants.filter((m) => m.status === "suspended" || m.status === "rejected").length;
    return { total, active, pending, suspended };
  }, [merchants]);

  const handleDeleteMerchant = () => {
    if (!deleteId) return;
    deleteMerchantMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        refetch();
      },
    });
  };

  const handleOpenKyc = (merchant) => {
    setSelectedMerchant(merchant);
    setKycDialogOpen(true);
  };

  const handleAction = (merchantId, status) => {
    reviewMutation.mutate(
      { merchantId, status },
      {
        onSuccess: () => setKycDialogOpen(false),
      },
    );
  };

  const getMerchantRowColor = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  const handleExportCsv = () => {
    if (!merchants.length) return toast.error("No merchant data to export.");
    const headers = [
      "Brand Name",
      "Category",
      "City",
      "Plan",
      "Status",
      "Contact Email",
      "Phone",
      "Revenue (INR)",
      "Registered On",
    ];
    const rows = merchants.map((m) => [
      m.businessName || "",
      m.category || "General",
      m.location?.city || m.city || "",
      (m.subscriptionTier || m.plan || "starter").toUpperCase(),
      m.status || "",
      m.userId?.email || m.contactEmail || "",
      (m.phone || m.contactPhone) ? ("=\"" + (m.phone || m.contactPhone) + "\"") : "",
      m.totalRevenue ?? 0,
      m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "",
    ]);
    exportToCsv(headers, rows, "vouchiqo_merchants");
    toast.success("Exported " + merchants.length + " merchants to CSV!");
  };

  // Socket listener for real-time applications and status updates
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.merchants() });
    refetch();
  });

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      // Tab filter
      if (activeTab === "pending" && m.status !== "pending" && m.status !== "form_accepted" && m.status !== "under_review") return false;
      if (
        activeTab === "approved" &&
        m.status !== "approved" &&
        m.status !== "active"
      )
        return false;
      if (activeTab === "suspended" && m.status !== "suspended" && m.status !== "rejected") return false;

      // Status dropdown filter
      if (statusFilter !== "all") {
        if (
          statusFilter === "active" &&
          m.status !== "approved" &&
          m.status !== "active"
        )
          return false;
        if (statusFilter !== "active" && m.status !== statusFilter)
          return false;
      }

      // Plan filter
      if (planFilter !== "all" && m.subscriptionTier !== planFilter && m.plan !== planFilter)
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const bName = (m.businessName || "").toLowerCase();
        const name = (m.name || m.userId?.name || "").toLowerCase();
        const email = (m.email || m.userId?.email || "").toLowerCase();
        const city = (m.city || "").toLowerCase();
        return (
          bName.includes(query) ||
          name.includes(query) ||
          email.includes(query) ||
          city.includes(query)
        );
      }

      return true;
    });
  }, [merchants, activeTab, statusFilter, planFilter, searchQuery]);

  const columns = [
    {
      header: "Business & Owner",
      accessorKey: "businessName",
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
        const emailStr = row.userId?.email || row.contactEmail || "No Email";

        const initials = (row.businessName || "MB")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
            <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs overflow-hidden">
              {row.logoUrl || row.logo ? (
                // biome-ignore lint/performance/noImgElement: dynamic user avatar
                <img
                  src={row.logoUrl || row.logo}
                  alt={row.businessName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/merchants/${row._id}`}
                className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-[11.5px] leading-tight block truncate"
              >
                {row.businessName || "Merchant Partner"}
              </Link>
              <p className="text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                {ownerName} • {emailStr}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category / City",
      accessorKey: "category",
      cell: (row) => {
        const cityStr = row.location?.city || row.city || "Ranchi";
        return (
          <div className="space-y-0.5 py-0.5">
            <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-300/90 inline-block shadow-2xs">
              {row.category || "General"}
            </span>
            <p className="text-[9.5px] text-slate-600 font-normal leading-none">{cityStr}</p>
          </div>
        );
      },
    },
    {
      header: "Subscription Plan",
      accessorKey: "subscriptionTier",
      cell: (row) => {
        const tier = (row.subscriptionTier || row.plan || "starter").toLowerCase();
        let tierBg = "bg-white/95 text-slate-800 border-slate-300/90";
        let tierLabel = "STARTER";

        if (tier.includes("growth")) {
          tierBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
          tierLabel = "GROWTH";
        } else if (tier.includes("pro")) {
          tierBg = "bg-blue-100 text-blue-800 border-blue-300";
          tierLabel = "PRO";
        } else if (tier.includes("enterprise")) {
          tierBg = "bg-amber-100 text-amber-800 border-amber-300";
          tierLabel = "ENTERPRISE";
        }

        return (
          <span className={cn("px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap", tierBg)}>
            {tierLabel}
          </span>
        );
      },
    },
    {
      header: "Payment & Expiry",
      accessorKey: "paymentStatus",
      cell: (row) => {
        const isStarter =
          (row.plan || "starter").toLowerCase().includes("starter") ||
          (row.plan || "").toLowerCase().includes("free");
        const isPaid =
          isStarter ||
          row.paymentStatus === "completed" ||
          row.subscriptionStatus === "active" ||
          (row.planExpiry && new Date(row.planExpiry).getTime() > Date.now());
        const expiry = row.planExpiry ? new Date(row.planExpiry) : null;
        let diffStr = "";
        if (expiry && !isStarter) {
          const diff = expiry.getTime() - Date.now();
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diffStr = `${days}d left`;
          } else {
            diffStr = "Expired";
          }
        }

        return (
          <div className="space-y-0.5 py-0.5">
            <span
              className={cn(
                "px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap",
                isPaid
                  ? "bg-white/95 text-emerald-700 border-emerald-300"
                  : "bg-white/95 text-amber-700 border-amber-300",
              )}
            >
              {isStarter ? "FREE PLAN" : isPaid ? "PAYMENT DONE" : "PENDING"}
            </span>
            {diffStr && (
              <p className="text-[9.5px] font-mono text-slate-600 font-normal leading-none">
                {diffStr}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const st = row.status || "pending";
        let stBg = "bg-white/95 text-amber-700 border-amber-300";
        let stLabel = st;
        if (st === "approved" || st === "active") {
          stBg = "bg-white/95 text-emerald-700 border-emerald-300";
          stLabel = "Active";
        } else if (st === "form_accepted" || st === "under_review") {
          stBg = "bg-white/95 text-blue-700 border-blue-300";
          stLabel = "Form Accepted";
        } else if (st === "suspended" || st === "rejected") {
          stBg = "bg-white/95 text-rose-700 border-rose-300";
          stLabel = "Suspended";
        }

        return (
          <span className={cn("px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap", stBg)}>
            {stLabel}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "_id",
      align: "right",
      cell: (row) => {
        const isPending =
          reviewMutation.isPending &&
          reviewMutation.variables?.merchantId === row._id;

        return (
          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
            {/* Audit KYC Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenKyc(row)}
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                >
                  <Eye className="h-3 w-3" />
                  <span className="sr-only">Audit KYC</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                Audit KYC &amp; Verification
              </TooltipContent>
            </Tooltip>

            {/* View Details Profile Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                >
                  <Link href={`/admin/merchants/${row._id}`}>
                    <FileText className="h-3 w-3" />
                    <span className="sr-only">Partner Details</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                View Complete Merchant Profile
              </TooltipContent>
            </Tooltip>

            {/* Contextual Status Action Button */}
            {(row.status === "pending" || !row.status) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => handleAction(row._id, "form_accepted")}
                    disabled={isPending}
                  >
                    <Check className="h-3 w-3" />
                    <span className="sr-only">Accept Form</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Accept Partner Application
                </TooltipContent>
              </Tooltip>
            )}

            {(row.status === "form_accepted" || row.status === "under_review") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => handleAction(row._id, "approved")}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="sr-only">Approve Partner</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Approve &amp; Activate Partner Access
                </TooltipContent>
              </Tooltip>
            )}

            {(row.status === "approved" || row.status === "active") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center text-amber-700 hover:bg-amber-50 border-amber-200 bg-white rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => handleAction(row._id, "suspended")}
                    disabled={isPending}
                  >
                    <Ban className="h-3 w-3" />
                    <span className="sr-only">Suspend Partner</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Suspend Partner Account
                </TooltipContent>
              </Tooltip>
            )}

            {row.status === "suspended" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 border-emerald-200 bg-white rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => handleAction(row._id, "approved")}
                    disabled={isPending}
                  >
                    <UserCheck className="h-3 w-3" />
                    <span className="sr-only">Reactivate Partner</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Reactivate Partner Account
                </TooltipContent>
              </Tooltip>
            )}

            {/* Delete Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => setDeleteId(row._id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete Partner</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                Delete Merchant Account Permanently
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full space-y-3 pb-12 font-sans text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div>
            <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isLoading || !merchants.length}
              className="gap-1.5 h-7.5 px-3 text-xs font-medium border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="h-3 w-3" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
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
                  Total Partners
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
                  Active Partners
                </span>
                <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-10 rounded mt-0.5 bg-emerald-200/60" /> : stats.active}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
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
            onClick={() => setActiveTab("suspended")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              activeTab === "suspended"
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Suspended
                </span>
                <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-8 rounded mt-0.5 bg-rose-200/60" /> : stats.suspended}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Ban className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden">
          {/* ── Unified Toolbar: Search + Plan Filter + Status Tabs ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-1 border-b border-slate-100">
            {/* Left: Search */}
            <TableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, plan, status, email..."
              resultCount={!isLoading ? filteredMerchants.length : null}
              className="flex-1 max-w-xs min-w-[200px]"
            />

            {/* Right: Plan filter + Status tabs */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <FormSelect
                value={planFilter}
                onValueChange={setPlanFilter}
                options={PLAN_OPTIONS}
                triggerClassName="w-[110px] h-7.5 text-[11px] border-slate-200 bg-white font-medium"
              />

              <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                {[
                  { id: "all",       label: "All",       count: stats.total,     desc: "View all onboarded merchant accounts" },
                  { id: "pending",   label: "Pending",   count: stats.pending,   desc: "Awaiting verification" },
                  { id: "approved",  label: "Active",    count: stats.active,    desc: "Approved active partners" },
                  { id: "suspended", label: "Suspended", count: stats.suspended, desc: "Suspended or restricted partners" },
                ].map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "text-[10.5px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 bg-transparent",
                        )}
                      >
                        <span>{tab.label}</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-px rounded-full font-medium",
                          activeTab === tab.id
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200/80 text-slate-600",
                        )}>
                          {tab.count}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                      {tab.desc}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredMerchants}
            loading={isLoading}
            searchable={false}
            externalSearch={true}
            getRowClassName={getMerchantRowColor}
          />
        </Card>

        {/* Merchant KYC Audit Dialog */}
        <MerchantKycDialog
          open={kycDialogOpen}
          onOpenChange={setKycDialogOpen}
          merchant={selectedMerchant}
          onAction={handleAction}
        />

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Merchant Account & All Associated Data"
          description="This action cannot be undone. This will permanently delete the merchant partner account, all their posted offer listings, active customer claims, redemptions, campaigns, and user profile data from the database."
          onConfirm={handleDeleteMerchant}
          isPending={deleteMerchantMutation.isPending}
        />
      </div>
    </TooltipProvider>
  );
}
