import { Suspense } from "react";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || params?.search || "";

  if (q) {
    return {
      title: `Search results for "${q}" | Vouchiqo`,
      description: `Browse verified discount coupons, promo codes, brand stores, and special offers matching "${q}" on Vouchiqo.`,
      openGraph: {
        title: `Search results for "${q}" | Vouchiqo`,
        description: `Browse verified discount coupons, promo codes, and special offers matching "${q}" on Vouchiqo.`,
      },
    };
  }

  return {
    title: "Search Coupons, Brands & Deals | Vouchiqo",
    description:
      "Find 100% verified coupon codes, discounts, partner brands, and promo deals across India on Vouchiqo.",
    openGraph: {
      title: "Search Coupons, Brands & Deals | Vouchiqo",
      description:
        "Find 100% verified coupon codes, discounts, partner brands, and promo deals across India on Vouchiqo.",
    },
  };
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchClient />
    </Suspense>
  );
}
