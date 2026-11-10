import { AlignLeft, Flag, Layers, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FieldLabel = ({ icon: Icon, children }) => (
  <Label className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5 text-brand-blue" />
    {children}
  </Label>
);

export default function StepDetails({ data, updateField }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
        Campaign Details
      </h4>

      {/* Campaign Name */}
      <div className="space-y-1.5">
        <FieldLabel icon={Tag}>Campaign Name / Title</FieldLabel>
        <Input
          type="text"
          placeholder="e.g. Ranchi Diwali Mega Blast"
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campaign Type */}
        <div className="space-y-1.5">
          <FieldLabel icon={Layers}>Campaign Theme/Type</FieldLabel>
          <select
            value={data.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none text-brand-text font-bold"
          >
            <option value="flash">⚡ Flash Sale Campaign</option>
            <option value="festival">🎉 Festival / Holiday Event</option>
            <option value="seasonal">🍂 Seasonal Clearance</option>
            <option value="new-user">👥 New Customer Drive</option>
            <option value="custom">⚙️ Custom Campaign</option>
          </select>
        </div>

        {/* Campaign Objective */}
        <div className="space-y-1.5">
          <FieldLabel icon={Flag}>Campaign Goal / Objective</FieldLabel>
          <Input
            type="text"
            placeholder="e.g. Drive checkout volume, acquire new clients"
            value={data.objective}
            onChange={(e) => updateField("objective", e.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full h-10 px-3 shadow-none"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <FieldLabel icon={AlignLeft}>Brief Description</FieldLabel>
        <Textarea
          placeholder="Enter description explaining the deals and discounts offered..."
          value={data.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className="bg-brand-surface border border-brand-border rounded-lg text-xs w-full min-h-[80px]"
        />
      </div>
    </div>
  );
}
