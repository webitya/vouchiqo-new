import { Check, X, ArrowRight } from "lucide-react";
import MobileTableCard from "@/components/shared/data/MobileTableCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CouponModerationTable({
  coupons,
  actionLoading,
  onApprove,
  onRejectClick,
}) {
  const getDiscountDisplay = (coupon) => {
    const val = coupon.rawDiscountValue || coupon.discountValue;
    const isNum =
      val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
    if (coupon.offerType === "deal" && coupon.salePrice)
      return `\u20b9${coupon.salePrice} Deal`;
    if (coupon.discountType === "percentage" && isNum) return `${val}% OFF`;
    if (coupon.discountType === "fixed" && isNum) return `\u20b9${val} OFF`;
    if (coupon.specialOfferType) return coupon.specialOfferType;
    if (typeof val === "string" && val.trim() && !isNum) return val;
    return "FREE GIFT";
  };

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <Table className="w-full text-xs">
          <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
            <TableRow className="hover:bg-transparent border-b border-brand-border">
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Merchant / Brand
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Offer Title
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Discount Value
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Redemption Rules
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Expiry Date
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                Moderation Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
            {coupons.map((coupon) => (
              <TableRow
                key={coupon._id}
                className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
              >
                <TableCell className="p-4 font-bold text-brand-navy h-auto">
                  {coupon.merchantId?.businessName || "Unknown Merchant"}
                  <span className="block text-[10px] text-brand-subtext font-bold uppercase mt-0.5">
                    Plan: {coupon.merchantId?.plan || "starter"}
                  </span>
                </TableCell>
                <TableCell className="p-4">
                  <div className="font-bold text-brand-text">
                    {coupon.title}
                  </div>
                  {coupon.description && (
                    <div className="text-[10px] text-brand-subtext mt-0.5 line-clamp-1">
                      {coupon.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-4 text-brand-blue font-bold">
                  {getDiscountDisplay(coupon)}
                </TableCell>
                <TableCell className="p-4 text-brand-subtext max-w-[200px] truncate">
                  Code:{" "}
                  <code className="bg-brand-surface px-1.5 py-0.5 rounded font-bold text-brand-navy">
                    {coupon.code}
                  </code>
                </TableCell>
                <TableCell className="p-4 text-brand-subtext">
                  {new Date(coupon.expiresAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="icon"
                      disabled={actionLoading}
                      onClick={() => onApprove(coupon._id)}
                      className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                      title="Approve & Publish"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      disabled={actionLoading}
                      onClick={() => onRejectClick(coupon._id)}
                      className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                      title="Reject Offer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Reference Card Design */}
      <div className="md:hidden space-y-3 p-3 bg-slate-50/50 dark:bg-slate-950/20">
        {coupons.map((coupon) => (
          <MobileTableCard
            key={coupon._id}
            avatarText={coupon.merchantId?.businessName || "Coupon"}
            avatarBg="bg-blue-600"
            badge="COUPON MODERATION"
            title={coupon.merchantId?.businessName || "Unknown Merchant"}
            subtitle={`Plan: ${coupon.merchantId?.plan || "starter"}`}
            fields={[
              {
                label: "ORDER ID / CODE",
                value: coupon.code,
                isCode: true,
              },
              {
                label: "PRODUCT / OFFER",
                value: coupon.title,
              },
              {
                label: "STATUS",
                value: "Pending",
                isStatus: true,
                statusType: "pending",
              },
              {
                label: "DISCOUNT",
                value: getDiscountDisplay(coupon),
                isAmount: true,
              },
            ]}
            actions={
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onRejectClick(coupon._id)}
                  className="w-24 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer select-none disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onApprove(coupon._id)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl py-2.5 px-4 flex items-center justify-between text-xs transition-colors cursor-pointer select-none disabled:opacity-50"
                >
                  <span>Approve &amp; Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
