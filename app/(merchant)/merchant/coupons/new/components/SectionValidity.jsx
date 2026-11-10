"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PER_CUSTOMER_LIMITS = [
  { value: "1", label: "1 time per customer" },
  { value: "2", label: "2 times per customer" },
  { value: "unlimited", label: "Unlimited per customer" },
];

const TARGET_AUDIENCES = [
  { value: "All Customers (Default)", label: "All Customers (Default)" },
  { value: "New Customers Only", label: "New Customers Only" },
  { value: "Returning Customers Only", label: "Returning Customers Only" },
  { value: "Specific Demographic", label: "Specific Demographic" },
];

const GEOGRAPHIC_RESTRICTIONS = [
  {
    value: "All India (Online Delivery)",
    label: "All India (Online Delivery)",
  },
  {
    value: "Ranchi only — in-store at my listed address",
    label: "Ranchi only (In-Store)",
  },
  { value: "Jharkhand only (Regional)", label: "Jharkhand only (Regional)" },
  { value: "Multiple Cities", label: "Multiple Select Cities" },
];

export default function SectionValidity({
  control,
  register,
  setValue,
  watch,
  errors,
  toggleDay,
  onBack,
  onNext,
}) {
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const perCustomerLimit = useWatch({ control, name: "perCustomerLimit" });
  const targetAudience = useWatch({ control, name: "targetAudience" });
  const geographicRestriction = useWatch({
    control,
    name: "geographicRestriction",
  });
  const rawValidDays = useWatch({ control, name: "validDays" });
  const validDays = Array.isArray(rawValidDays) ? rawValidDays : [];

  return (
    <Card className="border-slate-200/90 shadow-2xs rounded-xl bg-white p-3.5 sm:p-4 space-y-3.5 text-left font-sans relative overflow-hidden">
      {/* Top Light Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#F72853]" />

      <div className="border-b border-slate-100 pb-2.5 pt-0.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-slate-800 tracking-tight">
              Section 4: Validity, Limits &amp; Target Restrictions
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Dates, redemption caps, target demographic &amp; location rules
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Start Date & End Date Pickers in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Start Date
              <span className="text-red-500 font-medium ml-0.5">*</span>
            </Label>
            <DatePicker
              value={startDate}
              onChange={(val) =>
                setValue("startDate", val, { shouldValidate: true })
              }
              placeholder="Select start date"
              iconColor="text-[#F72853]"
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-rose-500" /> End Date
              <span className="text-red-500 font-medium ml-0.5">*</span>
            </Label>
            <DatePicker
              value={endDate}
              onChange={(val) =>
                setValue("endDate", val, { shouldValidate: true })
              }
              placeholder="Select end date"
              iconColor="text-rose-500"
            />
            {errors.endDate && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Usage Limits in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormInput
            label="Total Usage Limit"
            icon={Users}
            type="number"
            placeholder="e.g. 100 total redemptions"
            {...register("usageLimit")}
            error={errors.usageLimit}
          />

          <Controller
            name="perCustomerLimit"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Per Customer Limit"
                icon={Lock}
                options={PER_CUSTOMER_LIMITS}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("perCustomerLimit", val, { shouldValidate: true });
                }}
                error={errors.perCustomerLimit}
              />
            )}
          />
        </div>

        {/* Target Audience & Geographic Restrictions in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Controller
            name="targetAudience"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Target Audience Selection"
                icon={Target}
                options={TARGET_AUDIENCES}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("targetAudience", val, { shouldValidate: true });
                }}
                error={errors.targetAudience}
              />
            )}
          />

          <Controller
            name="geographicRestriction"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Geographic Restriction"
                icon={MapPin}
                options={GEOGRAPHIC_RESTRICTIONS}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("geographicRestriction", val, {
                    shouldValidate: true,
                  });
                }}
                error={errors.geographicRestriction}
              />
            )}
          />
        </div>

        {/* Day Restrictions & Store Operating Hours */}
        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                <CalendarIcon className="w-3.5 h-3.5 text-[#F72853]" /> Valid
                Offer Days
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  (Optional)
                </span>
              </Label>

              {/* Day Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setValue("validDays", [...DAYS_OF_WEEK], {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-medium text-[#F72853] hover:text-[#e01e47] hover:underline cursor-pointer px-1 py-0.5 rounded"
                >
                  All 7 Days
                </button>
                <span className="text-slate-300 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "validDays",
                      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                      { shouldValidate: true },
                    )
                  }
                  className="text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1 py-0.5 rounded"
                >
                  Mon–Fri
                </button>
                <span className="text-slate-300 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validDays", ["Saturday", "Sunday"], {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1 py-0.5 rounded"
                >
                  Sat–Sun
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = validDays.includes(day);
                return (
                  <Button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "px-2.5 py-1 h-7 text-xs font-medium rounded-lg border transition-all cursor-pointer shadow-none",
                      isSelected
                        ? "bg-[#F72853] text-white border-[#F72853]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50/20 hover:border-rose-200",
                    )}
                  >
                    {day.slice(0, 3)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Store Operating Hours */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Store Operating
                / Valid Hours
              </Label>

              {/* Operating Hours Presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "10:00 AM – 09:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-medium bg-white text-slate-700 hover:bg-rose-50 hover:text-[#F72853] hover:border-rose-200 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Regular (10 AM–9 PM)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "12:00 PM – 04:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-medium bg-white text-slate-700 hover:bg-rose-50 hover:text-[#F72853] hover:border-rose-200 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Lunch (12 PM–4 PM)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("validHours", "05:00 PM – 10:00 PM", {
                      shouldValidate: true,
                    })
                  }
                  className="text-[10px] font-medium bg-white text-slate-700 hover:bg-rose-50 hover:text-[#F72853] hover:border-rose-200 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Evening (5 PM–10 PM)
                </button>
              </div>
            </div>

            <FormInput
              icon={Clock}
              type="text"
              placeholder="e.g. 10:00 AM – 09:00 PM or Valid all day"
              {...register("validHours")}
              error={errors.validHours}
              className="bg-white"
            />
            <span className="text-[10px] text-slate-400 font-normal block">
              💡 Specify when customers can visit your physical store or claim
              this deal during store operating hours.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2.5 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-medium rounded-xl border-slate-200 cursor-pointer h-8 px-3.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Next: Terms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
