"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Eye,
  Lock,
  MessageSquareHeart,
  Plus,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProcessFeedbackModal from "@/components/merchant/feedback/ProcessFeedbackModal";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProcessFeedback } from "@/hooks/use-process-feedback";
import { useRealtime } from "@/hooks/use-realtime";
import { useMerchantCoupons } from "@/hooks/use-coupons";
import {
  useMerchantAffiliateProducts,
  useMerchantAnalytics,
  useMerchantProfile,
  useMerchantRecentClaims,
  useMerchantRecentRedemptions,
} from "@/hooks/use-merchant";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import KpiCards from "./components/KpiCards";

const PerformanceChart = dynamic(
  () => import("./components/PerformanceChart"),
  {
    ssr: false,
    loading: () => (
      <div className="col-span-full xl:col-span-8 bg-white border border-slate-200/80 rounded-xl p-6 h-80 flex items-center justify-center animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-40" />
      </div>
    ),
  },
);

import RecentOrdersAndActivity from "./components/RecentOrdersAndActivity";
import TopCouponsTable from "./components/TopCouponsTable";
import TrafficAndGoals from "./components/TrafficAndGoals";

export default function MerchantDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeRange, setActiveRange] = useState("30 Days");
  const { isProfileIncomplete, health, openModal } = useMerchantLock();

  // Listen for real-time customer coupon claims
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, (data) => {
    toast.success(
      `New Claim! "${data.couponTitle || "Offer"}" saved by a customer.`,
      {
        icon: "🎉",
        duration: 5000,
      },
    );
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({ queryKey: ["merchant-recent-claims"] });
    queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
  });

  // Listen for real-time customer coupon redemptions
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, (data) => {
    toast.success(
      `Coupon Redeemed! "${data.couponTitle || "Offer"}" (Saved ₹${data.savingsAmount || 0})`,
      { icon: "💰", duration: 5000 },
    );
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
    queryClient.invalidateQueries({
      queryKey: qk.merchant.recentRedemptions(),
    });
    queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
  });

  // Real-time coupon status changes
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED_CONFIRMATION, () => {
    queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
  });

  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
    queryClient.invalidateQueries({ queryKey: qk.merchant.analytics() });
  });

  // Fetch merchant analytics, profile, redemptions, claims, coupons, and affiliate products via cached hooks
  const { data: analyticsData } = useMerchantAnalytics();
  const { data: merchantProfile } = useMerchantProfile();
  const { data: redemptionsData } = useMerchantRecentRedemptions(5);
  const { data: claimsData } = useMerchantRecentClaims(5);
  const { data: affiliateProductsData = [] } = useMerchantAffiliateProducts();

  const trendData = analyticsData?.trend ?? [];
  const merchant = { ...merchantProfile, ...analyticsData?.merchant };
  const merchantSlug = merchant?.slug || merchantProfile?.slug || analyticsData?.merchant?.slug;

  // Real coupons belonging to this merchant
  const { data: couponsData = [] } = useMerchantCoupons(merchant?._id);

  const {
    isOpen: isFeedbackOpen,
    openFeedback,
    closeFeedback,
    submitFeedback,
    isSubmitting: isSubmittingFeedback,
    dismissFeedback,
    hasResponded: hasRespondedFeedback,
  } = useProcessFeedback("profile_completion");

  const overviewStats = analyticsData?.overview ?? {};

  // Accurate KPI computations from real DB
  const storeViews = Number(
    merchant?.storePageViews ||
      analyticsData?.merchant?.storePageViews ||
      analyticsData?.kpi?.storePageViews ||
      0,
  );
  const couponClicks = Object.values(overviewStats).reduce(
    (sum, s) => sum + (s.clicks || s.views || 0),
    0,
  );
  const affiliateClicks = (affiliateProductsData || []).reduce(
    (sum, a) => sum + (Number(a.clickCount) || 0),
    0,
  );
  const pageViews = couponClicks + storeViews + affiliateClicks;

  const totalClaims =
    Number(analyticsData?.last30Days?.claims) ||
    Object.values(overviewStats).reduce((sum, s) => sum + (s.claims || 0), 0) ||
    (claimsData?.claims?.length || 0);

  const totalRedemptions =
    Number(analyticsData?.last30Days?.redemptions) ||
    Object.values(overviewStats).reduce(
      (sum, s) => sum + (s.redemptions || 0),
      0,
    ) ||
    (redemptionsData?.redemptions?.length || 0);

  const totalRevenue = trendData.reduce(
    (sum, t) => sum + (Number(t?.revenue) || 0),
    0,
  );

  // Month-over-month change
  function momChange(key) {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1]?.[key] ?? 0;
    const prev = trendData[trendData.length - 2]?.[key] ?? 0;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }
  const revenueMoM = momChange("revenue");
  const ordersMoM = momChange("orders");

  // Plan info & active listings check
  const plan = merchantProfile?.plan ?? "starter";
  const planLimit = plan === "starter" ? 3 : plan === "growth" ? 15 : -1;

  const activeCouponsCount = (couponsData || []).filter(
    (c) => c.status === "active",
  ).length;
  const activeAffiliatesCount = (affiliateProductsData || []).filter(
    (p) => p.status === "active",
  ).length;
  const totalActiveListings = activeCouponsCount + activeAffiliatesCount;

  // Contextual alerts - alert when near or exceeding capacity
  const alerts = [];
  if (planLimit > 0 && totalActiveListings >= planLimit) {
    alerts.push({
      type: "orange",
      icon: Zap,
      msg: `You're using ${totalActiveListings}/${planLimit} active listings. Consider upgrading your plan for unlimited active deals.`,
    });
  }

  const recentRedemptions = redemptionsData?.redemptions ?? [];
  const recentClaims = claimsData?.claims ?? [];
  const recentActivities = analyticsData?.recentActivities ?? [];

  // Affiliate product listings for the dashboard listings panel
  const affiliateListings = useMemo(() => {
    return (affiliateProductsData || []).map((p) => ({
      id: String(p._id),
      _id: String(p._id),
      type: "affiliate",
      title: p.title || "Affiliate Deal",
      code: "Affiliate Link",
      affiliateUrl: p.affiliateUrl,
      imageUrl: p.imageUrl,
      discount: p.discountPercentage
        ? `${p.discountPercentage}% OFF`
        : p.discountText ||
          (p.discountPrice ? `₹${p.discountPrice} Deal` : "Affiliate Deal"),
      category: p.category || "General",
      clicks: Number(p.clickCount) || 0,
      views: Number(p.clickCount) || 0,
      claims: 0,
      redemptions: Number(p.clickCount) || 0,
      successRate: p.clickCount > 0 ? 100 : 0,
      conversion: p.clickCount > 0 ? 100 : 0,
      status: p.status || "active",
      createdAt: p.createdAt,
    }));
  }, [affiliateProductsData]);

  // Real coupon listings mapped accurately from database
  const couponListings = useMemo(() => {
    return (couponsData || []).map((c) => {
      const val = c.rawDiscountValue || c.discountValue;
      const isNum =
        val !== null &&
        val !== undefined &&
        val !== "" &&
        !Number.isNaN(Number(val));

      let discountDisplay = "Special Offer";
      if (c.offerType === "deal" && c.salePrice) {
        discountDisplay = `₹${c.salePrice} Deal`;
      } else if (c.discountType === "percentage" && isNum) {
        discountDisplay = `${val}% OFF`;
      } else if (c.discountType === "fixed" && isNum) {
        discountDisplay = `₹${val} OFF`;
      } else if (c.discountType === "freebie" || c.offerType === "special") {
        discountDisplay =
          c.specialOfferType ||
          (typeof val === "string" && val.trim() ? val : "Freebie / Gift");
      } else if (val) {
        discountDisplay = isNum ? `${val}% OFF` : String(val);
      }

      return {
        id: String(c._id || c.id),
        _id: String(c._id || c.id),
        type: "coupon",
        title: c.title || "Offer Listing",
        code: c.code || "N/A",
        discount: discountDisplay,
        category: c.category || "General",
        clicks: Number(c.clickCount || c.viewCount || 0),
        views: Number(c.viewCount || 0),
        claims: Number(c.totalClaims || 0),
        redemptions: Number(c.totalRedemptions || 0),
        successRate:
          (c.viewCount || c.clickCount) > 0
            ? Math.round(
                ((c.totalRedemptions || 0) /
                  (c.clickCount || c.viewCount || 1)) *
                  100,
              )
            : 0,
        conversion:
          (c.viewCount || c.clickCount) > 0
            ? Math.round(
                ((c.totalRedemptions || 0) /
                  (c.clickCount || c.viewCount || 1)) *
                  100,
              )
            : 0,
        status: c.status || "active",
        imageUrl: c.image || c.imageUrl || null,
        createdAt: c.createdAt,
      };
    });
  }, [couponsData]);

  return (
    <DashboardLayout
      title="Dashboard"
      user={{ name: merchant?.businessName || "Merchant", role: "merchant" }}
    >
      <div className="relative space-y-3.5 text-left font-sans min-h-[75vh]">
        {/* Full Dashboard Blur Overlay when Profile is Incomplete */}
        {isProfileIncomplete && (
          <div
            onClick={openModal}
            className="absolute inset-0 z-30 bg-slate-900/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all animate-in fade-in duration-300 select-none overflow-hidden"
          >
            <div className="max-w-md w-full bg-slate-900/90 text-white rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-4 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                <Lock className="w-7 h-7 text-slate-300" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Dashboard Locked
                  </h3>
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-medium">
                    {health?.percentage || 0}% Complete
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  Your store profile is currently incomplete. Complete all 15
                  required details to unlock your listings, analytics, and
                  partner controls.
                </p>
              </div>

              <div className="pt-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/merchant/profile?edit=true");
                  }}
                  className="w-full bg-[#F72853] hover:bg-[#e01e47] text-white font-medium text-xs rounded-xl h-10 shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <span>Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Application Under Review Overlay Banner */}
        {merchant?.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-amber-950">
                Application Under Review
              </h2>
              <p className="text-xs text-amber-800 max-w-lg mx-auto font-normal">
                Your merchant profile &amp; KYC verification are currently under
                review by our super admin team. Account features will be
                activated upon approval (usually 24–48 hours).
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push("/merchant/profile")}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium h-7.5 px-3 rounded-lg shadow-2xs cursor-pointer"
              >
                Modify Profile &amp; Documents
              </button>
              <button
                type="button"
                onClick={() => router.push("/merchant/application-status")}
                className="border border-amber-300 text-amber-900 bg-white hover:bg-amber-50 text-xs font-medium h-7.5 px-3 rounded-lg cursor-pointer"
              >
                Track Status
              </button>
            </div>
          </div>
        )}

        {/* Capacity Warning Alert if near limit */}
        {alerts.length > 0 && (
          <div className="space-y-1.5">
            {alerts.map((alert, idx) => {
              const Icon = alert.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 border border-rose-200/80 bg-rose-50/50 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-normal font-sans"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#F72853]" />
                  <span>{alert.msg}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact Header Bar with Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Track real-time performance, shopper visits, and deal redemptions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Preview Public Storefront */}
            {merchantSlug ? (
              <a
                href={`/brand/${merchantSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
                title="Preview how your public brand page appears to customers"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview Storefront</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 text-xs font-medium rounded-xl border border-slate-200/60 shadow-2xs opacity-60 cursor-not-allowed"
                title="Storefront link loading..."
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Preview Storefront</span>
              </span>
            )}

            {/* Manual Feedback / Review Taker Trigger */}
            <button
              type="button"
              onClick={() => openFeedback()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50/60 text-slate-700 hover:text-[#F72853] text-xs font-medium rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer hover:border-rose-200"
              title="Give feedback & suggestions"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-[#F72853]" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            <Link
              href="/merchant/coupons/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Listing</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div data-tour="kpi-cards">
          <KpiCards
            totalRevenue={totalRevenue}
            revenueMoM={revenueMoM}
            totalClaims={totalClaims}
            totalRedemptions={totalRedemptions}
            ordersMoM={ordersMoM}
            pageViews={pageViews}
            trendData={trendData}
            activeCoupons={totalActiveListings}
            planLimit={planLimit}
          />
        </div>

        {/* Main Chart + Right Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Dual Line Chart: Clicks vs Redemptions */}
          <PerformanceChart
            trendData={trendData}
            activeRange={activeRange}
            setActiveRange={setActiveRange}
          />

          {/* Right column: Traffic + Goals */}
          <TrafficAndGoals
            pageViews={pageViews}
            totalRevenue={totalRevenue}
            totalClaims={totalClaims}
            totalRedemptions={totalRedemptions}
            analyticsData={analyticsData}
          />
        </div>

        {/* Store Listings & Top Offers Table */}
        <div data-tour="top-coupons">
          <TopCouponsTable
            coupons={couponListings}
            affiliates={affiliateListings}
          />
        </div>

        {/* Recent Orders & Activity Feed */}
        <div data-tour="recent-orders">
          <RecentOrdersAndActivity
            recentRedemptions={recentRedemptions}
            recentClaims={recentClaims}
            recentActivities={recentActivities}
          />
        </div>

        {/* Process-Based Profile Completion Feedback */}
        <ProcessFeedbackModal
          isOpen={isFeedbackOpen}
          onClose={closeFeedback}
          onSubmit={submitFeedback}
          onDismiss={dismissFeedback}
          isSubmitting={isSubmittingFeedback}
          merchantName={merchant?.businessName}
        />
      </div>
    </DashboardLayout>
  );
}
