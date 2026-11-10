"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  History,
  IndianRupee,
  RefreshCw,
  Ticket,
} from "lucide-react";
import Link from "next/link";
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
  useUserActivities,
  useUserClaims,
  useUserSavings,
} from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";

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

  const { activities: allActivities, isLoading: loadingActivities } =
    useUserActivities();
  const activities = (allActivities || []).slice(0, 4);

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
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 text-left font-sans">
        {/* Soft Welcome Banner */}
        <div className="bg-gradient-to-r from-[#FFF8EF] via-[#FFFDF9] to-[#FFF8EF] border border-[#EADBCE] p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#35104A] tracking-tight">
                {welcomeInfo.heading}
              </h2>
              <p className="text-xs sm:text-sm font-sans text-[#6B4C82] leading-relaxed">
                {welcomeInfo.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/trending"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007F79] hover:bg-[#006e69] text-white text-xs font-heading font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Explore Trending →</span>
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF8EF] text-[#35104A] text-xs font-heading font-semibold border border-[#EADBCE] transition-all duration-200 shadow-2xs"
              >
                <span>Browse Brands</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Compact KPI Cards Grid (2x2 on Mobile, 4-col on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left Column: Claimed and Saved Offers */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Claimed Offers list */}
            <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
                <h3 className="text-xs sm:text-sm font-heading font-semibold text-[#35104A] tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#007F79]/10 border border-[#007F79]/20 flex items-center justify-center">
                    <Ticket className="w-3.5 h-3.5 text-[#007F79]" />
                  </div>
                  <span>Recently Claimed Offers</span>
                </h3>
                {claimedCoupons.length > 0 && (
                  <Link
                    href="/customer/claimed"
                    className="text-xs font-heading font-semibold text-[#007F79] hover:text-[#006e69] flex items-center gap-1"
                  >
                    View All ({activeClaimsCount}) →
                  </Link>
                )}
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
                <div className="bg-[#FFF8EF] border border-dashed border-[#EADBCE] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2 select-none min-h-[140px]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#007F79] shadow-2xs">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-medium text-xs text-[#35104A]">
                    No recently claimed offers
                  </span>
                  <p className="font-sans text-[11px] text-[#6B4C82] max-w-xs">
                    Claim verified discount vouchers from top brands to save instantly on your purchases.
                  </p>
                  <Link
                    href="/trending"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#007F79] hover:underline"
                  >
                    Discover Trending Deals →
                  </Link>
                </div>
              )}
            </div>

            {/* Saved Offers list */}
            <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
                <h3 className="text-xs sm:text-sm font-heading font-semibold text-[#35104A] tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#35104A]/10 border border-[#35104A]/20 flex items-center justify-center">
                    <Bookmark className="w-3.5 h-3.5 text-[#35104A]" />
                  </div>
                  <span>Saved For Later</span>
                </h3>
                {savedCoupons.length > 0 && (
                  <Link
                    href="/profile?tab=saved"
                    className="text-xs font-heading font-semibold text-[#007F79] hover:text-[#006e69] flex items-center gap-1"
                  >
                    View All ({savedItemsCount}) →
                  </Link>
                )}
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
                <div className="bg-[#FFF8EF] border border-dashed border-[#EADBCE] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2 select-none min-h-[140px]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EADBCE] flex items-center justify-center text-[#35104A] shadow-2xs">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-medium text-xs text-[#35104A]">
                    No saved offers yet
                  </span>
                  <p className="font-sans text-[11px] text-[#6B4C82] max-w-xs">
                    Bookmark coupons while exploring to keep them organized for your next shopping run.
                  </p>
                  <Link
                    href="/trending"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#007F79] hover:underline"
                  >
                    Browse Deals to Bookmark →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <h3 className="text-xs sm:text-sm font-heading font-semibold text-[#35104A] tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#007F79]/10 border border-[#007F79]/20 flex items-center justify-center">
                  <History className="w-3.5 h-3.5 text-[#007F79]" />
                </div>
                <span>Recent Activity</span>
              </h3>
              <Link
                href="/profile?tab=activity"
                className="text-[11px] font-heading font-semibold text-[#007F79] hover:text-[#006e69] transition-colors"
              >
                Timeline →
              </Link>
            </div>

            {loadingActivities ? (
              <div className="py-6 text-center text-xs font-sans text-[#6B4C82] space-y-2">
                <div className="w-5 h-5 border-2 border-[#007F79] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading activity...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4 relative pl-4 border-l-2 border-[#EADBCE] ml-2">
                {activities.map((act, idx) => {
                  const dotBg = act.badgeColor || "bg-[#007F79]";
                  return (
                    <div key={act.id || idx} className="relative space-y-1 group">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-3 h-3 rounded-full ${dotBg} ring-4 ring-[#FFFDF9] group-hover:scale-125 transition-transform`}
                      />
                      <div className="flex items-start justify-between gap-2">
                        {act.couponId ? (
                          <Link
                            href={`/deals/${act.couponId}`}
                            className="font-heading font-semibold text-xs text-[#35104A] leading-tight group-hover:text-[#007F79] transition-colors"
                          >
                            {act.title}
                          </Link>
                        ) : (
                          <span className="font-heading font-semibold text-xs text-[#35104A] leading-tight group-hover:text-[#007F79] transition-colors">
                            {act.title}
                          </span>
                        )}
                        <span className="font-sans text-[10px] text-[#6B4C82] whitespace-nowrap shrink-0">
                          {act.time}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-[#6B4C82] leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center flex flex-col items-center justify-center space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF8EF] border border-[#EADBCE] flex items-center justify-center text-[#6B4C82]">
                  <History className="w-4 h-4 text-[#007F79]" />
                </div>
                <span className="font-heading font-medium text-xs text-[#35104A]">
                  No recent activity
                </span>
                <p className="font-sans text-[11px] text-[#6B4C82] max-w-[200px]">
                  Your claims, redemptions and votes will appear here automatically.
                </p>
              </div>
            )}
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
