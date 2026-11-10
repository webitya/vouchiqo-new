/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Vouchiqo Image Optimization & Delivery Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically injects Cloudinary transformations (f_auto, q_auto, width, height, crop)
 * and Unsplash query parameters to guarantee minimum transfer size and maximum visual quality.
 */

export const DEFAULT_PLACEHOLDER = "/placeholder-brand.webp";

/**
 * Injects automatic format, quality, and dimension transformations into Cloudinary or Unsplash URLs.
 * Returns the optimized URL, or the original URL unchanged if it cannot be transformed.
 *
 * @param {string} url - Source image URL
 * @param {object} [options]
 * @param {number} [options.width] - Target display width
 * @param {number} [options.height] - Target display height
 * @param {string} [options.quality='auto'] - Image quality ('auto', 'auto:eco', 'auto:good', 'auto:best', or number)
 * @param {string} [options.format='auto'] - Image format ('auto', 'webp', 'avif')
 * @param {string} [options.crop='limit'] - Crop strategy ('limit', 'fill', 'scale', 'thumb')
 * @returns {string} - Optimized URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url || DEFAULT_PLACEHOLDER;

  const cleanUrl = url.trim();
  if (
    !cleanUrl ||
    cleanUrl.startsWith("data:") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl;
  }

  // ── 1. Cloudinary Optimization ──────────────────────────────────────────────
  if (
    cleanUrl.includes("res.cloudinary.com") &&
    cleanUrl.includes("/image/upload/")
  ) {
    const {
      width,
      height,
      quality = "auto",
      format = "auto",
      crop = "limit",
    } = options;

    const transforms = [];
    if (format) transforms.push(`f_${format}`);
    if (quality) transforms.push(`q_${quality}`);
    if (width && width > 0) transforms.push(`w_${Math.round(width)}`);
    if (height && height > 0) transforms.push(`h_${Math.round(height)}`);
    if (crop && ((width && width > 0) || (height && height > 0))) {
      transforms.push(`c_${crop}`);
    }

    const transformStr = transforms.join(",");
    const uploadIndex = cleanUrl.indexOf("/image/upload/");
    const prefix = cleanUrl.substring(0, uploadIndex + "/image/upload/".length);
    const suffix = cleanUrl.substring(uploadIndex + "/image/upload/".length);

    // If already has transformation segment starting with f_ or q_ or w_, don't duplicate
    if (
      suffix.startsWith("f_") ||
      suffix.startsWith("q_") ||
      suffix.startsWith("w_") ||
      suffix.startsWith("c_")
    ) {
      return cleanUrl;
    }

    return `${prefix}${transformStr}/${suffix}`;
  }

  // ── 2. Unsplash Optimization ────────────────────────────────────────────────
  if (cleanUrl.includes("images.unsplash.com")) {
    try {
      const u = new URL(cleanUrl);
      u.searchParams.set("auto", "format");
      if (options.width && options.width > 0) {
        u.searchParams.set("w", String(Math.round(options.width)));
      }
      u.searchParams.set(
        "q",
        typeof options.quality === "number" ? String(options.quality) : "80",
      );
      u.searchParams.set("fit", "crop");
      return u.toString();
    } catch {
      return cleanUrl;
    }
  }

  return cleanUrl;
}

/**
 * Returns a tiny lightweight SVG blur placeholder data URI.
 *
 * @param {string} [fillColor='#f1f5f9']
 * @returns {string} - Data URI
 */
export function getBlurPlaceholder(fillColor = "#f1f5f9") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="${fillColor}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
