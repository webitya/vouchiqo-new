"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Gift,
  Image as ImageIcon,
  Lock,
  MapPin,
  ShieldCheck,
  Tag,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LivePreviewCard({
  formData = {},
  merchant = {},
  selectedCategoryLabel = "Food & Dining",
}) {
  const offerType = formData.offerType || "code";
  const discountType = formData.discountType || "% Off";
  const val = formData.discountValue;

  // Calculate pricing savings for deal mode
  const origPrice = Number(formData.originalPrice);
  const salePrice = Number(formData.salePrice);
  const hasDealPrices = origPrice > 0 && salePrice > 0 && origPrice > salePrice;
  const dealSavings = hasDealPrices ? origPrice - salePrice : 0;
  const dealSavingsPct = hasDealPrices
    ? Math.round((dealSavings / origPrice) * 100)
    : 0;

  // Format main discount display text
  let discountDisplay = "Special Offer";
  if (offerType === "deal") {
    if (salePrice > 0) discountDisplay = `₹${salePrice} Deal`;
    else discountDisplay = "Special Deal";
  } else if (discountType === "% Off" && val) {
    discountDisplay = `${val}% Off`;
  } else if (discountType === "Flat ₹ Off" && val) {
    discountDisplay = `Flat ₹${val} Off`;
  } else if (discountType === "BOGO") {
    discountDisplay = "Buy 1 Get 1";
  } else if (discountType === "Free Gift") {
    discountDisplay = "Free Gift In-Store";
  } else if (val) {
    discountDisplay = `${val}`;
  }

  const validDaysList =
    Array.isArray(formData.validDays) && formData.validDays.length > 0
      ? formData.validDays.map((d) => d.slice(0, 3)).join(", ")
      : null;

  return (
    <Card className="border-slate-200/90 shadow-2xs rounded-xl bg-white p-3 space-y-2.5 text-left font-sans relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
          <Eye className="w-4 h-4 text-[#F72853]" /> Live Offer Preview
        </span>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="bg-rose-50 text-[#F72853] border-rose-200 text-[10px] font-medium px-2 py-0.5"
          >
            2:1 Ratio
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium px-2 py-0.5"
          >
            Live Preview
          </Badge>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
        {/* Banner Image Container with exact 2:1 Aspect Ratio (800x400px) */}
        <div className="w-full aspect-[2/1] bg-slate-900 relative flex items-end p-3 overflow-hidden">
          {formData.image ? (
            <img
              src={formData.image}
              alt="Offer Banner Preview"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 flex items-center justify-center">
              <div className="text-center p-3">
                <ImageIcon className="w-7 h-7 text-rose-300/40 mx-auto mb-1" />
                <span className="text-[10px] font-medium text-slate-400 block">
                  800×400 Banner Image Preview
                </span>
                <span className="text-[9px] text-slate-500 font-normal">
                  (Upload 2:1 horizontal image in Section 2)
                </span>
              </div>
            </div>
          )}

          {/* Gradient Overlay for Readable Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <Badge className="bg-[#F72853] text-white font-medium text-[10px] px-2 py-0.5 border-0 shadow-sm">
              {offerType === "code"
                ? "Smart Code"
                : offerType === "deal"
                  ? "Direct Deal"
                  : "Special Gift"}
            </Badge>
            <span className="text-white text-[10px] font-medium bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
              {merchant?.businessName || "Store Name"}
            </span>
          </div>

          {/* Bottom Floating Ratio Indicator */}
          <div className="relative z-10 flex items-center justify-between w-full text-white text-[9px] font-normal">
            <span className="bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] text-slate-300">
              2:1 Ratio
            </span>
            <span className="text-emerald-400 font-medium">
              Verified Merchant
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 space-y-2.5">
          {/* Headline & Description */}
          <div>
            <h4 className="text-xs font-medium text-slate-900 leading-snug line-clamp-2">
              {formData.headline || "Flat 20% off on all Italian Marble Tiles"}
            </h4>
            <p className="text-[11px] text-slate-600 font-normal mt-1 line-clamp-2 leading-relaxed">
              {formData.shortDescription ||
                "Get 20% discount on total invoice amount for all premium tiles."}
            </p>
          </div>

          {/* Offer Mechanics / Pricing Card */}
          {offerType === "code" && (
            <div className="flex items-center justify-between p-2 bg-rose-50/40 rounded-xl border border-rose-100 text-xs">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#F72853] shrink-0" />
                <span className="text-slate-600 font-normal text-[11px]">
                  Code:{" "}
                  <span className="font-mono text-slate-900 font-medium uppercase text-xs bg-white px-1.5 py-0.5 rounded border border-rose-200">
                    {formData.code || "SAVE20"}
                  </span>
                </span>
              </div>
              <span className="text-[#F72853] font-medium text-xs bg-white px-2 py-0.5 rounded-lg border border-rose-200/80 shadow-2xs">
                {discountDisplay}
              </span>
            </div>
          )}

          {offerType === "deal" && (
            <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-normal text-[11px] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> In-Store
                  Offer Price:
                </span>
                <span className="text-emerald-700 font-medium text-sm">
                  ₹{salePrice || 1499}
                </span>
              </div>
              {origPrice > 0 && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-normal">
                  <span>
                    Regular MRP:{" "}
                    <span className="line-through text-slate-400">
                      ₹{origPrice}
                    </span>
                  </span>
                  {hasDealPrices && (
                    <span className="text-emerald-700 font-medium bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                      Save ₹{dealSavings} ({dealSavingsPct}% Off)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {offerType === "special" && (
            <div className="p-2 bg-purple-50/80 rounded-xl border border-purple-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between font-medium text-purple-900 text-[11px]">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-purple-600" />{" "}
                  {formData.specialOfferType || "Special Offer / Gift"}
                </span>
                <span className="text-purple-700 font-medium text-[10px] bg-white px-1.5 py-0.5 rounded border border-purple-200">
                  {formData.redemptionMethod?.slice(0, 18) || "In-Store Offer"}
                </span>
              </div>
              {formData.offerDetails && (
                <p className="text-[10px] text-purple-950 font-normal line-clamp-2">
                  {formData.offerDetails}
                </p>
              )}
            </div>
          )}

          {/* Min Order Value & Max Cap Restrictions */}
          {(formData.minOrderValue || formData.maxCap) && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[10px] font-normal text-slate-700">
              {formData.minOrderValue ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#F72853]" />
                  Min Purchase:{" "}
                  <span className="text-slate-900 font-medium">
                    ₹{formData.minOrderValue}
                  </span>
                </span>
              ) : (
                <span />
              )}
              {formData.maxCap ? (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Max Cap:{" "}
                  <span className="text-slate-900 font-medium">
                    ₹{formData.maxCap}
                  </span>
                </span>
              ) : null}
            </div>
          )}

          {/* Validity Period & Timing Details */}
          {(formData.startDate ||
            formData.endDate ||
            formData.validHours ||
            validDaysList) && (
            <div className="p-2 rounded-xl bg-rose-50/30 border border-rose-100/80 text-[10px] space-y-1">
              {(formData.startDate || formData.endDate) && (
                <div className="flex items-center justify-between text-slate-700 font-normal">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-[#F72853]" /> Validity:
                  </span>
                  <span className="font-medium text-slate-800">
                    {formData.startDate
                      ? new Date(formData.startDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        )
                      : "Today"}
                    {" – "}
                    {formData.endDate
                      ? new Date(formData.endDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "31 Aug 2026"}
                  </span>
                </div>
              )}
              {validDaysList && (
                <div className="flex items-center justify-between text-slate-700 font-normal">
                  <span className="text-slate-400">Valid Days:</span>
                  <span className="font-medium text-[#F72853] bg-white px-1.5 py-0.2 rounded border border-rose-200">
                    {validDaysList}
                  </span>
                </div>
              )}
              {formData.validHours && (
                <div className="flex items-center justify-between text-slate-700 font-normal">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-[#F72853]" /> Store Hours:
                  </span>
                  <span className="font-medium text-slate-800">
                    {formData.validHours}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Demographic & Category Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-normal border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3 text-[#F72853]" />
              {merchant?.address?.city || "Ranchi"} (In-Store)
            </span>
            <span className="text-slate-800 font-medium flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
              <Tag className="w-3 h-3 text-[#F72853]" />
              {selectedCategoryLabel}
            </span>
          </div>

          <Button className="w-full bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-medium h-8.5 rounded-xl shadow-xs cursor-default flex items-center justify-center gap-1.5 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Get Claim Code</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
