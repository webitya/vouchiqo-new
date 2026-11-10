"use client";

import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const FESTIVAL_DATES = [
  { name: "Diwali 2026", date: "Nov 8, 2026", color: "bg-amber-100 text-amber-800" },
  { name: "Dhanteras", date: "Nov 6, 2026", color: "bg-yellow-100 text-yellow-800" },
  { name: "Chhath Puja", date: "Nov 14, 2026", color: "bg-purple-100 text-purple-800" },
  { name: "Durga Puja", date: "Oct 18, 2026", color: "bg-red-100 text-red-800" },
  { name: "Karma Puja", date: "Sep 22, 2026", color: "bg-emerald-100 text-emerald-800" },
  { name: "Sarhul Festival", date: "Apr 11, 2026", color: "bg-teal-100 text-teal-800" },
  {
    name: "Sohrai & Kali Puja",
    date: "Nov 7, 2026",
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "Christmas Extravaganza",
    date: "Dec 25, 2026",
    color: "bg-rose-100 text-rose-800",
  },
];

export default function CalendarTab({ campaigns = [] }) {
  return (
    <div className="space-y-6 text-left font-sans">
      {/* Festival Markers Header */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-3">
        <h3 className="text-xs font-medium text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-purple-600" /> Upcoming Regional
          Festival Markers
        </h3>
        <div className="flex flex-wrap gap-2">
          {FESTIVAL_DATES.map((f) => (
            <Badge
              key={f.name}
              className={`${f.color} border-0 text-xs font-medium px-3 py-1`}
            >
              {f.name} — {f.date}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Calendar Grid View */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#e85d04]" /> Campaign
            Scheduling &amp; Calendar View
          </h3>
          <Badge variant="outline" className="text-xs font-bold text-slate-600">
            {campaigns.length} Total Campaigns
          </Badge>
        </div>

        {/* Scheduled List Bars */}
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="p-4 border border-slate-200/80 rounded-2xl bg-white hover:border-slate-300 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {c.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold capitalize"
                  >
                    {c.type}
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">
                    ({c.merchantId?.businessName})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Start:{" "}
                    {c.startDate || "Scheduled"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" /> End:{" "}
                    {c.endDate || "Scheduled"}
                  </span>
                </div>
              </div>

              <Badge
                className={`text-[10px] font-bold border-0 ${
                  c.status === "Scheduled"
                    ? "bg-blue-100 text-blue-800"
                    : c.status === "live"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {c.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
