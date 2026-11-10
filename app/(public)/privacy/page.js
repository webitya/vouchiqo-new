import { Clock, ShieldCheck } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export const metadata = {
  title: "Privacy Policy | Vouchiqo",
  description:
    "Learn how Vouchiqo collects, uses, and safeguards your personal data, customer preferences, and geolocation coordinates.",
  openGraph: {
    title: "Privacy Policy | Vouchiqo",
    description:
      "Learn how Vouchiqo collects, uses, and safeguards your personal data, customer preferences, and geolocation coordinates.",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="border-b border-brand-border pb-6 space-y-3">
          <span className="flex items-center gap-1.5 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection</span>
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-brand-navy tracking-tight">
            Privacy Policy
          </h1>
          <p className="flex items-center gap-1 text-[11px] text-brand-subtext font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: June 20, 2026</span>
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-sm max-w-none text-xs text-brand-subtext leading-relaxed space-y-6">
          <p className="font-semibold text-brand-text">
            At Vouchiqo, we respect your privacy and are committed to protecting
            your personal data. This Privacy Policy explains how we collect,
            use, and safeguard your information.
          </p>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly (such as registration
              email, name, and profile details) and automated metrics (such as
              geolocation coordinates during manual city detection, cookie
              preferences, and checkout claim success logs).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              2. How We Use Your Data
            </h2>
            <p>
              We process your data to authenticate your identity, serve
              location-relevant vouchers, track analytics for merchant
              dashboards, and notify you regarding coupon revival successes. We
              never sell your personal information to third parties.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              3. Geolocation and Tracking
            </h2>
            <p>
              Our location-aware features query city details via OpenStreetMap
              reverse lookup. GPS permissions are entirely user-controlled, and
              coordinates are cached locally for up to 5 minutes to prevent
              redundant requests.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              4. Security
            </h2>
            <p>
              We employ strict industry-standard security protocols, including
              cryptographic Better Auth OTP tokens, SSL transport encryption,
              and secure managed databases, to prevent unauthorized data leaks
              or access.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              5. Your Choices & Rights
            </h2>
            <p>
              You have the right to edit your settings, opt-out of
              notifications, or request permanent deletion of your customer
              profile at any time via your account settings.
            </p>
          </div>

          <div className="space-y-3 p-4 bg-orange-50/60 border border-orange-200/80 rounded-xl" id="revival-data-clause">
            <h2 className="text-sm font-bold text-orange-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#e85d04]" /> 6. Expired Offer Revival &amp; Merchant Demand Data Usage
            </h2>
            <p className="text-xs text-orange-900 font-medium leading-relaxed">
              Information submitted about businesses not currently partnered with Vouchiqo (Category B and Category C revival submissions) may be used by Vouchiqo to evaluate and pursue potential business partnerships with those businesses. Customer contact details remain confidential and are protected under strict encryption standards.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
