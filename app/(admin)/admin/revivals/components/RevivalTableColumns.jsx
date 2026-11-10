import StatusBadge from "@/components/shared/data/StatusBadge";
import { Button } from "@/components/ui/button";

/**
 * Helper to build columns for DataTable in Admin Revivals page.
 */
export function getRevivalColumns({ onReviewClick }) {
  return [
    {
      key: "createdAt",
      header: "Submitted Date",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "merchantName",
      header: "Merchant Name",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          {row.merchantName || row.merchantId?.businessName || "—"}
        </span>
      ),
    },
    {
      key: "couponTitle",
      header: "Expired Coupon Title",
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800 text-xs block">
            {row.couponTitle || row.couponId?.title || "—"}
          </span>
          {row.couponCode && (
            <code className="text-[10px] font-mono text-slate-400">
              {row.couponCode}
            </code>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <StatusBadge status={row.status || "pending"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="text-right">
          <Button
            size="sm"
            onClick={() => onReviewClick(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold h-7 px-3 rounded-lg cursor-pointer shadow-2xs"
          >
            Review &amp; Audit
          </Button>
        </div>
      ),
    },
  ];
}
