import { Check } from "lucide-react";

export default function WizardStepper({ wizardStep, setWizardStep, steps }) {
  return (
    <div className="bg-white border border-brand-border rounded-xl shadow-sm">
      {/* Stepper only, no top bar */}
      <div className="px-8 py-5 select-none">
        <div className="relative flex items-start justify-between w-full">
          {/* Background Track — positioned at circle center (top 18px = half of 36px circle) */}
          <div className="absolute inset-x-[18px] top-[18px] -translate-y-1/2 h-[2px] bg-slate-200 rounded-full" />

          {/* Active fill track */}
          <div
            className="absolute top-[18px] -translate-y-1/2 h-[2px] bg-brand-blue rounded-full transition-all duration-500 ease-in-out"
            style={{
              left: "18px",
              width: `calc(${((wizardStep - 1) / 3) * 100}% - ${((wizardStep - 1) / 3) * 36}px)`,
            }}
          />

          {/* Steps */}
          {steps.map(({ step, label, icon: Icon }) => {
            const isCompleted = wizardStep > step;
            const isActive = wizardStep === step;

            return (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                {/* Circle */}
                <button
                  type="button"
                  onClick={() => {
                    if (step < wizardStep) setWizardStep(step);
                  }}
                  disabled={step > wizardStep}
                  title={label}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-brand-success border-brand-success text-white hover:bg-blue-600 hover:border-blue-600 cursor-pointer"
                      : isActive
                        ? "bg-white border-brand-blue text-brand-blue ring-4 ring-brand-blue/15 scale-110"
                        : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-brand-blue" : "text-slate-400"}`}
                    />
                  )}
                </button>

                {/* Label */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? "text-brand-blue"
                      : isCompleted
                        ? "text-brand-success"
                        : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
