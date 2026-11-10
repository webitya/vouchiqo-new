"use client";

import React from "react";
import { Home, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExitConfirmModal({ isOpen, onClose, router }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Store className="w-5 h-5 text-blue-600" />
            <span>Exit Merchant Registration?</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to leave the registration wizard? Your entered
          details in this browser session are safe. Where would you like to go?
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={() => router.push("/merchant/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9.5 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <Store className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs h-9.5 rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Homepage</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-xs h-8 rounded-lg cursor-pointer"
          >
            Keep Editing
          </Button>
        </div>
      </div>
    </div>
  );
}
