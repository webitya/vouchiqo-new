"use client";

import { Image as ImageIcon, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

function FieldLabel({ icon: Icon, children, hint }) {
  return (
    <Label className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
      <span>{children}</span>
      {hint && (
        <span className="text-[10px] font-medium text-brand-subtext normal-case tracking-normal">
          ({hint})
        </span>
      )}
    </Label>
  );
}

export default function ImageUploader({
  formData,
  handleImageUpload,
  uploadingLogo,
  uploadingBanner,
}) {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 text-left">
        Profile Images
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 text-center md:text-left flex flex-col">
          <FieldLabel icon={ImageIcon}>Store Logo</FieldLabel>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 overflow-hidden">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Store Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-2" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingLogo ? "Uploading..." : "Upload 1:1 Image"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "logo")}
              disabled={uploadingLogo}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2 flex flex-col">
          <FieldLabel icon={ImageIcon} hint="1200x300px">
            Cover Banner
          </FieldLabel>
          <div className="relative group flex flex-col items-center justify-center border border-dashed border-brand-border rounded-lg p-5 bg-brand-surface hover:bg-brand-surface/75 cursor-pointer h-28 overflow-hidden">
            {formData.banner ? (
              <img
                src={formData.banner}
                alt="Cover Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-subtext group-hover:text-brand-blue transition-colors mb-1" />
                <span className="text-[10px] text-brand-subtext font-semibold">
                  {uploadingBanner
                    ? "Uploading..."
                    : "Upload high-res banner (1200x300px)"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "banner")}
              disabled={uploadingBanner}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
