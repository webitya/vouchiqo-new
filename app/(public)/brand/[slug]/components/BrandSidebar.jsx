"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  BrandLinksBar,
  getDisplayDomain,
  normalizeExternalUrl,
} from "@/components/shared/SocialLinks";

/**
 * Brand sidebar: about store, FAQ accordion, contact details, share widget.
 */
export default function BrandSidebar({ merchant, copiedLink, onShare }) {
  const faqs = useMemo(() => {
    const brand = merchant.businessName || "this brand";
    return [
      {
        q: `How do I apply a discount coupon for ${brand}?`,
        a: `Select a verified coupon from our page, click 'Get Coupon Code' to copy it, then paste it into the coupon/promo code entry box on ${brand}'s official website during checkout.`,
      },
      {
        q: `Are all coupons on Vouchiqo verified?`,
        a: `Yes! Every discount code and offer listed on Vouchiqo is manually checked and verified by our deal hunters daily to ensure you always get working discounts.`,
      },
      {
        q: `What can I do if a coupon has expired?`,
        a: `If a coupon has expired, you can vote to revive it by clicking 'Revive Coupon'. Our team monitors these requests and reaches out to ${brand} to secure new active promotional offers.`,
      },
    ];
  }, [merchant.businessName]);

  return (
    <div className="lg:col-span-4 space-y-5 text-left font-sans">
      {/* About store */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          About {merchant.businessName}
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium">
          {merchant.longDescription ||
            merchant.description ||
            `Discover active verified coupon codes, sitewide promo offers, and exclusive discounts for ${merchant.businessName}. Save on every purchase with tested deals.`}
        </p>
        {merchant.website && (
          <a
            href={normalizeExternalUrl(merchant.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 text-blue-700 text-xs font-semibold transition-all group shadow-2xs cursor-pointer mt-2"
          >
            <span className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Visit Official Store Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        )}

        {/* Official Social Media Channels */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Official Channels
          </span>
          <BrandLinksBar merchant={merchant} showWebsite={false} size="sm" />
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3">
        <FaqAccordion faqs={faqs} />
      </div>

      {/* Contact Details */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Store Location &amp; Contact
        </h3>
        <div className="space-y-3 text-xs text-slate-700 font-semibold">
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-600 font-medium">
              {merchant.location?.address && `${merchant.location.address}, `}
              {merchant.location?.city ? (
                <>
                  {merchant.location.city},{" "}
                  {merchant.location.state || "Jharkhand"}
                  {merchant.location?.pincode &&
                    `, ${merchant.location.pincode}`}
                </>
              ) : (
                "Ranchi, Jharkhand, India"
              )}
            </p>
          </div>
          {merchant.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-600 font-medium">
                {merchant.contactPhone}
              </span>
            </div>
          )}
          {merchant.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-600 font-medium">
                {merchant.contactEmail}
              </span>
            </div>
          )}
          {merchant.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <a
                href={normalizeExternalUrl(merchant.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate font-medium"
              >
                {getDisplayDomain(merchant.website) || "Official Website"}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Share widget */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Share {merchant.businessName} Offers
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            type="button"
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-colors active:scale-98"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied Link</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Page Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Internal FAQ accordion component */
function FaqAccordion({ faqs }) {
  const [expandedFaq, setExpandedFaq] = useState(0);

  return (
    <>
      <h3 className="text-sm font-extrabold text-[#191f2e] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
        Frequently Asked Questions
      </h3>
      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isExpanded = expandedFaq === idx;
          return (
            <div
              key={idx}
              className="border-b border-[#f1f5f9] last:border-0 pb-3 last:pb-0"
            >
              <button
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                type="button"
                className="w-full flex justify-between items-start text-left font-bold text-[13px] text-[#191f2e] hover:text-[#3e80dd] transition-colors border-0 bg-transparent cursor-pointer p-0"
              >
                <span className="pr-4">{faq.q}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6b7280]" />
                )}
              </button>
              {isExpanded && (
                <p className="text-xs text-[#6b7280] leading-relaxed mt-2 pl-1 font-medium">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
