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
    rose: "bg-gradient-to-br from-rose-50/70 via-white to-pink-50/20 border-rose-200/70 hover:border-[#F72853] hover:shadow-[0_8px_20px_rgba(247,40,83,0.12)]",
    emerald: "bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/20 border-emerald-200/70 hover:border-emerald-400 hover:shadow-[0_8px_20px_rgba(16,185,129,0.12)]",
    blue: "bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/20 border-blue-200/70 hover:border-blue-400 hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]",
    amber: "bg-gradient-to-br from-amber-50/70 via-white to-orange-50/20 border-amber-200/70 hover:border-amber-400 hover:shadow-[0_8px_20px_rgba(245,158,11,0.12)]",
    purple: "bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/20 border-purple-200/70 hover:border-purple-400 hover:shadow-[0_8px_20px_rgba(168,85,247,0.12)]",
    default: "bg-white border-slate-200/90 hover:border-[#F72853]/60 hover:shadow-[0_8px_20px_rgba(247,40,83,0.08)]",
  };

  const iconVariantStyles = {
    rose: "bg-rose-50 text-[#F72853] border-rose-200/60",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    blue: "bg-blue-50 text-blue-600 border-blue-200/60",
    amber: "bg-amber-50 text-amber-600 border-amber-200/60",
    purple: "bg-purple-50 text-purple-600 border-purple-200/60",
    default: "bg-slate-50 text-slate-600 border-slate-200/60",
  };

  const trendVariantStyles = {
    rose: "text-[#F72853] bg-rose-50/90 border-rose-100",
    emerald: "text-emerald-700 bg-emerald-50/90 border-emerald-100",
    blue: "text-blue-700 bg-blue-50/90 border-blue-100",
    amber: "text-amber-700 bg-amber-50/90 border-amber-100",
    purple: "text-purple-700 bg-purple-50/90 border-purple-100",
    default: isPositive
      ? "text-emerald-700 bg-emerald-50/90 border-emerald-100"
      : "text-rose-700 bg-rose-50/90 border-rose-100",
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
                className="text-[9.5px] sm:text-[10.5px] font-medium text-slate-500 uppercase tracking-wider block truncate max-w-[calc(100%-1.75rem)]"
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
              <span className="text-base sm:text-xl font-medium text-slate-900 tracking-tight leading-none block">
                {value}
              </span>
            </div>

            {/* Subtitle / Helper Label */}
            {subtitle && (
              <p className="text-[10.5px] font-normal text-slate-500 capitalize leading-tight">
                {subtitle}
              </p>
            )}

            {/* Trend Indicator & Timeframe */}
            <div className="flex items-center flex-wrap gap-1 text-[9.5px] sm:text-[10.5px] font-normal pt-0.5">
              {change !== undefined && change !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
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
                <span className="text-slate-400 text-[9px] sm:text-[10px] truncate">
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
      <Link href={href} className="block no-underline h-full select-none cursor-pointer">
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full select-none">{cardContent}</div>;
}
