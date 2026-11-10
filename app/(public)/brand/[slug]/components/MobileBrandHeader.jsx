"use client";

import { Share2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/shared/SafeImage";
import { BrandLinksBar } from "@/components/shared/SocialLinks";

function BlueVerifiedTick({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified"
      className={`${className} flex-shrink-0 inline-block`}
    >
      <circle cx="12" cy="12" r="10" fill="#2563EB" />
      <path
        d="M8.5 12.2l2.4 2.4 5-5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function MobileBrandHeader({
  merchant,
  bannerUrl,
  bannerFailed,
  setBannerFailed,
  logoFailed,
  setLogoFailed,
  tabs,
  activeTab,
  setActiveTab,
  ratingVal,
  votesCount,
  isRated,
  handleRate,
  todayStr,
  handleShareClick,
}) {
  return (
    <div className="block lg:hidden">
      {/* Mobile Breadcrumbs */}
      <div className="w-full px-3 sm:px-4 pt-2.5 pb-2">
        <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-normal overflow-x-auto whitespace-nowrap scrollbar-none">
          <li>
            <Link
              href="/"
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
          </li>
          <span className="text-slate-300">/</span>
          <li>
            <Link
              href="/brands"
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              Brands
            </Link>
          </li>
          <span className="text-slate-300">/</span>
          <li className="text-slate-800 font-semibold truncate max-w-[180px]">
            {merchant.businessName}
          </li>
        </ol>
      </div>

      {/* Mobile Banner Card */}
      {bannerUrl && !bannerFailed ? (
        <div className="px-3 sm:px-4 pt-1">
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] max-h-[220px] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80 bg-slate-50">
            <SafeImage
              src={bannerUrl}
              alt={`${merchant.businessName} banner`}
              fill
              priority={true}
              sizes="100vw"
              className="object-cover object-center rounded-2xl"
              onError={() => setBannerFailed(true)}
            />
          </div>
        </div>
      ) : null}

      {/* Mobile Brand Identity Section */}
      <section className="px-3 sm:px-4 pt-3.5 pb-2">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Brand Logo + Details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Brand Logo Card */}
            <div className="rounded-2xl shrink-0 flex items-center justify-center bg-white shadow-2xs border border-slate-200/80 overflow-hidden w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] p-2">
              {merchant.logo && !logoFailed ? (
                <SafeImage
                  src={merchant.logo}
                  alt={merchant.businessName}
                  width={84}
                  height={84}
                  className="max-h-full max-w-full object-contain object-center"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-700 font-bold text-center px-1">
                  <span className="text-lg font-bold text-slate-800 leading-none">
                    {(merchant.businessName || "B").charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate max-w-[55px] mt-0.5">
                    {merchant.businessName}
                  </span>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="space-y-1 min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {merchant.businessName}
                </h1>
                {merchant.isVerified !== false && (
                  <BlueVerifiedTick className="w-4 h-4 text-blue-600" />
                )}
              </div>

              <p className="text-xs text-slate-600 font-normal leading-snug line-clamp-1">
                {merchant.shortDescription ||
                  merchant.description ||
                  `Verified coupons, deals & offers for ${merchant.businessName}.`}
              </p>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80">
                  <span>
                    {merchant.plan
                      ? `${merchant.plan.charAt(0).toUpperCase() + merchant.plan.slice(1)} Partner`
                      : "Starter Partner"}
                  </span>
                  <TrendingUp className="w-3 h-3 text-purple-600" />
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <button
                  type="button"
                  onClick={handleRate}
                  disabled={isRated}
                  className="flex items-center gap-1 text-amber-500 font-semibold hover:opacity-80 transition-opacity border-0 bg-transparent cursor-pointer p-0"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 font-bold">
                    {ratingVal ? ratingVal.toFixed(1) : "5.0"}
                  </span>
                </button>
                <span className="text-slate-400">({votesCount || 1})</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Validated on {todayStr}</span>
              </div>

              {/* Brand Links Bar (Website + Socials) */}
              <BrandLinksBar
                merchant={merchant}
                showWebsite={true}
                className="pt-1.5"
                size="sm"
              />
            </div>
          </div>

          {/* Right: Big Blue Share Button */}
          <div className="shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleShareClick}
              className="bg-[#2563eb] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Tabs Capsule */}
      <div className="px-2.5 sm:px-4 pt-1.5 pb-2.5">
        <div className="bg-[#F4F6FB] border border-slate-200/80 rounded-xl p-0.5 flex items-center justify-between gap-0.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`w-full py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border-0 whitespace-nowrap ${
                    isActive
                      ? "bg-[#6366f1] text-white shadow-2xs"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9.5px] px-1 py-0.2 rounded-full font-bold leading-tight ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
