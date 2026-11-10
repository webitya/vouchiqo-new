"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/navbar";
import SafeImage from "@/components/shared/SafeImage";

const Footer = dynamic(() => import("@/components/layout/Footer"));
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser, useUserClaims } from "@/hooks/use-user";
import { useTrackEvent } from "@/hooks/useTrackEvent";

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 8, minutes: 22, seconds: 45 });

  useEffect(() => {
    const target = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 86400000 * 14;

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="pt-1 flex items-center justify-center">
      <div className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 text-slate-700 px-3 py-1 rounded-full text-xs font-normal shadow-2xs select-none">
        <Clock className="w-3 h-3 text-amber-500" />
        <span className="text-[10px] sm:text-[10.5px] text-slate-500 font-normal uppercase tracking-wider">Offer Expires In:</span>
        <span className="font-mono font-medium text-slate-800 text-[11px] sm:text-xs">
          {timeLeft.days}d : {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}

export default function DealDetailsClient({ coupon, relatedCoupons = [] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useUser();
  const track = useTrackEvent();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'yes' | 'no' | null
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const isMockCoupon =
    typeof coupon._id === "string" && coupon._id.startsWith("mock_");
  const [localMockSaved, setLocalMockSaved] = useState(false);

  useEffect(() => {
    if (isMockCoupon && typeof window !== "undefined") {
      setLocalMockSaved(
        localStorage.getItem(`mock_claim_${coupon._id}`) === "true",
      );
    }
  }, [coupon._id, isMockCoupon]);

  // Fetch active saved claims for the user
  const { data: claims = [], refetch: refetchClaims } = useUserClaims("active", {
    enabled: isLoggedIn && !isMockCoupon,
  });

  const matchedClaim = useMemo(() => {
    if (!claims || !Array.isArray(claims)) return null;
    return claims.find((c) => {
      if (!c || !c.couponId) return false;
      const cId =
        typeof c.couponId === "object"
          ? c.couponId._id || c.couponId.id
          : c.couponId;
      return String(cId) === String(coupon._id);
    });
  }, [claims, coupon._id]);

  const isSaved = isMockCoupon ? localMockSaved : !!matchedClaim;

  const claimId = useMemo(() => {
    if (isMockCoupon) return `mock_clm_${String(coupon._id).slice(-8)}`;
    if (matchedClaim?._id) return String(matchedClaim._id);
    if (matchedClaim?.id) return String(matchedClaim.id);
    if (isLoggedIn) {
      const uId = String(user?.id || user?._id || "user").slice(-4);
      const cId = String(coupon._id || "deal").slice(-4);
      return `clm_${uId}${cId}`;
    }
    return null;
  }, [isMockCoupon, matchedClaim, isLoggedIn, user, coupon._id]);

  const uniqueClaimCode = useMemo(() => {
    if (!claimId) return null;
    const prefixCode = (coupon.code || "DEAL")
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();
    const suffix = String(claimId)
      .replace(/[^A-Z0-9]/gi, "")
      .slice(-8)
      .toUpperCase();
    return `VQ-${prefixCode || "DEAL"}-${suffix}`;
  }, [claimId, coupon.code]);

  // Toggle Save / Claim mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        const res = await fetch(`/api/claims/${claimId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to unsave coupon");
        return { action: "unsave" };
      } else {
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponId: coupon._id }),
        });
        if (!res.ok) throw new Error("Failed to save coupon");
        return { action: "save" };
      }
    },
    onSuccess: (data) => {
      refetchClaims();
      queryClient.invalidateQueries({ queryKey: qk.user.claims() });
      toast.success(
        data.action === "save"
          ? "Coupon saved to your collection!"
          : "Coupon removed from your collection.",
      );
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update save status.");
    },
  });

  const handleToggleSave = () => {
    if (isMockCoupon) {
      const newSaved = !localMockSaved;
      setLocalMockSaved(newSaved);
      if (typeof window !== "undefined") {
        localStorage.setItem(`mock_claim_${coupon._id}`, String(newSaved));
      }
      toast.success(
        newSaved
          ? "Coupon saved to your collection!"
          : "Coupon removed from your collection.",
      );
      return;
    }
    if (!isLoggedIn) {
      toast.error("Please login to save coupons!");
      router.push(`/login?callbackUrl=/deals/${coupon._id}`);
      return;
    }
    toggleSaveMutation.mutate();
  };

  useEffect(() => {
    if (isMockCoupon) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`mock_claim_${coupon._id}`, "true");
      }
      setLocalMockSaved(true);
      return;
    }
    if (isLoggedIn && !isSaved) {
      (async () => {
        try {
          await fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ couponId: coupon._id }),
          });
          refetchClaims();
        } catch (err) {
          console.error("Auto-claim failed:", err);
        }
      })();
    }
  }, [isLoggedIn, isSaved, isMockCoupon, coupon._id, refetchClaims]);

  const merchantName = coupon.merchantId?.businessName || "Partner";
  const logoUrl = coupon.merchantId?.logo || "/placeholder-brand.png";
  const bannerUrl =
    coupon.merchantId?.banner ||
    coupon.image ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80";
  const categoryMap = {
    food: "Food & Dining",
    dining: "Food & Dining",
    restaurant: "Food & Dining",
    fashion: "Fashion & Apparel",
    clothing: "Fashion & Apparel",
    electronics: "Electronics",
    beauty: "Beauty & Wellness",
    health: "Health & Wellness",
    fitness: "Fitness & Gym",
    services: "Local Services",
    entertainment: "Entertainment",
    travel: "Travel & Hotels",
    education: "Education",
  };
  const rawCategory = String(coupon.category || coupon.merchantId?.category || "dining").toLowerCase().trim();
  const displayCategory = categoryMap[rawCategory] || coupon.category || "Exclusive Offer";
  const merchantCity =
    coupon.merchantId?.location?.city || coupon.location?.city || "Ranchi";
  const merchantAddress =
    coupon.merchantId?.location?.address || "";

  const discountFormatted = (() => {
    const rawVal = coupon.rawDiscountValue || coupon.discountValue;
    const rawType = coupon.rawDiscountType || coupon.discountType;
    const isNum = rawVal !== null && rawVal !== undefined && rawVal !== "" && !isNaN(Number(rawVal));
    const num = Number(rawVal);

    if (rawType === "percentage") {
      if (isNum && num <= 100) return `${num}% OFF`;
      if (isNum && num > 100) return `₹${num} OFF`;
      return `${rawVal || 15}% OFF`;
    }
    if (rawType === "fixed" || rawType === "flat") {
      return isNum ? `₹${num} OFF` : `₹${rawVal || 200} OFF`;
    }
    if (rawType === "freebie" || rawType === "bogo") {
      return "BUY 1 GET 1 FREE";
    }
    if (rawType === "deal" || rawType === "price") {
      return isNum ? `SPECIAL DEAL @ ₹${num}` : "SPECIAL DEAL";
    }
    return isNum && num <= 100 ? `${num}% OFF` : isNum ? `₹${num} OFF` : "SPECIAL OFFER";
  })();

  const formattedExpiry = (() => {
    if (!coupon.expiresAt) return "30 Nov 2026";
    const d = new Date(coupon.expiresAt);
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthStr = months[d.getMonth()];
    const year = d.getFullYear();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayStr = days[d.getDay()];
    return `${monthStr} ${day}, ${year} (${dayStr})`;
  })();

  const handleCopyCode = () => {
    if (!coupon.code) return;
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);

    const mId = typeof coupon.merchantId === "object" ? coupon.merchantId?._id : coupon.merchantId;
    track("copy_code", { couponId: coupon._id, merchantId: mId, source: "direct" });

    // Open Code Copied success dialog
    setIsCopyModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setShowShareTooltip(true);
    setTimeout(() => {
      setCopiedShare(false);
      setShowShareTooltip(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-slate-800 font-sans">
      <Navbar />

      <main className="w-full px-2.5 sm:px-4 md:px-5 py-3 sm:py-5 flex-grow space-y-3 sm:space-y-4">
        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Main Coupon Card (Left) */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* ── Merchant Hero Banner & Brand Identity ── */}
            <div className="relative w-full h-48 sm:h-60 md:h-72 bg-slate-900 overflow-hidden select-none group">
              <SafeImage
                src={bannerUrl}
                alt={merchantName}
                fill
                priority={true}
                sizes="(max-width: 1024px) 100vw, 800px"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                fallbackSrc="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80"
              />
              {/* Refined multi-stop dark gradient overlay for crystal clear contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/30 pointer-events-none" />

              {/* Top Floating Badge Bar inside Banner */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/95 text-slate-800 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-medium shadow-sm border border-white/80 tracking-wide uppercase">
                    {displayCategory}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-sm border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Verified Partner</span>
                  </span>
                </div>

                <div className="bg-rose-600 text-white px-3.5 py-1 rounded-lg text-xs font-semibold shadow-sm tracking-wide">
                  {discountFormatted}
                </div>
              </div>

              {/* Overlaid Merchant Brand Strip at Bottom of Banner */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 flex items-end justify-between gap-3 z-10">
                <div className="flex items-end gap-3 min-w-0">
                  {/* High-Contrast Crisp Merchant Logo Container */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 sm:p-2 shadow-xl border-2 border-white/90 shrink-0 flex items-center justify-center overflow-hidden">
                    <SafeImage
                      src={logoUrl}
                      alt={merchantName}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Merchant Details on Hero Banner */}
                  <div className="text-white drop-shadow-sm min-w-0 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-white truncate">
                        {merchantName}
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 inline-block" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-200/90 truncate flex items-center gap-1 font-normal mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{merchantCity}</span>
                      {merchantAddress && (
                        <span className="opacity-80 hidden md:inline truncate">• {merchantAddress}</span>
                      )}
                    </p>
                  </div>
                </div>

                {coupon.merchantId?.slug && (
                  <Link
                    href={`/brand/${coupon.merchantId.slug}`}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    <span>View Store Deals</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Navigation & Actions Bar Below Banner */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 select-none">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 cursor-pointer transition-colors bg-transparent border-0 p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Save Offer Toggle Action */}
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg border shadow-2xs cursor-pointer transition-all ${
                    isSaved
                      ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400"
                    }`}
                  />
                  <span>{isSaved ? "Saved" : "Save Offer"}</span>
                </button>

                {/* Share action */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Share</span>
                  </button>
                  {showShareTooltip && (
                    <span className="absolute bottom-full right-0 mb-1.5 bg-slate-900 text-white text-[10px] font-normal px-2.5 py-0.5 rounded shadow-md whitespace-nowrap animate-fade-in z-20">
                      Link Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Offer Summary & Deal Title Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {discountFormatted}
                </span>
                <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-[10px] sm:text-[10.5px] font-medium px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {coupon.code ? "PROMO CODE" : "VERIFIED SALE"}
                </span>
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-[10.5px] font-medium px-2.5 py-0.5 rounded-md">
                  In-Store &amp; Online
                </span>
              </div>

              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                {coupon.code ? (
                  <>
                    {"Use Code & Get "}
                    <span className="text-blue-600 font-extrabold">{discountFormatted}</span>
                    {" on "}
                    {coupon.merchantId?.slug ? (
                      <Link
                        href={`/brand/${coupon.merchantId.slug}`}
                        className="text-slate-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                      >
                        {merchantName}
                      </Link>
                    ) : (
                      merchantName
                    )}
                  </>
                ) : (
                  `Exclusive Deal: ${coupon.title}`
                )}
              </h1>

              {coupon.description && (
                <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed mt-1.5">
                  {coupon.description}
                </p>
              )}
            </div>

            {/* Coupon Box Container with soft background */}
            <div className="p-3.5 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 via-blue-50/20 to-indigo-50/30 text-center space-y-3.5 sm:space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal uppercase tracking-wider">
                  {coupon.code
                    ? "Your Promo Code is Ready Below"
                    : "Your Offer Has Been Activated On The Website Already"}
                </p>
              </div>

              {/* Dotted coupon box with soft shadow */}
              <div className="max-w-md mx-auto select-all space-y-2.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`w-full border-2 border-dashed rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 relative cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.06)] active:scale-[0.99] ${
                    copiedCode
                      ? "border-emerald-500 bg-emerald-50/60"
                      : "border-blue-300/90 bg-white hover:bg-blue-50/40 hover:border-blue-500"
                  }`}
                >
                  <span className="font-mono text-lg sm:text-2xl font-medium tracking-[0.14em] sm:tracking-[0.18em] text-slate-800 uppercase pl-1 sm:pl-2">
                    {coupon.code ? coupon.code : "OFFER ACTIVATED"}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                    <span className="font-normal flex items-center gap-1.5 text-xs">
                      {copiedCode ? "Copied!" : "Click to Copy Code"}
                    </span>
                  </div>
                </button>

                {/* Simple Countdown directly under coupon code box */}
                <CountdownTimer expiresAt={coupon.expiresAt} />
              </div>

              {/* Unique In-Store Claim Card with soft emerald tint */}
              {isLoggedIn ? (
                uniqueClaimCode ? (
                  <div className="max-w-md mx-auto bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border border-emerald-200/80 rounded-xl p-3.5 text-left shadow-2xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] sm:text-[10px] font-medium text-emerald-800 uppercase tracking-wider">
                        Unique In-Store Claim Code
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full font-normal border border-emerald-200">
                        Ready to Present
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2.5 bg-white border border-emerald-100 rounded-lg px-3 py-2 select-all shadow-2xs">
                      <span className="font-mono text-sm sm:text-base font-semibold tracking-wider text-emerald-900 uppercase">
                        {uniqueClaimCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uniqueClaimCode);
                          toast.success("Claim code copied!");
                        }}
                        type="button"
                        className="text-xs text-emerald-700 font-medium hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-normal leading-relaxed">
                      Present this code at the physical counter. The merchant
                      can verify your claim and customer details using this
                      code.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 font-normal py-2">
                    Generating unique in-store claim code...
                  </div>
                )
              ) : (
                <div className="max-w-md mx-auto bg-blue-50/40 border border-blue-200/80 border-dashed rounded-xl p-3 text-center space-y-1.5">
                  <p className="text-xs text-slate-600 font-normal">
                    Want to redeem in-store?
                  </p>
                  <Link
                    href={`/login?callbackUrl=/deals/${coupon._id}`}
                    className="inline-block bg-blue-600 text-white text-[11px] font-normal px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    Login to Generate In-Store Code
                  </Link>
                </div>
              )}

              {/* Redirect link OR In-Store Details */}
              {coupon.merchantId?.website ? (
                <div className="pt-1">
                  <a
                    href={coupon.merchantId.website}
                    onClick={() => {
                      const mId =
                        typeof coupon.merchantId === "object"
                          ? coupon.merchantId?._id
                          : coupon.merchantId;
                      track("merchant_website_click", {
                        couponId: coupon._id,
                        merchantId: mId,
                        source: "deal_page",
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-blue-600 hover:underline transition-colors"
                  >
                    <span>Go To {merchantName} Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </a>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100/80">
                  <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      <span>Physical Store Counter Location</span>
                    </div>
                    {coupon.merchantId?.location ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-slate-800">
                          {coupon.merchantId.businessName}
                        </p>
                        <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                          {[
                            coupon.merchantId.location.address,
                            coupon.merchantId.location.city,
                            coupon.merchantId.location.state,
                            coupon.merchantId.location.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <div className="pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${coupon.merchantId.businessName} ${coupon.merchantId.location.address || ""} ${coupon.merchantId.location.city || ""} ${coupon.merchantId.location.pincode || ""}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] font-normal text-blue-600 hover:underline"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-slate-400 font-normal italic">
                        No physical location or website details available for
                        this store partner.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status Tags */}
              <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs font-normal text-slate-500 border-t border-slate-100">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </li>
                <li className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-purple-500" />
                  <span>Existing User</span>
                </li>
                <li className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Valid Till: {formattedExpiry}</span>
                </li>
              </ul>
            </div>

            {/* T&C Section */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-blue-50/15 to-slate-50/70 text-left">
              <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 uppercase tracking-wider mb-2.5">
                T&amp;C&apos;s
              </h3>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed font-normal">
                <li>
                  Get{" "}
                  <span className="text-blue-600 font-medium">{discountFormatted}</span>{" "}
                  on your <span className="text-slate-700">{coupon.title}</span>
                </li>
                <li>
                  Applicable on active categories and selected items on
                  checkout.
                </li>
                <li>
                  Learn from verified partner stores and save with Vouchiqo
                  promo offers.
                </li>
                <li>
                  Cannot be combined with other running vouchers or promotions.
                </li>
                <li>
                  Expiry date is subject to change at merchant discretion.
                </li>
                <li>Hurry up! limited time offer</li>
              </ul>
            </div>

            {/* Feedback / Voting */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-left">
              <span className="text-xs text-slate-500 font-normal">
                Did the offer work?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserVote("yes")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-normal transition-all cursor-pointer ${
                    userVote === "yes"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600 bg-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Yes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserVote("no")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-normal transition-all cursor-pointer ${
                    userVote === "no"
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600 bg-white"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                  <span>No</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Coupons Sidebar (Right) with soft colorful accents */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 text-left">
              <h2 className="text-xs sm:text-[13px] font-medium text-[#F72853] uppercase tracking-wider mb-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Vouchiqo Related Offers</span>
                <span className="text-[10px] font-normal text-[#F72853] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  {relatedCoupons.length} Deals
                </span>
              </h2>

              <div className="space-y-2.5">
                {relatedCoupons.length > 0 ? (
                  relatedCoupons.map((c) => {
                    const cDiscount =
                      c.discountType === "percentage"
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} OFF`;
                    const cBrand =
                      c.merchantId?.businessName || "Verified Partner";
                    const cLogo =
                      c.merchantId?.logo || "/placeholder-brand.png";
                    return (
                      <Link
                        key={c._id}
                        href={`/deals/${c._id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-[#F72853] hover:bg-gradient-to-r hover:from-rose-50/40 hover:to-pink-50/20 transition-all duration-200 group"
                      >
                        <div className="w-11 h-11 rounded-lg border border-slate-100 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs group-hover:border-[#F72853]/40 transition-colors">
                          <img
                            src={cLogo}
                            alt={cBrand}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23F72853' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="text-[9.5px] sm:text-[10px] font-medium text-[#F72853] bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider inline-block">
                            {cDiscount}
                          </span>
                          <h4 className="text-xs font-normal text-slate-700 line-clamp-1 group-hover:text-[#F72853] transition-colors">
                            {c.title}
                          </h4>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs font-normal text-slate-400">
                    No related offers found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Copy Success Dialog Box per SRD requirements */}
      <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg">
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle className="font-heading text-lg font-black text-slate-800 uppercase tracking-wide flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Promo Code Copied!</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Your discount coupon is copied and ready to be used.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {coupon.code && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-left pl-1">
                  Online Promo Code:
                </span>
                <div className="bg-slate-50 border-2 border-dashed border-brand-blue/30 rounded-xl py-4 px-6 select-all font-mono text-xl font-black tracking-widest text-slate-800 uppercase">
                  {coupon.code}
                </div>
              </div>
            )}
            {uniqueClaimCode && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-left pl-1">
                  Unique In-Store Verification Code:
                </span>
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl py-3 px-6 select-all font-mono text-base font-black tracking-wider text-blue-700 uppercase flex items-center justify-between">
                  <span>{uniqueClaimCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uniqueClaimCode);
                      toast.success("Claim code copied!");
                    }}
                    type="button"
                    className="text-xs text-blue-600 font-bold hover:underline border-0 bg-transparent p-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              {uniqueClaimCode
                ? "Show the unique verification code above to the merchant shop counter to claim your deal!"
                : `Now visit ${merchantName}, shop for eligible items, and paste the code at payment checkout!`}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {coupon.merchantId?.website ? (
              <Button
                asChild
                className="bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs h-10 w-full rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <a
                  href={coupon.merchantId.website}
                  onClick={() => {
                    const mId =
                      typeof coupon.merchantId === "object"
                        ? coupon.merchantId?._id
                        : coupon.merchantId;
                    track("merchant_website_click", {
                      couponId: coupon._id,
                      merchantId: mId,
                      source: "modal",
                    });
                  }}
                >
                  <span>Visit {merchantName} Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            ) : (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-left space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Counter Claim Address:
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {merchantName}
                </p>
                {coupon.merchantId?.location ? (
                  <>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      {[
                        coupon.merchantId.location.address,
                        coupon.merchantId.location.city,
                        coupon.merchantId.location.state,
                        coupon.merchantId.location.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${merchantName} ${coupon.merchantId.location.address || ""} ${coupon.merchantId.location.city || ""} ${coupon.merchantId.location.pincode || ""}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-black text-brand-blue hover:underline pt-1"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 font-semibold italic">
                    In-Store Counter Verification Only.
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCopyModalOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 py-2 cursor-pointer transition-colors"
            >
              Close Window
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
