/**
 * Next.js Dynamic Robots.txt Generator (App Router).
 * Outlines indexing permissions and references sitemap index.
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/merchant/",
        "/customer/",
        "/profile/",
        "/api/",
        "/auth/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
