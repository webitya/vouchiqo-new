import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * KPICard — Modern, soft-colored, compact KPI analytics card.
 */
export default function KPICard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconClassName,
  subtitle,
  timeFrame = "vs last month",
  loading = false,
  href,
  className,
  variant = "default",
}) {
  const variantStyles = {
    rose: "bg-gradient-to-br from-[#FF2E63]/5 via-[#FFFDF9] to-[#FF2E63]/10 border-[#EADBCE] hover:border-[#FF2E63] hover:shadow-[0_8px_20px_rgba(255,46,99,0.12)]",
    emerald: "bg-gradient-to-br from-[#007F79]/5 via-[#FFFDF9] to-[#007F79]/10 border-[#EADBCE] hover:border-[#007F79] hover:shadow-[0_8px_20px_rgba(0,127,121,0.12)]",
    blue: "bg-gradient-to-br from-[#007F79]/5 via-[#FFFDF9] to-[#FFD166]/10 border-[#EADBCE] hover:border-[#007F79] hover:shadow-[0_8px_20px_rgba(0,127,121,0.12)]",
    amber: "bg-gradient-to-br from-[#FFD166]/10 via-[#FFFDF9] to-[#FF8C05]/10 border-[#EADBCE] hover:border-[#FF8C05] hover:shadow-[0_8px_20px_rgba(255,140,5,0.12)]",
    purple: "bg-gradient-to-br from-[#35104A]/5 via-[#FFFDF9] to-[#35104A]/10 border-[#EADBCE] hover:border-[#35104A] hover:shadow-[0_8px_20px_rgba(53,16,74,0.12)]",
    default: "bg-[#FFFDF9] border-[#EADBCE] hover:border-[#007F79] hover:shadow-[0_8px_20px_rgba(53,16,74,0.08)]",
  };

  const iconVariantStyles = {
    rose: "bg-[#FF2E63]/10 text-[#FF2E63] border-[#FF2E63]/20",
    emerald: "bg-[#007F79]/10 text-[#007F79] border-[#007F79]/20",
    blue: "bg-[#007F79]/10 text-[#007F79] border-[#007F79]/20",
    amber: "bg-[#FF8C05]/10 text-[#FF8C05] border-[#FF8C05]/20",
    purple: "bg-[#35104A]/10 text-[#35104A] border-[#35104A]/20",
    default: "bg-[#35104A]/10 text-[#35104A] border-[#35104A]/20",
  };

  const trendVariantStyles = {
    rose: "text-[#FF2E63] bg-[#FF2E63]/10 border-[#FF2E63]/20",
    emerald: "text-[#007F79] bg-[#007F79]/10 border-[#007F79]/20",
    blue: "text-[#007F79] bg-[#007F79]/10 border-[#007F79]/20",
    amber: "text-[#FF8C05] bg-[#FF8C05]/10 border-[#FF8C05]/20",
    purple: "text-[#35104A] bg-[#35104A]/10 border-[#35104A]/20",
    default: isPositive
      ? "text-[#007F79] bg-[#007F79]/10 border-[#007F79]/20"
      : "text-[#FF2E63] bg-[#FF2E63]/10 border-[#FF2E63]/20",
  };

  const cardContent = (
    <Card
      className={cn(
        "rounded-xl sm:rounded-2xl p-0 transition-all duration-300 overflow-hidden relative flex flex-col justify-between h-full group hover:-translate-y-0.5 font-sans border shadow-2xs",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
        {loading ? (
          <div className="space-y-2 py-0.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <Skeleton className="h-5.5 w-18 rounded-md my-1" />
            <Skeleton className="h-2.5 w-24 rounded-md" />
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-1.5 sm:space-y-2">
            {/* Header: Title & Icon Badge */}
            <div className="flex items-center justify-between gap-1.5">
              <span
                className="text-[10px] sm:text-[11px] font-heading font-semibold text-[#6B4C82] uppercase tracking-wider block truncate max-w-[calc(100%-1.75rem)]"
                title={title}
              >
                {title}
              </span>
              {Icon && (
                <div
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all duration-200",
                    iconVariantStyles[variant] || iconVariantStyles.default,
                    iconClassName,
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Metric Value */}
            <div>
              <span className="text-lg sm:text-2xl font-heading font-semibold text-[#35104A] tracking-tight leading-none block">
                {value}
              </span>
            </div>

            {/* Subtitle / Helper Label */}
            {subtitle && (
              <p className="text-[10.5px] font-sans text-[#6B4C82] capitalize leading-tight">
                {subtitle}
              </p>
            )}

            {/* Trend Indicator & Timeframe */}
            <div className="flex items-center flex-wrap gap-1 text-[9.5px] sm:text-[10.5px] font-normal pt-0.5">
              {change !== undefined && change !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded-md border",
                    trendVariantStyles[variant] || trendVariantStyles.default,
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {change}%
                  </span>
                </span>
              )}

              {timeFrame && (
                <span className="text-[#6B4C82] font-sans text-[9px] sm:text-[10px] truncate">
                  {timeFrame}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline h-full cursor-pointer touch-manipulation active:scale-[0.99]">
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}
