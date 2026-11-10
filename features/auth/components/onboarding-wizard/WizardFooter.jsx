"use client";

import React from "react";
import { CheckCheck, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WizardFooter({
  currentStep,
  isSubmitting,
  onPrev,
  onNext,
  onSubmit,
  allCommitmentsChecked,
  allPoliciesChecked,
  onToggleCommitmentsOnly,
  onTogglePoliciesOnly,
  onDownloadAllDocuments,
  isDownloadingAll,
  downloadProgress,
}) {
  return (
    <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl p-3 flex items-center justify-between transition-all">
      <div>
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg h-9 px-4 cursor-pointer border border-slate-200/90 shadow-2xs flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        ) : (
          <span className="text-xs font-medium text-slate-500 pl-1">
            Step 1 of 6 • Business Details
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">
          Section {currentStep} of 6
        </span>
        {currentStep === 6 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Separate Button 1: Accept All Acknowledgements */}
            <Button
              type="button"
              variant="outline"
              onClick={onToggleCommitmentsOnly}
              className={`text-xs font-semibold h-9 px-2.5 sm:px-3 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                allCommitmentsChecked
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold"
                  : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
              }`}
              title="Accept All Acknowledgements (Merchant Commitments)"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {allCommitmentsChecked
                  ? "✓ Ack. Accepted"
                  : "Accept All Ack."}
              </span>
              <span className="md:hidden">
                {allCommitmentsChecked ? "✓ Ack. Accepted" : "Accept Ack."}
              </span>
            </Button>

            {/* Separate Button 2: Accept All Documents */}
            <Button
              type="button"
              variant="outline"
              onClick={onTogglePoliciesOnly}
              className={`text-xs font-semibold h-9 px-2.5 sm:px-3 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                allPoliciesChecked
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold"
                  : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
              }`}
              title="Accept All Legal Policy Documents"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {allPoliciesChecked
                  ? "✓ Docs Accepted"
                  : "Accept All Docs"}
              </span>
              <span className="md:hidden">
                {allPoliciesChecked ? "✓ Docs Accepted" : "Accept Docs"}
              </span>
            </Button>

            {/* Separate Button 3: Download All Documents */}
            <Button
              type="button"
              variant="outline"
              disabled={isDownloadingAll}
              onClick={onDownloadAllDocuments}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 text-xs font-semibold h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download All 5 Policy Documents"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden md:inline">
                {isDownloadingAll
                  ? `Downloading ${downloadProgress}`
                  : "Download All"}
              </span>
              <span className="md:hidden">
                {isDownloadingAll ? downloadProgress : "Download All"}
              </span>
            </Button>
          </div>
        )}
        {currentStep < 6 ? (
          <Button
            type="button"
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs h-9.5 px-6 rounded-lg border-0 cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs h-9.5 px-6 rounded-lg border-0 cursor-pointer shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Submit Application"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
