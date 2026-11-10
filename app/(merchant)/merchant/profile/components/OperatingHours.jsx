"use client";

import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  STANDARD_TIME_OPTIONS,
  normalizeTimeFormat,
} from "@/utils/timeUtils";
import { DEFAULT_OPERATING_HOURS } from "../hooks/use-merchant-profile-form";

export default function OperatingHours({ formData, handleHoursChange }) {
  const hoursObj =
    formData?.operatingHours && Object.keys(formData.operatingHours).length > 0
      ? formData.operatingHours
      : DEFAULT_OPERATING_HOURS;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left font-sans">
      <h3 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span>Weekly Store Operating Hours</span>
      </h3>

      <div className="space-y-3">
        {Object.keys(hoursObj).map((day) => {
          const hr = hoursObj[day] || {
            open: "10:00 AM",
            close: "08:00 PM",
            closed: false,
          };
          const currentOpen = normalizeTimeFormat(
            hr.open || hr.openTime,
            "10:00 AM",
          );
          const currentClose = normalizeTimeFormat(
            hr.close || hr.closeTime,
            "08:00 PM",
          );

          return (
            <div
              key={day}
              className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs font-bold text-brand-navy">{day}</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hr.closed}
                  onChange={(e) =>
                    handleHoursChange(day, "closed", e.target.checked)
                  }
                  className="w-4 h-4 text-brand-blue cursor-pointer rounded"
                  id={`closed-${day}`}
                />
                <label
                  htmlFor={`closed-${day}`}
                  className="text-xs font-semibold text-brand-subtext cursor-pointer select-none"
                >
                  Closed All Day
                </label>
              </div>

              {!hr.closed ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-brand-subtext uppercase">
                      Open Time
                    </Label>
                    <select
                      value={currentOpen}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="w-full bg-brand-surface border border-brand-border rounded-lg text-xs h-8 px-2 font-mono focus:outline-none focus:border-brand-blue cursor-pointer"
                    >
                      {STANDARD_TIME_OPTIONS.map((tOpt) => (
                        <option key={`profile-open-${tOpt}`} value={tOpt}>
                          {tOpt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-brand-subtext uppercase">
                      Close Time
                    </Label>
                    <select
                      value={currentClose}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="w-full bg-brand-surface border border-brand-border rounded-lg text-xs h-8 px-2 font-mono focus:outline-none focus:border-brand-blue cursor-pointer"
                    >
                      {STANDARD_TIME_OPTIONS.map((tOpt) => (
                        <option key={`profile-close-${tOpt}`} value={tOpt}>
                          {tOpt}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 text-xs font-semibold text-slate-400">
                  Store closed on {day}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
