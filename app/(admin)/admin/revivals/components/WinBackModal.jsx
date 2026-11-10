"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReviewMerchantRevival } from "@/hooks/use-admin";

/**
 * WinBackModal — Reusable dialog for reviewing revival outreach and updating status.
 */
export default function WinBackModal({
  open,
  onOpenChange,
  revival,
  onStatusUpdated,
}) {
  const reviewMutation = useReviewMerchantRevival();

  if (!revival) return null;

  const handleReviewAction = (status) => {
    reviewMutation.mutate(
      {
        revivalId: revival._id || revival.id,
        status,
        reviewNote:
          status === "approved" ? "Approved by admin" : "Rejected by admin",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onStatusUpdated) onStatusUpdated();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl text-left border border-slate-200">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-bold text-slate-900">
            Revival Review &amp; Outreach
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Review particulars for{" "}
            {revival.couponId?.title || revival.brandName || "Offer Revival"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
              Merchant Partner
            </span>
            <span className="font-bold text-slate-900 block">
              {revival.merchantId?.businessName ||
                revival.brandName ||
                "Merchant Partner"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
              Revival Reason
            </span>
            <span className="font-medium text-slate-800 block">
              {revival.reason || "No reason specified"}
            </span>
          </div>

          {revival.newExpiresAt && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Requested New Expiry Date
              </span>
              <span className="font-mono font-bold text-slate-900 block">
                {new Date(revival.newExpiresAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reviewMutation.isPending}
            className="text-xs font-bold rounded-xl"
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={reviewMutation.isPending}
              onClick={() => handleReviewAction("rejected")}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold rounded-xl"
            >
              Reject
            </Button>
            <Button
              disabled={reviewMutation.isPending}
              onClick={() => handleReviewAction("approved")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              Approve &amp; Reactivate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
