import { BookOpen, Clock } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export const metadata = {
  title: "Terms of Service | Vouchiqo",
  description:
    "Read the Terms of Service for Vouchiqo. Understand user responsibilities, merchant campaign rules, registration requirements, and liability disclaimers.",
  openGraph: {
    title: "Terms of Service | Vouchiqo",
    description:
      "Read the Terms of Service for Vouchiqo. Understand user responsibilities, merchant campaign rules, registration requirements, and liability disclaimers.",
    type: "website",
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="border-b border-brand-border pb-6 space-y-3">
          <span className="flex items-center gap-1.5 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Legal Agreement</span>
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-brand-navy tracking-tight">
            Terms of Service
          </h1>
          <p className="flex items-center gap-1 text-[11px] text-brand-subtext font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: June 20, 2026</span>
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-sm max-w-none text-xs text-brand-subtext leading-relaxed space-y-6">
          <p className="font-semibold text-brand-text">
            Welcome to Vouchiqo. By accessing or using our platform, website,
            and services, you agree to be bound by these Terms of Service.
            Please read them carefully.
          </p>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              1. Use of the Service
            </h2>
            <p>
              Vouchiqo provides a directory of verified discount vouchers,
              promotional codes, and merchant integration portals. You agree to
              use the service only for lawful, personal, non-commercial purposes
              unless explicitly approved by merchant agreements.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              2. Account Registration
            </h2>
            <p>
              To access certain features (such as tracking claims, analytics, or
              posting coupons), you must create a secure account. You are solely
              responsible for maintaining the confidentiality of your
              credentials and Better Auth OTP tokens.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              3. Merchant Campaigns
            </h2>
            <p>
              Merchant partners agree to honor active, verified campaigns posted
              on their public profiles. Vouchiqo reserves the right to evict
              campaigns or restrict accounts displaying high rates of broken
              checkouts or invalid redemption responses.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              4. Disclaimer of Warranties
            </h2>
            <p>
              Vouchiqo provides its services "as is" and "as available". We do
              not guarantee that every coupon will yield discounts at merchant
              checkouts due to changing third-party terms, though our
              verification systems work in real-time to maximize accuracy.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Vouchiqo Corp. shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of your access to or use of the
              services.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
