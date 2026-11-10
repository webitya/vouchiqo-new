"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPageSkeleton({
  cardsCount = 4,
  rowsCount = 7,
  hasTabs = true,
}) {
  return (
    <div className="w-full space-y-3 pb-12 font-sans text-left animate-pulse">
      {/* ── 1. Page Header Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
        <div className="space-y-1.5">
          <Skeleton className="h-5 sm:h-6 w-56 sm:w-64 rounded-lg bg-slate-200" />
          <Skeleton className="h-3 sm:h-3.5 w-72 sm:w-96 rounded bg-slate-100" />
        </div>
        <Skeleton className="h-7.5 w-28 rounded-lg bg-slate-200 shrink-0 self-start sm:self-auto" />
      </div>

      {/* ── 2. KPI Overview Cards Skeleton ── */}
      {cardsCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: cardsCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/80 p-2.5 bg-white shadow-2xs flex items-center justify-between"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-2.5 w-20 rounded bg-slate-200" />
                <Skeleton className="h-5 w-14 rounded-md bg-slate-300" />
              </div>
              <Skeleton className="w-7 h-7 rounded-lg bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* ── 3. Tabs & Search Bar Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {hasTabs && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7.5 w-20 rounded-lg bg-slate-200/80 shrink-0" />
            ))}
          </div>
        )}
        <Skeleton className="h-8 w-full sm:w-64 rounded-lg bg-slate-100 sm:ml-auto" />
      </div>

      {/* ── 4. Data Table Skeleton ── */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        {/* Table Header Bar */}
        <div className="h-9.5 bg-slate-50/90 border-b border-slate-200/80 px-3 flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <Skeleton className="h-3 w-28 rounded bg-slate-200" />
            <Skeleton className="h-3 w-20 rounded bg-slate-200 hidden sm:block" />
            <Skeleton className="h-3 w-24 rounded bg-slate-200 hidden md:block" />
            <Skeleton className="h-3 w-16 rounded bg-slate-200 hidden lg:block" />
          </div>
          <Skeleton className="h-3 w-16 rounded bg-slate-200" />
        </div>

        {/* Skeleton Table Rows */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rowsCount }).map((_, i) => (
            <div
              key={i}
              className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/40 transition-colors"
            >
              {/* Primary Col (Avatar + Business Name + Location) */}
              <div className="flex items-center gap-2.5 min-w-[180px] flex-1 sm:flex-none">
                <Skeleton className="w-7 h-7 rounded-md bg-slate-200 shrink-0" />
                <div className="space-y-1 min-w-0 flex-1">
                  <Skeleton
                    className={`h-3.5 rounded bg-slate-200 ${
                      i % 2 === 0 ? "w-36" : "w-28"
                    }`}
                  />
                  <Skeleton className="h-2.5 w-20 rounded bg-slate-100" />
                </div>
              </div>

              {/* Category Badge */}
              <Skeleton className="h-5 w-20 rounded-md bg-slate-100 hidden sm:block" />

              {/* Plan Badge */}
              <Skeleton className="h-5 w-16 rounded bg-slate-100 hidden md:block" />

              {/* Status Badge */}
              <Skeleton className="h-5 w-20 rounded-full bg-slate-200/80 hidden lg:block" />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Skeleton className="w-7 h-7 rounded-lg bg-slate-100" />
                <Skeleton className="w-7 h-7 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer / Pagination Skeleton */}
        <div className="h-10 bg-slate-50/60 border-t border-slate-200/80 px-3 flex items-center justify-between">
          <Skeleton className="h-3 w-28 rounded bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded bg-slate-200" />
            <Skeleton className="h-6 w-6 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
