"use client";

import { AlertTriangle } from "lucide-react";
import FormTextarea from "@/components/shared/form/FormTextarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OfferRejectModal({
  rejectCoupon,
  onClose,
  rejectionReason,
  setRejectionReason,
  onConfirm,
  isPending,
}) {
  return (
    <Dialog open={!!rejectCoupon} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Reject Offer Listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Provide reason for rejecting <strong>{rejectCoupon?.title}</strong>:
          </p>

          <FormTextarea
            name="rejectionReason"
            placeholder="e.g. Invalid coupon code or misleading terms..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectionReason.trim() || isPending}
          >
            {isPending ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
