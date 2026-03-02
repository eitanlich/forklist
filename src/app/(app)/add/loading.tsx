export default function AddLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-4 w-56 rounded-lg" />
      </div>

      {/* Search input skeleton */}
      <div className="skeleton h-14 w-full rounded-2xl" />

      {/* Hint skeleton */}
      <div className="skeleton mx-auto h-4 w-48 rounded-lg" />
    </div>
  );
}
