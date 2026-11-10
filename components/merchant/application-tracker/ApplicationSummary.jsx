"use client";

import { FileCheck, Mail, MapPin, Phone, Store, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ApplicationSummary — responsive modal overlay to view submitted application details.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {object} props.application
 */
export default function ApplicationSummary({
  open,
  onOpenChange,
  application = {},
}) {
  const {
    applicationId = "VQ-2026-89421",
    businessName = "Marbella Tiles & Sanitaryware",
    ownerName = "Rahul Sharma",
    email = "rahul@marbellatiles.com",
    phone = "+91 98765 43210",
    category = "Home Improvement & Marble",
    city = "Ranchi",
    state = "Jharkhand",
    gstin = "20AAAAA0000A1Z5",
    submittedAt,
    documents = [
      { name: "GST Certificate (Form REG-06)", status: "Verified" },
      { name: "Municipal Trade License", status: "Under Audit" },
    ],
  } = application;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 text-left shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600 shrink-0" />
              Submitted Business Profile &amp; Application Details
            </DialogTitle>
            <Badge className="bg-slate-900 text-white font-medium text-xs px-3 py-1 rounded-md shrink-0">
              #{applicationId}
            </Badge>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 font-normal">
            Full business information and verification documents submitted to Vouchiqo
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Modal Body */}
        <div className="space-y-6 py-4 max-h-[75vh] md:max-h-[80vh] overflow-y-auto pr-1 sm:pr-2">
          {/* Business Core Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                Legal Business Name
              </span>
              <span className="font-medium text-sm text-slate-900 block leading-tight">
                {businessName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                Primary Business Category
              </span>
              <span className="font-medium text-xs sm:text-sm text-blue-700 flex items-center gap-1.5 leading-tight">
                <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{category}</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                Owner / Authorized Representative
              </span>
              <span className="font-medium text-xs sm:text-sm text-slate-800 block">
                {ownerName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                Submitted Date
              </span>
              <span className="font-normal text-xs sm:text-sm text-slate-600 block">
                {submittedAt
                  ? new Date(submittedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "7/22/2026, 5:42:19 AM"}
              </span>
            </div>
          </div>

          {/* Contact & Location Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
              Contact &amp; Address Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">
                    Official Email
                  </span>
                  <span className="font-medium text-xs text-slate-800 break-all block">
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">
                    Phone Number
                  </span>
                  <span className="font-medium text-xs text-slate-800 block">
                    {phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs sm:col-span-2 lg:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">
                    Store Location
                  </span>
                  <span className="font-medium text-xs text-slate-800 block truncate">
                    {city}, {state}, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Identity Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
              Tax &amp; Identity Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-0.5">
                  GSTIN Number
                </span>
                <span className="font-medium text-sm text-slate-800 tracking-wide">
                  {gstin || "20AAAAA0000A1Z5"}
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Verification Files */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
              Uploaded Verification Files ({documents.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200/90 flex items-center justify-between text-xs bg-white shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="font-semibold text-slate-800 flex items-center gap-2 truncate pr-2">
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </span>
                  <Badge
                    className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0"
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
