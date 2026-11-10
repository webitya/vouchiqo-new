import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * AnalyticsCard — Reusable data & chart container card with standardized Y-axis header.
 */
export default function AnalyticsCard({
  title,
  subtitle,
  description,
  children,
  extra,
  className,
  headerClassName,
  contentClassName,
}) {
  const sub = subtitle || description;

  return (
    <Card
      className={cn(
        "bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-full hover:shadow-xs transition-all duration-200 p-0 gap-0 text-left",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "px-4 py-3.5 sm:px-5 sm:py-3.5 border-b border-slate-100 flex flex-row items-center justify-between gap-3 space-y-0 bg-slate-50/50 text-left min-h-[56px]",
          headerClassName,
        )}
      >
        <div className="flex flex-col text-left justify-center min-w-0 flex-1">
          <CardTitle className="font-heading text-xs sm:text-[13px] font-bold text-[#08214d] tracking-wider uppercase flex items-center gap-2 m-0 p-0 leading-none truncate">
            {title}
          </CardTitle>
          {sub && (
            <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-none font-sans normal-case tracking-normal truncate">
              {sub}
            </p>
          )}
        </div>
        {extra && (
          <div className="flex items-center text-xs font-semibold text-slate-500 m-0 p-0 shrink-0">
            {extra}
          </div>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          "p-4 sm:p-5 pt-4 flex-1 flex flex-col justify-between",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
