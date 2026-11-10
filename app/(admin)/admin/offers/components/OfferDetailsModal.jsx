"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Layers,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OfferDetailsModal({
  offer,
  onClose,
  onEdit,
  onDelete,
  onApprove,
}) {
  if (!offer) return null;

  return (
    <Dialog open={!!offer} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto font-sans text-left">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-blue-600" />
                <span>{offer.title}</span>
              </DialogTitle>
              <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                <Store className="h-3 w-3 text-slate-400" />
                <span>
                  {offer.merchantId?.businessName ||
                    offer.merchantName ||
                    "Merchant Partner"}
                </span>
              </p>
            </div>
            <Badge
              className={`text-[10px] font-medium px-2 py-0.5 capitalize ${
                offer.status === "active"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : offer.status === "pending"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {offer.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Banner / Image Preview */}
          {(offer.imageUrl || offer.bannerUrl || offer.image) && (
            <div className="h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={offer.imageUrl || offer.bannerUrl || offer.image}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Offer Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Discount Value
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                {offer.discountType === "percentage"
                  ? `${offer.discountValue}% OFF`
                  : `₹${offer.discountValue} OFF`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Coupon Code
              </span>
              <code className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                {offer.code || "AUTO-APPLY"}
              </code>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Category
              </span>
              <span className="font-medium text-slate-800 capitalize">
                {offer.category || "General"}
                {offer.subcategory ? ` • ${offer.subcategory}` : ""}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Validity Expiry
              </span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {offer.expiresAt || offer.expiryDate
                  ? new Date(offer.expiresAt || offer.expiryDate).toLocaleDateString()
                  : "No expiration"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Total Claims
              </span>
              <span className="font-medium text-slate-800">
                {offer.usesCount || offer.totalClaims || 0} claimed / {offer.usageLimit || "∞"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Verification Flags
              </span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                {offer.isVerified ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Unverified</span>
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              Offer Description
            </h4>
            <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
              {offer.description || "No description provided."}
            </p>
          </div>

          {/* Terms & Conditions */}
          {offer.termsConditions && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-500" />
                Terms &amp; Conditions
              </h4>
              <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                {offer.termsConditions}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-medium border-slate-300 text-slate-700"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(offer);
              }}
              className="h-8 text-xs font-medium border-slate-300 text-slate-800"
            >
              Edit Offer
            </Button>
          )}

          {offer.status === "pending" && onApprove && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onApprove(offer._id);
              }}
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Approve Listing
            </Button>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(offer);
              }}
              className="h-8 text-xs font-medium"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Offer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
