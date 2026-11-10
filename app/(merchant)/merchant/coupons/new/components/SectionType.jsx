"use client";

import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Link2,
  Tag,
  Ticket,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OFFER_TYPES = [
  {
    id: "code",
    name: "Offer with Code",
    icon: Ticket,
    desc: "Customer copies code for online checkout or presents a Smart Code at counter in-store.",
    bestFor:
      "Best for: Restaurants, salons, retail stores, or online checkouts.",
    badgeBg: "bg-rose-50 text-[#F72853]",
    activeColor:
      "border-[#F72853] bg-rose-50/40 text-slate-900 ring-2 ring-[#F72853]/20 shadow-xs",
  },
  {
    id: "deal",
    name: "Deal / Direct Link",
    icon: Link2,
    desc: "No code required. Clicking the deal opens your pre-discounted page directly.",
    bestFor:
      "Best for: E-commerce sites, product sales pages, online bookings.",
    badgeBg: "bg-emerald-50 text-emerald-700",
    activeColor:
      "border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs",
  },
  {
    id: "special",
    name: "Special Offer / Gift",
    icon: Gift,
    desc: "Non-standard format: BOGO, free gift with purchase, free service upgrade, bundle deals.",
    bestFor:
      "Best for: BOGO meals, free treatments, gym trials, package deals.",
    badgeBg: "bg-purple-50 text-purple-700",
    activeColor:
      "border-purple-600 bg-purple-50/40 text-purple-950 ring-2 ring-purple-500/20 shadow-xs",
  },
];

export default function SectionType({ control, setValue, watch, onNext }) {
  const selectedOfferType = useWatch({ control, name: "offerType" }) ?? "code";

  const handleSelect = (id) => {
    setValue("offerType", id, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card className="border-slate-200/90 shadow-2xs rounded-xl bg-white p-3.5 sm:p-4 space-y-3.5 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#F72853]" />

      <div className="border-b border-slate-100 pb-2.5 pt-0.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] shrink-0">
            <Tag className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-slate-800 tracking-tight">
              Section 1: Select Offer Type &amp; Model
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Choose how customers redeem this offer with clear guide
              instructions
            </p>
          </div>
        </div>
      </div>

      <div
        className="space-y-2"
        role="radiogroup"
        aria-label="Select Offer Type"
      >
        {OFFER_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedOfferType === type.id;
          return (
            <div
              key={type.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(type.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(type.id);
                }
              }}
              className={cn(
                "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 relative group outline-none select-none",
                isSelected
                  ? type.activeColor
                  : "border-slate-200/80 bg-white hover:border-rose-200 hover:bg-rose-50/10",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 transition-colors",
                      type.badgeBg,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-medium text-slate-900">
                    {type.name}
                  </span>
                </div>

                {/* Selection Indicator */}
                <div className="flex items-center gap-1">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#F72853] bg-white border border-rose-200 px-2 py-0.5 rounded-full shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-[#F72853] fill-rose-50 stroke-[#F72853]" />
                      Selected
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-rose-400 transition-colors" />
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-normal leading-relaxed pl-8">
                {type.desc}
              </p>
              <span className="text-[10px] text-slate-400 font-normal block pl-8">
                {type.bestFor}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2.5 border-t border-slate-100">
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Next: Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
