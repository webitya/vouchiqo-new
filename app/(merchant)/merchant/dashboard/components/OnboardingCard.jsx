"use client";

import { ArrowUpRight, Building2, X } from "lucide-react";
import Link from "next/link";

export default function OnboardingCard({
  totalCoupons,
  onboardingDismissed,
  setOnboardingDismissed,
}) {
  if (totalCoupons === undefined || totalCoupons > 0 || onboardingDismissed)
    return null;

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4.5 text-slate-900 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md font-sans">
      {/* Subtle blue top border line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

      <button
        onClick={() => {
          setOnboardingDismissed(true);
          localStorage.setItem("onboarding_dismissed", "true");
        }}
        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 transition-colors bg-transparent border-0 cursor-pointer p-1"
        title="Dismiss Guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-200/60 shrink-0">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#08214d] tracking-tight">
              Welcome to Vouchiqo Partner Network!
            </h2>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Let's set up your store and get your first deals live to start
              saving Ranchi shoppers money.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:bg-blue-50/80 hover:border-blue-200 transition-all shadow-2xs">
            <div className="space-y-0.5">
              <div className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">
                Step 1
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Complete Business Profile
              </h4>
              <p className="text-[10px] text-slate-600 leading-snug font-medium">
                Add details, location coordinates (Marbella prioritized), logo,
                and set your business hours.
              </p>
            </div>
            <Link
              href="/merchant/profile"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1.5"
            >
              <span>Go to Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:bg-blue-50/80 hover:border-blue-200 transition-all shadow-2xs">
            <div className="space-y-0.5">
              <div className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">
                Step 2
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Verify Plan & Billing
              </h4>
              <p className="text-[10px] text-slate-600 leading-snug font-medium">
                Upgrade to Pro or Enterprise for unlocked revival limits and
                automatic coupon approvals.
              </p>
            </div>
            <Link
              href="/merchant/billing"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1.5"
            >
              <span>Upgrade Settings</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:bg-blue-50/80 hover:border-blue-200 transition-all shadow-2xs">
            <div className="space-y-0.5">
              <div className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">
                Step 3
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Post Your First Coupon
              </h4>
              <p className="text-[10px] text-slate-600 leading-snug font-medium">
                Submit your promo code, discount rules, was/now prices, and
                custom target tags.
              </p>
            </div>
            <Link
              href="/merchant/coupons/new"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1.5"
            >
              <span>Create Listing</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
