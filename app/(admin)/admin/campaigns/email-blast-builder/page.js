"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Store,
  Trash2,
  Upload,
  UploadCloud,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBroadcastRecipients } from "@/hooks/use-admin";

export default function EmailBlastBuilderPage() {
  const [headline, setHeadline] = useState(
    "Weekend Mega Shopping Carnival — Flat 25% OFF!",
  );
  const [subject, setSubject] = useState(
    "🎁 Weekend Special: Flat 25% OFF on Top Verified Stores in Ranchi!",
  );
  const [description, setDescription] = useState(
    "Explore exclusive limited-period discounts on dining, fashion, and home upgrades. Claim your verified voucher online and redeem at the store counter.",
  );
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
  );
  const [offerCode, setOfferCode] = useState("CARNIVAL25");
  const [ctaUrl, setCtaUrl] = useState("https://vouchiqo.com/deals");
  const [testEmail, setTestEmail] = useState("admin@vouchiqo.com");
  const [recipientType, setRecipientType] = useState("all"); // "all" | "users" | "merchants"

  // Real DB Data & Loading States
  const { data: recipientsData, isLoading: loadingRecipients } =
    useBroadcastRecipients();

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const fileInputRef = useRef(null);



  // Cloudinary Direct Image Upload Handler
  const handleBannerFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return toast.error("Please select a JPEG, PNG, or WebP image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image file size must be less than 5 MB.");
    }

    try {
      setIsUploadingBanner(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "email_banners");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const imageUrl = json.data?.url || json.data?.secure_url;
      if (res.ok && imageUrl) {
        setBannerUrl(imageUrl);
        toast.success("Banner image uploaded to Cloudinary CDN successfully!");
      } else {
        toast.error(json.message || "Failed to upload image to Cloudinary.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      toast.error("Network error while uploading banner to Cloudinary.");
    } finally {
      setIsUploadingBanner(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Send test email via Resend
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      return toast.error("Please enter a valid test email address.");
    }
    try {
      setIsSendingTest(true);
      const res = await fetch("/api/admin/broadcast/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          headline,
          description,
          bannerUrl,
          offerCode,
          ctaUrl,
          isTest: true,
          testEmail,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Test email sent to ${testEmail} via Resend!`);
      } else {
        toast.error(json.error || "Failed to send test email.");
      }
    } catch (err) {
      console.error("Test send error:", err);
      toast.error("Network error while sending test email.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const totalUsers = recipientsData?.totalUsers || 0;
  const totalMerchants = recipientsData?.totalMerchants || 0;
  const totalRecipients = recipientsData?.totalRecipients || totalUsers + totalMerchants;

  const currentAudienceCount =
    recipientType === "users"
      ? totalUsers
      : recipientType === "merchants"
        ? totalMerchants
        : totalRecipients;

  const audienceLabel =
    recipientType === "users"
      ? "Registered Shoppers"
      : recipientType === "merchants"
        ? "Partner Merchants"
        : "All Platform Members";

  // Broadcast live email to real registered users/merchants in DB via Resend
  const handleLiveBroadcast = async () => {
    if (!subject.trim()) {
      return toast.error("Email subject line is required.");
    }
    const confirmSend = window.confirm(
      `Send live promotional email to ${currentAudienceCount > 0 ? currentAudienceCount : "all"} ${audienceLabel} via Resend?`,
    );
    if (!confirmSend) return;

    try {
      setIsBroadcasting(true);
      const res = await fetch("/api/admin/broadcast/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          headline,
          description,
          bannerUrl,
          offerCode,
          ctaUrl,
          recipientType,
          syncInAppNotification: true,
          isTest: false,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data?.isSandboxMode) {
          toast.success(
            json.message || `Broadcast sent! ${json.data.inAppNotifiedCount || 0} Shoppers received In-App notifications.`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            json.message || `Live broadcast sent to ${audienceLabel} via Resend!`,
          );
        }
      } else {
        toast.error(json.error || json.message || "Failed to dispatch email broadcast.");
      }
    } catch (err) {
      console.error("Broadcast dispatch error:", err);
      toast.error("Network error while dispatching broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <DashboardLayout
      title="Platform Email Blast Builder"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="p-1 h-7.5 w-7.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-rose-50 cursor-pointer shrink-0 shadow-2xs border border-rose-200/80"
              >
                <Link href="/admin/campaigns/queue">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Platform Email Blast Builder</span>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-medium px-2 py-0.5 rounded shadow-2xs">
                    Resend + Cloudinary
                  </span>
                </h1>
                <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                  Design promotional email broadcasts and dispatch directly to registered platform users &amp; merchants via Resend.
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTest}
                    disabled={isSendingTest}
                    className="gap-1.5 h-7.5 px-3 text-xs font-medium border-rose-200 text-rose-700 bg-white hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Send className={cn("w-3 h-3 text-rose-600", isSendingTest && "animate-spin")} />
                    <span>{isSendingTest ? "Sending Test..." : "Send Test Copy"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                  Send test copy to {testEmail}
                </TooltipContent>
              </Tooltip>

              <Button
                size="sm"
                onClick={handleLiveBroadcast}
                disabled={isBroadcasting}
                className="gap-1.5 h-7.5 px-3.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <Mail className={cn("w-3 h-3", isBroadcasting && "animate-spin")} />
                <span>
                  {isBroadcasting
                    ? "Broadcasting..."
                    : `Send Blast (${currentAudienceCount} ${recipientType === "merchants" ? "Merchants" : recipientType === "users" ? "Shoppers" : "Members"})`}
                </span>
              </Button>
            </div>
          </div>

          {/* Resend Sandbox Notice */}
          {recipientsData?.providerInfo?.isSandboxMode && (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-semibold">Resend Sandbox Active:</span> External recipient emails (like registered shoppers) are restricted by Resend until your sending domain (<code className="bg-amber-100/90 px-1 py-0.5 rounded font-mono text-[11px]">vouchiqo.com</code>) is verified on{" "}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium text-amber-800 hover:text-amber-950"
                >
                  resend.com/domains
                </a>
                .
                <span className="block mt-0.5 text-amber-700">
                  ⚡ All live broadcasts automatically dispatch <strong>In-App Notifications</strong> to all selected shoppers in their notification bell!
                </span>
              </div>
            </div>
          )}

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-rose-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Registered Users in DB
                  </span>
                  <span className="text-base font-medium text-rose-700 mt-0.5 block leading-none font-mono">
                    {loadingRecipients ? "..." : totalUsers}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-rose-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Registered Merchants
                  </span>
                  <span className="text-base font-medium text-pink-700 mt-0.5 block leading-none font-mono">
                    {loadingRecipients ? "..." : totalMerchants}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 border border-pink-200/60 flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-rose-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Selected Target Audience
                  </span>
                  <span className="text-xs font-medium text-emerald-700 mt-0.5 block leading-none truncate max-w-[130px]">
                    {audienceLabel}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-rose-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Total Selected
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none font-mono">
                    {loadingRecipients ? "..." : currentAudienceCount} Recipients
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Audience Selection Badges (Users / Merchants / All) */}
          <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-800">
                Target Audience Selection:
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Click to switch recipient group)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                {
                  id: "all",
                  label: "All Platform Members",
                  count: totalRecipients,
                  desc: "Send to both registered shoppers & merchants",
                },
                {
                  id: "users",
                  label: "Registered Shoppers",
                  count: totalUsers,
                  desc: "Send only to registered consumer accounts",
                },
                {
                  id: "merchants",
                  label: "Partner Merchants",
                  count: totalMerchants,
                  desc: "Send only to registered store partners",
                },
              ].map((badge) => {
                const isSelected = recipientType === badge.id;
                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setRecipientType(badge.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs border",
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white text-slate-700 border-rose-200 hover:bg-rose-50/80 hover:text-rose-900",
                        )}
                      >
                        <span>{badge.label}</span>
                        <span
                          className={cn(
                            "text-[9.5px] px-1.5 py-0.2 rounded-full font-mono",
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-rose-100 text-rose-800",
                          )}
                        >
                          {loadingRecipients ? "..." : badge.count}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                      {badge.desc}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* 2-Column Builder: Left (Edit Fields), Right (Live HTML Email Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* Left Form: Compact & Clean */}
            <div className="lg:col-span-6 space-y-3">
              <Card className="border border-rose-200/80 shadow-2xs rounded-2xl bg-white p-3.5 space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                  <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    Email Content &amp; Campaign Details
                  </h3>
                  <span className="text-[10px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Live HTML Sync
                  </span>
                </div>

                {/* Subject Line */}
                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-medium text-slate-700">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* Pre-populated Headline */}
                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-medium text-slate-700">
                    Main Email Headline *
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-medium text-slate-700">
                    Email Body Copy *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs p-2.5 font-normal text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* Cloudinary Banner Upload Box with Aspect Ratio */}
                <div className="space-y-1.5 p-3 bg-rose-50/50 border border-rose-200/90 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-medium text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hero Banner Image</span>
                    </label>
                    <span className="bg-rose-100 text-rose-800 text-[9.5px] font-mono font-medium px-2 py-0.2 rounded border border-rose-200">
                      Ratio 16:9 (1200 x 675px)
                    </span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBannerFileUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  {/* Upload Trigger Area */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingBanner}
                      className="h-7.5 px-3 text-xs font-medium bg-white hover:bg-rose-50 border-rose-300 text-rose-700 rounded-lg cursor-pointer shadow-2xs gap-1.5 shrink-0"
                    >
                      {isUploadingBanner ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5 text-rose-600" />
                          <span>Upload via Cloudinary (16:9)</span>
                        </>
                      )}
                    </Button>

                    {bannerUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setBannerUrl("")}
                        className="h-7.5 px-2 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-lg cursor-pointer gap-1 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </Button>
                    )}
                  </div>

                  {/* Direct CDN URL Fallback Input */}
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="Or paste Cloudinary image URL..."
                    className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-800 outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* Offer Code & CTA URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <label className="text-[10.5px] font-medium text-slate-700">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      value={offerCode}
                      onChange={(e) => setOfferCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs h-8 px-2.5 font-mono font-medium text-rose-700 outline-none shadow-2xs transition-all uppercase"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10.5px] font-medium text-slate-700">
                      Call-to-Action Link
                    </label>
                    <input
                      type="text"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Test Email Target Input */}
                <div className="p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-medium text-rose-950 uppercase tracking-wider block">
                    Resend Test Copy Dispatch
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="admin@vouchiqo.com"
                      className="flex-1 bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-rose-500 outline-none shadow-2xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendTest}
                      disabled={isSendingTest}
                      className="h-7.5 px-3 text-[11px] font-medium bg-white hover:bg-rose-50 border-rose-300 text-rose-700 cursor-pointer shadow-2xs shrink-0"
                    >
                      {isSendingTest ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Form: Rendered HTML Email Preview */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-rose-600" />
                  <span>Rendered HTML Email Preview (Resend Format)</span>
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shadow-2xs">
                  Ratio 16:9 Responsive
                </span>
              </div>

              {/* Rendered Email Container in Pink/Rose Theme */}
              <div className="rounded-2xl border border-rose-200 bg-white overflow-hidden shadow-xs text-left">
                {/* Email Header */}
                <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-4 text-center text-white">
                  <span className="text-xl font-bold tracking-tight block">Vouchiqo</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-pink-100 block mt-0.5">
                    Verified Deals &amp; Offers
                  </span>
                </div>

                {/* Email Body */}
                <div className="p-5 space-y-3">
                  <h2 className="text-base font-medium text-slate-900 leading-snug">
                    {headline}
                  </h2>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {description}
                  </p>

                  {/* Banner Image in 16:9 Aspect Ratio */}
                  {bannerUrl && (
                    <div className="rounded-xl overflow-hidden border border-rose-100 aspect-video bg-slate-100 relative">
                      <img
                        src={bannerUrl}
                        alt="Campaign Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Promo Code Box */}
                  {offerCode && (
                    <div className="p-3 bg-rose-50/70 border border-dashed border-rose-400 rounded-xl text-center space-y-0.5 my-3">
                      <span className="text-[9.5px] font-medium uppercase tracking-wider text-rose-800 block">
                        Use Promo Code At Counter
                      </span>
                      <span className="text-lg font-mono font-bold text-rose-700 tracking-widest block">
                        {offerCode}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="text-center pt-1">
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium py-2 px-6 rounded-lg transition-all shadow-2xs"
                    >
                      Claim Deal on Vouchiqo →
                    </a>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="p-3 bg-rose-50/50 border-t border-rose-100 text-center text-[10px] text-rose-900/80 font-normal">
                  © 2026 Vouchiqo • You are receiving this official promotional alert as a registered member.
                  <br />
                  Ranchi, Jharkhand, India.
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
