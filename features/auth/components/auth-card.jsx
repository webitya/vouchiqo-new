"use client";

import { Loader2 } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

/**
 * Shared auth page shell — split-panel design with blue/white theme,
 * including global header and footer, compact layout, and reduced border radius.
 */
export function AuthCard({
  title,
  loading = false,
  maxWidth = "max-w-4xl",
  children,
}) {
  const getSubtitles = (title) => {
    switch (title) {
      case "Log In":
        return "Sign in to access your Vouchiqo account";
      case "Create your free account":
        return "Join Vouchiqo to start saving and tracking analytics";
      case "Recover your password":
        return "Enter your email to receive recovery instructions";
      case "Set a new password":
        return "Create a strong new password for your account";
      case "Enter Verification Code":
        return "Verify your identity using the code sent to your email";
      case "Merchant Partner Log In":
        return "Log in to manage your coupon campaigns and analytics";
      case "Merchant Partner Registration":
        return "Partner with Vouchiqo to boost your brand visibility";
      case "Recover Merchant Password":
      case "Merchant Partner Password Recovery":
        return "Enter your registered merchant email to receive recovery instructions";
      case "Set Merchant Password":
      case "Set New Merchant Password":
        return "Create a strong new password for your merchant partner account";
      case "Admin Log In":
        return "Secure access to the administration dashboard";
      default:
        return "Please fill out the form below to continue";
    }
  };

  const getDisplayTitle = (title) => {
    switch (title) {
      case "Log In":
        return "Welcome Back";
      case "Create your free account":
        return "Create Account";
      case "Recover your password":
        return "Recover Password";
      case "Recover Merchant Password":
      case "Merchant Partner Password Recovery":
        return "Merchant Recovery";
      case "Set a new password":
        return "Set New Password";
      case "Set Merchant Password":
      case "Set New Merchant Password":
        return "Set Merchant Password";
      case "Enter Verification Code":
        return "Verify OTP";
      case "Merchant Partner Log In":
        return "Merchant Login";
      case "Merchant Partner Registration":
        return "Merchant Register";
      case "Admin Log In":
        return "Admin Portal";
      default:
        return title;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#35104A] font-sans antialiased">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Centered main content area with dynamic min-height to push footer just below the viewport fold */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Compact split-card container with less border radius (rounded-2xl) */}
        <div
          className={`w-full ${maxWidth} bg-white border border-[#EADBCE] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] md:min-h-[500px] my-auto`}
        >
          {/* Left Visual Panel: Brand gradient theme */}
          <div
            className="hidden md:flex md:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#35104A] via-[#210830] to-[#007F79] select-none items-center justify-center p-8 text-left"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#FFD166_1px,transparent_1px)] [background-size:18px_18px] opacity-15 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#007F79]/30 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#FF2E63]/25 blur-2xl pointer-events-none" />

            <div className="relative z-10 text-white space-y-4 max-w-xs">
              <div>
                <span className="text-2xl font-black font-heading tracking-wider block text-white">
                  VOUCHIQO
                </span>
                <span className="text-[10.5px] font-heading font-bold text-[#FFD166] tracking-widest uppercase block mt-1">
                  Verified Deals · Real Savings
                </span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/15 text-xs text-[#FFF8EF]/90 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166] shrink-0" />
                  <span>Verified discount coupons daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E63] shrink-0" />
                  <span>Exclusive member flash price drops</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007F79] shrink-0" />
                  <span>Instant 1-click codes &amp; zero fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel: Compact, clean sans typography */}
          <div className="col-span-1 md:col-span-7 bg-white p-6 md:p-8 flex flex-col justify-center">
            {/* Header: Title and subtitle with brand fonts */}
            <div>
              <h2 className="text-2xl sm:text-[26px] font-bold font-heading text-[#35104A] tracking-tight leading-none">
                {getDisplayTitle(title)}
              </h2>
              <p className="text-xs text-[#6B4C82] mt-2 font-sans font-medium">
                {getSubtitles(title)}
              </p>
            </div>

            {/* Form children wrapper (compact layout) */}
            <div className="flex-1 flex flex-col justify-center mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#007F79]" />
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
