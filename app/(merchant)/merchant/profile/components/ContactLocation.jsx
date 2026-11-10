"use client";

import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
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

export default function ContactLocation({ formData, setFormData }) {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3 flex items-center gap-2">
        <Globe className="w-4 h-4 text-brand-blue" />
        <span>Business Contact Channels</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Official Website */}
        <div className="space-y-1">
          <FieldLabel icon={Globe}>Official Website</FieldLabel>
          <Input
            type="url"
            placeholder="https://mysite.com"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1">
          <FieldLabel icon={Mail}>Contact Email</FieldLabel>
          <Input
            type="email"
            placeholder="partner@mystore.com"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* Business Phone */}
        <div className="space-y-1">
          <FieldLabel icon={Phone}>Business Phone (Click-to-Call)</FieldLabel>
          <Input
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>

        {/* WhatsApp Business Number */}
        <div className="space-y-1">
          <FieldLabel icon={MessageCircle}>WhatsApp Business Number</FieldLabel>
          <Input
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.whatsappNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                whatsappNumber: e.target.value,
              })
            }
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          />
        </div>
      </div>
    </div>
  );
}
