"use client";

import React from "react";
import { Check, FileCheck, Home, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubmissionSuccessModal({ data, router }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Application Submitted Successfully!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Welcome to Vouchiqo for Merchants! Your application (
            {data.applicationId}) for{" "}
            <span className="font-semibold text-slate-800">
              {data.businessName}
            </span>{" "}
            has been received and assigned to Compliance Desk #4.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <Button
            type="button"
            onClick={() => router.push("/merchant/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/merchant/application-status")}
            className="border-blue-300 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-semibold text-xs h-10 rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Track Status</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs h-10 rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Homepage</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
