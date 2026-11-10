import { Skeleton } from "@/components/ui/skeleton";

export default function BrandLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans select-none">
      {/* ── 0. Top Navbar Skeleton Placeholder ── */}
      <header className="w-full bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-50">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <Skeleton className="h-8 sm:h-9 w-28 sm:w-36 rounded-lg" />
          <Skeleton className="hidden md:block flex-1 max-w-[340px] h-8.5 rounded-lg" />
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <Skeleton className="h-4 w-14 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
            <Skeleton className="h-8 w-20 sm:w-24 rounded-lg" />
          </div>
        </div>
      </header>

      {/* ── 1. Brand Header Skeleton ── */}
      <div className="w-full bg-white border-b border-slate-100">
        {/* Mobile / Small Screens Skeleton (< lg) */}
        <div className="block lg:hidden">
          {/* Breadcrumb Skeleton */}
          <div className="w-full px-3 sm:px-4 pt-2.5 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-10 rounded" />
              <span className="text-slate-300 text-xs">/</span>
              <Skeleton className="h-3 w-12 rounded" />
              <span className="text-slate-300 text-xs">/</span>
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>

          {/* Banner Card Skeleton */}
          <div className="px-3 sm:px-4 pt-1">
            <Skeleton className="w-full aspect-[21/9] sm:aspect-[24/9] max-h-[220px] rounded-2xl shadow-2xs border border-slate-200/70" />
          </div>

          {/* Brand Identity Skeleton */}
          <div className="px-3 sm:px-4 pt-3.5 pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Skeleton className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl shrink-0 border border-slate-200/80" />
                <div className="space-y-1.5 flex-1 pt-0.5 min-w-0">
                  <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 rounded-lg" />
                  <Skeleton className="h-3 w-48 sm:w-64 rounded" />
                  <Skeleton className="h-4.5 w-24 rounded-full" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
              <Skeleton className="h-8.5 w-18 sm:w-22 rounded-xl shrink-0" />
            </div>
          </div>

          {/* Mobile Tabs Capsule Skeleton */}
          <div className="px-2.5 sm:px-4 pt-1.5 pb-2.5">
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>

        {/* Desktop / Large Screens Skeleton (lg: and above) */}
        <div className="hidden lg:block">
          {/* Desktop Breadcrumbs Bar */}
          <div className="w-full bg-white border-b border-slate-200/90 font-sans">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-6 py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-10 rounded" />
                <span className="text-slate-300 text-xs">/</span>
                <Skeleton className="h-3 w-12 rounded" />
                <span className="text-slate-300 text-xs">/</span>
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
          </div>

          {/* Desktop Grand Hero Banner Skeleton */}
          <Skeleton className="w-full h-[220px] md:h-[260px] lg:h-[290px] rounded-none bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950" />

          {/* Desktop Brand Identity & Actions Bar */}
          <section className="w-full bg-white border-b border-slate-200/90 shadow-2xs font-sans">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-6">
              <div className="flex items-end justify-between gap-3 relative pb-2 pt-0">
                <div className="flex items-end gap-4">
                  <Skeleton className="w-[96px] h-[96px] lg:w-[104px] lg:h-[104px] rounded-2xl -mt-[48px] lg:-mt-[52px] border-4 border-white shadow-lg ring-1 ring-slate-200/60 shrink-0" />
                  <div className="pt-1 space-y-1.5 pb-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-44 rounded-lg" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-3.5 w-40 rounded" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <Skeleton className="h-7.5 w-24 rounded-full" />
                  <Skeleton className="h-7.5 w-20 rounded-full" />
                  <Skeleton className="h-7.5 w-18 rounded-full" />
                  <Skeleton className="h-7.5 w-28 rounded-full" />
                </div>
              </div>

              <div className="mt-1.5 pb-2">
                <Skeleton className="h-8 w-80 rounded-lg" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── 2. Main Content Skeleton ── */}
      <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* 4-Col Stats Skeleton: mobile divide bar vs desktop cards */}
            <div className="block lg:hidden w-full bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs">
              <div className="grid grid-cols-4 divide-x divide-slate-100">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-2 space-y-2">
                    <Skeleton className="w-7.5 h-7.5 rounded-lg" />
                    <Skeleton className="w-12 h-2.5 rounded" />
                    <Skeleton className="w-14 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="w-14 h-3 rounded" />
                    <Skeleton className="w-16 h-4.5 rounded" />
                  </div>
                  <Skeleton className="w-8.5 h-8.5 rounded-xl shrink-0" />
                </div>
              ))}
            </div>

            {/* Featured Deals Carousel Skeleton */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-4.5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              <div className="flex items-center gap-3 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-48 sm:w-56 shrink-0 bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs space-y-2.5"
                  >
                    <Skeleton className="w-full h-28 rounded-xl" />
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Deal Cards Skeleton List */}
            <div className="space-y-3 pt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-2xs flex items-center gap-3 sm:gap-4"
                >
                  <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 sm:h-5 w-4/5 rounded-md" />
                    <Skeleton className="h-3 w-3/5 rounded" />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-8 sm:h-9 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column / Sidebar Skeleton (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-2.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
              <Skeleton className="h-3 w-4/6 rounded" />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-2">
              <div className="flex justify-between items-center pb-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
