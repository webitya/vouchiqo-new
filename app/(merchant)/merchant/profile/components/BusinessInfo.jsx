"use client";

import {
  AlignLeft,
  Building2,
  FileText,
  Link2,
  Store,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function FieldLabel({ icon: Icon, children, hint }) {
  return (
    <Label className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5 mb-1.5">
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

export default function BusinessInfo({
  formData,
  setFormData,
  handleBusinessNameChange,
  couponCategories,
}) {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <Store className="w-4 h-4 text-brand-blue" />
        <span>Business Information</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1">
          <FieldLabel icon={Building2}>Company/Brand Name</FieldLabel>
          <Input
            type="text"
            value={formData.businessName}
            onChange={handleBusinessNameChange}
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
            required
          />
        </div>

        <div className="space-y-1">
          <FieldLabel icon={Link2} hint="Read-Only">
            Slug
          </FieldLabel>
          <Input
            type="text"
            value={formData.slug}
            className="bg-brand-surface/50 border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none opacity-70 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="space-y-1">
          <FieldLabel icon={Tag}>Market Category</FieldLabel>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="w-full bg-brand-surface border border-brand-border text-xs rounded-lg h-10 px-3 shadow-none focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-brand-border">
              {Array.isArray(couponCategories) &&
                couponCategories.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-xs font-semibold capitalize"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <FieldLabel icon={Store}>Business Type</FieldLabel>
          <div className="flex gap-4 items-center h-10 px-1">
            {["online", "physical", "both"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-xs font-semibold cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  name="businessType"
                  value={type}
                  checked={formData.businessType === type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessType: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-brand-blue cursor-pointer"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FieldLabel
            icon={AlignLeft}
            hint="For card snippets, max 300 characters"
          >
            Short Store Description
          </FieldLabel>
          <Input
            type="text"
            maxLength={300}
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({
                ...formData,
                shortDescription: e.target.value,
              })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FieldLabel icon={FileText} hint="Max 1000 characters">
            Detailed Store Bio / Description
          </FieldLabel>
          <Textarea
            value={formData.longDescription}
            maxLength={1000}
            onChange={(e) =>
              setFormData({
                ...formData,
                longDescription: e.target.value,
              })
            }
            rows={4}
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[100px] p-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>
      </div>
    </div>
  );
}
