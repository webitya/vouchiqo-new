"use client";

import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Copy,
  Edit2,
  Eye,
  ShieldCheck,
  Store,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function getOfferTableColumns({
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onViewDetails,
  isApproving,
}) {
  return [
    {
      key: "title",
      header: "Offer & Merchant",
      accessorKey: "title",
      cell: (row) => {
        const merchantName =
          row.merchantId?.businessName || row.merchantName || "Merchant Partner";
        const initials = (row.title || row.headline || "OF")
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-slate-900 text-[11.5px] leading-tight truncate max-w-[220px]">
                  {row.title}
                </span>
                {row.isFeatured && (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[8.5px] font-medium px-1 py-0.2 rounded">
                    Featured
                  </span>
                )}
                {row.isHot && (
                  <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[8.5px] font-medium px-1 py-0.2 rounded">
                    🔥 Hot
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                <Store className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                <span className="truncate">{merchantName}</span>
                <span>•</span>
                <span className="capitalize text-slate-700">{row.category || "General"}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "code",
      header: "Discount & Code",
      accessorKey: "code",
      cell: (row) => (
        <div className="space-y-0.5 py-0.5">
          <span className="font-medium text-emerald-800 text-[10.5px] bg-white/95 px-1.5 py-0.5 rounded border border-emerald-300/90 inline-block shadow-2xs">
            {row.discountType === "percentage"
              ? `${row.discountValue}% OFF`
              : `₹${row.discountValue} OFF`}
          </span>
          <div>
            <code className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/95 font-mono font-medium border border-slate-300/90 text-slate-800 shadow-2xs inline-block">
              {row.code || "AUTO-APPLY"}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status / Verification",
      accessorKey: "status",
      cell: (row) => {
        let statusBg = "bg-white/95 text-slate-700 border-slate-300";
        if (row.status === "active")
          statusBg = "bg-white/95 text-emerald-700 border-emerald-300";
        else if (row.status === "pending")
          statusBg = "bg-white/95 text-amber-700 border-amber-300";
        else if (row.status === "paused")
          statusBg = "bg-white/95 text-rose-700 border-rose-300";

        return (
          <div className="space-y-0.5 py-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`capitalize text-[9.5px] font-medium px-2 py-0.5 rounded-md border shadow-2xs inline-block ${statusBg}`}
              >
                {row.status}
              </span>
              {row.isVerified ? (
                <ShieldCheck
                  className="h-3.5 w-3.5 text-emerald-600"
                  title="Verified Listing"
                />
              ) : (
                <AlertTriangle
                  className="h-3.5 w-3.5 text-amber-500"
                  title="Unverified Listing"
                />
              )}
            </div>
            {row.rejectionReason && (
              <p className="text-[9.5px] text-rose-600 font-normal truncate max-w-[150px]">
                Reason: {row.rejectionReason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "stats",
      header: "Stats",
      accessorKey: "usesCount",
      cell: (row) => (
        <div className="text-[10px] space-y-0.5 text-slate-600 font-normal py-0.5">
          <div>
            Claims: <span className="font-medium text-slate-900">{row.usesCount || 0}</span> /{" "}
            {row.usageLimit || "∞"}
          </div>
          <div>
            Views: <span className="font-medium text-slate-900">{row.viewsCount || row.viewCount || 0}</span>
          </div>
        </div>
      ),
    },
    {
      key: "expiresAt",
      header: "Expiry",
      accessorKey: "expiresAt",
      cell: (row) => (
        <span className="text-[10.5px] text-slate-600 font-normal py-0.5 block whitespace-nowrap">
          {row.expiresAt || row.expiryDate
            ? new Date(row.expiresAt || row.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : "No Expiration"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessorKey: "_id",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          {onViewDetails && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(row)}
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                >
                  <Eye className="h-3 w-3" />
                  <span className="sr-only">Audit Offer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                Audit Offer Details &amp; History
              </TooltipContent>
            </Tooltip>
          )}

          {row.status === "pending" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => onApprove(row._id)}
                    disabled={isApproving}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="sr-only">Approve Offer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Approve &amp; Verify Offer
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                    onClick={() => onReject(row)}
                  >
                    <XCircle className="h-3 w-3" />
                    <span className="sr-only">Reject Offer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Reject Offer
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6.5 w-6.5 p-0 flex items-center justify-center border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                onClick={() => onEdit(row)}
              >
                <Edit2 className="h-3 w-3" />
                <span className="sr-only">Edit Offer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
              Edit Offer Parameters
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                onClick={() => onDelete(row)}
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete Offer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
              Delete Offer Permanently
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];
}
