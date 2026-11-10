"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpToLine,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  GripVertical,
  ImageIcon,
  Info,
  Layers,
  Layout,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MobileTableCard from "@/components/shared/data/MobileTableCard";
import StatusBadge from "@/components/shared/data/StatusBadge";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAdminBanners,
  useCreateBanner,
  useDeleteBanner,
  useReorderBanners,
  useUpdateBanner,
} from "@/hooks/use-admin";
import { uploadFile } from "@/lib/fetcher";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

const SLOTS = [
  {
    id: "hero",
    label: "Top Hero Section",
    width: 1200,
    height: 430,
    aspectRatio: "2.8:1 (Wide)",
    recommendedSize: "1200 x 430 px (~2.8:1)",
    format: "WebP, JPG, PNG",
    maxSize: "2 MB",
    aliases: ["hero", "left-hero", "top-hero"],
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    activeTabBg: "bg-blue-600 text-white shadow-2xs",
    inactiveTabBg: "text-blue-700 hover:bg-blue-100/70 bg-blue-50/40",
    cardBorder: "border-blue-200/90",
    headerBg: "bg-blue-50/70 text-blue-950 border-blue-100",
    submitBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    accentText: "text-blue-600",
    subCardBg: "bg-blue-50/30 border-blue-100/80",
    description: "Main homepage top carousel banner rotation",
  },
  {
    id: "trending",
    label: "Trending Offers",
    width: 2048,
    height: 768,
    aspectRatio: "8:3 (~2.67:1)",
    recommendedSize: "2048 x 768 px (~8:3 / 16:6)",
    format: "WebP, JPG, PNG",
    maxSize: "3 MB",
    aiPromptTip: "--ar 8:3 (Midjourney) | 2048x768 (SDXL/Flux)",
    aliases: ["trending", "trending-offer"],
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    activeTabBg: "bg-purple-600 text-white shadow-2xs",
    inactiveTabBg: "text-purple-700 hover:bg-purple-100/70 bg-purple-50/40",
    cardBorder: "border-purple-200/90",
    headerBg: "bg-purple-50/70 text-purple-950 border-purple-100",
    submitBtn: "bg-purple-600 hover:bg-purple-700 text-white",
    accentText: "text-purple-600",
    subCardBg: "bg-purple-50/30 border-purple-100/80",
    description:
      "Mid-page AI-ready 8:3 widescreen banner (Midjourney --ar 8:3 / 2048x768)",
  },
  {
    id: "popup",
    label: "Popup Banner Modal",
    width: 600,
    height: 400,
    aspectRatio: "3:2 (Standard)",
    recommendedSize: "600 x 400 px (3:2)",
    format: "WebP, JPG, PNG",
    maxSize: "2 MB",
    aliases: ["popup", "popup-modal"],
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeTabBg: "bg-emerald-600 text-white shadow-2xs",
    inactiveTabBg: "text-emerald-700 hover:bg-emerald-100/70 bg-emerald-50/40",
    cardBorder: "border-emerald-200/90",
    headerBg: "bg-emerald-50/70 text-emerald-950 border-emerald-100",
    submitBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    accentText: "text-emerald-600",
    subCardBg: "bg-emerald-50/30 border-emerald-100/80",
    description: "First-visit lightbox modal promotion for new users",
  },
];

const QUICK_COLORS = [
  { label: "Amber", hex: "#f59e0b" },
  { label: "Orange", hex: "#e85d04" },
  { label: "Blue", hex: "#2563eb" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Purple", hex: "#8b5cf6" },
  { label: "Dark Slate", hex: "#0f172a" },
  { label: "White", hex: "#ffffff" },
];

// 8 Distinct Colorful Row Palettes (Clearly visible without hover)
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

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  buttonText: "",
  image: "",
  logo: "",
  link: "",
  slot: "hero",
  priority: 0,
  isPaid: false,
  status: "active",
  textColor: "#ffffff",
  subtitleColor: "#fbbf24",
  buttonBgColor: "#f59e0b",
  buttonTextColor: "#0f172a",
  textPosition: "left",
};

export default function BannerManagement() {
  const {
    data: banners = [],
    isLoading: loading,
    refetch: fetchBanners,
  } = useAdminBanners();
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();
  const reorderBannersMutation = useReorderBanners();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...INITIAL_FORM, slot: "hero" });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (!editingId) {
      setForm((prev) => ({ ...prev, slot: tabId }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadFile(file, "banners");
      setForm((prev) => ({ ...prev, image: url }));
      showSuccess("Banner image uploaded successfully!");
    } catch (err) {
      showError("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadFile(file, "logos");
      setForm((prev) => ({ ...prev, logo: url }));
      showSuccess("Brand logo uploaded successfully!");
    } catch (err) {
      showError("Logo upload failed: " + err.message);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleStartEdit = (banner) => {
    setEditingId(banner._id);
    let resolvedSlot = banner.slot || "hero";
    if (resolvedSlot === "left-hero") resolvedSlot = "hero";
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      image: banner.image || "",
      logo: banner.logo || "",
      link: banner.link || "",
      slot: resolvedSlot,
      priority: banner.priority ?? 0,
      isPaid: Boolean(banner.isPaid),
      status: banner.status || "active",
      textColor: banner.textColor || "#ffffff",
      subtitleColor: banner.subtitleColor || "#fbbf24",
      buttonBgColor: banner.buttonBgColor || "#f59e0b",
      buttonTextColor: banner.buttonTextColor || "#0f172a",
      textPosition: banner.textPosition || "left",
    });
    setActiveTab(resolvedSlot);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...INITIAL_FORM, slot: activeTab });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.image) {
      return showError(
        "Banner Image is required. Please upload or provide an Image URL.",
      );
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        slot: form.slot || activeTab,
        priority: Number(form.priority),
        link: form.link ? form.link.trim() : "#",
      };

      if (editingId) {
        payload.id = editingId;
        await updateBannerMutation.mutateAsync(payload);
        showSuccess("Promo banner updated!");
      } else {
        await createBannerMutation.mutateAsync(payload);
        showSuccess("Promo banner added!");
      }
      handleCancelEdit();
    } catch (err) {
      showError(err.message || "An error occurred while saving the banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSponsored = async (bannerId, currentIsPaid) => {
    const nextIsPaid = !currentIsPaid;
    try {
      await updateBannerMutation.mutateAsync({
        id: bannerId,
        isPaid: nextIsPaid,
      });
      showSuccess(
        `Placement updated to ${nextIsPaid ? "Sponsored" : "Standard"}.`,
      );
    } catch {
      showError("Failed to update placement type.");
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateBannerMutation.mutateAsync({
        id: bannerId,
        status: nextStatus,
      });
      showSuccess(`Banner status updated to ${nextStatus}.`);
    } catch {
      showError("Failed to update status.");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const handleDeleteBanner = (banner) => {
    setDeleteTarget(banner);
  };

  const confirmDeleteBanner = async () => {
    if (!deleteTarget?._id) return;
    try {
      setDeletePending(true);
      await deleteBannerMutation.mutateAsync(deleteTarget._id);
      showSuccess("Banner deleted.");
    } catch (err) {
      showError(err.message || "Failed to delete banner.");
    } finally {
      setDeletePending(false);
      setDeleteTarget(null);
    }
  };

  const currentSlotConfig = SLOTS.find((s) => s.id === activeTab) || SLOTS[0];

  // Filter by slot and sort by priority descending
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        if (!currentSlotConfig) return true;
        const bSlot = b.slot || "hero";
        return (
          currentSlotConfig.aliases.includes(bSlot) ||
          (activeTab === "hero" && (bSlot === "left-hero" || bSlot === "hero"))
        );
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [banners, currentSlotConfig, activeTab]);

  const [draggedBannerId, setDraggedBannerId] = useState(null);
  const [dragOverBannerId, setDragOverBannerId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [editingPriorityId, setEditingPriorityId] = useState(null);
  const [priorityInputVal, setPriorityInputVal] = useState("");

  const syncReorderedList = async (reorderedSubset) => {
    try {
      setReordering(true);
      const bannerIds = reorderedSubset.map((b) => b._id);
      await reorderBannersMutation.mutateAsync(bannerIds);
    } catch (err) {
      showError(err.message || "Error saving banner order.");
    } finally {
      setReordering(false);
    }
  };

  const handleMoveToTop = async (bannerId) => {
    const list = [...filteredBanners];
    const index = list.findIndex((b) => b._id === bannerId);
    if (index <= 0) return;
    const [moved] = list.splice(index, 1);
    list.unshift(moved);
    await syncReorderedList(list);
  };

  const handleMoveStep = async (bannerId, delta) => {
    const list = [...filteredBanners];
    const index = list.findIndex((b) => b._id === bannerId);
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    await syncReorderedList(list);
  };

  const handleDragStart = (e, id) => {
    setDraggedBannerId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverBannerId !== id) {
      setDragOverBannerId(id);
    }
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    const sourceId = draggedBannerId || e.dataTransfer.getData("text/plain");
    setDraggedBannerId(null);
    setDragOverBannerId(null);
    if (!sourceId || sourceId === targetId) return;

    const list = [...filteredBanners];
    const fromIndex = list.findIndex((b) => b._id === sourceId);
    const toIndex = list.findIndex((b) => b._id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    await syncReorderedList(list);
  };

  const handleSavePriority = async (bannerId) => {
    const num = Number(priorityInputVal);
    if (Number.isNaN(num)) {
      setEditingPriorityId(null);
      return;
    }
    setEditingPriorityId(null);
    try {
      await updateBannerMutation.mutateAsync({ id: bannerId, priority: num });
      showSuccess("Priority updated.");
    } catch {
      showError("Failed to update priority.");
    }
  };

  const getSlotCount = (slotId) => {
    const slotObj = SLOTS.find((s) => s.id === slotId);
    if (!slotObj) return 0;
    return banners.filter((b) => {
      const bSlot = b.slot || "hero";
      return (
        slotObj.aliases.includes(bSlot) ||
        (slotId === "hero" && (bSlot === "left-hero" || bSlot === "hero"))
      );
    }).length;
  };

  const displayedBanners = useMemo(() => {
    if (!searchTableQuery.trim()) return filteredBanners;
    const q = searchTableQuery.toLowerCase();
    return filteredBanners.filter((b) => {
      return (
        (b.title || "").toLowerCase().includes(q) ||
        (b.subtitle || "").toLowerCase().includes(q) ||
        (b.link || "").toLowerCase().includes(q)
      );
    });
  }, [filteredBanners, searchTableQuery]);

  const stats = useMemo(() => {
    const heroCount = getSlotCount("hero");
    const trendingCount = getSlotCount("trending");
    const popupCount = getSlotCount("popup");
    const activeCount = banners.filter((b) => b.status === "active").length;
    return { heroCount, trendingCount, popupCount, activeCount };
  }, [banners]);

  return (
    <DashboardLayout
      title="Promo Banner Management"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Promo Banner Management
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Manage hero carousels, mid-page trending offers, and visitor
                popup banners with live drag-and-drop ordering.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBanners}
              disabled={loading}
              className="self-start sm:self-auto gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card
              onClick={() => handleTabChange("hero")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "hero"
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Top Hero Banners
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.heroCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Layout className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => handleTabChange("trending")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "trending"
                  ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Trending Offers
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.trendingCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => handleTabChange("popup")}
              className={cn(
                "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                activeTab === "popup"
                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300",
              )}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Popup Modals
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.popupCount}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Active Live
                  </span>
                  <span className="text-base font-medium text-amber-700 mt-0.5 block leading-none">
                    {stats.activeCount} / {banners.length}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slot Tabs & Upload Size Pill */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/80 overflow-x-auto w-full sm:w-auto shadow-2xs select-none">
              {SLOTS.map((slot) => {
                const count = getSlotCount(slot.id);
                const isActive = activeTab === slot.id;
                return (
                  <Tooltip key={slot.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleTabChange(slot.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 border-0",
                          isActive
                            ? "bg-white text-blue-600 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800 bg-transparent",
                        )}
                      >
                        <span>{slot.label}</span>
                        <span
                          className={cn(
                            "text-[9px] px-1 rounded-full",
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-200/70 text-slate-600",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                    >
                      {slot.description} • Optimal ratio: {slot.recommendedSize}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-2 flex-wrap text-[11px] bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs select-none">
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Upload Specs:</span>
              </div>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                {currentSlotConfig.width || 1200} x{" "}
                {currentSlotConfig.height || 430} px
              </span>
              <span className="text-slate-300 font-normal">|</span>
              <span className="text-slate-600 font-medium">
                Ratio:{" "}
                <span className="font-semibold text-slate-800">
                  {currentSlotConfig.aspectRatio || "2.8:1"}
                </span>
              </span>
              <span className="text-slate-300 font-normal">|</span>
              <span className="text-slate-500 text-[10px]">
                {currentSlotConfig.format || "WebP, JPG, PNG"} (Max{" "}
                {currentSlotConfig.maxSize || "2 MB"})
              </span>
              {currentSlotConfig.aiPromptTip && (
                <>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="text-purple-700 font-medium bg-purple-100/70 border border-purple-200/90 px-1.5 py-0.2 rounded text-[10px]">
                    ✨ AI:{" "}
                    <span className="font-semibold">
                      {currentSlotConfig.aiPromptTip}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Compact Form Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-2.5">
            <form onSubmit={handleSubmitForm} className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <h2 className="text-xs font-medium text-slate-900">
                    {editingId
                      ? `Edit Banner — ${currentSlotConfig.label}`
                      : `Add Banner to ${currentSlotConfig.label}`}
                  </h2>
                  {editingId && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9.5px] font-medium px-1.5 py-0.2 rounded">
                      Editing
                    </span>
                  )}
                </div>

                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-5.5 text-[11px] font-medium text-slate-600 hover:bg-white px-1.5 rounded gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </Button>
                )}
              </div>

              {/* Media Uploads Row */}
              <div
                className={`grid grid-cols-1 ${activeTab === "hero" ? "md:grid-cols-2" : ""} gap-2`}
              >
                {/* Banner Image */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Banner Image <span className="text-rose-500">*</span>
                      </label>
                      <span className="ml-2 text-[10px] text-slate-400 font-normal hidden sm:inline">
                        (Recommended: {currentSlotConfig.width || 1200} x{" "}
                        {currentSlotConfig.height || 430} px,{" "}
                        {currentSlotConfig.aspectRatio || "2.8:1"}
                        {currentSlotConfig.aiPromptTip
                          ? ` • AI: ${currentSlotConfig.aiPromptTip}`
                          : ""}
                        )
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => imageInputRef.current?.click()}
                      className="h-5 text-[10px] font-medium text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer gap-1 px-1.5 rounded"
                    >
                      {uploadingImage
                        ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        : <Upload className="w-2.5 h-2.5" />}
                      <span>
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </span>
                    </Button>
                  </div>
                  <Input
                    placeholder="https://images.unsplash.com/... or upload"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    required
                    className="h-7 text-xs border-slate-200 bg-white font-normal"
                  />
                </div>

                {/* Brand Logo (Hero Only) */}
                {activeTab === "hero" && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Brand Logo{" "}
                        <span className="text-slate-400 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="h-5 text-[10px] font-medium text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer gap-1 px-1.5 rounded"
                      >
                        {uploadingLogo
                          ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          : <Upload className="w-2.5 h-2.5" />}
                        <span>
                          {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        </span>
                      </Button>
                    </div>
                    <Input
                      placeholder="https://... logo thumbnail URL"
                      value={form.logo}
                      onChange={(e) =>
                        setForm({ ...form, logo: e.target.value })
                      }
                      className="h-7 text-xs border-slate-200 bg-white font-normal"
                    />
                  </div>
                )}
              </div>

              {/* Inputs & Customization */}
              {activeTab === "popup"
                ? <div className="space-y-0.5">
                    <label className="text-[10.5px] font-medium text-slate-700">
                      Destination Link{" "}
                      <span className="text-slate-400 font-normal">
                        (Redirects on click)
                      </span>
                    </label>
                    <Input
                      placeholder="e.g. /deals or https://..."
                      value={form.link}
                      onChange={(e) =>
                        setForm({ ...form, link: e.target.value })
                      }
                      className="h-7 text-xs border-slate-200 bg-white font-normal"
                    />
                  </div>
                : <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Headline / Title
                        </label>
                        <Input
                          placeholder="Overlay Title"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          className="h-7 text-xs border-slate-200 bg-white font-normal"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Tagline / Subtitle
                        </label>
                        <Input
                          placeholder="Overlay Subtitle"
                          value={form.subtitle}
                          onChange={(e) =>
                            setForm({ ...form, subtitle: e.target.value })
                          }
                          className="h-7 text-xs border-slate-200 bg-white font-normal"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Button CTA Text
                        </label>
                        <Input
                          placeholder="e.g. Explore Offer"
                          value={form.buttonText}
                          onChange={(e) =>
                            setForm({ ...form, buttonText: e.target.value })
                          }
                          className="h-7 text-xs border-slate-200 bg-white font-normal"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Destination Link
                        </label>
                        <Input
                          placeholder="e.g. /deals or https://..."
                          value={form.link}
                          onChange={(e) =>
                            setForm({ ...form, link: e.target.value })
                          }
                          className="h-7 text-xs border-slate-200 bg-white font-normal"
                        />
                      </div>
                    </div>

                    {/* Compact Color Controls Bar */}
                    <div className="bg-slate-50 p-2 rounded-lg space-y-1.5 border border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-600">
                              Button BG:
                            </span>
                            <input
                              type="color"
                              value={form.buttonBgColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  buttonBgColor: e.target.value,
                                })
                              }
                              className="w-5 h-5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                            />
                            <Input
                              value={form.buttonBgColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  buttonBgColor: e.target.value,
                                })
                              }
                              className="h-6 w-16 text-[10.5px] font-mono border-slate-200 bg-white px-1"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-600">
                              Button Text:
                            </span>
                            <input
                              type="color"
                              value={form.buttonTextColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  buttonTextColor: e.target.value,
                                })
                              }
                              className="w-5 h-5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                            />
                            <Input
                              value={form.buttonTextColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  buttonTextColor: e.target.value,
                                })
                              }
                              className="h-6 w-16 text-[10.5px] font-mono border-slate-200 bg-white px-1"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-600">
                              Headline:
                            </span>
                            <input
                              type="color"
                              value={form.textColor}
                              onChange={(e) =>
                                setForm({ ...form, textColor: e.target.value })
                              }
                              className="w-5 h-5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                            />
                            <Input
                              value={form.textColor}
                              onChange={(e) =>
                                setForm({ ...form, textColor: e.target.value })
                              }
                              className="h-6 w-16 text-[10.5px] font-mono border-slate-200 bg-white px-1"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-600">
                              Tagline:
                            </span>
                            <input
                              type="color"
                              value={form.subtitleColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  subtitleColor: e.target.value,
                                })
                              }
                              className="w-5 h-5 p-0 rounded border border-slate-300 cursor-pointer shrink-0"
                            />
                            <Input
                              value={form.subtitleColor}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  subtitleColor: e.target.value,
                                })
                              }
                              className="h-6 w-16 text-[10.5px] font-mono border-slate-200 bg-white px-1"
                            />
                          </div>
                        </div>

                        {/* Align Switcher */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-500">
                            Align:
                          </span>
                          <div className="flex bg-white rounded border border-slate-200 p-0.5">
                            {["left", "center", "right"].map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                onClick={() =>
                                  setForm({ ...form, textPosition: pos })
                                }
                                className={cn(
                                  "px-1.5 py-0.2 text-[9px] font-medium uppercase rounded cursor-pointer transition-all",
                                  form.textPosition === pos
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-600 hover:text-slate-900",
                                )}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Presets & Live Preview */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-slate-200/50">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] font-medium text-slate-500">
                            Presets:
                          </span>
                          {QUICK_COLORS.map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  buttonBgColor: c.hex,
                                  buttonTextColor:
                                    c.hex === "#ffffff" ? "#0f172a" : "#ffffff",
                                })
                              }
                              className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                            />
                          ))}
                        </div>

                        {(form.image || form.title || form.buttonText) && (
                          <div
                            className="relative w-full sm:w-56 rounded-md overflow-hidden border border-slate-300 bg-slate-950 shrink-0 shadow-2xs"
                            style={{
                              aspectRatio:
                                currentSlotConfig.width &&
                                currentSlotConfig.height
                                  ? `${currentSlotConfig.width} / ${currentSlotConfig.height}`
                                  : "2048 / 768",
                              maxHeight: "84px",
                            }}
                          >
                            {form.image
                              ? // biome-ignore lint/performance/noImgElement: banner preview
                                <img
                                  src={form.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-[9px]">
                                  No image
                                </div>}
                            <div
                              className={`absolute inset-0 flex flex-col justify-center px-2 gap-0.2 pointer-events-none ${
                                form.textPosition === "center"
                                  ? "items-center text-center bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"
                                  : form.textPosition === "right"
                                    ? "items-end text-right bg-gradient-to-l from-slate-950/80 via-slate-950/40 to-transparent"
                                    : "items-start text-left bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"
                              }`}
                            >
                              {form.subtitle && (
                                <span
                                  className="text-[8px] font-medium uppercase tracking-wider truncate max-w-full"
                                  style={{ color: form.subtitleColor }}
                                >
                                  {form.subtitle}
                                </span>
                              )}
                              {form.title && (
                                <h4
                                  className="text-[9px] font-medium leading-tight truncate max-w-full"
                                  style={{ color: form.textColor }}
                                >
                                  {form.title}
                                </h4>
                              )}
                              {form.buttonText && (
                                <span
                                  className="inline-flex items-center px-1 py-0.2 rounded text-[7px] font-medium shadow-2xs mt-0.5"
                                  style={{
                                    backgroundColor: form.buttonBgColor,
                                    color: form.buttonTextColor,
                                  }}
                                >
                                  {form.buttonText}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>}

              {/* Publishing & Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-1.5 px-2 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] font-medium text-slate-700 shrink-0">
                      Priority:
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value })
                      }
                      className="h-6.5 w-14 text-xs border-slate-200 bg-white px-1 text-center font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-700">
                      Sponsored:
                    </span>
                    <Switch
                      checked={form.isPaid}
                      onCheckedChange={(val) =>
                        setForm({ ...form, isPaid: val })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-700">
                      Active:
                    </span>
                    <Switch
                      checked={form.status === "active"}
                      onCheckedChange={(val) =>
                        setForm({
                          ...form,
                          status: val ? "active" : "inactive",
                        })
                      }
                    />
                  </div>
                </div>

                {/* Action Submit Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-7 px-2.5 text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7 px-3 cursor-pointer gap-1 shadow-2xs transition-all"
                  >
                    {saving
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : editingId
                        ? <Pencil className="w-3 h-3" />
                        : <Plus className="w-3 h-3" />}
                    <span>
                      {editingId
                        ? `Update Banner`
                        : `Add Banner (${currentSlotConfig?.label})`}
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Table Container Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left overflow-hidden">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${currentSlotConfig?.label} banners...`}
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
                {searchTableQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchTableQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {displayedBanners.length} results
                </span>
                <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 hidden md:inline-flex items-center gap-1">
                  <GripVertical className="w-3 h-3 text-blue-500" />
                  <span>Drag rows or use 1-Click Top to reorder</span>
                </span>
                {reordering && (
                  <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing order...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Drag & Drop Table - Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 text-center w-24">
                      Order &amp; Move
                    </th>
                    <th className="py-2 px-3">Banner Preview &amp; Details</th>
                    {activeTab === "hero" && (
                      <th className="py-2 px-2 text-center w-16">Brand Logo</th>
                    )}
                    {activeTab !== "popup" && (
                      <>
                        <th className="py-2 px-2 text-center w-28">
                          Colors &amp; Align
                        </th>
                        <th className="py-2 px-2 text-center w-24">
                          Button CTA
                        </th>
                      </>
                    )}
                    <th className="py-2 px-2 text-center w-18">Priority</th>
                    <th className="py-2 px-2 text-center w-24">Placement</th>
                    <th className="py-2 px-2 text-center w-20">Status</th>
                    <th className="py-2 px-3 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading
                    ? <tr>
                        <td
                          colSpan={10}
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                          Loading promotional banners...
                        </td>
                      </tr>
                    : displayedBanners.length === 0
                      ? <tr>
                          <td
                            colSpan={10}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            No promotional banners found for{" "}
                            {currentSlotConfig?.label}.
                          </td>
                        </tr>
                      : displayedBanners.map((r, index) => {
                          const isDragging = draggedBannerId === r._id;
                          const isOver = dragOverBannerId === r._id;
                          const isTop = index === 0;
                          const isBottom =
                            index === displayedBanners.length - 1;
                          const theme =
                            ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];

                          return (
                            <tr
                              key={r._id}
                              draggable={!searchTableQuery}
                              onDragStart={(e) => handleDragStart(e, r._id)}
                              onDragOver={(e) => handleDragOver(e, r._id)}
                              onDrop={(e) => handleDrop(e, r._id)}
                              onDragEnd={() => {
                                setDraggedBannerId(null);
                                setDragOverBannerId(null);
                              }}
                              className={cn(
                                "transition-all duration-150",
                                isDragging
                                  ? "opacity-30 bg-blue-100"
                                  : isOver
                                    ? "bg-blue-100/90 ring-2 ring-blue-500 ring-inset"
                                    : theme.row,
                              )}
                            >
                              {/* 1. Order & Reorder Controls */}
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Drag Handle */}
                                  <span
                                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
                                    title="Drag to reorder slide position"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </span>

                                  {/* Rank Badge */}
                                  <span
                                    className="text-[10px] font-medium px-1.5 py-0.2 rounded-md border shrink-0 bg-white text-slate-900 border-slate-300 shadow-2xs"
                                    title={`Display Rank #${index + 1}`}
                                  >
                                    #{index + 1}
                                  </span>

                                  {/* 1-Click Move to Top Button */}
                                  {!isTop && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleMoveToTop(r._id)}
                                          type="button"
                                          className="p-1 text-amber-700 bg-white hover:bg-amber-50 rounded transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                                        >
                                          <ArrowUpToLine className="w-3 h-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                      >
                                        Move to Top (#1 Slide)
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* Step Move Up/Down Buttons */}
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      onClick={() => handleMoveStep(r._id, -1)}
                                      disabled={isTop}
                                      type="button"
                                      className={cn(
                                        "p-0.5 rounded transition-colors bg-white border border-slate-200",
                                        isTop
                                          ? "text-slate-300 cursor-not-allowed opacity-50"
                                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer shadow-2xs",
                                      )}
                                      title="Move Up 1 slot"
                                    >
                                      <ArrowUp className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveStep(r._id, 1)}
                                      disabled={isBottom}
                                      type="button"
                                      className={cn(
                                        "p-0.5 rounded transition-colors bg-white border border-slate-200",
                                        isBottom
                                          ? "text-slate-300 cursor-not-allowed opacity-50"
                                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer shadow-2xs",
                                      )}
                                      title="Move Down 1 slot"
                                    >
                                      <ArrowDown className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Banner Preview & Details */}
                              <td className="py-2 px-3 max-w-[280px] lg:max-w-[340px]">
                                <div className="flex items-center gap-2.5">
                                  {r.image
                                    ? // biome-ignore lint/performance/noImgElement: banner thumbnail
                                      <img
                                        src={r.image}
                                        alt={r.title || "Banner"}
                                        className={cn(
                                          "object-cover rounded-md border border-slate-200 bg-white shadow-2xs shrink-0",
                                          activeTab === "trending"
                                            ? "w-16 h-6"
                                            : activeTab === "popup"
                                              ? "w-12 h-8"
                                              : "w-14 h-7",
                                        )}
                                      />
                                    : <div
                                        className={cn(
                                          "bg-white rounded-md flex items-center justify-center text-slate-400 text-[9px] shrink-0 border border-slate-200",
                                          activeTab === "trending"
                                            ? "w-16 h-6"
                                            : activeTab === "popup"
                                              ? "w-12 h-8"
                                              : "w-14 h-7",
                                        )}
                                      >
                                        No Image
                                      </div>}
                                  <div className="min-w-0 flex-1">
                                    <span className="font-medium text-slate-900 text-[11.5px] truncate block leading-tight">
                                      {r.title || (
                                        <span className="text-slate-500 font-normal italic">
                                          Pure Image Banner (No Text Overlay)
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[9.5px] text-slate-600 font-normal truncate block leading-tight mt-0.5">
                                      {r.subtitle ||
                                        (r.link && r.link !== "#"
                                          ? r.link
                                          : "No Destination Link")}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Brand Logo */}
                              {activeTab === "hero" && (
                                <td className="py-2 px-2 text-center">
                                  <div className="flex justify-center">
                                    {r.logo
                                      ? // biome-ignore lint/performance/noImgElement: logo thumbnail
                                        <img
                                          src={r.logo}
                                          alt="Logo"
                                          className="w-5 h-5 object-contain rounded border border-slate-200 p-0.5 bg-white shadow-2xs"
                                        />
                                      : <span className="text-[10px] text-slate-400">
                                          —
                                        </span>}
                                  </div>
                                </td>
                              )}

                              {/* 4. Custom Colors */}
                              {activeTab !== "popup" && (
                                <>
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <div
                                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                                        style={{
                                          backgroundColor:
                                            r.buttonBgColor || "#f59e0b",
                                        }}
                                        title={`Button BG: ${r.buttonBgColor || "#f59e0b"}`}
                                      />
                                      <div
                                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                                        style={{
                                          backgroundColor:
                                            r.subtitleColor || "#fbbf24",
                                        }}
                                        title={`Subtitle: ${r.subtitleColor || "#fbbf24"}`}
                                      />
                                      <span className="text-[9px] font-medium uppercase text-slate-700 bg-white/95 px-1 py-0.2 rounded border border-slate-200 shadow-2xs">
                                        {r.textPosition || "left"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* 5. Button CTA */}
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex justify-center">
                                      {r.buttonText
                                        ? <span
                                            className="text-[9.5px] font-medium px-1.5 py-0.5 rounded shadow-2xs max-w-[85px] truncate block"
                                            style={{
                                              backgroundColor:
                                                r.buttonBgColor || "#f59e0b",
                                              color:
                                                r.buttonTextColor || "#0f172a",
                                            }}
                                          >
                                            {r.buttonText}
                                          </span>
                                        : <span className="text-[10px] text-slate-400">
                                            —
                                          </span>}
                                    </div>
                                  </td>
                                </>
                              )}

                              {/* 6. Priority with Inline Quick-Edit */}
                              <td className="py-2 px-2 text-center">
                                {editingPriorityId === r._id
                                  ? <div className="flex items-center justify-center gap-1">
                                      <input
                                        type="number"
                                        autoFocus
                                        value={priorityInputVal}
                                        onChange={(e) =>
                                          setPriorityInputVal(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            handleSavePriority(r._id);
                                          if (e.key === "Escape")
                                            setEditingPriorityId(null);
                                        }}
                                        onBlur={() => handleSavePriority(r._id)}
                                        className="w-12 text-center text-xs font-medium border border-blue-500 rounded py-0.5 outline-none bg-white shadow-2xs"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSavePriority(r._id)
                                        }
                                        className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    </div>
                                  : <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPriorityId(r._id);
                                        setPriorityInputVal(
                                          String(r.priority ?? 0),
                                        );
                                      }}
                                      className="inline-flex items-center justify-center text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-300/90 hover:bg-white transition-colors cursor-pointer shadow-2xs"
                                      title="Click to edit priority number"
                                    >
                                      {r.priority ?? 0}
                                    </button>}
                              </td>

                              {/* 7. Placement Type Toggle */}
                              <td className="py-2 px-2 text-center">
                                <div className="flex justify-center items-center gap-1.5">
                                  <Switch
                                    size="sm"
                                    checked={Boolean(r.isPaid)}
                                    onCheckedChange={() =>
                                      handleToggleSponsored(r._id, r.isPaid)
                                    }
                                    aria-label="Toggle Sponsored placement"
                                  />
                                  {r.isPaid
                                    ? <span className="text-[9px] font-medium bg-white/95 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded shadow-2xs">
                                        Sponsored
                                      </span>
                                    : <span className="text-[9px] font-normal text-slate-600 bg-white/95 border border-slate-200 px-1.5 py-0.2 rounded shadow-2xs">
                                        Standard
                                      </span>}
                                </div>
                              </td>

                              {/* 8. Status */}
                              <td className="py-2 px-2 text-center">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block whitespace-nowrap",
                                    r.status === "active"
                                      ? "bg-white/95 text-emerald-700 border-emerald-300"
                                      : "bg-white/95 text-slate-600 border-slate-300",
                                  )}
                                >
                                  {r.status || "active"}
                                </span>
                              </td>

                              {/* 9. Actions */}
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStartEdit(r)}
                                        className="h-6.5 w-6.5 p-0 text-slate-700 bg-white border-slate-200 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-200 rounded-md cursor-pointer flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                                      >
                                        <Pencil className="w-3 h-3" />
                                        <span className="sr-only">
                                          Edit Banner
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                    >
                                      Edit Banner Content &amp; Design
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteBanner(r)}
                                        className="h-6.5 w-6.5 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span className="sr-only">
                                          Delete Banner
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md"
                                    >
                                      Delete Banner Permanently
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View - Banners (Reference Card Design) */}
            <div className="md:hidden space-y-3">
              {loading
                ? <div className="py-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-blue-500" />
                    Loading promotional banners...
                  </div>
                : displayedBanners.length === 0
                  ? <div className="py-8 text-center text-slate-400 text-xs">
                      No promotional banners found for{" "}
                      {currentSlotConfig?.label}.
                    </div>
                  : displayedBanners.map((r, index) => (
                      <MobileTableCard
                        key={r._id}
                        avatar={
                          r.image
                            ? <div className="relative shrink-0">
                                <img
                                  src={r.image}
                                  alt={r.title || "Banner"}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs"
                                />
                                <span className="absolute -top-1.5 -left-1.5 text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md shadow">
                                  #{index + 1}
                                </span>
                              </div>
                            : null
                        }
                        avatarText={!r.image ? `#${index + 1}` : undefined}
                        avatarBg="bg-indigo-600"
                        badge={
                          currentSlotConfig?.label?.toUpperCase() ||
                          "PROMO BANNER"
                        }
                        title={r.title || "Banner Offer"}
                        subtitle={
                          r.subtitle ||
                          (r.link && r.link !== "#" ? r.link : "Banner Offer")
                        }
                        fields={[
                          {
                            label: "RANK / SLOT",
                            value: `#${index + 1} (${r.slot || activeTab})`,
                          },
                          {
                            label: "PRIORITY",
                            value: `P:${r.priority ?? 0}`,
                            isCode: true,
                          },
                          {
                            label: "STATUS",
                            value: r.status || "active",
                            isStatus: true,
                            statusType:
                              r.status === "active" ? "success" : "neutral",
                          },
                          {
                            label: "TYPE",
                            value: r.isPaid ? "Sponsored" : "Standard",
                          },
                        ]}
                        actions={
                          <div className="space-y-2 pt-1">
                            {/* Reorder controls row */}
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <span className="text-[10.5px] font-semibold text-slate-500 pl-1.5">
                                Reorder:
                              </span>
                              <div className="flex items-center gap-1.5">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveToTop(r._id)}
                                    className="p-1.5 text-amber-700 bg-white hover:bg-amber-50 rounded-lg border border-amber-200 shadow-2xs cursor-pointer"
                                    title="Move to Top"
                                  >
                                    <ArrowUpToLine className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleMoveStep(r._id, -1)}
                                  disabled={index === 0}
                                  className={cn(
                                    "p-1.5 rounded-lg border",
                                    index === 0
                                      ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-300"
                                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-slate-200 bg-white cursor-pointer shadow-2xs",
                                  )}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveStep(r._id, 1)}
                                  disabled={
                                    index === displayedBanners.length - 1
                                  }
                                  className={cn(
                                    "p-1.5 rounded-lg border",
                                    index === displayedBanners.length - 1
                                      ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-300"
                                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-slate-200 bg-white cursor-pointer shadow-2xs",
                                  )}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Action buttons row */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteBanner(r)}
                                className="w-24 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer select-none"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(r)}
                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl py-2.5 px-4 flex items-center justify-between text-xs transition-colors cursor-pointer select-none"
                              >
                                <span>Edit Banner</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        }
                      />
                    ))}
            </div>
          </Card>
        </div>

        <ConfirmDeleteModal
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Promotional Banner"
          itemName={deleteTarget?.title || deleteTarget?.slot}
          onConfirm={confirmDeleteBanner}
          isPending={deletePending}
        />
      </TooltipProvider>
    </DashboardLayout>
  );
}
