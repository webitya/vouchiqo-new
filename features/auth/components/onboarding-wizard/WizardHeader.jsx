"use client";

import React from "react";
import { Check, Home, Store, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WizardHeader({
  currentStep,
  activeMasterStep,
  MASTER_STEPS,
  onExitClick,
  router,
}) {
  return (
    <div className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-3 sm:p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Merchant Onboarding Application
            </h1>
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
              Founding Partner
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Fill in your store details to list offers and reach Ranchi
            shoppers • Rates locked for 6 months • ₹0 Starter plan available
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Homepage</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/merchant/dashboard")}
            className="h-8 px-2.5 text-xs font-semibold text-blue-700 hover:text-blue-800 border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-100">
              Section {currentStep} of 6
            </span>
            <span className="text-[11px] font-semibold text-slate-600 px-1">
              {Math.round((currentStep / 6) * 100)}%
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onExitClick}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Close & Exit Registration"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stepper Horizontal Navigation Bar - Vibrant Colorful Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {MASTER_STEPS.map((m) => {
          const isActive = activeMasterStep === m.stepNum;
          const isCompleted = activeMasterStep > m.stepNum;

          const colorThemes = {
            1: {
              active:
                "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 border-0 ring-2 ring-blue-500/30",
              completed:
                "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
              upcoming:
                "bg-blue-50/80 border-blue-200/80 text-blue-950 hover:bg-blue-100/70 hover:border-blue-300",
              numberActive:
                "bg-white text-blue-700 font-extrabold shadow-2xs",
              numberCompleted:
                "bg-white text-emerald-700 font-extrabold shadow-2xs",
              numberUpcoming:
                "bg-blue-100/90 text-blue-700 font-bold border border-blue-200/80",
              labelActive: "text-blue-100 font-semibold",
              labelCompleted: "text-emerald-100 font-semibold",
              labelUpcoming: "text-blue-700/80 font-semibold",
            },
            2: {
              active:
                "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/25 border-0 ring-2 ring-purple-500/30",
              completed:
                "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
              upcoming:
                "bg-purple-50/80 border-purple-200/80 text-purple-950 hover:bg-purple-100/70 hover:border-purple-300",
              numberActive:
                "bg-white text-purple-700 font-extrabold shadow-2xs",
              numberCompleted:
                "bg-white text-emerald-700 font-extrabold shadow-2xs",
              numberUpcoming:
                "bg-purple-100/90 text-purple-700 font-bold border border-purple-200/80",
              labelActive: "text-purple-100 font-semibold",
              labelCompleted: "text-emerald-100 font-semibold",
              labelUpcoming: "text-purple-700/80 font-semibold",
            },
            3: {
              active:
                "bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/25 border-0 ring-2 ring-orange-500/30",
              completed:
                "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
              upcoming:
                "bg-amber-50/80 border-amber-200/80 text-amber-950 hover:bg-amber-100/70 hover:border-amber-300",
              numberActive:
                "bg-white text-orange-700 font-extrabold shadow-2xs",
              numberCompleted:
                "bg-white text-emerald-700 font-extrabold shadow-2xs",
              numberUpcoming:
                "bg-amber-100/90 text-amber-800 font-bold border border-amber-200/80",
              labelActive: "text-amber-100 font-semibold",
              labelCompleted: "text-emerald-100 font-semibold",
              labelUpcoming: "text-amber-700/80 font-semibold",
            },
          };

          const theme = colorThemes[m.stepNum] || colorThemes[1];
          const containerStyle = isActive
            ? theme.active
            : isCompleted
              ? theme.completed
              : theme.upcoming;

          const numberStyle = isActive
            ? theme.numberActive
            : isCompleted
              ? theme.numberCompleted
              : theme.numberUpcoming;

          const labelStyle = isActive
            ? theme.labelActive
            : isCompleted
              ? theme.labelCompleted
              : theme.labelUpcoming;

          return (
            <div
              key={m.stepNum}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 ${containerStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${numberStyle}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  m.stepNum
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`text-[9.5px] uppercase tracking-wider block leading-none truncate ${labelStyle}`}
                >
                  Step {m.stepNum}: {m.label}
                </span>
                <span
                  className={`text-xs font-bold block leading-tight truncate mt-0.5 ${
                    isActive || isCompleted ? "text-white" : "text-slate-800"
                  }`}
                >
                  {m.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
