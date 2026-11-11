"use client";

import { ArrowRight, CheckCircle2, Clock, Lock, Plus } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <span>My Campaigns</span>
            {isFreeMerchant && (
              <Badge
                variant="outline"
                className="bg-slate-50 text-[#007F79] border-slate-200 text-[10px] font-medium uppercase tracking-wider"
              >
                Starter Plan
              </Badge>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Bundle multiple offers into a coordinated promotional push with live
            countdown timers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={onCreateClick}
            className="bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-3.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </Button>
        </div>
      </div>

      {/* INFORMATIONAL PROMOTION CARD FOR STARTER MERCHANTS */}
      {isFreeMerchant ? (
        <Card className="border border-slate-200 shadow-xs rounded-xl bg-white p-3.5 font-sans text-left">
          {/* STATE 1: NOT YET PURCHASED */}
          {!flashSalePurchased && !hasUsedCampaign && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 font-heading">
                  Promotional Flash Sale Pass
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-2xl">
                  Run a 24–48 hour promotional push for your store with live
                  countdown timers and category spotlight for ₹799. Upgrading to
                  Growth or Pro unlocks year-round festival campaigns.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-1 md:pt-0">
                <Button
                  type="button"
                  onClick={onOpenPurchaseModal}
                  className="w-full md:w-auto bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-3.5 rounded-lg shadow-xs cursor-pointer transition-colors border-0 flex items-center justify-center gap-1.5"
                >
                  <span>Unlock Pass (₹799)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STATE 2: PURCHASED BUT NOT CREATED YET */}
          {flashSalePurchased && !hasUsedCampaign && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-[#007F79] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 font-heading">
                      Flash Sale Campaign Pass Active
                    </span>
                    <Badge className="bg-teal-50 text-[#007F79] border border-teal-200 text-[9px] font-medium">
                      Ready to Launch
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Your promotional pass is active. You can now configure your
                    24–48hr Flash Sale offer.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={onCreateClick}
                className="bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-3.5 rounded-lg shadow-xs cursor-pointer shrink-0 border-0 flex items-center gap-1.5"
              >
                <span>Configure Flash Sale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* STATE 3: ALREADY USED 1-TIME CAMPAIGN */}
          {hasUsedCampaign && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 font-heading">
                      1 of 1 Promotional Flash Sale Campaign Used
                    </span>
                    <Badge className="bg-slate-100 text-slate-600 text-[9px] font-medium border border-slate-200">
                      Starter Limit
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Starter merchants receive 1 promotional campaign. To run
                    year-round Festival, Seasonal &amp; Loyalty campaigns,
                    upgrade to Growth Plan.
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="bg-[#007F79] hover:bg-[#00635E] text-white text-xs font-medium h-8 px-3.5 rounded-lg shadow-xs cursor-pointer shrink-0 border-0"
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
        <Card className="border border-slate-200 shadow-xs rounded-xl bg-white p-3 space-y-2 font-sans">
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
              className="bg-[#007F79] h-full rounded-full transition-all duration-500"
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
