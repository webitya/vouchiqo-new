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
  const fontStyle = { fontFamily: "var(--font-sans), sans-serif" };

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
    <div className="lg:col-span-4 space-y-3 text-left" style={fontStyle}>
      {/* About store */}
      <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
        <div>
          <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A] pb-1.5 border-b border-[#EADBCE] mb-2">
            About {merchant.businessName}
          </h3>
          <p className="text-[12px] text-[#6B4C82] leading-relaxed font-medium">
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
            className="w-full inline-flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#007F79] hover:bg-[#35104A] text-white text-xs font-heading font-bold transition-all group shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate">
                Visit {displayDomain || "Official Website"}
              </span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        )}

        {/* Official Social Media Channels */}
        {hasSocials && (
          <div className="pt-1.5 border-t border-[#EADBCE]">
            <span className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-[#6B4C82] block mb-1">
              Official Channels
            </span>
            <BrandLinksBar merchant={merchant} showWebsite={false} size="sm" />
          </div>
        )}
      </div>

      {/* Storefront / Shop Image (if available in merchant data) */}
      {merchant.shopImage && (
        <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#EADBCE]">
            <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A]">
              Storefront &amp; Products
            </h3>
            <span className="text-[10px] text-[#6B4C82] font-medium">
              Official Media
            </span>
          </div>
          <div className="relative h-36 w-full rounded-lg overflow-hidden border border-[#EADBCE] bg-white group">
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
      <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 shadow-2xs">
        <div className="flex justify-between items-center pb-1.5 border-b border-[#EADBCE] mb-2">
          <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#007F79]" />
            Operating Hours
          </h3>
          <span className={`text-[10.5px] font-heading font-semibold ${openStatus.color}`}>
            ● {openStatus.label}
          </span>
        </div>
        <div className="space-y-1">
          {merchant.operatingHours ? (
            Object.entries(merchant.operatingHours).map(([day, hrs]) => {
              const isClosed = hrs?.closed === true || hrs?.isOpen === false;
              const openStr = hrs?.open || hrs?.openTime || "10:00 AM";
              const closeStr = hrs?.close || hrs?.closeTime || "08:00 PM";
              return (
                <div
                  key={day}
                  className="flex justify-between text-[11px] text-[#6B4C82] font-medium"
                >
                  <span className="capitalize font-semibold text-[#35104A]">
                    {day}
                  </span>
                  <span>
                    {isClosed ? "Closed" : `${openStr} – ${closeStr}`}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-[#6B4C82] font-medium">
              Hours not specified
            </p>
          )}
        </div>
      </div>

      {/* Store Location */}
      <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
        <div className="flex justify-between items-center pb-1.5 border-b border-[#EADBCE]">
          <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A]">
            Location &amp; Contact
          </h3>
          {merchant.businessType && (
            <span className="text-[10px] font-heading font-semibold text-[#007F79] bg-[#007F79]/10 px-2 py-0.5 rounded-full capitalize">
              {merchant.businessType === "both"
                ? "Online & In-Store"
                : merchant.businessType}
            </span>
          )}
        </div>

        {/* Map Embed (Compact) */}
        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-[#EADBCE] bg-white">
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
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#007F79]/10 text-[#35104A] hover:text-[#007F79] border border-[#EADBCE] text-xs font-heading font-semibold transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#007F79]" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#6B4C82]" />
          </a>
        )}

        <div className="space-y-2 text-[12px] text-slate-600 font-normal pt-1">
          {fullAddress && (
            <div className="flex gap-2 items-start">
              <MapPin className="w-3.5 h-3.5 text-festival-teal shrink-0 mt-0.5" />
              <p className="leading-relaxed text-slate-700">{fullAddress}</p>
            </div>
          )}

          {merchant.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-festival-teal shrink-0" />
              <a
                href={`tel:${merchant.contactPhone}`}
                className="hover:text-festival-teal transition-colors"
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
              <Mail className="w-3.5 h-3.5 text-festival-teal shrink-0" />
              <a
                href={`mailto:${merchant.contactEmail}`}
                className="hover:text-festival-teal transition-colors truncate"
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
                    className="text-festival-teal hover:underline"
                  >
                    ({merchant.liaisonPhone})
                  </a>
                )}
            </div>
          )}

          {merchant.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-festival-teal shrink-0" />
              <a
                href={normalizeExternalUrl(merchant.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-festival-teal hover:underline truncate font-medium"
              >
                {displayDomain || "Official Website"}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 shadow-2xs">
        <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A] pb-2 border-b border-[#EADBCE] mb-1">
          FAQs
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-b border-[#EADBCE]/60 last:border-0"
            >
              <AccordionTrigger className="text-left font-heading font-semibold text-[12.5px] text-[#35104A] hover:text-[#007F79] hover:no-underline py-2">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[11.5px] text-[#6B4C82] leading-relaxed pb-2.5 font-sans font-medium">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Share */}
      <div className="bg-[#FFF8EF] border border-[#EADBCE] rounded-xl p-3 sm:p-3.5 shadow-2xs">
        <h3 className="text-[10.5px] font-heading font-bold uppercase tracking-wider text-[#35104A] pb-2 border-b border-[#EADBCE] mb-2">
          Share Deals
        </h3>
        <button
          onClick={handleShare}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-[#007F79]/10 hover:bg-[#007F79] text-[#007F79] hover:text-white text-xs font-heading font-bold py-2 px-3.5 rounded-lg border border-[#007F79]/20 cursor-pointer transition-all shadow-2xs"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#007F79]" />
              <span>Link Copied!</span>
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
