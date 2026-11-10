"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * AdminIndicator — compact live admin review indicator.
 */
export default function AdminIndicator({
  isReviewing = true,
  reviewerName = "Vouchiqo Compliance Desk #4",
  lastUpdated,
}) {
  if (!isReviewing) return null;

  return (
    <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 font-sans">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
          <Eye className="w-4 h-4 text-blue-600 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-900">
              Admin Review In Progress
            </span>
            <Badge className="bg-blue-600 text-white text-[9px] font-normal px-2 py-0.5 rounded">
              Active Audit
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-normal leading-snug">
            Our compliance desk ({reviewerName}) is actively verifying your credentials.
          </p>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs font-normal text-slate-600 sm:text-right shrink-0 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          <span className="block text-[9px] uppercase text-slate-400 font-normal">
            Last Activity
          </span>
          <span className="font-medium text-slate-800">
            {new Date(lastUpdated).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
