"use client";

import {
  Award,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  Tag,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSettings, useUpdateAdminSetting } from "@/hooks/use-admin";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DEFAULT_MERCHANT_PLANS = [
      {
        id: "starter",
        name: "STARTER FREE",
        badge: "Popular",
        priceText: "₹0",
        priceSuffix: "/ month free forever",
        originalPrice: "",
        subCaption: "Start listing. Pay only when a customer visits.",
        features: [
          { text: "Up to 3 active verified listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Basic views & Smart Code analytics", included: true },
          { text: "Platform promotional campaigns", included: false },
          { text: "Expired offer customer revivals", included: false },
          { text: "Targeted customer push notifications", included: false },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Priority 24h dedicated support", included: false },
        ],
        footerNote:
          "Commission charged only on confirmed customer transactions — never on views or clicks.",
        buttonText: "Select Starter",
        theme: "blue",
        active: true,
      },
      {
        id: "growth",
        name: "GROWTH PARTNER",
        badge: "Founding Rate -33%",
        priceText: "₹999",
        originalPrice: "₹1,499",
        priceSuffix: "/ month",
        subCaption:
          "More listings. Campaigns. Revival included. 14-day free trial.",
        features: [
          { text: "Up to 15 active listings (5× Starter)", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Redemptions, clicks & category rank", included: true },
          { text: "4 platform campaigns / yr (1/quarter)", included: true },
          { text: "5 expired offer revivals / month", included: true },
          { text: "Targeted customer push notifications", included: false },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Standard email support (48h SLA)", included: true },
        ],
        footerNote:
          "No payment collected today. Trial starts on account activation.",
        buttonText: "Select Growth — ₹999/mo",
        theme: "orange",
        active: true,
      },
      {
        id: "pro",
        name: "PRO PARTNER",
        badge: "Best Value",
        priceText: "₹2,499",
        originalPrice: "₹3,999",
        priceSuffix: "/ month",
        subCaption:
          "Unlimited listings, campaigns, and push sends. Full power.",
        features: [
          { text: "Unlimited active offer listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Deep analytics & revenue heatmaps", included: true },
          { text: "Unlimited platform campaigns (no cap)", included: true },
          { text: "50 expired offer revivals / month", included: true },
          { text: "Custom push notifications to customers", included: true },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Priority 24h dedicated support", included: true },
        ],
        footerNote:
          "Commission rate locked for 12 months under Founding Program.",
        buttonText: "Select Pro — ₹2,499/mo",
        theme: "emerald",
        active: true,
      },
      {
        id: "enterprise",
        name: "ENTERPRISE",
        badge: "Scale",
        priceText: "Custom pricing",
        originalPrice: "",
        priceSuffix: "",
        subCaption:
          "Dedicated manager. API access. Multi-location. Custom SLA.",
        features: [
          { text: "Unlimited multi-location listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Multi-location BI & custom exports", included: true },
          { text: "Unlimited custom marketing campaigns", included: true },
          { text: "Unlimited expired offer revivals", included: true },
          { text: "Priority customer broadcast push campaigns", included: true },
          { text: "Direct POS & CRM API integration", included: true },
          { text: "Multi-location under one dashboard", included: true },
          { text: "Dedicated named account manager", included: true },
          { text: "Custom SLA & guaranteed response time", included: true },
        ],
        footerNote:
          "No self-serve signup. Our team contacts you within 24 hours.",
        buttonText: "Contact us — partners@vouchiqo.com",
        theme: "indigo",
        active: true,
      },
    ];

// 8 Distinct Row Colors for feature bullets
const ROW_COLOR_THEMES = [
  { row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900" },
  { row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900" },
  { row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900" },
  { row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900" },
  { row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900" },
  { row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900" },
  { row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900" },
  { row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900" },
];

export default function MerchantPlansEditorPage() {
  const {
    data: settingsData,
    isLoading: loading,
    refetch: fetchPlans,
  } = useAdminSettings();
  const updateSettingMutation = useUpdateAdminSetting();

  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [newFeatureText, setNewFeatureText] = useState("");

  useEffect(() => {
    if (
      settingsData?.merchant_plans &&
      Array.isArray(settingsData.merchant_plans) &&
      settingsData.merchant_plans.length > 0
    ) {
      setPlans(settingsData.merchant_plans);
    } else if (settingsData) {
      setPlans(DEFAULT_MERCHANT_PLANS);
    }
  }, [settingsData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettingMutation.mutateAsync({
        key: "merchant_plans",
        value: plans,
      });
      showSuccess("Merchant Subscription Plans & Pricing saved successfully!");
    } catch {
      showError("Failed to save plans to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        "Reset merchant plans to default 4-tier launch structure? (Click 'Save' to persist to database)",
      )
    ) {
      setPlans(DEFAULT_MERCHANT_PLANS);
      setSelectedPlanIdx(0);
      showSuccess("Reset plans to default 4 launch tiers.");
    }
  };

  const handleUpdatePlan = (index, field, value) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const handleAddFeature = (planIndex) => {
    if (!newFeatureText.trim()) return;
    const updated = [...plans];
    const currentFeatures = updated[planIndex].features || [];
    updated[planIndex].features = [...currentFeatures, { text: newFeatureText.trim(), included: true }];
    setPlans(updated);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (planIndex, featureIndex) => {
    const updated = [...plans];
    updated[planIndex].features = updated[planIndex].features.filter(
      (_, idx) => idx !== featureIndex,
    );
    setPlans(updated);
  };

  const handleAddPlan = () => {
    const newPlanId = `custom_${Date.now()}`;
    const newPlanItem = {
      id: newPlanId,
      name: "Custom Partner",
      badge: "New Tier",
      priceMonthly: 2499,
      priceYearly: 24990,
      priceText: "₹2,499",
      originalPrice: "₹2,999",
      priceSuffix: "/ month",
      subCaption: "Custom plan tier for special partner campaigns.",
      features: [
        "Up to 25 active offer listings",
        "2 Simultaneous Active Campaigns",
        "Priority Counter QR Smart Codes",
      ],
      footerNote: "14-day free trial on activation.",
      buttonText: "Select Custom Tier",
      theme: "indigo",
      active: true,
    };
    const updated = [...plans, newPlanItem];
    setPlans(updated);
    setSelectedPlanIdx(updated.length - 1);
    showSuccess("Created new subscription plan tier!");
  };

  const handleRemovePlan = (index) => {
    if (plans.length <= 1) {
      showError("At least one subscription plan must remain.");
      return;
    }
    const updated = plans.filter((_, idx) => idx !== index);
    setPlans(updated);
    setSelectedPlanIdx(Math.max(0, index - 1));
    showSuccess("Subscription plan removed.");
  };

  const stats = useMemo(() => {
    const totalTiers = plans.length;
    const activeTiers = plans.filter((p) => p.active !== false).length;
    const freeTiers = plans.filter((p) => (p.priceMonthly || 0) === 0).length;
    const paidTiers = totalTiers - freeTiers;
    return { totalTiers, activeTiers, freeTiers, paidTiers };
  }, [plans]);

  const activePlan = plans[selectedPlanIdx] || plans[0] || {};

  return (
    <DashboardLayout
      title="Merchant Plans & Pricing"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Merchant Subscription Plans &amp; Pricing Editor
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Configure tier fees, inclusions, trial periods, and conversion buttons for Merchant Onboarding &amp; Billing.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetDefaults}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset Defaults</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Reset to default launch tier configuration
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPlans}
                    disabled={loading}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Reload plans directly from database
                </TooltipContent>
              </Tooltip>

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3.5 cursor-pointer shadow-2xs gap-1.5 shrink-0"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Plans</span>
              </Button>
            </div>
          </div>

          {/* 4 Top KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Plan Tiers
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.totalTiers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Active on Signup
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.activeTiers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Paid Subscriptions
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                    {stats.paidTiers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Free Starter Tiers
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.freeTiers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* Left Column: Tiers Selector Sidebar */}
            <Card className="lg:col-span-4 border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">
                  Available Tiers ({plans.length})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Click to edit
                </span>
              </div>

              {/* Colorful Tier Selector Cards */}
              <div className="space-y-1.5">
                {plans.map((p, idx) => {
                  const isSelected = selectedPlanIdx === idx;
                  const theme = ROW_COLOR_THEMES[idx % ROW_COLOR_THEMES.length];

                  return (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => setSelectedPlanIdx(idx)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border shadow-2xs flex items-center justify-between gap-2",
                        theme.row,
                        isSelected
                          ? "ring-2 ring-blue-500 shadow-xs border-blue-400 bg-white"
                          : "opacity-90 hover:opacity-100",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs text-slate-900 truncate">
                            {p.name || `Plan #${idx + 1}`}
                          </span>
                          {p.badge && (
                            <span className="bg-white/95 text-slate-700 border border-slate-300 text-[9px] font-medium px-1.5 py-0.2 rounded shadow-2xs shrink-0">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-medium text-blue-700">
                            {p.priceText || `₹${p.priceMonthly || 0}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {(p.features || []).length} features
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] font-medium rounded-md border shadow-2xs",
                            p.active !== false
                              ? "bg-white/95 text-emerald-700 border-emerald-300"
                              : "bg-white/95 text-slate-500 border-slate-300",
                          )}
                        >
                          {p.active !== false ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add New Plan Button */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPlan}
                  className="w-full text-xs font-medium rounded-xl border-dashed border-blue-300 text-blue-700 bg-blue-50/40 hover:bg-blue-50 cursor-pointer h-8 gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Plan Tier</span>
                </Button>
              </div>
            </Card>

            {/* Right Column: Active Tier Editor */}
            <Card className="lg:col-span-8 border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-4 space-y-4">
              {activePlan ? (
                <div className="space-y-4">
                  {/* Top Tier Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-slate-900">
                          Edit Subscription Tier: {activePlan.name}
                        </h3>
                        {activePlan.badge && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-2xs">
                            {activePlan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                        Configure pricing, display tags, features list, and signup actions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        <span>Active:</span>
                        <Switch
                          checked={activePlan.active !== false}
                          onCheckedChange={(val) =>
                            handleUpdatePlan(selectedPlanIdx, "active", val)
                          }
                        />
                      </label>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePlan(selectedPlanIdx)}
                            className="h-7.5 px-2.5 text-[11px] font-medium text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg shadow-2xs cursor-pointer gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Tier</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                          Permanently delete this subscription tier
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        value={activePlan.name || ""}
                        onChange={(e) =>
                          handleUpdatePlan(selectedPlanIdx, "name", e.target.value)
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Badge / Tagline (e.g. Most Popular)
                      </label>
                      <input
                        type="text"
                        value={activePlan.badge || ""}
                        onChange={(e) =>
                          handleUpdatePlan(selectedPlanIdx, "badge", e.target.value)
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Theme Color (blue / amber / indigo / purple)
                      </label>
                      <input
                        type="text"
                        value={activePlan.theme || "blue"}
                        onChange={(e) =>
                          handleUpdatePlan(selectedPlanIdx, "theme", e.target.value)
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Monthly Display Price (e.g. ₹1,499)
                      </label>
                      <input
                        type="text"
                        value={activePlan.priceText || ""}
                        onChange={(e) =>
                          handleUpdatePlan(selectedPlanIdx, "priceText", e.target.value)
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Numeric Monthly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={activePlan.priceMonthly ?? 0}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "priceMonthly",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Numeric Yearly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={activePlan.priceYearly ?? 0}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "priceYearly",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Original / Strike Price (e.g. ₹1,999)
                      </label>
                      <input
                        type="text"
                        value={activePlan.originalPrice || ""}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "originalPrice",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Price Suffix (e.g. / month)
                      </label>
                      <input
                        type="text"
                        value={activePlan.priceSuffix || "/ month"}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "priceSuffix",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Button CTA Text (e.g. Select Plan)
                      </label>
                      <input
                        type="text"
                        value={activePlan.buttonText || ""}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "buttonText",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* SubCaption & Disclaimer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        SubCaption / Value Proposition
                      </label>
                      <input
                        type="text"
                        value={activePlan.subCaption || ""}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "subCaption",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Footer Note / Billing Disclaimer
                      </label>
                      <input
                        type="text"
                        value={activePlan.footerNote || ""}
                        onChange={(e) =>
                          handleUpdatePlan(
                            selectedPlanIdx,
                            "footerNote",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Features List Editor with 8 Colorful Palettes */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Plan Inclusions &amp; Features ({(activePlan.features || []).length} items)
                        </span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Press Enter or click Add to add lines
                      </span>
                    </div>

                    {/* Add Feature Line */}
                    <div className="flex gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <input
                        type="text"
                        placeholder="Add feature point (e.g. Up to 20 active offer listings)..."
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature(selectedPlanIdx);
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddFeature(selectedPlanIdx)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg h-7.5 px-3 cursor-pointer shrink-0 gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Line</span>
                      </Button>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5">
                      {(activePlan.features || []).map((rawFeat, fIdx) => {
                        const featObj =
                          typeof rawFeat === "object" && rawFeat !== null
                            ? rawFeat
                            : { text: String(rawFeat), included: true };
                        const isIncluded = featObj.included !== false;
                        const theme = ROW_COLOR_THEMES[fIdx % ROW_COLOR_THEMES.length];
                        return (
                          <div
                            key={fIdx}
                            className={cn(
                              "flex items-center justify-between p-1.5 rounded-xl border shadow-2xs transition-all gap-2",
                              theme.row,
                            )}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                type="button"
                                title={
                                  isIncluded
                                    ? "Included in this tier (Click to exclude)"
                                    : "Excluded from this tier (Click to include)"
                                }
                                onClick={() => {
                                  const updated = [...plans];
                                  const cur = updated[selectedPlanIdx].features[fIdx];
                                  const obj =
                                    typeof cur === "object" && cur !== null
                                      ? { ...cur, included: !isIncluded }
                                      : { text: String(cur), included: !isIncluded };
                                  updated[selectedPlanIdx].features[fIdx] = obj;
                                  setPlans(updated);
                                }}
                                className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-all",
                                  isIncluded
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100",
                                )}
                              >
                                {isIncluded ? (
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                )}
                              </button>
                              <input
                                type="text"
                                value={featObj.text || ""}
                                onChange={(e) => {
                                  const updated = [...plans];
                                  const cur = updated[selectedPlanIdx].features[fIdx];
                                  const obj =
                                    typeof cur === "object" && cur !== null
                                      ? { ...cur, text: e.target.value }
                                      : { text: e.target.value, included: isIncluded };
                                  updated[selectedPlanIdx].features[fIdx] = obj;
                                  setPlans(updated);
                                }}
                                className={cn(
                                  "w-full bg-transparent border-0 focus:outline-none font-normal text-xs",
                                  isIncluded
                                    ? "text-slate-900"
                                    : "text-slate-400 line-through decoration-slate-300",
                                )}
                              />
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemoveFeature(selectedPlanIdx, fIdx)
                                  }
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 bg-white rounded-md cursor-pointer shrink-0 shadow-2xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                                Remove this feature line
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Bottom Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <Button
                      onClick={handleSave}
                      disabled={saving || loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-8 px-4.5 cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Plans</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a subscription plan from the left sidebar to edit details.
                </div>
              )}
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
