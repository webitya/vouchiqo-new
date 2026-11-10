"use client";

import { FileText, MessageSquare, Tag, Target } from "lucide-react";
import { useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function StepBasics({
  control,
  register,
  setValue,
  watch,
  errors,
  campaignTypes,
  objectives,
  isFreeMerchant,
  onCancel,
  onNext,
}) {
  const selectedType = useWatch({ control, name: "type" }) ?? "flash";
  const selectedObjective =
    useWatch({ control, name: "objective" }) ?? "Maximize Sales";
  const headlineValue = useWatch({ control, name: "headline" }) ?? "";

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans">
      <div className="border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-semibold text-slate-900">
          Step 1: Campaign Basics
        </h3>
        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
          Specify campaign name, objective, format &amp; public headline
        </p>
      </div>

      <div className="space-y-4">
        {/* Campaign Name & Campaign Type in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Campaign Name"
            icon={FileText}
            type="text"
            placeholder="e.g. Summer Sale Blast"
            required
            {...register("name")}
            error={errors.name}
          />

          <FormSelect
            label="Campaign Type"
            icon={Tag}
            options={campaignTypes.map((t) => {
              const isFlash = t.id === "flash";
              return {
                value: t.id,
                label:
                  isFreeMerchant && !isFlash
                    ? `🔒 ${t.name} (Growth Plan Only)`
                    : `${t.name} (${t.badge})`,
                disabled: isFreeMerchant && !isFlash,
              };
            })}
            required
            value={isFreeMerchant ? "flash" : selectedType}
            onValueChange={(val) => {
              if (isFreeMerchant && val !== "flash") {
                toast.error(
                  "Free merchants can only create Flash Sale campaigns. Upgrade to Growth Plan to unlock all 7 campaign types.",
                );
                return;
              }
              setValue("type", val, { shouldValidate: true });
            }}
            error={errors.type}
          />
        </div>

        {/* Target Objective & Festival Template in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Primary Campaign Objective"
            icon={Target}
            options={objectives}
            required
            value={selectedObjective}
            onValueChange={(val) =>
              setValue("objective", val, { shouldValidate: true })
            }
            error={errors.objective}
          />

          {selectedType === "festival" ? (
            <FormSelect
              label="Target Festival Template"
              icon={Tag}
              options={[
                {
                  value: "Diwali Grand Festival",
                  label: "🪔 Diwali Grand Festival (5 Days)",
                },
                {
                  value: "Holi Festive Saver",
                  label: "🎨 Holi Festive Saver (3 Days)",
                },
                {
                  value: "Durga Puja Special",
                  label: "🌺 Durga Puja Special (4 Days)",
                },
                {
                  value: "Eid Special Offers",
                  label: "🌙 Eid Special Offers (3 Days)",
                },
                {
                  value: "New Year Shopping Bash",
                  label: "🎆 New Year Shopping Bash (2 Days)",
                },
              ]}
              required
              value={watch("festivalName") || "Diwali Grand Festival"}
              onValueChange={(val) =>
                setValue("festivalName", val, { shouldValidate: true })
              }
              error={errors.festivalName}
            />
          ) : (
            <FormInput
              label="Campaign Public Headline"
              icon={FileText}
              type="text"
              maxLength={70}
              placeholder="e.g. 🔥 Flat 20% off during Summer Sale Blast"
              {...register("headline")}
              error={errors.headline}
              hint={`${headlineValue.length}/70 chars`}
            />
          )}
        </div>

        {selectedType === "festival" && (
          <FormInput
            label="Campaign Public Headline"
            icon={FileText}
            type="text"
            maxLength={70}
            placeholder="e.g. 🪔 Flat 20% off all orders during Diwali Festival"
            {...register("headline")}
            error={errors.headline}
            hint={`${headlineValue.length}/70 chars`}
          />
        )}

        {/* Description / Scope */}
        <FormTextarea
          label="Internal Campaign Notes / Scope"
          icon={MessageSquare}
          rows={3}
          placeholder="Describe the scope and plan for this promotional campaign..."
          {...register("description")}
          error={errors.description}
        />
      </div>

      {/* Step 1 Actions */}
      <div className="flex justify-between pt-3.5 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-slate-600 border-slate-200 text-xs font-medium rounded-xl h-8 sm:h-9 px-4 cursor-pointer hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 sm:h-9 px-5 rounded-xl cursor-pointer shadow-xs"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
