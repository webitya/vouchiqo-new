"use client";

import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInterests } from "@/hooks/use-interests";
import { SYSTEM_CATEGORIES } from "./constants";

export const InterestSheet = ({ isOpen, onOpenChange }) => {
  const {
    interests: savedInterests,
    saveInterests,
    syncing: updatingPrefs,
  } = useInterests();
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedInterests(savedInterests || []);
    }
  }, [isOpen, savedInterests]);

  const handleSave = async () => {
    try {
      await saveInterests(selectedInterests);
      toast.success("Preferences updated successfully!");
      if (onOpenChange) onOpenChange(false);
    } catch {
      toast.error("Failed to update preferences. Please try again.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-brand-bg text-brand-text border-l border-brand-border w-[380px] p-6 space-y-6 overflow-y-auto z-[200]">
        <SheetHeader className="border-b border-brand-border pb-4">
          <SheetTitle className="text-xl font-bold font-heading text-brand-navy flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-error fill-brand-error/10" />
            <span>Verify Your Interests</span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <p className="text-xs text-brand-subtext font-medium leading-relaxed">
            Select your favorite shopping categories. Vouchiqo will elevate
            coupons matching your choices to the top of your homepage feed.
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {SYSTEM_CATEGORIES.map((cat) => {
              const isChecked = selectedInterests.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    const next = isChecked
                      ? selectedInterests.filter((s) => s !== cat.slug)
                      : [...selectedInterests, cat.slug];
                    setSelectedInterests(next);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isChecked
                      ? "bg-brand-blue/5 border-brand-blue font-bold text-brand-blue"
                      : "border-brand-border hover:bg-brand-surface"
                  }`}
                >
                  <span className="text-xs flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isChecked
                        ? "bg-brand-blue border-brand-blue text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isChecked && (
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          disabled={updatingPrefs}
          onClick={handleSave}
          className="btn-primary w-full py-2.5 text-xs font-bold border-0 h-auto cursor-pointer shadow-none flex justify-center items-center gap-1.5"
        >
          {updatingPrefs ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default InterestSheet;
