"use client";

import dynamicImport from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

// Core components & layout
import Navbar from "@/components/layout/navbar";
import { useSession } from "@/lib/auth-client";
import { HeroSection } from "../HeroSection";
import PopularOffers from "../PopularOffers";
import PopularStores from "../PopularStores";
import LeadingTaglineBar from "./LeadingTaglineBar";

// Defer loads of below-the-fold and modal overlay components
const Footer = dynamicImport(() =>
  import("@/components/layout/Footer").then((mod) => mod.default || mod),
);
const TrendingOffer = dynamicImport(() =>
  import("./TrendingOffer").then((mod) => mod.TrendingOffer || mod.default),
);
const DealsOfTheDay = dynamicImport(() =>
  import("./DealsOfTheDay").then((mod) => mod.DealsOfTheDay || mod.default),
);
const NewsletterSubscription = dynamicImport(() =>
  import("./NewsletterSubscription").then(
    (mod) => mod.NewsletterSubscription || mod.default,
  ),
);
const FaqSection = dynamicImport(() =>
  import("../FAQSection").then((mod) => mod.FaqSection || mod.default),
);
const LatestArticles = dynamicImport(() =>
  import("../LatestArticles").then((mod) => mod.LatestArticles || mod.default),
);
const RevivalPromo = dynamicImport(() =>
  import("../RevivalPromo").then((mod) => mod.RevivalPromo || mod.default),
);

const LocationPromptModal = dynamicImport(
  () =>
    import("@/components/shared/modals/LocationPromptModal").then(
      (mod) => mod.default || mod.LocationPromptModal,
    ),
  { ssr: false },
);
const PopupBannerModal = dynamicImport(
  () =>
    import("./PopupBannerModal").then(
      (mod) => mod.PopupBannerModal || mod.default,
    ),
  { ssr: false },
);
const InterestSheet = dynamicImport(
  () =>
    import("./InterestSheet").then((mod) => mod.InterestSheet || mod.default),
  { ssr: false },
);

export function HomeClient({
  initialCoupons = [],
  popularMerchants = [],
  banners = [],
  affiliateProducts = [],
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isPrefSheetOpen, setIsPrefSheetOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  // Mount logic
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text w-full">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Container — Single semantic main for accessibility & SEO */}
      <main id="main-content" className="w-full flex-1">
        {/* Full-width Hero with 3-6px spacing */}
        <div className="w-full px-1 sm:px-1.5 pt-1 sm:pt-1.5 pb-1">
          <section
            className="g-main-banner main__banner__div w-full"
            data-toppicks-show="True"
          >
            <HeroSection banners={banners} />
          </section>
        </div>

        {/* Decorative tagline bar — spans full screen width naturally */}
        <LeadingTaglineBar />

        {/* Popular Offers & Popular Stores */}
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-2 space-y-6 sm:space-y-8">
          {/* Popular Offers of the Day */}
          <Suspense
            fallback={
              <div className="w-full h-64 bg-slate-100/60 rounded-2xl animate-pulse" />
            }
          >
            <PopularOffers coupons={initialCoupons} />
          </Suspense>

          {/* Popular Stores (with Store of the Day) */}
          <Suspense
            fallback={
              <div className="w-full h-80 bg-slate-100/60 rounded-2xl animate-pulse" />
            }
          >
            <PopularStores merchants={popularMerchants} />
          </Suspense>
        </div>

        {/* Full-bleed Edge-to-Edge Sections */}
        <Suspense
          fallback={
            <div className="w-full h-48 bg-slate-100/60 animate-pulse" />
          }
        >
          <RevivalPromo />
        </Suspense>

        {/* Trending Offer, Deals of Day, Latest Articles */}
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-2 space-y-6 sm:space-y-8">
          {/* Trending Offer Banner */}
          <Suspense
            fallback={
              <div
                className="w-full bg-slate-100/70 rounded-xl sm:rounded-2xl border border-slate-200/80 animate-pulse"
                style={{ aspectRatio: "2048 / 768", minHeight: "130px" }}
              />
            }
          >
            <TrendingOffer banners={banners} />
          </Suspense>

          {/* Deals of the Day / Affiliate Products */}
          <Suspense
            fallback={
              <div className="w-full h-72 bg-slate-100/60 rounded-2xl animate-pulse" />
            }
          >
            <DealsOfTheDay affiliateProducts={affiliateProducts} />
          </Suspense>

          {/* Latest Articles carousel */}
          <Suspense
            fallback={
              <div className="w-full h-64 bg-slate-100/60 rounded-2xl animate-pulse" />
            }
          >
            <LatestArticles />
          </Suspense>
        </div>

        {/* FAQ Section — full width on mobile */}
        <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 mb-2">
          <Suspense
            fallback={
              <div className="w-full h-48 bg-slate-100/60 rounded-2xl animate-pulse" />
            }
          >
            <FaqSection />
          </Suspense>
        </div>

        {/* Subscribe Now — full width, flush to footer */}
        <Suspense
          fallback={
            <div className="w-full h-32 bg-slate-100/60 animate-pulse" />
          }
        >
          <NewsletterSubscription />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<div className="w-full h-64 bg-slate-900/10" />}>
        <Footer />
      </Suspense>

      {/* Personalisation Preferences slide-in Sheet panel */}
      {isMounted && user && isPrefSheetOpen && (
        <InterestSheet
          isOpen={isPrefSheetOpen}
          onOpenChange={setIsPrefSheetOpen}
        />
      )}

      {/* Popup Banner Modal */}
      {isMounted && <PopupBannerModal banners={banners} />}

      {/* Geolocation Prompt Modal */}
      {isMounted && <LocationPromptModal />}
    </div>
  );
}

export default HomeClient;
