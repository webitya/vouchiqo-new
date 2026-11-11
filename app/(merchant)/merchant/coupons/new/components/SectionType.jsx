"use client";

import { ArrowRight, Gift, Link2, Ticket } from "lucide-react";
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
  },
  {
    id: "deal",
    name: "Deal / Direct Link",
    icon: Link2,
    desc: "No code required. Clicking the deal opens your pre-discounted page directly.",
    bestFor:
      "Best for: E-commerce sites, product sales pages, online bookings.",
  },
  {
    id: "special",
    name: "Special Offer / Gift",
    icon: Gift,
    desc: "Non-standard format: BOGO, free gift with purchase, free service upgrade, bundle deals.",
    bestFor:
      "Best for: BOGO meals, free treatments, gym trials, package deals.",
  },
];

export default function SectionType({ control, setValue, watch, onNext }) {
  const selectedOfferType = useWatch({ control, name: "offerType" }) ?? "code";

  const handleSelect = (id) => {
    setValue("offerType", id, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card className="border-slate-200 shadow-xs rounded-xl bg-white p-3 sm:p-3.5 space-y-3 text-left font-sans">
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-heading font-semibold text-slate-900">
            Section 1: Select Offer Type &amp; Model
          </h3>
          <p className="text-[11px] text-slate-500 font-normal">
            Choose how customers redeem this offer in-store or online
          </p>
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
                "p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 outline-none select-none",
                isSelected
                  ? "border-[#007F79] bg-[#007F79]/5 ring-1 ring-[#007F79]/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#007F79] text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-medium text-slate-900">
                    {type.name}
                  </span>
                </div>

                {/* Selection Radio Indicator */}
                <div className="flex items-center">
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-[#007F79] bg-white"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#007F79]" />
                    )}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-normal leading-relaxed pl-9">
                {type.desc}
              </p>
              <span className="text-[10px] text-slate-400 font-normal block pl-9">
                {type.bestFor}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <Button
          onClick={onNext}
          className="bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Next: Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
