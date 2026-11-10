"use client";

import { CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Manual location selection modal.
 */
export default function LocationModal({
  onClose,
  manualForm,
  setManualForm,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 animate-fade-in-scale">
      <form
        onSubmit={onSubmit}
        className="bg-brand-bg border border-brand-border rounded-2xl max-w-sm w-full p-6 text-left space-y-4 shadow-2xl"
      >
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <h3 className="font-heading text-base font-black text-brand-navy flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#2563eb]" />
            <span>Select Manual Location</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-brand-navy cursor-pointer bg-transparent border-none text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-brand-subtext">Country</label>
            <Input
              value="India"
              disabled
              className="bg-brand-surface/50 cursor-not-allowed border-brand-border text-brand-text h-9"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-brand-subtext">State *</label>
            <Select
              value={manualForm.state}
              onValueChange={(val) =>
                setManualForm({ ...manualForm, state: val })
              }
            >
              <SelectTrigger className="h-9 border-brand-border bg-brand-surface text-brand-text cursor-pointer">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                {[
                  "Jharkhand",
                  "Bihar",
                  "Delhi",
                  "Maharashtra",
                  "Karnataka",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-brand-subtext">City *</label>
            <Select
              value={manualForm.city}
              onValueChange={(val) =>
                setManualForm({ ...manualForm, city: val })
              }
            >
              <SelectTrigger className="h-9 border-brand-border bg-brand-surface text-brand-text cursor-pointer">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border-brand-border text-brand-text">
                {[
                  "Ranchi",
                  "Jamshedpur",
                  "Patna",
                  "Arrah",
                  "Delhi",
                  "Mumbai",
                  "Bangalore",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-brand-subtext">
              Area / Pincode
            </label>
            <Input
              placeholder="e.g. Lalpur or 834001"
              value={manualForm.area}
              onChange={(e) =>
                setManualForm({ ...manualForm, area: e.target.value })
              }
              className="border-brand-border bg-brand-surface text-brand-text h-9"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="btn-primary w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none flex justify-center items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Explore Nearby</span>
        </Button>
      </form>
    </div>
  );
}
