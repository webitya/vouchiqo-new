"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Power,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
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
  useAdminAffiliateProducts,
  useAdminCoupons,
  useApproveAdminCoupon,
  useDeleteAdminCoupon,
  useDeleteAffiliateProduct,
  useRejectAdminCoupon,
  useUpdateAdminCoupon,
  useUpdateAffiliateProduct,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";
import MobileTableCard from "@/components/shared/data/MobileTableCard";
import toast from "react-hot-toast";
import OfferDetailsModal from "./OfferDetailsModal";
import OfferEditModal from "./OfferEditModal";
import OfferRejectModal from "./OfferRejectModal";
import { getOfferTableColumns } from "./OfferTableColumns";
import AffiliateProductModal from "@/app/(merchant)/merchant/affiliate-products/components/AffiliateProductModal";

const STATUS_OPTIONS = [
  { value: "all", label: "All Active & Paused" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
  { value: "deleted", label: "Deleted" },
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

export default function AdminOffersClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("coupons"); // 'coupons' | 'affiliates'

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Audit Details Modal State
  const [viewDetailsOffer, setViewDetailsOffer] = useState(null);

  // Edit Modal State (Coupons)
  const [editCoupon, setEditCoupon] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Reject Modal State
  const [rejectCoupon, setRejectCoupon] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Delete Modal State
  const [deleteCoupon, setDeleteCoupon] = useState(null);

  // Admin Affiliate Products UI state
  const [copiedId, setCopiedId] = useState(null);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [deleteAffiliateId, setDeleteAffiliateId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // TanStack Query for coupons list
  const {
    data: offers = [],
    isLoading,
    refetch,
  } = useAdminCoupons({
    status: statusFilter === "all" ? "" : statusFilter,
    search: debouncedSearch,
  });

  const categoryOptions = useMemo(() => {
    const set = new Set();
    offers.forEach((c) => {
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
  }, [offers]);

  const displayedOffers = useMemo(() => {
    if (categoryFilter === "all") return offers;
    return offers.filter(
      (o) => (o.category || "").toLowerCase() === categoryFilter.toLowerCase()
    );
  }, [offers, categoryFilter]);

  const stats = useMemo(() => {
    const total = offers.length;
    const activeVerified = offers.filter(
      (o) => o.status === "active" && o.isVerified,
    ).length;
    const pending = offers.filter(
      (o) => o.status === "pending" || !o.isVerified,
    ).length;
    const expiredPaused = offers.filter(
      (o) =>
        o.status === "paused" ||
        o.status === "expired" ||
        o.status === "rejected",
    ).length;
    return { total, activeVerified, pending, expiredPaused };
  }, [offers]);

  // TanStack Query for admin affiliate products
  const {
    data: affiliateProducts = [],
    isLoading: loadingAffiliates,
  } = useAdminAffiliateProducts({
    status: statusFilter,
    search: debouncedSearch,
  });

  const updateAffiliateMutation = useUpdateAffiliateProduct();
  const deleteAffiliateMutation = useDeleteAffiliateProduct();

  const approveMutation = useApproveAdminCoupon();
  const rejectMutation = useRejectAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();

  // Real-time WebSocket event listeners
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  });

  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  });

  const getOfferRowColor = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  const handleOpenEdit = useCallback((coupon) => {
    setEditCoupon(coupon);
    setEditForm({
      title: coupon.title || "",
      description: coupon.description || "",
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || 0,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || "",
      category: coupon.category || "general",
      status: coupon.status || "active",
      isVerified: coupon.isVerified ?? true,
      isFeatured: coupon.isFeatured ?? false,
      isHot: coupon.isHot ?? false,
      expiresAt:
        coupon.expiresAt || coupon.expiryDate
          ? new Date(coupon.expiresAt || coupon.expiryDate)
              .toISOString()
              .split("T")[0]
          : "",
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editCoupon) return;
    updateMutation.mutate(
      { couponId: editCoupon._id, ...editForm },
      {
        onSuccess: () => setEditCoupon(null),
      },
    );
  }, [editCoupon, editForm, updateMutation]);

  const handleConfirmReject = useCallback(() => {
    if (!rejectCoupon || !rejectionReason.trim()) return;
    rejectMutation.mutate(
      { couponId: rejectCoupon._id, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectCoupon(null);
          setRejectionReason("");
        },
      },
    );
  }, [rejectCoupon, rejectionReason, rejectMutation]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteCoupon) return;
    deleteMutation.mutate(deleteCoupon._id, {
      onSuccess: () => setDeleteCoupon(null),
    });
  }, [deleteCoupon, deleteMutation]);

  // Affiliate Actions via TanStack Query Mutations
  const handleToggleAffiliateStatus = (product) => {
    const nextStatus = product.status === "active" ? "paused" : "active";
    updateAffiliateMutation.mutate({ id: product._id, status: nextStatus });
  };

  const handleConfirmDeleteAffiliate = () => {
    if (!deleteAffiliateId) return;
    deleteAffiliateMutation.mutate(deleteAffiliateId, {
      onSuccess: () => setDeleteAffiliateId(null),
    });
  };

  const columns = useMemo(
    () =>
      getOfferTableColumns({
        onApprove: (id) => approveMutation.mutate(id),
        onReject: (coupon) => setRejectCoupon(coupon),
        onEdit: handleOpenEdit,
        onDelete: (coupon) => setDeleteCoupon(coupon),
        onViewDetails: (coupon) => setViewDetailsOffer(coupon),
        isApproving: approveMutation.isPending,
      }),
    [approveMutation, handleOpenEdit],
  );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full space-y-3 pb-12 font-sans text-left">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div>
            <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
              Offer Desk &amp; Verification
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              Manage all platform coupons, merchant affiliate products, service
              packages, and deal parameters.
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("coupons")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border-0",
                  activeTab === "coupons"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 bg-transparent",
                )}
              >
                <Tag className="w-3 h-3" />
                <span>Standard Coupons ({offers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("affiliates")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border-0",
                  activeTab === "affiliates"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 bg-transparent",
                )}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Affiliate Products &amp; Brand Deals</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === "coupons") refetch();
                else fetchAdminAffiliates();
              }}
              disabled={isLoading || loadingAffiliates}
              className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading || loadingAffiliates ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* 4 Mini KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Card
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              statusFilter === "all"
                ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Total Listings
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
            onClick={() => setStatusFilter("active")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              statusFilter === "active"
                ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Active &amp; Verified
                </span>
                <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-10 rounded mt-0.5 bg-emerald-200/60" /> : stats.activeVerified}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              statusFilter === "pending"
                ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Pending Audit
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
            onClick={() => setStatusFilter("paused")}
            className={cn(
              "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
              statusFilter === "paused" || statusFilter === "expired"
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-white border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Paused / Expired
                </span>
                <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none">
                  {isLoading ? <Skeleton className="h-4.5 w-8 rounded mt-0.5 bg-rose-200/60" /> : stats.expiredPaused}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Ban className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab 1: Standard Coupons */}
        {activeTab === "coupons" ? (
          <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden">
            <DataTable
              columns={columns}
              data={displayedOffers}
              loading={isLoading}
              searchKey="title"
              searchKeys={["title", "code", "merchantName"]}
              searchPlaceholder="Search by title, code, or merchant..."
              getRowClassName={getOfferRowColor}
              rightActions={
                <div className="flex items-center gap-2">
                  <FormSelect
                    name="categoryFilter"
                    options={categoryOptions}
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    placeholder="All Categories"
                    triggerClassName="w-[140px] h-7 text-[11px] bg-white border-slate-200 font-medium"
                  />
                  <FormSelect
                    name="statusFilter"
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder="Select Status"
                    triggerClassName="w-[160px] h-7 text-[11px] bg-white border-slate-200 font-medium"
                  />
                </div>
              }
            />
          </Card>
        ) : (
          /* Tab 2: Admin Affiliate Products & Brand Service Deals */
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <input
                type="text"
                placeholder="Search affiliate deals by title, tagline, or merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-normal"
              />

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <FormSelect
                  name="statusFilter"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="Select Status"
                  triggerClassName="w-[160px] h-7 text-[11px] bg-white border-slate-200 font-medium"
                />
              </div>
            </div>

            {loadingAffiliates ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 animate-pulse">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <Skeleton className="h-3 w-28 rounded bg-slate-200" />
                    <Skeleton className="h-3 w-20 rounded bg-slate-200 hidden sm:block" />
                    <Skeleton className="h-3 w-16 rounded bg-slate-200 hidden md:block" />
                    <Skeleton className="h-3 w-20 rounded bg-slate-200 hidden lg:block" />
                  </div>
                  <Skeleton className="h-3 w-14 rounded bg-slate-200" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Skeleton className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-36 rounded bg-slate-200" />
                        <Skeleton className="h-2.5 w-24 rounded bg-slate-100" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24 rounded bg-slate-100 hidden sm:block" />
                    <Skeleton className="h-5 w-20 rounded-md bg-slate-100 hidden md:block" />
                    <Skeleton className="h-4 w-16 rounded bg-slate-100 hidden lg:block" />
                    <div className="flex items-center gap-1.5 justify-end">
                      <Skeleton className="w-7 h-7 rounded-lg bg-slate-100" />
                      <Skeleton className="w-7 h-7 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : affiliateProducts.length === 0 ? (
              <div className="py-16 text-center text-xs font-medium text-slate-400 bg-white border border-slate-200/80 rounded-2xl">
                No affiliate products or brand deals found.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="px-4 py-3">Product / Deal</th>
                          <th className="px-4 py-3">Merchant</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Pricing / Offer</th>
                          <th className="px-4 py-3">Destination URL</th>
                          <th className="px-4 py-3">Clicks</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {affiliateProducts.map((p) => {
                          const merchantName =
                            p.merchantId?.businessName || "Unknown Merchant";
                          const hasExact =
                            p.originalPrice > 0 && p.discountPrice > 0;
                          const hasFixed =
                            p.discountPrice > 0 && p.originalPrice === 0;

                          return (
                            <tr
                              key={p._id}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                                    {p.imageUrl ? (
                                      <img
                                        src={p.imageUrl}
                                        alt={p.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="max-w-[200px]">
                                    <span className="font-bold text-slate-900 line-clamp-1 block">
                                      {p.title}
                                    </span>
                                    {p.description && (
                                      <span className="text-[10px] text-slate-500 line-clamp-1 block">
                                        {p.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 font-semibold text-slate-900">
                                {merchantName}
                              </td>

                              <td className="px-4 py-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-slate-200">
                                  {p.category}
                                </span>
                              </td>

                              <td className="px-4 py-3 font-bold">
                                {hasExact ? (
                                  <div className="space-y-0.5">
                                    <span className="text-blue-600 block">
                                      ₹{p.discountPrice?.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-through block">
                                      ₹{p.originalPrice?.toLocaleString()}
                                    </span>
                                  </div>
                                ) : hasFixed ? (
                                  <div className="space-y-0.5">
                                    <span className="text-emerald-600 block font-bold">
                                      ₹{p.discountPrice?.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 block truncate max-w-[140px]">
                                      {p.discountText ||
                                        `Just @ ₹${p.discountPrice}`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                                    {p.discountText ||
                                      `${p.discountPercentage}% OFF`}
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 max-w-[160px]">
                                  <span className="truncate text-slate-600 text-[11px]">
                                    {p.affiliateUrl}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        p.affiliateUrl,
                                      );
                                      setCopiedId(p._id);
                                      toast.success("Link copied!");
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="p-1 hover:text-blue-600 rounded shrink-0 cursor-pointer"
                                  >
                                    {copiedId === p._id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                  <a
                                    href={p.affiliateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 hover:text-blue-600 rounded shrink-0"
                                  >
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                </div>
                              </td>

                              <td className="px-4 py-3 font-semibold text-slate-600">
                                {p.clickCount || 0}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    p.status === "active"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {p.status?.toUpperCase()}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleAffiliateStatus(p)
                                    }
                                    className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                      p.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                    }`}
                                    title={
                                      p.status === "active"
                                        ? "Pause Deal"
                                        : "Activate Deal"
                                    }
                                  >
                                    <Power className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setEditingAffiliate(p)}
                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 cursor-pointer"
                                    title="Edit Deal"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeleteAffiliateId(p._id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                                    title="Delete Deal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View - Affiliate Products (Reference Card Design) */}
                <div className="md:hidden space-y-3">
                  {affiliateProducts.map((p) => {
                    const merchantName =
                      p.merchantId?.businessName || "Unknown Merchant";
                    const hasExact = p.originalPrice > 0 && p.discountPrice > 0;
                    const hasFixed =
                      p.discountPrice > 0 && p.originalPrice === 0;
                    const priceDisplay = hasExact
                      ? `₹${p.discountPrice?.toLocaleString()}`
                      : hasFixed
                        ? `₹${p.discountPrice?.toLocaleString()}`
                        : p.discountText || `${p.discountPercentage}% OFF`;

                    return (
                      <MobileTableCard
                        key={p._id}
                        avatar={
                          p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                          ) : null
                        }
                        avatarText={!p.imageUrl ? p.title : undefined}
                        avatarBg="bg-blue-600"
                        badge="AFFILIATE PRODUCT"
                        title={p.title}
                        subtitle={`${merchantName} • ${p.category}`}
                        fields={[
                          {
                            label: "MERCHANT",
                            value: merchantName,
                          },
                          {
                            label: "CATEGORY",
                            value: p.category,
                          },
                          {
                            label: "STATUS",
                            value: p.status || "active",
                            isStatus: true,
                            statusType:
                              p.status === "active" ? "success" : "danger",
                          },
                          {
                            label: "PRICE / OFFER",
                            value: priceDisplay,
                            isAmount: true,
                          },
                        ]}
                        actions={
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleToggleAffiliateStatus(p)}
                              className={cn(
                                "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer select-none shrink-0",
                                p.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100",
                              )}
                              title={
                                p.status === "active"
                                  ? "Deactivate Product"
                                  : "Activate Product"
                              }
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteAffiliateId(p._id)}
                              className="w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer select-none shrink-0"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAffiliate(p)}
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl py-2.5 px-4 flex items-center justify-between text-xs transition-colors cursor-pointer select-none"
                            >
                              <span>Edit Product</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Offer Audit Details Modal */}
        <OfferDetailsModal
          offer={viewDetailsOffer}
          onClose={() => setViewDetailsOffer(null)}
          onEdit={handleOpenEdit}
          onDelete={(coupon) => setDeleteCoupon(coupon)}
          onApprove={(id) => approveMutation.mutate(id)}
        />

        {/* Modular Edit Offer Modal */}
        <OfferEditModal
          editCoupon={editCoupon}
          onClose={() => setEditCoupon(null)}
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveEdit}
          isPending={updateMutation.isPending}
        />

        {/* Rejection Reason Modal */}
        <OfferRejectModal
          rejectCoupon={rejectCoupon}
          onClose={() => setRejectCoupon(null)}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onConfirm={handleConfirmReject}
          isPending={rejectMutation.isPending}
        />

        {/* Confirm Delete Coupon Modal */}
        <ConfirmDeleteModal
          open={!!deleteCoupon}
          onOpenChange={(open) => !open && setDeleteCoupon(null)}
          title="Delete Offer Listing"
          description="Are you sure you want to permanently delete this offer listing? This will remove it from customer views and search results."
          onConfirm={handleConfirmDelete}
          isPending={deleteMutation.isPending}
        />

        {/* Admin Edit Affiliate Product Modal */}
        {editingAffiliate && (
          <AffiliateProductModal
            isOpen={!!editingAffiliate}
            onClose={() => setEditingAffiliate(null)}
            initialData={editingAffiliate}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["admin-affiliate-products"],
              });
            }}
            isAdmin={true}
          />
        )}

        {/* Admin Delete Affiliate Product Modal */}
        <ConfirmDeleteModal
          open={!!deleteAffiliateId}
          onOpenChange={(open) => !open && setDeleteAffiliateId(null)}
          title="Delete Affiliate Deal"
          description="Are you sure you want to delete this affiliate product / brand deal? It will no longer appear on public brand pages or search results."
          onConfirm={handleConfirmDeleteAffiliate}
          isPending={deleteAffiliateMutation.isPending}
        />
      </div>
    </TooltipProvider>
  );
}
