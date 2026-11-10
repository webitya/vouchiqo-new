"use client";

import { Bell, Heart, MapPin, Phone, Save, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

const TRENDING_CATEGORIES = [
  "Food & Dining",
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Beauty & Skincare",
  "Travel & Hotels",
  "Health & Fitness",
  "Home & Décor",
  "SaaS & Productivity",
  "Local Services",
  "Other Deals",
];

export default function SettingsTab({
  profileData,
  setProfileData,
  savingSettings,
  handleSaveSettings,
  setShowDeleteModal,
  handleInterestToggle,
}) {
  const [phoneError, setPhoneError] = useState("");

  const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const normalized = normalizePhone(e.target.value);
    setProfileData({ ...profileData, phone: normalized });
    if (normalized.length > 0 && normalized.length < 10) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
    } else {
      setPhoneError("");
    }
  };

  const handleFormSubmit = (e) => {
    const ph = profileData.phone;
    if (ph && ph.length !== 10) {
      e.preventDefault();
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (ph && !/^[6-9]\d{9}$/.test(ph)) {
      e.preventDefault();
      setPhoneError("Number must start with 6, 7, 8, or 9.");
      return;
    }
    handleSaveSettings(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5 w-full text-left font-sans">
      {/* Personal Details */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-[#F72853]" />
          <span>Personal Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Full Name
            </Label>
            <Input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="bg-slate-50/70 border-slate-200 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-[#F72853]"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Email Address
            </Label>
            <Input
              type="email"
              value={profileData.email}
              disabled
              className="bg-slate-100/70 border-slate-200 opacity-70 text-xs cursor-not-allowed rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-600">
              <Phone className="w-3 h-3 text-[#F72853]" />
              Phone Number
            </Label>
            <InputGroup
              className={`bg-slate-50/70 border rounded-lg h-9 px-1 ${
                phoneError ? "border-red-400" : "border-slate-200"
              }`}
            >
              <InputGroupAddon>
                <span className="text-xs font-medium text-slate-400 select-none">
                  +91
                </span>
              </InputGroupAddon>
              <InputGroupInput
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={profileData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                className="text-xs h-full tracking-wider"
              />
            </InputGroup>
            {phoneError && (
              <p className="text-[10px] text-red-500 font-normal mt-0.5">
                {phoneError}
              </p>
            )}
            <p className="text-[9.5px] text-slate-400 font-normal">
              10-digit mobile number (e.g. 9876543210)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                City
              </Label>
              <InputGroup className="bg-slate-50/70 border border-slate-200 rounded-lg h-9 px-1">
                <InputGroupAddon>
                  <MapPin className="w-3 h-3 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Ranchi"
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({ ...profileData, city: e.target.value })
                  }
                  className="text-xs h-full"
                />
              </InputGroup>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                State
              </Label>
              <Input
                type="text"
                placeholder="Jharkhand"
                value={profileData.state}
                onChange={(e) =>
                  setProfileData({ ...profileData, state: e.target.value })
                }
                className="bg-slate-50/70 border-slate-200 text-xs rounded-lg h-9 focus-visible:ring-1 focus-visible:ring-[#F72853]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interest categories selection */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-[#F72853]" />
          <span>Shopping Category Interests</span>
        </h3>
        <p className="text-[10.5px] text-slate-500 font-normal">
          Select categories to customize your personalized deals feed.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
          {TRENDING_CATEGORIES.map((cat) => {
            const isSel = profileData.interests.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleInterestToggle(cat)}
                className={`text-[10px] font-normal py-1 px-2.5 rounded-full border cursor-pointer transition-all ${
                  isSel
                    ? "bg-rose-50 text-[#F72853] border-rose-200 font-medium shadow-2xs"
                    : "bg-slate-50 text-slate-600 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#F72853]" />
          <span>Notification Preferences</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-800 block">
                Email Alerts
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Weekly curated deals digest &amp; savings summaries.
              </span>
            </div>
            <Checkbox
              checked={profileData.emailNotifications}
              onCheckedChange={(c) =>
                setProfileData({
                  ...profileData,
                  emailNotifications: !!c,
                })
              }
            />
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-800 block">
                SMS Confirmation
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Receive instant claim vouchers via SMS.
              </span>
            </div>
            <Checkbox
              checked={profileData.smsNotifications}
              onCheckedChange={(c) =>
                setProfileData({ ...profileData, smsNotifications: !!c })
              }
            />
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-800 block">
                Expiry Warnings
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Notify 24 hours prior to offer expiration.
              </span>
            </div>
            <Checkbox
              checked={profileData.expiryAlerts}
              onCheckedChange={(c) =>
                setProfileData({ ...profileData, expiryAlerts: !!c })
              }
            />
          </div>
        </div>
      </div>

      {/* Account deletion warning */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs font-medium text-slate-800 block">
            Delete Account
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Permanently wipe credentials and savings records.
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs font-normal border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1 px-3 h-8 rounded-lg cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Profile</span>
        </Button>
      </div>

      <Button
        type="submit"
        disabled={savingSettings}
        className="w-full py-2.5 text-xs font-medium border-0 h-auto cursor-pointer shadow-2xs text-white bg-[#F72853] hover:bg-[#df1c44] flex items-center justify-center gap-1.5 rounded-xl transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        <span>{savingSettings ? "Saving Settings..." : "Save Settings"}</span>
      </Button>
    </form>
  );
}
