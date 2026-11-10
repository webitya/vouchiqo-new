export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "Vouchiqo - Verified Deals & Coupons",
    short_name: "Vouchiqo",
    description:
      "Vouchiqo is India's trusted deal marketplace for 100% verified merchant coupons, dining vouchers, and affiliate savings.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#F72853",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/navbarlogovouchiqo.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/navbarlogovouchiqo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
