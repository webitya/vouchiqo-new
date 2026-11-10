"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useUpdateAdminMerchant } from "@/hooks/use-admin";
import {
  Building2,
  Calendar,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MerchantKycDialog({
  open,
  onOpenChange,
  merchant,
  onAction,
}) {
  const queryClient = useQueryClient();
  const updateMerchantMutation = useUpdateAdminMerchant(merchant?._id);
  const isExtending = updateMerchantMutation.isPending;

  const isPaymentDone =
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    (merchant?.planExpiry &&
      new Date(merchant.planExpiry).getTime() > Date.now());
  const planExpiryDate = merchant?.planExpiry
    ? new Date(merchant.planExpiry)
    : null;
  const [countdownStr, setCountdownStr] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("23:59");

  const handleApplyCustomDate = () => {
    if (!customDate) {
      toast.error("Please select a valid custom expiry date.");
      return;
    }
    const [hours, minutes] = customTime.split(":").map(Number);
    const dateObj = new Date(customDate);
    dateObj.setHours(hours || 23, minutes || 59, 0, 0);

    handleControlPlan({ customExpiryDate: dateObj.toISOString() });
  };

  useEffect(() => {
    if (!planExpiryDate) {
      setCountdownStr("");
      return;
    }
    const calculate = () => {
      const diff = planExpiryDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr("Plan Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(`${days}d ${hours}h ${mins}m ${secs}s remaining`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [merchant?.planExpiry]);

  const handleControlPlan = (actionPayload) => {
    updateMerchantMutation.mutate(actionPayload, {
      onSuccess: () => {
        if (onOpenChange) onOpenChange(false);
      },
    });
  };

  if (!merchant) return null;

  const lat = merchant.location?.coordinates?.lat || merchant.lat || "N/A";
  const lng = merchant.location?.coordinates?.lng || merchant.lng || "N/A";
  const mapsUrl =
    merchant.gmapsLink ||
    (lat !== "N/A" && lng !== "N/A"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 translate-x-0 translate-y-0 w-full h-[100dvh] max-h-[100dvh] max-w-none rounded-none p-0 gap-0 border-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-5xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border border-slate-200 text-left shadow-2xl flex flex-col overflow-hidden font-sans z-50 bg-white">
        {/* Fixed Pinned Header with Safe Clearance for Close Button */}
        <DialogHeader className="px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-slate-100 bg-white shrink-0 pr-14 relative text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <DialogTitle className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  Merchant Audit: {merchant.businessName}
                </DialogTitle>
                <Badge
                  className={`text-[9px] sm:text-[10px] font-semibold uppercase px-2 py-0.5 border ${
                    merchant.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : merchant.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : merchant.status === "form_accepted"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {merchant.status || "Pending Audit"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                <span>
                  Submitted:{" "}
                  {merchant.createdAt
                    ? new Date(merchant.createdAt).toLocaleDateString("en-IN")
                    : "Recent"}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <DialogDescription className="hidden sm:inline text-[11px] text-slate-500 font-normal">
                  Detailed KYC, statutory documents &amp; location audit
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body Containing Compact Tabs & Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 sm:px-6 sm:py-4">
          <Tabs defaultValue="business" className="w-full text-xs space-y-3">
            {/* 2x2 Grid Tabs on Mobile, 4-Col Grid on Desktop for Maximum Accessibility */}
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100/90 p-1.5 rounded-xl gap-1.5 w-full shrink-0 border border-slate-200/60 h-auto">
              <TabsTrigger
                value="business"
                className="text-xs font-semibold rounded-lg py-2 px-2 flex items-center justify-center gap-1.5 h-auto data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 transition-all cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Profile &amp; Location</span>
              </TabsTrigger>
              <TabsTrigger
                value="legal"
                className="text-xs font-semibold rounded-lg py-2 px-2 flex items-center justify-center gap-1.5 h-auto data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Statutory KYC</span>
              </TabsTrigger>
              <TabsTrigger
                value="visuals"
                className="text-xs font-semibold rounded-lg py-2 px-2 flex items-center justify-center gap-1.5 h-auto data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Store Media</span>
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="text-xs font-semibold rounded-lg py-2 px-2 flex items-center justify-center gap-1.5 h-auto data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Plan &amp; Billing</span>
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: PROFILE & LOCATION ────────────────────────────── */}
            <TabsContent value="business" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                {/* Card 1: Core Business Overview */}
                <div className="bg-slate-50/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />{" "}
                      Business Overview
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Entity Info
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Business Name
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
                        {merchant.businessName}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Category
                      </span>
                      <span className="font-semibold text-slate-800 text-xs capitalize block truncate">
                        {merchant.category || "General"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Constitution
                      </span>
                      <span className="font-semibold text-slate-800 text-xs uppercase block truncate">
                        {merchant.constitution || "Proprietorship"}
                      </span>
                    </div>
                    {merchant.website && (
                      <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                          Official Website
                        </span>
                        <a
                          href={merchant.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium truncate"
                        >
                          <Globe className="w-3 h-3 shrink-0" />{" "}
                          <span className="truncate">{merchant.website}</span>
                        </a>
                      </div>
                    )}
                    {merchant.category === "others" &&
                      merchant.customCategoryNotes && (
                        <div className="col-span-2 p-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
                          <span className="font-bold block text-[9px] uppercase text-blue-700 tracking-wider">
                            Special Category Notes:
                          </span>
                          <p className="text-[11px] font-normal leading-relaxed mt-0.5">
                            {merchant.customCategoryNotes}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Card 2: Contact & Authorized Liaison */}
                <div className="bg-slate-50/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />{" "}
                      Contact &amp; Liaison
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Key Personnel
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Liaison Name
                      </span>
                      <span className="font-bold text-slate-900 text-xs block truncate">
                        {merchant.liaisonName ||
                          merchant.contactPerson ||
                          "Store Owner"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Designation
                      </span>
                      <span className="font-semibold text-slate-800 text-xs capitalize block truncate">
                        {merchant.liaisonDesignation || "Owner"}
                      </span>
                    </div>
                    <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Contact Email
                      </span>
                      <span className="font-mono text-slate-800 text-xs flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {merchant.contactEmail}
                        </span>
                      </span>
                    </div>
                    <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Phone &amp; WhatsApp
                      </span>
                      <span className="font-mono text-slate-800 text-xs flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {merchant.contactPhone ||
                          merchant.whatsappNumber ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Physical Address & Coordinates */}
                <div className="bg-slate-50/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Store
                      Location
                    </h4>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Maps
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Street Address
                      </span>
                      <span className="font-semibold text-slate-800 text-xs block leading-snug line-clamp-2">
                        {merchant.location?.address || "Registered Address"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        City &amp; State
                      </span>
                      <span className="font-semibold text-slate-900 text-xs block truncate">
                        {merchant.location?.city
                          ? `${merchant.location.city}, ${merchant.location.state || ""}`
                          : "Ranchi, Jharkhand"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        PIN Code
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {merchant.location?.pincode || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                          GPS Coordinates
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-blue-700 block truncate">
                          Lat: {lat} | Lng: {lng}
                        </span>
                      </div>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:bg-blue-100 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" /> Navigate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* WEEKLY OPERATING HOURS SCHEDULE DISPLAY */}
              <div className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                    Weekly Operating Hours Schedule
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Store Timings
                  </span>
                </div>
                {merchant.operatingHours &&
                typeof merchant.operatingHours === "object" &&
                Object.keys(merchant.operatingHours).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => {
                      const dayData = merchant.operatingHours[day];
                      const isClosed = dayData
                        ? dayData.closed === true || dayData.isOpen === false
                        : false;
                      const isOpen = !isClosed;
                      const openTime =
                        dayData?.open || dayData?.openTime || "10:00 AM";
                      const closeTime =
                        dayData?.close ||
                        dayData?.closeTime ||
                        (day === "Sunday" ? "11:00 PM" : "08:00 PM");

                      return (
                        <div
                          key={day}
                          className={`p-1.5 rounded-lg border text-center ${
                            isOpen
                              ? "bg-white border-slate-200/80 shadow-2xs"
                              : "bg-rose-50/70 border-rose-200"
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-700 block">
                            {day.slice(0, 3)}
                          </span>
                          {isOpen ? (
                            <span className="text-[9px] font-mono text-emerald-700 font-bold block mt-0.5 leading-tight">
                              {openTime} – {closeTime}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-rose-600 block mt-0.5">
                              CLOSED
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                    Mon–Sat 10:00 AM – 08:00 PM, Sun 10:00 AM – 11:00 PM
                  </div>
                )}
              </div>

              {merchant.description && (
                <div className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                    Business Description
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                    {merchant.description}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 2: STATUTORY KYC ─────────────────────────────────── */}
            <TabsContent value="legal" className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    Primary Document Type
                  </span>
                  <span className="font-bold text-blue-700 text-xs block truncate">
                    {merchant.docType || "GST Registration Certificate"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    GSTIN / Registration ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs block truncate">
                    {merchant.isGstExempt
                      ? "Exempt Micro-Merchant"
                      : merchant.gstin || "Exempt / N/A"}
                  </span>
                </div>
              </div>

              {/* PRIMARY IDENTITY DOCUMENT IMAGE PREVIEW */}
              {(() => {
                const docImgUrl =
                  merchant.docImage ||
                  merchant.docFileUrl ||
                  merchant.docUrl ||
                  merchant.identityDocumentUrl ||
                  merchant.docFile;
                return (
                  <div className="p-2.5 sm:p-3.5 bg-blue-50/30 rounded-xl border border-blue-200/80 text-center space-y-2">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Document Preview (
                        {merchant.docType || "GST Certificate"})
                      </span>
                      {docImgUrl && (
                        <a
                          href={docImgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Full Screen
                        </a>
                      )}
                    </div>

                    {docImgUrl ? (
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={docImgUrl}
                          alt={merchant.docType || "Primary Identity Document"}
                          className="max-h-72 sm:max-h-80 mx-auto object-contain rounded-xl border border-slate-200 shadow-2xs bg-white p-1"
                        />
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-1 bg-white rounded-lg border border-slate-200/60">
                        <FileText className="w-7 h-7 text-slate-300 mx-auto" />
                        <span className="text-xs text-slate-400 font-normal block">
                          No primary identity document uploaded
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* ── TAB 3: STORE VISUALS & PHOTOS ───────────────────────── */}
            <TabsContent value="visuals" className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {(() => {
                  const shopImgUrl =
                    merchant.shopImage ||
                    merchant.shopPhotoUrl ||
                    merchant.shopFrontUrl ||
                    merchant.storePhotoUrl;
                  return (
                    <div className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-center space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          Shop Front Photo
                        </span>
                        {shopImgUrl && (
                          <a
                            href={shopImgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      {shopImgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shopImgUrl}
                          alt="Shop Front"
                          className="max-h-40 sm:max-h-44 w-full object-contain rounded-lg border border-slate-200 bg-white shadow-2xs"
                        />
                      ) : (
                        <div className="py-6 text-center space-y-1 bg-white rounded-lg border border-slate-200/60">
                          <ImageIcon className="w-7 h-7 text-slate-300 mx-auto" />
                          <span className="text-xs text-slate-400 font-normal block">
                            No photo uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const logoImgUrl =
                    merchant.logo || merchant.logoUrl || merchant.shopLogo;
                  return (
                    <div className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-center space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          Store Brand Logo
                        </span>
                        {logoImgUrl && (
                          <a
                            href={logoImgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      {logoImgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoImgUrl}
                          alt="Store Logo"
                          className="max-h-40 sm:max-h-44 w-full object-contain rounded-lg border border-slate-200 bg-white shadow-2xs"
                        />
                      ) : (
                        <div className="py-6 text-center space-y-1 bg-white rounded-lg border border-slate-200/60">
                          <ImageIcon className="w-7 h-7 text-slate-300 mx-auto" />
                          <span className="text-xs text-slate-400 font-normal block">
                            No logo uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const bannerImgUrl =
                    merchant.banner ||
                    merchant.bannerUrl ||
                    merchant.shopBanner;
                  return (
                    <div className="p-2.5 sm:p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-center space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          Store Banner
                        </span>
                        {bannerImgUrl && (
                          <a
                            href={bannerImgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      {bannerImgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bannerImgUrl}
                          alt="Store Banner"
                          className="max-h-40 sm:max-h-44 w-full object-contain rounded-lg border border-slate-200 bg-white shadow-2xs"
                        />
                      ) : (
                        <div className="py-6 text-center space-y-1 bg-white rounded-lg border border-slate-200/60">
                          <ImageIcon className="w-7 h-7 text-slate-300 mx-auto" />
                          <span className="text-xs text-slate-400 font-normal block">
                            No banner uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </TabsContent>

            {/* ── TAB 4: SUBSCRIPTION & PAYMENT STATUS ─────────────────── */}
            <TabsContent value="subscription" className="space-y-3 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Card 1: Subscription Status & Expiry Overview */}
                <div className="bg-slate-50/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />{" "}
                    Subscription &amp; Payment Status
                  </h4>

                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                        Active Plan &amp; Payment Status
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const isStarter =
                            (merchant.plan || "starter")
                              .toLowerCase()
                              .includes("starter") ||
                            (merchant.plan || "")
                              .toLowerCase()
                              .includes("free");
                          const isPaymentDone =
                            isStarter ||
                            merchant.paymentStatus === "completed" ||
                            merchant.subscriptionStatus === "active";

                          return (
                            <>
                              <Badge className="bg-blue-600 text-white font-semibold text-[11px] uppercase border-0 px-2 py-0.5 rounded-md">
                                Plan: {merchant.plan || "Starter Free"}
                              </Badge>
                              <Badge
                                className={`font-semibold text-[11px] uppercase border-0 px-2 py-0.5 rounded-md ${
                                  isStarter || isPaymentDone
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-500 text-white animate-pulse"
                                }`}
                              >
                                {isStarter
                                  ? "FREE PLAN (ACTIVE)"
                                  : isPaymentDone
                                    ? "Payment Completed"
                                    : "Payment Pending"}
                              </Badge>
                            </>
                          );
                        })()}
                        {merchant.commissionRate && (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border-emerald-200/80 font-semibold px-2 py-0.5 rounded-md"
                          >
                            Commission: {merchant.commissionRate} (
                            {merchant.commissionModel || "CPA"})
                          </Badge>
                        )}
                      </div>
                    </div>

                    {planExpiryDate && (
                      <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-2 space-y-1.5 text-xs text-blue-900 font-normal">
                        <div className="flex items-center gap-1.5 border-b border-blue-100/80 pb-1 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-slate-600 font-normal text-xs">
                            Plan Expiry:
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {planExpiryDate.toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>

                        {countdownStr && (
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                              <Clock className="w-3 h-3 text-blue-600 animate-pulse shrink-0" />{" "}
                              Time Remaining:
                            </span>
                            <span className="font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md text-[11px] font-mono whitespace-nowrap">
                              {countdownStr}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Super Admin Plan Control Center */}
                <div className="bg-slate-50/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                    ⚡ Super Admin Plan Control Center
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    {/* Section 1: Compact Custom Date & Time Picker */}
                    <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block flex items-center gap-1 tracking-wider">
                        <Calendar className="w-3 h-3 text-blue-600" /> Custom
                        Expiry Date &amp; Time:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="h-7 text-xs font-normal px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="time"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="h-7 text-xs font-normal px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Button
                          size="sm"
                          disabled={isExtending || !customDate}
                          onClick={handleApplyCustomDate}
                          className="h-7 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 cursor-pointer border-0 shadow-none"
                        >
                          Set Expiry
                        </Button>
                      </div>
                    </div>

                    {/* Section 2: Quick Extend Days */}
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Quick Extend Days:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ extendDays: 7 })}
                          className="h-6 text-[11px] font-semibold text-blue-700 bg-blue-50/80 border-blue-200/80 hover:bg-blue-100 rounded-md cursor-pointer px-1 w-full"
                        >
                          +7 D
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ extendDays: 30 })}
                          className="h-6 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100 rounded-md cursor-pointer px-1 w-full"
                        >
                          +30 D
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ extendDays: 90 })}
                          className="h-6 text-[11px] font-semibold text-purple-700 bg-purple-50/80 border-purple-200/80 hover:bg-purple-100 rounded-md cursor-pointer px-1 w-full"
                        >
                          +90 D
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ extendDays: 365 })}
                          className="h-6 text-[11px] font-semibold text-amber-700 bg-amber-50/80 border-amber-200/80 hover:bg-amber-100 rounded-md cursor-pointer px-1 w-full"
                        >
                          +1 Y
                        </Button>
                      </div>
                    </div>

                    {/* Section 3: Lifecycle Actions */}
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Lifecycle Actions:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {merchant.subscriptionStatus === "paused" ||
                        merchant.paymentStatus !== "completed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isExtending}
                            onClick={() =>
                              handleControlPlan({ action: "resume" })
                            }
                            className="h-6 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 rounded-md cursor-pointer px-2"
                          >
                            ▶ Resume Plan
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isExtending}
                            onClick={() =>
                              handleControlPlan({ action: "pause" })
                            }
                            className="h-6 text-[11px] font-semibold text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100 rounded-md cursor-pointer px-2"
                          >
                            ⏸ Pause Plan
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ action: "stop" })}
                          className="h-6 text-[11px] font-semibold text-rose-800 bg-rose-50 border-rose-200 hover:bg-rose-100 rounded-md cursor-pointer px-2"
                        >
                          ⏹ Cancel Plan
                        </Button>
                      </div>
                    </div>

                    {/* Section 4: Switch Plan Tier */}
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Subscription Tier:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ plan: "starter" })}
                          className="h-6 text-[11px] font-semibold text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200 rounded-md cursor-pointer px-1"
                        >
                          Starter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ plan: "growth" })}
                          className="h-6 text-[11px] font-semibold text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100 rounded-md cursor-pointer px-1"
                        >
                          Growth
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() => handleControlPlan({ plan: "pro" })}
                          className="h-6 text-[11px] font-semibold text-purple-800 bg-purple-50 border-purple-200 hover:bg-purple-100 rounded-md cursor-pointer px-1"
                        >
                          Pro
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isExtending}
                          onClick={() =>
                            handleControlPlan({ plan: "enterprise" })
                          }
                          className="h-6 text-[11px] font-semibold text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100 rounded-md cursor-pointer px-1"
                        >
                          Enterprise
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Fixed Sticky Action Bar at Bottom */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 border-t border-slate-200/80 bg-white/95 backdrop-blur shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onAction(merchant._id, "rejected")}
            className="w-full sm:w-auto h-9 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs font-semibold rounded-lg cursor-pointer shadow-none gap-1.5 px-4"
          >
            <X className="w-3.5 h-3.5" /> Reject Application
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(merchant.status === "pending" || !merchant.status) && (
              <Button
                onClick={() => onAction(merchant._id, "form_accepted")}
                className="flex-1 sm:flex-none h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-none gap-1.5 px-4"
              >
                <Check className="w-3.5 h-3.5" /> Accept Form
              </Button>
            )}

            {(merchant.status === "form_accepted" ||
              merchant.status === "under_review" ||
              merchant.status === "pending" ||
              !merchant.status) && (
              <Button
                onClick={() => onAction(merchant._id, "approved")}
                className="flex-1 sm:flex-none h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-none gap-1.5 px-4"
              >
                <Check className="w-3.5 h-3.5" /> Approve Partner
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
