"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Bell,
  BellOff,
  Smartphone,
  Monitor,
  Users,
  UserCheck,
  Send,
  RefreshCw,
  TestTube,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch } from "@/lib/fetcher";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useUser } from "@/hooks/use-user";

// ─── Preset templates ────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: "new-product",
    label: "New deal",
    title: "New deal just dropped!",
    body: "A fresh verified offer is live on Vouchiqo. Check it out before it expires.",
    category: "campaign",
  },
  {
    id: "announcement",
    label: "Announcement",
    title: "Important update from Vouchiqo",
    body: "We have an important platform update you should know about.",
    category: "system",
  },
  {
    id: "blog",
    label: "Blog / News",
    title: "New content published",
    body: "We just published a new post. Click to read it now.",
    category: "general",
  },
  {
    id: "offer",
    label: "Special offer",
    title: "Limited-time special offer!",
    body: "An exclusive deal is available for a limited time. Grab it now!",
    category: "campaign",
  },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All devices" },
  { value: "users", label: "Registered users only" },
  { value: "guests", label: "Guest visitors only" },
];

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "campaign", label: "Campaign / Offer" },
  { value: "system", label: "System" },
  { value: "billing", label: "Billing" },
];

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconClass, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        <p className="text-base font-bold text-slate-800 leading-none mt-0.5">
          {loading ? (
            <span className="inline-block w-8 h-4 bg-slate-200 animate-pulse rounded" />
          ) : (
            (value ?? 0).toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Confirmation modal ──────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, form, stats, sending }) {
  if (!open) return null;

  const audienceLabel =
    AUDIENCE_OPTIONS.find((a) => a.value === form.audience)?.label ||
    form.audience;
  const estimated =
    form.audience === "all"
      ? stats?.activeDevices
      : form.audience === "users"
        ? stats?.registeredUsers
        : stats?.guestDevices;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-xs font-semibold text-slate-800">
            Confirm broadcast
          </h3>
        </div>

        <div className="space-y-1.5 bg-slate-50 rounded-lg p-2.5 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Title</span>
            <span className="font-medium text-slate-700 max-w-[60%] text-right truncate">
              {form.title}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Audience</span>
            <span className="font-medium text-slate-700">{audienceLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated devices</span>
            <span className="font-bold text-blue-600">
              ~{(estimated ?? 0).toLocaleString()}
            </span>
          </div>
          {form.url && (
            <div className="flex justify-between">
              <span className="text-slate-500">Click URL</span>
              <span className="font-medium text-slate-700 max-w-[60%] text-right truncate">
                {form.url}
              </span>
            </div>
          )}
          {form.image && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Banner</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Cloudinary 2:1
                </span>
                <img
                  src={form.image}
                  alt="Banner preview"
                  className="w-12 h-6 object-cover rounded border border-slate-200 shadow-2xs"
                />
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          This will send a real push notification to all matching devices.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {sending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Send now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live preview ─────────────────────────────────────────────────────────────
function NotificationPreview({ form, previewMode }) {
  const isMobile = previewMode === "mobile";

  return (
    <div
      className={`bg-slate-100 rounded-lg p-3 flex items-center justify-center transition-all duration-200 ${
        isMobile ? "min-h-[160px]" : "min-h-[140px]"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all ${
          isMobile ? "w-[240px]" : "w-[300px]"
        }`}
      >
        {/* Notification header */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border-b border-slate-100">
          <img
            src="/navbarlogovouchiqo.webp"
            alt="Vouchiqo"
            className="w-3.5 h-3.5 rounded object-contain"
          />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
            Vouchiqo · now
          </span>
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-0.5">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {form.title || "Notification title"}
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
            {form.body || "Your notification message will appear here."}
          </p>
        </div>

        {/* Banner image preview */}
        {form.image && (
          <div className="aspect-[2/1] w-full overflow-hidden border-t border-slate-100">
            <img
              src={form.image}
              alt="Banner preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPushNotificationsPage() {
  const { user } = useUser();
  const [previewMode, setPreviewMode] = useState("desktop");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Push notification hook for "test on this browser"
  const {
    isSupported,
    isSubscribed,
    token,
    loading: pushLoading,
    requestPermission,
  } = usePushNotifications({ userId: user?.id });

  const [form, setForm] = useState({
    title: "",
    body: "",
    url: "",
    image: "",
    category: "general",
    audience: "all",
  });

  const titleMax = 80;
  const bodyMax = 240;

  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const uploadFileToCloudinary = async (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, WebP, or GIF).");
      setResult({ ok: false, message: "Please select a JPEG, PNG, or WebP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5 MB.");
      setResult({ ok: false, message: "Image size must be less than 5 MB." });
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "push_banners");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      const imageUrl = json.data?.url || json.data?.secure_url;
      if (res.ok && imageUrl) {
        handleFormChange("image", imageUrl);
        toast.success("Banner uploaded to Cloudinary successfully!");
        setResult({ ok: true, message: "Push banner uploaded to Cloudinary successfully!" });
      } else {
        toast.error(json.message || "Failed to upload image to Cloudinary.");
        setResult({ ok: false, message: json.message || "Failed to upload image to Cloudinary." });
      }
    } catch {
      toast.error("Network error during Cloudinary upload.");
      setResult({ ok: false, message: "Network error during Cloudinary upload." });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePushImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFileToCloudinary(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFileToCloudinary(file);
  };

  const handleCopyImageUrl = () => {
    if (!form.image) return;
    navigator.clipboard.writeText(form.image);
    setCopiedUrl(true);
    toast.success("Cloudinary URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Stats query
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-push-stats"],
    queryFn: () => apiFetch("/api/admin/push/stats").then((r) => r.data),
    staleTime: 30000,
    retry: 2,
  });

  function applyPreset(preset) {
    setForm((f) => ({
      ...f,
      title: preset.title,
      body: preset.body,
      category: preset.category,
    }));
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleTestOnBrowser() {
    if (!isSubscribed && !pushLoading) {
      await requestPermission();
    }
    if (!token) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          audience: "test",
          testToken: token,
          title: form.title || "Test notification",
          body: form.body || "This is a test from the Vouchiqo admin panel.",
        }),
      });
      const json = await res.json();
      setResult({
        ok: res.ok,
        message: res.ok
          ? `Test sent! (${json.data?.sent ?? 1} device)`
          : json.message || "Failed to send test",
      });
    } catch {
      setResult({ ok: false, message: "Network error sending test" });
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    if (!form.title || !form.body) return;
    setConfirmOpen(true);
  }

  async function confirmSend() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setConfirmOpen(false);
      setResult({
        ok: res.ok,
        message: res.ok
          ? `Sent to ${json.data?.sent ?? 0} device(s). ${json.data?.pruned ? `${json.data.pruned} stale tokens pruned.` : ""}`
          : json.message || "Failed to broadcast",
      });
      if (res.ok) {
        refetchStats();
        setForm((f) => ({ ...f, title: "", body: "", url: "", image: "" }));
      }
    } catch {
      setResult({ ok: false, message: "Network error during broadcast" });
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  }

  const canSend = form.title.trim().length > 0 && form.body.trim().length > 0;

  return (
    <DashboardLayout title="Push Notifications">
      <div className="w-full space-y-2.5 font-sans text-left">

        {/* Page header */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">
              Push notification hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compose and broadcast web push notifications to your subscribers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchStats()}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Result banner */}
        {result && (
          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium border ${
              result.ok
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{result.message}</span>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="ml-auto text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            label="Active devices"
            value={stats?.activeDevices}
            icon={Bell}
            iconClass="bg-blue-50 text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            label="Registered users"
            value={stats?.registeredUsers}
            icon={UserCheck}
            iconClass="bg-green-50 text-green-600"
            loading={statsLoading}
          />
          <StatCard
            label="Guest visitors"
            value={stats?.guestDevices}
            icon={Users}
            iconClass="bg-purple-50 text-purple-600"
            loading={statsLoading}
          />
          <StatCard
            label="Cleaned / revoked"
            value={stats?.revokedTokens}
            icon={BellOff}
            iconClass="bg-slate-100 text-slate-500"
            loading={statsLoading}
          />
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-2.5 items-start">

          {/* Left — compose form */}
          <div className="space-y-2.5">

            {/* Test on this browser */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Test on this browser
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {!isSupported
                    ? "Push not supported in this browser."
                    : isSubscribed
                      ? "Your device is subscribed. Click to send a test push."
                      : "Subscribe first, then send a test push to yourself."}
                </p>
              </div>
              <button
                id="push-test-btn"
                type="button"
                onClick={handleTestOnBrowser}
                disabled={!isSupported || sending || pushLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                {sending || pushLoading ? (
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <TestTube className="w-3.5 h-3.5" />
                )}
                {isSubscribed ? "Send test" : "Subscribe & test"}
              </button>
            </div>

            {/* Quick presets */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-slate-700 mb-1.5">
                Quick templates
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-md transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compose form */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                Compose notification
              </p>

              {/* Category + Audience row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Target audience
                  </label>
                  <div className="relative">
                    <select
                      value={form.audience}
                      onChange={(e) => handleFormChange("audience", e.target.value)}
                      className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {AUDIENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    Title
                  </label>
                  <span className={`text-[11px] ${form.title.length > titleMax ? "text-red-500" : "text-slate-400"}`}>
                    {form.title.length}/{titleMax}
                  </span>
                </div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value.slice(0, titleMax))}
                  placeholder="Notification title..."
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    Message
                  </label>
                  <span className={`text-[11px] ${form.body.length > bodyMax ? "text-red-500" : "text-slate-400"}`}>
                    {form.body.length}/{bodyMax}
                  </span>
                </div>
                <textarea
                  value={form.body}
                  onChange={(e) => handleFormChange("body", e.target.value.slice(0, bodyMax))}
                  placeholder="Your message to subscribers..."
                  rows={2}
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    Click destination URL
                  </span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => handleFormChange("url", e.target.value)}
                  placeholder="https://vouchiqo.com/offers"
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Banner image with Cloudinary Upload */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`space-y-2 p-3 bg-slate-50 border rounded-lg transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Banner image</span>
                  </label>
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                    Ratio 2:1 (1024 × 512 px)
                  </span>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePushImageUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                {/* Upload action bar or Preview */}
                {form.image ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs group">
                      <div className="aspect-[2/1] w-full max-h-[140px] overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src={form.image}
                          alt="Uploaded Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="p-2 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cloudinary 2:1
                          </span>
                          <span className="text-[11px] text-slate-500 truncate font-mono">
                            {form.image}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={handleCopyImageUrl}
                            title="Copy image URL"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            {copiedUrl ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={form.image}
                            target="_blank"
                            rel="noreferrer"
                            title="Open image in new tab"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            title="Replace Image"
                            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormChange("image", "")}
                            title="Remove image"
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-100/40"
                        : "border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <p className="text-xs font-semibold text-blue-700">
                            Uploading to Cloudinary CDN...
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Optimizing format and quality...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-0.5">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-semibold text-slate-700">
                            <span className="text-blue-600 hover:underline">Upload via Cloudinary</span> or drag and drop
                          </p>
                          <p className="text-[11px] text-slate-400">
                            PNG, JPG, WebP up to 5MB (Auto 2:1 Banner)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* CDN URL input fallback */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => handleFormChange("image", e.target.value)}
                    placeholder="Or paste Cloudinary image URL directly..."
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Send button */}
              <button
                id="push-broadcast-btn"
                type="button"
                onClick={handleSend}
                disabled={!canSend || sending}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Push
              </button>
            </div>
          </div>

          {/* Right — live preview & audience summary */}
          <div className="space-y-2.5">
            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
              {/* Preview mode toggle */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-700">
                  Live preview
                </p>
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      previewMode === "desktop"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      previewMode === "mobile"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </button>
                </div>
              </div>

              <NotificationPreview form={form} previewMode={previewMode} />

              {/* Banner aspect-ratio hint */}
              {form.image && (
                <div className="mt-2 aspect-[2/1] w-full overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                  <img
                    src={form.image}
                    alt="Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Audience summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Audience summary
              </p>
              {[
                { label: "Active devices", val: stats?.activeDevices },
                { label: "Registered users", val: stats?.registeredUsers },
                { label: "Guest visitors", val: stats?.guestDevices },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-700">
                    {statsLoading ? "—" : (val ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-1.5 flex justify-between text-xs">
                <span className="text-slate-500">Selected audience</span>
                <span className="font-bold text-blue-600">
                  {statsLoading
                    ? "—"
                    : (form.audience === "all"
                        ? stats?.activeDevices
                        : form.audience === "users"
                          ? stats?.registeredUsers
                          : stats?.guestDevices ?? 0
                      )?.toLocaleString() ?? 0}
                  {" "}device(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSend}
        form={form}
        stats={stats}
        sending={sending}
      />
    </DashboardLayout>
  );
}
