"use client";

import { Heart, Share2, Star, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import SafeImage from "@/components/shared/SafeImage";
import { BrandLinksBar } from "@/components/shared/SocialLinks";
import MobileBrandHeader from "./MobileBrandHeader";

const ShareModal = dynamic(() => import("./ShareModal"), { ssr: false });

export default function BrandHeader({
  merchant,
  coupons = [],
  todayStr,
  activeTab,
  setActiveTab,
  isFollowing,
  handleFollow,
  followers,
  ratingVal,
  votesCount,
  isRated,
  handleRate,
  existingUser,
  setExistingUser,
  couponsCount,
  offersCount,
  affiliateProductsCount = 0,
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const bannerUrl =
    merchant.banner ||
    merchant.bannerUrl ||
    merchant.shopImage ||
    merchant.coverImage;

  const totalDeals = (coupons?.length || 0) + affiliateProductsCount;

  const tabs = [
    { id: "all", label: "All", count: totalDeals },
    { id: "cpn", label: "Codes", count: couponsCount || 0 },
    { id: "dl", label: "Offers", count: offersCount || 0 },
    {
      id: "affiliate",
      label: "Affiliate Products",
      count: affiliateProductsCount || 0,
    },
  ];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = `${merchant.businessName} Discount Coupons & Deals`;
  const shareText = `Check out verified discount offers, promo codes, and deals for ${merchant.businessName} on Vouchiqo!`;

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          setIsShareModalOpen(true);
        }
        return;
      }
    }
    setIsShareModalOpen(true);
  };

  return (
    <header className="w-full bg-white font-sans select-none border-b border-slate-100">
      {/* Mobile / Small Screens (< lg): Preserved from linen-club */}
      <MobileBrandHeader
        merchant={merchant}
        bannerUrl={bannerUrl}
        bannerFailed={bannerFailed}
        setBannerFailed={setBannerFailed}
        logoFailed={logoFailed}
        setLogoFailed={setLogoFailed}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ratingVal={ratingVal}
        votesCount={votesCount}
        isRated={isRated}
        handleRate={handleRate}
        todayStr={todayStr}
        handleShareClick={handleShareClick}
      />

      {/* Desktop / Large Screens (lg: and above): Matching https://vouchiqo.com/brand/hammer */}
      <div className="hidden lg:block">
        {/* Desktop Breadcrumbs Bar */}
        <div className="w-full bg-white border-b border-slate-200/90 font-sans">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-6 py-2">
            <ol className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <span className="text-slate-300">/</span>
              <li>
                <Link
                  href="/brands"
                  className="hover:text-blue-600 transition-colors"
                >
                  Brands
                </Link>
              </li>
              <span className="text-slate-300">/</span>
              <li className="text-slate-800 font-normal truncate max-w-[260px]">
                {merchant.businessName}
              </li>
            </ol>
          </div>
        </div>

        {/* Desktop Grand Hero Banner */}
        <div className="relative w-full h-[220px] md:h-[260px] lg:h-[290px] bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-950 overflow-hidden select-none font-sans flex items-center justify-center">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {bannerUrl && !bannerFailed ? (
            <SafeImage
              src={bannerUrl}
              alt={`${merchant.businessName} banner`}
              fill
              priority={true}
              sizes="100vw"
              className="object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
              onError={() => setBannerFailed(true)}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />
        </div>

        {/* Desktop Brand Identity & Actions Bar */}
        <section className="w-full bg-white border-b border-slate-200/90 shadow-2xs font-sans">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-6">
            <div className="flex items-end justify-between gap-3 relative pb-2 pt-0">
              {/* Left: Overlapping Logo + Brand info */}
              <div className="flex items-end gap-4">
                <div className="relative z-10 rounded-2xl shrink-0 flex items-center justify-center bg-white shadow-lg border-4 border-white overflow-hidden w-[96px] h-[96px] lg:w-[104px] lg:h-[104px] -mt-[48px] lg:-mt-[52px] ring-1 ring-slate-200/60 p-1.5">
                  {merchant.logo && !logoFailed ? (
                    <SafeImage
                      src={merchant.logo}
                      alt={merchant.businessName}
                      width={104}
                      height={104}
                      className="max-h-full max-w-full object-contain object-center"
                      onError={() => setLogoFailed(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-800">
                      {(merchant.businessName || "B").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="pt-1 space-y-0.5 pb-1.5 text-left font-sans min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg md:text-xl font-medium text-slate-900 tracking-tight truncate">
                      {merchant.businessName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-normal text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        aria-label="Verified account"
                        className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0"
                      >
                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.26.16-.42.24-.88.24-1.35 0-2.13-1.73-3.86-3.86-3.86-.47 0-.93.08-1.35.24C14.5 2.45 13.26 1.57 11.83 1.57s-2.67.88-3.26 2.19c-.42-.16-.88-.24-1.35-.24-2.13 0-3.86 1.73-3.86 3.86 0 .47.08.93.24 1.35C2.32 9.33 1.44 10.57 1.44 12s.88 2.67 2.19 3.26c-.16.42-.24.88-.24 1.35 0 2.13 1.73 3.86 3.86 3.86.47 0 .93-.08 1.35-.24.59 1.31 1.83 2.19 3.26 2.19s2.67-.88 3.26-2.19c.42.16.88.24 1.35.24 2.13 0 3.86-1.73 3.86-3.86 0-.47-.08-.93-.24-1.35 1.31-.59 2.19-1.83 2.19-3.26zm-11.4 4.54l-4.14-4.14 1.41-1.41 2.73 2.73 6.09-6.09 1.41 1.41-7.5 7.5z" />
                      </svg>
                      <span>Verified Partner</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-normal text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80 capitalize shrink-0">
                      <span>
                        {merchant.plan
                          ? `${merchant.plan} Partner`
                          : "Starter Partner"}
                      </span>
                      <TrendingUp className="w-3 h-3 text-purple-600" />
                    </span>
                  </div>

                  {merchant.shortDescription && (
                    <p className="text-[12px] text-slate-600 font-normal line-clamp-1 max-w-xl pt-0.5">
                      {merchant.shortDescription}
                    </p>
                  )}

                  <p className="text-[11px] sm:text-[12px] text-slate-500 font-normal">
                    <span className="font-medium text-slate-800">
                      {totalDeals} active deals
                    </span>{" "}
                    · validated on{" "}
                    <span className="text-slate-700 font-normal">
                      {todayStr}
                    </span>
                  </p>

                  {/* Brand Official Website & Social Links */}
                  <BrandLinksBar
                    merchant={merchant}
                    showWebsite={true}
                    className="pt-1"
                    size="sm"
                  />
                </div>
              </div>

              {/* Right: Desktop Action Pills Row */}
              <div className="flex items-center gap-1.5 sm:gap-2 pb-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleRate}
                  disabled={isRated}
                  title="Click to rate this merchant"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50/80 hover:bg-amber-100 transition-all text-[10.5px] sm:text-[11px] font-normal text-amber-900 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                >
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-amber-900 font-medium">
                    {ratingVal ? ratingVal.toFixed(1) : "5.0"}
                  </span>
                  <span className="text-amber-700/80 font-normal text-[10px]">
                    ({votesCount || 1})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleFollow}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] sm:text-[11px] font-normal transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 ${
                    isFollowing
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 transition-colors ${
                      isFollowing
                        ? "fill-rose-500 text-rose-500"
                        : "text-slate-500"
                    }`}
                  />
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                  <span className="text-[10px] opacity-70 font-normal">
                    ({followers})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareClick}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] sm:text-[11px] font-normal text-slate-700 shadow-2xs shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3 h-3 text-blue-600" />
                  <span>Share</span>
                </button>

                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 shadow-2xs shrink-0">
                  <span className="text-[10.5px] sm:text-[11px] font-normal text-slate-700 whitespace-nowrap">
                    Existing User
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={existingUser}
                    onClick={() => setExistingUser(!existingUser)}
                    aria-label="Toggle Existing User Deals"
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      existingUser ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out ${
                        existingUser ? "translate-x-3" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Tabs Row */}
            <div className="flex items-center justify-between gap-2 mt-1.5 pb-2 font-sans">
              <div className="flex bg-slate-100/90 p-0.5 rounded-lg gap-1 max-w-md border border-slate-200/60">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-grow py-1 px-2.5 text-[11px] sm:text-xs font-normal whitespace-nowrap transition-all border-0 cursor-pointer rounded-md text-center ${
                        isActive
                          ? "bg-white text-blue-700 shadow-2xs border border-slate-200/70 font-medium"
                          : "bg-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}{" "}
                      <span className="text-[10px] opacity-70 font-normal">
                        ({tab.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        merchant={merchant}
        currentUrl={currentUrl}
        shareText={shareText}
      />
    </header>
  );
}
