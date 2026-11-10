"use client";

export default function DashboardSkeleton({ mode = "dashboard" }) {
  if (mode === "profile" || mode === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse select-none">
        {/* KPI Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 space-y-3.5 shadow-sm"
            >
              <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded-sm w-2/3"></div>
              <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-sm w-1/2"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-zinc-900 rounded-sm w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Content Spline Graph + Widget Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm space-y-4 min-h-[280px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-850">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-sm w-1/3"></div>
              <div className="h-5 bg-slate-100 dark:bg-zinc-900 rounded-sm w-20"></div>
            </div>
            <div className="flex-1 flex items-end justify-between h-[180px] pt-4 px-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const heights = [
                  45, 60, 35, 75, 50, 65, 40, 80, 55, 70, 45, 60,
                ];
                return (
                  <div
                    key={i}
                    className="bg-slate-100 dark:bg-zinc-900 rounded-sm w-5"
                    style={{ height: `${heights[i % heights.length]}%` }}
                  ></div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm space-y-4 flex flex-col justify-between min-h-[280px]">
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded-sm w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-sm w-3/4"></div>
              <div className="h-8 bg-slate-100 dark:bg-zinc-900 rounded-sm w-full"></div>
            </div>
            <div className="h-16 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900 rounded-md w-full"></div>
            <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-sm w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "table") {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md shadow-sm overflow-hidden animate-pulse select-none">
        <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-4 grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-sm w-2/3"
            ></div>
          ))}
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 py-2 border-b border-slate-100 dark:border-zinc-900/40 last:border-0"
            >
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-sm w-3/4"></div>
              <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded-sm w-1/2"></div>
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-sm w-2/3"></div>
              <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded-sm w-1/2"></div>
              <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded-sm w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "form" || mode === "settings") {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm space-y-6 animate-pulse select-none">
        <div className="border-b border-slate-100 dark:border-zinc-850 pb-4">
          <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded-sm w-1/4 mb-1"></div>
          <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded-sm w-1/2"></div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-sm w-24"></div>
              <div className="h-9 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900 rounded-md w-full"></div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-850 pt-4">
          <div className="h-8 bg-slate-100 dark:bg-zinc-900 rounded-sm w-20"></div>
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-sm w-24"></div>
        </div>
      </div>
    );
  }

  if (mode === "billing") {
    return (
      <div className="space-y-6 animate-pulse select-none font-sans text-left w-full pb-8">
        {/* Top Banner Skeleton */}
        <div className="h-12 bg-slate-100 rounded-2xl w-full border border-slate-200/80"></div>

        {/* Current Plan Card Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded-lg w-64"></div>
              <div className="h-3.5 bg-slate-100 rounded-md w-44"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
              <div className="h-10 bg-slate-100 rounded-xl w-28"></div>
            </div>
          </div>

          {/* 3 Metric Box Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 bg-slate-200 rounded w-28"></div>
                  <div className="h-4 bg-slate-300 rounded w-10"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-36"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Comparison Grid Skeletons */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded-md w-60"></div>
            <div className="h-8 bg-slate-100 rounded-full w-40"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-8 bg-slate-300 rounded-md w-1/2"></div>

                  <div className="space-y-2.5 pt-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
