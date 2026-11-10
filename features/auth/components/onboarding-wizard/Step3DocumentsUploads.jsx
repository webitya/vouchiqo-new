"use client";

import React from "react";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  Loader2,
  Check,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldTip } from "./constants";

export default function Step3DocumentsUploads({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  handleFileUpload,
  uploadingDoc,
  setUploadingDoc,
  uploadingShopPhoto,
  setUploadingShopPhoto,
  uploadingLogo,
  setUploadingLogo,
  uploadingBanner,
  setUploadingBanner,
  getInputClass,
  getSelectClass,
  getLabelClass,
  shadowInputClass,
  shadowSelectClass,
}) {
  return (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section C: Business Verification Documents (Optional)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Upload identity proof now or later from your Merchant Dashboard
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-amber-200 bg-amber-50 text-amber-800"
            >
              Optional Section
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Primary Document Type & Upload Box (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Primary Identity Document Type{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Select
                  value={formData.docType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, docType: val })
                  }
                >
                  <SelectTrigger className={shadowSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    <SelectItem
                      value="GST Registration Certificate"
                      className="text-xs"
                    >
                      GST Registration Certificate (Preferred)
                    </SelectItem>
                    <SelectItem
                      value="Udyam / MSME Certificate"
                      className="text-xs"
                    >
                      Udyam / MSME Registration Certificate
                    </SelectItem>
                    <SelectItem value="Trade Licence" className="text-xs">
                      Trade Licence (Municipal Corporation)
                    </SelectItem>
                    <SelectItem
                      value="Shop & Establishment Act"
                      className="text-xs"
                    >
                      Shop &amp; Establishment Act Certificate
                    </SelectItem>
                    <SelectItem value="Owner PAN Card" className="text-xs">
                      Owner PAN Card
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldTip text="Used for official Blue Verified Merchant badge." />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Upload {formData.docType || "Identity Document"}{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="h-9 px-3 bg-white border-2 border-dashed border-blue-300/80 hover:border-blue-400 rounded-lg flex items-center justify-between gap-2 shadow-[0_2px_6px_rgba(37,99,235,0.08)] transition-all">
                  {formData.docFileUrl ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={formData.docFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline font-medium truncate"
                      >
                        Document Uploaded ✓
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-normal truncate">
                      Select document file (JPG, PNG, PDF up to 5 MB)
                    </span>
                  )}
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "docFileUrl",
                          setUploadingDoc,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingDoc}
                    />
                    <Button
                      type="button"
                      disabled={uploadingDoc}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-6 px-2.5 rounded border-0 cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      {uploadingDoc ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>{formData.docFileUrl ? "Change" : "Upload"}</span>
                    </Button>
                  </div>
                </div>
                <FieldTip text="Supports PDF, PNG, JPG up to 5 MB." />
              </div>
            </div>

            {/* 3 Store Visual Images Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* 1. Shop Photograph */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Shop Photo
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.shopPhotoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.shopPhotoUrl}
                        alt="Shop Photo"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Photo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Shop Photo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "shopPhotoUrl",
                          setUploadingShopPhoto,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingShopPhoto}
                    />
                    <Button
                      type="button"
                      disabled={uploadingShopPhoto}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingShopPhoto ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.shopPhotoUrl
                          ? "Change Photo (1200×800)"
                          : "Upload Photo (1200×800)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. Store Logo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Store Logo
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.logoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.logoUrl}
                        alt="Store Logo"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Logo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Store Logo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "logoUrl",
                          setUploadingLogo,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      disabled={uploadingLogo}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.logoUrl
                          ? "Change Logo (400×400)"
                          : "Upload Logo (400×400)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3. Banner Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Banner Image
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.bannerUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.bannerUrl}
                        alt="Banner Image"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Banner Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Banner Image
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "bannerUrl",
                          setUploadingBanner,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingBanner}
                    />
                    <Button
                      type="button"
                      disabled={uploadingBanner}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingBanner ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.bannerUrl
                          ? "Change Banner (1200×400)"
                          : "Upload Banner (1200×400)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
  );
}
