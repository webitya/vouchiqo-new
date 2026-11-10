"use client";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PaymentPendingModal({ merchant }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const planName = merchant?.plan || "Starter Free";
  const isStarterPlan =
    planName.toLowerCase().includes("starter") ||
    planName.toLowerCase().includes("free");
  const isPaidPlan = !isStarterPlan;

  const isPaymentCompleted =
    isStarterPlan ||
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    merchant?.isPaid === true;

  const isPaymentPending = isPaidPlan && !isPaymentCompleted;

  useEffect(() => {
    if (!merchant || !isPaymentPending) {
      setIsOpen(false);
      return;
    }

    // Do not show on billing page or profile edit page
    if (
      pathname?.startsWith("/merchant/billing") ||
      pathname?.startsWith("/merchant/profile")
    ) {
      setIsOpen(false);
      return;
    }

    // Check if merchant skipped in current session
    if (typeof window !== "undefined") {
      const skipped = sessionStorage.getItem("vouchiqo_payment_modal_skipped");
      if (!skipped) {
        setIsOpen(true);
      }
    }
  }, [merchant, isPaymentPending, pathname]);

  if (!isOpen || !merchant || !isPaymentPending) {
    return null;
  }

  const handleSkip = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vouchiqo_payment_modal_skipped", "true");
    }
  };

  const handleGoToPayment = () => {
    handleSkip();
    router.push("/merchant/billing?autoPay=true");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans text-left">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Subscription Payment Pending</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {merchant.businessName || "Merchant Partner"} • Complete payment
                to activate your plan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Selected Plan: {planName}
              </span>
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-black animate-pulse">
                Payment Pending
              </Badge>
            </div>
            <p className="text-xs text-blue-800 font-normal leading-relaxed">
              You selected the <strong>{planName}</strong> plan during
              onboarding. Complete your subscription payment now to unlock full
              listings, campaigns, and expired offer revivals.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">
              Unlocked Capabilities:
            </span>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Active Store Listings &amp; Campaign Wizard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Expired Offer Revivals &amp; Target Push Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Founding Partner 0% Commission Rate Lock</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer px-3 py-2 rounded-xl"
            >
              Skip
            </button>
            <Button
              type="button"
              onClick={handleGoToPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span>Complete Payment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
