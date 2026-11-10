"use client";

import { Bell, Clock, Mail, Tag, Users } from "lucide-react";
import { useWatch } from "react-hook-form";
import { FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function StepPromotion({
  control,
  register,
  setValue,
  watch,
  errors,
  targetAudiences,
  onBack,
  onNext,
}) {
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const hasCountdownTimer = useWatch({ control, name: "hasCountdownTimer" });
  const hasPreTeaser = useWatch({ control, name: "hasPreTeaser" });
  const pushNotification = useWatch({ control, name: "pushNotification" });
  const newsletterInclusion = useWatch({
    control,
    name: "newsletterInclusion",
  });
  const featuredSlot = useWatch({ control, name: "featuredSlot" });
  const audience = useWatch({ control, name: "audience" });
  const pushSendTime = useWatch({ control, name: "pushSendTime" });

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans">
      <div className="border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-semibold text-slate-900">
          Step 3: Schedule &amp; Promotion Add-Ons
        </h3>
        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
          Define campaign schedule, pre-launch teasers &amp; optional promotion
          boost add-ons
        </p>
      </div>

      <div className="space-y-4">
        {/* Schedule dates using DatePicker in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Start Date
              <span className="text-red-500 font-normal ml-0.5">*</span>
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

          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#F72853]" /> End Date
              <span className="text-red-500 font-normal ml-0.5">*</span>
            </Label>
            <DatePicker
              value={endDate}
              onChange={(val) =>
                setValue("endDate", val, { shouldValidate: true })
              }
              placeholder="Select end date"
              iconColor="text-[#F72853]"
            />
            {errors.endDate && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Campaign Toggles in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 sm:p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-xs font-semibold text-slate-900 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Countdown Timer
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Show live ticking countdown timer
              </span>
            </div>
            <Switch
              checked={hasCountdownTimer}
              onCheckedChange={(val) =>
                setValue("hasCountdownTimer", !!val, { shouldValidate: true })
              }
            />
          </div>

          <div className="p-3 sm:p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-xs font-semibold text-slate-900 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Pre-Launch
                Teaser
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Show 48hr pre-launch teaser banner
              </span>
            </div>
            <Switch
              checked={hasPreTeaser}
              onCheckedChange={(val) =>
                setValue("hasPreTeaser", !!val, { shouldValidate: true })
              }
            />
          </div>
        </div>

        {/* Paid Add-On Promotions Section */}
        <div className="pt-1 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-semibold text-slate-900">
              Optional Promotion Boost Add-Ons
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">
              Amplify campaign reach with email blasts, push notifications &amp;
              ticker priority
            </p>
          </div>

          {/* Add-on Cards */}
          <div className="space-y-2.5">
            {/* Targeted Email Blast */}
            <div className="p-3 sm:p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block flex items-center gap-2">
                    Targeted Email Blast
                    <Badge className="bg-rose-50 text-[#F72853] border-rose-200 font-medium text-[9px]">
                      ₹799 / blast
                    </Badge>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Send dedicated offer email to verified subscribers
                  </span>
                </div>
              </div>
              <Switch
                checked={newsletterInclusion}
                onCheckedChange={(val) =>
                  setValue("newsletterInclusion", !!val, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Push Notification Alert */}
            <div className="p-3 sm:p-3.5 border border-slate-200/80 rounded-xl space-y-2.5 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block flex items-center gap-2">
                      Push Notification Broadcast
                      <Badge className="bg-rose-50 text-[#F72853] border-rose-200 font-medium text-[9px]">
                        ₹599 / broadcast
                      </Badge>
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Instant mobile &amp; desktop web push alert to active
                      users
                    </span>
                  </div>
                </div>
                <Switch
                  checked={pushNotification}
                  onCheckedChange={(val) =>
                    setValue("pushNotification", !!val, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              {pushNotification && (
                <div className="pt-2 border-t border-slate-100">
                  <FormSelect
                    label="Push Broadcast Time (TRAI Allowed: 9:00 AM – 9:00 PM IST)"
                    options={[
                      {
                        value: "09:30 AM IST",
                        label: "09:30 AM IST (Morning Peak)",
                      },
                      {
                        value: "11:00 AM IST",
                        label: "11:00 AM IST (Late Morning)",
                      },
                      {
                        value: "01:30 PM IST",
                        label: "01:30 PM IST (Lunch Window)",
                      },
                      {
                        value: "05:00 PM IST",
                        label: "05:00 PM IST (Evening Return)",
                      },
                      {
                        value: "07:30 PM IST",
                        label: "07:30 PM IST (Prime Evening)",
                      },
                      {
                        value: "08:30 PM IST",
                        label: "08:30 PM IST (Last Call Before 9 PM)",
                      },
                    ]}
                    value={pushSendTime || "11:00 AM IST"}
                    onValueChange={(val) =>
                      setValue("pushSendTime", val, { shouldValidate: true })
                    }
                  />
                </div>
              )}
            </div>

            {/* Homepage Ticker Priority */}
            <div className="p-3 sm:p-3.5 border border-slate-200/80 rounded-xl flex items-center justify-between bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F72853] flex items-center justify-center shrink-0 border border-rose-100">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block flex items-center gap-2">
                    Homepage Hero Priority
                    <Badge className="bg-rose-50 text-[#F72853] border-rose-200 font-medium text-[9px]">
                      ₹999 / 3-day window
                    </Badge>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Top priority slot on homepage hero carousel for 72 hours
                  </span>
                </div>
              </div>
              <Switch
                checked={featuredSlot}
                onCheckedChange={(val) =>
                  setValue("featuredSlot", !!val, { shouldValidate: true })
                }
              />
            </div>
          </div>
        </div>

        {/* Target Audience Selector */}
        <FormSelect
          label="Target Audience Selection"
          icon={Users}
          options={targetAudiences.map((aud) => ({
            value: aud.id,
            label: aud.label,
          }))}
          required
          value={audience}
          onValueChange={(val) =>
            setValue("audience", val, { shouldValidate: true })
          }
          error={errors.audience}
        />
      </div>

      <div className="flex justify-between pt-3.5 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs font-medium rounded-xl border-slate-200 text-slate-600 cursor-pointer h-8 sm:h-9 px-4 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#F72853] hover:bg-[#e01e47] text-white font-medium text-xs h-8 sm:h-9 px-5 rounded-xl cursor-pointer shadow-xs"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
