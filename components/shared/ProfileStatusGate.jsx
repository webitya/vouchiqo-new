"use client";

import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

/**
 * Status gate shown when a merchant can't yet manage coupons because their
 * business profile is missing or awaiting admin approval.
 *
 * Replaces the ~50-line "missing profile" / "pending approval" CTA blocks
 * duplicated in coupons/page.js and coupons/new/page.js.
 *
 * @param {string} status - one of "missing" | "pending" | "approved" | etc.
 * @returns {JSX.Element|null} - renders the gate, or null when approved
 */
export default function ProfileStatusGate({ status }) {
  // Approved — render nothing; the caller renders the real content.
  if (status === "approved") return null;

  const isMissing = status === "missing";

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-8 max-w-xl mx-auto text-center space-y-5 shadow-sm my-10 text-left">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
          isMissing
            ? "bg-amber-50 text-amber-500 border-amber-100"
            : "bg-blue-50 text-brand-blue border-blue-100"
        }`}
      >
        {isMissing ? (
          <AlertTriangle className="w-6 h-6" />
        ) : (
          <Clock className="w-6 h-6" />
        )}
      </div>

      <div className="space-y-2 text-center">
        <h3 className="font-heading text-base font-extrabold text-brand-navy uppercase tracking-wider">
          {isMissing
            ? "Setup Your Business Profile"
            : "Profile Pending Approval"}
        </h3>
        <p className="text-xs text-brand-subtext font-semibold leading-relaxed max-w-md mx-auto">
          {isMissing
            ? "You haven't completed your merchant business profile yet. To start creating discount coupons and listing promotional offers, please fill in your business information."
            : "Your business profile is currently awaiting administrator review. Once verified and approved by the Vouchiqo admin team, you will be able to create and manage active campaigns."}
        </p>
      </div>

      <div className="text-center">
        {isMissing ? (
          <Link
            href="/merchant/profile"
            className="btn-primary text-xs font-bold py-2.5 px-6 inline-flex items-center gap-1.5 border-0 rounded-lg shadow-none cursor-pointer"
            style={{ textDecoration: "none" }}
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="text-[11px] font-bold text-brand-blue bg-brand-surface py-1.5 px-4 rounded-full inline-block border border-brand-border capitalize">
            Current Status: {status}
          </div>
        )}
      </div>
    </div>
  );
}
