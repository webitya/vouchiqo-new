export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full animate-pulse">
      {/* Top Navbar Skeleton */}
      <header className="w-full h-16 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
          <div className="w-24 h-6 rounded-md bg-slate-200" />
        </div>
        <div className="hidden md:block w-96 h-10 rounded-full bg-slate-100" />
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 rounded-full bg-slate-100" />
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Hero Banner Skeleton */}
      <main className="w-full px-1 sm:px-1.5 pt-1.5 pb-1">
        <div
          className="w-full bg-slate-200 rounded-xl sm:rounded-2xl overflow-hidden relative"
          style={{ aspectRatio: "1200 / 430" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
        </div>
      </main>

      {/* Tagline / Subnav Skeleton */}
      <div className="w-full h-10 bg-slate-100/70 border-y border-slate-200/60 my-2" />

      {/* Main Content Area */}
      <div className="w-full px-2.5 sm:px-4 md:px-5 py-4 space-y-8">
        {/* Popular Offers Row Skeleton */}
        <div className="space-y-3">
          <div className="w-48 h-6 rounded-md bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200/80 p-3 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto" />
                <div className="space-y-1.5">
                  <div className="w-3/4 h-3 rounded bg-slate-200 mx-auto" />
                  <div className="w-1/2 h-2.5 rounded bg-slate-100 mx-auto" />
                </div>
                <div className="w-full h-6 rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Popular Stores Row Skeleton */}
        <div className="space-y-3">
          <div className="w-44 h-6 rounded-md bg-slate-200" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 h-64 rounded-2xl bg-white border border-slate-200/80 p-4" />
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200/80 p-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
