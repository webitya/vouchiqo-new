"use client";

import {
  Check,
  CheckCircle2,
  CheckSquare,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { adminFetchSettings, adminUpdateSetting } from "@/lib/api-helpers";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Helper function to turn Google Drive links into direct download URLs
export function getDirectDownloadUrl(url) {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const DEFAULT_COMMITMENTS = [
  {
    id: "commit1",
    text: "All submitted business information is accurate and real.",
    required: true,
  },
  {
    id: "commit2",
    text: "I will honour every verified offer published on Vouchiqo.",
    required: true,
  },
  {
    id: "commit3",
    text: "I will submit only genuine, working offer codes and deals.",
    required: true,
  },
  {
    id: "commit4",
    text: "I will enter actual transaction values when confirming codes.",
    required: true,
  },
  {
    id: "commit5",
    text: "I understand Vouchiqo earns performance commission.",
    required: true,
  },
  {
    id: "commit6",
    text: "I will keep counter staff informed about active offers.",
    required: true,
  },
  {
    id: "commit7",
    text: "I will pause offers if stock runs out or terms change.",
    required: true,
  },
];

const DEFAULT_POLICIES = [
  {
    id: "merchant_agreement",
    title: "Agree to Merchant Agreement",
    link: "https://drive.google.com/file/d/1_sample_merchant_agreement/view?usp=sharing",
    required: true,
  },
  {
    id: "terms_of_service",
    title: "Agree to Terms of Service",
    link: "https://drive.google.com/file/d/1_sample_terms_of_service/view?usp=sharing",
    required: true,
  },
  {
    id: "privacy_policy",
    title: "Agree to Privacy Policy",
    link: "https://drive.google.com/file/d/1_sample_privacy_policy/view?usp=sharing",
    required: true,
  },
  {
    id: "verification_policy",
    title: "Agree to Verification Policy",
    link: "https://drive.google.com/file/d/1_sample_verification_policy/view?usp=sharing",
    required: true,
  },
  {
    id: "refund_cancellation",
    title: "Agree to Refund & Cancellation Policy",
    link: "https://drive.google.com/file/d/1_sample_refund_policy/view?usp=sharing",
    required: true,
  },
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

export default function PolicyAgreementsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commitments, setCommitments] = useState([]);
  const [policies, setPolicies] = useState([]);

  // New Commitment Input State
  const [newCommitmentText, setNewCommitmentText] = useState("");

  // New Policy Input State
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    link: "",
    required: true,
  });

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDirectDownload = (link, filename, itemId) => {
    if (!link || !link.trim()) return;
    setDownloadingId(itemId);
    const directUrl = getDirectDownloadUrl(link);

    showSuccess(`Starting direct download for: ${filename || "Agreement"}...`);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = directUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch {}
      setDownloadingId(null);
    }, 2500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminFetchSettings();
      if (data?.merchant_commitments && Array.isArray(data.merchant_commitments)) {
        setCommitments(data.merchant_commitments);
      } else {
        setCommitments(DEFAULT_COMMITMENTS);
      }

      if (data?.policy_agreements && Array.isArray(data.policy_agreements)) {
        setPolicies(data.policy_agreements);
      } else {
        setPolicies(DEFAULT_POLICIES);
      }
    } catch {
      showError("Failed to load settings.");
      setCommitments(DEFAULT_COMMITMENTS);
      setPolicies(DEFAULT_POLICIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async (updatedCommitments, updatedPolicies) => {
    const commitmentsToSave = updatedCommitments || commitments;
    const policiesToSave = updatedPolicies || policies;
    try {
      setSaving(true);
      await adminUpdateSetting("merchant_commitments", commitmentsToSave);
      await adminUpdateSetting("policy_agreements", policiesToSave);
      showSuccess("Merchant Commitments & Policy Agreements saved successfully!");
    } catch {
      showError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── COMMITMENT HANDLERS ──
  const handleAddCommitment = () => {
    if (!newCommitmentText.trim()) {
      return showError("Please enter commitment statement text.");
    }
    const newItem = {
      id: `commit_${Date.now()}`,
      text: newCommitmentText.trim(),
      required: true,
    };
    const updated = [...commitments, newItem];
    setCommitments(updated);
    setNewCommitmentText("");
    handleSaveAll(updated, policies);
  };

  const handleUpdateCommitment = (index, field, value) => {
    const updated = [...commitments];
    updated[index] = { ...updated[index], [field]: value };
    setCommitments(updated);
  };

  const handleRemoveCommitment = (index) => {
    const updated = commitments.filter((_, i) => i !== index);
    setCommitments(updated);
    handleSaveAll(updated, policies);
  };

  // ── POLICY HANDLERS ──
  const handleAddPolicy = () => {
    if (!newPolicy.title.trim()) {
      return showError("Please enter Policy Agreement Title.");
    }
    const id =
      newPolicy.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `policy_${Date.now()}`;

    const policyItem = {
      id,
      title: newPolicy.title.trim(),
      link: newPolicy.link ? newPolicy.link.trim() : "",
      required: !!newPolicy.required,
    };

    const updated = [...policies, policyItem];
    setPolicies(updated);
    setNewPolicy({ title: "", link: "", required: true });
    handleSaveAll(commitments, updated);
  };

  const handleUpdatePolicy = (index, field, value) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], [field]: value };
    setPolicies(updated);
  };

  const handleRemovePolicy = (index) => {
    const updated = policies.filter((_, i) => i !== index);
    setPolicies(updated);
    handleSaveAll(commitments, updated);
  };

  const stats = useMemo(() => {
    const totalCommitments = commitments.length;
    const requiredCommitments = commitments.filter((c) => c.required !== false).length;
    const totalPolicies = policies.length;
    const linkedPdfs = policies.filter((p) => Boolean(p.link?.trim())).length;
    return { totalCommitments, requiredCommitments, totalPolicies, linkedPdfs };
  }, [commitments, policies]);

  return (
    <DashboardLayout
      title="Terms & Policy Agreements"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Merchant Commitments &amp; Policy Agreements
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Customize partner onboarding checkboxes and direct Google Drive PDF download agreements live.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSettings}
                disabled={loading}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => handleSaveAll(commitments, policies)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3.5 cursor-pointer shadow-2xs gap-1.5 shrink-0"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save All Settings</span>
              </Button>
            </div>
          </div>

          {/* 4 Mini KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Mandatory Statements
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block leading-none">
                    {stats.totalCommitments}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Required on Form
                  </span>
                  <span className="text-base font-medium text-emerald-700 mt-0.5 block leading-none">
                    {stats.requiredCommitments}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Policy Agreements
                  </span>
                  <span className="text-base font-medium text-purple-700 mt-0.5 block leading-none">
                    {stats.totalPolicies}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border p-2.5 shadow-2xs font-sans bg-white border-slate-200/80">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    PDF Downloads
                  </span>
                  <span className="text-base font-medium text-blue-700 mt-0.5 block leading-none">
                    {stats.linkedPdfs}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Download className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: MERCHANT COMMITMENTS CHECKBOXES                     */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Merchant Mandatory Commitments ({commitments.length})</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                  Required declarations and agreements displayed during Merchant Registration.
                </p>
              </div>
              <span className="bg-white/95 text-emerald-700 border border-emerald-300 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs">
                ● Live On Registration
              </span>
            </div>

            {/* Add Commitment Input Box */}
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
              <input
                type="text"
                placeholder="Enter new commitment text (e.g. I will honour every verified offer...)"
                value={newCommitmentText}
                onChange={(e) => setNewCommitmentText(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg text-xs h-8 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
              />
              <Button
                onClick={handleAddCommitment}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-8 px-3 cursor-pointer gap-1 shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Statement</span>
              </Button>
            </div>

            {/* Commitment List with 8 Colorful Palettes */}
            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading commitments...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {commitments.map((c, idx) => {
                  const theme = ROW_COLOR_THEMES[idx % ROW_COLOR_THEMES.length];
                  return (
                    <div
                      key={c.id || idx}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border shadow-2xs transition-all",
                        theme.row,
                      )}
                    >
                      <div className="w-6 h-6 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                        #{idx + 1}
                      </div>
                      <input
                        type="text"
                        value={c.text}
                        onChange={(e) =>
                          handleUpdateCommitment(idx, "text", e.target.value)
                        }
                        className="flex-1 bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none shrink-0 bg-white/95 border border-slate-300/90 px-2 py-1 rounded-lg shadow-2xs">
                        <Checkbox
                          checked={c.required !== false}
                          onCheckedChange={(val) =>
                            handleUpdateCommitment(idx, "required", !!val)
                          }
                        />
                        <span className="font-medium text-[10.5px]">Required</span>
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveCommitment(idx)}
                            className="h-6.5 w-6.5 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 bg-white rounded-md cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                          Remove this declaration statement
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: POLICY AGREEMENTS & DIRECT DOWNLOAD PDF LINKS       */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Policy Agreements &amp; Direct PDF Download Links ({policies.length})</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                  Google Drive PDF links with 1-click automatic direct file download for onboarded merchants.
                </p>
              </div>
              <span className="bg-white/95 text-purple-700 border border-purple-300 text-[9.5px] font-medium px-2 py-0.5 rounded-md shadow-2xs">
                Direct PDF Downloads
              </span>
            </div>

            {/* Add Policy Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="sm:col-span-5 space-y-0.5">
                <label className="text-[10.5px] font-medium text-slate-700">
                  Agreement Checkbox Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agree to Merchant Agreement"
                  value={newPolicy.title}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, title: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                />
              </div>
              <div className="sm:col-span-5 space-y-0.5">
                <label className="text-[10.5px] font-medium text-slate-700">
                  Google Drive Document URL
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={newPolicy.link}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, link: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col justify-end">
                <Button
                  onClick={handleAddPolicy}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg h-7.5 px-3 cursor-pointer gap-1 w-full shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Policy</span>
                </Button>
              </div>
            </div>

            {/* Policy List */}
            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading policy agreements...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {policies.map((p, idx) => {
                  const directDlUrl = getDirectDownloadUrl(p.link);
                  const theme = ROW_COLOR_THEMES[(idx + 3) % ROW_COLOR_THEMES.length];

                  return (
                    <div
                      key={p.id || idx}
                      className={cn(
                        "p-2.5 rounded-xl border shadow-2xs transition-all",
                        theme.row,
                      )}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5 space-y-0.5">
                          <label className="text-[10px] font-medium text-slate-700">
                            Agreement Checkbox Label
                          </label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) =>
                              handleUpdatePolicy(idx, "title", e.target.value)
                            }
                            className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7.5 px-2.5 font-normal text-slate-900 focus:border-blue-500 outline-none shadow-2xs"
                          />
                        </div>

                        <div className="sm:col-span-5 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-medium text-slate-700">
                              Google Drive Document Link
                            </label>
                            {p.link && (
                              <button
                                type="button"
                                disabled={downloadingId === (p.id || idx)}
                                onClick={() =>
                                  handleDirectDownload(
                                    p.link,
                                    p.title,
                                    p.id || idx,
                                  )
                                }
                                className="text-[9.5px] text-emerald-700 font-medium hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                              >
                                {downloadingId === (p.id || idx) ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Downloading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-2.5 h-2.5" />
                                    <span>Direct Download</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="url"
                              placeholder="https://drive.google.com/file/d/..."
                              value={p.link}
                              onChange={(e) =>
                                handleUpdatePolicy(idx, "link", e.target.value)
                              }
                              className="w-full bg-white/95 border border-slate-300/90 rounded-lg text-xs h-7.5 px-2.5 font-mono text-slate-800 focus:border-blue-500 outline-none pr-7 shadow-2xs"
                            />
                            {p.link && (
                              <FileText className="w-3.5 h-3.5 text-red-500 absolute right-2 pointer-events-none" />
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5 pt-1 sm:pt-4">
                          <label className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer select-none bg-white/95 border border-slate-300/90 px-1.5 py-0.5 rounded-md shadow-2xs">
                            <Checkbox
                              checked={p.required !== false}
                              onCheckedChange={(val) =>
                                handleUpdatePolicy(idx, "required", !!val)
                              }
                            />
                            <span className="font-medium text-[10px]">Required</span>
                          </label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemovePolicy(idx)}
                                className="h-6.5 w-6.5 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 bg-white rounded-md cursor-pointer shrink-0 shadow-2xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                              Remove policy agreement
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
