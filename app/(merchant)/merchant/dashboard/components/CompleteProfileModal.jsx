"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  ShieldAlert,
  Store,
  X,
  Zap,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function calculateProfileHealth(merchant) {
  if (!merchant) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 15,
      missingFields: ["All details missing"],
      isCoreComplete: false,
      color: "red",
    };
  }

  const fields = [
    {
      name: "Business Name",
      isFilled: Boolean(merchant.businessName),
      isRequired: true,
    },
    { name: "Brand Slug", isFilled: Boolean(merchant.slug), isRequired: true },
    {
      name: "Primary Category",
      isFilled: Boolean(merchant.category),
      isRequired: true,
    },
    {
      name: "Contact Email",
      isFilled: Boolean(merchant.contactEmail),
      isRequired: true,
    },
    {
      name: "Contact Phone",
      isFilled: Boolean(merchant.contactPhone),
      isRequired: true,
    },
    {
      name: "Store Address",
      isFilled: Boolean(merchant.location?.address || merchant.address),
      isRequired: true,
    },
    {
      name: "City & State",
      isFilled: Boolean(
        (merchant.location?.city || merchant.city) &&
          (merchant.location?.state || merchant.state),
      ),
      isRequired: true,
    },
    {
      name: "Pincode",
      isFilled: Boolean(merchant.location?.pincode || merchant.pincode),
      isRequired: true,
    },
    {
      name: "Google Maps Link (Optional)",
      isFilled: Boolean(merchant.location?.gmapsLink || merchant.gmapsLink),
      isRequired: false,
    },
    {
      name: "Store Logo (Optional)",
      isFilled: Boolean(merchant.logo || merchant.logoUrl),
      isRequired: false,
    },
    {
      name: "Store Banner Image (Optional)",
      isFilled: Boolean(merchant.banner || merchant.bannerUrl),
      isRequired: false,
    },
    {
      name: "Shop Storefront Photo (Optional)",
      isFilled: Boolean(merchant.shopImage || merchant.shopImageUrl),
      isRequired: false,
    },
    {
      name: "Identity Document Type (Optional)",
      isFilled: Boolean(merchant.docType),
      isRequired: false,
    },
    {
      name: "Identity Document Image (Optional)",
      isFilled: Boolean(merchant.docImage),
      isRequired: false,
    },
    {
      name: "Store Operating Hours (Optional)",
      isFilled: Boolean(
        merchant.operatingHours &&
          Object.keys(merchant.operatingHours).length > 0,
      ),
      isRequired: false,
    },
  ];

  const completedCount = fields.filter((f) => f.isFilled).length;
  const totalCount = fields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = fields
    .filter((f) => !f.isFilled && f.isRequired)
    .map((f) => f.name);
  const isCoreComplete = fields
    .filter((f) => f.isRequired)
    .every((f) => f.isFilled);

  let color = "red";
  if (percentage >= 85 || isCoreComplete) {
    color = "emerald";
  } else if (percentage >= 50) {
    color = "amber";
  }

  return {
    percentage,
    completedCount,
    totalCount,
    missingFields,
    isCoreComplete,
    color,
  };
}

export default function CompleteProfileModal({ merchant, isOpen, onClose }) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const health = useMemo(() => calculateProfileHealth(merchant), [merchant]);

  // Check if merchant chose a paid plan but payment is pending / unpaid
  const planName = merchant?.plan || "Starter Free";
  const isStarterPlan =
    planName.toLowerCase().includes("starter") ||
    planName.toLowerCase().includes("free");
  const isPaidPlan = !isStarterPlan;

  const isPaymentCompleted =
    merchant?.paymentStatus === "completed" ||
    merchant?.subscriptionStatus === "active" ||
    merchant?.isPaid === true;

  const isPaymentPending = isPaidPlan && !isPaymentCompleted;
  const totalSlides = isPaymentPending ? 2 : 1;
  const isProfileComplete = health.isCoreComplete || health.percentage >= 100;

  // Controlled vs uncontrolled open state
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const isApproved = merchant?.status === "approved" || merchant?.status === "active";
  const isPending = merchant?.status === "pending" || merchant?.status === "form_accepted" || merchant?.status === "under_review";
  const isRejected = merchant?.status === "rejected";

  useEffect(() => {
    if (!merchant) return;

    if (isApproved) {
      if (isOpen === undefined) setInternalOpen(false);
      return;
    }

    if (isProfileComplete) {
      if (isOpen === undefined) setInternalOpen(false);
      return;
    }

    if (isOpen === undefined) setInternalOpen(true);
  }, [merchant, isProfileComplete, isApproved, isOpen]);

  const pathname = usePathname();

  // Do not render modal if not open, no merchant data, or if mandatory fields are complete AND approved (when uncontrolled)
  if (
    !open ||
    !merchant ||
    (isProfileComplete && isApproved && isOpen === undefined)
  ) {
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleGoToProfile = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleClose();
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/merchant/profile") {
        window.location.href = "/merchant/profile?edit=true";
      } else {
        router.push("/merchant/profile?edit=true");
      }
    }
  };

  const handleGoToBilling = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleClose();
    if (typeof window !== "undefined") {
      router.push("/merchant/billing?autoPay=true");
    }
  };

  // Dynamic color mappings for health gauge ring & status badge based on profile health score
  const strokeColor =
    health.percentage >= 85
      ? "#10b981" // Green for 85%+
      : health.percentage >= 50
        ? "#ea580c" // Orange for 50%-84%
        : "#ef4444"; // Red for < 50%

  const badgeBg =
    health.percentage >= 85
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : health.percentage >= 50
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans text-left">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Complete Your Profile to List Offers</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {merchant.businessName || "Merchant Partner"} • Fill details to
                unlock deals, offers &amp; campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Slider Controls Header */}
        {totalSlides > 1 && (
          <div className="bg-slate-100/80 px-5 py-2 flex items-center justify-between border-b border-slate-200/80 text-xs">
            <span className="font-bold text-slate-700 text-[11px]">
              Slide {currentSlide + 1} of {totalSlides}:{" "}
              {currentSlide === 0
                ? "Profile Health Score"
                : "Subscription Billing Setup"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(0)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  currentSlide === 0
                    ? "bg-white border-slate-300 shadow-2xs font-bold text-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1">
                <span
                  onClick={() => setCurrentSlide(0)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    currentSlide === 0 ? "w-4 bg-blue-600" : "bg-slate-300"
                  }`}
                />
                <span
                  onClick={() => setCurrentSlide(1)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    currentSlide === 1 ? "w-4 bg-blue-600" : "bg-slate-300"
                  }`}
                />
              </div>

              <button
                onClick={() => setCurrentSlide(1)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  currentSlide === 1
                    ? "bg-white border-slate-300 shadow-2xs font-bold text-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Slide Content */}
        <div className="p-5 space-y-4 font-sans text-left">
          {currentSlide === 0 ? (
            /* SLIDE 1: STATUS BADGE + PROFILE HEALTH + REMAINING FIELDS */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Application / Verification Status Banner */}
              {isPending && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0">
                          Application Under Review
                        </Badge>
                      </div>
                      <p className="text-[11px] text-amber-900/90 font-medium truncate mt-0.5">
                        KYC Verification &amp; Account Activation Pending Audit
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleClose();
                      router.push("/merchant/application-status");
                    }}
                    className="h-7 px-2.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shrink-0 shadow-xs cursor-pointer"
                  >
                    Track Status
                  </Button>
                </div>
              )}

              {isRejected && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <Badge className="bg-red-100 text-red-900 border-red-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0">
                        Action Required: Rejected
                      </Badge>
                      <p className="text-[11px] text-red-900/90 font-medium truncate mt-0.5">
                        {merchant.rejectionReason ||
                          "Please update your details and resubmit."}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGoToProfile}
                    className="h-7 px-2.5 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shrink-0 shadow-xs cursor-pointer"
                  >
                    Fix Issues
                  </Button>
                </div>
              )}

              {!isPending && !isRejected && (
                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <Badge className="bg-blue-100 text-blue-900 border-blue-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0">
                        Profile Completion Required
                      </Badge>
                      <p className="text-[11px] text-blue-900/90 font-medium truncate mt-0.5">
                        Fill remaining details to publish offers &amp; unlock
                        dashboard
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Circular Health Gauge & Score */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  {(() => {
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset =
                      circumference - (health.percentage / 100) * circumference;
                    return (
                      <>
                        <svg
                          className="w-full h-full transform -rotate-90 origin-center"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            className="text-slate-200"
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-lg font-black text-slate-900 leading-none tracking-tight">
                            {health.percentage}%
                          </span>
                          <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">
                            Health
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold px-1.5 py-0 ${badgeBg}`}
                    >
                      {health.percentage < 50
                        ? "Basic Profile"
                        : health.percentage < 85
                          ? "Good Progress"
                          : "Verified Store"}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-700">
                      {health.completedCount} / {health.totalCount} Fields
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-semibold leading-tight">
                    {health.percentage < 50
                      ? "Complete your store profile details to list your offers and unlock full controls."
                      : health.percentage < 100
                        ? "Almost ready! Complete your remaining profile fields to publish your offers."
                        : "Your store profile details are 100% submitted & complete!"}
                  </p>
                </div>
              </div>

              {/* Missing Fields List */}
              {health.missingFields.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    Remaining Fields to Fill ({health.missingFields.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {health.missingFields.map((fieldName, fIdx) => (
                      <span
                        key={fIdx}
                        onClick={handleGoToProfile}
                        className="text-[10px] font-semibold bg-blue-50/90 text-blue-700 border border-blue-200/90 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <span>+</span>
                        <span>{fieldName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-900">
                    {health.completedCount === health.totalCount
                      ? "All 15 Profile Fields Submitted & Verified!"
                      : "All Mandatory Profile Fields Submitted & Verified!"}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={
                    isPending
                      ? () => {
                          handleClose();
                          router.push("/merchant/application-status");
                        }
                      : handleGoToProfile
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-9.5 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>
                    {isPending ? "Track Status" : "Complete Profile"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoToProfile}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl h-9 cursor-pointer"
                >
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          ) : (
            /* SLIDE 2: PAYMENT & SUBSCRIPTION SETUP */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    Chosen Plan: {planName}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold">
                    Payment Pending
                  </Badge>
                </div>

                <p className="text-xs text-blue-800 font-medium">
                  You selected the <strong>{planName}</strong> plan. Complete
                  your subscription billing setup to unlock unlimited campaign
                  features &amp; expired offer revivals.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">
                  Features Unlocked Upon Payment:
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Up to 15 Active Offer Listings &amp; Campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Expired Offer Revivals &amp; Push Notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Founding Partner 12-Month Rate Guarantee</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={handleGoToBilling}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Payment</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
