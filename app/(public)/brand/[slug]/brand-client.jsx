"use client";

import { ArrowRight, ChevronDown, Tag } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import AffiliateDealCard from "./components/AffiliateDealCard";
import AffiliateProductCard from "./components/AffiliateProductCard";
import BrandHeader from "./components/BrandHeader";
import BrandStats from "./components/BrandStats";
import CouponCard from "./components/CouponCard";
import ExpiredOfferCard from "./components/ExpiredOfferCard";
import SidebarSection from "./components/SidebarSection";

const Footer = dynamic(() => import("@/components/layout/Footer"));
const RelatedFooter = dynamic(() => import("./components/RelatedFooter"));

export default function BrandClient({
  merchant,
  coupons = [],
  expiredCoupons = [],
  affiliateProducts = [],
  relatedBrands = [],
}) {
  const track = useTrackEvent();
  const [activeTab, setActiveTab] = useState("all");
  const [affiliateSort, setAffiliateSort] = useState("featured");

  useEffect(() => {
    if (merchant?._id) {
      track("store_view", { merchantId: merchant._id, source: "direct" });
    }
  }, [merchant?._id, track]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState(null);
  const [followers, setFollowers] = useState(merchant.followerCount || 0);
  const [ratingVal, setRatingVal] = useState(
    merchant.rating || merchant.avgRating || 5.0,
  );
  const [votesCount, setVotesCount] = useState(
    merchant.ratingCount ||
      merchant.totalRedemptions ||
      merchant.totalClaims ||
      0,
  );
  const [isRated, setIsRated] = useState(false);
  const [existingUser, setExistingUser] = useState(false);
  const [expandedCouponId, setExpandedCouponId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [revivalStatus, setRevivalStatus] = useState({});

  const openStatus = useMemo(() => {
    if (!merchant.operatingHours)
      return { label: "Hours Unspecified", color: "text-gray-400" };
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const hours = merchant.operatingHours[dayName];
    if (!hours || hours.closed === true || hours.isOpen === false)
      return { label: "Closed Today", color: "text-red-500" };
    return { label: "Open Now", color: "text-blue-600" };
  }, [merchant.operatingHours]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const todayStr = useMemo(() => {
    if (!isClient) return "Today";
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [isClient]);

  const filteredCoupons = useMemo(() => {
    let list = coupons;
    if (existingUser) {
      list = list.filter((c) => !c.title?.toLowerCase().includes("first"));
    }
    if (activeTab === "all") return list;
    if (activeTab === "cpn")
      return list.filter((c) => c.code && c.code.trim() !== "");
    if (activeTab === "dl")
      return list.filter((c) => !c.code || c.code.trim() === "");
    return list;
  }, [coupons, activeTab, existingUser]);

  const couponsCount = useMemo(
    () => coupons.filter((c) => c.code && c.code.trim() !== "").length,
    [coupons],
  );

  // Offers count includes both coupon link deals and affiliate product deals
  const offersCount = useMemo(
    () =>
      coupons.filter((c) => !c.code || c.code.trim() === "").length +
      affiliateProducts.length,
    [coupons, affiliateProducts],
  );

  const affiliateSubtitle = useMemo(() => {
    const cat = (merchant.category || "").toLowerCase();
    if (
      cat.includes("baby") ||
      cat.includes("kid") ||
      (merchant.slug || "").includes("mom")
    ) {
      return "Handpicked deals for your little ones 🩷";
    }
    if (cat.includes("fashion") || cat.includes("bag")) {
      return "Handpicked fashion deals & trending accessories ✨";
    }
    if (cat.includes("travel")) {
      return "Handpicked travel deals & special bookings ✈️";
    }
    if (cat.includes("electronics")) {
      return "Handpicked tech deals & gadget offers ⚡";
    }
    return `Handpicked deals curated for ${merchant.businessName} ✨`;
  }, [merchant.category, merchant.slug, merchant.businessName]);

  const sortedAffiliateProducts = useMemo(() => {
    const list = [...affiliateProducts];
    if (affiliateSort === "discount") {
      return list.sort(
        (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0),
      );
    }
    if (affiliateSort === "price-low") {
      return list.sort(
        (a, b) =>
          (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0),
      );
    }
    if (affiliateSort === "price-high") {
      return list.sort(
        (a, b) =>
          (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0),
      );
    }
    return list;
  }, [affiliateProducts, affiliateSort]);

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowers((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowers((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = (code, couponId) => {
    if (typeof window !== "undefined") {
      if (code) {
        navigator.clipboard.writeText(code);
      }
      setCopiedCouponId(couponId);
      setTimeout(() => setCopiedCouponId(null), 2000);
      window.open(`/deals/${couponId}`, "_blank");
    }
  };

  const handleReviveExpired = async (couponId) => {
    setRevivalStatus((prev) => ({ ...prev, [couponId]: "loading" }));
    try {
      const targetCoupon = expiredCoupons.find((c) => c._id === couponId);
      if (!targetCoupon) throw new Error();

      const res = await fetch("/api/revivals/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCoupon.code || "UNKNOWN",
          brandName: merchant.businessName,
          email: "guest@vouchiqo.com",
        }),
      });

      if (res.ok) {
        setRevivalStatus((prev) => ({ ...prev, [couponId]: "success" }));
      } else {
        setRevivalStatus((prev) => ({ ...prev, [couponId]: "error" }));
      }
    } catch {
      setRevivalStatus((prev) => ({ ...prev, [couponId]: "error" }));
    }
  };

  const handleRate = () => {
    if (!isRated) {
      setIsRated(true);
      setVotesCount((prev) => prev + 1);
      setRatingVal(5.0);
    }
  };

  const toggleDetails = (couponId) => {
    setExpandedCouponId((prev) => (prev === couponId ? null : couponId));
  };

  const faqs = useMemo(() => {
    const brand = merchant.businessName || "this brand";
    return [
      {
        q: `How do I apply a ${brand} promo code?`,
        a: `Click 'Get Code' to copy the promo code, then paste it into the promo code field on ${brand}'s checkout page and click Apply.`,
      },
      {
        q: "Are all deals on Vouchiqo verified?",
        a: "Yes — every deal is manually reviewed and tested by our team before being listed to ensure it works.",
      },
      {
        q: "What do I do if an offer has expired?",
        a: `Click 'Revive Offer' to request reactivation. Our team will contact ${brand} to secure a fresh active deal.`,
      },
    ];
  }, [merchant.businessName]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 font-sans">
      <Navbar />

      {/* Brand header (breadcrumb + banner + info + tabs) */}
      <BrandHeader
        merchant={merchant}
        coupons={coupons}
        todayStr={todayStr}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFollowing={isFollowing}
        handleFollow={handleFollow}
        followers={followers}
        ratingVal={ratingVal}
        votesCount={votesCount}
        isRated={isRated}
        handleRate={handleRate}
        existingUser={existingUser}
        setExistingUser={setExistingUser}
        couponsCount={couponsCount}
        offersCount={offersCount}
        affiliateProductsCount={affiliateProducts.length}
      />

      {/* Main content area */}
      <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left: Stats, Products & Coupons (8 cols on desktop, full width on mobile) */}
          <div className="lg:col-span-8 space-y-4">
            {/* 4-Column Stats card */}
            <BrandStats
              coupons={coupons}
              merchant={merchant}
              affiliateProducts={affiliateProducts}
              affiliateCount={affiliateProducts.length}
            />

            {/* Quick Carousel (visible when activeTab === "all") */}
            {affiliateProducts.length > 0 && activeTab === "all" && (
              <section className="space-y-3 pt-1">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Featured Deals
                    </h3>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                      {affiliateProducts.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("affiliate")}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Featured Deals Grid / Carousel */}
                {affiliateProducts.length <= 4 ? (
                  <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0 md:grid md:grid-cols-4 md:gap-3.5 md:overflow-visible md:mx-0 md:px-0 w-full pt-1">
                    {affiliateProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="snap-start shrink-0 w-[175px] sm:w-[205px] md:w-full"
                      >
                        <AffiliateProductCard
                          product={prod}
                          merchant={merchant}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
                    {affiliateProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="snap-start shrink-0 w-[180px] sm:w-[210px] md:w-[220px]"
                      >
                        <AffiliateProductCard
                          product={prod}
                          merchant={merchant}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Affiliate Products Deals List (Clean Minimalist Matching Screenshot) ── */}
            {sortedAffiliateProducts.length > 0 &&
              (activeTab === "all" ||
                activeTab === "affiliate" ||
                activeTab === "dl") && (
                <section className="space-y-3 pt-2">
                  {/* Section Header: Title + Badge + Subtitle + Sort Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                          Affiliate Products
                        </h3>
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-100">
                          {sortedAffiliateProducts.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {affiliateSubtitle}
                      </p>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <select
                        value={affiliateSort}
                        onChange={(e) => setAffiliateSort(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 appearance-none shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="featured">Sort by: Featured</option>
                        <option value="discount">Sort by: Best Discount</option>
                        <option value="price-low">
                          Sort by: Price: Low to High
                        </option>
                        <option value="price-high">
                          Sort by: Price: High to Low
                        </option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Clean Minimalist List of Deal Cards */}
                  <div className="space-y-3">
                    {sortedAffiliateProducts.map((prod) => (
                      <AffiliateDealCard
                        key={prod._id}
                        product={prod}
                        merchant={merchant}
                      />
                    ))}
                  </div>
                </section>
              )}

            {/* Coupon & Deal list */}
            {activeTab !== "affiliate" && (
              <div className="space-y-3 pt-2">
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      isExpanded={expandedCouponId === coupon._id}
                      toggleDetails={() => toggleDetails(coupon._id)}
                      copiedCouponId={copiedCouponId}
                      handleCopyCode={handleCopyCode}
                      merchant={merchant}
                    />
                  ))
                ) : (
                  <div className="py-12 sm:py-16 text-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">
                      {activeTab === "all"
                        ? "No active offers available right now"
                        : "No deals match your current filter"}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                      {activeTab === "all"
                        ? `${merchant.businessName} currently has no active promo codes or deals. Check back soon!`
                        : "Try switching to the 'All' tab to see all available promotions."}
                    </p>
                    {activeTab !== "all" && (
                      <button
                        onClick={() => {
                          setActiveTab("all");
                          setExistingUser(false);
                        }}
                        type="button"
                        className="mt-3 text-blue-600 font-medium text-sm hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Expired deals */}
            {expiredCoupons.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Expired Offers
                </h3>
                <div className="space-y-2">
                  {expiredCoupons.map((coupon) => (
                    <ExpiredOfferCard
                      key={coupon._id}
                      coupon={coupon}
                      revivalStatus={revivalStatus}
                      handleReviveExpired={handleReviveExpired}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar (4 cols) */}
          <SidebarSection
            merchant={merchant}
            openStatus={openStatus}
            faqs={faqs}
            copiedLink={copiedLink}
            handleShare={handleShare}
          />
        </div>
      </main>

      {/* Related brands */}
      <RelatedFooter relatedBrands={relatedBrands} merchant={merchant} />

      <Footer />
    </div>
  );
}
