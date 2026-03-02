export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title skeleton */}
      <div className="skeleton h-9 w-40 rounded-lg" />

      {/* Review cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex gap-5">
              {/* Photo skeleton */}
              <div className="skeleton h-24 w-24 shrink-0 rounded-xl" />
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-3">
                <div className="skeleton h-6 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded-lg" />
                <div className="skeleton h-5 w-28 rounded-lg" />
                <div className="flex gap-4">
                  <div className="skeleton h-4 w-16 rounded-lg" />
                  <div className="skeleton h-4 w-16 rounded-lg" />
                  <div className="skeleton h-4 w-16 rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <div className="skeleton h-4 w-24 rounded-lg" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
