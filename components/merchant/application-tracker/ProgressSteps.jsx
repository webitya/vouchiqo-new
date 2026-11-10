"use client";

import {
  CheckCircle2,
  FileSearch,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ProgressSteps — clean 3-step application tracker pipeline matching website UI.
 */
export default function ProgressSteps({
  status = "under_review",
  submittedAt,
}) {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isDocVerified = status === "document_verified" || isApproved;
  const isUnderReview = status === "under_review" || isDocVerified;

  const steps = [
    {
      id: 1,
      name: "STEP 1: APPLICATION RECEIVED",
      statusText: "Submitted & Received",
      detail: submittedAt
        ? `Submitted on ${new Date(submittedAt).toLocaleDateString()}`
        : "Application submitted",
      state: "completed",
      icon: CheckCircle2,
    },
    {
      id: 2,
      name: "STEP 2: DOCUMENT VERIFICATION",
      statusText: isRejected
        ? "Verification Failed"
        : isDocVerified
          ? "Documents Verified"
          : "Under Review by Admin",
      detail: isDocVerified
        ? "All tax & trade credentials verified"
        : "Compliance team is verifying business documents",
      state: isRejected
        ? "rejected"
        : isDocVerified
          ? "completed"
          : isUnderReview
            ? "active"
            : "pending",
      icon: isRejected ? XCircle : isDocVerified ? CheckCircle2 : FileSearch,
    },
    {
      id: 3,
      name: "STEP 3: ACCOUNT ACTIVATION",
      statusText: isApproved
        ? "Application Accepted & Active"
        : isDocVerified
          ? "Ready for Activation"
          : "Activation Pending",
      detail: isApproved
        ? "Account ready! Start posting deals & offers"
        : "Activated within 2 hours after verification",
      state: isApproved ? "completed" : isDocVerified ? "active" : "pending",
      icon: isApproved ? ShieldCheck : Lock,
    },
  ];

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl p-4 shadow-xs space-y-3 font-sans text-left">
      <h3 className="text-xs font-medium text-slate-800 tracking-normal">
        Verification Stage Progress
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComp = step.state === "completed";
          const isActive = step.state === "active";
          const isRej = step.state === "rejected";

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-lg p-3 border transition-all flex flex-col justify-between h-full space-y-2 text-left",
                isComp
                  ? "border-blue-200 bg-blue-50/30 text-slate-900"
                  : isActive
                    ? "border-blue-600 bg-blue-50/60 text-slate-900 shadow-2xs"
                    : isRej
                      ? "border-red-200 bg-red-50/40 text-slate-900"
                      : "border-slate-200/80 bg-slate-50/40 text-slate-600",
              )}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium",
                    isComp || isActive
                      ? "bg-blue-600 text-white"
                      : isRej
                        ? "bg-red-600 text-white"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={cn(
                    "text-[10px] font-normal px-2 py-0.5 rounded border",
                    isComp || isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : isRej
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-slate-100 text-slate-500 border-slate-200",
                  )}
                >
                  {isComp
                    ? "Completed"
                    : isActive
                      ? "In Progress"
                      : isRej
                        ? "Rejected"
                        : "Pending"}
                </span>
              </div>

              {/* Step info */}
              <div>
                <span className="text-[10px] font-normal text-slate-500 block">
                  {step.name}
                </span>
                <h4 className="text-xs font-medium text-slate-900 mt-0.5">
                  {step.statusText}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug font-normal">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
