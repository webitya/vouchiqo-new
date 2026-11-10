"use client";

import { format } from "date-fns";
import {
  BarChart2,
  Calendar,
  Eye,
  Megaphone,
  MoreVertical,
  MousePointerClick,
  Zap,
} from "lucide-react";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const CAMPAIGN_TYPE_MAP = {
  email: { label: "Email", icon: Megaphone, color: "text-blue-600 bg-blue-50" },
  push: { label: "Push", icon: Zap, color: "text-purple-600 bg-purple-50" },
  sms: { label: "SMS", icon: Megaphone, color: "text-green-600 bg-green-50" },
  social: {
    label: "Social",
    icon: BarChart2,
    color: "text-pink-600 bg-pink-50",
  },
  banner: { label: "Banner", icon: Eye, color: "text-orange-600 bg-orange-50" },
};

/**
 * CampaignCard — display card for a marketing campaign.
 *
 * @param {object} campaign - campaign data
 * @param {string} [campaign._id]
 * @param {string} [campaign.title]
 * @param {string} [campaign.type] - "email"|"push"|"sms"|"social"|"banner"
 * @param {string} [campaign.status]
 * @param {string|Date} [campaign.startDate]
 * @param {string|Date} [campaign.endDate]
 * @param {number} [campaign.reach] - impressions / audience size
 * @param {number} [campaign.clicks]
 * @param {number} [campaign.conversions]
 * @param {string} [campaign.budget]
 * @param {Array<{label:string, icon?:React.ComponentType, onClick:function, destructive?:boolean}>} [actions]
 * @param {string} [className]
 */
export default function CampaignCard({
  campaign = {},
  actions = [],
  className,
}) {
  const {
    title = "Untitled Campaign",
    type = "email",
    status = "draft",
    startDate,
    endDate,
    reach,
    clicks,
    conversions,
    budget,
  } = campaign;

  const typeConfig = CAMPAIGN_TYPE_MAP[type] ?? CAMPAIGN_TYPE_MAP.email;
  const TypeIcon = typeConfig.icon;

  const ctr = reach && clicks ? ((clicks / reach) * 100).toFixed(1) : null;
  const convRate =
    clicks && conversions ? ((conversions / clicks) * 100).toFixed(1) : null;

  const formatDate = (d) => {
    if (!d) return null;
    try {
      return format(new Date(d), "dd MMM yy");
    } catch {
      return String(d);
    }
  };

  return (
    <div
      className={cn(
        "bg-brand-bg border border-brand-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group",
        className,
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className={cn("p-2 rounded-md shrink-0", typeConfig.color)}>
            <TypeIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-bold text-brand-text line-clamp-1">
              {title}
            </h3>
            <span className="text-[10px] text-brand-subtext font-medium capitalize">
              {typeConfig.label} Campaign
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} size="sm" />
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-brand-bg border-brand-border text-brand-text"
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
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Date range */}
        {(startDate || endDate) && (
          <div className="flex items-center gap-1.5 text-[11px] text-brand-subtext">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>
              {formatDate(startDate) ?? "—"}
              {endDate && ` → ${formatDate(endDate)}`}
            </span>
          </div>
        )}

        {/* Budget */}
        {budget && (
          <div className="text-[11px] text-brand-subtext">
            Budget:{" "}
            <span className="font-semibold text-brand-text">{budget}</span>
          </div>
        )}

        {/* Metrics */}
        {reach || clicks || conversions ? (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-border/60">
            {reach !== undefined && (
              <div className="text-center">
                <Eye className="w-3 h-3 text-brand-subtext mx-auto mb-0.5" />
                <p className="text-xs font-bold text-brand-text">
                  {reach >= 1000 ? `${(reach / 1000).toFixed(1)}k` : reach}
                </p>
                <p className="text-[10px] text-brand-subtext">Reach</p>
              </div>
            )}
            {clicks !== undefined && (
              <div className="text-center">
                <MousePointerClick className="w-3 h-3 text-brand-blue mx-auto mb-0.5" />
                <p className="text-xs font-bold text-brand-text">
                  {ctr ? `${ctr}%` : clicks}
                </p>
                <p className="text-[10px] text-brand-subtext">
                  {ctr ? "CTR" : "Clicks"}
                </p>
              </div>
            )}
            {conversions !== undefined && (
              <div className="text-center">
                <BarChart2 className="w-3 h-3 text-emerald-500 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-brand-text">
                  {convRate ? `${convRate}%` : conversions}
                </p>
                <p className="text-[10px] text-brand-subtext">
                  {convRate ? "Conv." : "Converts"}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
