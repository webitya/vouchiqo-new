"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  X,
  Zap,
  Sparkles,
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPARISON_CATEGORIES = [
  {
    id: "listings",
    category: "Listings & Store Redemption",
    features: [
      {
        name: "Active Offer Listings",
        desc: "Simultaneously published active verified deals",
        starter: { included: true, text: "Up to 3 listings" },
        growth: { included: true, text: "Up to 15 listings" },
        pro: { included: true, text: "Unlimited listings" },
        enterprise: { included: true, text: "Unlimited (multi-store)" },
      },
      {
        name: "Counter Smart Code & QR",
        desc: "Instant customer redemption check at checkout",
        starter: { included: true, text: "Included" },
        growth: { included: true, text: "Included" },
        pro: { included: true, text: "Included" },
        enterprise: { included: true, text: "Included" },
      },
      {
        name: "Vouchiqo Verified Badge",
        desc: "Official verified merchant trust seal",
        starter: { included: true, text: "Standard badge" },
        growth: { included: true, text: "Founding badge" },
        pro: { included: true, text: "Founding badge" },
        enterprise: { included: true, text: "Enterprise badge" },
      },
      {
        name: "Category Page Ranking",
        desc: "Listing priority when customers browse categories",
        starter: { included: true, text: "Standard listing" },
        growth: { included: true, text: "Priority ranking" },
        pro: { included: true, text: "Top category spotlight" },
        enterprise: { included: true, text: "Platform-wide premium" },
      },
    ],
  },
  {
    id: "marketing",
    category: "Marketing & Promotions",
    features: [
      {
        name: "Platform Promotional Campaigns",
        desc: "Featured festival and high-intent marketing pushes",
        starter: { included: false, text: "Not included" },
        growth: { included: true, text: "4 campaigns / yr" },
        pro: { included: true, text: "Unlimited (no cap)" },
        enterprise: { included: true, text: "Unlimited custom" },
      },
      {
        name: "Expired Offer Customer Revivals",
        desc: "Re-engage shoppers who saved past expired coupons",
        starter: { included: false, text: "Not included" },
        growth: { included: true, text: "5 revivals / mo" },
        pro: { included: true, text: "50 revivals / mo" },
        enterprise: { included: true, text: "Unlimited revivals" },
      },
      {
        name: "Targeted Push Notifications",
        desc: "Direct push messages to local customer segments",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: true, text: "Custom push messages" },
        enterprise: { included: true, text: "Priority broadcasts" },
      },
    ],
  },
  {
    id: "analytics",
    category: "Analytics & Merchant Dashboard",
    features: [
      {
        name: "Merchant Analytics Dashboard",
        desc: "Real-time views, codes, conversions, and rank",
        starter: { included: true, text: "Basic views & codes" },
        growth: { included: true, text: "Redemptions & category rank" },
        pro: { included: true, text: "Deep revenue & heatmaps" },
        enterprise: { included: true, text: "Multi-store BI & exports" },
      },
      {
        name: "Commission Rate Guarantee",
        desc: "Locked performance commission protection",
        starter: { included: true, text: "Standard CPA rate" },
        growth: { included: true, text: "12-month rate lock" },
        pro: { included: true, text: "12-month rate lock" },
        enterprise: { included: true, text: "10% Founding discount" },
      },
    ],
  },
  {
    id: "enterprise",
    category: "Enterprise Integrations & Support",
    features: [
      {
        name: "Direct POS & CRM API Access",
        desc: "Direct webhook and REST integration with retail POS",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Direct POS & API" },
      },
      {
        name: "Multi-Location Central Dashboard",
        desc: "Manage multiple retail branches under one account",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Unlimited locations" },
      },
      {
        name: "Dedicated Named Account Manager",
        desc: "Dedicated personal strategic campaign advisor",
        starter: { included: false, text: "Not included" },
        growth: { included: false, text: "Not included" },
        pro: { included: false, text: "Not included" },
        enterprise: { included: true, text: "Named Account Manager" },
      },
      {
        name: "Customer Support & SLA",
        desc: "Response time and resolution commitment",
        starter: { included: false, text: "Community FAQ" },
        growth: { included: true, text: "Standard 48h email" },
        pro: { included: true, text: "Priority 24h support" },
        enterprise: { included: true, text: "Custom SLA & hotline" },
      },
    ],
  },
];

const PLAN_COLUMNS = [
  { id: "starter", name: "Starter Free", price: "₹0", sub: "/ month free forever" },
  { id: "growth", name: "Growth Partner", price: "₹999", sub: "/ month" },
  { id: "pro", name: "Pro Partner", price: "₹2,499", sub: "/ month" },
  { id: "enterprise", name: "Enterprise", price: "Custom pricing", sub: "/ month" },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Capabilities" },
  { id: "listings", label: "Listings & Offers" },
  { id: "marketing", label: "Marketing & Campaigns" },
  { id: "analytics", label: "Analytics" },
  { id: "enterprise", label: "Enterprise & Support" },
];

export default function PlanComparisonTable({
  currentPlanId = "starter",
  onSelectPlan,
  plans = [],
}) {
  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mobile/Tablet Selected Plan Tab (for single/dual plan card views)
  const [activePlanTab, setActivePlanTab] = useState("growth");
  const [comparisonTargetTab, setComparisonTargetTab] = useState("pro");
  const [isDualCompare, setIsDualCompare] = useState(false);

  // Filtered categories based on selected tab
  const filteredCategories = useMemo(() => {
    if (selectedCategory === "all") return COMPARISON_CATEGORIES;
    return COMPARISON_CATEGORIES.filter((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  const activePlanMeta =
    PLAN_COLUMNS.find((p) => p.id === activePlanTab) || PLAN_COLUMNS[1];
  const comparePlanMeta =
    PLAN_COLUMNS.find((p) => p.id === comparisonTargetTab) || PLAN_COLUMNS[2];

  return (
    <div className="w-full space-y-4 font-sans text-left">
      {/* Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            Filter:
          </span>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                selectedCategory === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Compare Mode Switcher */}
        <div className="flex md:hidden items-center justify-between w-full pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">
            Mobile View Mode:
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDualCompare(!isDualCompare)}
            className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md gap-1"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>{isDualCompare ? "Single Plan View" : "Compare 2 Plans"}</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          DEVICE VIEW 1: SMALL SCREENS (MOBILE < 768px)
          Features segmented Plan Tabs and vertical card breakdown
          ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {/* Mobile Plan Tabs Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {PLAN_COLUMNS.map((col) => {
            const isActive = activePlanTab === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActivePlanTab(col.id)}
                className={cn(
                  "py-2 px-1 text-center rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                  isActive
                    ? "bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900 font-medium",
                )}
              >
                <span className="text-[10px] uppercase tracking-tight truncate max-w-full">
                  {col.name.split(" ")[0]}
                </span>
                <span className="text-xs font-black">{col.price}</span>
              </button>
            );
          })}
        </div>

        {/* Dual Compare Target Selector (if dual mode enabled on mobile) */}
        {isDualCompare && (
          <div className="flex items-center justify-between gap-2 p-2 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs">
            <span className="font-medium text-slate-700">Compare with:</span>
            <div className="flex items-center gap-1">
              {PLAN_COLUMNS.filter((p) => p.id !== activePlanTab).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setComparisonTargetTab(p.id)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10.5px] font-semibold border cursor-pointer",
                    comparisonTargetTab === p.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200",
                  )}
                >
                  {p.name.split(" ")[0]} ({p.price})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Plan Summary Banner on Mobile */}
        <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                {activePlanMeta.name}
              </span>
              {currentPlanId === activePlanMeta.id && (
                <Badge className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white">
                {activePlanMeta.price}
              </span>
              <span className="text-[10.5px] text-slate-300">
                {activePlanMeta.sub}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            disabled={currentPlanId === activePlanMeta.id && activePlanMeta.id === "starter"}
            onClick={() => {
              const p = plans.find((x) => x.id === activePlanMeta.id) || activePlanMeta;
              onSelectPlan?.(p);
            }}
            className={cn(
              "h-8 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0",
              currentPlanId === activePlanMeta.id
                ? activePlanMeta.id === "starter"
                  ? "bg-slate-700 text-slate-300 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
            )}
          >
            {currentPlanId === activePlanMeta.id
              ? activePlanMeta.id === "starter"
                ? "Active"
                : "Renew"
              : "Select"}
          </Button>
        </div>

        {/* Mobile Feature Accordion Cards */}
        <div className="space-y-3">
          {filteredCategories.map((cat, catIdx) => (
            <div
              key={catIdx}
              className="border border-slate-200/90 rounded-xl bg-white overflow-hidden shadow-2xs"
            >
              {/* Category Header */}
              <div className="bg-slate-50/90 px-3.5 py-2 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  {cat.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.features.length} items
                </span>
              </div>

              {/* Feature List */}
              <div className="divide-y divide-slate-100">
                {cat.features.map((feat, fIdx) => {
                  const activeData = feat[activePlanTab];
                  const compareData = isDualCompare ? feat[comparisonTargetTab] : null;

                  return (
                    <div key={fIdx} className="p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs text-slate-800 leading-snug">
                            {feat.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal leading-snug">
                            {feat.desc}
                          </div>
                        </div>

                        {/* Single Plan Badge */}
                        {!isDualCompare && (
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            {activeData.included ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center shrink-0">
                                <X className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[11px] font-medium",
                                activeData.included
                                  ? "text-slate-800 font-semibold"
                                  : "text-slate-400 line-through decoration-slate-300",
                              )}
                            >
                              {activeData.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dual Plan Comparison Row */}
                      {isDualCompare && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                          {/* Active Plan Column */}
                          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg">
                            {activeData.included ? (
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                                <Check className="w-2 h-2 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center shrink-0">
                                <X className="w-2 h-2 stroke-[3]" />
                              </span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                {activePlanMeta.name.split(" ")[0]}
                              </span>
                              <span
                                className={cn(
                                  "text-[10.5px] truncate",
                                  activeData.included
                                    ? "text-slate-800 font-medium"
                                    : "text-slate-400 line-through",
                                )}
                              >
                                {activeData.text}
                              </span>
                            </div>
                          </div>

                          {/* Compare Plan Column */}
                          <div className="flex items-center gap-1.5 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/80">
                            {compareData.included ? (
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                                <Check className="w-2 h-2 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center shrink-0">
                                <X className="w-2 h-2 stroke-[3]" />
                              </span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[9px] font-bold text-blue-600 uppercase">
                                {comparePlanMeta.name.split(" ")[0]}
                              </span>
                              <span
                                className={cn(
                                  "text-[10.5px] truncate",
                                  compareData.included
                                    ? "text-slate-800 font-medium"
                                    : "text-slate-400 line-through",
                                )}
                              >
                                {compareData.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DEVICE VIEW 2 & 3: TABLET (768px - 1023px) & DESKTOP (≥ 1024px)
          Big / Normal Responsive Data Table with Sticky Feature Column
          ========================================================================= */}
      <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {/* Horizontal Scroll Guidance on Tablet */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-800 font-medium">
          <span className="flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            Tablet Mode: Swipe horizontally to compare all tiers side-by-side
          </span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-blue-200 font-bold">
            Sticky Left Column
          </span>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse text-left font-sans min-w-[720px] lg:min-w-[860px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {/* Sticky Left Feature Column Header */}
                <th className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-xs py-3.5 px-4 sm:px-5 w-[280px] lg:w-[320px] text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                  Plan Capabilities
                </th>

                {/* Plan Columns Headers */}
                {PLAN_COLUMNS.map((col) => {
                  const isCurrent = currentPlanId === col.id;
                  const isPopular = col.id === "growth";
                  const isBestValue = col.id === "pro";

                  return (
                    <th
                      key={col.id}
                      className={cn(
                        "py-3.5 px-3 lg:px-4 text-center align-top min-w-[140px] lg:min-w-[160px] transition-colors border-r last:border-r-0 border-slate-100",
                        isCurrent && "bg-blue-50/40",
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                          {col.name}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 mt-0.5">
                          {col.price}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {col.sub}
                        </span>
                        {isCurrent && (
                          <span className="mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Active Plan
                          </span>
                        )}
                        {!isCurrent && (isPopular || isBestValue) && (
                          <span
                            className={cn(
                              "mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full",
                              isPopular
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {isPopular ? "Popular" : "Best Value"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredCategories.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  {/* Category Divider Row */}
                  <tr className="bg-slate-100/80 border-y border-slate-200">
                    <td
                      colSpan={5}
                      className="py-2 px-4 sm:px-5 text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.features.map((feat, fIdx) => (
                    <tr
                      key={fIdx}
                      className={cn(
                        "border-b border-slate-100 hover:bg-slate-50/70 transition-colors group",
                        fIdx % 2 === 1 ? "bg-slate-50/20" : "bg-white",
                      )}
                    >
                      {/* Sticky Left Feature Column */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 py-2.5 px-4 sm:px-5 align-middle border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] transition-colors">
                        <div className="font-semibold text-xs text-slate-800 leading-snug">
                          {feat.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal leading-snug mt-0.5">
                          {feat.desc}
                        </div>
                      </td>

                      {/* Tier Data Cells */}
                      {["starter", "growth", "pro", "enterprise"].map((tierId) => {
                        const tierData = feat[tierId];
                        const isIncluded = tierData.included;
                        const isCurrent = currentPlanId === tierId;

                        return (
                          <td
                            key={tierId}
                            className={cn(
                              "py-2.5 px-2 lg:px-3 text-center align-middle border-r last:border-r-0 border-slate-100 transition-colors",
                              isCurrent && "bg-blue-50/20",
                            )}
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              {isIncluded ? (
                                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 flex items-center justify-center shrink-0 shadow-2xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                                  <X className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-[10.5px] lg:text-[11px] leading-tight text-center max-w-[130px]",
                                  isIncluded
                                    ? "text-slate-700 font-medium"
                                    : "text-slate-400 font-normal line-through decoration-slate-300",
                                )}
                              >
                                {tierData.text}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Bottom Actions Row */}
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="sticky left-0 z-10 bg-slate-50/95 py-3.5 px-4 sm:px-5 font-bold text-xs text-slate-700 uppercase tracking-wider border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                  Select Subscription Plan
                </td>
                {PLAN_COLUMNS.map((col) => {
                  const isCurrent = currentPlanId === col.id;
                  const isStarter = col.id === "starter";
                  const matchingPlan =
                    plans.find((p) => p.id === col.id) || { id: col.id, name: col.name };

                  return (
                    <td
                      key={col.id}
                      className={cn(
                        "py-3.5 px-3 text-center align-middle border-r last:border-r-0 border-slate-100",
                        isCurrent && "bg-blue-50/30",
                      )}
                    >
                      <Button
                        size="sm"
                        disabled={isCurrent && isStarter}
                        onClick={() => onSelectPlan?.(matchingPlan)}
                        className={cn(
                          "w-full h-8 text-xs font-bold rounded-lg cursor-pointer transition-all",
                          isCurrent
                            ? isStarter
                              ? "bg-slate-700 text-white cursor-default"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : col.id === "pro"
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              : "bg-slate-900 hover:bg-slate-800 text-white",
                        )}
                      >
                        {isCurrent
                          ? isStarter
                            ? "Active Plan"
                            : "Renew Plan"
                          : "Select Plan"}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
