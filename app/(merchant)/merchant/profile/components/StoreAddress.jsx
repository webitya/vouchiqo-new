"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldLabel({ icon: Icon, children, hint }) {
  return (
    <Label className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5 mb-1.5 text-left">
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

export default function StoreAddress({ formData, setFormData }) {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-blue" />
        <span>Store Address Details</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Street Address */}
        <div className="space-y-1 sm:col-span-2">
          <FieldLabel icon={MapPin}>Street Address</FieldLabel>
          <Input
            type="text"
            placeholder="e.g. 1st Floor, Lalpur Road"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* Pincode */}
        <div className="space-y-1">
          <FieldLabel icon={MapPin}>Pincode</FieldLabel>
          <Input
            type="text"
            placeholder="834001"
            value={formData.pincode}
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* City */}
        <div className="space-y-1">
          <FieldLabel icon={MapPin}>City</FieldLabel>
          <Input
            type="text"
            placeholder="Ranchi"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* State */}
        <div className="space-y-1">
          <FieldLabel icon={MapPin}>State</FieldLabel>
          <Input
            type="text"
            placeholder="Jharkhand"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* Country */}
        <div className="space-y-1">
          <FieldLabel icon={MapPin}>Country</FieldLabel>
          <Input
            type="text"
            value={formData.country}
            disabled
            className="bg-brand-surface/50 border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none opacity-70 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
