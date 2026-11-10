"use client";

import { CheckCircle2, Heart, MapPin, Star, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MerchantCard({ merchant }) {
  const {
    _id,
    name,
    description,
    category = "E-Commerce",
    rating = 4.8,
    reviewsCount = 24,
    location = "All Locations",
    activeDealsCount = 12,
    isVerified = true,
  } = merchant;

  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="bg-brand-bg border border-brand-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between h-full group">
      {/* Banner Mock Background */}
      <div className="h-24 bg-brand-navy/10 relative flex items-end px-4">
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            onClick={() => setIsFollowing(!isFollowing)}
            className={`p-1.5 h-8 w-8 rounded-full border transition-all cursor-pointer shadow-none ${
              isFollowing
                ? "bg-brand-error/10 border-brand-error/20 text-brand-error hover:bg-brand-error/20"
                : "bg-brand-bg border-brand-border text-brand-subtext hover:text-brand-error hover:bg-brand-surface"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFollowing ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Merchant Logo */}
        <div className="w-16 h-16 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center font-bold text-lg text-brand-navy shadow-sm transform translate-y-4">
          {name ? name[0] : "B"}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Verification */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h3 className="font-heading text-base font-bold text-brand-text group-hover:text-brand-blue transition-colors">
              {name || "Premium Partner"}
            </h3>
            {isVerified && (
              <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15 border-0 shadow-none px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-brand-text">
            <Star className="w-3.5 h-3.5 text-brand-warning fill-brand-warning" />
            <span>{rating}</span>
            <span className="text-brand-subtext">({reviewsCount} reviews)</span>
          </div>

          <p className="text-xs text-brand-subtext line-clamp-2 leading-relaxed mb-4">
            {description ||
              "Discover verified deals and offers from this trusted business."}
          </p>
        </div>

        {/* Footer Details */}
        <div className="space-y-3 pt-3 border-t border-brand-border/60">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-subtext">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" />
              <span>{location}</span>
            </span>
            <span className="flex items-center gap-1 text-brand-navy">
              <Tag className="w-3.5 h-3.5 text-brand-gradient" />
              <span>{activeDealsCount} Active Deals</span>
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            className="btn-tertiary w-full text-xs py-2 justify-center text-center font-bold cursor-pointer border-brand-navy text-brand-navy hover:bg-brand-navy/5 shadow-none h-auto"
          >
            <Link href={`/merchants/${_id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
