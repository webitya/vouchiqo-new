"use client";

import FormInput from "@/components/shared/form/FormInput";
import FormSelect from "@/components/shared/form/FormSelect";
import FormTextarea from "@/components/shared/form/FormTextarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed (₹)" },
  { value: "freebie", label: "Freebie" },
];

const OFFER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
];

export default function OfferEditModal({
  editCoupon,
  onClose,
  editForm,
  setEditForm,
  onSave,
  isPending,
}) {
  return (
    <Dialog open={!!editCoupon} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offer Parameters</DialogTitle>
          <DialogDescription>
            Update discount settings, verification flags, and featured status.
          </DialogDescription>
        </DialogHeader>

        {editCoupon && (
          <div className="grid gap-4 py-3">
            <FormInput
              name="title"
              label="Title"
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <FormTextarea
              name="description"
              label="Description"
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="code"
                label="Coupon Code"
                value={editForm.code || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <FormInput
                name="category"
                label="Category"
                value={editForm.category || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormSelect
                name="discountType"
                label="Type"
                options={DISCOUNT_TYPE_OPTIONS}
                value={editForm.discountType}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, discountType: val }))
                }
              />

              <FormInput
                name="discountValue"
                label="Discount Value"
                type="number"
                value={editForm.discountValue ?? 0}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    discountValue: Number(e.target.value),
                  }))
                }
              />

              <FormSelect
                name="status"
                label="Status"
                options={OFFER_STATUS_OPTIONS}
                value={editForm.status}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, status: val }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={!!editForm.isVerified}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isVerified: e.target.checked,
                    }))
                  }
                  className="rounded text-primary"
                />
                Verified
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={!!editForm.isFeatured}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="rounded text-amber-500"
                />
                Featured Slot
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={!!editForm.isHot}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isHot: e.target.checked,
                    }))
                  }
                  className="rounded text-rose-500"
                />
                Hot Deal 🔥
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
