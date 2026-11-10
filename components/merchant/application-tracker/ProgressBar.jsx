"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ProgressBar — compact progress bar using black, blue, and white theme.
 */
export default function ProgressBar({
  percentage = 66,
  status = "under_review",
}) {
  const isError = status === "rejected";
  const isComplete = percentage >= 100;

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl p-4 shadow-xs space-y-2 font-sans text-left">
      <div className="flex items-center justify-between text-xs font-normal text-slate-800">
        <span className="flex items-center gap-2">
          <span>Overall Verification Progress</span>
          {isComplete && (
            <span className="text-[10px] bg-blue-50 text-blue-700 font-normal px-2 py-0.5 rounded-full border border-blue-200">
              Verified
            </span>
          )}
        </span>
        <span
          className={cn(
            "font-medium text-xs",
            isError ? "text-red-600" : isComplete ? "text-blue-600" : "text-blue-600",
          )}
        >
          {percentage}% Completed
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80 relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isError ? "bg-red-500" : "bg-blue-600",
          )}
          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-normal text-slate-400 pt-0.5">
        <span>Step 1: Submitted (33%)</span>
        <span>Step 2: Verification (66%)</span>
        <span>Step 3: Account Active (100%)</span>
      </div>
    </Card>
  );
}
