"use client";

import { AlertTriangle, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function DeclineModal({
  open,
  onOpenChange,
  selectedRequest,
  declineReason,
  setDeclineReason,
  onSubmit,
  isPending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-left shadow-xl">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Decline Revival Request
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold">
            Specify a polite reason why this expired offer cannot be re-issued
            for {selectedRequest?.couponTitle || "this customer"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="e.g., Campaign promotion has fully concluded. Please check our current active deals..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="text-xs bg-slate-50 border-slate-200 rounded-xl min-h-[100px]"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold border-slate-200 rounded-xl h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={declineReason.length < 10 || isPending}
              onClick={onSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
            >
              {isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              Decline Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AlternativeModal({
  open,
  onOpenChange,
  selectedRequest,
  activeCoupons,
  onSelectAlternative,
  isPending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-6 rounded-2xl border border-slate-200 text-left shadow-xl">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            Offer Alternative Active Coupon
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold">
            Select an existing live coupon to offer{" "}
            {selectedRequest?.customerEmail || "the customer"} instead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
          {activeCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className="p-3.5 border border-slate-200/80 rounded-xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {coupon.title}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                  {coupon.code}
                </span>
              </div>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => onSelectAlternative(coupon._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg h-8 px-3 cursor-pointer"
              >
                Send Alternative
              </Button>
            </div>
          ))}
          {activeCoupons.length === 0 && (
            <p className="text-xs text-slate-400 font-semibold text-center py-6">
              No active alternative coupons found in your store.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
