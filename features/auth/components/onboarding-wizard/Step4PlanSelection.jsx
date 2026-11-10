"use client";

import React from "react";
import { Check, ExternalLink, FileText, Loader2, Hash, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldTip } from "./constants";

export default function Step4PlanSelection({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  merchantPlans,
  plansFromDb,
  handleDirectDownload,
  shadowInputClass,
}) {
  return (
    <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
      <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Section D: Select Subscription Plan
          </h3>
          <p className="text-xs text-emerald-700 font-medium">
            Select your plan below — No payment is initiated today during
            registration (14-day instant free trial on paid plans)
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold border-emerald-300 bg-emerald-50 text-emerald-800"
        >
          No Payment Required Today
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {merchantPlans
          .filter((p) => p.active !== false)
          .map((plan) => {
            const isSelected = formData.selectedPlan === plan.id;

            let bgTheme =
              "bg-sky-50/60 border-sky-200/90 hover:border-sky-300";
            let badgeTheme = "bg-sky-100 text-sky-800 border-sky-200";
            let btnTheme =
              "bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-50";

            if (plan.theme === "orange" || plan.id === "growth") {
              bgTheme =
                "bg-amber-50/60 border-amber-200/90 hover:border-amber-300";
              badgeTheme = "bg-amber-100 text-amber-800 border-amber-200";
              btnTheme =
                "bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-xs";
            } else if (plan.theme === "emerald" || plan.id === "pro") {
              bgTheme =
                "bg-emerald-50/60 border-emerald-200/90 hover:border-emerald-300";
              badgeTheme =
                "bg-emerald-100 text-emerald-800 border-emerald-200";
              btnTheme =
                "bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-xs";
            } else if (
              plan.theme === "indigo" ||
              plan.id === "enterprise"
            ) {
              bgTheme =
                "bg-indigo-50/60 border-indigo-200/90 hover:border-indigo-300";
              badgeTheme =
                "bg-indigo-100 text-indigo-800 border-indigo-200";
              btnTheme =
                "bg-white text-indigo-700 border-2 border-indigo-300 hover:bg-indigo-50";
            }

            return (
              <div
                key={plan.id}
                onClick={() =>
                  setFormData({ ...formData, selectedPlan: plan.id })
                }
                className={`p-4 sm:p-5 rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/20 bg-white scale-[1.01]"
                    : `border ${bgTheme} shadow-2xs`
                }`}
              >
                <div className="space-y-3">
                  {/* Plan Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          {plan.name}
                        </h4>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {plan.priceText ||
                            (typeof plan.priceMonthly === "number"
                              ? plan.priceMonthly === 0
                                ? "₹0"
                                : `₹${plan.priceMonthly.toLocaleString("en-IN")}`
                              : "Custom pricing")}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-xs line-through text-slate-400 font-medium">
                            {plan.originalPrice}
                          </span>
                        )}
                        {plan.priceSuffix && (
                          <span className="text-xs font-normal text-slate-500">
                            {plan.priceSuffix}
                          </span>
                        )}
                      </div>
                      {plan.subCaption && (
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                          {plan.subCaption}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isSelected ? (
                        <Badge className="bg-blue-600 text-white font-bold text-[9.5px] px-2.5 py-0.5 shadow-sm border-0 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                        </Badge>
                      ) : plan.badge ? (
                        <Badge
                          variant="outline"
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${badgeTheme}`}
                        >
                          {plan.badge}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 pt-2 border-t border-slate-200/60">
                      {plan.features.map((feat, fIdx) => {
                        const isObj = typeof feat === "object" && feat !== null;
                        let isIncluded = isObj ? feat.included !== false : true;
                        let text = isObj ? (feat.text || "") : String(feat);

                        if (!isObj) {
                          const str = text.trim();
                          if (
                            str.startsWith("✗") ||
                            str.startsWith("✕") ||
                            str.startsWith("❌") ||
                            str.startsWith("[x]") ||
                            str.startsWith("No ") ||
                            str.toLowerCase().includes("(locked)")
                          ) {
                            isIncluded = false;
                            text = str.replace(/^([✓✔✗✕❌]|\[[xXvV+]\])\s*/, "").trim();
                          } else {
                            text = str.replace(/^([✓✔]|\[[vV+]\])\s*/, "").trim();
                          }
                        }

                        return (
                          <li
                            key={fIdx}
                            className="text-[11.5px] flex items-start gap-2 leading-snug"
                          >
                            {isIncluded ? (
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                <X className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                            <span
                              className={
                                isIncluded
                                  ? "text-slate-700 font-normal"
                                  : "text-slate-400 font-normal line-through decoration-slate-300"
                              }
                            >
                              {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 pt-3">
                  {plan.footerNote && (
                    <p className="text-[10px] text-slate-500 font-normal italic">
                      {plan.footerNote}
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, selectedPlan: plan.id });
                    }}
                    className={`w-full h-9 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md shadow-blue-500/25"
                        : btnTheme
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Selected {plan.name}</span>
                      </>
                    ) : (
                      <span>{plan.buttonText || "Select Plan"}</span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="space-y-1 max-w-sm pt-1">
        <Label className="text-xs font-medium text-slate-700">
          Referral Code (Optional)
        </Label>
        <div className="relative">
          <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="FOUNDING100"
            value={formData.referralCode}
            onChange={(e) =>
              setFormData({ ...formData, referralCode: e.target.value })
            }
            className="pl-8 bg-white border border-slate-200/90 shadow-2xs text-xs h-9 rounded-lg font-mono uppercase font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </Card>
  );
}
