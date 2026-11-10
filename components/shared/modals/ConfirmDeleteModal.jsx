"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ConfirmDeleteModal — Reusable delete confirmation modal dialog.
 * Canonical component for all delete confirmation interactions.
 */
export default function ConfirmDeleteModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title = "Confirm Delete",
  itemName = "",
  description,
  onConfirm,
  onCancel,
  isPending = false,
}) {
  const isModalOpen = open ?? isOpen ?? false;

  const handleOpenChange = (newOpenState) => {
    if (onOpenChange) onOpenChange(newOpenState);
    if (!newOpenState && onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const defaultDesc = itemName ? (
    <>
      Are you sure you want to delete <strong>"{itemName}"</strong>? This action
      cannot be undone.
    </>
  ) : (
    "Are you sure you want to delete this item? This action cannot be undone."
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-left">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-bold text-slate-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold leading-relaxed">
            {description || defaultDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs font-bold rounded-xl cursor-pointer shadow-none border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-none border-0"
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
