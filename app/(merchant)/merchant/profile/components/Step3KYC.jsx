"use client";

import {
  CheckCircle2,
  FileCheck,
  FileImage,
  FileText,
  Loader2,
  Shield,
  Upload,
} from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const DOC_TYPES = [
  {
    value: "GST Registration Certificate",
    label: "GST Registration Certificate (Preferred)",
  },
  {
    value: "Udyam / MSME Certificate",
    label: "Udyam / MSME Registration Certificate",
  },
  { value: "Trade Licence", label: "Trade Licence (Municipal Corporation)" },
  {
    value: "Shop & Establishment Act",
    label: "Shop & Establishment Act Registration",
  },
];

export default function Step3KYC({
  setValue,
  watch,
  errors,
  handleImageUpload,
  uploadingDoc,
}) {
  const docType = watch("docType") || "GST Registration Certificate";
  const docImage = watch("docImage");

  const selectedDocLabel =
    DOC_TYPES.find((d) => d.value === docType)?.label ||
    docType ||
    "Primary Identity Document";

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>3. Financial Accounting &amp; Statutory KYC</span>
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-purple-50 text-purple-700 border-purple-200"
        >
          Step 3 of 3
        </Badge>
      </div>

      <div className="space-y-4">
        <FormSelect
          label="Primary Identity Document Type (Optional)"
          icon={FileCheck}
          options={DOC_TYPES}
          value={docType}
          onValueChange={(val) =>
            setValue("docType", val, { shouldValidate: true })
          }
          error={errors.docType}
        />

        {/* PRIMARY DOCUMENT IMAGE UPLOAD */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-purple-600" />
            Upload Document Image ({docType}) — Optional
          </span>

          <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/30 hover:bg-purple-50/70 transition-all cursor-pointer min-h-[120px] overflow-hidden text-center">
            {docImage ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={docImage}
                  alt={selectedDocLabel}
                  className="max-h-36 max-w-full object-contain rounded-lg border border-purple-200 shadow-2xs"
                />
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Document Image Attached</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium underline">
                  Click to replace or update document image
                </span>
              </div>
            ) : (
              <div className="space-y-1 py-2">
                {uploadingDoc ? (
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-1" />
                ) : (
                  <Upload className="w-6 h-6 text-purple-500 group-hover:text-purple-700 transition-colors mx-auto mb-1" />
                )}
                <span className="text-xs text-slate-800 font-bold block">
                  {uploadingDoc
                    ? "Uploading Document..."
                    : `Click to Upload ${docType}`}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Supports JPG, PNG, WEBP formats up to 10MB
                </span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "docImage")}
              disabled={uploadingDoc}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
