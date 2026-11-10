"use client";

import { useMemo } from "react";
import { Check, CheckCircle2, Loader2, Star, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PlanSelector — subscription plan card.
 *
 * @param {object} plan - plan data
 * @param {string} plan.id - unique plan identifier
 * @param {string} plan.name - plan name (e.g. "Growth Partner")
 * @param {string} plan.price - price string (e.g. "₹999/mo")
 * @param {string} [plan.billingNote] - e.g. "Billed annually"
 * @param {Array<string|{text: string, included: boolean}>} [plan.features] - list of feature items
 * @param {string[]} [plan.unavailable] - features NOT included (legacy fallback)
 * @param {string} [plan.badge] - text for the top badge (e.g. "Most Popular")
 * @param {string} [plan.color="brand-navy"] - accent colour class prefix
 * @param {boolean} [isCurrent=false] - is this the user's current plan
 * @param {boolean} [isRecommended=false] - highlight this card
 * @param {function} [onSelect] - (plan) => void
 * @param {boolean} [loading=false] - show spinner on CTA
 * @param {string} [className]
 */
export default function PlanSelector({
  plan = {},
  isCurrent = false,
  isPaymentCompleted = false,
  isRecommended = false,
  onSelect,
  loading = false,
  className,
}) {
  const {
    name = "Plan",
    price = "—",
    billingNote,
    features = [],
    unavailable = [],
    badge,
  } = plan;

  const isStarter =
    plan.id === "starter" ||
    String(name).toLowerCase().includes("starter") ||
    String(name).toLowerCase().includes("free") ||
    price === "₹0" ||
    price === "0";

  const isCompleted = isStarter || isPaymentCompleted;
  const isPendingPayment = isCurrent && !isCompleted;
  const highlight = isRecommended || isCurrent;

  const normalizedFeatures = useMemo(() => {
    const list = [];

    if (Array.isArray(features)) {
      features.forEach((feat) => {
        if (!feat) return;
        if (typeof feat === "object") {
          list.push({
            text: feat.text || feat.name || feat.label || "",
            included: feat.included !== false,
          });
        } else if (typeof feat === "string") {
          const str = feat.trim();
          const isNegative =
            str.startsWith("✗") ||
            str.startsWith("✕") ||
            str.startsWith("❌") ||
            str.startsWith("[x]") ||
            str.startsWith("[X]") ||
            str.startsWith("No ") ||
            str.toLowerCase().includes("(locked)") ||
            str.toLowerCase().includes("(not included)") ||
            str.toLowerCase().includes("(add-on only)");

          const cleanText = str
            .replace(/^([✓✔✗✕❌]|\[[xXvV+]\])\s*/, "")
            .trim();

          list.push({
            text: cleanText,
            included: !isNegative,
          });
        }
      });
    }

    if (Array.isArray(unavailable)) {
      unavailable.forEach((feat) => {
        if (!feat) return;
        const text =
          typeof feat === "object" ? feat.text || "" : String(feat);
        list.push({
          text,
          included: false,
        });
      });
    }

    return list;
  }, [features, unavailable]);

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-xl border-2 p-5 transition-all duration-200 bg-brand-bg",
        isPendingPayment
          ? "border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]"
          : highlight
            ? "border-brand-navy shadow-lg shadow-brand-navy/10 scale-[1.02]"
            : "border-brand-border hover:border-brand-navy/40 hover:shadow-md",
        className,
      )}
    >
      <div>
        {/* Top badge */}
        {(badge || isCurrent) && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <Badge
              className={cn(
                "text-[10px] font-bold px-3.5 py-1 rounded-full border-0 shadow-md ring-2 ring-white flex items-center gap-1 shrink-0",
                isCurrent
                  ? isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-400 text-amber-950 font-black"
                  : "bg-blue-600 text-white",
              )}
            >
              {isCurrent ? (
                isStarter ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    Active Free Plan
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    Active Plan
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 mr-0.5 fill-current" />
                    Payment Pending
                  </>
                )
              ) : (
                <>
                  <Star className="w-3 h-3 mr-0.5 fill-current" />
                  {badge}
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Plan name */}
        <h3 className="font-sans text-base font-semibold text-slate-800 mt-2 mb-1">
          {name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-semibold text-slate-900">{price}</span>
          {billingNote && (
            <p className="text-xs text-slate-500 mt-0.5">{billingNote}</p>
          )}
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {normalizedFeatures.map((feat, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2.5 text-xs leading-snug transition-colors",
                feat.included
                  ? "text-slate-700 font-normal"
                  : "text-slate-400 font-normal",
              )}
            >
              {feat.included ? (
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/90 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span
                className={cn(
                  "flex-1",
                  feat.included
                    ? "text-slate-700 font-normal"
                    : "text-slate-400 font-normal line-through decoration-slate-300",
                )}
              >
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      {(() => {
        const cleanName = name
          ? name
              .toLowerCase()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "Plan";

        return (
          <Button
            type="button"
            disabled={loading || (isCurrent && isStarter)}
            onClick={() => onSelect?.(plan)}
            className={cn(
              "w-full h-10 text-xs sm:text-sm font-sans font-semibold cursor-pointer transition-all mt-auto",
              isCurrent
                ? isStarter
                  ? "bg-slate-800 text-white border-0 shadow-none cursor-default opacity-90"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-bold"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-none font-semibold",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Processing…
              </>
            ) : isCurrent ? (
              isStarter ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Active Starter Plan
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Current Plan (Renew)
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Pay for {cleanName}
                </>
              )
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                {isStarter ? "Select Starter Free" : "Select Plan"}
              </>
            )}
          </Button>
        );
      })()}
    </div>
  );
}
