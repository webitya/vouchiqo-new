import { format } from "date-fns";
import { Calendar, CalendarDays } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DatePickerField = ({
  label,
  value,
  onChange,
  isOpen,
  onOpenChange,
  placeholder,
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5">
      <CalendarDays className="w-3.5 h-3.5 text-brand-blue" />
      {label}
    </Label>
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-10 flex items-center justify-between px-3 bg-brand-surface border border-brand-border rounded-lg text-xs text-brand-text font-semibold hover:border-brand-blue transition-colors"
        >
          <span className={value ? "text-brand-text" : "text-brand-subtext"}>
            {value ? format(new Date(value), "dd MMM yyyy") : placeholder}
          </span>
          <Calendar className="w-4 h-4 text-brand-subtext" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

export default function StepSchedule({
  campaignData,
  updateField,
  startOpen,
  setStartOpen,
  endOpen,
  setEndOpen,
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
        Step 4: Scheduling &amp; final check
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <DatePickerField
          label="Start Date"
          value={campaignData.startDate}
          onChange={(val) => updateField("startDate", val)}
          isOpen={startOpen}
          onOpenChange={setStartOpen}
          placeholder="Pick start date"
        />

        {/* End Date */}
        <DatePickerField
          label="End Date"
          value={campaignData.endDate}
          onChange={(val) => updateField("endDate", val)}
          isOpen={endOpen}
          onOpenChange={setEndOpen}
          placeholder="Pick end date"
        />
      </div>

      <div className="bg-brand-surface p-4 border border-brand-border rounded-xl space-y-3 mt-4">
        <span className="text-xs font-bold text-brand-navy block uppercase">
          Campaign Summary
        </span>
        <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed font-semibold">
          <div>
            <span className="text-brand-subtext">Campaign Name:</span>
            <p className="text-brand-text font-bold">{campaignData.name}</p>
          </div>
          <div>
            <span className="text-brand-subtext">Type / Theme:</span>
            <p className="text-brand-text font-bold capitalize">
              {campaignData.type} Sale
            </p>
          </div>
          <div>
            <span className="text-brand-subtext">Attached Coupons:</span>
            <p className="text-brand-text font-bold">
              {campaignData.couponIds.length} listings
            </p>
          </div>
          <div>
            <span className="text-brand-subtext">Active Promotions:</span>
            <p className="text-brand-text font-bold">
              {[
                campaignData.settings.homepageSlot && "Homepage Slot",
                campaignData.settings.pushNotification && "Push Notify",
                campaignData.settings.newsletter && "Newsletter digest",
              ]
                .filter(Boolean)
                .join(", ") || "None"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
