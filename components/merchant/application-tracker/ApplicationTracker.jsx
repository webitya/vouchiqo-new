"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  FileCheck,
  FileText,
  HelpCircle,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Store,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProcessFeedbackModal from "@/components/merchant/feedback/ProcessFeedbackModal";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import ErrorState from "@/components/shared/feedback/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApplicationStatus } from "@/hooks/use-application-status";
import { useProcessFeedback } from "@/hooks/use-process-feedback";
import { showSuccess } from "@/lib/toast";
import AdminReviewModal from "./AdminReviewModal";

/**
 * ApplicationTracker — Full-width, compact Merchant Application Status Tracker.
 */
export default function ApplicationTracker({ initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching, isConnected } =
    useApplicationStatus();

  const {
    isOpen: isFeedbackOpen,
    openFeedback,
    closeFeedback,
    submitFeedback,
    isSubmitting: isSubmittingFeedback,
    dismissFeedback,
    hasResponded: hasRespondedFeedback,
  } = useProcessFeedback("onboarding_wizard");

  useEffect(() => {
    if (data?.hasSubmitted && !hasRespondedFeedback) {
      const timer = setTimeout(() => {
        openFeedback();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data?.hasSubmitted, hasRespondedFeedback, openFeedback]);

  const handleRefresh = async () => {
    await refetch();
    showSuccess("Application status refreshed!");
  };

  if (isLoading) {
    return (
      <div className="p-4 w-full space-y-4 font-sans">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 w-full font-sans max-w-xl mx-auto space-y-4 text-center">
        <ErrorState
          title="Could not load application status"
          description="We encountered an issue checking your submission status. You can retry or head directly to your dashboard or homepage."
          onRetry={() => refetch()}
        />
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <Button
            onClick={() => router.push("/merchant/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Homepage</span>
          </Button>
        </div>
      </div>
    );
  }

  const {
    hasSubmitted = true,
    applicationId = "VQ-2026-89421",
    businessName = "Merchant Partner Enterprise",
    ownerName = "Authorized Partner",
    email = "merchant@vouchiqo.com",
    phone = "+91 98765 43210",
    category = "Retail Deals & Offers",
    city = "Ranchi",
    state = "Jharkhand",
    gstin = "Exempt / N/A",
    status = "pending",
    rejectionReason = "",
    submittedAt,
    lastUpdatedAt,
    documents = [],
    docType,
  } = data;

  if (hasSubmitted === false || status === "not_submitted") {
    return (
      <div className="w-full px-4 py-6 font-sans">
        <Card className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              No Merchant Application Submitted Yet
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete the merchant onboarding wizard to submit your store
              details, statutory documents, and business profile for admin
              verification.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => router.push("/merchant-register")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Start Onboarding</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/merchant/dashboard")}
              className="border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs h-10 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs h-10 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Homepage</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isApproved = status === "approved" || status === "active";
  const isRejected = status === "rejected";
  const isAccepted =
    status === "form_accepted" || status === "under_review" || isApproved;

  const progressPercentage = isApproved
    ? 100
    : isRejected
      ? 66
      : isAccepted
        ? 66
        : 33;

  const submittedDateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const verifiedDateStr = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const steps = [
    {
      id: 1,
      name: "Form Submitted",
      subtitle: submittedDateStr,
      isComplete: true,
      isCurrent: !isAccepted && !isRejected && !isApproved,
      isError: false,
    },
    {
      id: 2,
      name: isApproved
        ? "Audit Passed"
        : isRejected
          ? "Audit Rejected"
          : "Compliance Audit",
      subtitle:
        isAccepted || isApproved
          ? "Form Accepted"
          : isRejected
            ? rejectionReason || "Action Required"
            : "In Progress",
      isComplete: isAccepted || isApproved,
      isCurrent: isAccepted && !isApproved,
      isError: isRejected,
    },
    {
      id: 3,
      name: "Account Activated",
      subtitle: isApproved
        ? `Verified on ${verifiedDateStr}`
        : isRejected
          ? "Suspended"
          : "Final Step",
      isComplete: isApproved,
      isCurrent: false,
      isError: isRejected,
    },
  ];

  return (
    <div className="w-full font-sans pb-8 space-y-4 px-4">
      {/* ── 1. HERO STATUS BANNER ── */}
      <Card
        className={`p-4 sm:p-5 rounded-2xl border transition-all text-left shadow-xs ${
          isApproved
            ? "bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-700/50"
            : isRejected
              ? "bg-gradient-to-r from-rose-900 to-slate-900 text-white border-rose-700/50"
              : "bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white border-slate-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left: Title + Badges */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-white border-white/20 font-medium text-[11px] px-2.5 py-0.5 rounded-md">
                Application #{applicationId}
              </Badge>
              {isApproved && (
                <Badge className="bg-emerald-500 text-white font-medium text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Account Verified & Active
                </Badge>
              )}
              {isAccepted && !isApproved && (
                <Badge className="bg-blue-600 text-white font-medium text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Form Accepted — Audit Underway
                </Badge>
              )}
              {!isAccepted && !isRejected && (
                <Badge className="bg-slate-700 text-slate-100 font-medium text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Form Submitted — Awaiting Acceptance
                </Badge>
              )}
              {isRejected && (
                <Badge className="bg-rose-500 text-white font-medium text-[10px] px-2.5 py-0.5 border-0 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Action Required
                </Badge>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-semibold tracking-normal text-white leading-snug">
              {isApproved
                ? `${businessName} is Verified & Live!`
                : isAccepted
                  ? `Form Accepted — Review Underway for ${businessName}`
                  : isRejected
                    ? "KYC Verification Needs Correction"
                    : `Form Submitted for ${businessName}`}
            </h1>

            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              {isApproved
                ? "Your business profile, GST credentials, and store details have been verified. You can now create campaigns and publish discount offers."
                : isAccepted
                  ? "Form accepted. Our compliance desk is auditing your store location and statutory documents."
                  : isRejected
                    ? rejectionReason ||
                      "Some details need correction. Please review your profile and update your KYC information."
                    : "Form Submitted — Waiting for admin to accept your application form for review."}
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <Button
              onClick={() => router.push("/merchant/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 px-3.5 rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5 transition-all border-0"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-medium h-8 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Homepage</span>
            </Button>
            <Button
              onClick={() => router.push("/merchant/profile?edit=true")}
              className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-medium h-8 px-3.5 rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5 transition-all border-0"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Details</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-medium h-8 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 2. VERIFICATION PIPELINE + STEPS (side-by-side on larger screens) ── */}
      <Card className="p-4 rounded-2xl border border-slate-200/90 bg-white text-left shadow-xs">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Verification Pipeline & Audit Progress
            </h3>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Track real-time statutory review steps and onboarding milestone.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-700">
              {progressPercentage}% Completed
            </span>
            <Badge className="bg-slate-100 text-slate-600 text-[10px] font-medium border-slate-200">
              #{applicationId}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          value={progressPercentage}
          className="h-2 rounded-full bg-slate-100 mb-3"
          indicatorClassName={
            isApproved
              ? "bg-emerald-600"
              : isRejected
                ? "bg-rose-500"
                : "bg-blue-600"
          }
        />

        {/* 3-Step Grid */}
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                step.isComplete
                  ? "bg-emerald-50/50 border-emerald-200/80"
                  : step.isError
                    ? "bg-rose-50/50 border-rose-200/80"
                    : step.isCurrent
                      ? "bg-blue-50/50 border-blue-200/80"
                      : "bg-slate-50/50 border-slate-200/80 opacity-70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {step.isComplete ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : step.isError ? (
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                ) : step.isCurrent ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-medium text-xs border-2 border-blue-700">
                    {step.id}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border-2 border-slate-200 flex items-center justify-center shrink-0 font-medium text-xs">
                    {step.id}
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-medium truncate ${
                      step.isComplete
                        ? "text-emerald-900"
                        : step.isError
                          ? "text-rose-900"
                          : step.isCurrent
                            ? "text-blue-950"
                            : "text-slate-500"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-normal truncate">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 3. SUBMITTED BUSINESS & KYC DETAILS ── */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white text-left shadow-xs">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              Submitted Business & KYC Particulars
            </h3>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Summary of business information provided during onboarding.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/merchant/profile?edit=true")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium h-7 px-3 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit Details</span>
          </Button>
        </div>

        {/* Business Details Grid — 4 columns on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Business Name
              </span>
              <span className="font-semibold text-slate-800 block truncate text-xs">
                {businessName}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Category
              </span>
              <span className="font-semibold text-blue-600 block truncate text-xs capitalize">
                {category}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Liaison Representative
              </span>
              <span className="font-semibold text-slate-800 block truncate text-xs">
                {ownerName}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Contact Email
              </span>
              <span
                className="font-semibold text-slate-800 block truncate text-xs"
                title={email}
              >
                {email}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Phone Number
              </span>
              <span className="font-semibold text-slate-800 block text-xs">
                {phone}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Location
              </span>
              <span className="font-semibold text-slate-800 block truncate text-xs">
                {city}, {state}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                GSTIN
              </span>
              <span className="font-semibold text-slate-800 block text-xs">
                {gstin}
              </span>
            </div>
          </div>

          {docType && (
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                  Identity Document
                </span>
                <span className="font-semibold text-slate-800 block truncate text-xs">
                  {docType}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
              <BadgeCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                Review Desk
              </span>
              <span className="font-semibold text-slate-800 block text-xs">
                Vouchiqo Audit Desk #4
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-2 pt-3 mt-3 border-t border-slate-100">
            <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verification Documents ({documents.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-slate-700 truncate text-[11.5px]">
                      {doc.name}
                    </span>
                  </div>
                  <Badge
                    className={`text-[9.5px] font-medium border-0 shrink-0 capitalize ${
                      doc.status === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.status === "verified" ? "Verified" : "Auditing"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── 4. QUICK ACTIONS TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 text-white text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-normal text-slate-200 text-xs">
            Need help or want to update your submission?
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/merchant/dashboard")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium h-7 px-3.5 rounded-lg cursor-pointer border-0"
          >
            <Store className="w-3 h-3 mr-1" />
            Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/")}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-medium h-7 px-3 rounded-lg cursor-pointer"
          >
            <Home className="w-3 h-3 mr-1" />
            Homepage
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/merchant/profile?edit=true")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-7 px-3.5 rounded-lg cursor-pointer border-0"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit Profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `https://wa.me/919876543210?text=Hi%20Vouchiqo%20Support%2C%20I%20am%20checking%20status%20for%20Application%20${applicationId}`,
                "_blank",
              )
            }
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-medium h-7 px-3.5 rounded-lg cursor-pointer"
          >
            <MessageSquare className="w-3 h-3 mr-1 text-emerald-400" />
            Contact Support
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAdminModalOpen(true)}
            className="text-slate-400 hover:text-white text-xs font-normal h-7 px-3 rounded-lg cursor-pointer"
          >
            [Dev] Test Status
          </Button>
        </div>
      </div>

      {/* Admin Simulator Modal */}
      <AdminReviewModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        applicationId={applicationId}
        onStatusUpdated={() => {
          queryClient.invalidateQueries({
            queryKey: ["merchant-application-status"],
          });
        }}
      />
      {/* Process-Based Onboarding Wizard Feedback */}
      <ProcessFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
        onDismiss={dismissFeedback}
        isSubmitting={isSubmittingFeedback}
        title="How was your registration & onboarding experience?"
        subtitle="Help us make merchant application and store verification even smoother!"
        merchantName={businessName}
      />
    </div>
  );
}
