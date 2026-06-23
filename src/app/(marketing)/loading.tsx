function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-xl ${className ?? ""}`} />;
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="space-y-8">
        {/* Hero skeleton */}
        <div className="flex flex-col gap-4 py-12">
          <SkeletonBlock className="h-5 w-44 rounded-full" />
          <SkeletonBlock className="h-16 w-3/4 lg:h-20" />
          <SkeletonBlock className="h-5 w-1/2" />
          <div className="flex gap-3 pt-2">
            <SkeletonBlock className="h-10 w-44 rounded-lg" />
            <SkeletonBlock className="h-10 w-36 rounded-lg" />
          </div>
        </div>

        {/* Section title */}
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-72" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <SkeletonBlock className="aspect-square rounded-2xl" />
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
