"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  History,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmationModal from "@/components/shared/modals/ConfirmationModal";
import CouponCard from "@/components/shared/cards/CouponCard";
import KPICard from "@/components/shared/cards/KPICard";
import { useMerchantProfile } from "@/hooks/use-merchant";
import {
  useCustomerRevivalStats,
  useUser,
  useUserClaims,
  useUserSavings,
} from "@/hooks/use-user";

export default function CustomerDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Fetch actual user session
  const { user: authUser, role, isLoaded } = useUser();
  const user = authUser || { name: "Aditya Kumar", role: "customer" };

  const isRegisteredMerchant =
    typeof window !== "undefined" &&
    sessionStorage.getItem("vouchiqo_is_merchant") === "true";

  const shouldCheckMerchant =
    isLoaded &&
    Boolean(authUser?.id || authUser?.email) &&
    role !== "merchant" &&
    !isRegisteredMerchant;

  const { data: merchantProfile } = useMerchantProfile({
    enabled: shouldCheckMerchant,
  });

  // ── Merchant Guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    if (role === "merchant" || isRegisteredMerchant) {
      router.replace("/merchant/dashboard");
      return;
    }

    if (shouldCheckMerchant && merchantProfile) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }
      router.replace("/merchant/dashboard");
    }
  }, [isLoaded, role, isRegisteredMerchant, shouldCheckMerchant, merchantProfile, router]);
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch actual savings, claims, and revivals data
  const { data: savingsData } = useUserSavings();
  const { data: claimsData } = useUserClaims("active");
  const { data: revivalsData } = useCustomerRevivalStats();

  // Map active claims to coupon details
  const coupons = (claimsData || []).map((claim) => ({
    ...claim.couponId,
    claimId: claim._id,
  }));

  // Populated listings (Real database records only, no mock cards)
  const claimedCoupons = coupons.slice(0, 2);
  const savedCoupons = coupons.slice(2);

  const activities =
    savingsData?.recentTransactions && savingsData.recentTransactions.length > 0
      ? savingsData.recentTransactions.slice(0, 4).map((tx) => ({
          title: `Redeemed at ${tx.brand}`,
          description: `Saved ₹${tx.amountSaved.replace(/[^0-9.]/g, "")} on ${tx.category}`,
          time: tx.date,
          icon: Ticket,
        }))
      : [
          {
            title: "Claimed Burger House BOGO",
            description: "Redeemed Buy One Get One code BURGER30",
            time: "1 day ago",
            icon: Ticket,
          },
          {
            title: "Saved StyleZone Summer coupon",
            description: "Bookmarked 20% off for in-store purchase",
            time: "2 days ago",
            icon: Bookmark,
          },
          {
            title: "Voted to revive Zomato Premier",
            description: "Submitted an expired coupon revival request",
            time: "3 days ago",
            icon: RefreshCw,
          },
        ];

  const totalSavedValue = savingsData?.kpis?.totalSavedAllTime
    ? `₹${Number(savingsData.kpis.totalSavedAllTime).toLocaleString("en-IN")}`
    : "₹0";

  const activeClaimsCount = claimsData?.length || 0;
  const savedItemsCount = savedCoupons.length;
  const totalVotesCount = revivalsData?.totalVotesCast || 0;

  const handleRedeemConfirm = async (couponIdOrObj) => {
    const couponId = typeof couponIdOrObj === "object" ? couponIdOrObj._id : couponIdOrObj;
    const clmId =
      selectedCoupon?.claimId ||
      (claimsData || []).find((c) => {
        const cId = c.couponId?._id || c.couponId?.id || c.couponId;
        return String(cId) === String(couponId);
      })?._id;

    if (!clmId) throw new Error("Claim ID not found for this offer");

    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimId: String(clmId),
        couponId: String(couponId),
      }),
    });

    if (!res.ok) throw new Error("Failed to redeem coupon");
    const json = await res.json();

    // Invalidate query caches to refresh statistics and listings
    queryClient.invalidateQueries({ queryKey: qk.user.savings() });
    queryClient.invalidateQueries({ queryKey: qk.user.claims() });

    return json.data?.couponCode;
  };

  // Resolve title using username fetch
  const username = user.name ? user.name.split(" ")[0] : "User";
  const title = `${username}'s Hub`;

  // Dynamic Welcome Message depending on visit count & time of day
  const [welcomeInfo, setWelcomeInfo] = useState({
    heading: `Welcome back, ${username}!`,
    subtitle: "Check out your updated savings timeline and active claims below.",
  });

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `vouchiqo_visit_count_${user.id}`;
    let visits = Number(localStorage.getItem(storageKey) || 0) + 1;
    localStorage.setItem(storageKey, String(visits));

    const currentHour = new Date().getHours();
    let timeGreeting = "Welcome back";
    if (currentHour >= 5 && currentHour < 12) timeGreeting = "Good morning";
    else if (currentHour >= 12 && currentHour < 17) timeGreeting = "Good afternoon";
    else if (currentHour >= 17 && currentHour < 22) timeGreeting = "Good evening";

    if (visits === 1) {
      setWelcomeInfo({
        heading: `Welcome to Vouchiqo, ${username}! 🎉`,
        subtitle:
          "Explore exclusive local offers, claim verified coupons, and track your total savings.",
      });
    } else if (visits === 2) {
      setWelcomeInfo({
        heading: `Great to see you again, ${username}! ✨`,
        subtitle:
          "Ready for your next deal? Check out active claims, trending brand offers, and local discounts below.",
      });
    } else {
      const activeText =
        activeClaimsCount > 0
          ? `You have ${activeClaimsCount} active claim(s) ready to redeem at local stores!`
          : "Check out your updated savings timeline, claimed coupons, and active offers below.";
      setWelcomeInfo({
        heading: `${timeGreeting}, ${username}!`,
        subtitle: activeText,
      });
    }
  }, [user?.id, username, activeClaimsCount]);

  return (
    <DashboardLayout title={title} user={user}>
      <div className="space-y-4 sm:space-y-5 text-left font-sans">
        {/* Soft Welcome Banner */}
        <div className="bg-gradient-to-r from-rose-50/80 via-pink-50/40 to-white border border-rose-200/70 p-4 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden shadow-2xs">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#F72853] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Savings Hub</span>
            </div>
            <h2 className="text-base sm:text-lg font-medium text-slate-800 tracking-tight">
              {welcomeInfo.heading}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
              {welcomeInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Compact KPI Cards Grid (2x2 on Mobile, 4-col on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <KPICard
            title="Total Cash Saved"
            value={totalSavedValue}
            change={savingsData?.kpis?.savingsRate || 12.5}
            isPositive={true}
            icon={IndianRupee}
            variant="emerald"
          />
          <KPICard
            title="Active Claims"
            value={`${activeClaimsCount} Offers`}
            change={0.0}
            isPositive={true}
            icon={Ticket}
            variant="purple"
          />
          <KPICard
            title="Saved Items"
            value={`${savedItemsCount} Offers`}
            change={0.0}
            isPositive={true}
            icon={Bookmark}
            variant="blue"
          />
          <KPICard
            title="Revival Votes"
            value={`${totalVotesCount} Votes`}
            change={0.0}
            isPositive={true}
            icon={RefreshCw}
            variant="rose"
          />
        </div>

        {/* Core Dashboard Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {/* Left Column: Claimed and Saved Offers */}
          <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
            {/* Claimed Offers list */}
            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#F72853]" />
                  <span>Recently Claimed</span>
                </h3>
              </div>
              {claimedCoupons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {claimedCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      onRedeem={(c) => setSelectedCoupon(c)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center justify-center space-y-1.5 select-none min-h-[100px]">
                  <Ticket className="w-5 h-5 text-slate-300" />
                  <span>No recently claimed offers</span>
                </div>
              )}
            </div>

            {/* Saved Offers list */}
            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#F72853]" />
                  <span>Saved For Later</span>
                </h3>
              </div>
              {savedCoupons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {savedCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      onRedeem={(c) => setSelectedCoupon(c)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center justify-center space-y-1.5 select-none min-h-[100px]">
                  <Bookmark className="w-5 h-5 text-slate-300" />
                  <span>No saved offers yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#F72853]" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3 relative pl-3.5 border-l border-slate-100">
              {activities.map((act, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div className="absolute left-[-19px] top-1 w-2 h-2 rounded-full bg-[#F72853] border-2 border-white shadow-2xs"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{act.title}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedCoupon && (
        <ConfirmationModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={handleRedeemConfirm}
        />
      )}
    </DashboardLayout>
  );
}
