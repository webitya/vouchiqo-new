"use client";

import {
  AlertTriangle,
  Bookmark,
  History,
  IndianRupee,
  MapPin,
  Settings,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
// Layout & Global Components
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmationModal from "@/components/shared/modals/ConfirmationModal";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantProfile } from "@/hooks/use-merchant";
import {
  useDeleteClaim,
  useUpdateUserProfile,
  useUser,
  useUserClaims,
  useUserProfile,
  useUserSavings,
} from "@/hooks/use-user";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import dynamic from "next/dynamic";

// Modular Tab Components (Code-split dynamically per Rule 57)
const SavingsTab = dynamic(() => import("./components/SavingsTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});
const SavedDealsTab = dynamic(() => import("./components/SavedDealsTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});
const WalletTab = dynamic(() => import("./components/WalletTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});
const ActivityTab = dynamic(() => import("./components/ActivityTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});
const NearbyOffersTab = dynamic(() => import("./components/NearbyOffersTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});
const SettingsTab = dynamic(() => import("./components/SettingsTab"), {
  loading: () => <DashboardSkeleton mode="profile" />,
});

const DONUT_COLORS = [
  "#2563eb",
  "#1E4FAF",
  "#2563eb",
  "#FFB020",
  "#A855F7",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

// Simple client-side CSS Confetti particles generator
function ConfettiOverlay({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => {
        const left = Math.random() * 100;
        const size = Math.random() * 8 + 6;
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 2;
        const rotation = Math.random() * 360;
        const color =
          DONUT_COLORS[Math.floor(Math.random() * DONUT_COLORS.length)];

        return (
          <div
            key={i}
            className="absolute top-[-20px] rounded-sm opacity-90 animate-fall"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              transform: `rotate(${rotation}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function ProfileContent() {
  const { user: authUser, role, isLoaded } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("savings");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    interests: [],
    emailNotifications: true,
    smsNotifications: false,
    expiryAlerts: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Confetti triggering state
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [copiedShareCard, setCopiedShareCard] = useState(false);

  // Selected Saved coupon modal state
  const [selectedSavedCoupon, setSelectedSavedCoupon] = useState(null);

  // Tab button element refs for auto-centering scroll
  const tabRefs = useRef({});
  const tabsContainerRef = useRef(null);

  // ── Merchant Guard ──────────────────────────────────────────────────────────
  const shouldCheckMerchant =
    isLoaded &&
    role !== "merchant" &&
    Boolean(authUser?.id);

  const { data: merchantProfile } = useMerchantProfile({
    enabled: shouldCheckMerchant,
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "merchant") {
      router.replace("/merchant/dashboard");
      return;
    }
    if (shouldCheckMerchant && merchantProfile) {
      router.replace("/merchant/dashboard");
    }
  }, [isLoaded, role, shouldCheckMerchant, merchantProfile, router]);
  // ───────────────────────────────────────────────────────────────────────────

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Load Tab from URL Parameter dynamically or redirect default /profile to /customer/dashboard
  useEffect(() => {
    const validTabs = [
      "savings",
      "saved",
      "wallet",
      "activity",
      "nearby",
      "settings",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      router.replace("/customer/dashboard");
    }
  }, [tabParam, router]);

  // Smoothly center the active tab in the horizontally scrollable bar
  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      const timer = setTimeout(() => {
        tabRefs.current[activeTab]?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Sync activeTab to URL search params & scroll into view
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("tab", tabName);
      window.history.pushState({}, "", url);
      window.dispatchEvent(new Event("vouchiqo_nav_change"));
      window.dispatchEvent(new Event("popstate"));
    }

    const btn = tabRefs.current[tabName];
    if (btn) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // TanStack Query Hooks
  const { data: savingsData, isLoading: isSavingsLoading } = useUserSavings();
  const { data: rawProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: rawClaims, isLoading: isClaimsLoading } = useUserClaims("active");
  const updateUserMutation = useUpdateUserProfile();
  const deleteClaimMutation = useDeleteClaim();

  const loading = isSavingsLoading || isProfileLoading || isClaimsLoading;

  // Sync profile settings state when query data updates
  useEffect(() => {
    if (rawProfile) {
      const { user, profile } = rawProfile;
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || user?.phoneNumber || "",
        city: profile?.location?.city || "",
        state: profile?.location?.state || "",
        interests: profile?.interests || [],
        emailNotifications: profile?.emailNotifications ?? true,
        smsNotifications: profile?.smsNotifications ?? false,
        expiryAlerts: profile?.expiryAlerts ?? true,
      });
    }
  }, [rawProfile]);

  const savedClaims = useMemo(() => {
    return (rawClaims || []).map((claim) => ({
      ...claim.couponId,
      claimId: claim._id,
    }));
  }, [rawClaims]);

  useEffect(() => {
    if (savingsData?.milestones) {
      checkAndTriggerConfetti(savingsData.milestones);
    }
  }, [savingsData?.milestones]);

  const checkAndTriggerConfetti = (milestones) => {
    try {
      const celebrated = JSON.parse(
        localStorage.getItem("vouchiqo_celebrated_milestones") || "[]",
      );
      const newlyUnlocked = [];
      milestones.forEach((m) => {
        if (m.achieved && !celebrated.includes(m.id)) {
          newlyUnlocked.push(m.id);
        }
      });
      if (newlyUnlocked.length > 0) {
        setTriggerConfetti(true);
        localStorage.setItem(
          "vouchiqo_celebrated_milestones",
          JSON.stringify([...celebrated, ...newlyUnlocked]),
        );
        setTimeout(() => setTriggerConfetti(false), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateUserMutation.mutateAsync({
        name: profileData.name,
        phone: profileData.phone,
        location: {
          city: profileData.city,
          state: profileData.state,
          country: "IN",
        },
        interests: profileData.interests,
        emailNotifications: profileData.emailNotifications,
        smsNotifications: profileData.smsNotifications,
        expiryAlerts: profileData.expiryAlerts,
      });
    } catch {
      // Error handled by mutation
    } finally {
      setSavingSettings(false);
    }
  };

  const [removeClaimTarget, setRemoveClaimTarget] = useState(null);
  const [removeClaimPending, setRemoveClaimPending] = useState(false);

  // Remove saved coupon claim
  const handleRemoveClaim = (e, claimId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRemoveClaimTarget(claimId);
  };

  const confirmRemoveClaim = async () => {
    if (!removeClaimTarget) return;
    try {
      setRemoveClaimPending(true);
      await deleteClaimMutation.mutateAsync(removeClaimTarget);
    } catch (err) {
      console.error(err);
    } finally {
      setRemoveClaimPending(false);
      setRemoveClaimTarget(null);
    }
  };

  // Claim/Redeem from Saved Tab
  const handleRedeemConfirm = async (couponId) => {
    const couponObj = savedClaims.find((c) => c._id === couponId);
    if (!couponObj || !couponObj.claimId) throw new Error("Claim ID not found");

    const payload = await apiFetch("/api/redemptions", {
      method: "POST",
      body: { claimId: couponObj.claimId, couponId },
    });

    toast.success("Voucher claimed!");
    queryClient.invalidateQueries({ queryKey: qk.user.savings() });
    queryClient.invalidateQueries({ queryKey: qk.user.claims("active") });
    queryClient.invalidateQueries({ queryKey: qk.user.redemptions() });
    return payload?.data?.couponCode;
  };

  const handleShareSavings = () => {
    const saved = Number(savingsData?.kpis?.totalSavedMonth) || 0;
    const shareText = `I saved ₹${saved.toLocaleString("en-IN")} this month using Vouchiqo! 🔴 Find verified offer codes and save. https://vouchiqo.com`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedShareCard(true);
    toast.success("Copied & opening WhatsApp!");
    setTimeout(() => setCopiedShareCard(false), 3000);
    if (typeof window !== "undefined") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!savingsData || !savingsData.recentTransactions) return;
    const headers = [
      "Date",
      "Brand",
      "Offer Code",
      "Original Price",
      "Discount Applied",
      "Amount Paid",
      "Amount Saved",
      "Category",
    ];
    const rows = savingsData.recentTransactions.map((t) => [
      t.date,
      t.brand,
      t.code,
      t.originalPrice,
      t.discountApplied,
      t.amountPaid,
      t.amountSaved,
      t.category,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Vouchiqo_Savings_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Shopping preference tag
  const handleInterestToggle = (category) => {
    const isSel = profileData.interests.includes(category);
    const nextInterests = isSel
      ? profileData.interests.filter((c) => c !== category)
      : [...profileData.interests, category];
    setProfileData({ ...profileData, interests: nextInterests });
  };

  const profileUsername = authUser?.name ? authUser.name.split(" ")[0] : "User";

  if (loading && !savingsData) {
    return (
      <DashboardLayout
        title={`${profileUsername} Profile`}
        user={authUser || { name: "User", role: "customer" }}
      >
        <DashboardSkeleton mode="profile" />
      </DashboardLayout>
    );
  }

  const PROFILE_TABS = [
    { id: "savings", label: "Savings Hub", icon: IndianRupee },
    { id: "saved", label: "Saved Deals", icon: Bookmark },
    { id: "wallet", label: "Cashback Wallet", icon: Wallet },
    { id: "activity", label: "Activity", icon: History },
    { id: "nearby", label: "Nearby Offers", icon: MapPin },
    { id: "settings", label: "Preferences & Settings", icon: Settings },
  ];

  return (
    <DashboardLayout
      title={`${profileUsername} Profile`}
      user={
        authUser || {
          name: profileData.name || "User",
          email: authUser?.email || profileData?.email,
          role: "customer",
        }
      }
    >
      <ConfettiOverlay active={triggerConfetti} />

      {/* Horizontal Nav Tabs (Mobile Only - Hidden on Desktop as sidebar handles navigation) */}
      <div
        ref={tabsContainerRef}
        className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 border-b border-slate-200/80 mb-3 sm:mb-4 select-none px-0.5"
      >
        {PROFILE_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                if (el) tabRefs.current[t.id] = el;
              }}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                isActive
                  ? "bg-rose-50 text-[#F72853] border-rose-200 font-medium shadow-2xs"
                  : "bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900 font-normal"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isActive ? "text-[#F72853]" : "text-slate-400"}`}
              />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="space-y-6 pt-1">
        {activeTab === "savings" && savingsData && (
          <SavingsTab
            savingsData={savingsData}
            handleShareSavings={handleShareSavings}
            copiedShareCard={copiedShareCard}
            handleExportCSV={handleExportCSV}
          />
        )}

        {activeTab === "saved" && (
          <SavedDealsTab
            savedClaims={savedClaims}
            handleRemoveClaim={handleRemoveClaim}
            setSelectedSavedCoupon={setSelectedSavedCoupon}
          />
        )}

        {activeTab === "wallet" && <WalletTab />}

        {activeTab === "activity" && <ActivityTab />}

        {activeTab === "nearby" && <NearbyOffersTab />}

        {activeTab === "settings" && (
          <SettingsTab
            profileData={profileData}
            setProfileData={setProfileData}
            savingSettings={savingSettings}
            handleSaveSettings={handleSaveSettings}
            setShowDeleteModal={setShowDeleteModal}
            handleInterestToggle={handleInterestToggle}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedSavedCoupon && (
        <ConfirmationModal
          coupon={selectedSavedCoupon}
          onClose={() => setSelectedSavedCoupon(null)}
          onConfirm={handleRedeemConfirm}
        />
      )}

      {/* Account deletion modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 animate-fade-in-scale">
          <div className="bg-white border border-brand-border rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-brand-error/15 text-brand-error flex items-center justify-center mx-auto border border-brand-error/30">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-brand-navy">
                Delete Account?
              </h3>
              <p className="text-xs text-brand-subtext leading-relaxed">
                This will permanently delete your user profile and wipe all
                tracked savings. This action is irreversible.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="btn-tertiary flex-1 py-2 text-xs font-bold border-brand-border h-auto cursor-pointer shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  toast.error("Action restricted in demo.");
                  setShowDeleteModal(false);
                }}
                className="bg-brand-error hover:bg-red-700 text-white flex-1 py-2 text-xs font-bold border-0 h-auto cursor-pointer shadow-none"
              >
                Delete Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Bookmark Modal */}
      <ConfirmDeleteModal
        open={!!removeClaimTarget}
        onOpenChange={(open) => !open && setRemoveClaimTarget(null)}
        title="Remove Saved Bookmark"
        description="Are you sure you want to remove this offer from your saved bookmarks?"
        onConfirm={confirmRemoveClaim}
        isPending={removeClaimPending}
      />
    </DashboardLayout>
  );
}

export default function ProfileHub() {
  return (
    <Suspense fallback={<DashboardSkeleton mode="profile" />}>
      <ProfileContent />
    </Suspense>
  );
}
