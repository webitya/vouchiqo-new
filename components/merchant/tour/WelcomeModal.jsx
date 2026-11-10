"use client";

import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WelcomeModal({
  isOpen,
  merchantName,
  onStart,
  onSkip,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-md border-slate-200/90 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 border text-left font-sans">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Store className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 font-sans">
            Welcome to Vouchiqo, {merchantName || "Partner"}!
          </DialogTitle>
          <DialogDescription className="text-xs font-normal text-slate-600 leading-relaxed font-sans">
            Your merchant portal is ready. Take a quick 2-minute interactive
            tour to discover how to publish offer listings, track live offer
            claims, analyze performance, and grow your sales.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 my-2 space-y-1.5 text-xs font-sans">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Founding Merchant Access Active
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            14-day free trial on Growth Partner tier enabled. Guaranteed 0%
            extra commission lock.
          </p>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-sans"
          >
            Skip
          </button>
          <Button
            type="button"
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-blue-600/20 font-sans"
          >
            Start Tour →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
