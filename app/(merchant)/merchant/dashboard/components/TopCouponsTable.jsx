"use client";

import {
  Edit2,
  ExternalLink,
  Eye,
  Pause,
  Play,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable, StatusBadge } from "@/components/shared/data";
import { ConfirmDeleteModal } from "@/components/shared/modals";
import { qk } from "@/lib/query-keys";
import { showError, showSuccess } from "@/lib/toast";

export default function TopCouponsTable({
  coupons: initialCoupons = [],
  affiliates: initialAffiliates = [],
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [couponsList, setCouponsList] = useState(initialCoupons);
  const [affiliatesList, setAffiliatesList] = useState(initialAffiliates);

  useEffect(() => {
    setCouponsList(
      initialCoupons.map((c) => ({
        ...c,
        type: "coupon",
        imageUrl: c.image || c.imageUrl || null,
      })),
    );
  }, [initialCoupons]);

  useEffect(() => {
    setAffiliatesList(
      initialAffiliates.map((a) => ({
        ...a,
        type: "affiliate",
        imageUrl: a.imageUrl || null,
      })),
    );
  }, [initialAffiliates]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleToggleStatus = async (id, type) => {
    if (type === "affiliate") {
      const target = affiliatesList.find((a) => (a.id || a._id) === id);
      if (!target) return;
      const next = target.status === "active" ? "paused" : "active";

      try {
        const res = await fetch(`/api/merchant/affiliate-products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (res.ok) {
          setAffiliatesList((prev) =>
            prev.map((a) =>
              (a.id || a._id) === id ? { ...a, status: next } : a,
            ),
          );
          showSuccess(
            `Affiliate deal "${target.title}" ${next === "active" ? "resumed" : "paused"} successfully.`,
          );
          queryClient.invalidateQueries({
            queryKey: qk.merchant.affiliateProducts(),
          });
        } else {
          showError("Failed to update affiliate product status.");
        }
      } catch (err) {
        showError("Network error updating status.");
      }
      return;
    }

    // Real Coupon status toggle via PUT /api/coupons/:id
    const target = couponsList.find((c) => (c.id || c._id) === id);
    if (!target) return;

    const next = target.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setCouponsList((prev) =>
          prev.map((c) => ((c.id || c._id) === id ? { ...c, status: next } : c)),
        );
        showSuccess(
          `Offer "${target.code || target.title}" ${next === "active" ? "resumed" : "paused"} successfully.`,
        );
        queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
        queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
      } else {
        const errJson = await res.json().catch(() => ({}));
        showError(errJson.message || "Failed to update offer status.");
      }
    } catch (err) {
      showError("Network error updating status.");
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id || itemToDelete._id;

    if (itemToDelete.type === "affiliate") {
      try {
        const res = await fetch(
          `/api/merchant/affiliate-products/${targetId}`,
          {
            method: "DELETE",
          },
        );
        if (res.ok) {
          setAffiliatesList((prev) =>
            prev.filter((a) => (a.id || a._id) !== targetId),
          );
          showSuccess(`Affiliate product "${itemToDelete.title}" deleted.`);
          queryClient.invalidateQueries({
            queryKey: qk.merchant.affiliateProducts(),
          });
        } else {
          showError("Failed to delete affiliate product.");
        }
      } catch (err) {
        showError("Error deleting affiliate product.");
      }
    } else {
      try {
        const res = await fetch(`/api/coupons/${targetId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setCouponsList((prev) =>
            prev.filter((c) => (c.id || c._id) !== targetId),
          );
          showSuccess(
            `Offer "${itemToDelete.code || itemToDelete.title}" deleted.`,
          );
          queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
          queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
        } else {
          const errJson = await res.json().catch(() => ({}));
          showError(errJson.message || "Failed to delete offer.");
        }
      } catch (err) {
        showError("Error deleting offer.");
      }
    }

    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  // Filtered items based on activeTab
  const displayedItems = useMemo(() => {
    if (activeTab === "coupons") return couponsList;
    if (activeTab === "affiliates") return affiliatesList;

    // Combined "all"
    return [...couponsList, ...affiliatesList].sort((a, b) => {
      const aScore = (a.redemptions || 0) + (a.clicks || 0);
      const bScore = (b.redemptions || 0) + (b.clicks || 0);
      return bScore - aScore;
    });
  }, [activeTab, couponsList, affiliatesList]);

  const renderMobileCouponCard = (row) => {
    const isAffiliate = row?.type === "affiliate";
    const editUrl = isAffiliate
      ? `/merchant/affiliate-products/${row.id || row._id}`
      : `/merchant/coupons/${row.id || row._id}`;

    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-3 font-sans text-left relative overflow-hidden">
        {/* Top Row: Thumbnail + Title + Badges + Code / Link */}
        <div className="flex items-start gap-3">
          {/* Thumbnail (64x64) */}
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isAffiliate ? "bg-emerald-50/70" : "bg-rose-50/70"
                }`}
              >
                {isAffiliate ? (
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Ticket className="w-6 h-6 text-[#F72853]" />
                )}
              </div>
            )}
          </div>

          {/* Content Next to Image */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Badges row: Type & Category */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isAffiliate
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                    : "bg-rose-50 text-[#F72853] border-rose-200/80"
                }`}
              >
                {isAffiliate ? "Affiliate Deal" : "Voucher"}
              </span>

              <span className="text-[10px] font-medium text-slate-600 capitalize bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/70 inline-flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                <span className="truncate max-w-[85px]">
                  {row?.category || "General"}
                </span>
              </span>
            </div>

            {/* Deal Title */}
            <h3
              className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 break-words"
              title={row?.title}
            >
              {row?.title || "Listing"}
            </h3>

            {/* Code pill or Direct Affiliate link */}
            <div className="pt-0.5 flex items-center gap-2 flex-wrap min-w-0">
              {isAffiliate ? (
                row?.affiliateUrl ? (
                  <a
                    href={row.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-medium truncate max-w-full"
                    title={row.affiliateUrl}
                  >
                    <span className="truncate">Direct Affiliate Link</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : null
              ) : row?.code ? (
                <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold text-slate-700 tracking-wide">
                  <span className="text-slate-400 text-[9.5px]">CODE:</span>
                  <span className="text-slate-900 select-all">{row.code}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Middle Info Panel: Discount & Performance */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50/85 border border-slate-200/75 rounded-xl p-2.5">
          {/* Discount / Deal */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Discount / Deal
            </span>
            <span
              className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${
                isAffiliate ? "text-emerald-700" : "text-[#F72853]"
              }`}
            >
              {row?.discount || "Offer"}
            </span>
          </div>

          {/* Performance */}
          <div className="flex flex-col min-w-0 pl-2 border-l border-slate-200/70">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Performance
            </span>
            {isAffiliate ? (
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {(Number(row?.clicks) || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  visits
                </span>
              </div>
            ) : (
              <div className="mt-0.5 flex items-baseline gap-1 text-xs text-slate-800 flex-wrap">
                <span className="font-bold">
                  {(Number(row?.clicks ?? row?.views) || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  clicks
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold">
                  {(Number(row?.redemptions) || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  claims
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Status Badge + Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <StatusBadge status={row?.status || "active"} size="sm" />

          <div className="flex items-center gap-1 shrink-0">
            {/* Preview Live Deal Link */}
            {isAffiliate ? (
              row.affiliateUrl ? (
                <a
                  href={row.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Preview Store Link"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>
              ) : null
            ) : (
              <a
                href={`/deals/${row.id || row._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Preview Coupon"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
            )}

            <Link
              href={editUrl}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              title={isAffiliate ? "Edit Affiliate Deal" : "Edit Coupon"}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => handleToggleStatus(row.id || row._id, row.type)}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              title={
                row.status === "active" ? "Pause Listing" : "Resume Listing"
              }
            >
              {row.status === "active" ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => confirmDelete(row)}
              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Delete Listing"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /** @type {import("@/components/shared/data/DataTable").Column[]} */
  const columns = [
    {
      key: "title",
      header: "Listing / Deal",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span
            className="font-medium text-slate-800 truncate block text-xs"
            title={row?.title}
          >
            {row?.title || "Listing"}
          </span>
          <div className="flex items-center gap-1.5">
            {row?.type === "affiliate" ? (
              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 rounded">
                <ShoppingBag className="w-2.5 h-2.5 text-emerald-600" />
                <span>Affiliate Deal</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 py-0.2 rounded">
                <Ticket className="w-2.5 h-2.5 text-blue-600" />
                <span>Voucher</span>
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code / Link",
      cell: (row) => {
        if (row?.type === "affiliate") {
          return (
            <a
              href={row?.affiliateUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline max-w-[130px] truncate"
              title={row?.affiliateUrl}
            >
              <span>Affiliate Link</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          );
        }
        return (
          <span className="font-mono text-[11px] font-medium text-slate-600 flex items-center gap-1">
            <Ticket className="w-3 h-3 text-slate-400" />
            {row?.code || "N/A"}
          </span>
        );
      },
    },
    {
      key: "discount",
      header: "Discount / Deal",
      cell: (row) => (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border font-sans ${
            row?.type === "affiliate"
              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
              : "text-[#F72853] bg-rose-50 border-rose-100"
          }`}
        >
          {row?.discount || "Offer"}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 font-sans capitalize">
          <Tag className="w-2.5 h-2.5 text-slate-400" />
          {row?.category || "General"}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-700 font-normal">
          {(Number(row?.clicks ?? row?.views) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-slate-800">
          {row?.type === "affiliate"
            ? `${(Number(row?.clicks) || 0).toLocaleString()} visits`
            : (Number(row?.redemptions) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row?.status || "active"} size="sm" />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => {
        const isAffiliate = row?.type === "affiliate";
        const editUrl = isAffiliate
          ? `/merchant/affiliate-products/${row.id || row._id}`
          : `/merchant/coupons/${row.id || row._id}`;

        return (
          <div className="flex items-center gap-1">
            {/* Preview Live Deal Link */}
            {isAffiliate ? (
              row.affiliateUrl ? (
                <a
                  href={row.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Preview Store Link"
                >
                  <Eye className="w-3 h-3" />
                </a>
              ) : null
            ) : (
              <a
                href={`/deals/${row.id || row._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                title="Preview Coupon"
              >
                <Eye className="w-3 h-3" />
              </a>
            )}

            <Link
              href={editUrl}
              className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title={isAffiliate ? "Edit Affiliate Deal" : "Edit Coupon"}
            >
              <Edit2 className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => handleToggleStatus(row.id || row._id, row.type)}
              className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title={
                row.status === "active" ? "Pause Listing" : "Resume Listing"
              }
            >
              {row.status === "active" ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={() => confirmDelete(row)}
              className="w-6.5 h-6.5 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Listing"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      },
    },
  ];

  const viewAllHref =
    activeTab === "affiliates"
      ? "/merchant/affiliate-products"
      : "/merchant/coupons";

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col text-left font-sans">
      {/* Header Bar with Filter Tabs */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
            Store Listings &amp; Offers
          </h3>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
            All active promotional vouchers and affiliate product deals
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Tabs */}
          <div className="inline-flex p-0.5 bg-slate-200/60 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Listings ({couponsList.length + affiliatesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "coupons"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Coupons ({couponsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("affiliates")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "affiliates"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Affiliate Products ({affiliatesList.length})
            </button>
          </div>

          <Link
            href={viewAllHref}
            className="text-xs font-medium text-[#F72853] hover:underline underline-offset-2 shrink-0 ml-1"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-3.5 sm:p-4 pt-2">
        <DataTable
          columns={columns}
          data={displayedItems}
          searchable={false}
          defaultPageSize={5}
          renderMobileCard={renderMobileCouponCard}
          emptyState={
            <div className="space-y-2.5 py-8 text-center">
              <p className="text-xs text-slate-500 font-normal">
                {activeTab === "affiliates"
                  ? "No affiliate products listed yet."
                  : activeTab === "coupons"
                    ? "No coupon offers found yet."
                    : "No listings found yet."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {(activeTab === "all" || activeTab === "coupons") && (
                  <Link
                    href="/merchant/coupons/new"
                    className="text-xs font-medium text-white bg-[#F72853] hover:bg-[#e01e47] px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                  >
                    + Post Coupon Deal
                  </Link>
                )}
                {(activeTab === "all" || activeTab === "affiliates") && (
                  <Link
                    href="/merchant/affiliate-products/new"
                    className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                  >
                    + Add Affiliate Deal
                  </Link>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemName={itemToDelete?.code || itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
