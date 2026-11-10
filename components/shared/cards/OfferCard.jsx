"use client";

import { Calendar, Clock, Copy, MoreVertical, Tag } from "lucide-react";
import { useState } from "react";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * OfferCard — display card for a coupon / offer listing.
 *
 * @param {object} offer - offer data object
 * @param {string} [offer._id]
 * @param {string} [offer.title]
 * @param {string} [offer.description]
 * @param {string} [offer.code] - coupon code
 * @param {string} [offer.discountType] - "percentage" | "flat" | "free_shipping"
 * @param {number} [offer.discountValue]
 * @param {string} [offer.status] - "active" | "expired" | "draft" | "pending"
 * @param {string|Date} [offer.expiresAt]
 * @param {number} [offer.usageCount]
 * @param {number} [offer.usageLimit]
 * @param {string} [offer.category]
 * @param {Array<{label: string, icon?: React.ComponentType, onClick: function, destructive?: boolean}>} [actions]
 * @param {string} [className]
 */
export default function OfferCard({ offer = {}, actions = [], className }) {
  const {
    title = "Untitled Offer",
    description,
    code,
    discountType = "percentage",
    discountValue,
    status = "active",
    expiresAt,
    usageCount,
    usageLimit,
    category,
  } = offer;

  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      showSuccess(`Code "${code}" copied!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const discountLabel =
    discountType === "percentage"
      ? `${discountValue ?? 0}% OFF`
      : discountType === "flat"
        ? `₹${discountValue ?? 0} OFF`
        : "FREE SHIPPING";

  const expiry = expiresAt ? new Date(expiresAt) : null;
  const isExpired = expiry && expiry < new Date();
  const daysLeft =
    expiry && !isExpired
      ? Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

  const usagePct =
    usageLimit && usageCount !== undefined
      ? Math.min(100, Math.round((usageCount / usageLimit) * 100))
      : null;

  return (
    <div
      className={cn(
        "bg-brand-bg border border-brand-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group",
        className,
      )}
    >
      {/* Discount badge header strip */}
      <div className="bg-brand-navy px-4 py-3 flex items-center justify-between">
        <span className="text-white text-sm font-extrabold tracking-wide">
          {discountLabel}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Title + category */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-sm font-bold text-brand-text line-clamp-1">
              {title}
            </h3>
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-brand-subtext hover:text-brand-text shrink-0 shadow-none cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-brand-bg border-brand-border text-brand-text text-xs"
                >
                  {actions.map((action, i) => {
                    const ActionIcon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={i}
                        onClick={action.onClick}
                        className={cn(
                          "cursor-pointer text-xs gap-2",
                          action.destructive &&
                            "text-brand-error focus:text-brand-error",
                        )}
                      >
                        {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {category && (
            <span className="flex items-center gap-1 text-[10px] text-brand-subtext mt-0.5">
              <Tag className="w-3 h-3" />
              {category}
            </span>
          )}
          {description && (
            <p className="text-xs text-brand-subtext line-clamp-2 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Coupon code copy */}
        {code && (
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center justify-between gap-2 bg-brand-surface border border-dashed border-brand-border rounded-md px-3 py-2 cursor-pointer hover:border-brand-blue/50 transition-colors group/code"
          >
            <span className="font-mono text-xs font-bold text-brand-navy tracking-widest">
              {code}
            </span>
            <Copy
              className={cn(
                "w-3.5 h-3.5 shrink-0 transition-colors",
                copied
                  ? "text-emerald-500"
                  : "text-brand-subtext group-hover/code:text-brand-blue",
              )}
            />
          </button>
        )}

        {/* Expiry + usage */}
        <div className="flex items-center justify-between text-[11px] text-brand-subtext mt-auto">
          {expiry && (
            <span className="flex items-center gap-1">
              {daysLeft !== null ? (
                <>
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span
                    className={
                      daysLeft <= 3 ? "text-amber-600 font-semibold" : ""
                    }
                  >
                    {daysLeft}d left
                  </span>
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 text-brand-error" />
                  <span className="text-brand-error font-medium">Expired</span>
                </>
              )}
            </span>
          )}
          {usagePct !== null && (
            <span className="flex items-center gap-1">
              {usageCount}/{usageLimit} used
            </span>
          )}
        </div>

        {/* Usage progress bar */}
        {usagePct !== null && (
          <div className="h-1 rounded-full bg-brand-border overflow-hidden -mt-1">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePct >= 90
                  ? "bg-brand-error"
                  : usagePct >= 60
                    ? "bg-amber-400"
                    : "bg-emerald-400",
              )}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
