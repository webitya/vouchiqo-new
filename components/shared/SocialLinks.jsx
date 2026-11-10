"use client";

import { ExternalLink, Globe } from "lucide-react";

/**
 * Standard vector icons for major social platforms.
 * These are self-contained SVGs since Lucide removed branded icons.
 */
export const InstagramIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const FacebookIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const TwitterIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const LinkedInIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const WhatsAppIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const YoutubeIcon = ({ className = "w-4 h-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/**
 * Ensures a string has https:// protocol and trims extra slashes.
 */
export function normalizeExternalUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Converts handles like "@brand" or "brand" into a platform full URL.
 */
export function formatSocialUrl(platform, input) {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, "");
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "twitter":
    case "x":
      return `https://x.com/${handle}`;
    case "linkedin":
      return handle.includes("/")
        ? `https://linkedin.com/${handle}`
        : `https://linkedin.com/company/${handle}`;
    case "youtube":
      return `https://youtube.com/@${handle}`;
    default:
      return `https://${handle}`;
  }
}

/**
 * Formats a phone or WhatsApp number into a wa.me URL.
 */
export function formatWhatsAppUrl(number, message = "") {
  if (!number) return "";
  const cleaned = String(number).replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  const phone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  const msgParam = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${msgParam}`;
}

/**
 * Formats a raw website URL for clean human-readable display.
 * Unwraps affiliate redirect links (e.g. linksredirect.com/?...url=https://blabliblulife.com/)
 * to display the real store domain.
 */
export function getDisplayDomain(url) {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  try {
    const parsed = new URL(
      clean.startsWith("http") ? clean : `https://${clean}`,
    );
    const targetUrl =
      parsed.searchParams.get("url") ||
      parsed.searchParams.get("dest") ||
      parsed.searchParams.get("target") ||
      parsed.searchParams.get("redirect") ||
      parsed.searchParams.get("link");
    if (targetUrl) {
      return getDisplayDomain(decodeURIComponent(targetUrl));
    }
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return clean
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/.*$/, "");
  }
}

/**
 * Compact pill/button list of verified brand external links.
 */
export function BrandLinksBar({
  merchant,
  showWebsite = true,
  className = "",
  size = "sm",
}) {
  if (!merchant) return null;

  const rawWebsite = merchant.website || "";
  const websiteUrl = normalizeExternalUrl(rawWebsite);
  const displayDomain = getDisplayDomain(rawWebsite);

  const socials = merchant.socialLinks || merchant.socials || {};
  const instagramUrl = formatSocialUrl(
    "instagram",
    socials.instagram || merchant.instagram || merchant.instagramHandle,
  );
  const facebookUrl = formatSocialUrl(
    "facebook",
    socials.facebook || merchant.facebook || merchant.facebookUrl,
  );
  const twitterUrl = formatSocialUrl(
    "twitter",
    socials.twitter || merchant.twitter || merchant.twitterUrl,
  );
  const linkedinUrl = formatSocialUrl(
    "linkedin",
    socials.linkedin || merchant.linkedin || merchant.linkedinUrl,
  );
  const youtubeUrl = formatSocialUrl(
    "youtube",
    socials.youtube || merchant.youtube,
  );
  const whatsappUrl = formatWhatsAppUrl(merchant.whatsappNumber);

  const hasAnyLink =
    (showWebsite && !!websiteUrl) ||
    !!instagramUrl ||
    !!facebookUrl ||
    !!twitterUrl ||
    !!linkedinUrl ||
    !!youtubeUrl ||
    !!whatsappUrl;

  if (!hasAnyLink) return null;

  const iconSize = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
  const pillPadding =
    size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]";

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* Official Website Button */}
      {showWebsite && websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 ${pillPadding} rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition-all shadow-2xs group cursor-pointer`}
          title={`Visit official ${merchant.businessName} website`}
        >
          <Globe className={`${iconSize} text-blue-600`} />
          <span className="font-medium max-w-[140px] truncate">
            {displayDomain || "Official Website"}
          </span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </a>
      )}

      {/* Instagram */}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-[#E1306C] text-slate-600 hover:text-white border border-slate-200 hover:border-[#E1306C] transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`${merchant.businessName} on Instagram`}
          aria-label="Instagram"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Facebook */}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-[#1877F2] text-slate-600 hover:text-white border border-slate-200 hover:border-[#1877F2] transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`${merchant.businessName} on Facebook`}
          aria-label="Facebook"
        >
          <FacebookIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Twitter / X */}
      {twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-black text-slate-600 hover:text-white border border-slate-200 hover:border-black transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`${merchant.businessName} on X / Twitter`}
          aria-label="Twitter"
        >
          <TwitterIcon className="w-3 h-3" />
        </a>
      )}

      {/* LinkedIn */}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-[#0A66C2] text-slate-600 hover:text-white border border-slate-200 hover:border-[#0A66C2] transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`${merchant.businessName} on LinkedIn`}
          aria-label="LinkedIn"
        >
          <LinkedInIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* YouTube */}
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-[#FF0000] text-slate-600 hover:text-white border border-slate-200 hover:border-[#FF0000] transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`${merchant.businessName} on YouTube`}
          aria-label="YouTube"
        >
          <YoutubeIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* WhatsApp */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-[#25D366] text-slate-600 hover:text-white border border-slate-200 hover:border-[#25D366] transition-all shadow-2xs cursor-pointer hover:scale-105"
          title={`Chat with ${merchant.businessName} on WhatsApp`}
          aria-label="WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
