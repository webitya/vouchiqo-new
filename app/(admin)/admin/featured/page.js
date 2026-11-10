"use client";

import {
  Award,
  CheckCircle2,
  ExternalLink,
  Layers,
  Pin,
  RefreshCw,
  Search,
  Store,
  Tag,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAdminCoupons, useUpdateAdminCoupon } from "@/hooks/use-admin";
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

export default function FeaturedDeals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  const {
    data: coupons = [],
    isLoading: loading,
    refetch: fetchCoupons,
  } = useAdminCoupons();
  const updateCouponMutation = useUpdateAdminCoupon();

  const handleToggleFeatured = async (couponId, isFeatured) => {
    setTogglingId(couponId);
    try {
      await updateCouponMutation.mutateAsync({
        couponId,
        isFeatured: !isFeatured,
      });
      toast.success(
        !isFeatured
          ? "Deal pinned to Homepage Featured section!"
          : "Deal removed from Homepage Featured section.",
      );
    } catch (err) {
      console.error("Error toggling featured status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = coupons.length;
    const featured = coupons.filter((c) => Boolean(c.isFeatured)).length;
    const regular = coupons.filter((c) => !c.isFeatured).length;
    const verified = coupons.filter((c) => Boolean(c.isVerified)).length;
    return { total, featured, regular, verified };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Tab filter
      if (activeTab === "featured" && !c.isFeatured) return false;
      if (activeTab === "regular" && c.isFeatured) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const brand = (c.merchantId?.businessName || "").toLowerCase();
        const title = (c.title || "").toLowerCase();
        const code = (c.code || "").toLowerCase();
        return (
          brand.includes(query) || title.includes(query) || code.includes(query)
        );
      }

      return true;
    });
  }, [coupons, activeTab, searchQuery]);

  return (
    <DashboardLayout
      title="Featured Deals Management"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Featured Deals on Homepage
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Pin high-converting merchant offers directly to the Homepage
                Popular &amp; Featured carousel.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoupons}
              disabled={loading}
              className="self-start sm:self-auto gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Deals</span>
            </Button>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => setActiveTab("featured")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "featured"
                  ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Homepage Featured
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                    {stats.featured}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("regular")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "regular"
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Regular Listings
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.regular}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("all")}
              className="rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans bg-white border-slate-200/80 hover:border-slate-300"
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Verified Active
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.verified}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "all"
                  ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Catalog
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Container Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left overflow-hidden">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search deals by brand name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
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
                    label: "All Deals",
                    count: stats.total,
                    description: "View all verified merchant deals",
                  },
                  {
                    id: "featured",
                    label: "Featured Only",
                    count: stats.featured,
                    description:
                      "View deals pinned to Homepage Popular carousel",
                  },
                  {
                    id: "regular",
                    label: "Regular",
                    count: stats.regular,
                    description: "View standard unpinned listings",
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
                      {tab.description}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Colorful Deals Table - Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 w-56">Brand Partner</th>
                    <th className="py-2 px-3">Offer Details</th>
                    <th className="py-2 px-2 text-center w-36">
                      Homepage Status
                    </th>
                    <th className="py-2 px-3 text-right w-36">
                      Feature Control
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading
                    ? <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                          Loading coupon listings...
                        </td>
                      </tr>
                    : filteredCoupons.length === 0
                      ? <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            No deals found matching your search.
                          </td>
                        </tr>
                      : filteredCoupons.map((coupon, index) => {
                          const theme =
                            ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
                          const isFeatured = Boolean(coupon.isFeatured);
                          const isToggling = togglingId === coupon._id;

                          const brandName =
                            coupon.merchantId?.businessName || "Unknown Brand";
                          const initials = brandName
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();

                          return (
                            <tr
                              key={coupon._id}
                              className={cn(
                                "transition-all duration-150",
                                theme.row,
                              )}
                            >
                              {/* Brand Partner */}
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                                    {coupon.merchantId?.logo
                                      ? // biome-ignore lint/performance/noImgElement: merchant logo
                                        <img
                                          src={coupon.merchantId.logo}
                                          alt={brandName}
                                          className="w-full h-full object-cover rounded-md"
                                        />
                                      : initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-medium text-slate-900 text-[11.5px] leading-tight block truncate">
                                      {brandName}
                                    </span>
                                    <span className="text-[9.5px] text-slate-600 font-normal capitalize block leading-none mt-0.5">
                                      {coupon.category || "General"} •{" "}
                                      {coupon.merchantId?.location?.city ||
                                        "Ranchi"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Offer Details */}
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  {Number(coupon.discountValue) > 0
                                    ? <span className="bg-white/95 text-slate-800 border border-slate-300/90 font-medium text-[9.5px] px-1.5 py-0.2 rounded shadow-2xs shrink-0">
                                        {coupon.discountType === "percentage"
                                          ? `${coupon.discountValue}% OFF`
                                          : `₹${coupon.discountValue} OFF`}
                                      </span>
                                    : null}
                                  <div className="min-w-0">
                                    <span className="font-medium text-slate-900 text-[11.5px] leading-tight block truncate">
                                      {coupon.title}
                                    </span>
                                    {coupon.code && (
                                      <span className="text-[9.5px] font-mono text-slate-600 font-normal block leading-none mt-0.5">
                                        Code: {coupon.code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Homepage Status */}
                              <td className="py-2 px-2 text-center">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap",
                                    isFeatured
                                      ? "bg-white/95 text-amber-700 border-amber-300"
                                      : "bg-white/95 text-slate-600 border-slate-300/90",
                                  )}
                                >
                                  {isFeatured
                                    ? "Homepage Featured"
                                    : "Regular Listing"}
                                </span>
                              </td>

                              {/* Feature Control Action */}
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isToggling}
                                        onClick={() =>
                                          handleToggleFeatured(
                                            coupon._id,
                                            isFeatured,
                                          )
                                        }
                                        className={cn(
                                          "h-6.5 px-2 text-[10.5px] font-medium rounded-md cursor-pointer shadow-2xs gap-1 transition-colors",
                                          isFeatured
                                            ? "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
                                            : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50",
                                        )}
                                      >
                                        {isToggling
                                          ? <RefreshCw className="w-3 h-3 animate-spin" />
                                          : isFeatured
                                            ? <XCircle className="w-3 h-3 text-amber-600" />
                                            : <Pin className="w-3 h-3 text-blue-600" />}
                                        <span>
                                          {isFeatured
                                            ? "Unfeature"
                                            : "Feature Deal"}
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                    >
                                      {isFeatured
                                        ? "Remove deal from Homepage Featured Carousel"
                                        : "Pin this deal directly to the Homepage Featured section"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View - Featured Deals (Reference Card Design) */}
            <div className="md:hidden space-y-3">
              {loading
                ? <div className="py-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                    Loading coupon listings...
                  </div>
                : filteredCoupons.length === 0
                  ? <div className="py-8 text-center text-slate-400 text-xs">
                      No deals found matching your search.
                    </div>
                  : filteredCoupons.map((coupon, index) => {
                      const isFeatured = Boolean(coupon.isFeatured);
                      const isToggling = togglingId === coupon._id;
                      const brandName =
                        coupon.merchantId?.businessName || "Unknown Brand";
                      const discountDisplay = coupon.discountValue
                        ? coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`
                        : "SPECIAL DEAL";

                      return (
                        <MobileTableCard
                          key={coupon._id}
                          avatar={
                            coupon.merchantId?.logo
                              ? <img
                                  src={coupon.merchantId.logo}
                                  alt={brandName}
                                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                                />
                              : null
                          }
                          avatarText={
                            !coupon.merchantId?.logo ? brandName : undefined
                          }
                          avatarBg="bg-blue-600"
                          badge="BRAND PARTNER"
                          title={brandName}
                          subtitle={`${coupon.category || "General"} • ${coupon.merchantId?.location?.city || "Ranchi"}`}
                          fields={[
                            {
                              label: "PRODUCT / OFFER",
                              value: coupon.title,
                            },
                            {
                              label: "COUPON CODE",
                              value: coupon.code || "DIRECT DEAL",
                              isCode: true,
                            },
                            {
                              label: "STATUS",
                              value: isFeatured
                                ? "Homepage Featured"
                                : "Regular Listing",
                              isStatus: true,
                              statusType: isFeatured ? "warning" : "neutral",
                            },
                            {
                              label: "DISCOUNT",
                              value: discountDisplay,
                              isAmount: true,
                            },
                          ]}
                          actionText={
                            isToggling
                              ? "Updating..."
                              : isFeatured
                                ? "Unfeature from Homepage"
                                : "Feature Deal on Homepage"
                          }
                          actionVariant={isFeatured ? "outline" : "primary"}
                          actionIcon={isFeatured ? XCircle : Pin}
                          actionDisabled={isToggling}
                          onAction={() =>
                            handleToggleFeatured(coupon._id, isFeatured)
                          }
                        />
                      );
                    })}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
