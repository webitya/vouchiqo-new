"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
 * Best Performing Days of Week bar chart.
 * Loaded dynamically (ssr: false) from analytics/page.js.
 */
export default function BestDaysChart({ data = [] }) {
  const maxVal = data.length > 0 ? Math.max(...data.map((x) => x.value)) : 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "Redemptions"]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={26}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.value > 0 && d.value === maxVal ? "#2563eb" : "#93c5fd"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}