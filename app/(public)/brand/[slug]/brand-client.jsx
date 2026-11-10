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
    return { label: "Open Now", color: "text-festival-teal" };
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

  const mIdStr = merchant?._id?.toString();
  const mSlug = (merchant?.slug || "").toLowerCase().trim();

  // Strict validator: ONLY items that belong strictly to this brand
  const strictlyMatchesBrand = (item) => {
    if (!item || !merchant) return false;
    const cMerchId = item.merchantId?._id
      ? item.merchantId._id.toString()
      : item.merchantId?.toString();
    if (cMerchId && mIdStr && cMerchId === mIdStr) return true;
    const cSlug = (
      item.merchantId?.slug ||
      item.merchantSlug ||
      item.brandSlug ||
      ""
    )
      .toLowerCase()
      .trim();
    if (cSlug && mSlug && cSlug === mSlug) return true;
    return false;
  };

  const brandCoupons = useMemo(() => {
    return (coupons || []).filter(strictlyMatchesBrand);
  }, [coupons, mIdStr, mSlug]);

  const brandExpiredCoupons = useMemo(() => {
    return (expiredCoupons || []).filter(strictlyMatchesBrand);
  }, [expiredCoupons, mIdStr, mSlug]);

  const brandAffiliateProducts = useMemo(() => {
    return (affiliateProducts || []).filter(strictlyMatchesBrand);
  }, [affiliateProducts, mIdStr, mSlug]);

  const filteredCoupons = useMemo(() => {
    let list = brandCoupons;
    if (existingUser) {
      list = list.filter((c) => !c.title?.toLowerCase().includes("first"));
    }
    if (activeTab === "all") return list;
    if (activeTab === "cpn")
      return list.filter((c) => c.code && c.code.trim() !== "");
    if (activeTab === "dl")
      return list.filter((c) => !c.code || c.code.trim() === "");
    return list;
  }, [brandCoupons, activeTab, existingUser]);

  const couponsCount = useMemo(
    () => brandCoupons.filter((c) => c.code && c.code.trim() !== "").length,
    [brandCoupons],
  );

  // Offers count includes both coupon link deals and affiliate product deals
  const offersCount = useMemo(
    () =>
      brandCoupons.filter((c) => !c.code || c.code.trim() === "").length +
      brandAffiliateProducts.length,
    [brandCoupons, brandAffiliateProducts],
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
    return `Handpicked deals curated exclusively for ${merchant.businessName} ✨`;
  }, [merchant.category, merchant.slug, merchant.businessName]);

  const sortedAffiliateProducts = useMemo(() => {
    const list = [...brandAffiliateProducts];
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
  }, [brandAffiliateProducts, affiliateSort]);

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
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#35104A] font-sans">
      <Navbar />

      {/* Brand header (breadcrumb + banner + info + tabs) */}
      <BrandHeader
        merchant={merchant}
        coupons={brandCoupons}
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
        affiliateProductsCount={brandAffiliateProducts.length}
      />

      {/* Main content area (compact, minimal whitespace) */}
      <main className="w-full max-w-[1440px] mx-auto px-2.5 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3.5 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4.5 items-start">
          {/* Left: Stats, Products & Coupons (8 cols on desktop, full width on mobile) */}
          <div className="lg:col-span-8 space-y-3">
            {/* 4-Column Stats card */}
            <BrandStats
              coupons={brandCoupons}
              merchant={merchant}
              affiliateProducts={brandAffiliateProducts}
              affiliateCount={brandAffiliateProducts.length}
            />

            {/* Quick Carousel (visible when activeTab === "all") */}
            {brandAffiliateProducts.length > 0 && activeTab === "all" && (
              <section className="space-y-2 pt-0.5">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-heading font-bold text-[#35104A] tracking-tight">
                      Featured Deals
                    </h3>
                    <span className="bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 px-2 py-0.5 rounded-full text-xs font-heading font-bold">
                      {brandAffiliateProducts.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("affiliate")}
                    className="text-[#007F79] hover:text-[#35104A] font-heading font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Featured Deals Grid / Carousel */}
                {brandAffiliateProducts.length <= 4 ? (
                  <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory -mx-2.5 px-2.5 sm:mx-0 sm:px-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:mx-0 md:px-0 w-full pt-0.5">
                    {brandAffiliateProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="snap-start shrink-0 w-[170px] sm:w-[195px] md:w-full"
                      >
                        <AffiliateProductCard
                          product={prod}
                          merchant={merchant}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
                    {brandAffiliateProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="snap-start shrink-0 w-[175px] sm:w-[200px] md:w-[215px]"
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

            {/* ── Affiliate Products Deals List (Clean Minimalist Matching Brand Palette) ── */}
            {sortedAffiliateProducts.length > 0 &&
              (activeTab === "all" ||
                activeTab === "affiliate" ||
                activeTab === "dl") && (
                <section className="space-y-2.5 pt-1">
                  {/* Section Header: Title + Badge + Subtitle + Sort Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-heading font-bold text-[#35104A] tracking-tight">
                          Affiliate Products
                        </h3>
                        <span className="bg-[#007F79]/10 text-[#007F79] px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border border-[#007F79]/20">
                          {sortedAffiliateProducts.length}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B4C82] font-medium mt-0.5">
                        {affiliateSubtitle}
                      </p>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <select
                        value={affiliateSort}
                        onChange={(e) => setAffiliateSort(e.target.value)}
                        className="bg-[#FFF8EF] border border-[#EADBCE] text-[#35104A] text-xs font-heading font-semibold rounded-xl px-3 py-1.5 pr-7 appearance-none shadow-2xs hover:border-[#007F79] focus:outline-none focus:ring-1 focus:border-[#007F79] focus:ring-[#007F79]/20 cursor-pointer"
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
                      <ChevronDown className="w-3.5 h-3.5 text-[#6B4C82] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Clean Minimalist List of Deal Cards */}
                  <div className="space-y-2.5">
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
              <div className="space-y-2.5 pt-1">
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
                  <div className="py-8 sm:py-12 text-center bg-[#FFF8EF] border border-[#EADBCE] rounded-2xl p-6 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#007F79]/10 text-[#007F79] mx-auto flex items-center justify-center mb-2.5">
                      <Tag className="w-4.5 h-4.5 text-[#007F79]" />
                    </div>
                    <h4 className="text-sm sm:text-base font-heading font-bold text-[#35104A]">
                      {activeTab === "all"
                        ? "No active offers available right now"
                        : "No deals match your current filter"}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#6B4C82] max-w-sm mx-auto mt-1 font-medium">
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
                        className="mt-2.5 text-[#007F79] font-heading font-bold text-xs hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Expired deals */}
            {brandExpiredCoupons.length > 0 && (
              <div className="space-y-2 pt-3">
                <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#6B4C82]">
                  Expired Offers
                </h3>
                <div className="space-y-2">
                  {brandExpiredCoupons.map((coupon) => (
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

      {/* Exclusively this brand - zero other brands shown */}
      <Footer />
    </div>
  );
}
