"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * SuccessHero — Compact hero banner using black, blue, and white theme.
 */
export default function SuccessHero({
  applicationId = "VQ-2026-89421",
  estimatedCompletion = "Within 2-4 hours",
  businessName = "",
}) {
  return (
    <div className="rounded-xl bg-slate-900 text-white p-4 sm:p-5 shadow-xs border border-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-600 text-white text-[10px] font-normal tracking-wide px-2 py-0.5 rounded-md border-none">
                Under Compliance Review
              </Badge>

              {businessName && (
                <span className="text-xs font-normal text-slate-300">
                  • {businessName}
                </span>
              )}
            </div>

            <h1 className="text-sm font-medium text-white tracking-normal">
              Application Submitted &amp; Pending Verification
            </h1>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Your profile documents have been submitted to our compliance desk for verification.
            </p>
          </div>
        </div>

        {/* Application ID & Est Time Box */}
        <div className="shrink-0 bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 space-y-1 text-left sm:text-right">
          <div>
            <span className="text-[10px] font-normal text-slate-400 block">
              Application Reference ID
            </span>
            <span className="text-xs font-medium text-blue-400">
              #{applicationId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 sm:justify-end font-normal">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Est. Processing: <span className="text-white font-normal">{estimatedCompletion}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
