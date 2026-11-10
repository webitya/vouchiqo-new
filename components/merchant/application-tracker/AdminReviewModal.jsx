"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showError, showSuccess } from "@/lib/toast";

/**
 * AdminReviewModal — Control panel to simulate admin workflow status updates.
 */
export default function AdminReviewModal({
  open,
  onOpenChange,
  applicationId = "VQ-2026-89421",
  onStatusUpdated,
}) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("under_review");
  const [actionNote, setActionNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await fetch(`/api/merchant/application/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          actionNote: actionNote || undefined,
          rejectionReason:
            selectedStatus === "rejected" ? rejectionReason : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showSuccess(
          `Application #${applicationId} status updated to: ${selectedStatus.replace("_", " ").toUpperCase()}`,
        );
        await queryClient.invalidateQueries({
          queryKey: ["merchant-application-status"],
        });
        await queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
        await queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });
        onStatusUpdated?.(selectedStatus);
        onOpenChange(false);
      } else {
        showError(json.message || "Failed to update status.");
      }
    } catch (err) {
      showError("Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      value: "pending",
      label: "📥 Step 1: Form Submitted (Waiting for Admin Acceptance)",
    },
    {
      value: "form_accepted",
      label: "📄 Step 2: Form Accepted (Accept Form for Review)",
    },
    {
      value: "approved",
      label: "✅ Step 3: Form Verified (Approve & Activate Account)",
    },
    { value: "rejected", label: "❌ Form Rejected" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 text-left shadow-xl font-sans">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1 pb-3 border-b border-brand-border">
            <DialogTitle className="text-base font-bold text-brand-text flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Admin Review & Approval Control Panel
            </DialogTitle>
            <DialogDescription className="text-xs text-brand-subtext">
              Simulate admin compliance decisions for Application #
              {applicationId}
            </DialogDescription>
          </DialogHeader>

          <FormSelect
            name="status"
            label="Target Application Status"
            options={statusOptions}
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            required
          />

          <FormInput
            name="actionNote"
            label="Compliance Officer Note / Log Detail"
            placeholder="e.g. Verified GSTIN and Trade license against Govt registry."
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
          />

          {selectedStatus === "rejected" && (
            <FormTextarea
              name="rejectionReason"
              label="Reason for Rejection / Resubmission"
              placeholder="e.g. Uploaded Trade License is expired or illegible."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}

          <DialogFooter className="pt-3 border-t border-brand-border flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-none"
            >
              {loading ? "Updating Status..." : "Save Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
