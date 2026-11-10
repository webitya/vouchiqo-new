import { Suspense } from "react";
import DealsClient from "./deals-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verified Deals, Promo Offers & Discount Links | Vouchiqo",
  description:
    "Discover 100% verified promo offers, discount deals, and seasonal savings from top merchants on the Vouchiqo platform.",
  openGraph: {
    title: "Verified Deals, Promo Offers & Discount Links | Vouchiqo",
    description:
      "Discover 100% verified promo offers, discount deals, and seasonal savings from top merchants on the Vouchiqo platform.",
    type: "website",
  },
};

function DealsFallback() {
  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsFallback />}>
      <DealsClient />
    </Suspense>
  );
}
