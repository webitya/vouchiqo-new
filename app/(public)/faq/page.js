import FAQPage from "./faq-client";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | Vouchiqo Support",
  description:
    "Find answers to frequently asked questions about Vouchiqo. Learn about coupon verification, expired coupon revival, merchant subscriptions, and billing.",
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Vouchiqo Support",
    description:
      "Find answers to frequently asked questions about Vouchiqo. Learn about coupon verification, expired coupon revival, merchant subscriptions, and billing.",
    type: "website",
  },
};

export default function Page() {
  return <FAQPage />;
}
