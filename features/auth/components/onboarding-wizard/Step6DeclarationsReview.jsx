"use client";

import React from "react";
import {
  Check,
  CheckCheck,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Loader2,
  Upload,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldTip } from "./constants";

export default function Step6DeclarationsReview({
  formData = {},
  setFormData = () => {},
  fieldErrors = {},
  clearFieldError = () => {},
  commitmentItems = [],
  policyItems = [],
  areAllAgreementsChecked = false,
  allCommitmentsChecked = false,
  allPoliciesChecked = false,
  acceptedAgreementsCount = 0,
  totalAgreementsCount = 0,
  handleToggleAllAgreements = () => {},
  handleToggleCommitmentsOnly = () => {},
  handleTogglePoliciesOnly = () => {},
  downloadingPdfId = null,
  handleDirectDownload = () => {},
  handleDownloadAllDocuments = () => {},
  isDownloadingAll = false,
  downloadProgress = "",
  uploadingSignature = false,
  setUploadingSignature = () => {},
  handleFileUpload = () => {},
  setCurrentStep = () => {},
  getInputClass = () => "",
  getLabelClass = () => "",
  shadowInputClass = "",
}) {
  return (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section F: Declarations, Agreements &amp; Submission
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Final merchant commitments, policy agreements &amp; digital
                signature
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-medium border-slate-200 text-slate-600"
              >
                Section 6 of 6
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <div>
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Merchant Commitments &amp; Acknowledgements (
                  {commitmentItems.length})
                </Label>
                <p className="text-[11px] text-slate-500 font-normal">
                  Operational covenants and verified voucher honouring
                  guidelines
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleToggleCommitmentsOnly(!allCommitmentsChecked)
                }
                className={`text-xs font-semibold h-8 px-3 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 ${
                  allCommitmentsChecked
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold"
                    : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>
                  {allCommitmentsChecked
                    ? "✓ Ack. Accepted"
                    : "Accept All Ack."}
                </span>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commitmentItems.map((c, idx) => {
                const itemKey = c.key || `commit${idx + 1}`;
                const isChecked =
                  !!formData[itemKey] || !!formData.commitmentsAccepted?.[c.id];
                const hasError = fieldErrors[itemKey];

                return (
                  <label
                    key={c.id || itemKey}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer select-none transition-all shadow-2xs ${
                      hasError
                        ? "bg-rose-50/40 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.12)]"
                        : "bg-slate-50 border border-slate-200/80 hover:bg-white"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          [itemKey]: !!val,
                          commitmentsAccepted: {
                            ...(prev.commitmentsAccepted || {}),
                            [c.id || itemKey]: !!val,
                          },
                        }));
                        clearFieldError(itemKey);
                      }}
                      className={hasError ? "border-rose-500 mt-0.5" : "mt-0.5"}
                    />
                    <span className="font-normal text-slate-800">
                      {c.text}{" "}
                      {c.required !== false && (
                        <span className="text-rose-500 font-bold">*</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                <div>
                  <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Legal Policy Agreements ({policyItems.length})
                  </Label>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Statutory terms, merchant agreement &amp; dispute policies
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDownloadingAll}
                    onClick={handleDownloadAllDocuments}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    {isDownloadingAll ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>
                      {isDownloadingAll
                        ? `Downloading All ${downloadProgress}...`
                        : "Download All"}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTogglePoliciesOnly(!allPoliciesChecked)
                    }
                    className={`text-xs font-semibold h-8 px-3 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      allPoliciesChecked
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold"
                        : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>
                      {allPoliciesChecked
                        ? "✓ Docs Accepted"
                        : "Accept All Docs"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {policyItems.map((p, idx) => {
                  const itemKey = p.key || `policy${idx + 1}`;
                  const isChecked =
                    !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
                  const hasError = fieldErrors[itemKey];

                  const directDlUrl = (u) => {
                    if (!u || !u.trim()) return "";
                    const trimmed = u.trim();
                    const m =
                      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      trimmed.match(/id=([a-zA-Z0-9_-]+)/);
                    if (m && m[1]) {
                      return `https://drive.google.com/uc?export=download&id=${m[1]}`;
                    }
                    return /^https?:\/\//i.test(trimmed)
                      ? trimmed
                      : `https://${trimmed}`;
                  };

                  return (
                    <div
                      key={p.id || itemKey}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg transition-all shadow-2xs ${
                        hasError
                          ? "bg-rose-50/40 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.12)]"
                          : "bg-slate-50 border border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(val) => {
                            setFormData((prev) => ({
                              ...prev,
                              [itemKey]: !!val,
                              policiesAccepted: {
                                ...(prev.policiesAccepted || {}),
                                [p.id || itemKey]: !!val,
                              },
                            }));
                            clearFieldError(itemKey);
                          }}
                          className={hasError ? "border-rose-500" : ""}
                        />
                        <span className="truncate">{p.title || p.text}</span>
                        {p.required !== false && (
                          <span className="text-rose-500 font-bold">*</span>
                        )}
                      </label>

                      {p.link && (
                        <button
                          type="button"
                          disabled={downloadingPdfId === (p.id || itemKey)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectDownload(
                              p.link,
                              p.title || p.text,
                              p.id || itemKey,
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-75"
                        >
                          <FileText className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>
                            {downloadingPdfId === (p.id || itemKey)
                              ? "Downloading..."
                              : "PDF"}
                          </span>
                          {downloadingPdfId === (p.id || itemKey) ? (
                            <Loader2 className="w-2.5 h-2.5 text-blue-600 animate-spin shrink-0" />
                          ) : (
                            <Download className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signatory Full Name */}
            <div className="pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Authorised Signatory Full Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    readOnly
                    value={
                      formData.contactName ||
                      formData.signatoryName ||
                      "Fill Authorized Liaison Name in Section B"
                    }
                    className="pl-8 bg-slate-100 border border-slate-200/90 shadow-2xs text-xs h-9 rounded-lg font-medium text-slate-800 cursor-not-allowed"
                  />
                </div>
                <FieldTip text="Auto-synced from Authorized Liaison Name (Section B)." />
              </div>
            </div>
          </div>
        </Card>
  );
}
