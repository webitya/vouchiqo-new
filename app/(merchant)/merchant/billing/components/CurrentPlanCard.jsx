"use client";

import { CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CurrentPlanCard({
  merchant,
  currentPlanId,
  plans,
  billingCycle,
  planExpiry,
  revivalCredits,
  activeListingsCount,
  planListingsLimit,
  campaignsUsedCount,
  planCampaignsLimit,
  onOpenUpgrade,
}) {
  const isPaused = merchant?.subscriptionStatus === "paused";
  const isCancelled = merchant?.subscriptionStatus === "cancelled";

  const isStarter =
    !currentPlanId ||
    currentPlanId === "starter" ||
    merchant?.plan === "starter" ||
    String(merchant?.plan || "").toLowerCase().includes("starter") ||
    String(merchant?.plan || "").toLowerCase().includes("free");

  const isPaymentCompleted =
    isStarter ||
    (!isPaused &&
      !isCancelled &&
      (merchant?.paymentStatus === "completed" ||
        merchant?.subscriptionStatus === "active" ||
        (merchant?.planExpiry && new Date(merchant.planExpiry).getTime() > Date.now())));
  const currentPlanObj =
    plans.find((p) => p.id === currentPlanId) ||
    plans.find((p) => p.id === "starter") ||
    plans[0];

  const expiryDate = planExpiry ? new Date(planExpiry) : null;

  const [countdownStr, setCountdownStr] = useState("");

  useEffect(() => {
    if (!expiryDate || isPaused || isCancelled || isStarter) {
      setCountdownStr("");
      return;
    }
    const updateCountdown = () => {
      const diff = expiryDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr("Plan Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(`${days}d ${hours}h ${mins}m ${secs}s remaining`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [planExpiry, isPaused, isCancelled, isStarter]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3 text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sans text-sm font-semibold text-slate-800 capitalize">
                Current Plan: {currentPlanObj?.name}
              </h3>
              {isPaused ? (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-300 font-medium text-[10px] py-0 px-2 rounded-md shadow-none"
                >
                  ⏸ Subscription Paused by Admin
                </Badge>
              ) : isCancelled ? (
                <Badge
                  variant="outline"
                  className="bg-rose-50 text-rose-800 border-rose-300 font-medium text-[10px] py-0 px-2 rounded-md shadow-none"
                >
                  ⏹ Subscription Cancelled
                </Badge>
              ) : isStarter ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium text-[10px] py-0 px-2 rounded-md flex items-center gap-1 shadow-none"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Free Forever Plan
                </Badge>
              ) : isPaymentCompleted ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium text-[10px] py-0 px-2 rounded-md flex items-center gap-1 shadow-none"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Subscription
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-200/80 font-medium text-[10px] py-0 px-2 rounded-md shadow-none"
                >
                  Payment Pending
                </Badge>
              )}

              {isPaymentCompleted && !isStarter && countdownStr && (
                <span className="bg-slate-50 text-slate-600 text-[10px] font-normal px-2 py-0.5 rounded-md border border-slate-200/60 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {countdownStr}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Billing Cycle: <span className="font-medium text-slate-700">{isStarter ? "Free Forever" : billingCycle}</span> •
              Next Renewal / Expiry:{" "}
              <span className="font-medium text-slate-700">
                {isStarter
                  ? "No Expiry (Free Forever)"
                  : planExpiry
                    ? new Date(planExpiry).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "No Expiry"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {!isPaymentCompleted ? (
            <Button
              onClick={() => onOpenUpgrade(currentPlanObj)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3.5 font-medium rounded-lg cursor-pointer border-0 flex items-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Subscription Now →
            </Button>
          ) : isStarter ? (
            <Button
              onClick={() =>
                onOpenUpgrade(plans.find((p) => p.id === "growth") || plans[1])
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3.5 font-medium rounded-lg cursor-pointer border-0 shadow-none"
            >
              Upgrade to Growth Plan →
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Opening billing details...")
                }
                className="text-xs h-8 px-3 font-medium rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-none"
              >
                Manage Billing
              </Button>
              <Button
                onClick={() =>
                  onOpenUpgrade(plans.find((p) => p.id === "pro") || plans[2])
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3.5 font-medium rounded-lg cursor-pointer border-0 shadow-none"
              >
                Upgrade Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Usage Bars: Listings, Campaigns & Revivals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-0.5">
        {/* 1. Active Listings Usage */}
        <div className="space-y-1.5 p-2.5 bg-slate-50/60 rounded-lg border border-slate-100">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>Active Listings Used</span>
            <span className="font-semibold text-slate-800">
              {activeListingsCount} /{" "}
              {planListingsLimit === 999 ? "∞" : planListingsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${planListingsLimit === 999 ? 20 : Math.min(100, (activeListingsCount / planListingsLimit) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-normal block">
            {planListingsLimit === 999
              ? "Unlimited listings available"
              : `${planListingsLimit - activeListingsCount} remaining on this plan`}
          </span>
        </div>

        {/* 2. Active Campaigns Usage */}
        <div className="space-y-1.5 p-2.5 bg-slate-50/60 rounded-lg border border-slate-100">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>Simultaneous Campaigns</span>
            <span className="font-semibold text-slate-800">
              {campaignsUsedCount} /{" "}
              {planCampaignsLimit === 0 ? "Add-on" : planCampaignsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${planCampaignsLimit === 0 ? 0 : Math.min(100, (campaignsUsedCount / planCampaignsLimit) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-normal block">
            {planCampaignsLimit === 0
              ? "Upgrade to Growth/Pro to launch campaigns"
              : `${planCampaignsLimit - campaignsUsedCount} active slot available`}
          </span>
        </div>

        {/* 3. Expired Revival Credits */}
        <div className="space-y-1.5 p-2.5 bg-slate-50/60 rounded-lg border border-slate-100">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>Revival Credits Balance</span>
            <span className="font-semibold text-slate-800">{revivalCredits} Credits</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (revivalCredits / 50) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-normal block">
            Buy Revival Pack add-on (+25 credits for ₹499)
          </span>
        </div>
      </div>
    </div>
  );
}
