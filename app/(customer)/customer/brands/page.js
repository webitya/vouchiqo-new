"use client";

import { Store } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/feedback/EmptyState";
import MerchantCard from "@/components/shared/cards/MerchantCard";

export default function FollowedBrands() {
  const user = { name: "Sarah Jenkins", role: "customer" };

  // Mock followed brands list
  const [brands, _setBrands] = useState([
    {
      _id: "m1",
      name: "Zomato Delivery",
      description:
        "Fast, reliable restaurant food delivery network serving over 100 cities globally.",
      category: "Food Delivery",
      rating: 4.9,
      reviewsCount: 184,
      location: "Global / Multi-City",
      activeDealsCount: 2,
      isVerified: true,
    },
  ]);

  return (
    <DashboardLayout title="Followed Brands" user={user}>
      <h2 className="text-base font-bold text-brand-navy font-heading uppercase tracking-wider border-b border-brand-border pb-3">
        Brands You Follow
      </h2>

      {brands.length > 0
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((merchant) => (
              <MerchantCard key={merchant._id} merchant={merchant} />
            ))}
          </div>
        : <EmptyState
            icon={Store}
            title="No followed brands"
            description="Follow your favorite merchants to stay updated on their newly listed coupon codes."
          />}
    </DashboardLayout>
  );
}
