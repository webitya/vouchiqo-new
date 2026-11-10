"use client";

import { MousePointerClick } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TIME_RANGES = ["7 Days", "30 Days", "90 Days"];

export default function PerformanceChart({
  trendData,
  activeRange = "30 Days",
  setActiveRange,
}) {
  const chartData =
    trendData && trendData.length > 0
      ? trendData.map((t) => ({
          label: t.label,
          clicks: t.views || 0,
          redemptions: t.redemptions || t.orders || 0,
        }))
      : [];

  const totalClicksInView = chartData.reduce((s, c) => s + (c.clicks || 0), 0);
  const hasData = chartData.some((c) => c.clicks > 0 || c.redemptions > 0);

  return (
    <div className="col-span-full xl:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full font-sans">
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/40">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-tight">
            Clicks vs Redemptions
          </h3>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-none">
            Performance trend — last {activeRange ?? "30 Days"}
          </p>
        </div>
        <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-100/80 shrink-0 select-none">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer border-0 ${
                (activeRange ?? "30 Days") === range
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 bg-transparent"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        {/* Chart legend & summary */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F72853] shrink-0" />
              <span className="text-xs font-normal text-slate-700">Clicks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-normal text-slate-700">
                Redemptions
              </span>
            </div>
          </div>
          <span className="text-xs font-normal text-slate-500">
            Period Clicks:{" "}
            <span className="font-semibold text-slate-900">
              {totalClicksInView.toLocaleString()}
            </span>
          </span>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-48 sm:h-52 w-full flex-1 pt-1">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "6px 10px",
                  }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "11px", color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#F72853"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#F72853" }}
                  activeDot={{ r: 4.5 }}
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="redemptions"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#10b981" }}
                  activeDot={{ r: 4.5 }}
                  name="Redemptions"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-1.5 text-center py-6">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#F72853] flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                No activity yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-[240px] font-normal leading-normal">
                Clicks and redemptions will graph here in real-time as customers
                interact with your deals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
