"use client";

import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LiveCampaignPreview({ campaignData, merchantName }) {
  return (
    <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3">
      <Card className="border-slate-200/80 shadow-xs rounded-xl bg-white p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Eye className="w-3.5 h-3.5 text-[#F72853]" /> Live Deal Card
            Preview
          </span>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-medium"
          >
            Live Preview
          </Badge>
        </div>

        {/* Live Card Container */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
          {/* Banner header image or fallback gradient */}
          <div
            className="h-28 sm:h-32 bg-slate-900 relative flex items-end p-3.5 bg-cover bg-center"
            style={{
              backgroundImage: campaignData.bannerUrl
                ? `url(${campaignData.bannerUrl})`
                : "linear-gradient(to right, #0f172a, #1e293b)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full">
              <Badge className="bg-[#F72853] text-white font-medium text-[9px] uppercase px-2 py-0.5 border-0">
                {campaignData.type?.toUpperCase()}
              </Badge>
              <span className="text-white text-[10px] font-medium bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                {merchantName || "Store Name"}
              </span>
            </div>
          </div>

          <div className="p-3.5 space-y-3">
            {/* Title & Sub-headline */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {campaignData.headline ||
                  campaignData.name ||
                  "🔥 Flat 20% off all orders during Summer Sale"}
              </h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-2">
                {campaignData.subHeadline ||
                  campaignData.description ||
                  "Valid on all in-store billing. Show claim code at counter."}
              </p>
            </div>

            {/* Promo Code & Discount Pill */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <span className="text-slate-500 font-normal">
                Code:{" "}
                <span className="font-mono text-slate-900 font-semibold uppercase">
                  {campaignData.code || "SAVE20"}
                </span>
              </span>
              <span className="text-[#F72853] font-semibold">
                {campaignData.discountValue
                  ? `${campaignData.discountValue}% OFF`
                  : "SPECIAL DEAL"}
              </span>
            </div>

            {/* Live Urgency Countdown Widget */}
            {campaignData.hasCountdownTimer && (
              <div className="p-2 bg-rose-50/70 border border-rose-200/80 rounded-lg flex items-center justify-between text-rose-950 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#F72853]" /> Ends In:
                </span>
                <span className="font-mono text-rose-900 text-[11px] font-semibold">
                  23h : 59m : 45s
                </span>
              </div>
            )}

            {/* Attached Listings Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-normal">
              <span>Attached Offers:</span>
              <span className="text-slate-800 font-semibold">
                {campaignData.couponIds?.length || 0} listings
              </span>
            </div>

            {/* Action button preview */}
            <Button className="w-full bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium py-2 h-9 rounded-xl shadow-xs cursor-default">
              Get Claim Code
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
