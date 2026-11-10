"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CampaignsHeader({
  campaignsCount,
  isPro,
  isFreeMerchant,
  flashSalePurchased,
  flashSaleCampaignUsed,
  planName,
  onCreateClick,
  onOpenPurchaseModal,
}) {
  const hasUsedCampaign = flashSaleCampaignUsed || campaignsCount >= 1;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Campaigns</span>
            {isFreeMerchant && (
              <Badge className="bg-rose-50 text-[#F72853] border-rose-200/70 text-[10px] font-semibold uppercase tracking-wider">
                Free Partner Tier
              </Badge>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Bundle multiple offers into a coordinated promotional push with live
            urgency countdowns.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isFreeMerchant && !flashSalePurchased && !hasUsedCampaign && (
            <Button
              onClick={onOpenPurchaseModal}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-semibold h-8.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer border-0 transition-all"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Avail Campaign (₹799)</span>
            </Button>
          )}

          <Button
            onClick={onCreateClick}
            className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xs shadow-[#F72853]/25 cursor-pointer transition-all border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </Button>
        </div>
      </div>

      {/* CATCHY PROMOTIONAL CAMPAIGN BAR FOR FREE MERCHANTS */}
      {isFreeMerchant ? (
        <Card className="border border-rose-200/90 shadow-2xs rounded-2xl bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-3.5 sm:p-4 font-sans relative overflow-hidden">
          {/* STATE 1: NOT YET PURCHASED */}
          {!flashSalePurchased && !hasUsedCampaign && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full">
                      Free Partner Special • 1-Time Flash Sale Pass
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.2 rounded-full">
                      Flat 68% Off
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    ⚡ Supercharge Your Store Visits With A 24–48hr Flash Sale
                    Campaign!
                  </h3>
                  <p className="text-[11px] text-slate-600 font-normal leading-relaxed max-w-2xl">
                    Free merchants can unlock 1 high-impact{" "}
                    <strong>Flash Sale Campaign</strong> for just{" "}
                    <span className="font-bold text-slate-900">₹799</span>{" "}
                    (Original ₹2,499). Includes live urgency countdown timers on
                    customer cards, 5x search spotlight &amp; active shopper
                    alert!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-1 md:pt-0">
                <Button
                  onClick={onOpenPurchaseModal}
                  className="w-full md:w-auto bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold h-8.5 px-4 rounded-xl shadow-xs shadow-rose-500/20 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  <span>Unlock for ₹799</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STATE 2: PURCHASED BUT NOT CREATED YET */}
          {flashSalePurchased && !hasUsedCampaign && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      1-Time Flash Sale Campaign Pass Active
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-semibold">
                      Ready to Launch
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-normal">
                    Your ₹799 promotional pass is active. You can now configure
                    your 24–48hr Flash Sale offer.
                  </p>
                </div>
              </div>

              <Button
                onClick={onCreateClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-4 rounded-xl shadow-xs cursor-pointer shrink-0"
              >
                <span>Configure Flash Sale</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* STATE 3: ALREADY USED 1-TIME CAMPAIGN */}
          {hasUsedCampaign && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      1 of 1 Promotional Flash Sale Campaign Used
                    </span>
                    <Badge className="bg-slate-100 text-slate-600 text-[9px] font-medium border border-slate-200">
                      Quota Finished
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Free merchants are entitled to 1 promotional campaign. To
                    run year-round Festival, Seasonal &amp; Loyalty campaigns,
                    upgrade to Growth Plan.
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold h-8 px-4 rounded-xl shadow-xs cursor-pointer shrink-0"
              >
                <Link
                  href="/merchant/billing"
                  className="flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Upgrade Plan</span>
                </Link>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        /* STANDARD ALLOWANCE CARD FOR PAID TIERS */
        <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-3 space-y-2 font-sans">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span>
              {campaignsCount} of {isPro ? "Unlimited" : "4"} annual campaigns
              used
            </span>
            <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
              {planName ? `${planName.toUpperCase()} Plan` : "GROWTH Plan"}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F72853] h-full rounded-full transition-all duration-500"
              style={{
                width: isPro
                  ? "25%"
                  : `${Math.min(100, (campaignsCount / 4) * 100)}%`,
              }}
            />
          </div>
        </Card>
      )}
    </>
  );
}
