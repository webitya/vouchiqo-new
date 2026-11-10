"use client";

import { Eye, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function QueueTab({
  campaigns = [],
  onUpdateStatus,
  isUpdating = false,
}) {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  // Mandatory 4-Point Verification Checklist
  const [chkCodeValidity, setChkCodeValidity] = useState(false);
  const [chkTermsAccuracy, setChkTermsAccuracy] = useState(false);
  const [chkMerchantLegitimacy, setChkMerchantLegitimacy] = useState(false);
  const [chkCompliance, setChkCompliance] = useState(false);

  const calculatePriorityScore = (c) => {
    let score = 0;
    if (c.type === "festival") score += 30;
    if (c.targeting?.addOns?.length > 0)
      score += c.targeting.addOns.length * 10;
    if (c.startDate && new Date(c.startDate) - Date.now() < 72 * 3600 * 1000)
      score += 25;
    if (c.merchantId?.plan === "pro" || c.merchantId?.plan === "enterprise")
      score += 15;
    return score;
  };

  const sortedCampaigns = [...campaigns].sort(
    (a, b) => calculatePriorityScore(b) - calculatePriorityScore(a),
  );

  const openReviewModal = (camp) => {
    setSelectedCamp(camp);
    setActionNotes("");
    setChkCodeValidity(false);
    setChkTermsAccuracy(false);
    setChkMerchantLegitimacy(false);
    setChkCompliance(false);
    setIsModalOpen(true);
  };

  const isChecklistComplete =
    chkCodeValidity &&
    chkTermsAccuracy &&
    chkMerchantLegitimacy &&
    chkCompliance;

  const handleApprove = () => {
    if (!isChecklistComplete) {
      toast.error(
        "You must complete all 4 Verification Checkpoints before approving",
      );
      return;
    }
    onUpdateStatus(selectedCamp._id, "Approved — Scheduling", actionNotes);
    toast.success("Campaign Approved! Moved to Scheduling.");
    setIsModalOpen(false);
  };

  const handleRequestChanges = () => {
    if (actionNotes.trim().length < 30) {
      toast.error(
        "Requesting changes requires feedback of at least 30 characters",
      );
      return;
    }
    onUpdateStatus(selectedCamp._id, "Changes Requested", actionNotes);
    toast.success("Changes requested note sent to merchant.");
    setIsModalOpen(false);
  };

  const handleReject = () => {
    if (!actionNotes.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    onUpdateStatus(selectedCamp._id, "Rejected", actionNotes);
    toast.error("Campaign rejected.");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Campaign Review Queue
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review incoming submissions, complete 4-point verification &amp;
              decide
            </p>
          </div>
          <Badge className="bg-orange-50 text-[#e85d04] border-orange-200 font-bold text-xs px-2.5 py-1">
            {campaigns.filter((c) => c.status === "pending_review").length}{" "}
            Pending
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/60">
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Priority
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Merchant
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Campaign Name
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Type
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Plan
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-extrabold text-slate-600 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-xs text-slate-400 font-medium"
                >
                  No campaign submissions currently in queue.
                </TableCell>
              </TableRow>
            ) : (
              sortedCampaigns.map((camp) => {
                const priority = calculatePriorityScore(camp);
                return (
                  <TableRow
                    key={camp._id}
                    className="border-slate-100 hover:bg-slate-50/50"
                  >
                    <TableCell>
                      <Badge className="bg-violet-50 text-violet-700 border-violet-200 font-black text-[10px]">
                        +{priority} pts
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-900">
                      {camp.merchantId?.businessName || "Merchant Partner"}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-800">
                      {camp.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="capitalize text-[10px] font-bold"
                      >
                        {camp.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="uppercase text-[10px] font-bold text-slate-500">
                      {camp.merchantId?.plan || "Starter"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold border-0 ${
                          camp.status === "pending_review"
                            ? "bg-amber-100 text-amber-800"
                            : camp.status === "Approved — Scheduling"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {camp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => openReviewModal(camp)}
                        className="bg-[#e85d04] hover:bg-orange-600 text-white text-[11px] font-bold h-7 rounded-lg cursor-pointer"
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* SPLIT-SCREEN REVIEW MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white border-0 z-[400]">
          <DialogHeader className="p-4 bg-slate-900 text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#e85d04]" /> Review Campaign
              Submission
            </DialogTitle>
          </DialogHeader>

          {selectedCamp && (
            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[80vh] overflow-y-auto">
              {/* LEFT PANEL: SUBMITTED FORM DATA (55%) */}
              <div className="md:col-span-7 p-6 space-y-4 border-r border-slate-100 bg-slate-50/40 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-2">
                  Submitted Form Data
                </h4>

                <div className="space-y-2">
                  <p>
                    <span className="font-semibold text-slate-500">
                      Merchant:
                    </span>{" "}
                    <strong className="text-slate-900">
                      {selectedCamp.merchantId?.businessName}
                    </strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Campaign Name:
                    </span>{" "}
                    <strong className="text-slate-900">
                      {selectedCamp.name}
                    </strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Type &amp; Objective:
                    </span>{" "}
                    <strong className="text-slate-900 uppercase">
                      {selectedCamp.type} ({selectedCamp.objective})
                    </strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Promo Code:
                    </span>{" "}
                    <strong className="font-mono text-[#e85d04] font-black">
                      {selectedCamp.offerDetails?.code || selectedCamp.code}
                    </strong>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Headline:
                    </span>{" "}
                    <span className="text-slate-800">
                      {selectedCamp.headline || selectedCamp.name}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Description:
                    </span>{" "}
                    <span className="text-slate-800">
                      {selectedCamp.description || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">
                      Schedule:
                    </span>{" "}
                    <span className="text-slate-800">
                      {selectedCamp.startDate} to {selectedCamp.endDate}
                    </span>
                  </p>
                </div>
              </div>

              {/* RIGHT PANEL: ADMIN ACTION PANEL (45%) */}
              <div className="md:col-span-5 p-6 space-y-5 bg-white text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Mandatory
                  4-Point Checklist
                </h4>

                <div className="space-y-2.5">
                  {[
                    {
                      id: "code",
                      label: "Check 1: Code Validity (tested)",
                      state: chkCodeValidity,
                      set: setChkCodeValidity,
                    },
                    {
                      id: "terms",
                      label: "Check 2: Terms & Cap Accuracy",
                      state: chkTermsAccuracy,
                      set: setChkTermsAccuracy,
                    },
                    {
                      id: "legit",
                      label: "Check 3: Merchant Legitimacy Active",
                      state: chkMerchantLegitimacy,
                      set: setChkMerchantLegitimacy,
                    },
                    {
                      id: "comp",
                      label: "Check 4: Compliance & Claims True",
                      state: chkCompliance,
                      set: setChkCompliance,
                    },
                  ].map((chk) => (
                    <label
                      key={chk.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer font-bold text-slate-800"
                    >
                      <Checkbox
                        checked={chk.state}
                        onCheckedChange={(val) => chk.set(!!val)}
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-slate-800">
                    Admin Notes / Feedback (Required for Changes)
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="Min 30 chars for requested changes..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="bg-white border-slate-200 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={handleApprove}
                    disabled={!isChecklistComplete}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Approve &amp; Schedule
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRequestChanges}
                      className="border-amber-200 text-amber-800 hover:bg-amber-50 font-bold text-[11px] h-8 rounded-xl"
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-[11px] h-8 rounded-xl"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
