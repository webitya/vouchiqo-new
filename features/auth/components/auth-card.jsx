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
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text font-sans antialiased">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Centered main content area with dynamic min-height to push footer just below the viewport fold */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
        {/* Compact split-card container with less border radius (rounded-2xl) */}
        <div
          className={`w-full ${maxWidth} bg-white dark:bg-zinc-950 border border-brand-border dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] md:min-h-[500px] my-auto`}
        >
          {/* Left Visual Panel: Blue & White theme, clean with NO text overlays */}
          <div
            className="hidden md:flex md:col-span-5 relative overflow-hidden bg-cover bg-center select-none"
            style={{ backgroundImage: "url('/auth-blue-bg.png')" }}
          />

          {/* Right Form Panel: Compact, clean sans typography */}
          <div className="col-span-1 md:col-span-7 bg-white dark:bg-zinc-950 p-6 md:p-8 flex flex-col">
            {/* Header: Title and subtitle with normal/simple fonts */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight leading-none">
                {getDisplayTitle(title)}
              </h2>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-2 font-normal">
                {getSubtitles(title)}
              </p>
            </div>

            {/* Form children wrapper (compact layout) */}
            <div className="flex-1 flex flex-col justify-center mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
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
