import NearbyOffers from "./nearby-client";

export const metadata = {
  title: "Local Deals & Nearby Offers | Vouchiqo Map",
  description:
    "Discover local discounts, promo codes, and verified store deals near you. Search active offline & retail vouchers using real-time GPS maps on Vouchiqo.",
  openGraph: {
    title: "Local Deals & Nearby Offers | Vouchiqo Map",
    description:
      "Discover local discounts, promo codes, and verified store deals near you. Search active offline & retail vouchers using real-time GPS maps on Vouchiqo.",
    type: "website",
  },
};

export default function Page() {
  return <NearbyOffers />;
}
