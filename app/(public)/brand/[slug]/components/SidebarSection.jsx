"use client";

import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import SafeImage from "@/components/shared/SafeImage";
import {
  BrandLinksBar,
  formatWhatsAppUrl,
  getDisplayDomain,
  normalizeExternalUrl,
  WhatsAppIcon,
} from "@/components/shared/SocialLinks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SidebarSection({
  merchant,
  openStatus,
  faqs,
  copiedLink,
  handleShare,
}) {
  const fontStyle = { fontFamily: "var(--font-inter), Inter, sans-serif" };

  const fullAddress = [
    merchant.location?.address,
    merchant.location?.city,
    merchant.location?.state,
    merchant.location?.pincode,
    merchant.location?.country === "IN" ? "India" : merchant.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const mapQuery =
    fullAddress ||
    (merchant.location?.city
      ? `${merchant.location.city}, ${merchant.location.state || "India"}`
      : `${merchant.businessName}, India`);

  const socials = merchant.socialLinks || merchant.socials || {};
  const hasSocials =
    Boolean(merchant.whatsappNumber) ||
    Object.values(socials).some(
      (v) => v && typeof v === "string" && v.trim() !== "",
    );

  const displayDomain = getDisplayDomain(merchant.website);

  return (
    <div className="lg:col-span-4 space-y-4 text-left" style={fontStyle}>
      {/* About store */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
        <div>
          <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 mb-2.5">
            About {merchant.businessName}
          </h3>
          <p className="text-[12.5px] text-slate-600 leading-relaxed font-normal">
            {(() => {
              const text =
                merchant.description ||
                merchant.longDescription ||
                merchant.shortDescription;
              if (text && text.trim().length > 15 && !text.includes("sfsf")) {
                return text;
              }
              return `Welcome to ${merchant.businessName}! Explore verified discount offers, promo codes, and exclusive deals curated daily for you.`;
            })()}
          </p>
        </div>

        {/* Official Store Website Button */}
        {merchant.website && (
          <a
            href={normalizeExternalUrl(merchant.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 text-blue-700 text-xs font-semibold transition-all group shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                Visit {displayDomain || "Official Website"}
              </span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        )}

        {/* Official Social Media Channels */}
        {hasSocials && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Official Channels
            </span>
            <BrandLinksBar merchant={merchant} showWebsite={false} size="sm" />
          </div>
        )}
      </div>

      {/* Storefront / Shop Image (if available in merchant data) */}
      {merchant.shopImage && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
              Storefront & Products
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              Official Media
            </span>
          </div>
          <div className="relative h-44 w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group">
            <SafeImage
              src={merchant.shopImage}
              alt={`${merchant.businessName} Storefront`}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 360px"
            />
          </div>
        </div>
      )}

      {/* Operating Hours */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2.5">
          <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Operating Hours
          </h3>
          <span className={`text-[10.5px] font-normal ${openStatus.color}`}>
            ● {openStatus.label}
          </span>
        </div>
        <div className="space-y-1.5">
          {merchant.operatingHours ? (
            Object.entries(merchant.operatingHours).map(([day, hrs]) => {
              const isClosed = hrs?.closed === true || hrs?.isOpen === false;
              const openStr = hrs?.open || hrs?.openTime || "10:00 AM";
              const closeStr = hrs?.close || hrs?.closeTime || "08:00 PM";
              return (
                <div
                  key={day}
                  className="flex justify-between text-[11.5px] text-slate-500 font-normal"
                >
                  <span className="capitalize font-normal text-slate-700">
                    {day}
                  </span>
                  <span>
                    {isClosed ? "Closed" : `${openStr} – ${closeStr}`}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-[11.5px] text-slate-400 font-normal">
              Hours not specified
            </p>
          )}
        </div>
      </div>

      {/* Store Location */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
            Location & Contact
          </h3>
          {merchant.businessType && (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
              {merchant.businessType === "both"
                ? "Online & In-Store"
                : merchant.businessType}
            </span>
          )}
        </div>

        {/* Map Embed */}
        <div className="relative h-36 w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
          <iframe
            title={`${merchant.businessName} Map Location`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={
              merchant.location?.coordinates?.lat
                ? `https://maps.google.com/maps?q=${merchant.location.coordinates.lat},${merchant.location.coordinates.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
            }
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* Direct Google Maps Link */}
        {merchant.gmapsLink && (
          <a
            href={merchant.gmapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}

        <div className="space-y-2 text-[12px] text-slate-600 font-normal pt-1">
          {fullAddress && (
            <div className="flex gap-2 items-start">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-slate-700">{fullAddress}</p>
            </div>
          )}

          {merchant.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <a
                href={`tel:${merchant.contactPhone}`}
                className="hover:text-blue-600 transition-colors"
              >
                {merchant.contactPhone}
              </a>
            </div>
          )}

          {merchant.whatsappNumber && (
            <div className="flex items-center gap-2">
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={formatWhatsAppUrl(merchant.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <span>{merchant.whatsappNumber}</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-normal">
                  WhatsApp
                </span>
              </a>
            </div>
          )}

          {merchant.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <a
                href={`mailto:${merchant.contactEmail}`}
                className="hover:text-blue-600 transition-colors truncate"
              >
                {merchant.contactEmail}
              </a>
            </div>
          )}

          {merchant.liaisonName && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
              <span className="font-medium text-slate-700">Support Desk:</span>
              <span>{merchant.liaisonName}</span>
              {merchant.liaisonPhone &&
                merchant.liaisonPhone !== merchant.contactPhone && (
                  <a
                    href={`tel:${merchant.liaisonPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    ({merchant.liaisonPhone})
                  </a>
                )}
            </div>
          )}

          {merchant.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <a
                href={normalizeExternalUrl(merchant.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate font-medium"
              >
                {displayDomain || "Official Website"}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-1">
          FAQs
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-b border-gray-50 last:border-0"
            >
              <AccordionTrigger className="text-left font-medium text-[13px] text-gray-800 hover:text-blue-600 hover:no-underline py-2.5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[12px] text-gray-500 leading-relaxed pb-3 font-normal">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Share */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-50 mb-3">
          Share Deals
        </h3>
        <button
          onClick={handleShare}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-[13px] font-medium py-2.5 px-4 rounded-lg border border-gray-200 cursor-pointer transition-colors text-gray-700 hover:text-blue-600"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Link Copied!</span>
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
  );
}
