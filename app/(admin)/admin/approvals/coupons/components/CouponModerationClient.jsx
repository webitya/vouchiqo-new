"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Info,
  Layers,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Store,
  Tag,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAdminCoupons,
  useApproveAdminCoupon,
  useRejectAdminCoupon,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";
import TableSearch from "@/components/shared/data/TableSearch";
import FormSelect from "@/components/shared/form/FormSelect";

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

function formatDiscountBadge(coupon) {
  if (!coupon) return "SPECIAL OFFER";
  const val = coupon.rawDiscountValue || coupon.discountValue;
  const isNum =
    val !== null && val !== undefined && val !== "" && !isNaN(Number(val));

  if (coupon.offerType === "deal" && coupon.salePrice) {
    if (coupon.originalPrice && coupon.originalPrice > coupon.salePrice) {
      const pct = Math.round(
        ((coupon.originalPrice - coupon.salePrice) / coupon.originalPrice) *
          100,
      );
      return `${pct}% OFF (Deal)`;
    }
    return `₹${coupon.salePrice} Deal`;
  }
  if (coupon.discountType === "percentage" && isNum) return `${val}% OFF`;
  if (coupon.discountType === "fixed" && isNum) return `₹${val} OFF`;
  if (coupon.discountType === "freebie" || coupon.offerType === "special") {
    if (coupon.specialOfferType) return coupon.specialOfferType;
    if (typeof val === "string" && val.trim() && !isNum) return val;
    return "FREE GIFT";
  }
  if (val) return isNum ? `${val}% OFF` : String(val);
  return "SPECIAL OFFER";
}

export default function CouponModerationClient() {
  const queryClient = useQueryClient();
  const {
    data: allCoupons = [],
    isLoading,
    refetch,
  } = useAdminCoupons({ limit: 100 });
  const approveMutation = useApproveAdminCoupon();
  const rejectMutation = useRejectAdminCoupon();

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically extract unique categories from actual coupon data
  const categoryOptions = useMemo(() => {
    const set = new Set();
    allCoupons.forEach((c) => {
      if (c.category) set.add(c.category.trim());
    });
    const sorted = Array.from(set).sort();
    return [
      { value: "all", label: "All Categories" },
      ...sorted.map((cat) => ({
        value: cat.toLowerCase(),
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
    ];
  }, [allCoupons]);

  // Audit details modal state
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [auditTab, setAuditTab] = useState("mechanics"); // mechanics, merchant, validity, compliance
  const [copiedCode, setCopiedCode] = useState(false);

  // Rejection modal state
  const [rejectCouponId, setRejectCouponId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Filtered coupons: combines activeTab, statusFilter, categoryFilter, and typeFilter
  const filteredCoupons = useMemo(() => {
    return allCoupons.filter((c) => {
      // 1. Status Filter
      const effectiveStatus = statusFilter !== "all" ? statusFilter : activeTab;
      if (effectiveStatus === "pending") {
        const isPending =
          c.status === "pending" || (!c.isVerified && c.status !== "rejected");
        if (!isPending) return false;
      } else if (effectiveStatus === "approved" || effectiveStatus === "active") {
        const isApproved =
          c.status === "active" || c.status === "approved" || c.isVerified;
        if (!isApproved) return false;
      } else if (effectiveStatus === "rejected") {
        if (c.status !== "rejected") return false;
      } else if (effectiveStatus === "expired") {
        const isExpired =
          c.status === "expired" || c.status === "inactive";
        if (!isExpired) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== "all") {
        const cat = (c.category || "").toLowerCase();
        if (cat !== categoryFilter.toLowerCase()) return false;
      }

      // 3. Offer / Discount Type Filter
      if (typeFilter !== "all") {
        const dType = (c.discountType || "").toLowerCase();
        const dVal = String(c.discount || "").toLowerCase();
        if (typeFilter === "percent") {
          if (dType !== "percentage" && dType !== "percent" && !dVal.includes("%")) return false;
        } else if (typeFilter === "flat") {
          if (dType !== "flat" && dType !== "fixed" && !dVal.includes("₹") && !dVal.includes("rs")) return false;
        } else if (typeFilter === "bogo") {
          if (dType !== "bogo" && dType !== "free" && !dVal.includes("free") && !dVal.includes("bogo")) return false;
        }
      }

      return true;
    });
  }, [allCoupons, activeTab, statusFilter, categoryFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = allCoupons.length;
    const pending = allCoupons.filter(
      (c) =>
        c.status === "pending" || (!c.isVerified && c.status !== "rejected"),
    ).length;
    const approved = allCoupons.filter(
      (c) => c.status === "active" || c.status === "approved" || c.isVerified,
    ).length;
    const rejected = allCoupons.filter(
      (c) =>
        c.status === "rejected" ||
        c.status === "inactive" ||
        c.status === "expired",
    ).length;
    return { total, pending, approved, rejected };
  }, [allCoupons]);

  const displayCoupons = useMemo(() => {
    if (!searchQuery.trim()) return filteredCoupons;
    const q = searchQuery.toLowerCase().trim();
    return filteredCoupons.filter((m) => {
      const merchantObj = m.merchantId || {};
      const merchantName = m.merchantName || merchantObj.businessName || "";
      const merchantEmail = merchantObj.email || "";
      const title = m.title || "";
      const code = m.code || m.couponCode || "";
      const category = m.category || "";
      const discount = String(m.discount || "");

      return [title, code, merchantName, merchantEmail, category, discount].some(
        (v) => String(v).toLowerCase().includes(q)
      );
    });
  }, [filteredCoupons, searchQuery]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    activeTab !== "all" ||
    Boolean(searchQuery.trim());

  const handleResetFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
    setActiveTab("all");
    setSearchQuery("");
  };

  // Real-time listener: invalidates TanStack Query cache instantly on submission & status updates
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    refetch();
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    refetch();
  });

  const handleApprove = (couponId) => {
    approveMutation.mutate(couponId, {
      onSuccess: () => {
        setIsDetailsOpen(false);
        setSelectedCoupon(null);
      },
    });
  };

  const handleOpenDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setAuditTab("mechanics");
    setIsDetailsOpen(true);
  };

  const openRejectModal = (couponId) => {
    setRejectCouponId(couponId);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectCouponId || !rejectionReason.trim()) return;

    rejectMutation.mutate(
      { couponId: rejectCouponId, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setIsRejectOpen(false);
          setIsDetailsOpen(false);
          setSelectedCoupon(null);
          setRejectCouponId(null);
          setRejectionReason("");
        },
      },
    );
  };

  const copyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRowClassName = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  const columns = [
    {
      header: "Offer & Merchant",
      accessorKey: "headline",
      cell: (row) => {
        const merchantObj = row.merchantId || {};
        const merchantName =
          row.merchantName || merchantObj.businessName || "Merchant Partner";
        const merchantEmail =
          row.contactEmail ||
          merchantObj.contactEmail ||
          merchantObj.email ||
          "No Email";

        const initials = (row.headline || row.title || "OF")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
            <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                {row.headline || row.title || "Special Offer"}
              </p>
              <div className="flex items-center gap-1.5 text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                <Store className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                <span className="truncate">{merchantName}</span>
                <span>•</span>
                <span className="truncate max-w-[110px] text-slate-500">
                  {merchantEmail}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => {
        const merchantObj = row.merchantId || {};
        return (
          <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-300/90 inline-block shadow-2xs">
            {row.category || merchantObj.category || "General"}
          </span>
        );
      },
    },
    {
      header: "Discount",
      accessorKey: "discountValue",
      cell: (row) => (
        <span className="font-medium text-emerald-800 text-[10.5px] bg-white/95 px-2 py-0.5 rounded-md border border-emerald-300/90 inline-block shadow-2xs">
          {formatDiscountBadge(row)}
        </span>
      ),
    },
    {
      header: "Coupon Code",
      accessorKey: "code",
      cell: (row) => (
        <button
          type="button"
          onClick={() => copyCode(row.code || "AUTO-APPLY")}
          title="Click to copy code"
          className="px-2 py-0.5 text-[10px] rounded-md bg-white/95 font-mono font-medium border border-slate-300/90 text-slate-800 shadow-2xs hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1"
        >
          <span>{row.code || "AUTO-APPLY"}</span>
          <Copy className="w-2.5 h-2.5 text-slate-400" />
        </button>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status || "pending"} size="sm" />,
    },
    {
      header: "Submitted",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-[10.5px] text-slate-600 font-normal whitespace-nowrap">
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
          {/* Audit Details Modal */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDetails(row)}
                className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
              >
                <Eye className="h-3 w-3" />
                <span className="sr-only">Audit Details</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
            >
              Audit Offer Mechanics &amp; Details
            </TooltipContent>
          </Tooltip>

          {/* Approve Button */}
          {row.status !== "active" && row.status !== "approved" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => handleApprove(row._id)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="sr-only">Approve Offer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
              >
                Approve &amp; Publish Offer
              </TooltipContent>
            </Tooltip>
          )}

          {/* Reject Button */}
          {row.status !== "rejected" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => openRejectModal(row._id)}
                  disabled={rejectMutation.isPending}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Reject Offer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
              >
                Reject Offer
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
              Offer Listing Moderation
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              Review, verify, and approve newly submitted in-store discount
              offers from merchant partners.
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
            onClick={() => { setActiveTab("all"); setStatusFilter("all"); }}
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
                  Total Offers
                </span>
                <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-10 rounded mt-0.5" /> : stats.total}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => { setActiveTab("pending"); setStatusFilter("pending"); }}
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
            onClick={() => { setActiveTab("approved"); setStatusFilter("active"); }}
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
                  Approved Live Offers
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
            onClick={() => { setActiveTab("rejected"); setStatusFilter("rejected"); }}
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
                  Rejected / Inactive
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
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-2xs font-sans overflow-hidden">
          {/* Controls Bar: Search on left/top + Dropdown Filters on right */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-100">
            <div className="flex-1 min-w-0">
              <TableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search coupons by title, code, or merchant..."
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <FormSelect
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    if (val === "pending") setActiveTab("pending");
                    else if (val === "active") setActiveTab("approved");
                    else if (val === "rejected") setActiveTab("rejected");
                    else if (val === "all") setActiveTab("all");
                    else setActiveTab("none");
                  }}
                  placeholder="All Statuses"
                  options={[
                    { value: "all", label: `All Statuses (${stats.total})` },
                    { value: "pending", label: `Pending (${stats.pending})` },
                    { value: "active", label: `Approved / Live (${stats.approved})` },
                    { value: "rejected", label: `Rejected (${stats.rejected})` },
                    { value: "expired", label: "Expired / Inactive" },
                  ]}
                  triggerClassName="w-full sm:w-[145px] h-8 text-[11.5px] bg-slate-50 hover:bg-slate-100 border-slate-200/90 rounded-lg font-medium cursor-pointer shadow-2xs"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-auto">
                <FormSelect
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  placeholder="All Categories"
                  options={categoryOptions}
                  triggerClassName="w-full sm:w-[140px] h-8 text-[11.5px] bg-slate-50 hover:bg-slate-100 border-slate-200/90 rounded-lg font-medium cursor-pointer shadow-2xs"
                />
              </div>

              {/* Discount Type Filter */}
              <div className="w-full sm:w-auto">
                <FormSelect
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  placeholder="All Offer Types"
                  options={[
                    { value: "all", label: "All Offer Types" },
                    { value: "percent", label: "Percentage (%)" },
                    { value: "flat", label: "Flat (₹) Off" },
                    { value: "bogo", label: "BOGO / Free" },
                  ]}
                  triggerClassName="w-full sm:w-[135px] h-8 text-[11.5px] bg-slate-50 hover:bg-slate-100 border-slate-200/90 rounded-lg font-medium cursor-pointer shadow-2xs"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={displayCoupons}
            loading={isLoading}
            searchable={false}
            externalSearch={true}
            getRowClassName={getRowClassName}
          />
        </Card>

        {/* Offer Full Details Audit Dialog Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[640px] max-h-[88vh] overflow-y-auto font-sans text-left p-0 border-slate-200 rounded-2xl shadow-xl">
            {selectedCoupon &&
              (() => {
                const m = selectedCoupon.merchantId || {};
                const merchantName =
                  selectedCoupon.merchantName ||
                  m.businessName ||
                  "Merchant Partner";
                const merchantEmail =
                  selectedCoupon.contactEmail ||
                  m.contactEmail ||
                  m.email ||
                  "admin@vouchiqo.com";
                const merchantPhone =
                  selectedCoupon.contactPhone ||
                  m.contactPhone ||
                  m.whatsappNumber ||
                  m.liaisonPhone ||
                  "Not provided";
                const merchantCity =
                  m.location?.city || selectedCoupon.location?.city || "Ranchi";
                const merchantState =
                  m.location?.state ||
                  selectedCoupon.location?.state ||
                  "Jharkhand";
                const merchantAddress =
                  m.location?.address || m.address || "Main Storefront Address";

                return (
                  <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden text-left font-sans">
                    {/* Header */}
                    <div className="p-4 bg-slate-900 text-white border-b border-slate-800 relative">
                      <div className="flex items-start justify-between gap-3 pr-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] font-bold px-2 py-0.5">
                              Audit Mode
                            </Badge>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ID: {selectedCoupon._id?.slice(-8)}
                            </span>
                          </div>
                          <h2 className="text-base font-extrabold text-white mt-1 leading-snug">
                            {selectedCoupon.headline || selectedCoupon.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300 font-medium">
                            <span className="flex items-center gap-1 font-bold text-emerald-400">
                              <Store className="w-3.5 h-3.5" /> {merchantName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Mail className="w-3 h-3 text-blue-400" />{" "}
                              {merchantEmail}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab Navigation Pill Bar */}
                    <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setAuditTab("mechanics")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0",
                          auditTab === "mechanics"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-transparent text-slate-600 hover:bg-slate-200/80",
                        )}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Offer Mechanics</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuditTab("merchant")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0",
                          auditTab === "merchant"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-transparent text-slate-600 hover:bg-slate-200/80",
                        )}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Merchant &amp; Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuditTab("validity")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0",
                          auditTab === "validity"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-transparent text-slate-600 hover:bg-slate-200/80",
                        )}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Validity &amp; Limits</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuditTab("compliance")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0",
                          auditTab === "compliance"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-transparent text-slate-600 hover:bg-slate-200/80",
                        )}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Terms &amp; Declarations</span>
                      </button>
                    </div>

                    {/* Tab Content Box */}
                    <div className="p-4 space-y-4 text-xs font-sans">
                      {/* TAB 1: OFFER MECHANICS */}
                      {auditTab === "mechanics" && (
                        <div className="space-y-4">
                          {/* Banner Image Preview (2:1 Ratio) */}
                          {selectedCoupon.image ||
                          selectedCoupon.imageUrl ||
                          selectedCoupon.bannerUrl ? (
                            <div className="relative aspect-[2/1] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                              <img
                                src={
                                  selectedCoupon.image ||
                                  selectedCoupon.imageUrl ||
                                  selectedCoupon.bannerUrl
                                }
                                alt={selectedCoupon.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                                2:1 Aspect Ratio Banner
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2 text-xs font-medium">
                              <Info className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                No custom 2:1 banner image uploaded; standard
                                category graphic will render.
                              </span>
                            </div>
                          )}

                          {/* Offer Badge Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Formatted Discount
                              </span>
                              <span className="font-extrabold text-emerald-700 text-sm">
                                {formatDiscountBadge(selectedCoupon)}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Offer Type
                              </span>
                              <span className="font-bold text-slate-800 uppercase">
                                {selectedCoupon.offerType ||
                                  (selectedCoupon.code
                                    ? "Code Offer"
                                    : "In-Store Deal")}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Promo / Smart Code
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <code className="font-mono text-xs font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                  {selectedCoupon.code || "DEALOFFER"}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => copyCode(selectedCoupon.code)}
                                  className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer border-0 bg-transparent"
                                  title="Copy Code"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Min Purchase Value
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.minOrderValue
                                  ? `₹${selectedCoupon.minOrderValue}`
                                  : "No Minimum"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Max Discount Cap
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.maxCap
                                  ? `₹${selectedCoupon.maxCap}`
                                  : "No Cap"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                Category &amp; Industry
                              </span>
                              <span className="font-bold text-slate-800 capitalize">
                                {selectedCoupon.category ||
                                  m.category ||
                                  "General"}
                              </span>
                            </div>
                          </div>

                          {/* Descriptions */}
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                                Short Listing Headline &amp; Teaser
                              </h4>
                              <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium leading-relaxed">
                                {selectedCoupon.shortDescription ||
                                  selectedCoupon.headline ||
                                  selectedCoupon.title}
                              </p>
                            </div>

                            {selectedCoupon.description &&
                              selectedCoupon.description !==
                                selectedCoupon.shortDescription && (
                                <div>
                                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                                    Full Offer Details
                                  </h4>
                                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-normal leading-relaxed">
                                    {selectedCoupon.description}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* TAB 2: MERCHANT & EMAIL CONTACT */}
                      {auditTab === "merchant" && (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Store className="w-4 h-4 text-blue-600" />{" "}
                                Merchant Identity &amp; Status
                              </span>
                              <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                                {m.plan
                                  ? m.plan.toUpperCase()
                                  : "STARTER PARTNER"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  Business Name
                                </span>
                                <span className="font-extrabold text-slate-900">
                                  {merchantName}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  Registered Category
                                </span>
                                <span className="font-bold text-slate-800 capitalize">
                                  {m.category ||
                                    selectedCoupon.category ||
                                    "General"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact & Liaison Info */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                            <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-blue-600" />{" "}
                              Direct Contact &amp; Liaison Info
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  Merchant Contact Email
                                </span>
                                <a
                                  href={`mailto:${merchantEmail}`}
                                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3 shrink-0" />{" "}
                                  {merchantEmail}
                                </a>
                              </div>

                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  Phone / WhatsApp
                                </span>
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />{" "}
                                  {merchantPhone}
                                </span>
                              </div>

                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  Authorized Contact Person
                                </span>
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <User className="w-3 h-3 text-purple-600 shrink-0" />
                                  {m.liaisonName
                                    ? `${m.liaisonName} (${m.liaisonDesignation || "Manager"})`
                                    : "Owner / Manager"}
                                </span>
                              </div>

                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                  Channel / Operating Type
                                </span>
                                <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                                  {m.businessType || "In-Store & Online"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Storefront Address & GSTIN */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                            <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-600" />{" "}
                              Physical Storefront &amp; Statutory GSTIN
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  Store City &amp; Hub
                                </span>
                                <span className="font-bold text-slate-800">
                                  {merchantCity}, {merchantState}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  GSTIN Registration
                                </span>
                                <span className="font-mono font-bold text-slate-800">
                                  {m.gstin || "GST Exempt / Unregistered"}
                                </span>
                              </div>
                            </div>
                            <div className="pt-1 text-[11px] text-slate-600 font-medium">
                              <strong>Full Store Address:</strong>{" "}
                              {merchantAddress}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: VALIDITY & LIMITS */}
                      {auditTab === "validity" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Start Date
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.startDate
                                  ? new Date(
                                      selectedCoupon.startDate,
                                    ).toLocaleDateString()
                                  : new Date(
                                      selectedCoupon.createdAt,
                                    ).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Expiration Date
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.expiresAt ||
                                selectedCoupon.endDate
                                  ? new Date(
                                      selectedCoupon.expiresAt ||
                                        selectedCoupon.endDate,
                                    ).toLocaleDateString()
                                  : "Ongoing"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Store Operating Hours
                              </span>
                              <span className="font-bold text-blue-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {selectedCoupon.validHours ||
                                  "All Business Hours"}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">
                              Valid Offer Days
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedCoupon.validDays &&
                              selectedCoupon.validDays.length > 0
                                ? selectedCoupon.validDays
                                : [
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                    "Sun",
                                  ]
                              ).map((day) => (
                                <span
                                  key={day}
                                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Total Usage Limit
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.maxClaims
                                  ? `${selectedCoupon.maxClaims} Total Vouchers`
                                  : "Unlimited Vouchers"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Per Customer Limit
                              </span>
                              <span className="font-bold text-slate-800">
                                {selectedCoupon.perCustomerLimit ||
                                  "1 per customer"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: TERMS & COMPLIANCE */}
                      {auditTab === "compliance" && (
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />{" "}
                              In-Store Terms &amp; Conditions
                            </h4>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-normal whitespace-pre-line">
                              {selectedCoupon.termsAndConditions ||
                                selectedCoupon.termsConditions ||
                                "Standard Vouchiqo merchant partner terms apply. Valid on base invoice value."}
                            </p>
                          </div>

                          {selectedCoupon.redemptionMethod && (
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                                Counter Redemption Instructions
                              </h4>
                              <p className="text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-200 font-bold">
                                {selectedCoupon.redemptionMethod}
                              </p>
                            </div>
                          )}

                          {selectedCoupon.internalNote && (
                            <div>
                              <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                                Merchant Note to Moderation Desk
                              </h4>
                              <p className="text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                                {selectedCoupon.internalNote}
                              </p>
                            </div>
                          )}

                          {/* Mandatory Merchant Declarations Status */}
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                            <h4 className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                              Mandatory Merchant Compliance Declarations
                            </h4>
                            <ul className="space-y-1 text-[11px] text-emerald-800 font-medium">
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />{" "}
                                Verified Merchant Business Authorization
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />{" "}
                                In-Store Discount Honor Guarantee Confirmed
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />{" "}
                                Fair Pricing &amp; Genuine Offer Declaration
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />{" "}
                                Vouchiqo Partner Platform Terms Accepted
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDetailsOpen(false)}
                        className="h-8 text-xs font-bold border-slate-300 text-slate-700 rounded-xl cursor-pointer"
                      >
                        Close Modal
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectModal(selectedCoupon._id)}
                          disabled={rejectMutation.isPending}
                          className="h-8 text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Reject Offer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(selectedCoupon._id)}
                          disabled={approveMutation.isPending}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 rounded-xl cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Approve &amp; Publish Live
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>

        {/* Rejection Reason Dialog Modal */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="h-5 w-5" />
                <span>Reject Offer Listing</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-left font-sans">
              <p className="text-xs text-slate-500 font-medium">
                Please provide a clear explanation for rejecting this offer
                listing. This will be shared directly with the merchant partner
                so they can update and re-submit.
              </p>
              <Textarea
                placeholder="e.g. Invalid discount code, misleading title, or unreadable banner image..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none text-xs border-slate-200 rounded-xl font-medium"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectOpen(false)}
                disabled={rejectMutation.isPending}
                className="h-8 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="h-8 text-xs font-bold rounded-xl"
              >
                {rejectMutation.isPending
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
