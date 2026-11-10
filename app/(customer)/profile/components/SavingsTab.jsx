"use client";

import {
  Award,
  Check,
  Download,
  IndianRupee,
  Lock,
  Percent,
  Search,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KPICard from "@/components/shared/cards/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DONUT_COLORS = [
  "#F72853",
  "#10B981",
  "#6366F1",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#14B8A6",
];

export default function SavingsTab({
  savingsData,
  handleShareSavings,
  copiedShareCard,
  handleExportCSV,
}) {
  // Chart range & toggles
  const [timelineRange, setTimelineRange] = useState("12");

  // Table search/pagination/sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Category filter (from Donut slice click)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 1. Transaction history computations
  let filteredTx = savingsData?.recentTransactions || [];
  if (selectedCategory) {
    filteredTx = filteredTx.filter(
      (t) => t.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredTx = filteredTx.filter(
      (t) =>
        t.brand.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term),
    );
  }

  // Sort
  filteredTx.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === "saved") {
      valA = parseFloat(a.amountSaved.replace(/[^0-9.]/g, ""));
      valB = parseFloat(b.amountSaved.replace(/[^0-9.]/g, ""));
    } else if (sortField === "date") {
      valA = new Date(a.date.split(" ").reverse().join(" "));
      valB = new Date(b.date.split(" ").reverse().join(" "));
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalFilteredCount = filteredTx.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTx = filteredTx.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // 2. Timeline calculations
  let activeTimeline = [...(savingsData?.timeline || [])];
  if (timelineRange === "3") activeTimeline = activeTimeline.slice(-3);
  else if (timelineRange === "6") activeTimeline = activeTimeline.slice(-6);
  else if (timelineRange === "12") activeTimeline = activeTimeline.slice(-12);

  const chartData = activeTimeline.map((t) => ({
    name: t.label.split(" ")[0],
    savings: t.saved,
    spending: t.spent,
    fullLabel: t.label,
  }));

  // Donut slices
  const totalSavedVal =
    savingsData?.categoryBreakdown?.reduce(
      (sum, item) => sum + item.saved,
      0,
    ) || 0;
  const donutCircumference = 2 * Math.PI * 60;
  let cumulativePct = 0;

  const donutSlices = (savingsData?.categoryBreakdown || []).map(
    (item, idx) => {
      const percentage = item.saved / (totalSavedVal || 1);
      const strokeDash = percentage * donutCircumference;
      const strokeOffset =
        donutCircumference - strokeDash + cumulativePct * donutCircumference;
      cumulativePct -= percentage;
      return {
        category: item.category,
        saved: item.saved,
        pct: item.pct,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        dashArray: `${strokeDash} ${donutCircumference}`,
        dashOffset: strokeOffset,
      };
    },
  );

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans">
      {/* KPI Cards Grid (Compact 2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <KPICard
          title="Saved This Month"
          value={`₹${(Number(savingsData?.kpis?.totalSavedMonth) || 0).toLocaleString("en-IN")}`}
          change={savingsData?.kpis?.savingsRate || 12.5}
          icon={IndianRupee}
          variant="emerald"
        />
        <KPICard
          title="Total Lifetime Saved"
          value={`₹${(Number(savingsData?.kpis?.totalSavedAllTime) || 0).toLocaleString("en-IN")}`}
          change={8.2}
          icon={Award}
          variant="purple"
        />
        <KPICard
          title="Total Spent Tracked"
          value={`₹${(Number(savingsData?.kpis?.totalSpentAllTime) || 0).toLocaleString("en-IN")}`}
          change={4.5}
          icon={TrendingUp}
          variant="blue"
        />
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/20 border border-rose-200/70 hover:border-[#F72853] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-[0_8px_20px_rgba(247,40,83,0.12)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 font-medium uppercase tracking-wider block truncate">
              Savings Rate
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-50 border border-rose-200/60 text-[#F72853] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-0.5">
            <span className="text-base sm:text-xl font-medium text-[#F72853] tracking-tight leading-none block">
              {savingsData?.kpis?.savingsRate || 0}%
            </span>
          </div>
          <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-normal leading-tight pt-0.5">
            You save ₹{savingsData?.kpis?.savingsRate || 0} per ₹100 spent
          </p>
        </div>
      </div>

      {/* Milestone Badges */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            <span>Savings Milestone Badges</span>
          </h3>
          <span className="text-[10px] sm:text-[10.5px] text-[#F72853] font-normal bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
            {savingsData?.milestones?.filter((m) => m.achieved)?.length || 0} /{" "}
            {savingsData?.milestones?.length || 0} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {savingsData?.milestones?.map((m) => {
            const dateStr = m.achievedAt
              ? new Date(m.achievedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })
              : "";
            return (
              <div
                key={m.id}
                className={`relative group rounded-xl p-2.5 sm:p-3 border text-center transition-all duration-200 ${
                  m.achieved
                    ? "bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-emerald-200 text-emerald-800 shadow-2xs"
                    : "bg-slate-50/70 border-slate-200/70 text-slate-500"
                }`}
              >
                <div
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center border mb-1.5 shadow-2xs ${
                    m.achieved
                      ? "bg-white border-emerald-200 text-emerald-600"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {m.achieved ? (
                    <Award className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>
                <span className="text-[10px] sm:text-[10.5px] font-medium block truncate">
                  {m.title}
                </span>
                {m.achieved ? (
                  <span className="text-[8.5px] sm:text-[9px] text-emerald-600 block mt-0.5 font-normal">
                    Unlocked {dateStr}
                  </span>
                ) : (
                  <span className="text-[8.5px] sm:text-[9px] text-slate-400 block mt-0.5 font-normal">
                    Target ₹{m.threshold}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Chart + Personalized Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5">
        {/* Left: Timeline Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3.5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight">
              Savings vs. Spending Timeline
            </h3>
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0 select-none">
              {["3", "6", "12", "all"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimelineRange(r)}
                  className={`text-[9.5px] sm:text-[10px] font-medium px-2.5 py-0.5 rounded-md transition-all uppercase cursor-pointer border-0 ${
                    timelineRange === r
                      ? "bg-white text-[#F72853] shadow-2xs border border-rose-100"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  {r === "all" ? "All" : `${r}M`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-h-[200px] sm:min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSpending"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 400 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 400 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-lg min-w-[130px] text-left">
                          <div className="font-medium text-slate-300 border-b border-white/10 pb-1 mb-1 text-[9px] uppercase">
                            {data.fullLabel}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400 font-normal">
                              Saved:
                            </span>
                            <span className="font-medium text-emerald-400">
                              ₹{data.savings.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 mt-0.5">
                            <span className="text-slate-400 font-normal">
                              Spent:
                            </span>
                            <span className="font-medium text-indigo-300">
                              ₹{data.spending.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorSpending)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-[9.5px] font-normal text-slate-500 pt-2 border-t border-slate-100 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Savings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Spending</span>
            </div>
          </div>
        </div>

        {/* Right: Personalized Savings Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3.5">
          <div className="space-y-1">
            <span className="text-[9.5px] text-slate-400 font-medium uppercase tracking-wider">
              Share &amp; Celebrate
            </span>
            <h3 className="text-xs sm:text-[13px] font-medium text-slate-800">
              Personalized Savings Card
            </h3>
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
              Share your verified savings milestone with friends on WhatsApp or
              social media!
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/30 border border-rose-200/60 rounded-xl p-3.5 text-center space-y-2 shadow-2xs">
            <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium block">
              Monthly Verified Certificate
            </span>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 block font-normal">
                I SAVED THIS MONTH
              </span>
              <span className="text-xl sm:text-2xl font-medium text-[#F72853] tracking-tight block">
                ₹{savingsData?.kpis?.totalSavedMonth?.toLocaleString("en-IN") || 0}
              </span>
              <span className="text-[8.5px] text-slate-400 block font-normal">
                with verified Vouchiqo vouchers
              </span>
            </div>
          </div>

          <Button
            onClick={handleShareSavings}
            className="w-full py-2 rounded-lg text-xs font-normal text-white bg-[#F72853] hover:bg-[#df1c44] border-0 h-auto cursor-pointer flex justify-center items-center gap-1.5 shadow-2xs transition-colors"
          >
            {copiedShareCard ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>
              {copiedShareCard ? "Copied Share Text!" : "Copy Savings Link"}
            </span>
          </Button>
        </div>
      </div>

      {/* Category Breakdown & Top Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3.5">
          <div className="flex justify-between items-start">
            <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight">
              Category Breakdown
            </h3>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-[9px] font-medium text-[#F72853] uppercase hover:underline cursor-pointer bg-transparent border-0"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-6">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                {donutSlices.length > 0 ? (
                  donutSlices.map((slice) => (
                    <circle
                      key={slice.category}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="15"
                      strokeDasharray={slice.dashArray}
                      strokeDashoffset={slice.dashOffset}
                      className="cursor-pointer transition-all duration-300 hover:stroke-[18]"
                      onClick={() => setSelectedCategory(slice.category)}
                    />
                  ))
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="15"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                <span className="text-[8px] text-slate-400 font-medium uppercase">
                  Total
                </span>
                <span className="text-xs font-medium text-slate-900">
                  ₹
                  {savingsData?.kpis?.totalSavedAllTime?.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  }) || 0}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-grow max-w-[200px]">
              {donutSlices.length > 0 ? (
                donutSlices.map((slice) => (
                  <button
                    key={slice.category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        slice.category === selectedCategory
                          ? null
                          : slice.category,
                      )
                    }
                    className={`w-full flex items-center justify-between text-[10.5px] p-1 rounded-md transition-colors cursor-pointer border-0 ${
                      selectedCategory === slice.category
                        ? "bg-rose-50 text-[#F72853] font-medium"
                        : "text-slate-600 hover:bg-slate-50 font-normal"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="truncate">{slice.category}</span>
                    </span>
                    <span className="font-medium shrink-0 ml-1">
                      ₹{slice.saved.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400">No categories recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Stores/Merchants Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3.5">
          <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight">
            Top Store Savings
          </h3>

          <div className="space-y-2">
            {(savingsData?.topMerchants || []).length > 0 ? (
              savingsData.topMerchants.slice(0, 4).map((m) => (
                <div
                  key={m.brand}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-rose-100 bg-slate-50/50 hover:bg-rose-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-medium text-[#F72853] shrink-0">
                      {m.brand?.[0]}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-800 truncate block">
                        {m.brand}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-normal block">
                        {m.couponsRedeemed || 1} offers used
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 shrink-0">
                    ₹{m.saved?.toLocaleString("en-IN") || 0} Saved
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No store savings recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Redemptions Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight">
              Verified Savings Log
            </h3>
            <p className="text-[10.5px] text-slate-400 font-normal">
              Track all your redeemed deals and total discounts
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-2.5 py-1 text-xs h-8 rounded-lg border-slate-200 focus-visible:ring-1 focus-visible:ring-[#F72853]"
              />
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-normal border-slate-200 hover:border-rose-200 hover:text-[#F72853] text-slate-600 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead
                  onClick={() => toggleSort("date")}
                  className="text-[10px] uppercase font-medium text-slate-400 cursor-pointer"
                >
                  Date
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("brand")}
                  className="text-[10px] uppercase font-medium text-slate-400 cursor-pointer"
                >
                  Brand / Merchant
                </TableHead>
                <TableHead className="text-[10px] uppercase font-medium text-slate-400">
                  Category
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("saved")}
                  className="text-[10px] uppercase font-medium text-slate-400 cursor-pointer text-right"
                >
                  Amount Saved
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTx.length > 0 ? (
                paginatedTx.map((tx, idx) => (
                  <TableRow
                    key={tx.id || idx}
                    className="border-slate-100 hover:bg-rose-50/20 transition-colors"
                  >
                    <TableCell className="text-xs text-slate-500 font-normal">
                      {tx.date}
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      {tx.brand}
                    </TableCell>
                    <TableCell>
                      <span className="text-[9.5px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tx.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-emerald-600 text-right">
                      {tx.amountSaved}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-xs text-slate-400 py-6"
                  >
                    No savings records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs px-2.5 rounded-md cursor-pointer disabled:opacity-40"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 text-xs px-2.5 rounded-md cursor-pointer disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
