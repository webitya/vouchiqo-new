"use client";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  selectedAddOn,
  billingCycle,
  basePrice,
  gst,
  totalPrice,
  gstin,
  setGstin,
  onPayWithRazorpay,
  onSimulatePayment,
  isPending,
}) {
  const productName = selectedPlan
    ? `${selectedPlan.name} (${billingCycle})`
    : selectedAddOn?.name || "Partner Add-On";

  const numBase = Number(basePrice) || 0;
  const numGst = Number(gst) || 0;
  const numTotal = Number(totalPrice) || (numBase + numGst);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md max-h-[90vh] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-left font-sans shadow-2xl overflow-y-auto text-slate-900">
        {/* Modal Header — pr-10 ensures right close X icon is clear */}
        <DialogHeader className="border-b border-slate-100 pb-3 sm:pb-3.5 pr-10">
          <DialogTitle className="font-heading text-sm sm:text-base font-extrabold text-slate-900 flex items-center justify-between gap-2 tracking-tight">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              <span>Secure Checkout</span>
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              SSL Encrypted
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 sm:space-y-4 pt-2.5 sm:pt-3">
          {/* Order Summary Breakdown */}
          <div className="bg-slate-50 p-3.5 sm:p-4 border border-slate-200/80 rounded-xl sm:rounded-2xl space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 shrink-0">Selected Package:</span>
              <span className="font-extrabold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 truncate max-w-[160px] sm:max-w-[220px] text-[11px] sm:text-xs">
                {productName}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Base Price:</span>
              <span className="font-bold">
                ₹{numBase.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>GST (18% Tax):</span>
              <span className="font-bold">
                ₹{numGst.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center font-black text-xs sm:text-sm">
              <span className="text-slate-900">Total Amount Payable:</span>
              <span className="text-blue-600 text-sm sm:text-base font-extrabold">
                ₹{numTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Optional Business GSTIN input */}
          <div className="space-y-1">
            <Label className="text-[11px] sm:text-xs font-bold text-slate-700">
              Business GSTIN for Tax Credit (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. 27AABCU9603R1ZM"
              value={gstin}
              onChange={(e) => setGstin?.(e.target.value.toUpperCase())}
              className="bg-white border-slate-200 text-xs h-9.5 rounded-xl font-mono uppercase"
            />
          </div>

          {/* Primary Activation Button */}
          <Button
            onClick={onPayWithRazorpay}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl h-10 sm:h-11 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all mt-1 font-sans"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span>
                  Pay ₹{numTotal.toLocaleString("en-IN")} Now
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
