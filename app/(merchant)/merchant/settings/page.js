"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building,
  Globe,
  Loader2,
  MessageSquare,
  Share2,
  Store,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FormInput, FormTextarea } from "@/components/shared/form";
import SafeImage from "@/components/shared/SafeImage";
import {
  FacebookIcon,
  formatSocialUrl,
  InstagramIcon,
  LinkedInIcon,
  normalizeExternalUrl,
  TwitterIcon,
} from "@/components/shared/SocialLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { showSuccess } from "@/lib/toast";

const NOTIF_ROWS = [
  {
    key: "couponClaimEmail",
    label: "Coupon Claims & Redemptions",
    desc: "Real-time notification when a user claims your code",
  },
  {
    key: "campaignApprovalEmail",
    label: "Campaign Approvals & Status",
    desc: "Status updates when your campaign is approved by Vouchiqo",
  },
  {
    key: "weeklyReportEmail",
    label: "Weekly Performance Reports",
    desc: "Weekly analytics PDF delivered to your inbox every Monday",
  },
  {
    key: "billingAlertEmail",
    label: "Billing & Subscription Invoices",
    desc: "Invoice PDFs and renewal reminders",
  },
];

export default function MerchantAccountSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch live merchant profile from DB
  const { data: merchant, refetch } = useMerchantProfile();

  // State synced with live merchant document from DB
  const [logoUrl, setLogoUrl] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socials, setSocials] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
  });
  const [notifMatrix, setNotifMatrix] = useState({
    couponClaimEmail: true,
    campaignApprovalEmail: true,
    weeklyReportEmail: true,
    billingAlertEmail: true,
  });

  // Populate state when live merchant profile data arrives from DB
  useEffect(() => {
    if (merchant) {
      setLogoUrl(
        merchant.logo ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
      );
      setBusinessDesc(
        merchant.description ||
          merchant.shortDescription ||
          `${merchant.businessName} partner store on Vouchiqo platform.`,
      );
      setWebsiteUrl(merchant.website || "");

      const merchSocials = merchant.socialLinks || merchant.socials || {};
      setSocials({
        instagram:
          merchSocials.instagram ||
          merchant.instagram ||
          merchant.instagramHandle ||
          "",
        facebook:
          merchSocials.facebook ||
          merchant.facebook ||
          merchant.facebookUrl ||
          "",
        twitter:
          merchSocials.twitter || merchant.twitter || merchant.twitterUrl || "",
        linkedin:
          merchSocials.linkedin ||
          merchant.linkedin ||
          merchant.linkedinUrl ||
          "",
      });
    }
  }, [merchant]);

  // Handle saving Business Profile to DB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const cleanWebsite = normalizeExternalUrl(websiteUrl);

      const res = await fetch("/api/merchants/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: logoUrl,
          description: businessDesc,
          website: cleanWebsite,
          socialLinks: {
            instagram: formatSocialUrl("instagram", socials.instagram),
            facebook: formatSocialUrl("facebook", socials.facebook),
            twitter: formatSocialUrl("twitter", socials.twitter),
            linkedin: formatSocialUrl("linkedin", socials.linkedin),
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Business profile saved successfully!");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });
    } catch (err) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Account Settings"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-3.5 text-left font-sans w-full pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* COMPACT TABS LIST WITH SIGNATURE BRAND PINK HIGHLIGHT */}
          <TabsList className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 flex flex-wrap gap-1 justify-start h-auto w-fit">
            <TabsTrigger
              value="profile"
              className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1.5 transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
            >
              <Store className="w-3.5 h-3.5" /> Business Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1.5 transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" /> Notification Preferences
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: BUSINESS PROFILE (COMPACT & SIMPLE) ────────────────── */}
          <TabsContent value="profile" className="pt-2">
            <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-4 text-left font-sans relative overflow-hidden">
              {/* Brand Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-[#F72853] to-rose-600" />

              {/* Header */}
              <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] border border-rose-100/80 shrink-0">
                    <Building className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                      Business Profile &amp; Branding
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Store logo, description, and website URL live from
                      database
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                {/* Store Logo Section */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <Label className="flex items-center gap-1.5 font-medium text-xs text-slate-700">
                    <Upload className="w-3.5 h-3.5 text-[#F72853]" /> Store Logo
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 flex items-center justify-center shrink-0">
                      {logoUrl
                        ? <SafeImage
                            src={logoUrl}
                            alt="Store Logo"
                            fill
                            className="object-cover"
                          />
                        : <Store className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <FormInput
                        name="logoUrl"
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="h-8.5 text-xs bg-white"
                      />
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3 h-3" /> Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setLogoUrl(URL.createObjectURL(file));
                                showSuccess("Logo preview updated!");
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Recommended: 300×300px square PNG/JPG
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Description */}
                <FormTextarea
                  name="businessDesc"
                  label="Business Description"
                  icon={MessageSquare}
                  rows={3}
                  maxLength={300}
                  value={businessDesc}
                  onChange={(e) => setBusinessDesc(e.target.value)}
                  placeholder="Describe your business, products, services, or specialties..."
                  hint={`${businessDesc.length}/300 chars`}
                />

                {/* Official Store Website URL */}
                <FormInput
                  name="website"
                  label="Official Store Website URL"
                  icon={Globe}
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                />

                {/* Official Social Media Profiles */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#F72853]" />
                    <span className="text-xs font-medium text-slate-800">
                      Official Social Media Profiles
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      name="instagram"
                      label="Instagram Profile"
                      icon={InstagramIcon}
                      type="text"
                      placeholder="https://instagram.com/yourstore or @yourstore"
                      value={socials.instagram}
                      onChange={(e) =>
                        setSocials({ ...socials, instagram: e.target.value })
                      }
                    />
                    <FormInput
                      name="facebook"
                      label="Facebook Page"
                      icon={FacebookIcon}
                      type="text"
                      placeholder="https://facebook.com/yourstore or page name"
                      value={socials.facebook}
                      onChange={(e) =>
                        setSocials({ ...socials, facebook: e.target.value })
                      }
                    />
                    <FormInput
                      name="twitter"
                      label="Twitter / X Profile"
                      icon={TwitterIcon}
                      type="text"
                      placeholder="https://x.com/yourstore or @yourstore"
                      value={socials.twitter}
                      onChange={(e) =>
                        setSocials({ ...socials, twitter: e.target.value })
                      }
                    />
                    <FormInput
                      name="linkedin"
                      label="LinkedIn Company"
                      icon={LinkedInIcon}
                      type="text"
                      placeholder="https://linkedin.com/company/yourstore"
                      value={socials.linkedin}
                      onChange={(e) =>
                        setSocials({ ...socials, linkedin: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-9 px-5 rounded-xl cursor-pointer shadow-xs shadow-[#F72853]/25 transition-all flex items-center gap-1.5"
                  >
                    {isSaving
                      ? <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving to DB...
                        </>
                      : "Save Business Profile"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* ── TAB 2: NOTIFICATIONS (COMPACT & SIMPLE) ───────────────────── */}
          <TabsContent value="notifications" className="pt-2 space-y-3">
            <Card
              data-tour="settings-notifications"
              className="border-slate-200/90 shadow-sm rounded-2xl bg-white p-4 sm:p-5 space-y-3.5 text-left font-sans relative overflow-hidden"
            >
              {/* Brand Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-[#F72853] to-rose-600" />

              {/* Header */}
              <div className="border-b border-slate-100 pb-2.5 pt-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-[#F72853] border border-rose-100/80 shrink-0">
                    <Bell className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                      Notification Preferences
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Configure email alerts for coupon claims, campaign
                      updates, and billing
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-2">
                {NOTIF_ROWS.map((row) => (
                  <div
                    key={row.key}
                    className="p-2.5 sm:p-3 border border-slate-200/80 rounded-xl flex items-center justify-between bg-white hover:border-rose-200/80 transition-colors"
                  >
                    <div className="pr-3">
                      <span className="text-xs font-medium text-slate-800 block">
                        {row.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {row.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
                        Email
                      </span>
                      <Switch
                        checked={notifMatrix[row.key]}
                        onCheckedChange={(val) => {
                          setNotifMatrix((prev) => ({
                            ...prev,
                            [row.key]: val,
                          }));
                          toast.success(
                            `${row.label} ${val ? "enabled" : "disabled"}`,
                          );
                        }}
                        className="data-[state=checked]:!bg-[#F72853]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Guided Tour Reset Card */}
            <Card className="border border-rose-200/80 bg-rose-50/40 shadow-xs rounded-xl p-3 sm:p-3.5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-medium text-slate-900 block">
                    Interactive Dashboard Tour
                  </h4>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Revisit the 12-step guided walkthrough to explore all
                    features of your merchant dashboard.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("vouchiqo_merchant_tour_seen");
                      window.location.href = "/merchant/dashboard";
                    }
                  }}
                  className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8 px-3.5 rounded-lg cursor-pointer shadow-xs shadow-[#F72853]/20 shrink-0 transition-all"
                >
                  Restart Tour →
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
