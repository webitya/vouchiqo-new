"use client";

import {
  Check,
  CheckCircle2,
  Eye,
  Layers,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSettings, useUpdateAdminSetting } from "@/hooks/use-admin";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DEFAULT_COMMISSION_TABLE = [
  {
    id: "fashion",
    category: "Fashion & Clothing",
    rate: "5%",
    model: "CPA",
    notes: "Uniform across apparel",
  },
  {
    id: "food",
    category: "Food & Dining",
    rate: "3% dine-in / 2% delivery",
    model: "CPA",
    notes: "Never charge on Zomato-fulfilled orders",
  },
  {
    id: "electronics",
    category: "Electronics & Gadgets",
    rate: "2.5% blended",
    model: "CPA",
    notes: "Accessories 4%, handsets 1.5%",
  },
  {
    id: "beauty",
    category: "Beauty & Wellness",
    rate: "6% services / 4% retail",
    model: "CPA",
    notes: "Split by service vs product",
  },
  {
    id: "travel",
    category: "Travel & Hospitality",
    rate: "5% hotels / 4% packages",
    model: "CPA",
    notes: "Hotels pay less than MakeMyTrip",
  },
  {
    id: "home",
    category: "Home & Living",
    rate: "5%",
    model: "CPA",
    notes: "Furniture and décor",
  },
  {
    id: "home-improvement",
    category: "Home Improvement",
    rate: "2% products / 3% services",
    model: "CPA",
    notes: "In-store attribution via code",
  },
  {
    id: "fitness",
    category: "Fitness & Healthcare",
    rate: "6% gyms / 2% pharmacy / ₹200 CPL clinics",
    model: "CPA + CPL",
    notes: "Two models in one category",
  },
  {
    id: "education",
    category: "Education & Courses",
    rate: "₹300 CPL local / 8% online",
    model: "CPL + CPA",
    notes: "CPL for offline institutes",
  },
  {
    id: "kids-baby",
    category: "Kids & Baby Products",
    rate: "5%",
    model: "CPA",
    notes: "Clean, simple rate",
  },
  {
    id: "jewellery",
    category: "Jewellery",
    rate: "1.5% gold / 6% fashion / 3% blended",
    model: "CPA",
    notes: "Split by product type",
  },
  {
    id: "automotive",
    category: "Automobile & Auto Services",
    rate: "4%",
    model: "CPA",
    notes: "White space — you set the standard",
  },
  {
    id: "entertainment",
    category: "Gaming & Entertainment",
    rate: "4–5%",
    model: "CPA",
    notes: "Gaming hardware vs passes",
  },
  {
    id: "pets",
    category: "Pet Care & Supplies",
    rate: "5%",
    model: "CPA",
    notes: "Consumables high reorder rate",
  },
  {
    id: "grocery",
    category: "Grocery & Essentials",
    rate: "1.5% FMCG / 3% specialty",
    model: "CPA",
    notes: "Low margin, volume based",
  },
];

// 8 Distinct Pastel Row Palettes (Clearly visible without hover)
const ROW_COLOR_THEMES = [
  {
    row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900",
  },
  {
    row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900",
  },
  {
    row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900",
  },
  {
    row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900",
  },
  {
    row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900",
  },
  {
    row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900",
  },
  {
    row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900",
  },
  {
    row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900",
  },
];

export default function CommissionRatesEditorPage() {
  const {
    data: settingsData,
    isLoading: loading,
    refetch: fetchCpaRates,
  } = useAdminSettings();
  const updateSettingMutation = useUpdateAdminSetting();

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cpaRates, setCpaRates] = useState([]);
  const [previewCategoryIdx, setPreviewCategoryIdx] = useState(0);

  const [newCpaRate, setNewCpaRate] = useState({
    category: "",
    rate: "",
    model: "CPA",
    notes: "",
  });

  useEffect(() => {
    if (
      settingsData?.master_cpa_rates &&
      Array.isArray(settingsData.master_cpa_rates) &&
      settingsData.master_cpa_rates.length > 0
    ) {
      setCpaRates(settingsData.master_cpa_rates);
    } else if (settingsData) {
      setCpaRates(DEFAULT_COMMISSION_TABLE);
    }
  }, [settingsData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettingMutation.mutateAsync({
        key: "master_cpa_rates",
        value: cpaRates,
      });
      showSuccess("Master Performance Commission Rates saved successfully!");
    } catch {
      showError("Failed to save commission rates to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (
      confirm(
        "Reset commission rate table to standard defaults? (Remember to click 'Save Commission Rates' to persist to database)",
      )
    ) {
      setCpaRates(DEFAULT_COMMISSION_TABLE);
      showSuccess("Reset rate card to 15 standard category defaults.");
    }
  };

  const handleAddCpaRate = () => {
    if (!newCpaRate.category.trim() || !newCpaRate.rate.trim()) {
      showError("Please enter Category Name and Base Rate.");
      return;
    }
    const updated = [
      ...cpaRates,
      {
        id: `cpa_${Date.now()}`,
        category: newCpaRate.category.trim(),
        rate: newCpaRate.rate.trim(),
        model: newCpaRate.model || "CPA",
        notes: newCpaRate.notes.trim(),
      },
    ];
    setCpaRates(updated);
    setNewCpaRate({ category: "", rate: "", model: "CPA", notes: "" });
    showSuccess(`Added new rate entry for '${newCpaRate.category}'`);
  };

  const handleRemoveCpaRate = (indexInFiltered) => {
    const targetItem = filteredRates[indexInFiltered];
    const updated = cpaRates.filter((item) => item !== targetItem);
    setCpaRates(updated);
    showSuccess("Category rate entry removed.");
  };

  const handleUpdateField = (actualIdx, field, val) => {
    const updated = [...cpaRates];
    updated[actualIdx] = { ...updated[actualIdx], [field]: val };
    setCpaRates(updated);
  };

  const stats = useMemo(() => {
    const total = cpaRates.length;
    const cpaCount = cpaRates.filter((r) => r.model?.includes("CPA")).length;
    const cplCount = cpaRates.filter((r) => r.model?.includes("CPL")).length;
    const hybridCount = cpaRates.filter(
      (r) => r.model?.includes("CPA") && r.model?.includes("CPL"),
    ).length;
    return { total, cpaCount, cplCount, hybridCount };
  }, [cpaRates]);

  const filteredRates = useMemo(() => {
    return cpaRates.filter((r) => {
      // Tab Filter
      if (activeTab === "cpa" && !r.model?.includes("CPA")) return false;
      if (activeTab === "cpl" && !r.model?.includes("CPL")) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          r.category?.toLowerCase().includes(q) ||
          r.rate?.toLowerCase().includes(q) ||
          r.model?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [cpaRates, activeTab, searchQuery]);

  const activePreviewRate =
    filteredRates[previewCategoryIdx] || cpaRates[0] || {};

  return (
    <DashboardLayout
      title="Performance Commission Rates"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Performance Commission Rates Editor
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Manage category commission rate cards (CPA/CPL rates, models
                &amp; rules) rendered live on Merchant Onboarding.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefaults}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset Defaults</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                >
                  Reset rate card to 15 standard launch defaults
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCpaRates}
                    disabled={loading}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                >
                  Reload rates from database
                </TooltipContent>
              </Tooltip>

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3.5 cursor-pointer shadow-2xs gap-1.5 shrink-0"
              >
                {saving
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                <span>Save Rates</span>
              </Button>
            </div>
          </div>

          {/* 4 Top KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "all"
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Categories
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.total}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("cpa")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "cpa"
                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    CPA Percentage
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.cpaCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("cpl")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "cpl"
                  ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    CPL Fixed Leads
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.cplCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => setActiveTab("all")}
              className="rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans bg-white border-slate-200/80 hover:border-slate-300"
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Live Onboarding
                  </span>
                  <span className="text-base font-medium text-blue-700 mt-0.5 block leading-none">
                    Active
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Merchant View Preview Bar */}
          {activePreviewRate?.category && (
            <div className="bg-slate-50/90 border border-slate-200/90 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block leading-tight">
                    Live Onboarding View Preview (Step 5)
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-slate-900">
                      {activePreviewRate.category}:
                    </span>
                    <span className="font-mono text-[11px] font-medium text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200/80 shadow-2xs">
                      {activePreviewRate.rate}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-normal">
                      • Model:{" "}
                      <strong className="text-slate-800 font-medium">
                        {activePreviewRate.model || "CPA"}
                      </strong>
                      {activePreviewRate.notes &&
                        ` — ${activePreviewRate.notes}`}
                    </span>
                  </div>
                </div>
              </div>
              <span className="bg-white text-blue-700 border border-blue-200 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs self-start sm:self-auto">
                Selected Preview Row
              </span>
            </div>
          )}

          {/* Master Rate Card Container */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            {/* Header Controls & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Master Category Rate Card ({cpaRates.length} Categories)
                  </span>
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                  Click any cell to edit rates, model types, and specific
                  accounting rules.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search category or rate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs with Tooltips */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                  {[
                    {
                      id: "all",
                      label: "All",
                      count: stats.total,
                      desc: "Show all configured category rates",
                    },
                    {
                      id: "cpa",
                      label: "CPA",
                      count: stats.cpaCount,
                      desc: "Show percentage commission categories",
                    },
                    {
                      id: "cpl",
                      label: "CPL",
                      count: stats.cplCount,
                      desc: "Show fixed lead commission categories",
                    },
                  ].map((tab) => (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                            activeTab === tab.id
                              ? "bg-white text-blue-600 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800 bg-transparent",
                          )}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={cn(
                              "text-[9px] px-1 rounded-full",
                              activeTab === tab.id
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-200/70 text-slate-600",
                            )}
                          >
                            {tab.count}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                      >
                        {tab.desc}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {/* Add New Category Entry Box */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-medium text-slate-700 uppercase flex items-center gap-1">
                  <Plus className="w-3 h-3 text-blue-600" /> Add Category Rate
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Clean Energy)"
                    value={newCpaRate.category}
                    onChange={(e) =>
                      setNewCpaRate({ ...newCpaRate, category: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Base Rate (e.g. 4% / ₹500 CPL)"
                    value={newCpaRate.rate}
                    onChange={(e) =>
                      setNewCpaRate({ ...newCpaRate, rate: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Model (CPA / CPL)"
                    value={newCpaRate.model}
                    onChange={(e) =>
                      setNewCpaRate({ ...newCpaRate, model: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Notes & Rules (e.g. Uniform rate)"
                    value={newCpaRate.notes}
                    onChange={(e) =>
                      setNewCpaRate({ ...newCpaRate, notes: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Button
                    onClick={handleAddCpaRate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-2 cursor-pointer gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Colorful Commission Rates Table - Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-2.5 w-10 text-center">#</th>
                    <th className="py-2 px-2.5 w-52">Category Name</th>
                    <th className="py-2 px-2.5 w-52">Base CPA / CPL Rate</th>
                    <th className="py-2 px-2.5 w-32">Model</th>
                    <th className="py-2 px-2.5">Notes &amp; Special Rules</th>
                    <th className="py-2 px-2.5 w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading
                    ? <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                          Loading commission rates...
                        </td>
                      </tr>
                    : filteredRates.length === 0
                      ? <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            No category rates found matching your search.
                          </td>
                        </tr>
                      : filteredRates.map((rate, rIdx) => {
                          const actualIdx = cpaRates.indexOf(rate);
                          const theme =
                            ROW_COLOR_THEMES[rIdx % ROW_COLOR_THEMES.length];
                          const isSelected = previewCategoryIdx === rIdx;

                          return (
                            <tr
                              key={rate.id || rIdx}
                              onClick={() => setPreviewCategoryIdx(rIdx)}
                              className={cn(
                                "transition-all duration-150 cursor-pointer",
                                theme.row,
                                isSelected && "ring-1 ring-blue-500",
                              )}
                            >
                              {/* # */}
                              <td className="py-1.5 px-2 text-center">
                                <div className="w-5.5 h-5.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] mx-auto shadow-2xs">
                                  #{rIdx + 1}
                                </div>
                              </td>

                              {/* Category Name */}
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="text"
                                  value={rate.category}
                                  onChange={(e) =>
                                    handleUpdateField(
                                      actualIdx,
                                      "category",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7 px-2 font-medium text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                                />
                              </td>

                              {/* Rate */}
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="text"
                                  value={rate.rate}
                                  placeholder="e.g. 5%"
                                  onChange={(e) =>
                                    handleUpdateField(
                                      actualIdx,
                                      "rate",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs font-mono h-7 px-2 font-medium text-blue-700 focus:border-blue-500 outline-none shadow-2xs"
                                />
                              </td>

                              {/* Model */}
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="text"
                                  value={rate.model}
                                  placeholder="CPA / CPL"
                                  onChange={(e) =>
                                    handleUpdateField(
                                      actualIdx,
                                      "model",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7 px-2 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                                />
                              </td>

                              {/* Notes */}
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="text"
                                  value={rate.notes || ""}
                                  placeholder="e.g. Uniform across apparel"
                                  onChange={(e) =>
                                    handleUpdateField(
                                      actualIdx,
                                      "notes",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7 px-2 font-normal text-slate-700 focus:border-blue-500 outline-none shadow-2xs"
                                />
                              </td>

                              {/* Action */}
                              <td className="py-1.5 px-2.5 text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveCpaRate(rIdx);
                                      }}
                                      className="h-6.5 w-6.5 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 bg-white rounded-md cursor-pointer ml-auto shadow-2xs"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                  >
                                    Remove rate entry
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View - Commission Rates (Reference Card Design) */}
            <div className="md:hidden space-y-3">
              {loading
                ? <div className="py-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                    Loading commission rates...
                  </div>
                : filteredRates.length === 0
                  ? <div className="py-8 text-center text-slate-400 text-xs">
                      No category rates found matching your search.
                    </div>
                  : filteredRates.map((rate, rIdx) => {
                      const actualIdx = cpaRates.indexOf(rate);
                      return (
                        <div
                          key={rate.id || rIdx}
                          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-left font-sans"
                        >
                          {/* Top Header */}
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                              #{rIdx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                                COMMISSION RATE
                              </p>
                              <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 truncate">
                                {rate.category || "Custom Category"}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Model: {rate.model || "CPA"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveCpaRate(rIdx)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200 bg-white rounded-xl cursor-pointer shadow-xs shrink-0"
                              title="Delete Rate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-slate-100 dark:border-slate-800/80" />

                          {/* 2-column Grid of Editable Fields */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                Category
                              </label>
                              <input
                                type="text"
                                value={rate.category}
                                onChange={(e) =>
                                  handleUpdateField(
                                    actualIdx,
                                    "category",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs h-9 px-2.5 font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                Rate
                              </label>
                              <input
                                type="text"
                                value={rate.rate}
                                placeholder="e.g. 5%"
                                onChange={(e) =>
                                  handleUpdateField(
                                    actualIdx,
                                    "rate",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono h-9 px-2.5 font-extrabold text-blue-600 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                Model
                              </label>
                              <input
                                type="text"
                                value={rate.model}
                                placeholder="CPA / CPL"
                                onChange={(e) =>
                                  handleUpdateField(
                                    actualIdx,
                                    "model",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs h-9 px-2.5 font-semibold text-slate-900 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                Notes
                              </label>
                              <input
                                type="text"
                                value={rate.notes || ""}
                                placeholder="Special rules..."
                                onChange={(e) =>
                                  handleUpdateField(
                                    actualIdx,
                                    "notes",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs h-9 px-2.5 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none truncate"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
            </div>

            {/* Bottom Status & Save Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-normal">
                Showing {filteredRates.length} of {cpaRates.length} configured
                category rate cards
              </span>

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3.5 cursor-pointer shadow-2xs gap-1.5 shrink-0 self-start sm:self-auto"
              >
                {saving
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                <span>Save Rates</span>
              </Button>
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
