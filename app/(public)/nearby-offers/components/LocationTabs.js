"use client";

import { Activity, Building2, Map, SlidersHorizontal } from "lucide-react";

/**
 * Location tab bar: Nearest / City / State / All tabs with counts.
 */
export default function LocationTabs({
  activeTab,
  setActiveTab,
  groupedCoupons,
}) {
  const tabs = [
    {
      key: "nearest",
      label: "Nearest",
      icon: Activity,
      count: groupedCoupons.nearest.length,
    },
    {
      key: "city",
      label: "City",
      icon: Building2,
      count: groupedCoupons.city.length,
    },
    {
      key: "state",
      label: "State",
      icon: Map,
      count: groupedCoupons.state.length,
    },
    {
      key: "all",
      label: "All Local",
      icon: SlidersHorizontal,
      count: groupedCoupons.all.length,
    },
  ];

  return (
    <div className="flex border-b border-brand-border bg-white flex-shrink-0 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-[11px] font-black py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 border-none ${
              isActive
                ? "bg-brand-blue text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
