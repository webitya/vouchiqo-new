"use client";

import { HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

const ALL_FAQS = [
  // General
  {
    category: "General",
    q: "How does Vouchiqo verify coupon codes?",
    a: "We partner directly with verified merchants whose coupon validity is integrated with their checkout systems. Our team also tracks live checkout conversion logs to ensure no stale or inactive codes remain listed on the platform.",
  },
  {
    category: "General",
    q: "Is Vouchiqo free to use for customers?",
    a: "Yes, completely free. Users can browse, search, and claim unlimited coupon codes at no cost. Merchants pay a subscription fee to list and manage their promotional campaigns on the platform.",
  },
  {
    category: "General",
    q: "How often are coupons updated on Vouchiqo?",
    a: "Our deal-hunting team reviews and updates listed coupons daily. Expired codes are automatically flagged and either removed or moved to the 'Expired' section where users can request revival.",
  },
  {
    category: "General",
    q: "Can I use multiple coupons on one purchase?",
    a: "Stacking depends entirely on the merchant's checkout policy. Vouchiqo lists each offer individually. Always check the offer's terms for stackability — some merchants allow combining a coupon code with a bank offer.",
  },
  {
    category: "General",
    q: "Are the discounts shown on Vouchiqo guaranteed?",
    a: "We strive for 100% accuracy, but final discount eligibility rests with the merchant's system at checkout. If a code doesn't work, use the 'Report' button and our team will verify it within 24 hours.",
  },
  // Offers & Redemption
  {
    category: "Offers",
    q: "How do I redeem an offer code from Vouchiqo?",
    a: "Click 'Get Code' on any offer listing. The code is automatically copied to your clipboard and the merchant's website opens in a new tab. Paste the code in the promo code field at checkout before completing payment.",
  },
  {
    category: "Offers",
    q: "Why is an offer code not working at checkout?",
    a: "Common reasons include: the offer has expired, your cart doesn't meet the minimum order value, the code is category-specific, or the merchant has paused the promotion. Report it via the 'Report Offer' button for a quick review.",
  },
  {
    category: "Offers",
    q: "What is the difference between a promo code and a deal offer?",
    a: "An offer code requires you to manually enter a promo string at checkout. A deal is a direct-link offer — clicking 'Get Deal' opens the merchant page with the discount pre-applied, no code required.",
  },
  {
    category: "Offers",
    q: "How do I know if an offer is still valid?",
    a: "All listed offers display an expiry date. Offers marked 'Verified' have been tested within the last 24 hours. If no expiry is shown, the offer is ongoing but subject to stock availability.",
  },
  {
    category: "Offers",
    q: "Can I share a Vouchiqo offer with friends?",
    a: "Absolutely. Use the share button on any offer card to copy the link. Shared links are tracked and help our platform surface the most popular deals to more users.",
  },
  // Revival System
  {
    category: "Revival",
    q: "What is the Expired Offer Revival System?",
    a: "When an offer expires, users can vote to revive it. Once a revival request threshold is met, Vouchiqo automatically notifies the partner merchant with real conversion projections, incentivizing them to reactivate the deal.",
  },
  {
    category: "Revival",
    q: "How long does an offer revival take?",
    a: "Active merchants typically respond within 2–5 business days after receiving a revival alert. The timeline depends on the merchant's responsiveness and internal campaign scheduling.",
  },
  {
    category: "Revival",
    q: "How many votes are needed to trigger a revival?",
    a: "Each merchant has a custom revival threshold based on their plan tier. Generally, Starter-plan brands need 10 votes, Growth needs 25, and Pro/Enterprise brands get auto-revival options.",
  },
  {
    category: "Revival",
    q: "Will I be notified when a revived coupon goes live?",
    a: "Yes. If you cast a revival vote, you'll receive a platform notification and email alert the moment the merchant reactivates the coupon. Make sure notifications are enabled in your account settings.",
  },
  // Merchants
  {
    category: "Merchants",
    q: "How do I list my business on Vouchiqo?",
    a: "Register via the Merchant Portal and submit your business profile for review. Our admin team approves verified businesses within 24–48 hours, after which you can access the full campaign dashboard.",
  },
  {
    category: "Merchants",
    q: "What billing plans are available for merchants?",
    a: "We offer Starter, Growth, Pro, and Enterprise plans. Each tier unlocks more active coupon slots, revival credits, analytics depth, and priority support. Visit the pricing page or contact sales for a custom quote.",
  },
  {
    category: "Merchants",
    q: "Can merchants track coupon redemptions in real time?",
    a: "Yes. The merchant dashboard provides real-time redemption counts, claimed-vs-redeemed ratios, geographic heatmaps, and coupon performance analytics updated every 5 minutes.",
  },
  {
    category: "Merchants",
    q: "What happens if my coupon gets reported as invalid?",
    a: "Our team verifies the report within 24 hours. If confirmed invalid, the coupon is paused and you'll receive an email to update or reactivate the campaign. Repeated invalid codes can affect your merchant rating.",
  },
  // Account
  {
    category: "Account",
    q: "How do I create a Vouchiqo account?",
    a: "Click 'Login' in the top navigation and choose 'Sign Up'. You can register with your email or use Google Sign-In. Account creation is instant and free for customers.",
  },
  {
    category: "Account",
    q: "How do I reset my password?",
    a: "On the login screen, click 'Forgot Password'. Enter your registered email address and you'll receive a secure reset link within 2 minutes. Check your spam folder if you don't see it.",
  },
];

const CATEGORIES = [
  "All",
  "General",
  "Offers",
  "Revival",
  "Merchants",
  "Account",
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openItem, setOpenItem] = useState(null);

  const filteredFaqs = useMemo(() => {
    return ALL_FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        faq.q.toLowerCase().includes(q) ||
        faq.a.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggle = (idx) => setOpenItem((prev) => (prev === idx ? null : idx));

  // Split into two columns for desktop
  const mid = Math.ceil(filteredFaqs.length / 2);
  const leftCol = filteredFaqs.slice(0, mid);
  const rightCol = filteredFaqs.slice(mid);

  return (
    <div
      className="flex flex-col bg-white"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div className="min-h-screen flex flex-col w-full">
        <Navbar />

        {/* ── Hero ── */}
        <section className="relative w-full bg-blue-50 border-b border-blue-100 overflow-hidden">
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-[14px] text-gray-500 font-normal max-w-md mx-auto mb-8">
              Find answers about coupon verification, the revival system,
              merchant billing, and your account.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-[13px] font-normal focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              />
            </div>
          </div>
        </section>

        {/* ── Category filter pills ── */}
        <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                {cat}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="flex-shrink-0 ml-auto text-[11px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-0 bg-transparent"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* ── FAQ Grid ── */}
        <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
          {filteredFaqs.length > 0 ? (
            <>
              <p className="text-[11px] text-gray-400 font-medium mb-5">
                Showing {filteredFaqs.length} question
                {filteredFaqs.length !== 1 ? "s" : ""}
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
                {searchQuery ? ` for "${searchQuery}"` : ""}
              </p>

              {/* Desktop: 2 columns | Mobile: 1 column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  {leftCol.map((faq) => {
                    const globalIdx = ALL_FAQS.indexOf(faq);
                    const isOpen = openItem === globalIdx;
                    return (
                      <FAQItem
                        key={globalIdx}
                        faq={faq}
                        isOpen={isOpen}
                        onToggle={() => toggle(globalIdx)}
                      />
                    );
                  })}
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  {rightCol.map((faq) => {
                    const globalIdx = ALL_FAQS.indexOf(faq);
                    const isOpen = openItem === globalIdx;
                    return (
                      <FAQItem
                        key={globalIdx}
                        faq={faq}
                        isOpen={isOpen}
                        onToggle={() => toggle(globalIdx)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-2xl">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-[15px] font-semibold text-gray-800 mb-1">
                No matching questions
              </h3>
              <p className="text-[13px] text-gray-500 font-normal max-w-xs mx-auto mb-4">
                Try different keywords like "coupon", "revival", or "merchant".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="text-blue-600 text-[13px] font-medium hover:underline border-0 bg-transparent cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
        isOpen
          ? "border-blue-200 shadow-sm"
          : "border-gray-100 hover:border-gray-200"
      }`}
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer border-0 bg-transparent"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
              isOpen ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {faq.category[0]}
          </span>
          <span
            className={`text-[13px] font-medium leading-snug ${
              isOpen ? "text-blue-700" : "text-gray-900"
            }`}
          >
            {faq.q}
          </span>
        </div>
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
            isOpen
              ? "border-blue-600 bg-blue-600 text-white rotate-180"
              : "border-gray-300 text-gray-400"
          }`}
        >
          <svg
            className="w-3 h-3 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="flex items-start gap-3 pt-3">
            <div className="flex-shrink-0 w-6 flex justify-center">
              <div className="w-0.5 h-full bg-blue-100 mt-0.5 min-h-[16px]" />
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed font-normal">
              {faq.a}
            </p>
          </div>
          <div className="mt-3 ml-9">
            <span className="inline-flex items-center text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {faq.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
