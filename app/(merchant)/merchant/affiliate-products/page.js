"use client";

import {
  CheckCircle2,
  Filter,
  MousePointer,
  Percent,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useDeleteMerchantAffiliateProduct,
  useMerchantAffiliateProducts,
  useUpdateMerchantAffiliateProduct,
} from "@/hooks/use-merchant";
import AffiliateProductPreviewCard, {
  CATEGORIES,
} from "./components/AffiliateProductPreviewCard";

export default function MerchantAffiliateProductsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const { data: products = [], isLoading: loading } =
    useMerchantAffiliateProducts(statusFilter);
  const updateMutation = useUpdateMerchantAffiliateProduct();
  const deleteMutation = useDeleteMerchantAffiliateProduct();

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Affiliate link copied to clipboard!");
  };

  const handleToggleStatus = (product) => {
    const nextStatus = product.status === "active" ? "paused" : "active";
    setTogglingId(product._id);
    updateMutation.mutate(
      { id: product._id, status: nextStatus },
      {
        onSettled: () => setTogglingId(null),
      },
    );
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this affiliate product?"))
      return;
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.affiliateUrl.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  // Statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalClicks = products.reduce((acc, p) => acc + (p.clickCount || 0), 0);
  const avgSavingsPct =
    totalProducts > 0
      ? Math.round(
          products.reduce((acc, p) => acc + (p.discountPercentage || 0), 0) /
            totalProducts,
        )
      : 0;

  return (
    <DashboardLayout title="Affiliate Products" user={{ role: "merchant" }}>
      <div className="w-full max-w-full space-y-3.5 font-sans text-left">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
              Affiliate Products
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              List deals with custom affiliate links (CashKaro, Bitly, EarnKaro)
              and track shopper engagement.
            </p>
          </div>

          <Link
            href="/merchant/coupons/new?type=affiliate"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white font-medium text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer h-8 sm:h-9"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Affiliate Product</span>
          </Link>
        </div>

        {/* Clean Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Total Products
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-semibold text-slate-900 leading-none block">
                {totalProducts}
              </span>
              <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                Deals in catalog
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Active Listings
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-semibold text-emerald-600 leading-none block">
                {activeProducts}
              </span>
              <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                Live &amp; clickable
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Total Clicks
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MousePointer className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-semibold text-purple-600 leading-none block">
                {totalClicks}
              </span>
              <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                Outbound link visits
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Avg Discount
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-semibold text-amber-600 leading-none block">
                {avgSavingsPct}% OFF
              </span>
              <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                Average shopper savings
              </span>
            </div>
          </div>
        </div>

        {/* Search, Category & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 w-full shadow-2xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products or links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F72853] transition-colors font-normal h-8 sm:h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0 h-8 sm:h-9">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 h-8 sm:h-9">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "paused", label: "Paused" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === id
                      ? "bg-[#F72853] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid - Full Width Responsive Grid */}
        {loading
          ? <div className="py-16 text-center text-xs font-normal text-slate-500">
              Loading affiliate products...
            </div>
          : filteredProducts.length === 0
            ? <div className="py-12 text-center bg-white border border-slate-200/80 rounded-xl p-6 space-y-2.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F72853] flex items-center justify-center border border-rose-100/80 mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    No affiliate products found
                  </h3>
                  <p className="text-xs text-slate-500 font-normal max-w-sm mx-auto">
                    {search || categoryFilter !== "all"
                      ? "No products match your search query or selected category filter."
                      : "Start listing your products and earn commissions on shopper clicks."}
                  </p>
                </div>
                <Link
                  href="/merchant/coupons/new?type=affiliate"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Your First Product</span>
                </Link>
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4 w-full">
                {filteredProducts.map((product) => (
                  <AffiliateProductPreviewCard
                    key={product._id}
                    product={product}
                    isPreview={false}
                    onCopy={handleCopyLink}
                    onEdit={(p) =>
                      window.location.assign(
                        `/merchant/affiliate-products/${p._id}`,
                      )
                    }
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    isDeleting={deletingId === product._id}
                    isToggling={togglingId === product._id}
                  />
                ))}
              </div>}
      </div>
    </DashboardLayout>
  );
}
