"use client";

import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConfirmationModal({ coupon, onClose, onConfirm }) {
  const [copied, setCopied] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const merchantName =
    coupon?.merchantId?.businessName || coupon?.merchantId?.name;

  const handleClaim = async () => {
    setLoading(true);
    setError("");
    try {
      if (onConfirm) {
        const code = await onConfirm(coupon._id);
        setVoucherCode(code || "VOUCH-SUMMER-77");
      } else {
        // Mock success
        await new Promise((resolve) => setTimeout(resolve, 800));
        setVoucherCode("VOUCH-MOCK-99");
      }
    } catch (_err) {
      setError(
        "Failed to claim voucher. The offer may be out of stock or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountFormatted =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `$${coupon.discountValue} OFF`;

  return (
    <Dialog
      open={!!coupon}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md bg-brand-bg text-brand-text border-brand-border p-0 overflow-hidden rounded-xl shadow-xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-brand-border flex flex-row items-center justify-between bg-brand-surface space-y-0">
          <DialogTitle className="font-heading font-bold text-brand-navy text-sm tracking-tight">
            Claim Voucher
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6">
          {/* Coupon Summary Info */}
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4 mb-5 flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {merchantName ? merchantName[0] : "V"}
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider block">
                {merchantName || "Verified Brand"}
              </span>
              <h4 className="font-heading font-bold text-brand-navy text-base leading-snug">
                {discountFormatted} {coupon.title}
              </h4>
              <Badge className="bg-brand-success/5 text-brand-success hover:bg-brand-success/10 border-0 shadow-none px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 mt-1.5 w-fit">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{coupon.successRate || 98}% success rate</span>
              </Badge>
            </div>
          </div>

          {/* Conditional View States */}
          {voucherCode ? (
            // Success State
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto w-12 h-12 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-text mb-1">
                  Voucher Claimed Successfully!
                </h3>
                <p className="text-xs text-brand-subtext max-w-xs mx-auto">
                  Copy the code below and paste it at check out, or present this
                  ticket in-store to redeem the offer.
                </p>
              </div>

              {/* Code Container */}
              <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200">
                <span className="font-mono font-bold text-xl tracking-[0.15em] text-slate-800 uppercase select-all">
                  {voucherCode}
                </span>
                <Button
                  onClick={copyToClipboard}
                  className={`text-xs font-semibold py-2 px-4 rounded-lg border-0 h-auto cursor-pointer transition-all duration-200 ${
                    copied ? "bg-[#2563eb] text-white" : "btn-primary shadow-sm"
                  }`}
                >
                  {copied ? "✅ Copied!" : "Copy Code"}
                </Button>
              </div>
            </div>
          ) : (
            // Form / Claim Action State
            <div className="space-y-4">
              <p className="text-xs text-brand-subtext leading-relaxed">
                By claiming this offer, a unique redemption code will be
                reserved for you. Please use this offer code before it expires on{" "}
                <strong className="text-brand-text">
                  {coupon.expiresAt
                    ? (() => {
                        const d = new Date(coupon.expiresAt);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()
                    : "the expiry date"}
                </strong>
                .
              </p>

              {error && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-brand-error/5 border border-brand-error/15 text-brand-error text-xs items-start">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                disabled={loading}
                onClick={handleClaim}
                className="btn-primary w-full py-2.5 text-sm h-auto cursor-pointer border-0 shadow-none"
              >
                {loading ? "Claiming..." : "Confirm & Claim Voucher"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
