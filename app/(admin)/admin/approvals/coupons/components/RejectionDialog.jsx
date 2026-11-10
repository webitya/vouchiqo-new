import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function RejectionDialog({
  isOpen,
  onOpenChange,
  rejectionReason,
  onReasonChange,
  onSubmit,
  actionLoading,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-brand-border rounded-xl shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-brand-navy font-bold text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-brand-error" />
            <span>Reject Coupon Offer</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <p className="text-xs text-brand-subtext font-semibold">
            Please provide a clear reason for rejecting this offer. The merchant
            will see this feedback in their campaign manager.
          </p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g. Inappropriate description, incorrect promo code terms..."
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[90px]"
          />
        </div>
        <DialogFooter className="border-t border-brand-border/60 pt-3 flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="btn-tertiary text-xs py-2 px-4 border border-brand-border rounded-lg h-auto shadow-none font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={actionLoading}
            onClick={onSubmit}
            className="bg-brand-error text-white hover:bg-red-600 text-xs py-2 px-5 rounded-lg h-auto shadow-none border-0 font-bold"
          >
            {actionLoading ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
