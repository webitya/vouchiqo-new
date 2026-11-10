"use client";

import { AlertTriangle, ArrowRight, Clock, Lock, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CompleteProfileModal from "@/app/(merchant)/merchant/dashboard/components/CompleteProfileModal";
import PaymentPendingModal from "@/app/(merchant)/merchant/dashboard/components/PaymentPendingModal";
import { AppSidebar } from "@/components/layout/AppSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Topbar from "@/components/layout/Topbar";
import MerchantTour from "@/components/merchant/tour/MerchantTour";
import {
  MerchantLockProvider,
  useMerchantLock,
} from "@/components/shared/MerchantLockProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import AdminPageSkeleton from "@/components/shared/skeletons/AdminPageSkeleton";

function MerchantLockModalRenderer() {
  const { isModalOpen, closeModal, merchant } = useMerchantLock();

  return (
    <>
      <CompleteProfileModal
        merchant={merchant}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <PaymentPendingModal merchant={merchant} />
    </>
  );
}

function MerchantPageLockOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isLocked,
    isProfileIncomplete,
    isPending,
    isRejected,
    health,
    openModal,
    merchant,
  } = useMerchantLock();

  if (
    !isLocked ||
    pathname.startsWith("/merchant/profile") ||
    pathname.startsWith("/merchant/application-status")
  ) {
    return null;
  }

  const percentage = health?.percentage || 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    percentage >= 85 ? "#10b981" : percentage >= 50 ? "#ea580c" : "#ef4444";

  return (
    <div
      onClick={openModal}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 text-center cursor-pointer transition-all animate-in fade-in duration-300 select-none overflow-y-auto font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200"
      >
        {/* Circular Profile Health Gauge */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90 origin-center"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="7.5"
              stroke="currentColor"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="7.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={strokeColor}
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Number & Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {percentage}%
            </span>
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">
              Health
            </span>
          </div>

          {/* Status Icon Badge */}
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
            {isPending ? (
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            ) : (
              <Lock className="w-4 h-4 text-slate-700" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {isPending
                ? "Application Under Review"
                : isRejected
                  ? "Application Rejected"
                  : "Dashboard Content Locked"}
            </h3>
            {isProfileIncomplete && (
              <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
                Incomplete
              </Badge>
            )}
            {isPending && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                Under Audit
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {isPending
              ? "Your merchant profile & KYC verification are currently under review by our super admin team. Account features will be activated upon approval."
              : isRejected
                ? merchant?.rejectionReason ||
                  "Your merchant profile was rejected. Please update your details and resubmit."
                : "Your store profile is currently incomplete. Complete your required store details to unlock your listings, analytics, and partner controls."}
          </p>
        </div>

        <div className="pt-1 flex flex-col gap-2">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isPending) {
                router.push("/merchant/application-status");
              } else {
                openModal();
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-11 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>{isPending ? "Track Status" : "Complete Profile"}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MerchantNoticeBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { merchant } = useMerchantLock();
  const [dismissed, setDismissed] = useState(false);

  if (!merchant || dismissed || pathname?.startsWith("/merchant/billing")) {
    return null;
  }

  const rawPlan = String(merchant.plan || "starter").toLowerCase();
  const isStarter =
    rawPlan.includes("starter") || rawPlan.includes("free") || !merchant.plan;

  const planName = isStarter
    ? "Starter Free"
    : rawPlan.includes("growth")
      ? "Growth Partner"
      : rawPlan.includes("pro")
        ? "Pro Partner"
        : rawPlan.includes("enterprise")
          ? "Enterprise"
          : merchant.plan;

  let daysRemaining = 0;
  let hasExpiry = false;

  if (merchant.planExpiry) {
    const expiryTime = new Date(merchant.planExpiry).getTime();
    const diffMs = expiryTime - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    hasExpiry = true;
  } else if (!isStarter && merchant.createdAt) {
    const createdTime = new Date(merchant.createdAt).getTime();
    const elapsedDays = Math.floor(
      (Date.now() - createdTime) / (1000 * 60 * 60 * 24),
    );
    daysRemaining = Math.max(0, 14 - elapsedDays);
    hasExpiry = true;
  }

  const isPaused = merchant.subscriptionStatus === "paused";
  const isCancelled = merchant.subscriptionStatus === "cancelled";
  const isPendingPayment =
    !isStarter &&
    !isPaused &&
    !isCancelled &&
    merchant.paymentStatus !== "completed" &&
    merchant.subscriptionStatus !== "active" &&
    (!merchant.planExpiry ||
      new Date(merchant.planExpiry).getTime() < Date.now());

  return (
    <div className="bg-blue-50/80 border-b border-blue-200/60 px-4 py-2.5 flex items-center justify-between text-xs font-normal text-blue-900 font-sans">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
        <span className="truncate">
          <strong>Founding Merchant Program Active:</strong>{" "}
          {isPaused ? (
            <span>Your subscription is currently paused by admin.</span>
          ) : isCancelled ? (
            <span>Your subscription has been cancelled.</span>
          ) : isPendingPayment ? (
            <span>
              Payment is pending for your <strong>{planName}</strong> plan.
            </span>
          ) : isStarter ? (
            <span>
              You are on <strong>Starter Free</strong> plan (Up to 3 active
              listings included). Upgrade to Growth or Pro to unlock up to 15+
              listings.
            </span>
          ) : (
            <span>
              Your 14-day free trial on <strong>{planName}</strong> plan is
              active
              {hasExpiry ? (
                <span>
                  {" "}
                  (
                  <strong>
                    {daysRemaining} day{daysRemaining === 1 ? "" : "s"}{" "}
                    remaining
                  </strong>
                  )
                </span>
              ) : null}
              . Rate lock guaranteed for 6 months.
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          onClick={() => router.push("/merchant/billing")}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] font-medium cursor-pointer px-2.5 py-0.5 shadow-xs"
        >
          {isStarter ? "Upgrade Plan" : "Manage Subscription"}
        </Badge>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-blue-700 hover:text-blue-900 p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function MerchantRouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoaded, isLoggedIn, user: authUser } = useUser();
  const {
    isLocked,
    isPending,
    isProfileIncomplete,
    isApproved,
    merchant,
    isFetched,
  } = useMerchantLock();

  useEffect(() => {
    if (!isLoaded || !isLoggedIn) return;

    if (pathname.startsWith("/merchant")) {
      const isRegisteredMerchant =
        typeof window !== "undefined" &&
        sessionStorage.getItem("vouchiqo_is_merchant") === "true";

      const isRestrictedPath =
        pathname.startsWith("/merchant/coupons") ||
        pathname.startsWith("/merchant/analytics") ||
        pathname.startsWith("/merchant/campaigns") ||
        pathname.startsWith("/merchant/notifications") ||
        pathname.startsWith("/merchant/affiliates") ||
        pathname.startsWith("/merchant/affiliate-products") ||
        pathname.startsWith("/merchant/revivals");

      // Only lock restricted paths if not approved
      if (isLocked && isRestrictedPath && !isApproved) {
        if (isPending) {
          router.push("/merchant/application-status");
          return;
        }
        if (isProfileIncomplete) {
          router.push("/merchant/profile?edit=true");
          return;
        }
      }

      // If user session still says customer, sync with DB/cookieCache
      if (role !== "merchant" && role !== "admin") {
        if (isRegisteredMerchant || isApproved || merchant) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("vouchiqo_is_merchant", "true");
          }
          authClient
            .getSession({ query: { disableCookieCache: true } })
            .catch(() => {});
        } else if (isFetched && !merchant) {
          router.push("/customer/dashboard");
        }
      }
    }
  }, [
    isLoaded,
    isLoggedIn,
    pathname,
    isLocked,
    isPending,
    isProfileIncomplete,
    isApproved,
    merchant,
    isFetched,
    role,
    router,
  ]);

  return children;
}

export default function DashboardLayout({ title, user, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoaded, isLoggedIn, user: authUser } = useUser();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Verify admin access — no DB check needed, admin role is always explicit
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        router.push("/");
      }
    }
  }, [isLoaded, isLoggedIn, role, pathname, router]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex bg-white text-slate-900 font-sans w-full">
        {/* Sidebar Skeleton (desktop) */}
        <div className="w-[250px] bg-slate-50/80 border-r border-slate-200/80 p-3 hidden md:flex flex-col justify-between shrink-0 animate-pulse">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20" />
              <div className="h-4.5 w-24 rounded bg-slate-200" />
            </div>
            <div className="space-y-1.5 pt-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-100/90 w-full" />
              ))}
            </div>
          </div>
          <div className="h-10 rounded-xl bg-slate-100 w-full" />
        </div>
        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between">
            <div className="h-4.5 w-36 rounded bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100" />
              <div className="w-8 h-8 rounded-full bg-slate-100" />
            </div>
          </div>
          <main className="p-[7px] w-full grow bg-white">
            <AdminPageSkeleton cardsCount={4} rowsCount={6} hasTabs={true} />
          </main>
        </div>
      </div>
    );
  }

  const isMerchant = pathname.startsWith("/merchant");

  return (
    <MerchantLockProvider isMerchant={isMerchant}>
      <MerchantRouteGuard>
      <TooltipProvider>
        <SidebarProvider style={{ "--sidebar-width": "250px" }}>
          <div className="min-h-screen flex bg-white text-slate-900 font-sans w-full pb-14 md:pb-0">
            <AppSidebar />
            <SidebarInset className="bg-white flex-1 flex flex-col min-w-0 font-sans">
              <Topbar title={title} user={user} />

              {/* Dynamic Live Merchant Notice Alert Banner */}
              {isMerchant && <MerchantNoticeBanner />}

              <main className="p-[7px] w-full grow bg-white relative">
                {isMerchant && <MerchantPageLockOverlay />}
                {children}
              </main>
            </SidebarInset>
          </div>

          {/* Interactive Guided Tour for Merchants */}
          {isMerchant && <MerchantTour />}

          {/* Mobile Bottom Tab Bar (5 Tabs) */}
          <MobileBottomNav />

          {/* Global Controlled Merchant Complete Profile Modal */}
          {isMerchant && <MerchantLockModalRenderer />}
        </SidebarProvider>
      </TooltipProvider>
    </MerchantRouteGuard>
    </MerchantLockProvider>
  );
}
