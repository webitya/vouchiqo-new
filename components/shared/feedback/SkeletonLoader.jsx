export default function SkeletonLoader({ type = "card", count = 3 }) {
  const items = Array.from({ length: count });

  if (type === "table") {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-brand-surface rounded-lg border border-brand-border"></div>
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 p-3 border-b border-brand-border">
            <div className="h-6 bg-brand-surface rounded-md flex-1"></div>
            <div className="h-6 bg-brand-surface rounded-md w-28"></div>
            <div className="h-6 bg-brand-surface rounded-md w-24"></div>
            <div className="h-6 bg-brand-surface rounded-md w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border rounded-lg"
          >
            <div className="w-10 h-10 bg-brand-surface rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-brand-surface rounded w-1/3"></div>
              <div className="h-3 bg-brand-surface rounded w-1/2"></div>
            </div>
            <div className="w-16 h-8 bg-brand-surface rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default: Card Skeleton
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-brand-bg border border-brand-border rounded-lg h-64 flex flex-col justify-between p-5 overflow-hidden"
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 bg-brand-surface rounded-full w-24"></div>
              <div className="h-6 bg-brand-surface rounded-full w-24"></div>
            </div>
            <div className="h-4 bg-brand-surface rounded w-1/3"></div>
            <div className="h-6 bg-brand-surface rounded w-3/4"></div>
            <div className="h-3 bg-brand-surface rounded w-full"></div>
            <div className="h-3 bg-brand-surface rounded w-5/6"></div>
          </div>
          <div className="pt-4 border-t border-brand-border space-y-2">
            <div className="h-4 bg-brand-surface rounded w-1/4"></div>
            <div className="h-8 bg-brand-surface rounded-lg w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
