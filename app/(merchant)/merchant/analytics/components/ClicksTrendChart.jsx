"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "12px",
  },
  labelStyle: { fontSize: "10px", color: "#94a3b8" },
  itemStyle: { fontSize: "12px", color: "#fff" },
};

/**
 * Clicks vs Redemptions trend line chart.
 * Loaded dynamically (ssr: false) from analytics/page.js to exclude
 * recharts (~180KB) from the initial JS bundle.
 */
export default function ClicksTrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2.5}
          dot={{ r: 3, fill: "#2563eb" }} activeDot={{ r: 5 }} name="Clicks" />
        <Line type="monotone" dataKey="redemptions" stroke="#0f172a" strokeWidth={2.5}
          dot={{ r: 3, fill: "#0f172a" }} activeDot={{ r: 5 }} name="Redemptions" />
      </LineChart>
    </ResponsiveContainer>
  );
}