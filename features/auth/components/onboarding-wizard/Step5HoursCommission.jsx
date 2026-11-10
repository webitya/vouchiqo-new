"use client";

import React from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STANDARD_TIME_OPTIONS,
  normalizeTimeFormat,
} from "@/utils/timeUtils";
import { CATEGORIES } from "./constants";

export default function Step5HoursCommission({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  showMasterCpaTable,
  setShowMasterCpaTable,
  masterCpaRates,
  getLabelClass,
  shadowSelectClass,
}) {
  return (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section E: Category Commission &amp; Store Hours (Optional)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Category commission structure and store opening timings (Default
                10 AM - 9 PM applied)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-amber-200 bg-amber-50 text-amber-800"
            >
              Optional Section
            </Badge>
          </div>

          <div className="space-y-3">
            {(() => {
              const selectedCatObj = CATEGORIES.find(
                (c) => c.id === formData.category,
              );
              const selectedCatLabel = selectedCatObj
                ? selectedCatObj.label
                : "Selected Category";
              const matchedComm = masterCpaRates.find(
                (c) =>
                  (c.id && c.id === formData.category) ||
                  c.category
                    .toLowerCase()
                    .includes(formData.category.toLowerCase()) ||
                  c.category
                    .toLowerCase()
                    .startsWith(formData.category.slice(0, 4).toLowerCase()),
              ) || {
                category: selectedCatLabel,
                rate: "3% – 5% blended rate",
                model: "CPA",
                notes: "Category performance rate",
              };

              return (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider block">
                      PERFORMANCE COMMISSION RATE (
                      {selectedCatLabel.toUpperCase()})
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowMasterCpaTable(!showMasterCpaTable)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer"
                    >
                      {showMasterCpaTable
                        ? "Hide Master CPA Table"
                        : "View Full Master CPA Table (15 Categories)"}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {selectedCatLabel}:
                      </span>
                      <span className="font-mono text-xs text-blue-700 font-extrabold px-3 py-1 rounded-md bg-blue-50 border border-blue-200">
                        {matchedComm.rate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 mt-1.5">
                      <span className="font-medium">
                        Model:{" "}
                        <strong className="text-slate-900">
                          {matchedComm.model || "CPA"}
                        </strong>
                      </span>
                      {matchedComm.notes && (
                        <span className="italic text-slate-500 font-normal">
                          Notes: {matchedComm.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Master CPA Rate Table matching exact user design screenshot */}
                  {showMasterCpaTable && (
                    <div className="pt-2 space-y-2">
                      <div className="border-b border-blue-200 pb-1 flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                          The Master CPA Rate Table
                        </h4>
                        <span className="text-[10px] text-slate-500 italic">
                          Single reference document for all merchant
                          conversations
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="px-2.5 py-1.5 text-center w-8">
                                #
                              </th>
                              <th className="px-2.5 py-1.5 font-bold">
                                Category
                              </th>
                              <th className="px-2.5 py-1.5 font-bold">
                                Base CPA / CPL
                              </th>
                              <th className="px-2.5 py-1.5 font-bold">Model</th>
                              <th className="px-2.5 py-1.5 font-bold">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {masterCpaRates.map((row, idx) => (
                              <tr
                                key={row.id || idx}
                                className={
                                  row.category
                                    .toLowerCase()
                                    .includes(
                                      formData.category.toLowerCase(),
                                    ) ||
                                  (row.id && row.id === formData.category)
                                    ? "bg-blue-50/90 font-bold text-blue-900"
                                    : "hover:bg-slate-50/60 text-slate-700"
                                }
                              >
                                <td className="px-2.5 py-1.5 text-center font-mono text-[10px]">
                                  {idx + 1}
                                </td>
                                <td className="px-2.5 py-1.5 font-medium">
                                  {row.category}
                                </td>
                                <td className="px-2.5 py-1.5 font-mono text-blue-700 font-semibold">
                                  {row.rate}
                                </td>
                                <td className="px-2.5 py-1.5 font-semibold text-slate-800">
                                  {row.model}
                                </td>
                                <td className="px-2.5 py-1.5 text-[11px] text-slate-600 italic">
                                  {row.notes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                fieldErrors.commissionAgreed
                  ? "bg-red-50/50 border-red-400"
                  : "bg-blue-50/50 border-blue-200/80 text-slate-900"
              }`}
            >
              <Checkbox
                checked={formData.commissionAgreed}
                onCheckedChange={(val) => {
                  setFormData({ ...formData, commissionAgreed: !!val });
                  if (val && fieldErrors?.commissionAgreed) {
                    clearFieldError?.("commissionAgreed");
                  }
                }}
                className={fieldErrors.commissionAgreed ? "border-red-500" : ""}
              />
              <span className="text-xs font-normal text-slate-800">
                I acknowledge and accept the Vouchiqo performance commission
                structure for my primary category.{" "}
                <span className="text-red-600 font-bold">*</span>
              </span>
            </label>
            {fieldErrors.commissionAgreed && (
              <p className="text-xs text-red-600 font-normal mt-1">
                Please acknowledge and accept the performance commission
                structure to proceed
              </p>
            )}

            {/* Weekly Store Operating Hours Schedule */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                    Weekly Store Operating Hours Schedule
                  </Label>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Select store opening &amp; closing timings per day (Default
                    10:00 AM – 08:00 PM).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const monData = formData.operatingHours?.Monday || {
                      isOpen: true,
                      openTime: "10:00 AM",
                      closeTime: "08:00 PM",
                    };
                    const updatedHours = {};
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].forEach((d) => {
                      updatedHours[d] = {
                        isOpen: true,
                        openTime: monData.openTime,
                        closeTime: monData.closeTime,
                      };
                    });
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: updatedHours,
                    }));
                    toast.success(
                      "Applied Monday operating hours to all 7 days!",
                    );
                  }}
                  className="text-[10.5px] font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-7 px-2.5 rounded-lg cursor-pointer self-start sm:self-auto"
                >
                  Apply Monday to All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const dayData = formData.operatingHours?.[day] || {
                    isOpen: true,
                    openTime: "10:00 AM",
                    closeTime: day === "Sunday" ? "11:00 PM" : "08:00 PM",
                  };

                  const currentOpen = normalizeTimeFormat(
                    dayData.openTime,
                    "10:00 AM",
                  );
                  const currentClose = normalizeTimeFormat(
                    dayData.closeTime,
                    "08:00 PM",
                  );

                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-lg border transition-all flex flex-col justify-between gap-1.5 ${
                        dayData.isOpen
                          ? "bg-white border-slate-200/90 shadow-2xs"
                          : "bg-slate-100/80 border-slate-200 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`day-${day}`}
                            checked={dayData.isOpen}
                            onCheckedChange={(checked) => {
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: {
                                    ...dayData,
                                    isOpen: !!checked,
                                  },
                                },
                              }));
                            }}
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                          >
                            {day}
                          </label>
                        </div>
                        <Badge
                          className={`text-[9px] font-bold border-0 px-1.5 py-0 ${
                            dayData.isOpen
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {dayData.isOpen ? "OPEN" : "CLOSED"}
                        </Badge>
                      </div>

                      {dayData.isOpen ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <select
                            value={currentOpen}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...dayData, openTime: val },
                                },
                              }));
                            }}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200/90 shadow-2xs rounded px-1.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {STANDARD_TIME_OPTIONS.map((tOpt) => (
                              <option key={`open-${tOpt}`} value={tOpt}>
                                {tOpt}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-400 font-bold text-xs">
                            –
                          </span>
                          <select
                            value={currentClose}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...dayData, closeTime: val },
                                },
                              }));
                            }}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200/90 shadow-2xs rounded px-1.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {STANDARD_TIME_OPTIONS.map((tOpt) => (
                              <option key={`close-${tOpt}`} value={tOpt}>
                                {tOpt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-rose-600 italic">
                          Closed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
  );
}
