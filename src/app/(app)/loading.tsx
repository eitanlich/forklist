export default function HomeLoading() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-5 w-28 rounded-lg" />
        <div className="skeleton h-10 w-40 rounded-lg" />
      </div>

      {/* Search skeleton */}
      <div className="skeleton h-14 w-full rounded-2xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-36 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" />
      </div>
    </div>
  );
}
