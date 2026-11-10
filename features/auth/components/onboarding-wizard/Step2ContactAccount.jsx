"use client";

import React from "react";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  PhoneCall,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Building,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DESIGNATIONS,
  FieldTip,
  InstagramIcon,
  FacebookIcon,
} from "./constants";

export default function Step2ContactAccount({
  formData,
  setFormData,
  fieldErrors,
  clearFieldError,
  duplicateErrors,
  checkDuplicateField,
  showPassword,
  setShowPassword,
  handleAutoSuggestPassword,
  getInputClass,
  getSelectClass,
  getLabelClass,
  shadowInputClass,
  shadowSelectClass,
}) {
  return (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section B: Contact Details &amp; Account Setup
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Management liaison contact and account login password
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 2 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            {/* 4-Column Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("contactName")}>
                  Authorized Liaison Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User
                    className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.contactName ? "text-rose-500" : "text-slate-400"}`}
                  />
                  <Input
                    type="text"
                    placeholder="Rajan Kumar Singh"
                    value={formData.contactName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        contactName: val,
                        signatoryName: val,
                      }));
                      clearFieldError("contactName");
                    }}
                    className={getInputClass("contactName")}
                  />
                </div>
                {fieldErrors.contactName ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                    {fieldErrors.contactName}
                  </p>
                ) : (
                  <FieldTip text="Person managing store offers & official updates." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("designation")}>
                  Designation <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.designation}
                  onValueChange={(val) => {
                    setFormData({ ...formData, designation: val });
                    clearFieldError("designation");
                  }}
                >
                  <SelectTrigger className={getSelectClass("designation")}>
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.designation ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                    {fieldErrors.designation}
                  </p>
                ) : (
                  <FieldTip text="Signatory privileges for partnership agreements." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("mobile")}>
                  Primary Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone
                    className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.mobile ? "text-rose-500" : "text-slate-400"}`}
                  />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: e.target.value });
                      clearFieldError("mobile");
                    }}
                    className={getInputClass("mobile")}
                  />
                </div>
                {fieldErrors.mobile ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                    {fieldErrors.mobile}
                  </p>
                ) : (
                  <FieldTip text="Used for account security OTPs & deal alerts." />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-700">
                    WhatsApp Number{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.mobile) {
                        toast.error(
                          "Please enter Primary Mobile Number first.",
                        );
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: prev.mobile,
                      }));
                      toast.success("Copied Mobile to WhatsApp!");
                    }}
                    className="text-[9.5px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                  >
                    Same as Mobile
                  </button>
                </div>
                <div className="relative">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className={shadowInputClass}
                  />
                </div>
                <FieldTip text="Sends instant offer claim notifications." />
              </div>
            </div>

            {/* Email & Password (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("email")}>
                  Business Email (Login ID){" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail
                    className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.email ? "text-rose-500" : "text-slate-400"}`}
                  />
                  <Input
                    type="email"
                    placeholder="info@marbella.in"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      clearFieldError("email");
                    }}
                    className={getInputClass("email")}
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                    {fieldErrors.email}
                  </p>
                ) : (
                  <FieldTip text="Your primary account login email for accessing Merchant panel." />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className={getLabelClass("password")}>
                    Create Password <span className="text-rose-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestPassword}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>⚡ Suggest Password</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.password ? "text-rose-500" : "text-slate-400"}`}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      clearFieldError("password");
                    }}
                    className={getInputClass("password") + " pr-9"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <FieldTip text="Security password for signing into merchant dashboard." />
                )}
              </div>
            </div>

            {/* Social Web Links (3 Columns) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                Web Presence &amp; Social Links (Optional)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Website URL
                  </Label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://www.marbella.in"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Instagram Handle
                  </Label>
                  <div className="relative">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="@marbellatiles"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagramHandle: e.target.value,
                        })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Facebook URL
                  </Label>
                  <div className="relative">
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://facebook.com/marbellatiles"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facebookUrl: e.target.value,
                        })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
  );
}
