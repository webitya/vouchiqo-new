"use client";

import {
  FolderOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { FormInput } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminSettings, useUpdateAdminSetting } from "@/hooks/use-admin";
import { showError, showSuccess } from "@/lib/toast";

export default function PlatformContentSettings() {
  const {
    data: settingsData,
    isLoading: loading,
    refetch: fetchSettings,
  } = useAdminSettings();
  const updateSettingMutation = useUpdateAdminSetting();
  const [savingKey, setSavingKey] = useState("");

  const [statsForm, setStatsForm] = useState({
    totalRequests: 5240,
    thisMonthRequests: 142,
    recoveredAmount: 1250000,
    successRate: 94.2,
  });

  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({
    user: "",
    brand: "",
    offer: "",
    date: "Just now",
    text: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const [plans, setPlans] = useState([]);
  const [cpaRates, setCpaRates] = useState([]);

  const [newCpaRate, setNewCpaRate] = useState({
    category: "",
    rate: "",
    model: "CPA",
    notes: "",
  });

  const [newPlan, setNewPlan] = useState({
    name: "",
    badge: "",
    priceText: "",
    originalPrice: "",
    priceSuffix: "/ month",
    subCaption: "",
    featuresText: "",
    footerNote: "",
    buttonText: "",
    theme: "blue",
  });

  useEffect(() => {
    if (!settingsData) return;
    if (settingsData.revival_stats) setStatsForm(settingsData.revival_stats);
    if (settingsData.social_proof) setTestimonials(settingsData.social_proof);
    if (settingsData.categories) setCategories(settingsData.categories);
    if (settingsData.merchant_plans) setPlans(settingsData.merchant_plans);
    if (settingsData.master_cpa_rates) setCpaRates(settingsData.master_cpa_rates);
  }, [settingsData]);

  const handleSaveSetting = async (key, value) => {
    try {
      setSavingKey(key);
      await updateSettingMutation.mutateAsync({ key, value });
      showSuccess(`Setting '${key}' saved!`);
    } catch {
      showError(`Failed to save setting '${key}'`);
    } finally {
      setSavingKey("");
    }
  };

  const handleAddCpaRate = () => {
    if (!newCpaRate.category || !newCpaRate.rate) {
      return showError("Please fill in Category Name and Rate.");
    }
    const slugId = newCpaRate.category
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const newEntry = {
      id: slugId || `cpa_${Date.now()}`,
      category: newCpaRate.category.trim(),
      rate: newCpaRate.rate.trim(),
      model: newCpaRate.model ? newCpaRate.model.trim() : "CPA",
      notes: newCpaRate.notes ? newCpaRate.notes.trim() : "",
    };

    const updated = [...cpaRates, newEntry];
    setCpaRates(updated);
    setNewCpaRate({ category: "", rate: "", model: "CPA", notes: "" });
    handleSaveSetting("master_cpa_rates", updated);
  };

  const handleRemoveCpaRate = (index) => {
    const updated = cpaRates.filter((_, idx) => idx !== index);
    setCpaRates(updated);
    handleSaveSetting("master_cpa_rates", updated);
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.priceText) {
      return showError("Please fill in Plan Name and Price.");
    }
    const slugId = newPlan.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const newEntry = {
      id: slugId || `plan_${Date.now()}`,
      name: newPlan.name.trim().toUpperCase(),
      badge: newPlan.badge.trim(),
      priceText: newPlan.priceText.trim(),
      originalPrice: newPlan.originalPrice.trim(),
      priceSuffix: newPlan.priceSuffix.trim(),
      subCaption: newPlan.subCaption.trim(),
      features: newPlan.featuresText
        ? newPlan.featuresText.split("\n").filter(Boolean)
        : [],
      footerNote: newPlan.footerNote.trim(),
      buttonText: newPlan.buttonText.trim(),
      theme: newPlan.theme || "blue",
      active: true,
    };

    const updated = [...plans, newEntry];
    setPlans(updated);
    setNewPlan({
      name: "",
      badge: "",
      priceText: "",
      originalPrice: "",
      priceSuffix: "/ month",
      subCaption: "",
      featuresText: "",
      footerNote: "",
      buttonText: "",
      theme: "blue",
    });
    handleSaveSetting("merchant_plans", updated);
  };

  const handleRemovePlan = (index) => {
    const updated = plans.filter((_, idx) => idx !== index);
    setPlans(updated);
    handleSaveSetting("merchant_plans", updated);
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.user || !newTestimonial.brand || !newTestimonial.text) {
      return showError("Please fill in User, Brand, and Testimonial text.");
    }
    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    setNewTestimonial({
      user: "",
      brand: "",
      offer: "",
      date: "Just now",
      text: "",
    });
    handleSaveSetting("social_proof", updated);
  };

  const handleRemoveTestimonial = (index) => {
    const updated = testimonials.filter((_, idx) => idx !== index);
    setTestimonials(updated);
    handleSaveSetting("social_proof", updated);
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.slug) {
      return showError("Please fill in Category Name and Slug.");
    }
    const slug = newCategory.slug.trim().toLowerCase();
    if (categories.some((c) => c.slug === slug)) {
      return showError("Category slug already exists.");
    }
    const updated = [
      ...categories,
      { id: slug, name: newCategory.name.trim(), slug, active: true },
    ];
    setCategories(updated);
    setNewCategory({ name: "", slug: "" });
    handleSaveSetting("categories", updated);
  };

  const handleToggleCategory = (slug) => {
    const updated = categories.map((c) =>
      c.slug === slug ? { ...c, active: !c.active } : c,
    );
    setCategories(updated);
    handleSaveSetting("categories", updated);
  };

  const handleRemoveCategory = (slug) => {
    const updated = categories.filter((c) => c.slug !== slug);
    setCategories(updated);
    handleSaveSetting("categories", updated);
  };

  const categoryColumns = [
    {
      key: "name",
      header: "Category Name",
      sortable: true,
      cell: (r) => <span className="font-bold text-slate-900">{r.name}</span>,
    },
    {
      key: "slug",
      header: "Slug Identifier",
      cell: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.slug}</span>
      ),
    },
    {
      key: "active",
      header: "Status",
      cell: (r) => (
        <StatusBadge status={r.active ? "active" : "inactive"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleCategory(r.slug)}
            className="text-[10px] font-bold h-7 px-2.5 rounded-lg cursor-pointer"
          >
            {r.active ? "Disable" : "Enable"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRemoveCategory(r.slug)}
            className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Content & CMS Config"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Dynamic CMS &amp;
            Content Controls
          </h2>
        </div>

        {/* 1. Category Management */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-600" /> Vertical
              Category Taxonomy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <FormInput
              name="catName"
              placeholder="e.g. Health & Fitness"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-"),
                })
              }
            />
            <FormInput
              name="catSlug"
              placeholder="e.g. health-fitness"
              value={newCategory.slug}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-"),
                })
              }
            />
            <Button
              onClick={handleAddCategory}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1 mt-auto"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>

          <DataTable
            columns={categoryColumns}
            data={categories}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search categories..."
            defaultPageSize={5}
          />
        </Card>

        {/* 2. Revival Statistics */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600" /> Revival Counter
              Global Stats
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormInput
              name="totalReq"
              label="Total Requests"
              type="number"
              value={statsForm.totalRequests}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  totalRequests: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="monthReq"
              label="This Month Requests"
              type="number"
              value={statsForm.thisMonthRequests}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  thisMonthRequests: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="recAmt"
              label="Recovered Value (₹)"
              type="number"
              value={statsForm.recoveredAmount}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  recoveredAmount: Number(e.target.value),
                })
              }
            />
            <FormInput
              name="succRate"
              label="Success Rate (%)"
              type="number"
              step="0.1"
              value={statsForm.successRate}
              onChange={(e) =>
                setStatsForm({
                  ...statsForm,
                  successRate: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSaveSetting("revival_stats", statsForm)}
              disabled={savingKey === "revival_stats"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
            >
              {savingKey === "revival_stats" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save Revival Metrics"
              )}
            </Button>
          </div>
        </Card>

        {/* 3. Merchant Subscription Plans Config */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> Merchant Subscription Plans &amp; Rates Config
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Fully customizable rates, features, badges &amp; pricing displayed on Merchant Registration Page
              </p>
            </div>
            <Button
              onClick={() => handleSaveSetting("merchant_plans", plans)}
              disabled={savingKey === "merchant_plans"}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
            >
              {savingKey === "merchant_plans" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save Plans"
              )}
            </Button>
          </div>

          {/* Add New Plan Form */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Add New Merchant Plan Card
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <FormInput
                placeholder="Plan Name (e.g. ULTRA PARTNER)"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              />
              <FormInput
                placeholder="Price (e.g. ₹4,999)"
                value={newPlan.priceText}
                onChange={(e) => setNewPlan({ ...newPlan, priceText: e.target.value })}
              />
              <FormInput
                placeholder="Badge (e.g. Recommended)"
                value={newPlan.badge}
                onChange={(e) => setNewPlan({ ...newPlan, badge: e.target.value })}
              />
              <FormInput
                placeholder="Sub Caption"
                value={newPlan.subCaption}
                onChange={(e) => setNewPlan({ ...newPlan, subCaption: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <textarea
                rows={2}
                placeholder="Features checklist (one per line)"
                value={newPlan.featuresText}
                onChange={(e) => setNewPlan({ ...newPlan, featuresText: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
              />
              <FormInput
                placeholder="Footer Disclaimer Note"
                value={newPlan.footerNote}
                onChange={(e) => setNewPlan({ ...newPlan, footerNote: e.target.value })}
              />
              <Button
                onClick={handleAddPlan}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1.5 mt-auto"
              >
                <Plus className="w-4 h-4" /> Add Plan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p, pIdx) => (
              <div
                key={p.id || pIdx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Plan #{pIdx + 1}: {p.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.active !== false}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIdx].active = e.target.checked;
                          setPlans(updated);
                        }}
                        className="rounded text-blue-600"
                      />
                      Active
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePlan(pIdx)}
                      className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Plan Name</label>
                    <FormInput
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[pIdx].name = e.target.value;
                        setPlans(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Badge Text</label>
                    <FormInput
                      value={p.badge || ""}
                      placeholder="e.g. Popular, Best Value"
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[pIdx].badge = e.target.value;
                        setPlans(updated);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Price Text</label>
                    <FormInput
                      value={p.priceText || ""}
                      placeholder="e.g. ₹999"
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[pIdx].priceText = e.target.value;
                        setPlans(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Original Price</label>
                    <FormInput
                      value={p.originalPrice || ""}
                      placeholder="e.g. ₹1,499"
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[pIdx].originalPrice = e.target.value;
                        setPlans(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Price Suffix</label>
                    <FormInput
                      value={p.priceSuffix || ""}
                      placeholder="e.g. / month"
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[pIdx].priceSuffix = e.target.value;
                        setPlans(updated);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Sub Caption</label>
                  <FormInput
                    value={p.subCaption || ""}
                    placeholder="e.g. Start listing. Pay only when a customer visits."
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[pIdx].subCaption = e.target.value;
                      setPlans(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">
                    Features Checklist (One item per line)
                  </label>
                  <textarea
                    rows={4}
                    value={Array.isArray(p.features) ? p.features.map(f => typeof f === "object" && f !== null ? (f.included === false ? `âœ— ${f.text}` : f.text) : f).join("\n") : ""}
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[pIdx].features = e.target.value.split("\n").map(l => {
                        const t = l.trim();
                        if (!t) return null;
                        if (t.startsWith("âœ—") || t.startsWith("âœ•") || t.startsWith("âŒ") || t.startsWith("No ")) {
                          return { text: t.replace(/^([âœ“âœ”âœ—âœ•âŒ]|\\[[xXvV+]\\])\s*/, "").trim(), included: false };
                        }
                        return { text: t.replace(/^([âœ“âœ”]|\\[[vV+]\\])\s*/, "").trim(), included: true };
                      }).filter(Boolean);
                      setPlans(updated);
                    }}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Footer Note / Legal Disclaimer</label>
                  <FormInput
                    value={p.footerNote || ""}
                    placeholder="e.g. Commission charged only on confirmed customer transactions"
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[pIdx].footerNote = e.target.value;
                      setPlans(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Button Action Label</label>
                  <FormInput
                    value={p.buttonText || ""}
                    placeholder="e.g. Select Growth â€” ₹999/mo"
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[pIdx].buttonText = e.target.value;
                      setPlans(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => handleSaveSetting("merchant_plans", plans)}
              disabled={savingKey === "merchant_plans"}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer"
            >
              {savingKey === "merchant_plans" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save Plans"
              )}
            </Button>
          </div>
        </Card>

        {/* 4. Master CPA Commission Rates Config */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" /> Master CPA Commission Rates Table
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Single reference rate card for all 15 merchant categories (CPA / CPL / Notes)
              </p>
            </div>
            <Button
              onClick={() => handleSaveSetting("master_cpa_rates", cpaRates)}
              disabled={savingKey === "master_cpa_rates"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
            >
              {savingKey === "master_cpa_rates" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save CPA Rates"
              )}
            </Button>
          </div>

          {/* Add New Master CPA Category Form */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Add New Category CPA / CPL Rate Entry
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <FormInput
                placeholder="Category Name (e.g. Solar & Clean Energy)"
                value={newCpaRate.category}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, category: e.target.value })}
              />
              <FormInput
                placeholder="Base Rate (e.g. 4% / ₹500 CPL)"
                value={newCpaRate.rate}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, rate: e.target.value })}
              />
              <FormInput
                placeholder="Model (CPA / CPL)"
                value={newCpaRate.model}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, model: e.target.value })}
              />
              <FormInput
                placeholder="Notes & Rules"
                value={newCpaRate.notes}
                onChange={(e) => setNewCpaRate({ ...newCpaRate, notes: e.target.value })}
              />
              <Button
                onClick={handleAddCpaRate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Rate
              </Button>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 w-12 text-center">#</th>
                  <th className="px-3 py-2 w-48">Category Name</th>
                  <th className="px-3 py-2 w-56">Base CPA / CPL Rate</th>
                  <th className="px-3 py-2 w-28">Model</th>
                  <th className="px-3 py-2">Notes &amp; Rules</th>
                  <th className="px-3 py-2 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cpaRates.map((rate, rIdx) => (
                  <tr key={rate.id || rIdx} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-center font-bold text-slate-500">
                      {rIdx + 1}
                    </td>
                    <td className="px-3 py-2">
                      <FormInput
                        value={rate.category}
                        onChange={(e) => {
                          const updated = [...cpaRates];
                          updated[rIdx].category = e.target.value;
                          setCpaRates(updated);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormInput
                        value={rate.rate}
                        placeholder="e.g. 5%"
                        onChange={(e) => {
                          const updated = [...cpaRates];
                          updated[rIdx].rate = e.target.value;
                          setCpaRates(updated);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormInput
                        value={rate.model}
                        placeholder="CPA / CPL"
                        onChange={(e) => {
                          const updated = [...cpaRates];
                          updated[rIdx].model = e.target.value;
                          setCpaRates(updated);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormInput
                        value={rate.notes || ""}
                        placeholder="e.g. Uniform across apparel"
                        onChange={(e) => {
                          const updated = [...cpaRates];
                          updated[rIdx].notes = e.target.value;
                          setCpaRates(updated);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveCpaRate(rIdx)}
                        className="text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 shadow-none cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => handleSaveSetting("master_cpa_rates", cpaRates)}
              disabled={savingKey === "master_cpa_rates"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-6 cursor-pointer"
            >
              {savingKey === "master_cpa_rates" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save CPA Rates"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
