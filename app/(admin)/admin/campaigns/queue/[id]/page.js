"use client";

import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetchCampaignById, adminReviewCampaign } from "@/lib/api-helpers";

export default function AdminCampaignDetailPage({ params }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState("Pending Review");
  const [adminNotes, setAdminNotes] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  // Button Action Loading States
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // 4 Required Verification Checkboxes
  const [verificationChecklist, setVerificationChecklist] = useState({
    codeValidity: false,
    termsAccuracy: false,
    merchantLegitimacy: false,
    complianceCheck: false,
  });

  // Post-approval scheduling controls
  const [scheduleDate, setScheduleDate] = useState("");

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFetchCampaignById(campaignId);
      if (data) {
        setCampaign(data);
        setCampaignStatus(data.status || "pending_review");
        if (data.startDate || data.timing?.startDate) {
          const d = new Date(data.startDate || data.timing?.startDate);
          setScheduleDate(d.toISOString().split("T")[0]);
        }
      }
    } catch (err) {
      console.error("Error loading campaign details:", err);
      toast.error("Failed to load campaign data.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const isChecklistComplete =
    verificationChecklist.codeValidity &&
    verificationChecklist.termsAccuracy &&
    verificationChecklist.merchantLegitimacy &&
    verificationChecklist.complianceCheck;

  const handleApprove = useCallback(async () => {
    if (!isChecklistComplete) {
      toast.error(
        "Please complete all 4 verification checkboxes before approving!",
      );
      return;
    }
    try {
      setIsApproving(true);
      await adminReviewCampaign(campaignId, {
        status: "scheduled",
        scheduleDate,
        adminNotes,
      });
      setCampaignStatus("scheduled");
      toast.success("Campaign approved & scheduled!");
    } catch (err) {
      toast.error(err.message || "Failed to approve campaign.");
    } finally {
      setIsApproving(false);
    }
  }, [isChecklistComplete, campaignId, scheduleDate, adminNotes]);

  const handleRequestChanges = useCallback(async () => {
    if (!requestNotes.trim() || requestNotes.trim().length < 30) {
      toast.error(
        "Request Changes requires mandatory notes of at least 30 characters!",
      );
      return;
    }
    try {
      setIsRequesting(true);
      await adminReviewCampaign(campaignId, {
        status: "pending_review",
        requestNotes,
        adminNotes,
      });
      setCampaignStatus("pending_review");
      toast.error("Changes requested. Feedback sent to merchant.");
    } catch (err) {
      toast.error(err.message || "Failed to submit change request.");
    } finally {
      setIsRequesting(false);
    }
  }, [requestNotes, campaignId, adminNotes]);

  const handleReject = useCallback(async () => {
    try {
      setIsRejecting(true);
      await adminReviewCampaign(campaignId, {
        status: "rejected",
        rejectionReason: requestNotes || "Rejected by platform admin",
        adminNotes,
      });
      setCampaignStatus("rejected");
      toast.error("Campaign rejected.");
    } catch (err) {
      toast.error(err.message || "Failed to reject campaign.");
    } finally {
      setIsRejecting(false);
    }
  }, [campaignId, requestNotes, adminNotes]);

  if (loading) {
    return (
      <DashboardLayout
        title="Campaign Review Detail"
        user={{ name: "Super Admin", role: "admin" }}
      >
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">
            Loading real-time campaign details...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  const mName = campaign?.merchantId?.businessName || "Merchant Partner";
  const mEmail = campaign?.merchantId?.contactEmail || "—";
  const mPlan = campaign?.merchantId?.plan || "starter";

  return (
    <DashboardLayout
      title="Campaign Review Detail"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full pb-8">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="p-1.5 h-auto rounded-xl">
              <Link href="/admin/campaigns/queue">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">
                  {campaign?.name || "Campaign Details"}
                </h1>
                <Badge
                  className={`rounded px-2.5 py-0.5 text-[9px] font-bold border-0 capitalize ${
                    campaignStatus.includes("scheduled") ||
                    campaignStatus.includes("live")
                      ? "bg-emerald-100 text-emerald-800"
                      : campaignStatus.includes("pending")
                        ? "bg-blue-100 text-blue-800"
                        : campaignStatus === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {campaignStatus.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {mName} ({mEmail}) • Plan:{" "}
                <span className="capitalize">{mPlan}</span>
              </p>
            </div>
          </div>
        </div>

        {/* SPLIT-SCREEN LAYOUT: LEFT (6 COLS - MERCHANT FORM), RIGHT (6 COLS - ADMIN ACTION PANEL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: READ-ONLY MERCHANT SUBMISSION (SECTIONS A THROUGH F) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#e85d04]" /> Merchant
                  Submission Details
                </h3>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold border-slate-200"
                >
                  Real-time Data
                </Badge>
              </div>

              {/* Section A & B: Type & Basics */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#e85d04] uppercase tracking-wider block">
                  Section A &amp; B: Basics &amp; Banner
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-semibold block">
                      Campaign Type
                    </span>
                    <span className="font-bold text-slate-900 uppercase">
                      {campaign?.type || "flash"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-semibold block">
                      Objective
                    </span>
                    <span className="font-bold text-slate-900">
                      {campaign?.objective || "Boost Sales"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block">
                    Headline
                  </span>
                  <span className="font-bold text-slate-900">
                    {campaign?.headline || campaign?.name}
                  </span>
                </div>
              </div>

              {/* Section C: Offer Mechanics */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#e85d04] uppercase tracking-wider block">
                  Section C: Offer Mechanics
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-semibold block">
                      Promo Code
                    </span>
                    <span className="font-mono font-black text-slate-900 uppercase">
                      {campaign?.offerDetails?.code || "PROMO"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-semibold block">
                      Discount
                    </span>
                    <span className="font-bold text-[#e85d04]">
                      {campaign?.offerDetails?.discountValue
                        ? `${campaign.offerDetails.discountValue}% OFF`
                        : "Special Offer"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-semibold block">
                      Min Order
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{campaign?.offerDetails?.minOrderValue || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section D & E: Schedule & T&C */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#e85d04] uppercase tracking-wider block">
                  Section D &amp; E: Schedule &amp; Compliance
                </span>
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block">
                    Campaign Duration
                  </span>
                  <span className="font-bold text-slate-900">
                    {campaign?.startDate
                      ? new Date(campaign.startDate).toLocaleDateString("en-IN")
                      : "—"}{" "}
                    to{" "}
                    {campaign?.endDate
                      ? new Date(campaign.endDate).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
                {campaign?.offerDetails?.termsAndConditions && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="text-slate-400 font-semibold block">
                      Terms &amp; Conditions
                    </span>
                    <p className="font-mono text-slate-700 whitespace-pre-line leading-relaxed">
                      {campaign.offerDetails.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL: ADMIN ACTION PANEL (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin
                  Action Panel &amp; Verification Checklist
                </h3>
              </div>

              {/* 4 Mandatory Verification Checkboxes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Mandatory Offer Verification Checklist (4 Required Checkboxes)
                  *
                </Label>
                <div className="space-y-2.5 text-xs font-semibold">
                  {[
                    {
                      key: "codeValidity",
                      label:
                        "1. Code Validity Check (Code works properly in testing)",
                    },
                    {
                      key: "termsAccuracy",
                      label:
                        "2. Terms Accuracy Check (Min bill & cap correctly stated)",
                    },
                    {
                      key: "merchantLegitimacy",
                      label:
                        "3. Merchant Legitimacy Check (KYC & store address verified)",
                    },
                    {
                      key: "complianceCheck",
                      label:
                        "4. Compliance Check (No misleading or predatory clauses)",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer"
                    >
                      <Checkbox
                        checked={verificationChecklist[item.key]}
                        onCheckedChange={(val) =>
                          setVerificationChecklist({
                            ...verificationChecklist,
                            [item.key]: !!val,
                          })
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Decision Action Buttons: Approve / Request Changes / Reject */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Admin Decision Actions
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isApproving}
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex-1 cursor-pointer"
                  >
                    {isApproving
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      : null}
                    <span>Approve Campaign</span>
                  </Button>
                  <Button
                    disabled={isRejecting}
                    onClick={handleReject}
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer"
                  >
                    {isRejecting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      : null}
                    <span>Reject</span>
                  </Button>
                </div>
              </div>

              {/* Request Changes with Mandatory Notes Field (Min 30 Chars) */}
              <div className="p-4 border border-amber-200 rounded-2xl bg-amber-50/40 space-y-3">
                <Label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Request Changes (Requires Min 30 Characters Feedback)
                </Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Please update minimum order value cap to ₹5,000 as discussed and clarify weekend exclusions."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="bg-white border-amber-200 text-xs rounded-xl"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-700 font-medium">
                    {requestNotes.length}/30 min chars required
                  </span>
                  <Button
                    size="sm"
                    disabled={isRequesting}
                    onClick={handleRequestChanges}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {isRequesting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      : null}
                    <span>Request Changes</span>
                  </Button>
                </div>
              </div>

              {/* Scheduling Controls */}
              <div className="p-4 border border-slate-200/80 rounded-2xl space-y-3 bg-white">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Launch Date
                  Override
                </Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-white border-slate-200 text-xs h-9 rounded-xl font-medium"
                />
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  Internal Admin Notes (Private)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Private internal notes for admin team members..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="bg-white border-slate-200 text-xs rounded-xl"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
