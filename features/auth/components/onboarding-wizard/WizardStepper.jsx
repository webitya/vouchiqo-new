"use client";

import { Check, ShieldCheck } from "lucide-react";

export default function WizardStepper({ currentStep, MASTER_STEPS }) {
  const getMasterStepIndex = (step) => {
    if (step <= 2) return 1;
    if (step <= 4) return 2;
    return 3;
  };
  const activeMasterStep = getMasterStepIndex(currentStep);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#e85d04]" />
          <h2 className="text-base font-black tracking-wide text-white font-heading uppercase">
            Merchant Partner Application
          </h2>
        </div>
        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
          Founding Merchant Program Active (0% Commission for 14 Days)
        </span>
      </div>

      {/* Master 3-Step Stepper */}
      <div className="flex items-center justify-between gap-2 pt-2">
        {MASTER_STEPS.map((mStep, idx) => {
          const isCompleted = activeMasterStep > mStep.num;
          const isActive = activeMasterStep === mStep.num;
          return (
            <div key={mStep.num} className="flex-1 flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-slate-950 font-extrabold"
                    : isActive
                      ? "bg-[#e85d04] text-white shadow-xs"
                      : "bg-slate-800 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  mStep.num
                )}
              </div>
              <div className="space-y-0.5 hidden sm:block">
                <p
                  className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-400"}`}
                >
                  Step {mStep.num}: {mStep.title}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {mStep.sub}
                </p>
              </div>
              {idx < MASTER_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-slate-800"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
