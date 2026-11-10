"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Globe,
  Layers,
  Mail,
  MapPin,
  Megaphone,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCreateAdminCampaign } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const WIZARD_STEPS = [
  { step: 1, title: "Email Blast", icon: Mail },
  { step: 2, title: "Push Notification", icon: Bell },
  { step: 3, title: "Confirm & Broadcast", icon: CheckCircle2 },
];

export default function PlatformBroadcastWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Email Blast Fields
  const [emailTemplate, setEmailTemplate] = useState("E-9 Platform Deals Showcase");
  const [emailSubject, setEmailSubject] = useState(
    "🎁 Weekend Special: Flat 25% OFF on Top Verified Stores in Ranchi!",
  );
  const [emailSenderName, setEmailSenderName] = useState("Vouchiqo Platform Desk");
  const [targetCity, setTargetCity] = useState("Ranchi");
  const [targetAudience, setTargetAudience] = useState("all");

  // Step 2: Push Notification Fields
  const [pushTitle, setPushTitle] = useState("🔥 Exclusive Deals Live in Ranchi!");
  const [pushBody, setPushBody] = useState(
    "Weekend Special: Flat 20% to 40% OFF vouchers active now on Vouchiqo!",
  );
  const [pushTargetPlatform, setPushTargetPlatform] = useState("all");

  // Step 3: Deployment State
  const createCampaignMutation = useCreateAdminCampaign();
  const isSubmitting = createCampaignMutation.isPending;
  const [deployedCampaign, setDeployedCampaign] = useState(null);

  const handleConfirmFullActivation = () => {
    const payload = {
      name: emailSubject,
      type: "platform_broadcast",
      objective: "multi_channel_announcement",
      headline: pushTitle,
      subHeadline: pushBody,
      description: `Super Admin Platform Broadcast with Email Blast and Instant Push Notifications for ${targetCity}.`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      audience: targetAudience,
      targetCity,
      addOns: [
        "Targeted Push Notification Broadcast",
        `Email Blast Template (${emailTemplate})`,
        "Platform Homepage Featured Banner",
      ],
      emailSubject,
      status: "live",
    };

    createCampaignMutation.mutate(payload, {
      onSuccess: (res) => {
        setDeployedCampaign(res?.data?.campaign || res?.campaign || res);
      },
    });
  };

  return (
    <DashboardLayout
      title="Platform Broadcast Wizard"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="p-1 h-7.5 w-7.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shrink-0 shadow-2xs border border-slate-200"
              >
                <Link href="/admin/campaigns/queue">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Platform Multi-Channel Broadcast Wizard</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-mono font-medium px-2 py-0.5 rounded shadow-2xs">
                    Super Admin Console
                  </span>
                </h1>
                <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                  Simultaneous multi-channel broadcast: Targeted Email Blast + Instant Push Notification Broadcast across active users.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Multi-Channel Sync Active
              </span>
            </div>
          </div>

          {/* 4 Top Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Broadcast Mode
                  </span>
                  <span className="text-xs font-medium text-blue-700 mt-0.5 block leading-none">
                    Multi-Channel Sync
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Channel 1
                  </span>
                  <span className="text-xs font-medium text-emerald-700 mt-0.5 block leading-none">
                    Targeted Email Blast
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Channel 2
                  </span>
                  <span className="text-xs font-medium text-purple-700 mt-0.5 block leading-none">
                    Push Notification
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Target Region
                  </span>
                  <span className="text-xs font-medium text-slate-900 mt-0.5 block leading-none truncate max-w-[130px]">
                    {targetCity} Shoppers
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive 3-Step Stepper Bar */}
          <div className="grid grid-cols-3 gap-2 select-none">
            {WIZARD_STEPS.map((s) => {
              const Icon = s.icon;
              const isCurrent = currentStep === s.step;
              const isPast = currentStep > s.step;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={cn(
                    "p-2 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex items-center gap-2",
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : isPast
                        ? "bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100/70"
                        : "bg-white border-slate-200/90 text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium",
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isPast
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] block uppercase font-medium opacity-80 leading-none">
                      Step {s.step}
                    </span>
                    <span className="text-[11.5px] font-normal truncate block mt-0.5 leading-tight">
                      {s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Wizard Content Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-4 space-y-4 text-left">
            {/* ════════════════════════════════════════════════════════════════ */}
            {/* STEP 1: EMAIL BLAST BUILDER                                     */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Step 1: Multi-Channel Email Blast Builder</span>
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                      Configure automated promotional email announcements for verified platform shoppers.
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9.5px] font-medium px-2 py-0.5 rounded shadow-2xs">
                    Email Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6 space-y-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Sender Display Name
                      </label>
                      <input
                        type="text"
                        value={emailSenderName}
                        onChange={(e) => setEmailSenderName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Target City
                        </label>
                        <input
                          type="text"
                          value={targetCity}
                          onChange={(e) => setTargetCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Template
                        </label>
                        <select
                          value={emailTemplate}
                          onChange={(e) => setEmailTemplate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-xs h-8 px-2 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                        >
                          <option value="E-9 Platform Deals Showcase">E-9 Platform Showcase</option>
                          <option value="E-4 Flash Announcement">E-4 Flash Deals</option>
                          <option value="E-12 VIP Exclusive">E-12 VIP Club</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Email Preview Card */}
                  <div className="sm:col-span-6 p-3 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                    <span className="text-[10px] font-medium text-blue-900 uppercase tracking-wider block">
                      Inbox Notification Preview
                    </span>
                    <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>From: {emailSenderName}</span>
                        <span>Just Now</span>
                      </div>
                      <span className="text-xs font-medium text-slate-900 block">
                        {emailSubject}
                      </span>
                      <p className="text-[10.5px] text-slate-500 font-normal">
                        Explore verified promotional discounts from local partner stores in {targetCity}. Claim code online, redeem at store counter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* STEP 2: INSTANT PUSH NOTIFICATION SCHEDULER                     */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>Step 2: Push Notification Broadcast</span>
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                      Direct device push notification delivered via Web Push and Mobile PWA.
                    </p>
                  </div>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9.5px] font-medium px-2 py-0.5 rounded shadow-2xs">
                    Instant Push Alert
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6 space-y-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10.5px] font-medium text-slate-700">
                        Push Notification Title
                      </label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10.5px] font-medium text-slate-700">
                          Notification Message Body
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pushBody.length}/100 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={100}
                        value={pushBody}
                        onChange={(e) => setPushBody(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Mobile Push Notification Simulation Card */}
                  <div className="sm:col-span-6 p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <span className="text-[10px] font-medium text-amber-900 uppercase tracking-wider block">
                      Lock Screen Push Alert Preview
                    </span>
                    <div className="p-3 bg-slate-900 text-white rounded-lg shadow-md space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="flex items-center gap-1 font-medium">
                          <Bell className="w-3 h-3 text-amber-400" /> Vouchiqo Deals
                        </span>
                        <span>Now</span>
                      </div>
                      <span className="text-xs font-medium text-white block">
                        {pushTitle}
                      </span>
                      <p className="text-[10.5px] text-slate-300 font-normal">
                        {pushBody}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* STEP 3: CONFIRM FULL BROADCAST ACTIVATION & DEPLOYMENT           */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step 3: Confirm Simultaneous Multi-Channel Broadcast</span>
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                      Review broadcast channels and trigger live delivery across email and push subscribers.
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9.5px] font-medium px-2 py-0.5 rounded shadow-2xs">
                    Ready to Broadcast
                  </span>
                </div>

                {/* Deployment Inclusions Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
                    <span className="text-[10px] font-medium text-blue-900 uppercase block">
                      Email Blast Channel
                    </span>
                    <span className="text-xs font-medium text-slate-900 block">
                      {emailTemplate}
                    </span>
                    <span className="text-[10.5px] text-slate-600 font-normal block truncate">
                      Subject: {emailSubject}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1">
                    <span className="text-[10px] font-medium text-purple-900 uppercase block">
                      Push Notification Broadcast
                    </span>
                    <span className="text-xs font-medium text-slate-900 block">
                      {pushTitle}
                    </span>
                    <span className="text-[10.5px] text-slate-600 font-normal block">
                      Target: All Devices ({targetCity})
                    </span>
                  </div>
                </div>

                {!deployedCampaign ? (
                  <Button
                    disabled={isSubmitting}
                    onClick={handleConfirmFullActivation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-9 rounded-xl cursor-pointer shadow-2xs gap-1.5 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Triggering Multi-Channel Broadcast into Database...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Launch Multi-Channel Broadcast Now →</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Multi-Channel Broadcast Successfully Triggered &amp; Deployed!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-normal">
                      Broadcast is now live in the platform queue and visible across all channels.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="text-xs font-medium h-7.5 px-3 rounded-lg border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 cursor-pointer shadow-2xs"
                      >
                        <Link href="/admin/campaigns/live">Live Monitoring →</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="text-xs font-medium h-7.5 px-3 rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
                      >
                        <Link href="/admin/campaigns/queue">Campaign Queue</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                disabled={currentStep === 1 || isSubmitting}
                className="text-xs font-normal rounded-lg border-slate-200 h-7.5 px-3 cursor-pointer shadow-2xs gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Previous Step</span>
              </Button>

              {currentStep < 3 && (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3.5 cursor-pointer shadow-2xs gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
